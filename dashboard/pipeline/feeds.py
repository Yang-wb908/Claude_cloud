"""Daily structured feeds that need a free API key: EIA weekly petroleum stocks, FRED financial-stress and rates series,
and Global Fishing Watch vessel presence / SAR detections at chokepoints. Writes data/feeds.json; each part keeps its
previous value when its fetch fails or its key is missing, so one outage never blanks the board.

Keys (GitHub Secrets → env): EIA_API_KEY, FRED_API_KEY, GFW_TOKEN.
"""

from __future__ import annotations

import json
import logging
import os
import time
from datetime import UTC, datetime, timedelta
from pathlib import Path

from . import fetch

log = logging.getLogger("pipeline.feeds")

# ── EIA ──────────────────────────────────────────────────────────────────────
EIA_URL = "https://api.eia.gov/v2/petroleum/stoc/wstk/data/"
EIA_SERIES = {"WCESTUS1": "미 상업 원유 재고", "WCSSTUS1": "전략비축유(SPR)", "WGTSTUS1": "휘발유 재고", "WDISTUS1": "중간유분(경유) 재고"}


def parse_eia(payload: dict) -> dict:
    rows = ((payload or {}).get("response") or {}).get("data") or []
    by: dict[str, list] = {}
    for r in rows:
        sid = r.get("series") or r.get("seriesId")
        try:
            v = float(r.get("value"))
        except (TypeError, ValueError):
            continue
        if sid in EIA_SERIES and r.get("period"):
            by.setdefault(sid, []).append((r["period"], v, r.get("units") or r.get("unit") or "MBBL"))
    out = {}
    for sid, pts in by.items():
        pts = sorted(set(pts))
        if not pts:
            continue
        d, v, unit = pts[-1]
        w1 = v - pts[-2][1] if len(pts) >= 2 else None
        w4 = v - pts[-5][1] if len(pts) >= 5 else None
        out[sid] = {"l": EIA_SERIES[sid], "d": d, "v": v, "unit": unit, "chg_w": w1, "chg_4w": w4, "series": [[p[0], p[1]] for p in pts[-12:]]}
    return out


def fetch_eia(key: str) -> dict:
    params = [("api_key", key), ("frequency", "weekly"), ("data[0]", "value"), ("sort[0][column]", "period"), ("sort[0][direction]", "desc"), ("length", str(12 * len(EIA_SERIES)))]
    params += [("facets[series][]", s) for s in EIA_SERIES]
    r = fetch.session().get(EIA_URL, params=params, timeout=40)
    r.raise_for_status()
    out = parse_eia(r.json())
    if not out:
        raise RuntimeError("EIA 응답에 대상 시리즈 없음")
    return out


# ── FRED ─────────────────────────────────────────────────────────────────────
FRED_URL = "https://api.stlouisfed.org/fred/series/observations"
FRED_SERIES = {"STLFSI4": ("세인트루이스 연준 금융스트레스 지수", "pt"), "BAMLH0A0HYM2": ("미 하이일드 회사채 스프레드", "%p"),
               "T10Y2Y": ("미 10년-2년 금리차", "%p"), "T10YIE": ("10년 기대인플레이션", "%"), "DTWEXBGS": ("달러 지수(광의)", "pt"),
               "DCOILBRENTEU": ("브렌트 현물", "$/bbl")}


def parse_fred(payload: dict) -> dict | None:
    obs = [(o["date"], float(o["value"])) for o in (payload or {}).get("observations", []) if o.get("value") not in (None, ".", "")]
    if not obs:
        return None
    obs.sort()
    d, v = obs[-1]

    def back(n):
        return v - obs[-1 - n][1] if len(obs) > n else None
    return {"d": d, "v": v, "chg_1w": back(5), "chg_1m": back(21), "series": [[a, b] for a, b in obs[-60:]]}


def fetch_fred(key: str) -> dict:
    out = {}
    for sid, (label, unit) in FRED_SERIES.items():
        r = fetch.session().get(FRED_URL, params={"series_id": sid, "api_key": key, "file_type": "json", "sort_order": "desc", "limit": 90}, timeout=30)
        r.raise_for_status()
        p = parse_fred(r.json())
        if p:
            out[sid] = {"l": label, "unit": unit, **p}
    if not out:
        raise RuntimeError("FRED 응답 없음")
    return out


# ── Global Fishing Watch ─────────────────────────────────────────────────────
GFW_URL = "https://gateway.api.globalfishingwatch.org/v3/4wings/report"
CHOKES = {  # [west, south, east, north]
    "hormuz": ("호르무즈", [55.8, 25.9, 57.2, 27.0]), "bab": ("바브엘만데브", [42.9, 12.2, 43.8, 13.2]), "suez_s": ("수에즈 남단", [32.3, 29.6, 32.8, 30.1]),
    "malacca": ("싱가포르 해협", [103.4, 1.0, 104.4, 1.4]), "taiwan": ("대만해협", [118.8, 22.8, 121.0, 25.6]), "bosporus": ("보스포루스", [28.9, 40.95, 29.2, 41.25]),
    "danish": ("외레순·덴마크 해협", [12.4, 55.4, 12.9, 56.2]), "gulf_finland": ("핀란드만(바인들로)", [25.5, 59.6, 28.7, 60.3]), "panama": ("파나마 운하 입구", [-79.95, 8.8, -79.4, 9.45]),
    "korea_strait": ("대한해협", [128.5, 33.9, 129.8, 35.0]),
}


def _poly(b: list[float]) -> dict:
    w, s, e, n = b
    return {"type": "Polygon", "coordinates": [[[w, s], [e, s], [e, n], [w, n], [w, s]]]}


