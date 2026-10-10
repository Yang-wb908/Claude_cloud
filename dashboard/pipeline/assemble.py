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
    # metric 항목(COT·FBX 등)은 여러 행이 같은 안내 URL을 쓰므로 수집원+제목으로 구분한다
    key = (it.get("sid", "") + "|" + _norm(it.get("title", ""))) if it.get("kind") == "metric" else (it.get("url") or (it.get("sid", "") + "|" + _norm(it.get("title", ""))))
    return "a" + hashlib.sha1(key.encode()).hexdigest()[:10]


def to_event(it: dict) -> dict | None:
    e = it.get("enr") or {}
    if it.get("kind") not in ("news", "report") or e.get("rel", 0) < 2:
        return None
    return {"d": it["published"][:10], "t": e.get("t") or "D", "at": e.get("at"), "th": e.get("th"), "p": e.get("p") or "", "x": e.get("x") or it["title"][:140],
            "s": it.get("url") or "", "g": it.get("grade"), "src": it.get("sid"), "lang": e.get("lang", "en"), "auto": True, "id": it["id"], "r": int(e.get("rel", 2))}


_TOK = re.compile(r"[a-z0-9가-힣]{3,}")
STOPW = set("the and for with from that this into after over under says said amid news live update reuters".split())


def _toks(s: str) -> set[str]:
    return {t for t in _TOK.findall((s or "").lower()) if t not in STOPW}


def _dom(e: dict) -> str:
    m = re.match(r"https?://(?:www\.)?([^/]+)", e.get("s") or "")
    return m.group(1) if m else (e.get("src") or "")


# 센서·정형 데이터 사건은 문장 틀이 같아 서로 다른 사건(다른 태풍·다른 지진)이 '중복'으로 묶여 사라질 수 있다 → 묶지 않는다
SENSOR_SRC = {"firms", "ioda", "usgs", "gdacs", "ofac", "adsb", "cisa_kev", "ransomware"}
KINETIC = {"S", "G", "A", "M"}


def corroborate(events: list[dict], window_days: int = 1, jaccard: float = 0.45) -> list[dict]:
    """Cluster near-duplicate reports (same theater, dates within `window_days`, token overlap or same place+type) across
    distinct source domains. Each event gets cc (independent domains) and its Admiralty credibility digit becomes 1 when
    corroborated by >= 2 other domains, 2 when by one, otherwise unchanged. The cluster keeps every report (no deletion)."""
    ev = [e for e in events if e.get("x") and e.get("src") not in SENSOR_SRC]
    toks = [_toks(e["x"]) for e in ev]
    n = len(ev)
    parent = list(range(n))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]; i = parent[i]
        return i

    by_th: dict[str, list[int]] = {}
    for i, e in enumerate(ev):
        by_th.setdefault(e.get("th") or "_", []).append(i)
    for idxs in by_th.values():
        for a in range(len(idxs)):
            i = idxs[a]
            for b in range(a + 1, len(idxs)):
                j = idxs[b]
                try:
                    dd = abs((datetime.fromisoformat(ev[i]["d"]) - datetime.fromisoformat(ev[j]["d"])).days)
                except ValueError:
                    continue
                if dd > window_days:
                    continue
                same_place = ev[i].get("p") and ev[i].get("p") == ev[j].get("p") and ev[i].get("t") == ev[j].get("t")
                inter = len(toks[i] & toks[j]); union = len(toks[i] | toks[j]) or 1
                if same_place or inter / union >= jaccard:
                    parent[find(i)] = find(j)
    groups: dict[int, list[int]] = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    for root, members in groups.items():
        doms = {_dom(ev[i]) for i in members if _dom(ev[i])}
        cc = max(1, len(doms))
        for i in members:
            e = ev[i]
            e["cc"] = cc
            e["_c"] = root
            g = e.get("g") or ""
            if cc >= 3 and len(g) == 2 and g[1] > "1":
                e["g"], e["g0"] = g[0] + "1", e.get("g0") or g
            elif cc == 2 and len(g) == 2 and g[1] > "2":
                e["g"], e["g0"] = g[0] + "2", e.get("g0") or g
    return events


def _hav(a: list[float], b: list[float]) -> float:
    import math
    lo1, la1, lo2, la2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def load_gazetteer() -> dict[str, list[float]]:
    p = Path(__file__).resolve().parent / "gazetteer.json"
    out = {}
    for g in (json.loads(p.read_text()) if p.exists() else []):
        for k in (g.get("ko"), g.get("en")):
            if k:
                out[k.strip().lower()] = [g["lon"], g["lat"]]
    return out


