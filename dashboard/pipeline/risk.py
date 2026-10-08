"""Economic risk index (server side, daily) — the same construction as risk.js on the board, from repo data.

Writes dashboard/data/risk.json (today's index, components, per-asset grades, Korea basket) and appends to
dashboard/data/risk_history.json so the board can chart the index over time. Used by SITREP, badges and tripwires.
"""

from __future__ import annotations

import json
import math
import random
from datetime import UTC, datetime
from pathlib import Path

from . import forecast

W = {"tail": 0.30, "market": 0.25, "supply": 0.20, "crowd": 0.10, "events": 0.10, "model": 0.05}
KR_BASKET = [("brent", 0.30, "원유"), ("jkm", 0.12, "LNG"), ("products", 0.08, "석유제품"), ("coal", 0.05, "유연탄"), ("wheat", 0.05, "밀"), ("corn", 0.05, "옥수수"), ("soy", 0.04, "대두"), ("copper", 0.05, "구리"), ("ironore", 0.05, "철광석"), ("fert", 0.03, "비료"), ("container", 0.08, "컨테이너 운임"), ("tanker", 0.05, "유조선 운임"), ("usd", 0.05, "원/달러")]
SHOCK_TYPES = {"S", "M", "A"}


def clamp01(v: float) -> float:
    return max(0.0, min(1.0, v))


def _q(sorted_vals, f):
    return sorted_vals[min(len(sorted_vals) - 1, int(f * len(sorted_vals)))]


def simulate_all(scen: dict, view: list[dict], n: int = 3000, seed: int = 5) -> tuple[dict[str, list[float]], dict[str, list[int]], int]:
    """Like forecast.simulate but keeps the draws (per asset) and scenario occurrence flags, for basket math."""
    T = {t["id"]: t for t in scen["templates"]}
    sel = [{"t": T[v["id"]], "p": (v.get("p") if v.get("p") is not None else T[v["id"]]["p"]) / 100, "k": v.get("k", 1)} for v in view if v["id"] in T]
    groups: dict[str, list[dict]] = {}
    for s in sel:
        groups.setdefault(s["t"]["th"], []).append(s)
    gl = []
    for g in groups.values():
        tot = sum(s["p"] for s in g); norm = 1 / tot if tot > 1 else 1
        gl.append([{**s, "p": s["p"] * norm} for s in g])
    H = 30  # fixed horizon so the index is comparable day to day
    assets = list(scen["assets"])
    rng = random.Random(seed)
    sims = {a: [] for a in assets}
    occ = {s["t"]["id"]: [] for s in sel}
    for _ in range(n):
        shock: dict[str, float] = {}
        hit = set()
        for g in gl:
            u = rng.random(); cum = 0.0
            for s in g:
                cum += s["p"]
                if u < cum:
                    hit.add(s["t"]["id"])
                    for a, sh in s["t"]["shocks"].items():
                        shock[a] = shock.get(a, 0.0) + s["k"] * (sh["m"] + sh["s"] * rng.gauss(0, 1))
                    break
        for sid in occ:
            occ[sid].append(1 if sid in hit else 0)
        for a in assets:
            A = scen["assets"][a]
            noise = 12 * math.sqrt(H / 20) * rng.gauss(0, 1) if A.get("bp") else A["vol"] * math.sqrt(H / 252) * rng.gauss(0, 1)
            v = shock.get(a, 0.0) + noise
            sims[a].append(v if A.get("bp") else max(-95.0, v))
    return sims, occ, H


def _last(series: dict, sym: str):
    s = series.get(sym)
    return s["c"][-1] if s and s.get("c") else None


