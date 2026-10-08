"""Backtests over the collected daily series (dashboard/data/series.json).

Three studies, all written to dashboard/data/backtest.json:
  events     realized moves of key assets after the board's own high-severity events (event study)
  tripwires  past threshold crossings of every market tripwire and what Brent / wheat / S&P did afterwards
  ledger     Brier score and calibration bins of the judgment ledger (dashboard/data/judgments.json)

Usage: python dashboard/pipeline/run.py backtest   (after `collect --only series` and `assemble`)
"""

from __future__ import annotations

import bisect
import json
import operator
from datetime import UTC, datetime
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
OPS = {"<": operator.lt, "<=": operator.le, ">": operator.gt, ">=": operator.ge, "==": operator.eq}
STUDY_ASSETS = [("BZ=F", "brent"), ("ZW=F", "wheat"), ("GC=F", "gold"), ("DX-Y.NYB", "dxy"), ("^VIX", "vix"), ("^KS11", "kospi"), ("KRW=X", "krw"), ("^GSPC", "spx")]
HORIZONS = (1, 5, 20, 60)
SHOCK_TYPES = {"S", "M", "A", "N"}  # strike/missile, maritime, attack, nuclear-type codes used by the board


class Series:
    def __init__(self, dates: list[str], closes: list[float]):
        self.d, self.c = dates, closes

    def idx_on_or_before(self, date: str) -> int | None:
        i = bisect.bisect_right(self.d, date) - 1
        return i if i >= 0 else None

    def fwd(self, date: str, h: int) -> float | None:
        """% change from the last close on/before `date` to the close h trading days later."""
        i = self.idx_on_or_before(date)
        if i is None or i + h >= len(self.c) or not self.c[i]:
            return None
        return round((self.c[i + h] / self.c[i] - 1) * 100, 2)

    def value(self, i: int) -> float:
        return self.c[i]


def load_series(path: Path) -> dict[str, Series]:
    if not path.exists():
        return {}
    raw = json.loads(path.read_text()).get("series", {})
    return {k: Series(v["d"], v["c"]) for k, v in raw.items() if v.get("d")}


def _med(xs: list[float | None]) -> float | None:
    v = sorted(x for x in xs if x is not None)
    if not v:
        return None
    n = len(v)
    return round(v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2, 2)


def event_study(events: list[dict], series: dict[str, Series], theaters_sev: dict[str, int], max_events: int = 80) -> dict:
    """Events of high-severity theaters with shock-type codes; realized moves at 1/5/20/60 trading days."""
    picked = [e for e in events if e.get("t") in SHOCK_TYPES and theaters_sev.get(e.get("th") or "", 0) >= 4 and e.get("d")]
    picked.sort(key=lambda e: e["d"], reverse=True)
    rows = []
    for e in picked[:max_events]:
        mv = {}
        for sym, key in STUDY_ASSETS:
            s = series.get(sym)
            if s:
                mv[key] = {f"d{h}": s.fwd(e["d"], h) for h in HORIZONS}
        if any(any(v is not None for v in m.values()) for m in mv.values()):
            rows.append({"d": e["d"], "th": e.get("th"), "t": e.get("t"), "x": (e.get("x") or "")[:120], "moves": mv})
    summary = {}
    for sym, key in STUDY_ASSETS:
        summary[key] = {f"d{h}": {"median": _med([r["moves"].get(key, {}).get(f"d{h}") for r in rows]),
                                  "hit_up": _share([r["moves"].get(key, {}).get(f"d{h}") for r in rows])} for h in HORIZONS}
    return {"n": len(rows), "rows": rows, "summary": summary}


def _share(xs: list[float | None]) -> float | None:
    v = [x for x in xs if x is not None]
    return round(sum(1 for x in v if x > 0) / len(v), 2) if v else None


def tripwire_backtest(tripwires: list[dict], series: dict[str, Series]) -> list[dict]:
    """For each market tripwire, find first-crossing days (false -> true) and the following 20/60-day moves."""
    out = []
    for t in tripwires:
        metric = t.get("metric", "")
        if not metric.startswith("markets."):
            continue
        sym = metric[len("markets."):]
        s = series.get(sym)
        if not s:
            continue
        op = OPS[t["op"]]
        episodes, was = [], False
        for i, v in enumerate(s.c):
            now = op(v, t["value"])
            if now and not was:
                episodes.append(i)
            was = now
        rows = []
        for i in episodes:
            d = s.d[i]
            rows.append({"d": d, "v": s.c[i], "self_20": s.fwd(d, 20), "self_60": s.fwd(d, 60),
                         "brent_60": series["BZ=F"].fwd(d, 60) if "BZ=F" in series else None,
                         "wheat_60": series["ZW=F"].fwd(d, 60) if "ZW=F" in series else None,
                         "spx_60": series["^GSPC"].fwd(d, 60) if "^GSPC" in series else None})
        out.append({"id": t["id"], "title": t["title"], "sym": sym, "op": t["op"], "value": t["value"], "episodes": len(rows), "rows": rows[-12:],
                    "median_self_60": _med([r["self_60"] for r in rows]), "median_brent_60": _med([r["brent_60"] for r in rows]), "median_spx_60": _med([r["spx_60"] for r in rows]),
                    "active_now": bool(s.c) and bool(op(s.c[-1], t["value"]))})
    return out


