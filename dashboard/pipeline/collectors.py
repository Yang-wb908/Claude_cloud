"""Collectors. Each returns a list of raw items shaped as

    {"sid": source id, "title": str, "summary": str, "url": str, "published": "YYYY-MM-DDTHH:MM:SSZ",
     "lang": "en", "kind": "news"|"metric"|"report", "extra": {...}}

Metric-type collectors (portwatch, markets) return items with kind="metric" and an `extra` dict that
`build.py` turns into dashboard metric rows. Failures raise; `run.py` records them per source.
"""

from __future__ import annotations

import html
import json
import logging
import re
from datetime import UTC, datetime, timedelta
from urllib.parse import quote_plus, urlparse

import feedparser

from . import fetch

log = logging.getLogger("pipeline.collect")

ISO = "%Y-%m-%dT%H:%M:%SZ"
COLLECTORS: dict = {}


def _iso(t) -> str:
    """feedparser struct_time / datetime / None -> ISO Z string (defaults to now)."""
    if t is None:
        return datetime.now(UTC).strftime(ISO)
    if isinstance(t, datetime):
        return t.astimezone(UTC).strftime(ISO)
    try:
        return datetime(*t[:6], tzinfo=UTC).strftime(ISO)
    except Exception:  # noqa: BLE001
        return datetime.now(UTC).strftime(ISO)


def _clean(s: str | None) -> str:
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    return re.sub(r"\s+", " ", s).strip()


