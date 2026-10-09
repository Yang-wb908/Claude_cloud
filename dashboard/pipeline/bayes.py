"""Indicator-driven house view: Bayesian update of scenario probabilities from fired tripwires and indicator states.

dashboard/data/indicator_lr.json  per scenario: evidence items {key, lr, note}
    key  "tw:<tripwire id>"              fired -> lr applies
         "ind:<theater>:<n>"             IW.theaters[th].indicators[n].s: obs -> lr, partial -> sqrt(lr), no -> 1/sqrt(lr)
         "risk:index>=<v>"               economic risk index at or above v
         "metric:<path><op><v>"          any sensor/feed value (tripwire path syntax: feeds.gfw.data.hormuz.chg<=-0.3)
         "sens:<kind>:<theater>"         a sensor alert in that theater; kind = firms | ioda | quake | gdacs | gdacs_tc | adsb
Prediction markets (openfeeds poly.matched, prediction_map.yaml) enter as one more evidence factor: a weighted
log-odds pool toward the market price, (odds_market / odds_ours) ** w. w comes from the mapping (how well the question
matches the scenario) times a skill factor learned from resolved markets in data/market_track.json.
Within a theater group the scenarios are mutually exclusive: odds are multiplied per scenario, then the group is renormalised
to the prior group mass, so evidence shifts probability between the group's scenarios rather than creating it.
Writes dashboard/data/house_view_auto.json; forecast.py snapshots it as a second ("auto") view and score.py scores both.
"""

from __future__ import annotations

import json
import math
import re
from datetime import UTC, datetime
from pathlib import Path

import yaml

from .forecast import load_js

HERE = Path(__file__).resolve().parent
MKT_MIN_VOL = 100_000      # 이보다 거래량이 작은 시장은 반영하지 않고 표시만
MKT_REVIEW_VOL = 250_000   # 재검토 플래그 기준 거래량
MKT_REVIEW_GAP = 20        # 하우스 뷰와 시장 차이(%p)
MKT_DEFAULT_W = 0.25
_METRIC = re.compile(r"^metric:([\w.\-]+?)(<=|>=|==|<|>)(-?[\d.]+)$")
_OPS = {"<=": lambda a, b: a <= b, ">=": lambda a, b: a >= b, "<": lambda a, b: a < b, ">": lambda a, b: a > b, "==": lambda a, b: a == b}


def _metric(key: str, sources: dict) -> bool:
    from .tripwires import _get
    m = _METRIC.match(key)
    if not m:
        return False
    v = _get(sources, m.group(1))
    try:
        return v is not None and _OPS[m.group(2)](float(v), float(m.group(3)))
    except (TypeError, ValueError):
        return False


def sensor_alerts(sources: dict) -> dict[str, set[str]]:
    """{kind: {theater,...}} for current sensor alerts (FIRMS, IODA, USGS near watch sites, GDACS)."""
    from .openfeeds import COUNTRY
    out: dict[str, set[str]] = {k: set() for k in ("firms", "ioda", "quake", "gdacs", "gdacs_tc", "adsb")}
    dm = sources.get("domains") or {}
    if (dm.get("adsb") or {}).get("ok"):
        for a in ((dm["adsb"].get("data") or {}).get("areas") or {}).values():
            if a.get("status") == "surge" and a.get("th"):
                out["adsb"].add(a["th"])
    for e in (sources.get("firms") or {}).get("alerts", []):
        if e.get("th"):
            out["firms"].add(e["th"])
    op = sources.get("openfeeds") or {}
    ok = lambda k: (op.get(k) or {}).get("ok") is not False and (op.get(k) or {}).get("data") is not None
    if ok("ioda"):
        for r in (op["ioda"]["data"] or {}).get("countries", []):
            if r.get("alert") and r.get("th"):
                out["ioda"].add(r["th"])
    if ok("quakes"):
        for q in op["quakes"]["data"] or []:
            if q.get("near_th"):
                out["quake"].add(q["near_th"])
    if ok("gdacs"):
        for g in op["gdacs"]["data"] or []:
            if g.get("type") == "DR":
                continue
            ths = {COUNTRY[c][0] for c in g.get("iso2", []) if c in COUNTRY and COUNTRY[c][0]}
            out["gdacs"] |= ths
            if g.get("type") == "TC":
                out["gdacs_tc"] |= ths
    return out


