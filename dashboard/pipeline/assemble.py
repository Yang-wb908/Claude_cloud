"""Assemble collected + enriched items into dashboard data files.

Writes
  dashboard/data_snapshot.json   events merged (curated events are never dropped; auto events expire after 30 days)
  dashboard/intel.auto.json      metrics (markets, PortWatch series, PLA daily), source status, counts, gaps
  dashboard/data/latest.json     public JSON for GitHub Pages consumers (events + metrics + generated time)
  dashboard/data/history/*.json  one compact record per run, used for diffs
  dashboard/data/changes.json    what changed since the previous run
"""

from __future__ import annotations

import hashlib
import json
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path

DASH = Path(__file__).resolve().parents[1]
DATA = DASH / "data"
HIST = DATA / "history"


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9가-힣]+", " ", (s or "").lower()).strip()[:80]


def item_id(it: dict) -> str:
    key = it.get("url") or (it.get("sid", "") + "|" + _norm(it.get("title", "")))
    return "a" + hashlib.sha1(key.encode()).hexdigest()[:10]


def to_event(it: dict) -> dict | None:
    e = it.get("enr") or {}
    if it.get("kind") not in ("news", "report") or e.get("rel", 0) < 2:
        return None
    return {"d": it["published"][:10], "t": e.get("t") or "D", "at": e.get("at"), "th": e.get("th"), "p": e.get("p") or "", "x": e.get("x") or it["title"][:140],
            "s": it.get("url") or "", "g": it.get("grade"), "src": it.get("sid"), "lang": e.get("lang", "en"), "auto": True, "id": it["id"]}


def merge_events(existing: list[dict], new: list[dict], now: datetime, keep_days: int = 30, per_day_theater: int = 12) -> list[dict]:
    cutoff = (now - timedelta(days=keep_days)).strftime("%Y-%m-%d")
    seen_url = {e.get("s") for e in existing if e.get("s")}
    seen_txt = {(e.get("d"), _norm(e.get("x", ""))) for e in existing}
    out = [e for e in existing if not e.get("auto") or e.get("d", "") >= cutoff]
    added = 0
    counts: dict[tuple, int] = {}
    for e in sorted(new, key=lambda x: x["d"], reverse=True):
        if (e["s"] and e["s"] in seen_url) or (e["d"], _norm(e["x"])) in seen_txt or e["d"] < cutoff:
            continue
        k = (e["d"], e.get("th"))
        if counts.get(k, 0) >= per_day_theater:
            continue
        counts[k] = counts.get(k, 0) + 1
        out.append(e); added += 1
        if e["s"]:
            seen_url.add(e["s"])
        seen_txt.add((e["d"], _norm(e["x"])))
    out.sort(key=lambda e: e.get("d", ""), reverse=True)
    return out, added


def metrics_from(items: list[dict]) -> dict:
    markets, pw, pla = [], {}, []
    for it in items:
        ex = it.get("extra", {})
        if it.get("kind") != "metric":
            continue
        if it.get("sid") == "markets" and "value" in ex:
            markets.append({"l": ex["label"], "v": ex["value"], "d": ex["date"], "chg": ex.get("chg", ""), "sym": ex["sym"], "src": it["url"], "g": "B2"})
        elif ex.get("choke"):
            s = pw.setdefault(ex["choke"], {"series": []})
            s["series"].append([ex["date"], ex.get("n_total"), ex.get("n_tanker"), ex.get("n_container")])
        elif ex.get("metric") == "pla_daily":
            pla.append({"d": ex["date"], "aircraft": ex.get("aircraft"), "ships": ex.get("ships")})
    for c, s in pw.items():
        s["series"] = sorted({tuple(x) for x in s["series"]}, key=lambda x: x[0])
        s["series"] = [list(x) for x in s["series"]]
        vals = [x[1] for x in s["series"] if x[1] is not None]
        if vals:
            last = s["series"][-1]
            s["latest"] = {"d": last[0], "n_total": last[1], "n_tanker": last[2], "n_container": last[3]}
            s["avg7"] = round(sum(vals[-7:]) / len(vals[-7:]), 1)
            s["avg28"] = round(sum(vals[-28:]) / len(vals[-28:]), 1)
    pla.sort(key=lambda x: x["d"])
    return {"markets": markets, "portwatch": pw, "pla": pla}