def compute(dash: Path, src_dir: Path | None = None, now: datetime | None = None) -> dict:
    src_dir = src_dir or dash
    now = now or datetime.now(UTC)
    scen = forecast.load_js(src_dir, "scenario.js", "SCEN")
    view_doc = json.loads((dash / "data" / "house_view.json").read_text()) if (dash / "data" / "house_view.json").exists() else {"scenarios": []}
    series = json.loads((dash / "data" / "series.json").read_text()).get("series", {}) if (dash / "data" / "series.json").exists() else {}
    snap = json.loads((dash / "data_snapshot.json").read_text()) if (dash / "data_snapshot.json").exists() else {"events": []}
    auto = json.loads((dash / "intel.auto.json").read_text()) if (dash / "intel.auto.json").exists() else {}
    score = json.loads((dash / "data" / "scorecard.json").read_text()) if (dash / "data" / "scorecard.json").exists() else None
    sims, occ, H = simulate_all(scen, view_doc.get("scenarios", []))
    n = len(next(iter(sims.values()))) if sims else 0
    comp = {}
    basket = [sum(w * sims[a][i] for a, w, _ in KR_BASKET if a in sims) for i in range(n)]
    bs = sorted(basket)
    b95, b50, bmean = _q(bs, .95), _q(bs, .5), sum(basket) / n
    comp["tail"] = {"v": clamp01(b95 / 50), "d": f"한국 수입 바스켓 {H}일 P95 {b95:+.1f}% · 중앙값 {b50:+.1f}%"}
    mk = {m["sym"]: m["v"] for m in auto.get("markets", [])}
    vix = mk.get("^VIX", _last(series, "^VIX")); dxy = mk.get("DX-Y.NYB", _last(series, "DX-Y.NYB")); tnx = mk.get("^TNX", _last(series, "^TNX")); brent = mk.get("BZ=F", _last(series, "BZ=F")); krw = mk.get("KRW=X", _last(series, "KRW=X"))
    ms = [x for x in [clamp01((vix - 12) / 28) if vix else None, clamp01((dxy - 95) / 15) if dxy else None, clamp01((tnx - 3.5) / 2.5) if tnx else None, clamp01((brent - 70) / 60) if brent else None, clamp01((krw - 1250) / 250) if krw else None] if x is not None]
    comp["market"] = {"v": sum(ms) / len(ms) if ms else 0.5, "d": f"VIX {vix} · DXY {dxy} · 10y {tnx} · Brent {brent} · KRW {krw}"}
    pw = auto.get("portwatch") or {}
    cs = []
    for k, v in pw.items():
        lat = (v.get("latest") or {}).get("n_total"); base = v.get("avg28")
        if lat is not None and base:
            cs.append(clamp01(1 - lat / base))
    comp["supply"] = {"v": (max(cs) * 0.5 + sum(cs) / len(cs) * 0.5) if cs else 0.5, "d": f"PortWatch 통항 감소율 {[round(x, 2) for x in cs]}" if cs else "PortWatch 없음(기본 0.5)"}
    cot = auto.get("cot") or []
    crowd = [clamp01(abs(c.get("net") or 0) / 300000) for c in cot]
    comp["crowd"] = {"v": (max(crowd) * 0.5 + sum(crowd) / len(crowd) * 0.5) if crowd else 0.3, "d": f"COT {len(cot)}개 시장" if cot else "COT 없음(기본 0.3)"}
    cut = (now.replace(tzinfo=None) - __import__("datetime").timedelta(days=7)).strftime("%Y-%m-%d")
    sev = {}
    th_path = src_dir / "theaters.js"
    if th_path.exists():
        import re
        for m in re.finditer(r'id:\s*"([a-z_]+)"[^}]*?sev:\s*(\d)', th_path.read_text()):
            sev[m.group(1)] = int(m.group(2))
    ev7 = [e for e in snap.get("events", []) if e.get("d", "") >= cut]
    hot = [e for e in ev7 if e.get("t") in SHOCK_TYPES and sev.get(e.get("th") or "", 0) >= 4]
    comp["events"] = {"v": clamp01(len(hot) / 40), "d": f"7일 사건 {len(ev7)}건, 고경보 타격·해상 {len(hot)}건"}
    o = (score or {}).get("overall") or {}
    comp["model"] = {"v": clamp01(1 - o["cov90"]) + (0.2 if (o.get("skill") is not None and o["skill"] < 0) else 0) if o.get("n") else 0.5, "d": f"90% 포함 {o.get('cov90')} · 스킬 {o.get('skill')}" if o.get("n") else "채점 전(기본 0.5)"}
    index = round(100 * sum(W[k] * clamp01(comp[k]["v"]) for k in W))
    per_asset = []
    for a, A in scen["assets"].items():
        s = sorted(sims[a]); p5, p95 = _q(s, .05), _q(s, .95)
        span = (p95 - p5) / (100 if A.get("bp") else 60)
        sc = clamp01(0.6 * clamp01(span) + 0.4 * clamp01(A.get("vol", 20) / 80))
        per_asset.append({"id": a, "p5": round(p5, 1), "p95": round(p95, 1), "score": round(sc, 3), "grade": 5 if sc >= .75 else 4 if sc >= .55 else 3 if sc >= .38 else 2 if sc >= .22 else 1})
    per_asset.sort(key=lambda x: -x["score"])
    kr = [{"a": a, "n": nm, "w": w, "e": round(sum(sims[a]) / n, 2)} for a, w, nm in KR_BASKET if a in sims]
    level = "심각" if index >= 75 else "높음" if index >= 55 else "보통" if index >= 35 else "낮음"
    return {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "d": now.strftime("%Y-%m-%d"), "index": index, "level": level, "h": H, "weights": W,
            "components": {k: {"v": round(clamp01(v["v"]), 3), "d": v["d"]} for k, v in comp.items()}, "basket": {"mean": round(bmean, 2), "p50": round(b50, 2), "p95": round(b95, 2)},
            "per_asset": per_asset, "korea": kr}


def run(dash: Path, src_dir: Path | None = None, write: bool = True) -> dict:
    r = compute(dash, src_dir)
    if write:
        (dash / "data").mkdir(exist_ok=True)
        (dash / "data" / "risk.json").write_text(json.dumps(r, ensure_ascii=False, indent=1))
        hp = dash / "data" / "risk_history.json"
        hist = json.loads(hp.read_text()) if hp.exists() else []
        hist = [h for h in hist if h.get("d") != r["d"]] + [{"d": r["d"], "index": r["index"], "tail": r["components"]["tail"]["v"], "market": r["components"]["market"]["v"], "supply": r["components"]["supply"]["v"], "basket_p95": r["basket"]["p95"]}]
        hp.write_text(json.dumps(hist[-400:], ensure_ascii=False))
        bd = dash / "data" / "badges"; bd.mkdir(parents=True, exist_ok=True)
        (bd / "risk.json").write_text(json.dumps({"schemaVersion": 1, "label": "econ risk", "message": f"{r['index']} {r['level']}", "color": "red" if r["index"] >= 75 else "orange" if r["index"] >= 55 else "yellow" if r["index"] >= 35 else "green"}, ensure_ascii=False))
    return r


def markdown(r: dict) -> str:
    c = r["components"]
    L = [f"## 경제 위험 지수 {r['index']} ({r['level']}) · {r['d']}", "", "| 구성 | 값 | 근거 |", "|---|---|---|"]
    for k in W:
        L.append(f"| {k} (×{W[k]}) | {round(100 * c[k]['v'])} | {c[k]['d']} |")
    L += ["", f"한국 수입 바스켓 {r['h']}일: 기대 {r['basket']['mean']:+.1f}% · P95 {r['basket']['p95']:+.1f}%"]
    L.append("상품 위험 R5: " + (", ".join(a["id"] for a in r["per_asset"] if a["grade"] == 5) or "없음"))
    return "\n".join(L)