def quality_pass(events: list[dict], gaz: dict[str, list[float]], geo_fix_km: float = 600) -> dict:
    """뉴스 사건 품질 점검(센서 사건 제외).
    - 위치: 지명(p)이 지명 사전에 있으면 좌표가 없을 때 채우고(geo=gaz), Claude 가 준 좌표가 지명과 600km 넘게 어긋나면 사전 좌표로 고친다(geo=fixed).
    - 신뢰: 국가 선전 매체(D·E·F) → q=lowcred, 교차확인 없는(cc=1) 교전·공격·해상 주장이 확인 등급(1·2)도 아니면 → q=single.
    """
    st = {"geo_filled": 0, "geo_fixed": 0, "single": 0, "lowcred": 0, "checked": 0}
    for e in events:
        if not e.get("auto") or e.get("src") in SENSOR_SRC:
            continue
        st["checked"] += 1
        p = (e.get("p") or "").strip().lower()
        g_at = gaz.get(p) if p else None
        if g_at:
            if not e.get("at"):
                e["at"], e["geo"] = g_at, "gaz"; st["geo_filled"] += 1
            elif _hav(e["at"], g_at) > geo_fix_km:
                e["at"], e["geo"] = g_at, "fixed"; st["geo_fixed"] += 1
        g = e.get("g") or ""
        q = None
        if g[:1] in ("D", "E", "F"):
            q = "lowcred"
        elif (e.get("cc") or 1) <= 1 and e.get("t") in KINETIC and len(g) == 2 and g[1] >= "3":
            q = "single"
        if q:
            e["q"] = q; st[q] += 1
        else:
            e.pop("q", None)
    return st


def source_scores(events: list[dict], status: list[dict], keep_days: int = 30, now: datetime | None = None) -> dict:
    """Per source id: items in window, share corroborated by another domain, mean credibility digit; a reliability hint."""
    now = now or datetime.now(UTC)
    cutoff = (now - timedelta(days=keep_days)).strftime("%Y-%m-%d")
    agg: dict[str, dict] = {}
    for e in events:
        sid = e.get("src")
        if not sid or e.get("d", "") < cutoff:
            continue
        a = agg.setdefault(sid, {"n": 0, "corr": 0, "cred": []})
        a["n"] += 1
        if (e.get("cc") or 1) >= 2:
            a["corr"] += 1
        g = e.get("g") or ""
        if len(g) == 2 and g[1].isdigit():
            a["cred"].append(int(g[1]))
    out = {}
    ok = {s["id"]: s.get("ok") for s in status}
    for sid, a in agg.items():
        share = a["corr"] / a["n"] if a["n"] else 0
        out[sid] = {"n": a["n"], "corroborated": round(share, 2), "cred": round(sum(a["cred"]) / len(a["cred"]), 2) if a["cred"] else None,
                    "hint": "교차확인 높음" if a["n"] >= 5 and share >= 0.5 else "단독 보도 많음" if a["n"] >= 5 and share < 0.2 else "표본 적음", "ok": ok.get(sid)}
    return out


def collapse_duplicates(events: list[dict], max_alt: int = 6) -> list[dict]:
    """After corroborate(): keep one report per cluster (best credibility digit, then the longer summary) and fold the other
    automatic reports' URLs into `alt` so the board shows one row with '교차 ×n' and the other sources. Manual events are never dropped."""
    groups: dict = {}
    for e in events:
        groups.setdefault(e.pop("_c", id(e)), []).append(e)
    out = []
    for members in groups.values():
        auto = [m for m in members if m.get("auto")]
        manual = [m for m in members if not m.get("auto")]
        out += manual
        if not auto:
            continue
        auto.sort(key=lambda m: ((m.get("g") or "C9")[1:], -len(m.get("x") or "")))
        keep, rest = auto[0], auto[1:]
        alt = list(dict.fromkeys([u for u in (keep.get("alt") or []) + [m.get("s") for m in rest] + [u for m in rest for u in (m.get("alt") or [])] if u and u != keep.get("s")]))
        if alt:
            keep["alt"] = alt[:max_alt]
        out.append(keep)
    out.sort(key=lambda e: e.get("d", ""), reverse=True)
    return out


def merge_events(existing: list[dict], new: list[dict], now: datetime, keep_days: int = 30, per_day_theater: int = 12) -> list[dict]:
    cutoff = (now - timedelta(days=keep_days)).strftime("%Y-%m-%d")
    seen_url = {e.get("s") for e in existing if e.get("s")} | {u for e in existing for u in (e.get("alt") or [])}
    seen_txt = {(e.get("d"), _norm(e.get("x", ""))) for e in existing}
    out = [e for e in existing if not e.get("auto") or e.get("d", "") >= cutoff]
    added = 0
    counts: dict[tuple, int] = {}
    for e in sorted(new, key=lambda x: (x["d"], x.get("r", 2)), reverse=True):  # 같은 날은 관련도 높은 사건부터 (전역·일 한도에 걸릴 때 핵심 사건 우선)
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
    markets, pw, pla, cot, enso, fbx, sar = [], {}, [], [], None, [], []
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
        elif ex.get("metric") == "cot":
            cot.append({"market": ex["market"], "d": ex["date"], "net": ex["mm_net"], "long": ex["mm_long"], "short": ex["mm_short"], "chg": ex.get("net_chg"), "oi": ex.get("oi")})
        elif ex.get("metric") == "enso":
            enso = {"d": ex["date"], "status": ex.get("status"), "synopsis": ex.get("synopsis")}
        elif ex.get("metric") == "fbx":
            fbx.append({"lane": ex["lane"], "v": ex["value"], "d": ex["date"]})
        elif ex.get("metric") == "sar":
            sar.append({"aoi": ex["aoi"], "d": ex["date"], "ships": ex["ships"], "product": ex.get("product"), "src": it.get("url")})
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
    return {"markets": markets, "portwatch": pw, "pla": pla, "cot": cot, "enso": enso, "fbx": fbx, "sar": sar}