def load_market_map() -> dict:
    p = HERE / "prediction_map.yaml"
    return (yaml.safe_load(p.read_text()) or {}).get("scenarios", {}) if p.exists() else {}


def _state_factor(state: str, lr: float) -> float:
    s = (state or "").lower()
    if s in ("obs", "yes", "fired"):
        return lr
    if s in ("partial", "some"):
        return math.sqrt(lr)
    if s in ("no", "none"):
        return 1 / math.sqrt(lr)
    return 1.0


def update(house: dict, lr_doc: dict, scen: dict, iw: dict, fired: set[str], risk_index: float | None,
           sources: dict | None = None, markets: dict | None = None, mmap: dict | None = None, skill: float = 1.0) -> dict:
    T = {t["id"]: t for t in scen["templates"]}
    sources = sources or {}
    sens = sensor_alerts(sources) if sources else {}
    rows, review = [], []
    for v in house.get("scenarios", []):
        if v["id"] not in T:
            continue
        p0 = (v.get("p") if v.get("p") is not None else T[v["id"]]["p"]) / 100
        factor, used = 1.0, []
        for ev in (lr_doc.get("scenarios") or {}).get(v["id"], []):
            key, lr = ev["key"], float(ev.get("lr", 1))
            f = 1.0
            if key.startswith("tw:"):
                if key[3:] in fired:
                    f = lr
            elif key.startswith("ind:"):
                _, th, n = key.split(":")
                inds = ((iw.get("theaters") or {}).get(th) or {}).get("indicators") or []
                if int(n) < len(inds):
                    f = _state_factor(inds[int(n)].get("s"), lr)
            elif key.startswith("risk:index>="):
                if risk_index is not None and risk_index >= float(key.split(">=")[1]):
                    f = lr
            elif key.startswith("metric:"):
                if _metric(key, sources):
                    f = lr
            elif key.startswith("sens:"):
                _, kind, th = key.split(":")
                if th in sens.get(kind, set()):
                    f = lr
            if abs(f - 1) > 1e-9:
                used.append({"key": key, "f": round(f, 3), "note": ev.get("note", "")})
            factor *= f
        p0c = min(max(p0, 0.005), 0.995)
        odds = p0c / (1 - p0c) * factor
        m = (markets or {}).get(v["id"])
        mrow = None
        if m:
            spec = (mmap or {}).get(v["id"], {})
            w = float(spec.get("w", MKT_DEFAULT_W)) * skill
            pm = min(max(float(m["p"]), 0.01), 0.99)
            mrow = {"p": round(pm * 100, 1), "q": m.get("q"), "url": m.get("url"), "vol": m.get("vol"), "end": m.get("end"), "w": round(w, 3)}
            if m.get("vol", 0) >= MKT_MIN_VOL and w > 0:
                fm = ((pm / (1 - pm)) / odds) ** w
                used.append({"key": "market:" + v["id"], "f": round(fm, 3), "note": f"예측시장 {pm * 100:.0f}% (가중 {w:.2f})"})
                odds *= fm
            if m.get("vol", 0) >= MKT_REVIEW_VOL and abs(p0 * 100 - pm * 100) >= MKT_REVIEW_GAP:
                review.append({"id": v["id"], "house": round(p0 * 100, 1), "market": round(pm * 100, 1), "q": m.get("q"), "url": m.get("url")})
        rows.append({"id": v["id"], "th": T[v["id"]]["th"], "k": v.get("k", 1), "prior": round(p0 * 100, 1), "raw": odds / (1 + odds), "used": used, "market": mrow})
    groups: dict[str, list[dict]] = {}
    for r in rows:
        groups.setdefault(r["th"], []).append(r)
    for g in groups.values():
        prior_mass = sum(r["prior"] for r in g) / 100
        raw_mass = sum(r["raw"] for r in g)
        if len(g) > 1 and prior_mass <= 1 and raw_mass > 0:
            scale = min(1.0, prior_mass) / raw_mass if raw_mass > prior_mass else 1.0
            for r in g:
                r["p"] = round(min(99, max(1, r["raw"] * scale * 100)), 1)
        else:
            for r in g:
                r["p"] = round(min(99, max(1, r["raw"] * 100)), 1)
    return {"scenarios": [{"id": r["id"], "p": r["p"], "k": r["k"], "prior": r["prior"], "evidence": r["used"], **({"market": r["market"]} if r["market"] else {})} for r in rows],
            "review": review, "sensors": {k: sorted(v) for k, v in sens.items() if v}, "market_skill": round(skill, 3)}