def parse_gfw(payload: dict, field: str) -> dict[str, float]:
    """4wings report JSON → {date: sum(field)}. Rows may sit under entries[i][<dataset-version>] or directly in a list."""
    by: dict[str, float] = {}
    entries = (payload or {}).get("entries", payload if isinstance(payload, list) else [])
    for ent in entries or []:
        if isinstance(ent, dict) and ("date" in ent or "timestamp" in ent):
            lists = [[ent]]  # 행이 entries 에 바로 들어온 형태
        else:
            lists = ent.values() if isinstance(ent, dict) else [ent]
        for rows in lists:
            if not isinstance(rows, list):
                continue
            for r in rows:
                if not isinstance(r, dict):
                    continue
                d = str(r.get("date") or r.get("timestamp") or "")[:10]
                try:
                    v = float(r.get(field) or 0)
                except (TypeError, ValueError):
                    continue
                if d:
                    by[d] = by.get(d, 0.0) + v
    return by


def _gfw_report(token: str, dataset: str, bbox: list[float], start: str, end: str, flt: str | None = None) -> dict:
    params = [("spatial-resolution", "LOW"), ("temporal-resolution", "DAILY"), ("datasets[0]", dataset), ("date-range", f"{start},{end}"),
              ("format", "JSON"), ("spatial-aggregation", "true")]
    if flt:
        params.append(("filters[0]", flt))
    for attempt in range(4):
        r = fetch.session().post(GFW_URL, params=params, json={"geojson": _poly(bbox)}, headers={"Authorization": f"Bearer {token}"}, timeout=120)
        if r.status_code == 429:  # 동시 보고서 1건 제한 → 잠시 기다렸다 재시도
            time.sleep(10 * (attempt + 1)); continue
        if r.status_code >= 400:  # 422 등은 본문에 어떤 파라미터가 틀렸는지 나온다
            raise RuntimeError(f"HTTP {r.status_code} {dataset}: {r.text[:400]}")
        return r.json()
    raise RuntimeError("GFW 429 반복")


def summarize_gfw(presence: dict[str, float], sar: dict[str, float], dark: dict[str, float]) -> dict:
    days = sorted(set(presence) | set(sar))
    series = [[d, round(presence.get(d, 0) / 24, 1), int(sar.get(d, 0)), int(dark.get(d, 0))] for d in days]
    pres = [x for x in series if presence.get(x[0])]
    last7, prev7 = [x[1] for x in pres[-7:]], [x[1] for x in pres[-14:-7]]
    a7 = round(sum(last7) / len(last7), 1) if last7 else None
    p7 = round(sum(prev7) / len(prev7), 1) if prev7 else None
    return {"series": series, "latest": pres[-1][0] if pres else None, "vessels_avg7": a7, "vessels_prev7": p7,
            "chg": round((a7 - p7) / p7, 3) if a7 is not None and p7 else None,
            "sar_7d": sum(x[2] for x in series[-7:]), "dark_7d": sum(x[3] for x in series[-7:])}


def fetch_gfw(token: str, now: datetime) -> dict:
    end = now.strftime("%Y-%m-%d"); start = (now - timedelta(days=21)).strftime("%Y-%m-%d")
    out, errs = {}, []
    for cid, (name, bbox) in CHOKES.items():
        try:
            pres = parse_gfw(_gfw_report(token, "public-global-presence:latest", bbox, start, end), "hours")
            sar_all = parse_gfw(_gfw_report(token, "public-global-sar-presence:latest", bbox, start, end), "detections")
            try:
                dark = parse_gfw(_gfw_report(token, "public-global-sar-presence:latest", bbox, start, end, "matched='false'"), "detections")
            except Exception:  # noqa: BLE001 - 필터 미지원이면 암흑 선박 수만 비운다
                dark = {}
            out[cid] = {"n": name, "bbox": bbox, **summarize_gfw(pres, sar_all, dark)}
        except Exception as e:  # noqa: BLE001
            errs.append(f"{cid}: {type(e).__name__}: {str(e).replace(token, '***')[:100]}")
    if not out:
        raise RuntimeError("; ".join(errs[:3]) or "GFW 응답 없음")
    if errs:
        out["_errors"] = errs
    return out


# ── run ──────────────────────────────────────────────────────────────────────
def run(dash: Path, now: datetime | None = None) -> dict:
    now = now or datetime.now(UTC)
    path = dash / "data" / "feeds.json"
    prev = json.loads(path.read_text()) if path.exists() else {}
    doc = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ")}
    for name, env, fn in (("eia", "EIA_API_KEY", lambda k: fetch_eia(k)), ("fred", "FRED_API_KEY", lambda k: fetch_fred(k)), ("gfw", "GFW_TOKEN", lambda k: fetch_gfw(k, now))):
        key = os.environ.get(env)
        if not key:
            doc[name] = {**(prev.get(name) or {}), "ok": False, "err": f"{env} 미설정"} if prev.get(name) else {"ok": False, "err": f"{env} 미설정"}
            continue
        try:
            data = fn(key)
            doc[name] = {"ok": True, "at": doc["generated"], "data": data}
            log.info("feeds %s: %d series", name, len([k for k in data if not k.startswith("_")]))
        except Exception as e:  # noqa: BLE001
            err = f"{type(e).__name__}: {str(e).replace(key, '***')[:160]}"  # 공개 저장소에 커밋되므로 키 마스킹
            log.warning("feeds %s failed: %s", name, err)
            doc[name] = {**(prev.get(name) or {}), "ok": False, "err": err}
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    return doc
