"""Keyless open feeds collected with every 6-hour run:

- IODA (Georgia Tech): national internet outages (BGP, active probing, telescope). Big outages in watched countries
  become events — shutdowns often precede crackdowns, coups and offensives.
- Polymarket (Gamma API): live prediction-market probabilities, matched to our scenarios via prediction_map.yaml.
- USGS: M6+ earthquakes anywhere and M5+ within 300 km of watched sites or chokepoints.
- GDACS: orange/red disaster alerts (cyclones, floods, quakes, volcanoes, droughts, wildfires).
- OFAC: the SDN list is diffed against the previous run; new designations (with vessels called out) become events.

Writes data/openfeeds.json (+ data/ofac_sdn_ids.json for the diff baseline) and merges events into the board.
Every part fails independently and keeps its previous value.
"""

from __future__ import annotations

import csv
import io
import json
import logging
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path

import yaml

from . import fetch
from .firms import haversine_km, load_watch

log = logging.getLogger("pipeline.openfeeds")
HERE = Path(__file__).resolve().parent

# ISO2 → (theater, lon, lat)
COUNTRY = {
    "IR": ("iran", 53.7, 32.4), "IQ": ("iran", 43.7, 33.2), "RU": ("ukraine", 37.6, 55.8), "UA": ("ukraine", 31.2, 49.0), "BY": ("ukraine", 27.9, 53.7),
    "YE": ("yemen", 47.6, 15.6), "SA": ("yemen", 45.1, 23.9), "ET": ("ethiopia", 39.6, 9.1), "ER": ("ethiopia", 39.8, 15.2), "SD": ("sudan", 30.2, 15.6),
    "SS": ("sudan", 31.3, 7.0), "PS": ("gaza", 34.4, 31.5), "IL": ("gaza", 34.9, 31.0), "AF": ("afpak", 67.7, 33.9), "PK": ("afpak", 69.3, 30.4),
    "KP": ("korea", 127.5, 40.3), "KR": ("korea", 127.8, 36.5), "LB": ("lebanon", 35.9, 33.9), "SY": ("lebanon", 38.9, 34.8), "ML": ("sahel", -3.9, 17.6),
    "NE": ("sahel", 8.1, 17.6), "BF": ("sahel", -1.6, 12.2), "NG": ("sahel", 8.7, 9.1), "TD": ("sahel", 18.7, 15.5), "CD": ("drc", 21.8, -4.0),
    "RW": ("drc", 29.9, -1.9), "SO": ("somalia", 46.2, 5.2), "MM": ("myanmar", 96.0, 21.9), "TW": ("taiwan", 121.0, 23.7), "CN": ("taiwan", 104.2, 35.9),
    "PH": ("scs", 122.0, 12.9), "VN": ("scs", 108.3, 14.1), "VE": ("carib", -66.6, 6.4), "HT": ("carib", -72.3, 18.9), "CU": ("carib", -77.8, 21.5),
    "CO": ("carib", -74.3, 4.6), "BR": ("latam", -51.9, -14.2), "AR": ("latam", -63.6, -38.4), "CL": ("latam", -71.5, -35.7), "PE": ("latam", -75.0, -9.2),
    "BO": ("latam", -63.6, -16.3), "EC": ("latam", -78.2, -1.8), "US": ("namerica", -98.6, 39.8), "CA": ("namerica", -106.3, 56.1), "MX": ("namerica", -102.6, 23.6),
    "AU": ("oceania", 133.8, -25.3), "PG": ("oceania", 143.9, -6.3), "SB": ("oceania", 160.2, -9.6), "FJ": ("oceania", 178.1, -17.7), "EE": ("europe", 25.0, 58.6),
    "LV": ("europe", 24.6, 56.9), "LT": ("europe", 23.9, 55.2), "FI": ("europe", 25.7, 61.9), "SE": ("europe", 18.6, 60.1), "NO": ("europe", 8.5, 60.5),
    "DK": ("europe", 9.5, 56.3), "PL": ("europe", 19.1, 51.9), "DE": ("europe", 10.5, 51.2), "FR": ("europe", 2.2, 46.2), "GB": ("europe", -3.4, 55.4),
    "IN": ("southasia", 78.9, 21.0), "BD": ("southasia", 90.4, 23.7), "LK": ("southasia", 80.8, 7.9), "NP": ("southasia", 84.1, 28.4), "LY": ("sahel", 17.2, 26.3),
    "EG": ("gaza", 30.8, 26.8), "TR": ("lebanon", 35.2, 39.0), "JO": ("gaza", 36.2, 30.6), "AE": ("iran", 53.8, 23.4), "QA": ("iran", 51.2, 25.4),
    "OM": ("iran", 55.9, 21.5), "KW": ("iran", 47.5, 29.3), "BH": ("iran", 50.6, 26.0), "GE": ("ukraine", 43.4, 42.3), "AM": ("ukraine", 45.0, 40.1),
    "AZ": ("ukraine", 47.6, 40.1), "KE": ("somalia", 37.9, -0.02), "UG": ("drc", 32.3, 1.4), "CF": ("drc", 20.9, 6.6), "MZ": (None, 35.5, -18.7),
    "TN": ("sahel", 9.5, 33.9), "DZ": ("sahel", 1.7, 28.0), "HN": ("carib", -86.2, 15.2), "NI": ("carib", -85.2, 12.9), "GT": ("namerica", -90.2, 15.8),
    "VU": ("oceania", 167.0, -15.4), "TO": ("oceania", -175.2, -21.2), "NZ": ("oceania", 172.5, -41.5), "NC": ("oceania", 165.6, -21.3),
}
CHOKE_PTS = {"호르무즈": (56.5, 26.4), "바브엘만데브": (43.4, 12.6), "수에즈": (32.5, 30.0), "말라카": (103.8, 1.2), "대만해협": (120.0, 24.0),
             "보스포루스": (29.0, 41.1), "파나마": (-79.9, 9.1), "대한해협": (129.0, 34.3), "덴마크 해협": (12.6, 55.7)}
