"""NASA FIRMS satellite hotspots (VIIRS NRT) around watched facilities and over conflict areas.

Every collection run fetches the last two days of detections in a small box around each site in watch_sites.yaml and over
each conflict AOI, keeps a 30-day per-day history (data/firms_history.json), and flags a site or AOI only when today's
activity is well above its own learned baseline. Refineries and gas plants flare every day, so a fixed threshold would
alert constantly; a site needs >= 4 baseline days before it can alert. Alerts become board events (type X, "원인 미상")
with a FIRMS map link, and data/firms.json feeds the 운영 tab, the DIB and the tripwire firms.n_alerts.

Key: env FIRMS_MAP_KEY (free, https://firms.modaps.eosdis.nasa.gov/api/map_key/). No key -> the step is skipped.
"""

from __future__ import annotations

import csv
import io
import json
import logging
import math
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from pathlib import Path
from statistics import median

import yaml

from . import fetch

log = logging.getLogger("pipeline.firms")
HERE = Path(__file__).resolve().parent
API = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{source}/{bbox}/{days}"
SOURCES = ["VIIRS_NOAA20_NRT", "VIIRS_SNPP_NRT"]
MIN_BASE_DAYS = 4


def load_watch() -> dict:
    return yaml.safe_load((HERE / "watch_sites.yaml").read_text())


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(a))


def site_bbox(s: dict) -> list[float]:
    dlat = s["r_km"] / 111.0
    dlon = s["r_km"] / (111.0 * max(0.2, math.cos(math.radians(s["lat"]))))
    return [round(s["lon"] - dlon, 4), round(s["lat"] - dlat, 4), round(s["lon"] + dlon, 4), round(s["lat"] + dlat, 4)]


def parse_csv(text: str) -> list[dict]:
    """FIRMS area CSV -> [{lat, lon, d, t, frp, conf, sat}]. Unknown or broken rows are skipped."""
    out = []
    if not text or "latitude" not in text[:200]:
        return out
    for r in csv.DictReader(io.StringIO(text)):
        try:
            out.append({"lat": float(r["latitude"]), "lon": float(r["longitude"]), "d": r["acq_date"], "t": r.get("acq_time", ""),
                        "frp": float(r.get("frp") or 0), "conf": r.get("confidence", ""), "sat": r.get("satellite", "")})
        except (KeyError, ValueError):
            continue
    return out


def _fetch(key: str, bbox: list[float], days: int = 2) -> list[dict]:
    rows = []
    for src in SOURCES:
        url = API.format(key=key, source=src, bbox=",".join(str(x) for x in bbox), days=days)
        body = fetch.get(url, timeout=40, retries=1, cache=False).decode("utf-8", "replace")
        if body.lstrip().lower().startswith("invalid"):
            raise RuntimeError(body.strip()[:120])
        rows += parse_csv(body)
    return rows


def summarize_site(site: dict, rows: list[dict]) -> dict[str, list]:
    """{date: [count, max_frp, lat, lon]} for detections within the site radius (max_frp location kept)."""
    by: dict[str, list] = {}
    for r in rows:
        if haversine_km(site["lat"], site["lon"], r["lat"], r["lon"]) > site["r_km"]:
            continue
        cur = by.setdefault(r["d"], [0, 0.0, None, None])
        cur[0] += 1
        if r["frp"] >= cur[1]:
            cur[1], cur[2], cur[3] = r["frp"], r["lat"], r["lon"]
    return by


def summarize_aoi(rows: list[dict]) -> dict[str, list]:
    by: dict[str, list] = {}
    for r in rows:
        cur = by.setdefault(r["d"], [0, 0])
        cur[0] += 1
        cur[1] += 1 if r["frp"] >= 10 else 0
    return by


def update_history(hist: dict, kind: str, ident: str, by_date: dict[str, list], now: datetime, keep_days: int = 30) -> None:
    """Merge today's per-date numbers. NRT dates fill in over later passes, so keep the larger count per date."""
    h = hist.setdefault(kind, {}).setdefault(ident, {})
    for d, v in by_date.items():
        old = h.get(d)
        if old is None or v[0] >= old[0]:
            h[d] = [v[0], round(v[1], 1)] + (list(v[2:4]) if kind == "sites" else [])
    cut = (now - timedelta(days=keep_days)).strftime("%Y-%m-%d")
    for d in [d for d in h if d < cut]:
        del h[d]


def judge(h: dict[str, list], now: datetime, kind: str) -> dict:
    """Compare the last 2 days with the baseline of older days (zero-detection days count as 0)."""
    recent_days = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in (0, 1)]
    first = min(h) if h else None
    base_days = []
    if first:
        d = datetime.strptime(first, "%Y-%m-%d").replace(tzinfo=UTC)
        while d.strftime("%Y-%m-%d") < recent_days[1]:
            base_days.append(d.strftime("%Y-%m-%d")); d += timedelta(days=1)
    base_n = [h.get(d, [0, 0])[0] for d in base_days]
    base_f = [h.get(d, [0, 0])[1] for d in base_days]
    rec = [h[d] for d in recent_days if d in h]
    n = max([r[0] for r in rec], default=0)
    second = max([r[1] for r in rec], default=0)
    out = {"n": n, "base_days": len(base_days), "base_n": median(base_n) if base_n else None}
    if kind == "sites":
        frp = second
        top = max(rec, key=lambda r: r[1]) if rec else None
        out.update({"frp_max": frp, "base_frp": median(base_f) if base_f else None, "at": [top[3], top[2]] if top and top[2] is not None else None,
                    "d": max([d for d in recent_days if d in h], default=None)})
        if len(base_days) < MIN_BASE_DAYS:
            out["status"] = "learning"
        elif n >= max(3, 3 * out["base_n"] + 1) or frp >= max(25.0, 3 * (out["base_frp"] or 0) + 10):
            out["status"] = "alert"
        else:
            out["status"] = "normal"
    else:
        out.update({"n_hi": max([r[1] for r in rec], default=0), "d": max([d for d in recent_days if d in h], default=None)})
        if len(base_days) < MIN_BASE_DAYS + 1:
            out["status"] = "learning"
        elif n >= max(20, 3 * out["base_n"] + 5):
            out["status"] = "alert"
        else:
            out["status"] = "normal"
    return out


