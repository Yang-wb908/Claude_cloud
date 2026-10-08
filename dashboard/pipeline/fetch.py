"""HTTP fetch with retries, a shared session, and an on-disk raw cache.

Every collector goes through `get()` so that failures are recorded per source and a run can
be replayed offline from the cache directory (`--offline`).
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
from pathlib import Path

import requests

log = logging.getLogger("pipeline.fetch")

CACHE_DIR = Path(__file__).resolve().parent / "cache"
# 많은 언론사 CDN이 알려지지 않은 UA에 403을 돌려주므로 브라우저 UA를 쓰고, 연락처는 From 헤더에 둔다.
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 situation-board/0.4"
CONTACT = "https://github.com/Yang-wb908/Claude_cloud"

_session: requests.Session | None = None
OFFLINE = False


def session() -> requests.Session:
    global _session
    if _session is None:
        _session = requests.Session()
        _session.headers.update({"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, application/json, */*", "Accept-Language": "en-US,en;q=0.8,ko;q=0.5", "From": CONTACT})
    return _session


def _key(url: str, params: dict | None) -> str:
    raw = url + "?" + json.dumps(params or {}, sort_keys=True)
    return hashlib.sha1(raw.encode()).hexdigest()[:20]


def get(url: str, params: dict | None = None, timeout: int = 25, retries: int = 2, cache: bool = True) -> bytes:
    """GET with retries. Returns the body bytes. Raises on final failure.

    In offline mode the cache is the only source; a cache miss raises.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cpath = CACHE_DIR / (_key(url, params) + ".bin")
    if OFFLINE:
        if cpath.exists():
            return cpath.read_bytes()
        raise RuntimeError(f"offline cache miss: {url}")
    last: Exception | None = None
    for attempt in range(retries + 1):
        try:
            r = session().get(url, params=params, timeout=timeout)
            r.raise_for_status()
            body = r.content
            if cache:
                cpath.write_bytes(body)
            return body
        except Exception as e:  # noqa: BLE001 - we want to retry on anything transient
            last = e
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))
    if cache and cpath.exists():
        log.warning("using stale cache for %s after error: %s", url, last)
        return cpath.read_bytes()
    raise RuntimeError(f"{type(last).__name__}: {last}")


def get_json(url: str, params: dict | None = None, timeout: int = 25):
    return json.loads(get(url, params, timeout).decode("utf-8", "replace"))