IODA_API = "https://api.ioda.inetintel.cc.gatech.edu/v2"
# 2026-10-09 첫 실측: 평시에도 gtr(구글 트래픽) 단독 이상치가 수천 점(리투아니아 4.5천, 아이티 6천)씩 나온다.
# 인프라 신호(BGP·핑) 가 IODA_MIN_SCORE 이상이거나, 어떤 신호든 IODA_ANY_SCORE 이상일 때만 경보.
IODA_MIN_SCORE = 2000.0
IODA_ANY_SCORE = 20000.0
POLY_API = "https://gamma-api.polymarket.com"
USGS_FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"
GDACS_API = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"
OFAC_CSV = ["https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV", "https://www.treasury.gov/ofac/downloads/sdn.csv"]
OFAC_PAGE = "https://ofac.treasury.gov/recent-actions"
PROGRAM_TH = [(r"IRAN|IRGC|IFSR", "iran"), (r"RUSSIA|UKRAINE|CAATSA - RUSSIA|BELARUS", "ukraine"), (r"DPRK|NORTH KOREA", "korea"), (r"VENEZUELA|CUBA", "carib"),
              (r"SYRIA|LEBANON|HIZBALLAH|HEZBOLLAH", "lebanon"), (r"YEMEN|HOUTHI|ANSARALLAH", "yemen"), (r"SUDAN", "sudan"), (r"ETHIOPIA", "ethiopia"),
              (r"BURMA|MYANMAR", "myanmar"), (r"DRCONGO|CONGO", "drc"), (r"SOMALIA", "somalia"), (r"MALI|SAHEL", "sahel"), (r"GAZA|HAMAS", "gaza")]


def _get_json(url: str, params=None, timeout: int = 40):
    r = fetch.session().get(url, params=params, timeout=timeout)
    if r.status_code >= 400:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    return r.json()


def _ev(d, t, at, th, p, x, s, g, src, ident, r=3):
    return {"d": d, "t": t, "at": at, "th": th, "p": p, "x": x, "s": s, "g": g, "src": src, "lang": "ko", "auto": True, "id": ident, "r": r}


# ── IODA ─────────────────────────────────────────────────────────────────────
def parse_ioda_summary(payload) -> list[dict]:
    rows = payload.get("data", payload) if isinstance(payload, dict) else payload
    out = []
    for r in rows or []:
        if not isinstance(r, dict):
            continue
        ent = r.get("entity") or {}
        code = (ent.get("code") or r.get("entityCode") or "").upper()
        scores = r.get("scores") or {}
        try:
            overall = float(scores.get("overall", r.get("score", 0)) or 0)
        except (TypeError, ValueError):
            continue
        if code:
            out.append({"code": code, "name": ent.get("name") or r.get("entityName") or code, "score": round(overall, 1),
                        "sources": {k: round(float(v), 1) for k, v in scores.items() if k != "overall" and isinstance(v, (int, float))},
                        "events": r.get("event_cnt") or r.get("eventCount")})
    out.sort(key=lambda x: -x["score"])
    return out


