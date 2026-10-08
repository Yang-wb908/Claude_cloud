"""Shock calibration from the analog library: for each scenario with attached analogs, the mean and standard deviation of the
analogs' +20d moves per asset. Written to dashboard/data/shock_calib.json; the scenario tab shows them next to the analyst's
conditional shocks and can apply them with the "사례 보정" toggle."""

from __future__ import annotations

import json
import statistics
from datetime import UTC, datetime
from pathlib import Path

from .forecast import ANALOG_KEY, load_js


def calibrate(scen: dict, analogs: dict) -> dict:
    A = {a["id"]: a for a in analogs.get("analogs", [])}
    out = {}
    for t in scen["templates"]:
        ids = [i for i in t.get("analogs", []) if i in A]
        if not ids:
            continue
        per = {}
        for asset, key in ANALOG_KEY.items():
            vals = [A[i]["moves"][key]["d20"] for i in ids if (A[i].get("moves") or {}).get(key, {}).get("d20") is not None]
            if len(vals) >= 2:
                per[asset] = {"m": round(statistics.mean(vals), 1), "s": round(statistics.pstdev(vals), 1), "n": len(vals), "analyst": t["shocks"].get(asset)}
            elif len(vals) == 1:
                per[asset] = {"m": round(vals[0], 1), "s": None, "n": 1, "analyst": t["shocks"].get(asset)}
        if per:
            out[t["id"]] = {"analogs": ids, "assets": per}
    return out


def run(dash: Path, write: bool = True) -> dict:
    scen = load_js(dash, "scenario.js", "SCEN")
    an = load_js(dash, "analogs.js", "ANALOGS")
    res = {"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "scenarios": calibrate(scen, an)}
    if write:
        (dash / "data" / "shock_calib.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    return res