def domain(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().removeprefix("www.")
    except Exception:  # noqa: BLE001
        return ""


# ── RSS / Atom ────────────────────────────────────────────────────────────
def parse_feed(body: bytes, sid: str, max_items: int = 40) -> list[dict]:
    fp = feedparser.parse(body)
    out = []
    for e in fp.entries[:max_items]:
        url = e.get("link") or ""
        pub = e.get("published_parsed") or e.get("updated_parsed")
        out.append({
            "sid": sid, "title": _clean(e.get("title")), "summary": _clean(e.get("summary") or e.get("description"))[:600],
            "url": url, "published": _iso(pub), "lang": "en", "kind": "news", "extra": {"domain": domain(url)},
        })
    return out


def rss(src: dict, cfg: dict) -> list[dict]:
    src.pop("_note", None)
    try:
        body = fetch.get(src["url"], timeout=cfg.get("timeout", 25))
        items = parse_feed(body, src["id"], cfg.get("max_items", 40))
        if items or src.get("no_fallback"):
            return items
        err = "empty feed"
    except Exception as e:  # noqa: BLE001
        if src.get("no_fallback"):
            raise
        err = f"{type(e).__name__}: {str(e)[:80]}"
    # 피드가 막히거나(403) 옮겨졌으면(404) 같은 매체의 기사를 Google News site: 검색으로 받는다. 등급·도메인은 그대로.
    d = src.get("domain") or domain(src["url"])
    if not d:
        raise RuntimeError(err)
    items = gnews({"id": src["id"], "q": f"site:{d}", "lang": src.get("lang", "en")}, cfg)
    src["_note"] = f"{err} → Google News site:{d} 대체 {len(items)}건"
    return items


# ── Google News search RSS ─────────────────────────────────────────────────
def gnews(src: dict, cfg: dict) -> list[dict]:
    lang = src.get("lang", "en")
    loc = {"ko": ("ko", "KR", "KR:ko"), "ja": ("ja", "JP", "JP:ja")}.get(lang, ("en-US", "US", "US:en"))
    url = f"https://news.google.com/rss/search?q={quote_plus(src['q'] + ' when:2d')}&hl={loc[0]}&gl={loc[1]}&ceid={loc[2]}"
    items = parse_feed(fetch.get(url, timeout=cfg.get("timeout", 25)), src["id"], cfg.get("max_items", 40))
    for it in items:
        # "Headline - Publisher" -> keep publisher for grading, since the link is a Google redirect
        m = re.match(r"^(.*)\s+-\s+([^-]{2,60})$", it["title"])
        if m:
            it["title"], it["extra"]["publisher"] = m.group(1).strip(), m.group(2).strip()
    return items


# ── GDELT DOC 2.0 ──────────────────────────────────────────────────────────
GDELT = "https://api.gdeltproject.org/api/v2/doc/doc"


def parse_gdelt(payload: dict, sid: str) -> list[dict]:
    out = []
    for a in payload.get("articles", []):
        seendate = a.get("seendate", "")  # 20261007T183000Z
        try:
            pub = datetime.strptime(seendate, "%Y%m%dT%H%M%SZ").replace(tzinfo=UTC).strftime(ISO)
        except ValueError:
            pub = _iso(None)
        out.append({
            "sid": sid, "title": _clean(a.get("title")), "summary": "", "url": a.get("url", ""), "published": pub,
            "lang": a.get("language", "English").lower()[:2], "kind": "news",
            "extra": {"domain": a.get("domain", ""), "country": a.get("sourcecountry", "")},
        })
    return out


def gdelt(src: dict, cfg: dict) -> list[dict]:
    out = []
    for q in src.get("queries", []):
        params = {"query": q, "mode": "artlist", "format": "json", "timespan": "24h", "maxrecords": 50, "sort": "datedesc"}
        try:
            out += parse_gdelt(fetch.get_json(GDELT, params, timeout=cfg.get("timeout", 25)), src["id"])
        except Exception as e:  # noqa: BLE001 - one bad query should not kill the source
            log.warning("gdelt query failed %r: %s", q, e)
    return out


# ── ReliefWeb ──────────────────────────────────────────────────────────────
RW_COUNTRIES = ["Yemen", "Sudan", "Ethiopia", "Somalia", "Democratic Republic of the Congo", "Ukraine", "occupied Palestinian territory",
                "Lebanon", "Syrian Arab Republic", "Mali", "Niger", "Nigeria", "Myanmar", "Haiti", "Afghanistan", "Pakistan"]


def parse_reliefweb(payload: dict, sid: str) -> list[dict]:
    out = []
    for d in payload.get("data", []):
        f = d.get("fields", {})
        out.append({
            "sid": sid, "title": _clean(f.get("title")), "summary": _clean((f.get("body") or "")[:600]),
            "url": f.get("url_alias") or f.get("url") or "", "published": (f.get("date", {}) or {}).get("created", _iso(None))[:19] + "Z",
            "lang": "en", "kind": "report",
            "extra": {"countries": [c.get("name") for c in f.get("country", []) or []], "format": [x.get("name") for x in f.get("format", []) or []],
                      "source": [s.get("shortname") or s.get("name") for s in f.get("source", []) or []], "domain": "reliefweb.int"},
        })
    return out


def reliefweb(src: dict, cfg: dict) -> list[dict]:
    since = (datetime.now(UTC) - timedelta(days=2)).strftime("%Y-%m-%dT00:00:00+00:00")
    body = {
        "appname": "situation-board", "limit": 40, "sort": ["date.created:desc"],
        "filter": {"operator": "AND", "conditions": [
            {"field": "date.created", "value": {"from": since}},
            {"field": "country.name", "value": RW_COUNTRIES, "operator": "OR"},
            {"field": "format.name", "value": ["Situation Report", "Flash Update", "News and Press Release"], "operator": "OR"},
        ]},
        "fields": {"include": ["title", "body", "url_alias", "date.created", "country.name", "format.name", "source.shortname", "source.name"]},
    }
    r = fetch.session().post(src["url"], params={"appname": "situation-board"}, json=body, timeout=cfg.get("timeout", 25))
    r.raise_for_status()
    return parse_reliefweb(r.json(), src["id"])


# ── IMF PortWatch (ArcGIS FeatureServer) ────────────────────────────────────
CHOKE_MAP = {"hormuz": ["hormuz"], "bab": ["mandeb", "mandab"], "suez": ["suez"], "cape": ["good hope", "cape"], "malacca": ["malacca"],
             "panama": ["panama"], "blacksea": ["bosporus", "bosphorus"], "taiwan": ["taiwan"], "gibraltar": ["gibraltar"]}


def parse_portwatch(payload: dict, sid: str) -> list[dict]:
    out = []
    for feat in payload.get("features", []):
        a = feat.get("attributes", {})
        name = str(a.get("portname") or a.get("chokepoint") or a.get("name") or "").lower()
        cid = next((k for k, keys in CHOKE_MAP.items() if any(x in name for x in keys)), None)
        if not cid:
            continue
        ts = a.get("date") or a.get("Date")
        try:
            d = datetime.fromtimestamp(int(ts) / 1000, tz=UTC).strftime("%Y-%m-%d") if isinstance(ts, (int, float)) else str(ts)[:10]
        except Exception:  # noqa: BLE001
            d = _iso(None)[:10]
        out.append({
            "sid": sid, "title": f"PortWatch {cid} {d}", "summary": "", "url": "https://portwatch.imf.org/", "published": d + "T00:00:00Z",
            "lang": "en", "kind": "metric",
            "extra": {"choke": cid, "date": d, "n_total": a.get("n_total"), "n_tanker": a.get("n_tanker"), "n_container": a.get("n_container"),
                      "n_cargo": a.get("n_cargo"), "domain": "portwatch.imf.org"},
        })
    return out


def portwatch(src: dict, cfg: dict) -> list[dict]:
    since = (datetime.now(UTC) - timedelta(days=21)).strftime("%Y-%m-%d")
    params = {"where": f"date >= DATE '{since}'", "outFields": "*", "f": "json", "resultRecordCount": 2000, "orderByFields": "date DESC"}
    return parse_portwatch(fetch.get_json(src["url"], params, timeout=cfg.get("timeout", 25)), src["id"])


# ── Markets (Yahoo Finance chart endpoint) ─────────────────────────────────
YF = "https://query1.finance.yahoo.com/v8/finance/chart/{sym}"


def parse_yf(payload: dict, sym: str, label: str, sid: str) -> dict | None:
    try:
        res = payload["chart"]["result"][0]
        meta = res["meta"]
        closes = [c for c in res["indicators"]["quote"][0]["close"] if c is not None]
        last = meta.get("regularMarketPrice") or closes[-1]
        prev = meta.get("chartPreviousClose") or (closes[-2] if len(closes) > 1 else None)
        ts = meta.get("regularMarketTime")
        d = datetime.fromtimestamp(ts, tz=UTC).strftime("%Y-%m-%d") if ts else _iso(None)[:10]
        chg = f"{(last / prev - 1) * 100:+.1f}%" if prev else ""
        return {"sid": sid, "title": label, "summary": "", "url": f"https://finance.yahoo.com/quote/{quote_plus(sym)}", "published": d + "T00:00:00Z",
                "lang": "en", "kind": "metric", "extra": {"sym": sym, "label": label, "value": round(float(last), 2), "prev": prev, "chg": chg, "date": d, "domain": "finance.yahoo.com"}}
    except Exception as e:  # noqa: BLE001
        log.warning("yf parse failed %s: %s", sym, e)
        return None


def markets(src: dict, cfg: dict) -> list[dict]:
    out = []
    for sym, label in src.get("tickers", {}).items():
        try:
            payload = fetch.get_json(YF.format(sym=quote_plus(sym)), {"range": "5d", "interval": "1d"}, timeout=cfg.get("timeout", 25))
            it = parse_yf(payload, sym, label, src["id"])
            if it:
                out.append(it)
        except Exception as e:  # noqa: BLE001
            log.warning("yf fetch failed %s: %s", sym, e)
    return out


def parse_yf_series(payload: dict, sym: str, label: str, sid: str) -> dict | None:
    """Daily close series (for backtests). Keeps dates as YYYY-MM-DD and closes rounded to 4 decimals."""
    try:
        res = payload["chart"]["result"][0]
        ts = res["timestamp"]
        closes = res["indicators"]["quote"][0]["close"]
        d, c = [], []
        for t, v in zip(ts, closes):
            if v is None:
                continue
            d.append(datetime.fromtimestamp(t, tz=UTC).strftime("%Y-%m-%d")); c.append(round(float(v), 4))
        if len(c) < 5:
            return None
        return {"sid": sid, "title": label, "summary": "", "url": f"https://finance.yahoo.com/quote/{quote_plus(sym)}", "published": d[-1] + "T00:00:00Z",
                "lang": "en", "kind": "series", "extra": {"sym": sym, "label": label, "dates": d, "closes": c, "domain": "finance.yahoo.com"}}
    except Exception as e:  # noqa: BLE001
        log.warning("yf series parse failed %s: %s", sym, e)
        return None


def series(src: dict, cfg: dict) -> list[dict]:
    """kind: series — multi-year daily closes for the backtest engine (dashboard/data/series.json)."""
    out = []
    for sym, label in src.get("tickers", {}).items():
        try:
            payload = fetch.get_json(YF.format(sym=quote_plus(sym)), {"range": src.get("range", "2y"), "interval": "1d"}, timeout=cfg.get("timeout", 25))
            it = parse_yf_series(payload, sym, label, src["id"])
            if it:
                out.append(it)
        except Exception as e:  # noqa: BLE001
            log.warning("yf series fetch failed %s: %s", sym, e)
    return out


# ── IMINT: Sentinel-1 ship counts over chokepoint AOIs (src/sarship) ──────────
def sar(src: dict, cfg: dict) -> list[dict]:
    """kind: sar — only when SARSHIP_ENABLE=1 (slow: scene search + CFAR over a bbox). One metric item per AOI with the latest scene."""
    import os
    if os.environ.get("SARSHIP_ENABLE") != "1":
        return []
    from datetime import date, timedelta
    try:
        from sarship.detect import DetectorConfig, ShipDetector
        from sarship.s1 import S1Product
        from sarship.search import search
    except ImportError as e:
        log.warning("sarship not installed: %s", e)
        return []
    out = []
    days = [date.today() - timedelta(d) for d in range(int(src.get("lookback_days", 4)))]
    for aoi in src.get("aois", []):
        try:
            hits = list(search(aoi["lon"], aoi["lat"], days, "IW", "DV"))
            if not hits:
                log.info("sar: no scene for %s in %d days", aoi["id"], len(days)); continue
            info = sorted(hits, key=lambda h: h.get("startTime", ""))[-1]
            product = S1Product.from_aws(info["path"])
            res = ShipDetector(DetectorConfig(pol="vv", method="k", pfa=1e-5)).run(product, bbox=tuple(aoi["bbox"]))
            d = (info.get("startTime") or "")[:10] or date.today().isoformat()
            out.append({"sid": src["id"], "title": f"Sentinel-1 ships {aoi['id']}", "summary": "", "url": f"https://sentinel-s1-l1c.s3.amazonaws.com/{info['path']}", "published": d + "T00:00:00Z",
                        "lang": "en", "kind": "metric", "extra": {"metric": "sar", "aoi": aoi["id"], "date": d, "ships": len(res.detections), "product": info.get("id") or info["path"], "bbox": aoi["bbox"], "domain": "sentinel-s1-l1c"}})
        except Exception as e:  # noqa: BLE001
            log.warning("sar %s failed: %s", aoi.get("id"), e)
    return out


COLLECTORS["sar"] = sar


# ── Wikipedia Current events (port of the in-page parser) ──────────────────
WIKI_API = "https://en.wikipedia.org/w/api.php"
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def parse_wiki_month(html_text: str, sid: str, since: str) -> list[dict]:
    """Parse the Current events portal month page. Uses a light regex pass (no bs4 dependency)."""
    out = []
    blocks = re.split(r'<div class="current-events-main', html_text)[1:]
    for blk in blocks:
        m = re.search(r'class="bday[^"]*"[^>]*>([^<]+)<', blk)
        if not m:
            continue
        date = m.group(1).strip()
        if date < since:
            continue
        cat = ""
        for piece in re.split(r"(?=<p>|<ul>)", blk):
            if piece.startswith("<p>"):
                cm = re.search(r"<b>(.*?)</b>", piece)
                if cm:
                    cat = _clean(cm.group(1))
            elif piece.startswith("<ul>"):
                for li in re.findall(r"<li>(.*?)</li>", piece, re.S):
                    if "<ul" in li:
                        continue
                    links = re.findall(r'href="/wiki/([^"#]+)"', li)
                    ext = re.search(r'href="(https?://[^"]+)"[^>]*class="external', li) or re.search(r'class="external[^"]*"[^>]*href="(https?://[^"]+)"', li)
                    text = _clean(li)
                    text = re.sub(r"(\s*\([^()]*\))+\s*$", "", text)
                    if not text:
                        continue
                    out.append({"sid": sid, "title": text[:200], "summary": text, "url": ext.group(1) if ext else "", "published": date + "T12:00:00Z",
                                "lang": "en", "kind": "news", "extra": {"cat": cat, "wiki_links": [x.replace("_", " ") for x in links[:8]],
                                                                        "domain": domain(ext.group(1)) if ext else "en.wikipedia.org"}})
    return out


def wiki(src: dict, cfg: dict) -> list[dict]:
    now = datetime.now(UTC)
    since = (now - timedelta(days=3)).strftime("%Y-%m-%d")
    pages = [f"Portal:Current_events/{MONTHS[now.month - 1]}_{now.year}"]
    if now.day <= 3:
        pv = (now.replace(day=1) - timedelta(days=1))
        pages.append(f"Portal:Current_events/{MONTHS[pv.month - 1]}_{pv.year}")
    out = []
    for pg in pages:
        d = fetch.get_json(WIKI_API, {"action": "parse", "page": pg, "prop": "text", "format": "json", "formatversion": "2"}, timeout=cfg.get("timeout", 25))
        out += parse_wiki_month(d.get("parse", {}).get("text", ""), src["id"], since)
    return out


# ── Best-effort HTML parsers for official pages ────────────────────────────
def parse_taiwan_mnd(html_text: str, sid: str) -> list[dict]:
    """Taiwan MND 即時軍事動態 table: rows like '2026/10/07 ... 共機 23 架次 ... 共艦 8 艘次'."""
    out = []
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", html_text, re.S):
        txt = _clean(row)
        m = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})", txt)
        if not m:
            continue
        d = f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
        air = re.search(r"共機\s*(\d+)\s*架", txt)
        ship = re.search(r"共艦\s*(\d+)\s*艘", txt)
        if not (air or ship):
            continue
        out.append({"sid": sid, "title": f"PLA activity {d}: aircraft {air.group(1) if air else '?'}, ships {ship.group(1) if ship else '?'}", "summary": txt[:300],
                    "url": "https://www.mnd.gov.tw/", "published": d + "T00:00:00Z", "lang": "zh", "kind": "metric",
                    "extra": {"metric": "pla_daily", "date": d, "aircraft": int(air.group(1)) if air else None, "ships": int(ship.group(1)) if ship else None, "domain": "mnd.gov.tw"}})
    return out