def to_events(sites: list[dict], aois: list[dict]) -> list[dict]:
    ev = []
    for s in sites:
        if s["status"] != "alert" or not s.get("d"):
            continue
        lon, lat = (s.get("at") or [s["lon"], s["lat"]])
        x = (f"위성 열점: {s['n_ko']} 반경 {s['r_km']}km 안 {s['n']}건, 최대 FRP {s['frp_max']:.0f}MW "
             f"(평소 {s['base_n']:.0f}건·{(s['base_frp'] or 0):.0f}MW). 원인 미상, 피격·화재 여부 확인 필요")
        ev.append({"d": s["d"], "t": "X", "at": [round(lon, 3), round(lat, 3)], "th": s["th"], "p": s["n_ko"], "x": x,
                   "s": f"https://firms.modaps.eosdis.nasa.gov/map/#d:{s['d']};@{lon:.3f},{lat:.3f},12.0z", "g": "B2", "src": "firms",
                   "lang": "ko", "auto": True, "id": f"firms-{s['id']}-{s['d']}", "r": 3})
    for a in aois:
        if a["status"] != "alert" or not a.get("d"):
            continue
        b = a["bbox"]; lon, lat = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
        x = f"위성 열점 급증: {a['n_ko']} 하루 {a['n']}건 (평소 {a['base_n']:.0f}건, FRP 10MW 이상 {a['n_hi']}건). 방화·포격 화재 가능성"
        ev.append({"d": a["d"], "t": "X", "at": [round(lon, 3), round(lat, 3)], "th": a["th"], "p": a["n_ko"], "x": x,
                   "s": f"https://firms.modaps.eosdis.nasa.gov/map/#d:{a['d']};@{lon:.3f},{lat:.3f},8.0z", "g": "B2", "src": "firms",
                   "lang": "ko", "auto": True, "id": f"firms-aoi-{a['id']}-{a['d']}", "r": 3})
    return ev


def run(dash: Path, now: datetime | None = None, key: str | None = None, fetcher=None) -> dict | None:
    key = key or os.environ.get("FIRMS_MAP_KEY")
    if not key:
        log.info("firms: FIRMS_MAP_KEY not set, skipping"); return None
    now = now or datetime.now(UTC)
    fetcher = fetcher or (lambda bbox: _fetch(key, bbox))
    watch = load_watch()
    hist_path = dash / "data" / "firms_history.json"
    hist = json.loads(hist_path.read_text()) if hist_path.exists() else {"sites": {}, "aois": {}}
    jobs = [("sites", s, site_bbox(s)) for s in watch["sites"]] + [("aois", a, a["bbox"]) for a in watch["aois"]]
    errors = []

    def one(job):
        kind, obj, bbox = job
        try:
            return kind, obj, fetcher(bbox), None
        except Exception as e:  # noqa: BLE001
            return kind, obj, None, f"{type(e).__name__}: {str(e).replace(key, '***')[:80]}"

    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(one, jobs))
    for kind, obj, rows, err in results:
        if err:
            errors.append(f"{obj['id']}: {err}"); continue
        by = summarize_site(obj, rows) if kind == "sites" else summarize_aoi(rows)
        update_history(hist, kind, obj["id"], by, now)
    sites, aois = [], []
    for s in watch["sites"]:
        j = judge(hist.get("sites", {}).get(s["id"], {}), now, "sites")
        sites.append({"id": s["id"], "n_ko": s["n"], "en": s["en"], "th": s["th"], "kind": s["kind"], "lat": s["lat"], "lon": s["lon"], "r_km": s["r_km"], **j})
    for a in watch["aois"]:
        j = judge(hist.get("aois", {}).get(a["id"], {}), now, "aois")
        aois.append({"id": a["id"], "n_ko": a["n"], "th": a["th"], "bbox": a["bbox"], **j})
    events = to_events(sites, aois)
    doc = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": SOURCES, "n_alerts": len(events), "errors": errors[:10],
           "learning": sum(1 for s in sites if s["status"] == "learning"), "sites": sites, "aois": aois, "alerts": events}
    if len(errors) == len(jobs):
        log.warning("firms: every request failed (%s); history unchanged", errors[0] if errors else "")
        return doc
    (dash / "data").mkdir(exist_ok=True)
    hist_path.write_text(json.dumps(hist, ensure_ascii=False, separators=(",", ":")))
    (dash / "data" / "firms.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    if events:  # 경보는 상황판 사건으로도 올린다 (URL 로 중복 제거)
        from . import assemble
        snap_path = dash / "data_snapshot.json"
        snap = json.loads(snap_path.read_text()) if snap_path.exists() else {"events": []}
        merged, added = assemble.merge_events(snap.get("events", []), events, now)
        snap["events"] = merged
        snap_path.write_text(json.dumps(snap, ensure_ascii=False))
        log.info("firms: %d alert events (%d new)", len(events), added)
    log.info("firms: %d sites (%d learning), %d aois, %d alerts, %d errors", len(sites), doc["learning"], len(aois), len(events), len(errors))
    return doc
