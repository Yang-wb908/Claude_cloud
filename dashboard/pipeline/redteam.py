"""Automated red team: devil's-advocate counter-arguments on the board's key judgments and a Key Assumptions Check per
high-alert theater. Uses llm.complete_json (API key or subscription token). Appends dissent entries (by "redteam") to the
judgment ledger once per ISO week and writes dashboard/data/redteam.json for the DIB's 레드팀 section."""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from pathlib import Path

from . import llm
from .forecast import load_js

log = logging.getLogger("pipeline.redteam")
SYSTEM = ("너는 국가 정보기관의 레드팀(악마의 변호인)이다. 공식 판단을 무너뜨릴 가장 강한 반론을 쓴다. 각 판단에 대해: 반대 가설, 그 가설과 일치하는 기존 증거, "
          "공식 판단이 기대고 있는 핵심 가정 3개와 각 가정이 틀릴 경우의 결과, 반대 가설이 맞다면 2주 안에 보일 징후 3개, 대안 확률(0~1). 전역별 핵심 가정 점검(Key Assumptions Check)도 낸다. "
          "근거 없는 음모론 금지, 모든 반론은 상황판 데이터나 공개 보도로 검증 가능한 형태로. 한국어.")
SCHEMA = {"type": "object", "properties": {
    "judgments": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "counter": {"type": "string"}, "evidence": {"type": "array", "items": {"type": "string"}},
                                                                            "assumptions": {"type": "array", "items": {"type": "object", "properties": {"a": {"type": "string"}, "if_wrong": {"type": "string"}}, "required": ["a", "if_wrong"], "additionalProperties": False}},
                                                                            "indicators": {"type": "array", "items": {"type": "string"}}, "p_alt": {"type": "number"}},
                                             "required": ["id", "counter", "evidence", "assumptions", "indicators", "p_alt"], "additionalProperties": False}},
    "kac": {"type": "array", "items": {"type": "object", "properties": {"th": {"type": "string"}, "assumptions": {"type": "array", "items": {"type": "object", "properties": {"a": {"type": "string"}, "confidence": {"type": "string"}, "if_wrong": {"type": "string"}}, "required": ["a", "confidence", "if_wrong"], "additionalProperties": False}}},
                                       "required": ["th", "assumptions"], "additionalProperties": False}}},
    "required": ["judgments", "kac"], "additionalProperties": False}


def pick_judgments(ledger: dict, iw: dict, n: int = 6) -> list[dict]:
    items = [j for j in ledger["items"] if j.get("outcome") is None]
    bluf = [j for j in items if j["id"].startswith("bluf-")]
    rest = [j for j in items if not j["id"].startswith("bluf-") and j["id"].startswith("th-")]
    return (bluf + rest)[:n]


def run(dash: Path, write: bool = True) -> dict | None:
    if llm.mode() is None:
        log.warning("no Claude credentials; red team skipped")
        return None
    ledger = json.loads((dash / "data" / "judgments.json").read_text())
    iw = load_js(dash, "iw.js", "IW")
    picked = pick_judgments(ledger, iw)
    th_ctx = {k: {"judgments": [j["t"] for j in (v.get("judgments") or [])], "indicators": [f"{i['t']} [{i.get('s')}]" for i in (v.get("indicators") or [])], "scenarios": [f"{s['n']} {s['p']}" for s in (v.get("scenarios") or [])]} for k, v in iw["theaters"].items()}
    hot = [k for k in th_ctx][:6]
    user = json.dumps({"판단": [{"id": j["id"], "p": j["p"], "x": j["x"], "th": j.get("th")} for j in picked], "전역맥락": {k: th_ctx[k] for k in hot}, "오늘": datetime.now(UTC).strftime("%Y-%m-%d")}, ensure_ascii=False)
    res = llm.complete_json(SYSTEM, user, SCHEMA, max_tokens=12000, effort="medium")
    if not isinstance(res, dict) or "judgments" not in res:
        log.warning("red team returned no usable JSON")
        return None
    week = datetime.now(UTC).strftime("%G-W%V")
    byid = {j["id"]: j for j in ledger["items"]}
    added = 0
    for r in res["judgments"]:
        j = byid.get(r.get("id"))
        if not j:
            continue
        ds = j.setdefault("dissent", [])
        if any(d.get("by") == "redteam" and d.get("week") == week for d in ds):
            continue
        ds.append({"d": datetime.now(UTC).strftime("%Y-%m-%d"), "by": "redteam", "week": week, "x": (r.get("counter") or "")[:500], "p": r.get("p_alt"), "indicators": r.get("indicators", [])[:3]})
        added += 1
    out = {"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "week": week, "mode": llm.mode(), "judgments": res["judgments"], "kac": res.get("kac", []), "added": added}
    if write:
        (dash / "data" / "judgments.json").write_text(json.dumps(ledger, ensure_ascii=False, indent=1))
        (dash / "data" / "redteam.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    return out


def markdown(rt: dict) -> str:
    L = [f"### 레드팀 {rt['week']} ({rt.get('mode')})", ""]
    for r in rt["judgments"]:
        L += [f"- **{r['id']}** 반론(대안 {round((r.get('p_alt') or 0) * 100)}%): {r['counter']}", "  - 가정: " + " / ".join(f"{a['a']} → 틀리면 {a['if_wrong']}" for a in r.get("assumptions", [])[:3]), "  - 2주 내 징후: " + " · ".join(r.get("indicators", [])[:3])]
    for k in rt.get("kac", []):
        L += [f"- **핵심 가정 점검 · {k['th']}**: " + " / ".join(f"{a['a']} ({a['confidence']})" for a in k.get("assumptions", [])[:4])]
    return "\n".join(L)
