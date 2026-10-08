"""Evaluate tripwires against intel.auto.json + the event list. Writes dashboard/data/tripwires.json.

The GitHub workflow turns fired tripwires into Issues (label `tripwire`), deduplicated by title.
"""

from __future__ import annotations

import json
import operator
from datetime import UTC, datetime, timedelta
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
OPS = {"<": operator.lt, "<=": operator.le, ">": operator.gt, ">=": operator.ge, "==": operator.eq}


def _get(d, path: str):
    """metric paths: portwatch.hormuz.latest.n_total  |  markets.BZ=F  |  pla.latest.aircraft"""
    parts = path.split(".")
    if parts[0] == "markets":
        sym = ".".join(parts[1:])
        for m in d.get("markets", []):
            if m.get("sym") == sym:
                return m.get("v")
        return None
    if parts[0] == "risk":
        cur = d.get("risk") or {}
        for p in parts[1:]:
            cur = cur.get(p) if isinstance(cur, dict) else None
        return cur
    if parts[0] == "pla" and len(parts) > 1 and parts[1] == "latest":
        pla = d.get("pla") or []
        if not pla:
            return None
        cur = pla[-1]
        return cur.get(parts[2]) if len(parts) > 2 else cur
    cur = d
    for p in parts:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(p)
    return cur


def count_events(events: list[dict], flt: dict, now: datetime) -> int:
    since = (now - timedelta(days=flt.get("days", 1))).strftime("%Y-%m-%d")
    n = 0
    for e in events:
        if e.get("d", "") < since:
            continue
        if flt.get("th") and e.get("th") != flt["th"]:
            continue
        if flt.get("t") and e.get("t") != flt["t"]:
            continue
        n += 1
    return n


def evaluate(auto: dict, events: list[dict], rules: list[dict] | None = None, now: datetime | None = None) -> list[dict]:
    now = now or datetime.now(UTC)
    rules = rules if rules is not None else yaml.safe_load((HERE / "tripwires.yaml").read_text())["tripwires"]
    fired = []
    for r in rules:
        if r.get("kind") == "event_count":
            cur = count_events(events, r.get("filter", {}), now)
        else:
            cur = _get(auto, r["metric"])
        if cur is None:
            continue
        try:
            hit = OPS[r["op"]](float(cur), float(r["value"]))
        except (TypeError, ValueError):
            continue
        if hit:
            fired.append({"id": r["id"], "title": r["title"], "sev": r.get("sev", 3), "th": r.get("th"), "why": r.get("why", ""),
                          "current": cur, "threshold": r["value"], "op": r["op"], "at": now.strftime("%Y-%m-%dT%H:%M:%SZ")})
    return fired


def run(dash: Path) -> list[dict]:
    auto = json.loads((dash / "intel.auto.json").read_text()) if (dash / "intel.auto.json").exists() else {}
    if (dash / "data" / "risk.json").exists():
        auto["risk"] = json.loads((dash / "data" / "risk.json").read_text())
    snap = json.loads((dash / "data_snapshot.json").read_text())
    fired = evaluate(auto, snap.get("events", []))
    (dash / "data").mkdir(exist_ok=True)
    (dash / "data" / "tripwires.json").write_text(json.dumps({"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "fired": fired}, ensure_ascii=False, indent=1))
    return fired