def parse_ukmto(html_text: str, sid: str) -> list[dict]:
    out = []
    for blk in re.findall(r"<(?:article|li|tr)[^>]*>(.*?)</(?:article|li|tr)>", html_text, re.S):
        txt = _clean(blk)
        m = re.search(r"(\d{1,2})\s+(\w{3})\w*\s+(\d{4})", txt)
        if not m or not re.search(r"(incident|advisory|warning|attack|approach|suspicious|UKMTO)", txt, re.I):
            continue
        try:
            d = datetime.strptime(f"{m.group(1)} {m.group(2)} {m.group(3)}", "%d %b %Y").strftime("%Y-%m-%d")
        except ValueError:
            continue
        out.append({"sid": sid, "title": txt[:160], "summary": txt[:500], "url": "https://www.ukmto.org/indian-ocean/recent-incidents", "published": d + "T00:00:00Z",
                    "lang": "en", "kind": "news", "extra": {"domain": "ukmto.org"}})
    return out[:30]


HTML_PARSERS = {"taiwan_mnd": parse_taiwan_mnd, "ukmto": parse_ukmto}


def html_page(src: dict, cfg: dict) -> list[dict]:
    body = fetch.get(src["url"], timeout=cfg.get("timeout", 25)).decode("utf-8", "replace")
    return HTML_PARSERS[src["parser"]](body, src["id"])