def run(dash: Path, write: bool = True) -> dict:
    house = json.loads((dash / "data" / "house_view.json").read_text())
    lr_doc = json.loads((dash / "data" / "indicator_lr.json").read_text()) if (dash / "data" / "indicator_lr.json").exists() else {"scenarios": {}}
    scen = load_js(dash, "scenario.js", "SCEN")
    iw = load_js(dash, "iw.js", "IW")
    trip = json.loads((dash / "data" / "tripwires.json").read_text()) if (dash / "data" / "tripwires.json").exists() else {"fired": []}
    fired = {f["id"] for f in trip.get("fired", [])}
    risk = json.loads((dash / "data" / "risk.json").read_text()) if (dash / "data" / "risk.json").exists() else None
    ld = lambda n: json.loads((dash / "data" / n).read_text()) if (dash / "data" / n).exists() else None
    sources = {"firms": ld("firms.json"), "feeds": ld("feeds.json"), "openfeeds": ld("openfeeds.json"), "domains": ld("domains.json"), "risk": risk, "coverage": ld("coverage.json")}
    op = sources["openfeeds"] or {}
    markets = ((op.get("poly") or {}).get("data") or {}).get("matched") if (op.get("poly") or {}).get("ok") is not False else None
    track_path = dash / "data" / "market_track.json"
    track = json.loads(track_path.read_text()) if track_path.exists() else {"series": {}, "resolved": {}}
    skill = market_skill(track)
    res = update(house, lr_doc, scen, iw, fired, risk["index"] if risk else None, sources, markets, load_market_map(), skill["factor"])
    res.update({"asof": datetime.now(UTC).strftime("%Y-%m-%d"), "mode": "auto", "base_asof": house.get("asof"), "fired": sorted(fired), "market_record": skill})
    if write:
        (dash / "data" / "house_view_auto.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
        if markets:
            record_track(track, res, markets, res["asof"])
            track_path.write_text(json.dumps(track, ensure_ascii=False, separators=(",", ":")))
    return res


def record_track(track: dict, res: dict, markets: dict, d: str) -> None:
    """하루 한 줄: 시나리오별 하우스·자동·시장 확률과 시장 식별자. 시장이 마감되면 openfeeds 가 결과를 resolved 에 채운다."""
    for v in res["scenarios"]:
        m = markets.get(v["id"])
        if not m:
            continue
        ser = track.setdefault("series", {}).setdefault(v["id"], [])
        row = {"d": d, "house": v["prior"], "auto": v["p"], "mkt": round(m["p"] * 100, 1), "mslug": m.get("mslug") or "", "end": m.get("end") or "", "q": (m.get("q") or "")[:160]}
        if ser and ser[-1]["d"] == d:
            ser[-1] = row
        else:
            ser.append(row)
        del ser[:-400]


def market_skill(track: dict) -> dict:
    """해결된 시장마다 마감 전 마지막 기록으로 Brier 점수 비교. 5건 이상 쌓이면 시장 가중을 0.5~2배로 조정."""
    bs = {"house": [], "auto": [], "mkt": []}
    for key, r in (track.get("resolved") or {}).items():
        sid, mslug = key.split("|", 1)
        rows = [x for x in (track.get("series") or {}).get(sid, []) if x.get("mslug") == mslug and (not r.get("end") or x["d"] <= r["end"])]
        if not rows or r.get("outcome") not in (0, 1):
            continue
        last = rows[-1]
        for k in bs:
            if last.get(k) is not None:
                bs[k].append((last[k] / 100 - r["outcome"]) ** 2)
    avg = {k: (round(sum(v) / len(v), 4) if v else None) for k, v in bs.items()}
    n = len(bs["mkt"])
    factor = 1.0
    if n >= 5 and avg["mkt"] and avg["house"] is not None:
        factor = max(0.5, min(2.0, (avg["house"] + 1e-3) / (avg["mkt"] + 1e-3)))
    return {"n": n, "brier": avg, "factor": round(factor, 3)}
