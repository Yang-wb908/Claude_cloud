"""New collection domains, keyless, run with every 6-hour collection:

- Military aircraft (adsb.lol /v2/mil): aircraft broadcasting ADS-B with military flags, counted per area of interest and
  role (ISR, tanker, bomber, airlift, maritime patrol). Many military aircraft fly with transponders off, so this is a floor,
  not a count. Each area learns its own baseline from past runs; an ISR+tanker surge well above it becomes an event.
- Cyber, CISA KEV: vulnerabilities newly confirmed as exploited in the wild. Edge devices and ransomware-linked ones become
  events (type Y).
- Cyber, ransomware.live: victims posted on leak sites in the last 7 days, counted by country; Korean victims become events.

Writes data/domains.json (+ data/adsb_history.json, data/kev_ids.json). Each part fails independently and keeps its
previous value.
"""

from __future__ import annotations

import json
import logging
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path
from statistics import median

from . import fetch
from .openfeeds import COUNTRY, _ev, _get_json

log = logging.getLogger("pipeline.domains")

ADSB_MIL = "https://api.adsb.lol/v2/mil"
KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
RW_URL = "https://api.ransomware.live/v2/recentvictims"

# [west, south, east, north], theater
AOIS = {
    "taiwan": ("대만해협·남중국해 북부", [114.0, 18.0, 126.0, 27.5], "taiwan"),
    "scs": ("남중국해", [108.0, 4.0, 121.0, 18.0], "scs"),
    "korea": ("한반도 주변", [123.0, 33.0, 132.0, 40.5], "korea"),
    "gulf": ("페르시아만·오만만", [47.0, 22.0, 60.0, 30.5], "iran"),
    "redsea": ("홍해·아덴만", [32.0, 11.0, 46.0, 28.0], "yemen"),
    "emed": ("동지중해", [28.0, 30.5, 37.0, 37.5], "gaza"),
    "blacksea": ("흑해", [27.0, 40.5, 42.0, 47.5], "ukraine"),
    "baltic": ("발트해", [9.0, 53.5, 30.5, 61.0], "europe"),
    "carib": ("카리브해(베네수엘라 앞)", [-75.0, 9.0, -58.0, 18.5], "carib"),
}
ROLE = [  # (role, type-code regex) — ICAO type designators seen on adsb.lol
    ("isr", r"^(R135|RC35|E3TF|E3CF|E8|E6|E737|E2|P8|P3|GLF5|GLEX|Q4|RQ4|GLHK|Q9|MQ9|U2|EP3|C30J-ISR|BE35|DHC8-ISR|CL60)$"),
    ("tanker", r"^(K35R|K35E|KC10|KC46|K46|B762|A332|MRTT|A310|KC30|K767|IL78|KC39)$"),  # B762 군용 = KC-46·KC-767
    ("bomber", r"^(B52|B1|B2|TU95|TU22|TU160|H6)$"),
    ("airlift", r"^(C17|C5M|C5|C130|C30J|A400|IL76|KC390|C2)$"),
]
ROLE_KO = {"isr": "정찰·감시", "tanker": "공중급유", "bomber": "폭격기", "airlift": "수송", "other": "기타 군용"}
SURGE_MIN_RUNS = 8
EDGE_VENDORS = re.compile(r"Ivanti|Fortinet|Palo Alto|Cisco|Citrix|SonicWall|Juniper|F5|Check Point|VMware|Barracuda|Zyxel|SAP|Microsoft Exchange|Atlassian|Progress|Veeam|Oracle E-Business", re.I)


def _in(b: list[float], lon: float, lat: float) -> bool:
    return b[0] <= lon <= b[2] and b[1] <= lat <= b[3]


def role_of(t: str) -> str:
    t = (t or "").upper()
    for r, rx in ROLE:
        if re.match(rx, t):
            return r
    return "other"


def summarize_adsb(payload: dict) -> dict:
    """{aoi: {n, by_role:{}, ac:[{flight,t,role,lat,lon,alt}]}} for aircraft inside each AOI."""
    out = {k: {"n": 0, "by_role": {}, "ac": []} for k in AOIS}
    for a in (payload or {}).get("ac", []) or []:
        try:
            lat, lon = float(a["lat"]), float(a["lon"])
        except (KeyError, TypeError, ValueError):
            continue
        r = role_of(a.get("t"))
        for k, (_, b, _) in AOIS.items():
            if _in(b, lon, lat):
                o = out[k]
                o["n"] += 1
                o["by_role"][r] = o["by_role"].get(r, 0) + 1
                if len(o["ac"]) < 25:
                    o["ac"].append({"flight": (a.get("flight") or "").strip(), "t": a.get("t") or "", "role": r, "lat": round(lat, 2), "lon": round(lon, 2),
                                    "alt": a.get("alt_baro"), "reg": a.get("r") or ""})
    return out


