"""Daily forecast snapshots and scoring (how well the scenario model matched what actually happened).

    forecast  evaluate the house view (dashboard/data/house_view.json) through the scenario shock model
              -> dashboard/data/forecasts/<date>.json  (expected move, P5/P25/P50/P75/P95, P(up) per asset at a 20-trading-day horizon,
                 plus analog and no-change baselines)
    score     compare every snapshot with realised moves from dashboard/data/series.json
              -> dashboard/data/scorecard.json  (direction hit rate, 90%/50% interval coverage, PIT histogram, MAE vs baselines,
                 per asset, per forecast date, pending forecasts with progress, judgment-ledger Brier over time)

The Monte Carlo mirrors analyst.js (scRun): scenarios of the same theater are mutually exclusive, theaters independent,
baseline noise = annual vol * sqrt(H/252). Seeded, so a day's snapshot is reproducible.
"""

from __future__ import annotations

import bisect
import json
import math
import random
import subprocess
from datetime import UTC, datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
H_DAYS = 20          # scoring horizon in trading days (about one calendar month)
N_SIMS = 20000
ANALOG_KEY = {"brent": "brent", "wti": "wti", "ttf": "ttf", "gold": "gold", "wheat": "wheat", "corn": "corn", "usd": "dxy", "vix": "vix", "bdi": "bdi", "kospi": "kospi", "rates": "us10y"}


def load_js(src_dir: Path, name: str, var: str) -> dict:
    """Load a `const X = {...}` data file through node (the files are JS, not JSON)."""
    js = f"globalThis.window={{}};(0,eval)(require('fs').readFileSync({json.dumps(str(src_dir / name))},'utf8').replace(/^const /m,'var '));console.log(JSON.stringify({var}))"
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def _q(sorted_vals: list[float], f: float) -> float:
    return sorted_vals[min(len(sorted_vals) - 1, int(f * len(sorted_vals)))]


def simulate(scen: dict, view: list[dict], h: int = H_DAYS, n: int = N_SIMS, seed: int = 7) -> list[dict]:
    """Probability-weighted shock distribution per asset. view = [{id, p (%), k}]."""
    T = {t["id"]: t for t in scen["templates"]}
    sel = [{"t": T[v["id"]], "p": (v.get("p") if v.get("p") is not None else T[v["id"]]["p"]) / 100, "k": v.get("k", 1)} for v in view if v["id"] in T]
    groups: dict[str, list[dict]] = {}
    for s in sel:
        groups.setdefault(s["t"]["th"], []).append(s)
    gl = []
    for g in groups.values():
        tot = sum(s["p"] for s in g)
        norm = 1 / tot if tot > 1 else 1
        gl.append([{**s, "p": s["p"] * norm} for s in g])
    assets = [a for a in scen["assets"] if any(a in s["t"]["shocks"] for s in sel)]
    rng = random.Random(seed)
    sims = {a: [] for a in assets}
    expected = {a: 0.0 for a in assets}
    for g in gl:
        for s in g:
            for a, sh in s["t"]["shocks"].items():
                expected[a] += s["p"] * s["k"] * sh["m"]
    for _ in range(n):
        shock: dict[str, float] = {}
        for g in gl:
            u = rng.random(); cum = 0.0
            for s in g:
                cum += s["p"]
                if u < cum:
                    for a, sh in s["t"]["shocks"].items():
                        shock[a] = shock.get(a, 0.0) + s["k"] * (sh["m"] + sh["s"] * rng.gauss(0, 1))
                    break
        for a in assets:
            A = scen["assets"][a]
            noise = 12 * math.sqrt(h / 20) * rng.gauss(0, 1) if A.get("bp") else A["vol"] * math.sqrt(h / 252) * rng.gauss(0, 1)
            v = shock.get(a, 0.0) + noise
            sims[a].append(v if A.get("bp") else max(-95.0, v))
    rows = []
    for a in assets:
        s = sorted(sims[a])
        rows.append({"a": a, "bp": bool(scen["assets"][a].get("bp")), "sym": scen["assets"][a].get("sym"), "e": round(expected[a], 2),
                     "p5": round(_q(s, .05), 2), "p25": round(_q(s, .25), 2), "p50": round(_q(s, .5), 2), "p75": round(_q(s, .75), 2), "p95": round(_q(s, .95), 2),
                     "up": round(sum(1 for x in s if x > 0) / n, 3)})
    rows.sort(key=lambda r: -abs(r["e"]))
    return rows