# ── CFTC Commitments of Traders (disaggregated futures-only, weekly) ───────
def parse_cot(text: str, markets: dict, sid: str) -> list[dict]:
    import csv, io
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        return []
    hdr = [h.strip().lower() for h in rows[0]]
    def col(*cands):
        for cnd in cands:
            for i, h in enumerate(hdr):
                if cnd in h:
                    return i
        return None
    i_name, i_date = col("market_and_exchange"), col("report_date_as_yyyy", "report_date")
    i_ml, i_ms = col("m_money_positions_long"), col("m_money_positions_short")
    i_cl, i_cs = col("change_in_m_money_long"), col("change_in_m_money_short")
    i_oi = col("open_interest_all", "open_interest")
    if None in (i_name, i_date, i_ml, i_ms):
        raise RuntimeError("COT header columns not found")
    out, seen = [], set()
    for r in rows[1:]:
        if len(r) <= max(i_ml, i_ms):
            continue
        name = r[i_name].strip().upper()
        key = next((k for k in markets if name.startswith(k.upper())), None)
        if not key or key in seen:
            continue
        seen.add(key)
        try:
            long_, short = int(float(r[i_ml])), int(float(r[i_ms]))
            chg = (int(float(r[i_cl])) - int(float(r[i_cs]))) if i_cl is not None and i_cs is not None and r[i_cl] and r[i_cs] else None
        except ValueError:
            continue
        d = r[i_date].strip()[:10]
        out.append({"sid": sid, "title": f"COT {markets[key]} {d}", "summary": "", "url": "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm", "published": d + "T00:00:00Z",
                    "lang": "en", "kind": "metric", "extra": {"metric": "cot", "market": markets[key], "key": key, "date": d, "mm_long": long_, "mm_short": short, "mm_net": long_ - short,
                                                               "net_chg": chg, "oi": int(float(r[i_oi])) if i_oi is not None and r[i_oi] else None, "domain": "cftc.gov"}})
    return out


