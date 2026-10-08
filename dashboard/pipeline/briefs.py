"""Daily automatic theater briefs. For every theater with enough recent events, Claude rewrites the dossier headline,
3-4 bullet findings, up to 3 numeric metrics and the cited sources strictly from the collected events (Korean summaries,
URLs, credibility). The result overlays theaters.js in the page (data/theater_briefs.json); theaters without enough
events keep their previous auto brief or the hand-written text. Model defaults to Sonnet to keep the daily cost small."""

from __future__ import annotations

import json
import logging
import os
import re
import subprocess
from datetime import UTC, datetime, timedelta
from pathlib import Path

from . import llm

log = logging.getLogger("pipeline.briefs")

SYSTEM = ("너는 국가 정보기관 상황실의 당직 분석관이다. 한 전역의 최근 72시간 수집 사건 목록(한국어 요약, 날짜, 유형, 지명, 신빙성 등급, 출처 URL)을 받아 "
          "전역 브리핑을 다시 쓴다. 규칙: (1) 사건 목록에 있는 사실만 쓴다. 목록에 없는 숫자·이름·날짜를 만들지 않는다. (2) headline 은 2문장 이내, 가장 중요한 변화를 먼저. "
          "(3) brief 는 3~4개 불릿, 각 70자 이내, 사실 위주, 날짜(월/일)를 붙인다. (4) metrics 는 사건에 숫자가 명시된 경우에만 0~3개 (v 숫자, l 무엇의 수치인지, n 날짜·출처 메모). "
          "(5) sources 는 실제로 인용한 사건의 URL 2~4개 (name 은 매체명+주제). (6) trend 는 72시간 추세 up/flat/down. "
          "(7) 사건이 서로 모순되면 신빙성 숫자가 낮은(1에 가까운) 쪽을 따르고 '보도' '미확인'을 붙인다. (8) 쓸 만한 사건이 3건 미만이거나 전부 사소하면 skip=true. 한국어.")
SCHEMA = {"type": "object", "properties": {
    "skip": {"type": "boolean"},
    "headline": {"type": "string"},
    "brief": {"type": "array", "items": {"type": "string"}},
    "metrics": {"type": "array", "items": {"type": "object", "properties": {"v": {"type": "string"}, "l": {"type": "string"}, "n": {"type": "string"}}, "required": ["v", "l", "n"], "additionalProperties": False}},
    "sources": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "url": {"type": "string"}}, "required": ["name", "url"], "additionalProperties": False}},
    "trend": {"type": "string", "enum": ["up", "flat", "down"]}},
    "required": ["skip", "headline", "brief", "metrics", "sources", "trend"], "additionalProperties": False}


def theaters(dash: Path) -> list[dict]:
    """id/name/headline of every theater in theaters.js (evaluated with node, like the other JS data modules)."""
    js = ("globalThis.window={};(0,eval)(require('fs').readFileSync(" + json.dumps(str(dash / "theaters.js")) + ",'utf8')"
          ".replace(/<script>|<\\/script>/g,'').replace(/^const /mg,'var '));"
          "console.log(JSON.stringify(THEATERS.map(t=>({id:t.id,name:t.name,headline:t.headline,asof:t.asof}))))")
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def events_for(snap: dict, th: str, now: datetime, days: int = 3, limit: int = 30) -> list[dict]:
    cut = (now - timedelta(days=days)).strftime("%Y-%m-%d")
    ev = [e for e in snap.get("events", []) if e.get("th") == th and e.get("d", "") >= cut and e.get("x")]
    ev.sort(key=lambda e: (e.get("r", 2), e.get("d", "")), reverse=True)
    return ev[:limit]


def brief_one(t: dict, ev: list[dict], model: str | None) -> dict | None:
    lines = [{"d": e.get("d"), "t": e.get("t"), "p": e.get("p") or "", "g": e.get("g") or "", "cc": e.get("cc", 1), "x": e.get("x"), "url": e.get("s") or ""} for e in ev]
    user = (f"전역: {t['name']} (id {t['id']})\n기존 브리핑(참고용, 오래됐을 수 있음): {t.get('headline') or ''}\n\n최근 72시간 사건 {len(lines)}건:\n"
            + json.dumps(lines, ensure_ascii=False))
    res = llm.complete_json(SYSTEM, user, SCHEMA, 3000, "medium", model=model)
    if not isinstance(res, dict) or res.get("skip") or not res.get("headline"):
        return None
    urls = {e.get("s") for e in ev if e.get("s")}
    res["sources"] = [s for s in res.get("sources", []) if s.get("url") in urls][:4]  # 인용은 실제 사건 URL만
    res["brief"] = [b for b in res.get("brief", []) if b][:4]
    res["metrics"] = [m for m in res.get("metrics", []) if m.get("v") and m.get("l")][:3]
    return res


def run(dash: Path, now: datetime | None = None, write: bool = True, only: list[str] | None = None) -> dict | None:
    if llm.mode() is None:
        log.info("briefs: no Claude credentials, skipping"); return None
    now = now or datetime.now(UTC)
    model = os.environ.get("PIPELINE_BRIEF_MODEL") or "claude-sonnet-5-5"
    snap = json.loads((dash / "data_snapshot.json").read_text()) if (dash / "data_snapshot.json").exists() else {"events": []}
    out_path = dash / "data" / "theater_briefs.json"
    prev = json.loads(out_path.read_text()) if out_path.exists() else {"items": {}}
    items = dict(prev.get("items", {}))
    done, skipped = 0, 0
    for t in theaters(dash):
        if only and t["id"] not in only:
            continue
        ev = events_for(snap, t["id"], now)
        if len(ev) < 3:
            skipped += 1; continue
        res = brief_one(t, ev, model)
        if not res:
            skipped += 1; continue
        items[t["id"]] = {"d": now.strftime("%Y-%m-%d"), "asof": now.strftime("%m/%d").lstrip("0").replace("/0", "/"), "headline": res["headline"], "brief": res["brief"],
                          "metrics": res["metrics"], "sources": res["sources"], "trend": res.get("trend", "flat"), "n_events": len(ev), "model": model}
        done += 1
    doc = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "model": model, "items": items}
    if write:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(doc, ensure_ascii=False, indent=1))
    log.info("briefs: %d theaters rewritten, %d kept previous/skipped (model %s)", done, skipped, model)
    return doc