def analog_baseline(scen: dict, analogs: dict, view: list[dict]) -> dict[str, float]:
    """Probability-weighted median +20d move of the analogs attached to each selected scenario."""
    T = {t["id"]: t for t in scen["templates"]}
    A = {a["id"]: a for a in analogs.get("analogs", [])}
    out: dict[str, list[tuple[float, float]]] = {}
    for v in view:
        t = T.get(v["id"])
        if not t:
            continue
        p = (v.get("p") if v.get("p") is not None else t["p"]) / 100
        for aid in t.get("analogs", []):
            an = A.get(aid)
            if not an:
                continue
            for asset, key in ANALOG_KEY.items():
                mv = (an.get("moves") or {}).get(key) or {}
                if mv.get("d20") is not None:
                    out.setdefault(asset, []).append((p, mv["d20"]))
    res = {}
    for asset, pairs in out.items():
        w = sum(p for p, _ in pairs)
        res[asset] = round(sum(p * m for p, m in pairs) / w, 2) if w else None
    return res


def make_forecast(dash: Path, src_dir: Path | None = None, date: str | None = None, write: bool = True) -> dict:
    src_dir = src_dir or dash
    scen = load_js(src_dir, "scenario.js", "SCEN")
    analogs = load_js(src_dir, "analogs.js", "ANALOGS")
    view_doc = json.loads((dash / "data" / "house_view.json").read_text()) if (dash / "data" / "house_view.json").exists() else {"scenarios": []}
    view = view_doc.get("scenarios", [])
    date = date or datetime.now(UTC).strftime("%Y-%m-%d")
    rows = simulate(scen, view, seed=int(date.replace("-", "")))
    base = analog_baseline(scen, analogs, view)
    for r in rows:
        r["analog"] = base.get(r["a"])
    T = {t["id"]: t for t in scen["templates"]}
    doc = {"d": date, "h": H_DAYS, "n": N_SIMS, "view": [{"id": v["id"], "n": T[v["id"]]["n"], "th": T[v["id"]]["th"], "p": v.get("p", T[v["id"]]["p"]), "k": v.get("k", 1)} for v in view if v["id"] in T],
           "view_asof": view_doc.get("asof"), "rows": rows}
    if write:
        (dash / "data" / "forecasts").mkdir(parents=True, exist_ok=True)
        (dash / "data" / "forecasts" / f"{date}.json").write_text(json.dumps(doc, ensure_ascii=False))
    return doc


# ── scoring ──────────────────────────────────────────────────────────────────
def _realised(series: dict, sym: str, date: str, h: int, bp: bool):
    s = series.get(sym)
    if not s:
        return None
    d, c = s["d"], s["c"]
    i = bisect.bisect_right(d, date) - 1
    if i < 0:
        return None
    j = min(i + h, len(c) - 1)
    done = i + h <= len(c) - 1
    if bp:
        val = round((c[j] - c[i]) * 100, 1)   # ^TNX is in percent -> basis points
    else:
        val = round((c[j] / c[i] - 1) * 100, 2) if c[i] else None
    return {"v": val, "done": done, "elapsed": j - i, "from": d[i], "to": d[j], "ref": c[i], "last": c[j]}


def _pit(r: dict, x: float) -> float:
    """Where the realised value falls in the forecast distribution, by piecewise-linear interpolation of the stored quantiles."""
    qs = [(0.05, r["p5"]), (0.25, r["p25"]), (0.5, r["p50"]), (0.75, r["p75"]), (0.95, r["p95"])]
    if x <= qs[0][1]:
        return 0.025
    if x >= qs[-1][1]:
        return 0.975
    for (pa, va), (pb, vb) in zip(qs, qs[1:]):
        if va <= x <= vb:
            return round(pa + (pb - pa) * ((x - va) / (vb - va) if vb > va else 0), 3)
    return 0.5


def _agg(items: list[dict]) -> dict:
    n = len(items)
    if not n:
        return {"n": 0, "dir": None, "cov90": None, "cov50": None, "mae": None, "mae_naive": None, "mae_analog": None, "skill": None, "skill_analog": None}
    mae = sum(abs(i["err"]) for i in items) / n
    naive = sum(abs(i["real"]) for i in items) / n
    an = [i for i in items if i.get("err_analog") is not None]
    mae_an = sum(abs(i["err_analog"]) for i in an) / len(an) if an else None
    mae_model_an = sum(abs(i["err"]) for i in an) / len(an) if an else None
    return {"n": n, "dir": round(sum(1 for i in items if i["dir"]) / n, 3), "cov90": round(sum(1 for i in items if i["in90"]) / n, 3), "cov50": round(sum(1 for i in items if i["in50"]) / n, 3),
            "mae": round(mae, 2), "mae_naive": round(naive, 2), "mae_analog": round(mae_an, 2) if mae_an is not None else None,
            "skill": round(1 - mae / naive, 3) if naive else None, "skill_analog": round(1 - mae_model_an / mae_an, 3) if mae_an else None}