def judge_adsb(cur: dict, hist: list[dict]) -> dict:
    """ISR+급유기 수를 같은 지역 과거 실행들의 중앙값과 비교."""
    res = {}
    for k, (name, b, th) in AOIS.items():
        key = cur[k]["by_role"].get("isr", 0) + cur[k]["by_role"].get("tanker", 0)
        base = [h["aoi"].get(k, {}).get("key", 0) for h in hist]
        med = median(base) if base else None
        status = "learning" if len(base) < SURGE_MIN_RUNS else ("surge" if key >= max(3, 2 * med + 1) else "normal")
        res[k] = {"name": name, "th": th, "bbox": b, "n": cur[k]["n"], "key": key, "base": med, "runs": len(base), "status": status,
                  "by_role": cur[k]["by_role"], "ac": cur[k]["ac"]}
    return res


def adsb_events(areas: dict, now: datetime) -> list[dict]:
    ev, d = [], now.strftime("%Y-%m-%d")
    for k, a in areas.items():
        if a["status"] != "surge":
            continue
        b = a["bbox"]
        types = ", ".join(sorted({f"{x['t']}" for x in a["ac"] if x["role"] in ("isr", "tanker") and x["t"]}))[:80]
        x = f"군용기 활동 급증: {a['name']}에서 정찰·급유기 {a['key']}대 (평소 {a['base']:.0f}대, 공개 ADS-B 기준){' · ' + types if types else ''}. 작전 준비·감시 강화 가능"
        ev.append(_ev(d, "M", [round((b[0] + b[2]) / 2, 2), round((b[1] + b[3]) / 2, 2)], a["th"], a["name"], x,
                      f"https://globe.adsb.lol/?lat={(b[1] + b[3]) / 2:.2f}&lon={(b[0] + b[2]) / 2:.2f}&zoom=6&mil#{d}-{k}", "B2", "adsb", f"adsb-{k}-{d}"))
    return ev


def fetch_adsb(dash: Path, now: datetime) -> dict:
    cur = summarize_adsb(_get_json(ADSB_MIL, timeout=40))
    hp = dash / "data" / "adsb_history.json"
    hist = json.loads(hp.read_text()) if hp.exists() else []
    cut = (now - timedelta(days=14)).strftime("%Y-%m-%dT%H")
    hist = [h for h in hist if h["at"] >= cut]
    areas = judge_adsb(cur, hist)
    hist.append({"at": now.strftime("%Y-%m-%dT%H:%M"), "aoi": {k: {"n": v["n"], "key": v["key"]} for k, v in areas.items()}})
    hp.write_text(json.dumps(hist[-200:], separators=(",", ":")))
    return {"areas": areas, "n_surge": sum(1 for a in areas.values() if a["status"] == "surge"), "total_mil": sum(v["n"] for v in cur.values())}


# ── CISA KEV ─────────────────────────────────────────────────────────────────
def parse_kev(payload: dict) -> list[dict]:
    out = []
    for v in (payload or {}).get("vulnerabilities", []):
        if v.get("cveID"):
            out.append({"cve": v["cveID"], "vendor": v.get("vendorProject") or "", "product": v.get("product") or "", "name": v.get("vulnerabilityName") or "",
                        "added": v.get("dateAdded") or "", "due": v.get("dueDate") or "", "ransom": (v.get("knownRansomwareCampaignUse") or "").lower() == "known"})
    return out


def fetch_kev(dash: Path, now: datetime) -> dict:
    rows = parse_kev(_get_json(KEV_URL, timeout=60))
    if len(rows) < 500:
        raise RuntimeError(f"KEV 행 수 이상 ({len(rows)})")
    cut = (now - timedelta(days=14)).strftime("%Y-%m-%d")
    recent = sorted([r for r in rows if r["added"] >= cut], key=lambda r: r["added"], reverse=True)
    for r in recent:
        r["edge"] = bool(EDGE_VENDORS.search(r["vendor"] + " " + r["product"]))
    return {"n_total": len(rows), "recent": recent[:40], "n_recent": len(recent), "n_week": sum(1 for r in recent if r["added"] >= (now - timedelta(days=7)).strftime("%Y-%m-%d"))}


def kev_events(data: dict, now: datetime) -> list[dict]:
    ev, cut = [], (now - timedelta(days=3)).strftime("%Y-%m-%d")
    for r in data.get("recent", []):
        if r["added"] < cut or not (r["edge"] or r["ransom"]):
            continue
        x = f"악용 확인 취약점 추가(CISA KEV): {r['vendor']} {r['product']} {r['cve']} — {r['name']}" + (" · 랜섬웨어 사용 확인" if r["ransom"] else " · 경계 장비(VPN·방화벽 등), 국내 기관도 즉시 패치 대상")
        ev.append(_ev(r["added"], "Y", None, None, "CISA", x[:220], f"https://nvd.nist.gov/vuln/detail/{r['cve']}", "A1", "cisa_kev", f"kev-{r['cve']}", 3 if r["ransom"] else 2))
    return ev