def fetch_ioda(now: datetime) -> dict:
    until = int(now.timestamp()); since = int((now - timedelta(hours=24)).timestamp())
    rows = parse_ioda_summary(_get_json(f"{IODA_API}/outages/summary", {"from": since, "until": until, "entityType": "country"}))
    for r in rows:
        th, lon, lat = COUNTRY.get(r["code"], (None, None, None))
        r["th"] = th
        r["at"] = [lon, lat] if lon is not None else None
        infra = max([v for k, v in r["sources"].items() if not k.startswith("gtr")], default=0)
        r["alert"] = bool(th) and (infra >= IODA_MIN_SCORE or r["score"] >= IODA_ANY_SCORE)
    return {"window_h": 24, "countries": rows[:30], "n_alerts": sum(1 for r in rows if r["alert"])}


def ioda_events(data: dict, now: datetime) -> list[dict]:
    ev, d = [], now.strftime("%Y-%m-%d")
    for r in data.get("countries", []):
        if not r.get("alert"):
            continue
        th, lon, lat = COUNTRY[r["code"]]
        src = ", ".join(f"{k} {v:.0f}" for k, v in sorted(r["sources"].items(), key=lambda kv: -kv[1])[:3])
        ev.append(_ev(d, "D", [lon, lat], th, r["name"], f"인터넷 대규모 장애·차단: {r['name']} (IODA 24시간 점수 {r['score']:.0f}{', ' + src if src else ''}). 정부 차단·전력망 피격·케이블 손상 가능",
                      f"https://ioda.inetintel.cc.gatech.edu/country/{r['code']}?d={d}", "B2", "ioda", f"ioda-{r['code']}-{d}"))
    return ev


# ── Polymarket ───────────────────────────────────────────────────────────────
def _jl(v):
    if isinstance(v, list):
        return v
    try:
        return json.loads(v) if v else []
    except (TypeError, ValueError):
        return []


def parse_markets(payload) -> list[dict]:
    """Gamma /markets or /events payload → flat list of open binary markets with a Yes price."""
    items = payload if isinstance(payload, list) else (payload or {}).get("data", [])
    flat = []
    for it in items or []:
        for m in (it.get("markets") if isinstance(it.get("markets"), list) else [it]):
            if m.get("closed") or m.get("archived"):
                continue
            outs, prices = _jl(m.get("outcomes")), _jl(m.get("outcomePrices"))
            if not outs or len(outs) != len(prices):
                continue
            try:
                yes = float(prices[[o.lower() for o in outs].index("yes")]) if "yes" in [o.lower() for o in outs] else None
            except (ValueError, TypeError):
                yes = None
            if yes is None:
                continue
            try:
                vol = float(m.get("volume") or m.get("volumeNum") or 0); v24 = float(m.get("volume24hr") or 0)
                chg = float(m.get("oneDayPriceChange")) if m.get("oneDayPriceChange") not in (None, "") else None
            except (TypeError, ValueError):
                vol, v24, chg = 0.0, 0.0, None
            slug = m.get("slug") or it.get("slug") or ""
            flat.append({"q": m.get("question") or it.get("title") or "", "p": round(yes, 3), "vol": round(vol), "vol24": round(v24), "chg1d": chg,
                         "end": (m.get("endDate") or it.get("endDate") or "")[:10], "url": f"https://polymarket.com/event/{it.get('slug') or slug}"})
    seen, out = set(), []
    for m in sorted(flat, key=lambda m: -m["vol"]):
        if m["q"] and m["q"] not in seen:
            seen.add(m["q"]); out.append(m)
    return out


def match_scenarios(markets: list[dict], mapping: dict) -> dict:
    res = {}
    for sid, spec in (mapping or {}).items():
        rx = re.compile(spec["q"], re.I)
        hits = [m for m in markets if rx.search(m["q"])]
        if hits:
            m = max(hits, key=lambda m: m["vol"])
            res[sid] = {**m, "p": round(1 - m["p"], 3) if spec.get("invert") else m["p"], "inverted": bool(spec.get("invert")), "n_candidates": len(hits)}
    return res