def score(dash: Path, write: bool = True, keep: int = 40) -> dict:
    series = json.loads((dash / "data" / "series.json").read_text()).get("series", {}) if (dash / "data" / "series.json").exists() else {}
    fdir = dash / "data" / "forecasts"
    files = sorted(fdir.glob("*.json")) if fdir.exists() else []
    forecasts, scored_items = [], []
    for f in files:
        doc = json.loads(f.read_text())
        rows, done_n = [], 0
        for r in doc["rows"]:
            rr = {k: r[k] for k in ("a", "bp", "e", "p5", "p25", "p50", "p75", "p95", "up", "analog") if k in r}
            real = _realised(series, r.get("sym") or "", doc["d"], doc["h"], r.get("bp", False)) if r.get("sym") else None
            if real and real["v"] is not None:
                x = real["v"]
                rr.update({"real": x, "done": real["done"], "elapsed": real["elapsed"], "to": real["to"]})
                tol = 10 if r.get("bp") else 1.0
                rr["dir"] = (x > 0) == (r["e"] > 0) if abs(r["e"]) >= tol and abs(x) >= tol else abs(x) < tol and abs(r["e"]) < tol
                rr["in90"] = r["p5"] <= x <= r["p95"]; rr["in50"] = r["p25"] <= x <= r["p75"]; rr["pit"] = _pit(r, x)
                rr["err"] = round(x - r["e"], 2); rr["err_analog"] = round(x - r["analog"], 2) if r.get("analog") is not None else None
                if real["done"]:
                    done_n += 1
                    scored_items.append({**rr, "d": doc["d"]})
            rows.append(rr)
        status = "scored" if rows and done_n == sum(1 for r in rows if "real" in r) and done_n else ("partial" if any("real" in r for r in rows) else "pending")
        elapsed = max([r.get("elapsed", 0) for r in rows] or [0])
        forecasts.append({"d": doc["d"], "h": doc["h"], "status": status, "elapsed": elapsed, "view": doc["view"], "summary": _agg([r for r in rows if r.get("done")]),
                          "rows": rows})
    by_asset = {}
    for a in sorted({i["a"] for i in scored_items}):
        by_asset[a] = _agg([i for i in scored_items if i["a"] == a])
    by_date = [{"d": f["d"], **f["summary"]} for f in forecasts if f["status"] == "scored"]
    pits = [i["pit"] for i in scored_items]
    pit_hist = [sum(1 for p in pits if lo / 100 <= p < (lo + 20) / 100 or (lo == 80 and p >= 1)) for lo in (0, 20, 40, 60, 80)]
    ledger = json.loads((dash / "data" / "judgments.json").read_text()) if (dash / "data" / "judgments.json").exists() else {"items": []}
    res = sorted([j for j in ledger["items"] if j.get("outcome") in (0, 1, True, False) and j.get("resolved")], key=lambda j: j["resolved"])
    brier_t, acc = [], []
    for j in res:
        acc.append((j["p"] - (1 if j["outcome"] in (1, True) else 0)) ** 2)
        brier_t.append({"d": j["resolved"], "n": len(acc), "brier": round(sum(acc) / len(acc), 3)})
    out = {"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "h": H_DAYS, "series_to": max([v["d"][-1] for v in series.values()], default=None),
           "n_forecasts": len(forecasts), "n_scored": sum(1 for f in forecasts if f["status"] == "scored"), "n_pending": sum(1 for f in forecasts if f["status"] != "scored"),
           "overall": _agg(scored_items), "by_asset": by_asset, "by_date": by_date, "pit_hist": pit_hist, "forecasts": forecasts[-keep:], "ledger_brier": brier_t}
    if write:
        (dash / "data").mkdir(exist_ok=True)
        (dash / "data" / "scorecard.json").write_text(json.dumps(out, ensure_ascii=False))
    return out


def markdown(sc: dict) -> str:
    o = sc["overall"]
    L = [f"## 예측 적중 추적 ({sc['generated'][:10]})", f"예측 {sc['n_forecasts']}건 · 채점 완료 {sc['n_scored']}건 · 진행 중 {sc['n_pending']}건 · 지평 {sc['h']}거래일"]
    if o["n"]:
        sk = "—" if o["skill"] is None else f"{o['skill']:+.2f}"
        L += ["", f"방향 적중 **{o['dir']:.0%}** · 90% 구간 포함 **{o['cov90']:.0%}** (목표 90%) · 50% 구간 {o['cov50']:.0%} · MAE {o['mae']} vs 무변동 {o['mae_naive']} → 스킬 {sk}", "",
              "| 자산 | n | 방향 | 90% 포함 | MAE | 무변동 MAE | 스킬 |", "|---|---|---|---|---|---|---|"]
        f = lambda x, fmt: "—" if x is None else format(x, fmt)  # noqa: E731
        for a, v in sc["by_asset"].items():
            L.append(f"| {a} | {v['n']} | {f(v['dir'], '.0%')} | {f(v['cov90'], '.0%')} | {v['mae']} | {v['mae_naive']} | {f(v['skill'], '+.2f')} |")
    else:
        L.append("아직 채점된 예측이 없습니다 (첫 예측 후 20거래일 뒤부터).")
    if sc["ledger_brier"]:
        L.append(f"\n판단 장부 Brier (누적 {sc['ledger_brier'][-1]['n']}건): **{sc['ledger_brier'][-1]['brier']}**")
    return "\n".join(L)