def assemble(items: list[dict], status: list[dict], now: datetime | None = None, dash: Path = DASH, write: bool = True) -> dict:
    now = now or datetime.now(UTC)
    snap_path = dash / "data_snapshot.json"
    snap = json.loads(snap_path.read_text()) if snap_path.exists() else {"events": [], "cities": [], "lanes": [], "chokepoints": [], "markets": {}}
    new_events = [ev for ev in (to_event(it) for it in items) if ev]
    merged, added = merge_events(snap.get("events", []), new_events, now)
    snap["events"] = merged
    snap["auto_generated"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    metrics = metrics_from(items)
    gaps = [f"{s['name']}: {s['err']}" for s in status if not s.get("ok")]
    auto = {
        "generated": snap["auto_generated"], "counts": {"raw": len(items), "candidates": len(new_events), "added": added,
                                                         "claude": sum(1 for it in items if (it.get("enr") or {}).get("claude"))},
        "markets": metrics["markets"], "portwatch": metrics["portwatch"], "pla": metrics["pla"], "sources": status, "gaps": gaps,
    }
    changes = diff_against_history(auto, merged, dash)
    auto["changes"] = changes
    if write:
        snap_path.write_text(json.dumps(snap, ensure_ascii=False))
        (dash / "intel.auto.json").write_text(json.dumps(auto, ensure_ascii=False, indent=1))
        (dash / "data").mkdir(exist_ok=True); (dash / "data" / "history").mkdir(exist_ok=True)
        (dash / "data" / "latest.json").write_text(json.dumps({"generated": auto["generated"], "events": merged[:400], "markets": metrics["markets"],
                                                                 "portwatch": metrics["portwatch"], "pla": metrics["pla"], "changes": changes}, ensure_ascii=False))
        (dash / "data" / "changes.json").write_text(json.dumps(changes, ensure_ascii=False, indent=1))
        rec = {"generated": auto["generated"], "event_ids": [e.get("id") or e.get("s") for e in merged if e.get("auto")][:800],
               "markets": {m["sym"]: m["v"] for m in metrics["markets"]}, "portwatch": {k: v.get("latest") for k, v in metrics["portwatch"].items()},
               "counts": auto["counts"], "sources_ok": sum(1 for s in status if s.get("ok")), "sources_total": len(status)}
        (dash / "data" / "history" / (now.strftime("%Y%m%dT%H%MZ") + ".json")).write_text(json.dumps(rec, ensure_ascii=False))
    return {"snapshot": snap, "auto": auto}


def diff_against_history(auto: dict, merged: list[dict], dash: Path) -> dict:
    hist = sorted((dash / "data" / "history").glob("*.json")) if (dash / "data" / "history").exists() else []
    if not hist:
        return {"since": None, "new_events": [e["id"] for e in merged if e.get("auto")][:50], "markets": [], "portwatch": []}
    prev = json.loads(hist[-1].read_text())
    prev_ids = set(prev.get("event_ids", []))
    new_ev = [e for e in merged if e.get("auto") and (e.get("id") or e.get("s")) not in prev_ids]
    mk = []
    for m in auto["markets"]:
        p = prev.get("markets", {}).get(m["sym"])
        if p and m["v"]:
            pct = (m["v"] / p - 1) * 100
            if abs(pct) >= 0.5:
                mk.append({"l": m["l"], "from": p, "to": m["v"], "pct": round(pct, 1)})
    pw = []
    for k, v in auto["portwatch"].items():
        p = (prev.get("portwatch") or {}).get(k)
        cur = v.get("latest")
        if p and cur and p.get("n_total") is not None and cur.get("n_total") is not None and cur["d"] != p.get("d"):
            pw.append({"choke": k, "from": p["n_total"], "to": cur["n_total"], "d": cur["d"]})
    return {"since": prev.get("generated"), "new_events": [e["id"] for e in new_ev][:80], "new_count": len(new_ev), "markets": mk, "portwatch": pw}
