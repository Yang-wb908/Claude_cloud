"""Find Sentinel-1 GRD products covering a point in the public AWS bucket.

The bucket has no spatial index, so this lists the products acquired on each
requested day and checks the footprint in each ``productInfo.json``. A day
holds roughly 800 IW dual-pol products; with parallel requests a day takes
around half a minute.
"""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from collections.abc import Iterable, Iterator
from concurrent.futures import ThreadPoolExecutor
from datetime import date

from shapely.geometry import Point, shape

from .s1 import AWS_BASE


def _get(url: str) -> str:
    with urllib.request.urlopen(url, timeout=60) as resp:
        return resp.read().decode()


def list_prefixes(prefix: str) -> list[str]:
    """Immediate sub-prefixes of ``prefix`` in the bucket (handles pagination)."""
    out: list[str] = []
    token = None
    while True:
        query = {"list-type": "2", "delimiter": "/", "prefix": prefix}
        if token:
            query["continuation-token"] = token
        xml = _get(f"{AWS_BASE}/?{urllib.parse.urlencode(query)}")
        out += [p for p in re.findall(r"<Prefix>([^<]*)</Prefix>", xml) if p != prefix]
        m = re.search(r"<NextContinuationToken>([^<]*)</NextContinuationToken>", xml)
        if not m:
            return out
        token = m.group(1)


def search(lon: float, lat: float, days: Iterable[date], mode: str = "IW",
           polarisation: str = "DV", workers: int = 32) -> Iterator[dict]:
    """Yield ``productInfo`` dicts of products whose footprint contains (lon, lat)."""
    point = Point(lon, lat)

    def check(prefix: str) -> dict | None:
        try:
            info = json.loads(_get(f"{AWS_BASE}/{prefix}productInfo.json"))
        except (OSError, ValueError):
            return None
        return info if shape(info["footprint"]).contains(point) else None

    with ThreadPoolExecutor(workers) as pool:
        for day in days:
            prefixes = list_prefixes(f"GRD/{day.year}/{day.month}/{day.day}/{mode}/{polarisation}/")
            for info in pool.map(check, prefixes):
                if info:
                    yield info
