"""Coverage anomaly detection: relevant items that no theater claims.

Groups the enriched-but-unmapped items of the last N days by their strongest shared token (a place from the gazetteer, else a
capitalised bigram/unigram), and writes dashboard/data/coverage.json. A cluster of >= THRESH items trips `coverage_surge`
(tripwires.yaml, metric coverage.max_cluster) so the collect workflow opens a "[신규 전역 제안]" Issue. The board shows the
clusters in the 수집원 tab and the DIB lists them under 수집 공백.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import UTC, datetime, timedelta
from pathlib import Path

from . import enrich

STOP = set("the a an of in on at to for and or with from by as is are was were be been this that these those after over under into than its it their his her new says said reuters ap us un who wsj ft bbc cnn live update updates news report reports world u.s. mr ms monday tuesday wednesday thursday friday saturday sunday week month year".split())


def _key(item: dict) -> str | None:
    text = f"{item.get('title', '')} {item.get('summary', '')[:200]}"
    loc = enrich.geocode(text)
    if loc and loc.get("p"):
        return "place:" + loc["p"]
    caps = re.findall(r"\b([A-Z][a-zA-Z\-]{3,}(?:\s[A-Z][a-zA-Z\-]{2,})?)\b", item.get("title", ""))
    caps = [c for c in caps if c.lower() not in STOP and not c.isupper()]
    if caps:
        return "topic:" + Counter(caps).most_common(1)[0][0]
    toks = [t for t in re.findall(r"[a-z가-힣]{4,}", item.get("title", "").lower()) if t not in STOP]
    return ("word:" + Counter(toks).most_common(1)[0][0]) if toks else None


def clusters(items: list[dict], days: int = 3, now: datetime | None = None, min_size: int = 2) -> list[dict]:
    now = now or datetime.now(UTC)
    since = (now - timedelta(days=days)).strftime("%Y-%m-%d")
    groups: dict[str, list[dict]] = defaultdict(list)
    for it in items:
        e = it.get("enr") or {}
        if it.get("kind") not in ("news", "report") or e.get("th") or e.get("rel", 0) < 2 or it.get("published", "")[:10] < since:
            continue
        k = _key(it)
        if k:
            groups[k].append(it)
    out = []
    for k, its in groups.items():
        if len(its) < min_size:
            continue
        doms = sorted({(it.get("extra") or {}).get("domain", "") for it in its if (it.get("extra") or {}).get("domain")})
        types = Counter((it.get("enr") or {}).get("t") or "?" for it in its)
        out.append({"key": k, "n": len(its), "domains": len(doms), "types": dict(types), "since": min(it["published"][:10] for it in its),
                    "sample": [{"d": it["published"][:10], "title": it.get("title", "")[:120], "url": it.get("url", ""), "domain": (it.get("extra") or {}).get("domain", "")} for it in sorted(its, key=lambda x: x["published"], reverse=True)[:5]]})
    out.sort(key=lambda c: (-c["n"], -c["domains"]))
    return out


def run(dash: Path, items: list[dict], now: datetime | None = None, write: bool = True) -> dict:
    now = now or datetime.now(UTC)
    cl = clusters(items, now=now)
    res = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "days": 3, "unmapped_total": sum(c["n"] for c in cl), "max_cluster": cl[0]["n"] if cl else 0,
           "max_key": cl[0]["key"] if cl else None, "clusters": cl[:12]}
    if write:
        (dash / "data").mkdir(exist_ok=True)
        (dash / "data" / "coverage.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    return res