def fetch_poly() -> dict:
    markets = []
    for path, params in (("/events", {"closed": "false", "active": "true", "limit": 200, "tag_slug": "geopolitics"}),
                         ("/events", {"closed": "false", "active": "true", "limit": 200, "tag_slug": "politics"}),
                         ("/markets", {"closed": "false", "active": "true", "limit": 500, "order": "volume24hr", "ascending": "false"})):
        try:
            markets += parse_markets(_get_json(POLY_API + path, params))
        except Exception as e:  # noqa: BLE001
            log.warning("polymarket %s %s: %s", path, params.get("tag_slug", ""), e)
    if not markets:
        raise RuntimeError("Polymarket 응답 없음")
    markets = sorted({m["q"]: m for m in markets}.values(), key=lambda m: -m["vol"])  # 두 경로에서 겹친 질문 제거
    mapping = (yaml.safe_load((HERE / "prediction_map.yaml").read_text()) or {}).get("scenarios", {})
    geo_rx = re.compile(r"Iran|Israel|Russia|Ukraine|China|Taiwan|North Korea|Venezuela|Hormuz|Houthi|Gaza|Hamas|Hezbollah|war|ceasefire|invade|strike|NATO|nuclear|tariff|Fed|recession|oil|election", re.I)
    noise = re.compile(r"win the 20\d\d (US |U\.S\. )?(Presidential|Democratic|Republican)|nomination|Super Bowl|NBA|NFL|Bitcoin|Ethereum", re.I)
    top = [m for m in markets if geo_rx.search(m["q"]) and not noise.search(m["q"]) and 0.02 <= m["p"] <= 0.98][:25]
    return {"n_markets": len(markets), "matched": match_scenarios(markets, mapping), "top": top}


# ── USGS · GDACS ─────────────────────────────────────────────────────────────
def nearest_theater(lon: float, lat: float, km: float = 900) -> str | None:
    """가장 가까운 감시 국가 중심점의 전역(theater). 멀리 떨어진 바다·무관 지역은 None."""
    best = None
    for th, clon, clat in COUNTRY.values():
        if th:
            d = haversine_km(lat, lon, clat, clon)
            if d <= km and (best is None or d < best[0]):
                best = (d, th)
    return best[1] if best else None


def _near_watch(lon: float, lat: float, km: float = 300) -> str | None:
    best = None
    for s in load_watch()["sites"]:
        d = haversine_km(lat, lon, s["lat"], s["lon"])
        if d <= km and (best is None or d < best[0]):
            best = (d, s["n"])
    for n, (clon, clat) in CHOKE_PTS.items():
        d = haversine_km(lat, lon, clat, clon)
        if d <= km and (best is None or d < best[0]):
            best = (d, n)
    return f"{best[1]} {best[0]:.0f}km" if best else None


def parse_quakes(payload: dict, now: datetime) -> list[dict]:
    out = []
    for f in (payload or {}).get("features", []):
        p, g = f.get("properties") or {}, (f.get("geometry") or {}).get("coordinates") or []
        try:
            mag = float(p.get("mag")); lon, lat = float(g[0]), float(g[1])
        except (TypeError, ValueError, IndexError):
            continue
        near = _near_watch(lon, lat)
        if mag >= 6.0 or (mag >= 5.0 and near) or (p.get("alert") in ("orange", "red")):
            t = datetime.fromtimestamp((p.get("time") or 0) / 1000, UTC)
            out.append({"d": t.strftime("%Y-%m-%d"), "mag": mag, "place": p.get("place") or "", "lon": lon, "lat": lat, "near": near,
                        "alert": p.get("alert"), "tsunami": p.get("tsunami"), "url": p.get("url") or ""})
    out.sort(key=lambda q: (q["d"], q["mag"]), reverse=True)
    return out[:20]


def parse_gdacs(payload: dict) -> list[dict]:
    out = []
    for f in (payload or {}).get("features", []):
        p = f.get("properties") or {}
        g = (f.get("geometry") or {}).get("coordinates") or [None, None]
        lvl = (p.get("alertlevel") or "").lower()
        if lvl not in ("orange", "red"):
            continue
        url = p.get("url") or {}
        sev = p.get("severitydata") or {}
        try:
            lon, lat = float(g[0]), float(g[1])
        except (TypeError, ValueError, IndexError):
            lon = lat = None
        iso2 = [c.get("iso2") for c in (p.get("affectedcountries") or []) if isinstance(c, dict) and c.get("iso2")]
        country = (p.get("country") or "").strip()
        out.append({"type": p.get("eventtype"), "name": p.get("name") or p.get("eventname") or "", "level": lvl, "iso2": iso2,
                    "country": country if len(country) <= 60 else country[:57].rsplit(",", 1)[0] + " 등",
                    "iso3": p.get("iso3") or "", "from": (p.get("fromdate") or "")[:10], "to": (p.get("todate") or "")[:10], "lon": lon, "lat": lat,
                    "sev": sev.get("severitytext") or "", "url": (url.get("report") if isinstance(url, dict) else url) or "https://www.gdacs.org/",
                    "id": f"{p.get('eventtype')}{p.get('eventid')}-{p.get('episodeid')}"})
    return out