# ── ransomware.live ──────────────────────────────────────────────────────────
def parse_rw(payload) -> list[dict]:
    items = payload if isinstance(payload, list) else (payload or {}).get("victims") or (payload or {}).get("data") or []
    out = []
    for v in items:
        if not isinstance(v, dict):
            continue
        d = str(v.get("discovered") or v.get("attackdate") or v.get("published") or "")[:10]
        out.append({"victim": (v.get("victim") or v.get("post_title") or "").strip(), "group": v.get("group") or v.get("group_name") or "",
                    "country": (v.get("country") or "").upper()[:2], "sector": v.get("activity") or v.get("sector") or "", "d": d,
                    "url": v.get("url") or v.get("permalink") or ""})
    return [x for x in out if x["victim"] and x["d"]]


def summarize_rw(rows: list[dict], now: datetime) -> dict:
    cut = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    week = [r for r in rows if r["d"] >= cut]
    by_c: dict[str, int] = {}
    by_g: dict[str, int] = {}
    for r in week:
        by_c[r["country"] or "??"] = by_c.get(r["country"] or "??", 0) + 1
        by_g[r["group"] or "?"] = by_g.get(r["group"] or "?", 0) + 1
    return {"n_week": len(week), "by_country": dict(sorted(by_c.items(), key=lambda kv: -kv[1])[:15]),
            "by_group": dict(sorted(by_g.items(), key=lambda kv: -kv[1])[:10]), "kr": [r for r in week if r["country"] == "KR"][:20]}


def rw_events(data: dict) -> list[dict]:
    ev = []
    for r in data.get("kr", []):
        x = f"랜섬웨어 피해 게시(한국): {r['victim']} — {r['group']} 유출 사이트{(' · ' + r['sector']) if r['sector'] else ''}. 피해 사실은 미확인(범죄 집단 주장)"
        lon, lat = COUNTRY["KR"][1], COUNTRY["KR"][2]
        ev.append(_ev(r["d"], "Y", [lon, lat], "korea", r["victim"][:40], x[:220], f"https://www.ransomware.live/search/{re.sub(r'[^A-Za-z0-9]+', '%20', r['victim'])[:60]}#{r['d']}-{re.sub(r'[^A-Za-z0-9]+', '-', r['victim'])[:30]}",
                      "D4", "ransomware", f"rw-{r['d']}-{re.sub(r'[^A-Za-z0-9]+', '-', r['victim'])[:30]}", 2))
    return ev


# ── run ──────────────────────────────────────────────────────────────────────
def run(dash: Path, now: datetime | None = None) -> dict:
    now = now or datetime.now(UTC)
    path = dash / "data" / "domains.json"
    prev = json.loads(path.read_text()) if path.exists() else {}
    doc = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ")}
    jobs = (("adsb", lambda: fetch_adsb(dash, now)), ("kev", lambda: fetch_kev(dash, now)),
            ("ransom", lambda: summarize_rw(parse_rw(_get_json(RW_URL, timeout=40)), now)))
    for name, fn in jobs:
        try:
            doc[name] = {"ok": True, "at": doc["generated"], "data": fn()}
        except Exception as e:  # noqa: BLE001
            log.warning("domains %s failed: %s", name, e)
            doc[name] = {**(prev.get(name) or {}), "ok": False, "err": f"{type(e).__name__}: {str(e)[:400]}"}
    events = []
    if doc["adsb"].get("ok"):
        events += adsb_events(doc["adsb"]["data"]["areas"], now)
    if doc["kev"].get("ok"):
        events += kev_events(doc["kev"]["data"], now)
    if doc["ransom"].get("ok"):
        events += rw_events(doc["ransom"]["data"])
    g = lambda k, f, d=0: f((doc[k].get("data") or {})) if doc[k].get("ok") else d
    doc["summary"] = {"adsb_surge": g("adsb", lambda x: x.get("n_surge", 0)), "kev_week": g("kev", lambda x: x.get("n_week", 0)),
                      "kev_edge_3d": g("kev", lambda x: sum(1 for r in x.get("recent", []) if r.get("edge") and r["added"] >= (now - timedelta(days=3)).strftime("%Y-%m-%d"))),
                      "ransom_week": g("ransom", lambda x: x.get("n_week", 0)), "ransom_kr_week": g("ransom", lambda x: len(x.get("kr", []))), "events": len(events)}
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    if events:
        from . import assemble
        snap_path = dash / "data_snapshot.json"
        snap = json.loads(snap_path.read_text()) if snap_path.exists() else {"events": []}
        merged, added = assemble.merge_events(snap.get("events", []), events, now)
        snap["events"] = merged
        snap_path.write_text(json.dumps(snap, ensure_ascii=False))
        log.info("domains: %d events (%d new)", len(events), added)
    log.info("domains: %s", ", ".join(f"{k} {'ok' if doc[k].get('ok') else 'ERR'}" for k, _ in jobs))
    return doc