def ledger_stats(items: list[dict]) -> dict:
    res = [j for j in items if j.get("outcome") in (0, 1, True, False)]
    bins = []
    for lo in (0, 20, 40, 60, 80):
        hi = lo + 20
        b = [j for j in res if lo <= j["p"] * 100 < hi or (hi == 100 and j["p"] == 1)]
        bins.append({"bin": f"{lo}-{hi}", "n": len(b), "pred": round(sum(j["p"] for j in b) / len(b), 2) if b else None, "obs": round(sum(1 for j in b if j["outcome"] in (1, True)) / len(b), 2) if b else None})
    brier = round(sum((j["p"] - (1 if j["outcome"] in (1, True) else 0)) ** 2 for j in res) / len(res), 3) if res else None
    base = round(sum(1 for j in res if j["outcome"] in (1, True)) / len(res), 2) if res else None
    overdue = [j["id"] for j in items if j.get("outcome") is None and j.get("due") and j["due"] < datetime.now(UTC).strftime("%Y-%m-%d")]
    return {"n": len(items), "resolved": len(res), "brier": brier, "base_rate": base, "bins": bins, "overdue": overdue}


def run(dash: Path, write: bool = True) -> dict:
    series = load_series(dash / "data" / "series.json")
    snap = json.loads((dash / "data_snapshot.json").read_text()) if (dash / "data_snapshot.json").exists() else {"events": []}
    sev = {}
    th_path = dash / "theaters.js"
    if th_path.exists():
        import re
        for m in re.finditer(r'id:\s*"([a-z_]+)"[^}]*?sev:\s*(\d)', th_path.read_text()):
            sev[m.group(1)] = int(m.group(2))
    trips = yaml.safe_load((HERE / "tripwires.yaml").read_text())["tripwires"]
    ledger = json.loads((dash / "data" / "judgments.json").read_text()) if (dash / "data" / "judgments.json").exists() else {"items": []}
    out = {"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "series": {k: {"from": v.d[0], "to": v.d[-1], "n": len(v.c)} for k, v in series.items()},
           "events": event_study(snap.get("events", []), series, sev), "tripwires": tripwire_backtest(trips, series), "ledger": ledger_stats(ledger.get("items", []))}
    if write:
        (dash / "data").mkdir(exist_ok=True)
        (dash / "data" / "backtest.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    return out


def markdown(bt: dict) -> str:
    """Short Korean summary for the weekly backtest issue comment."""
    L = [f"### 주간 백테스트 {bt['generated'][:10]}", f"시계열 {len(bt['series'])}개 · 사건 연구 {bt['events']['n']}건 · 판단 장부 {bt['ledger']['n']}건(판정 {bt['ledger']['resolved']}건)", ""]
    s = bt["events"]["summary"]
    if bt["events"]["n"]:
        L += ["| 자산 | +1일 중앙값 | +5일 | +20일 | +60일 | 20일 상승 비율 |", "|---|---|---|---|---|---|"]
        for k, v in s.items():
            L.append(f"| {k} | {v['d1']['median']} | {v['d5']['median']} | {v['d20']['median']} | {v['d60']['median']} | {v['d20']['hit_up']} |")
        L.append("")
    if bt["tripwires"]:
        L += ["| 트립와이어 | 과거 발동 | 자기 60일 중앙값 | 브렌트 60일 | S&P 60일 | 현재 |", "|---|---|---|---|---|---|"]
        for t in bt["tripwires"]:
            L.append(f"| {t['title']} | {t['episodes']} | {t['median_self_60']} | {t['median_brent_60']} | {t['median_spx_60']} | {'발동 중' if t['active_now'] else '-'} |")
        L.append("")
    lg = bt["ledger"]
    L.append(f"판단 장부 Brier {lg['brier']} (기저율 {lg['base_rate']}) · 기한 경과 미판정 {len(lg['overdue'])}건")
    return "\n".join(L)