GDACS_KO = {"TC": "열대성 폭풍", "EQ": "지진", "FL": "홍수", "VO": "화산", "DR": "가뭄", "WF": "산불"}


def hazard_events(quakes: list[dict], gdacs: list[dict], now: datetime) -> list[dict]:
    ev, cut = [], (now - timedelta(days=3)).strftime("%Y-%m-%d")
    for q in quakes:
        if q["d"] < cut:
            continue
        x = f"규모 {q['mag']:.1f} 지진: {q['place']}" + (f" (감시 대상 {q['near']} 거리)" if q["near"] else "") + (" · 쓰나미 경보" if q.get("tsunami") else "")
        ev.append(_ev(q["d"], "X", [round(q["lon"], 2), round(q["lat"], 2)], nearest_theater(q["lon"], q["lat"]), q["place"][:40], x, q["url"], "A1", "usgs", f"usgs-{q['url'][-12:]}", 3 if q["near"] or q["mag"] >= 7 else 2))
    for g in gdacs:
        if (g["to"] or g["from"]) < cut or g["lon"] is None or g["type"] == "DR":
            continue
        x = f"GDACS {'적색' if g['level'] == 'red' else '주황'} 경보 · {GDACS_KO.get(g['type'], g['type'])} {g['name']}{' (' + g['country'] + ')' if g['country'] else ''} {g['sev']}".strip()
        ev.append(_ev(g["to"] or g["from"], "X", [round(g["lon"], 2), round(g["lat"], 2)], next((COUNTRY[c][0] for c in g.get("iso2", []) if c in COUNTRY and COUNTRY[c][0]), None) or nearest_theater(g["lon"], g["lat"]), g["country"][:40], x, g["url"], "A2", "gdacs", f"gdacs-{g['id']}", 3 if g["level"] == "red" else 2))
    return ev


# ── OFAC ─────────────────────────────────────────────────────────────────────
def parse_sdn(text: str) -> dict[str, dict]:
    out = {}
    for r in csv.reader(io.StringIO(text)):
        if len(r) < 4 or not r[0].strip().isdigit():
            continue
        nul = lambda v: "" if v.strip() in ("-0-", "") else v.strip()
        out[r[0].strip()] = {"name": nul(r[1]), "type": nul(r[2]) or "entity", "program": nul(r[3]), "vess_flag": nul(r[9]) if len(r) > 9 else "",
                             "vess_type": nul(r[6]) if len(r) > 6 else ""}
    return out


def program_theater(program: str) -> str | None:
    for rx, th in PROGRAM_TH:
        if re.search(rx, program or "", re.I):
            return th
    return None


def fetch_ofac(dash: Path, now: datetime) -> dict:
    text, err = None, None
    for url in OFAC_CSV:
        try:
            text = fetch.get(url, timeout=90, retries=1, cache=False).decode("utf-8", "replace"); break
        except Exception as e:  # noqa: BLE001
            err = e
    if not text:
        raise RuntimeError(f"SDN 다운로드 실패: {err}")
    cur = parse_sdn(text)
    if len(cur) < 1000:
        raise RuntimeError(f"SDN 행 수 이상 ({len(cur)})")
    base_path = dash / "data" / "ofac_sdn_ids.json"
    prev = json.loads(base_path.read_text()) if base_path.exists() else None
    prev_ids = {str(i) for i in prev["ids"]} if prev else None
    new_ids = sorted(set(cur) - prev_ids, key=int) if prev_ids is not None else []
    removed = len(prev_ids - set(cur)) if prev_ids is not None else 0
    if prev_ids is None or new_ids or removed:
        base_path.write_text(json.dumps({"as_of": now.strftime("%Y-%m-%dT%H:%MZ"), "n": len(cur), "ids": sorted((int(i) for i in cur))}, separators=(",", ":")))
    new = [{"id": i, **cur[i]} for i in new_ids]
    groups: dict[str, list] = {}
    for n in new:
        groups.setdefault(n["program"] or "기타", []).append(n)
    return {"n_total": len(cur), "baseline": prev is None, "new": new[:200], "n_new": len(new), "removed": removed,
            "new_vessels": sum(1 for n in new if n["type"].lower() == "vessel"),
            "by_program": {k: len(v) for k, v in sorted(groups.items(), key=lambda kv: -len(kv[1]))}, "d": now.strftime("%Y-%m-%d")}


