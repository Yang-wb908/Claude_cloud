"""Indicator-driven house view: Bayesian update of scenario probabilities from fired tripwires and indicator states.

dashboard/data/indicator_lr.json  per scenario: evidence items {key, lr, note}
    key  "tw:<tripwire id>"              fired -> lr applies
         "ind:<theater>:<n>"             IW.theaters[th].indicators[n].s: obs -> lr, partial -> sqrt(lr), no -> 1/sqrt(lr)
         "risk:index>=<v>"               economic risk index at or above v
Within a theater group the scenarios are mutually exclusive: odds are multiplied per scenario, then the group is renormalised
to the prior group mass, so evidence shifts probability between the group's scenarios rather than creating it.
Writes dashboard/data/house_view_auto.json; forecast.py snapshots it as a second ("auto") view and score.py scores both.
"""

from __future__ import annotations

import json
import math
from datetime import UTC, datetime
from pathlib import Path

from .forecast import load_js


def _state_factor(state: str, lr: float) -> float:
    s = (state or "").lower()
    if s in ("obs", "yes", "fired"):
        return lr
    if s in ("partial", "some"):
        return math.sqrt(lr)
    if s in ("no", "none"):
        return 1 / math.sqrt(lr)
    return 1.0


def update(house: dict, lr_doc: dict, scen: dict, iw: dict, fired: set[str], risk_index: float | None) -> dict:
    T = {t["id"]: t for t in scen["templates"]}
    rows = []
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
            if abs(f - 1) > 1e-9:
                used.append({"key": key, "f": round(f, 3), "note": ev.get("note", "")})
            factor *= f
        p0c = min(max(p0, 0.005), 0.995)
        odds = p0c / (1 - p0c) * factor
        rows.append({"id": v["id"], "th": T[v["id"]]["th"], "k": v.get("k", 1), "prior": round(p0 * 100, 1), "raw": odds / (1 + odds), "used": used})
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
    return {"scenarios": [{"id": r["id"], "p": r["p"], "k": r["k"], "prior": r["prior"], "evidence": r["used"]} for r in rows]}


def run(dash: Path, write: bool = True) -> dict:
    house = json.loads((dash / "data" / "house_view.json").read_text())
    lr_doc = json.loads((dash / "data" / "indicator_lr.json").read_text()) if (dash / "data" / "indicator_lr.json").exists() else {"scenarios": {}}
    scen = load_js(dash, "scenario.js", "SCEN")
    iw = load_js(dash, "iw.js", "IW")
    trip = json.loads((dash / "data" / "tripwires.json").read_text()) if (dash / "data" / "tripwires.json").exists() else {"fired": []}
    fired = {f["id"] for f in trip.get("fired", [])}
    risk = json.loads((dash / "data" / "risk.json").read_text()) if (dash / "data" / "risk.json").exists() else None
    res = update(house, lr_doc, scen, iw, fired, risk["index"] if risk else None)
    res.update({"asof": datetime.now(UTC).strftime("%Y-%m-%d"), "mode": "auto", "base_asof": house.get("asof"), "fired": sorted(fired)})
    if write:
        (dash / "data" / "house_view_auto.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    return res
