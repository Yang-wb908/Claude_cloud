"""Paper book: mark analyst trade theses to market with the daily series.

dashboard/data/book.json   the theses (opened/closed through the `trade` issue form or by editing the file)
dashboard/data/book_mtm.json  marked-to-market view written by `run.py book`: P&L, stop/target distance, hit rate, attribution by scenario

A thesis: {id, d, cm (commodity id), side: long|short, entry (price or null = first close on/after d), size (1 = unit),
           stop, target (prices or null), thesis, scn: [scenario ids], judg: [judgment ids], status: open|closed, exit, exit_d, note, by}
Series symbols come from SCEN.assets[cm].sym; a commodity without a symbol is kept but not marked.
"""

from __future__ import annotations

import bisect
import json
from datetime import UTC, datetime
from pathlib import Path

from .forecast import load_js


def _close_on_or_after(s: dict, date: str):
    i = bisect.bisect_left(s["d"], date)
    return (s["d"][i], s["c"][i]) if i < len(s["c"]) else (None, None)


def _close_on_or_before(s: dict, date: str):
    i = bisect.bisect_right(s["d"], date) - 1
    return (s["d"][i], s["c"][i]) if i >= 0 else (None, None)


def mark(dash: Path, src_dir: Path | None = None, write: bool = True) -> dict:
    src_dir = src_dir or dash
    scen = load_js(src_dir, "scenario.js", "SCEN")
    book_p = dash / "data" / "book.json"
    book = json.loads(book_p.read_text()) if book_p.exists() else {"items": []}
    series = json.loads((dash / "data" / "series.json").read_text()).get("series", {}) if (dash / "data" / "series.json").exists() else {}
    today = datetime.now(UTC).strftime("%Y-%m-%d")
    items, changed = [], False
    for t in book["items"]:
        a = scen["assets"].get(t["cm"]) or {}
        sym = a.get("sym"); s = series.get(sym) if sym else None
        sign = -1 if t.get("side") == "short" else 1
        row = {**t, "sym": sym, "bp": bool(a.get("bp"))}
        if s:
            if t.get("entry") is None:
                d, c = _close_on_or_after(s, t["d"])
                if c is not None:
                    t["entry"] = c; t["entry_d"] = d; row["entry"] = c; row["entry_d"] = d; changed = True
            if t.get("entry") is not None:
                last_d, last = _close_on_or_before(s, today) if t.get("status") == "open" else _close_on_or_before(s, t.get("exit_d") or today)
                px = t.get("exit") if t.get("status") == "closed" and t.get("exit") is not None else last
                if px is not None:
                    pnl = (px - t["entry"]) * 100 * sign if row["bp"] else (px / t["entry"] - 1) * 100 * sign
                    row.update({"last": px, "last_d": last_d, "pnl": round(pnl * t.get("size", 1), 2), "pnl_raw": round(pnl, 2)})
                    # stop / target distance and automatic close when the daily close crosses them
                    for key in ("stop", "target"):
                        lvl = t.get(key)
                        if lvl is not None and t["entry"]:
                            row[key + "_dist"] = round((lvl / px - 1) * 100 * sign if not row["bp"] else (lvl - px) * 100 * sign, 2)
                    if t.get("status") == "open":
                        hit = None
                        if t.get("stop") is not None and ((sign > 0 and px <= t["stop"]) or (sign < 0 and px >= t["stop"])):
                            hit = "stop"
                        elif t.get("target") is not None and ((sign > 0 and px >= t["target"]) or (sign < 0 and px <= t["target"])):
                            hit = "target"
                        if hit:
                            t.update({"status": "closed", "exit": px, "exit_d": last_d, "auto_closed": hit}); row.update({"status": "closed", "exit": px, "exit_d": last_d, "auto_closed": hit}); changed = True
                    days = None
                    if row.get("entry_d") or t.get("d"):
                        try:
                            days = (datetime.fromisoformat(last_d) - datetime.fromisoformat(row.get("entry_d") or t["d"])).days
                        except Exception:  # noqa: BLE001
                            days = None
                    row["days"] = days
        items.append(row)
    closed = [r for r in items if r.get("status") == "closed" and r.get("pnl") is not None]
    opened = [r for r in items if r.get("status") == "open" and r.get("pnl") is not None]
    attrib: dict[str, dict] = {}
    for r in items:
        if r.get("pnl") is None:
            continue
        for sid in r.get("scn") or ["(none)"]:
            a = attrib.setdefault(sid, {"n": 0, "pnl": 0.0})
            a["n"] += 1; a["pnl"] = round(a["pnl"] + r["pnl"], 2)
    out = {"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "items": items,
           "summary": {"open": len([r for r in items if r.get("status") == "open"]), "closed": len(closed), "unmarked": len([r for r in items if r.get("pnl") is None]),
                       "open_pnl": round(sum(r["pnl"] for r in opened), 2), "closed_pnl": round(sum(r["pnl"] for r in closed), 2),
                       "hit_rate": round(sum(1 for r in closed if r["pnl"] > 0) / len(closed), 3) if closed else None,
                       "avg_win": round(sum(r["pnl"] for r in closed if r["pnl"] > 0) / max(1, sum(1 for r in closed if r["pnl"] > 0)), 2) if closed else None,
                       "avg_loss": round(sum(r["pnl"] for r in closed if r["pnl"] <= 0) / max(1, sum(1 for r in closed if r["pnl"] <= 0)), 2) if closed else None},
           "attribution": attrib}
    if write:
        if changed:
            book_p.write_text(json.dumps(book, ensure_ascii=False, indent=1))
        (dash / "data" / "book_mtm.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    return out


def markdown(m: dict) -> str:
    s = m["summary"]
    L = [f"## 페이퍼 북 {m['generated'][:10]}", f"열림 {s['open']} · 닫힘 {s['closed']} · 미평가 {s['unmarked']} · 열린 P&L {s['open_pnl']:+.2f}% · 닫힌 P&L {s['closed_pnl']:+.2f}%" + (f" · 적중률 {s['hit_rate']:.0%}" if s['hit_rate'] is not None else ""), "",
         "| id | 상품 | 방향 | 진입 | 현재 | P&L | 손절까지 | 목표까지 | 상태 |", "|---|---|---|---|---|---|---|---|---|"]
    for r in m["items"]:
        L.append(f"| {r['id']} | {r['cm']} | {r.get('side')} | {r.get('entry', '—')} | {r.get('last', '—')} | {r.get('pnl', '—')} | {r.get('stop_dist', '—')} | {r.get('target_dist', '—')} | {r.get('status')}{' (' + r['auto_closed'] + ')' if r.get('auto_closed') else ''} |")
    return "\n".join(L)