def cot(src: dict, cfg: dict) -> list[dict]:
    body = fetch.get(src["url"], timeout=max(40, cfg.get("timeout", 25))).decode("utf-8", "replace")
    return parse_cot(body, src.get("markets", {}), src["id"])


def parse_noaa_enso(html_text: str, sid: str) -> list[dict]:
    txt = _clean(html_text)
    m = re.search(r"ENSO Alert System Status:\s*([A-Za-z\s]+?)(?:\.|\s{2}|Synopsis)", txt)
    syn = re.search(r"Synopsis:\s*(.{20,400}?\.)", txt)
    d = re.search(r"(\d{1,2}\s+\w+\s+\d{4})", txt)
    try:
        date = datetime.strptime(d.group(1), "%d %B %Y").strftime("%Y-%m-%d") if d else _iso(None)[:10]
    except ValueError:
        date = _iso(None)[:10]
    if not (m or syn):
        return []
    return [{"sid": sid, "title": f"ENSO: {m.group(1).strip() if m else ''}", "summary": syn.group(1) if syn else "", "url": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
             "published": date + "T00:00:00Z", "lang": "en", "kind": "metric", "extra": {"metric": "enso", "status": m.group(1).strip() if m else "", "synopsis": syn.group(1) if syn else "", "date": date, "domain": "cpc.ncep.noaa.gov"}}]