def ofac_events(data: dict) -> list[dict]:
    ev = []
    groups: dict[str, list] = {}
    for n in data.get("new", []):
        groups.setdefault(n["program"] or "기타", []).append(n)
    for prog, items in groups.items():
        vs = [n for n in items if n["type"].lower() == "vessel"]
        names = ", ".join(n["name"] for n in (vs or items)[:4])
        x = f"OFAC 신규 제재 지정 [{prog}] {len(items)}건" + (f" · 선박 {len(vs)}척" if vs else "") + f": {names}" + (" 외" if len(vs or items) > 4 else "")
        ev.append(_ev(data["d"], "E", None, program_theater(prog), "미 재무부", x[:220], f"{OFAC_PAGE}#{data['d']}-{re.sub(r'[^A-Za-z0-9]+', '-', prog)}", "A1", "ofac",
                      f"ofac-{data['d']}-{re.sub(r'[^A-Za-z0-9]+', '-', prog)}", 3 if vs or len(items) >= 5 else 2))
    return ev


# ── run ──────────────────────────────────────────────────────────────────────
def run(dash: Path, now: datetime | None = None) -> dict:
    now = now or datetime.now(UTC)
    path = dash / "data" / "openfeeds.json"
    prev = json.loads(path.read_text()) if path.exists() else {}
    doc = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ")}
    events = []
    jobs = (("ioda", lambda: fetch_ioda(now)), ("poly", fetch_poly), ("quakes", lambda: parse_quakes(_get_json(USGS_FEED), now)),
            ("gdacs", lambda: parse_gdacs(_get_json(GDACS_API, {"eventlist": "TC;EQ;FL;VO;WF", "alertlevel": "Orange;Red",
                                                                   "fromDate": (now - timedelta(days=10)).strftime("%Y-%m-%d"), "toDate": now.strftime("%Y-%m-%d")}))),
            ("ofac", lambda: fetch_ofac(dash, now)))
    for name, fn in jobs:
        try:
            data = fn()
            doc[name] = {"ok": True, "at": doc["generated"], "data": data}
        except Exception as e:  # noqa: BLE001
            log.warning("openfeeds %s failed: %s", name, e)
            doc[name] = {**(prev.get(name) or {}), "ok": False, "err": f"{type(e).__name__}: {str(e)[:400]}"}
    if doc["ioda"].get("ok"):
        events += ioda_events(doc["ioda"]["data"], now)
    if doc["quakes"].get("ok") or doc["gdacs"].get("ok"):
        events += hazard_events((doc["quakes"].get("data") or []) if doc["quakes"].get("ok") else [], (doc["gdacs"].get("data") or []) if doc["gdacs"].get("ok") else [], now)
    if doc["ofac"].get("ok"):
        events += ofac_events(doc["ofac"]["data"])
    doc["summary"] = {"ioda_alerts": (doc["ioda"].get("data") or {}).get("n_alerts", 0) if doc["ioda"].get("ok") else 0,
                      "quakes_near": sum(1 for q in (doc["quakes"].get("data") or []) if q.get("near")) if doc["quakes"].get("ok") else 0,
                      "gdacs_red": sum(1 for g in (doc["gdacs"].get("data") or []) if g["level"] == "red") if doc["gdacs"].get("ok") else 0,
                      "ofac_new": (doc["ofac"].get("data") or {}).get("n_new", 0) if doc["ofac"].get("ok") else 0,
                      "ofac_new_vessels": (doc["ofac"].get("data") or {}).get("new_vessels", 0) if doc["ofac"].get("ok") else 0,
                      "events": len(events)}
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    if events:
        from . import assemble
        snap_path = dash / "data_snapshot.json"
        snap = json.loads(snap_path.read_text()) if snap_path.exists() else {"events": []}
        merged, added = assemble.merge_events(snap.get("events", []), events, now)
        snap["events"] = merged
        snap_path.write_text(json.dumps(snap, ensure_ascii=False))
        log.info("openfeeds: %d events (%d new)", len(events), added)
    log.info("openfeeds: %s", ", ".join(f"{k} {'ok' if doc[k].get('ok') else 'ERR'}" for k, _ in jobs))
    return doc