def assemble(items: list[dict], status: list[dict], now: datetime | None = None, dash: Path = DASH, write: bool = True) -> dict:
    now = now or datetime.now(UTC)
    snap_path = dash / "data_snapshot.json"
    snap = json.loads(snap_path.read_text()) if snap_path.exists() else {"events": [], "cities": [], "lanes": [], "chokepoints": [], "markets": {}}
    new_events = [ev for ev in (to_event(it) for it in items) if ev]
    merged, added = merge_events(snap.get("events", []), new_events, now)
    n_before = len(merged)
    merged = collapse_duplicates(corroborate(merged))
    qst = quality_pass(merged, load_gazetteer())
    qst.update({"collapsed": n_before - len(merged), "events": len(merged), "generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "auto_with_coords": sum(1 for e in merged if e.get("auto") and e.get("at")), "auto": sum(1 for e in merged if e.get("auto"))})
    if write:
        (dash / "data").mkdir(exist_ok=True)
        (dash / "data" / "quality.json").write_text(json.dumps(qst, ensure_ascii=False, indent=1))
    snap["events"] = merged
    snap["auto_generated"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    metrics = metrics_from(items)
    # a category empty in this run keeps the previous run's values (a single failed fetch must not blank the board)
    prev_auto = json.loads((dash / "intel.auto.json").read_text()) if (dash / "intel.auto.json").exists() else {}
    for k in ("markets", "portwatch", "pla", "cot", "fbx", "sar"):
        if not metrics.get(k) and prev_auto.get(k):
            metrics[k] = prev_auto[k]
    if metrics.get("enso") is None and prev_auto.get("enso"):
        metrics["enso"] = prev_auto["enso"]
    scores = source_scores(merged, status, now=now)
    gaps = [f"{s['name']}: {s['err']}" for s in status if not s.get("ok")]
    auto = {
        "generated": snap["auto_generated"], "counts": {"raw": len(items), "candidates": len(new_events), "added": added,
                                                         "claude": sum(1 for it in items if (it.get("enr") or {}).get("claude"))},
        "markets": metrics["markets"], "portwatch": metrics["portwatch"], "pla": metrics["pla"], "cot": metrics["cot"], "enso": metrics["enso"], "fbx": metrics["fbx"], "sar": metrics.get("sar", []), "sources": status, "source_scores": scores, "gaps": gaps,
    }
    changes = diff_against_history(auto, merged, dash)
    auto["changes"] = changes
    series = {it["extra"]["sym"]: {"l": it["extra"]["label"], "d": it["extra"]["dates"], "c": it["extra"]["closes"]} for it in items if it.get("kind") == "series"}
    if write:
        if series:
            (dash / "data").mkdir(exist_ok=True)
            (dash / "data" / "series.json").write_text(json.dumps({"generated": snap["auto_generated"], "series": series}, ensure_ascii=False))
        write_badges(dash, metrics, snap)
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


def write_badges(dash: Path, metrics: dict, snap: dict) -> None:
    """shields.io endpoint JSON (README badges read these from GitHub Pages)."""
    out = dash / "data" / "badges"
    out.mkdir(parents=True, exist_ok=True)
    sym = {m["sym"]: m for m in metrics.get("markets", [])}
    def badge(name, label, msg, color):
        (out / f"{name}.json").write_text(json.dumps({"schemaVersion": 1, "label": label, "message": str(msg), "color": color}, ensure_ascii=False))
    for name, s, label, unit, hi, lo in [("brent", "BZ=F", "Brent", "$", 100, 85), ("ttf", "TTF=F", "TTF", "€", 60, 35), ("wheat", "ZW=F", "Wheat", "¢", 700, 550), ("vix", "^VIX", "VIX", "", 25, 15), ("krw", "KRW=X", "USD/KRW", "₩", 1400, 1300)]:
        m = sym.get(s)
        if m and m.get("v") is not None:
            v = m["v"]
            badge(name, label, f"{unit}{v:,.2f} {m.get('chg','')}".strip(), "red" if v >= hi else "green" if v <= lo else "yellow")
    ev = snap.get("events", [])
    badge("events", "events 7d", sum(1 for e in ev if e.get("d", "") >= (datetime.now(UTC) - timedelta(days=7)).strftime("%Y-%m-%d")), "blue")
    badge("updated", "updated", snap.get("auto_generated", "")[:16].replace("T", " ") + "Z", "informational")