def parse_fbx(html_text: str, sid: str) -> list[dict]:
    out = []
    for lane, val in re.findall(r"(FBX(?:0[1-9]|1[0-3])?)[^$]{0,120}\$\s?([\d,]{3,7})", html_text)[:14]:
        out.append({"sid": sid, "title": f"{lane} ${val}", "summary": "", "url": "https://fbx.freightos.com/", "published": _iso(None), "lang": "en", "kind": "metric",
                    "extra": {"metric": "fbx", "lane": lane, "value": int(val.replace(",", "")), "date": _iso(None)[:10], "domain": "fbx.freightos.com"}})
    return out


HTML_PARSERS.update({"noaa_enso": parse_noaa_enso, "fbx": parse_fbx})
COLLECTORS["cot"] = cot
COLLECTORS["series"] = series


COLLECTORS_BASE = {"rss": rss, "gnews": gnews, "gdelt": gdelt, "reliefweb": reliefweb, "portwatch": portwatch, "markets": markets, "wiki": wiki, "html": html_page}
COLLECTORS.update(COLLECTORS_BASE)


def collect(src: dict, cfg: dict) -> list[dict]:
    fn = COLLECTORS.get(src["kind"])
    if not fn:
        raise RuntimeError(f"no collector for kind={src['kind']}")
    items = fn(src, cfg)
    for it in items:
        it.setdefault("extra", {})
        it["extra"].setdefault("domain", domain(it.get("url", "")))
    return items
