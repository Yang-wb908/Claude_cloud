"""Self-scoring of the judgment ledger (data/judgments.json).

1. sync_scenarios: every house-view scenario probability becomes a ledger item (id scn-<id>-<asof>), due after the
   scenario's horizon, so scenario calls are scored like written judgments.
2. resolve: judgments past their due date (daily) — and on Mondays every open judgment, for early resolution — go to Claude
   with the evidence the board has collected since the judgment was made (events in its theaters, fired tripwires, market
   quotes). Claude answers 1 (came true), 0 (did not) or null (not enough evidence). Only "높음"/"보통" confidence verdicts
   are written, marked by="auto"; an analyst verdict through the judgment Issue form always overrides. Undecidable items
   past due are retried weekly, up to 4 times.
3. review: weekly hit/miss review with Brier score and calibration (data/review.json + reports/REVIEW-YYYY-Www.md).
"""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime, timedelta
from pathlib import Path

from . import llm
from .forecast import load_js

log = logging.getLogger("pipeline.resolve")
MAX_TRIES = 4
BATCH = 8

SYSTEM = ("너는 정보기관의 판정관이다. 각 판단(예측) 문장이 실제로 맞았는지, 제공된 근거(수집된 사건·트립와이어·시세)만으로 판정한다. "
          "outcome: 1 = 판단대로 됐다, 0 = 판단과 반대로 됐다, null = 근거가 부족하거나 아직 판정할 수 없다. "
          "기한이 지나지 않았어도 결과가 이미 확정됐으면(예: '~할 것' 이 이미 일어났거나, 일어날 수 없게 확정) 판정한다. "
          "'가능성이 높다'처럼 확률로 쓴 판단은 그 사건이 실제로 일어났는지로 판정한다(확률 자체의 옳고 그름이 아니라). "
          "추측하지 말고, 근거가 애매하면 null 과 confidence '낮음'을 준다. rationale 은 한국어 1~2문장, evidence 는 판정에 쓴 근거 URL(제공된 것 중) 최대 3개.")
SCHEMA = {"type": "object", "additionalProperties": False, "required": ["items"], "properties": {"items": {"type": "array", "items": {
    "type": "object", "additionalProperties": False, "required": ["id", "outcome", "confidence", "rationale", "evidence"],
    "properties": {"id": {"type": "string"}, "outcome": {"anyOf": [{"type": "integer", "enum": [0, 1]}, {"type": "null"}]},
                   "confidence": {"type": "string", "enum": ["높음", "보통", "낮음"]}, "rationale": {"type": "string"},
                   "evidence": {"type": "array", "items": {"type": "string"}}}}}}}


def _load(p: Path, default):
    return json.loads(p.read_text()) if p.exists() else default


# ── 1. scenarios → ledger ───────────────────────────────────────────────────
def sync_scenarios(dash: Path, ledger: dict) -> int:
    house = _load(dash / "data" / "house_view.json", None)
    if not house or not house.get("asof"):
        return 0
    try:
        scen = {t["id"]: t for t in load_js(dash, "scenario.js", "SCEN")["templates"]}
    except Exception as e:  # noqa: BLE001
        log.warning("scenario templates unreadable: %s", e); return 0
    have = {j["id"] for j in ledger["items"]}
    asof = house["asof"]
    added = 0
    for v in house.get("scenarios", []):
        t = scen.get(v["id"])
        if not t or v.get("p") is None:
            continue
        jid = f"scn-{v['id']}-{asof}"
        if jid in have:
            continue
        due = (datetime.strptime(asof, "%Y-%m-%d") + timedelta(days=int(t.get("h") or 30))).strftime("%Y-%m-%d")
        ledger["items"].append({"id": jid, "d": asof, "x": f"[시나리오] {t['n']} — {t.get('d', '')}"[:300], "p": round(v["p"] / 100, 3), "th": [t["th"]] if t.get("th") else [],
                                "conf": "보통", "due": due, "src": "house_view", "outcome": None, "resolved": None, "note": ""})
        added += 1
    return added


# ── 2. resolve ──────────────────────────────────────────────────────────────
def evidence(j: dict, snap: dict, trip: dict, auto: dict, limit: int = 40) -> dict:
    ths = set(j.get("th") or [])
    since = j.get("d") or "0000"
    ev = [e for e in snap.get("events", []) if e.get("d", "") >= since and (not ths or e.get("th") in ths)]
    ev.sort(key=lambda e: (e.get("r", 2), e.get("d", "")), reverse=True)
    return {"events": [[e.get("d"), e.get("t"), e.get("p") or "", (e.get("x") or "")[:160], e.get("s") or ""] for e in ev[:limit]],
            "tripwires_now": [f"{f['title']} (현재 {f.get('current')})" for f in trip.get("fired", [])][:12],
            "markets": [[m.get("sym"), m.get("v"), m.get("chg")] for m in (auto.get("markets") or [])][:30]}


def candidates(items: list[dict], now: datetime, sweep: bool) -> list[dict]:
    today = now.strftime("%Y-%m-%d")
    out = []
    for j in items:
        if j.get("outcome") is not None or j.get("by") not in (None, "auto") or j.get("auto_tries", 0) >= MAX_TRIES:
            continue
        due_now = j.get("due") and j["due"] <= today and (not j.get("auto_next") or j["auto_next"] <= today)
        if due_now or sweep:
            out.append(j)
    return out


def apply_verdicts(items: list[dict], verdicts: list[dict], now: datetime) -> dict:
    by = {j["id"]: j for j in items}
    today = now.strftime("%Y-%m-%d")
    stats = {"resolved": 0, "held": 0}
    for v in verdicts:
        j = by.get(v.get("id"))
        if not j or j.get("outcome") is not None:
            continue
        past_due = bool(j.get("due")) and j["due"] <= today
        if v.get("outcome") in (0, 1) and v.get("confidence") in ("높음", "보통"):
            j.update({"outcome": v["outcome"], "resolved": today, "by": "auto", "note": ("자동 판정(" + v["confidence"] + "): " + (v.get("rationale") or ""))[:300],
                      "evidence": [u for u in (v.get("evidence") or []) if isinstance(u, str)][:3]})
            stats["resolved"] += 1
        elif past_due:  # 기한이 지났는데 판정 못 함 → 1주 뒤 다시
            j["auto_tries"] = j.get("auto_tries", 0) + 1
            j["auto_next"] = (now + timedelta(days=7)).strftime("%Y-%m-%d")
            j["note"] = ("판정 보류: " + (v.get("rationale") or "근거 부족"))[:300] if j["auto_tries"] < MAX_TRIES else "자동 판정 불가 — 분석관 판정 필요"
            stats["held"] += 1
    return stats


def resolve(dash: Path, now: datetime | None = None, sweep: bool | None = None, judge=None) -> dict:
    now = now or datetime.now(UTC)
    path = dash / "data" / "judgments.json"
    ledger = _load(path, {"items": []})
    added = sync_scenarios(dash, ledger)
    sweep = now.weekday() == 0 if sweep is None else sweep
    cand = candidates(ledger["items"], now, sweep)
    stats = {"scenario_items_added": added, "candidates": len(cand), "resolved": 0, "held": 0, "sweep": sweep}
    if cand and (judge or llm.mode()):
        snap = _load(dash / "data_snapshot.json", {"events": []})
        trip = _load(dash / "data" / "tripwires.json", {"fired": []})
        auto = _load(dash / "intel.auto.json", {})
        judge = judge or (lambda batch: llm.complete_json(SYSTEM, json.dumps(batch, ensure_ascii=False), SCHEMA, 6000, "medium"))
        # 같은 전역 판단끼리 묶어 근거를 한 번만 보낸다
        groups: dict[str, list] = {}
        for j in cand:
            groups.setdefault(",".join(sorted(j.get("th") or ["_"])), []).append(j)
        for key, js in groups.items():
            for i in range(0, len(js), BATCH):
                chunk = js[i:i + BATCH]
                payload = {"today": now.strftime("%Y-%m-%d"), "judgments": [{"id": j["id"], "made": j.get("d"), "due": j.get("due"), "p": j.get("p"), "text": j["x"]} for j in chunk],
                           "evidence": evidence(chunk[0], snap, trip, auto)}
                res = judge(payload)
                verdicts = (res or {}).get("items", []) if isinstance(res, dict) else []
                s = apply_verdicts(ledger["items"], verdicts, now)
                stats["resolved"] += s["resolved"]; stats["held"] += s["held"]
    if added or stats["resolved"] or stats["held"]:
        ledger["asof"] = now.strftime("%Y-%m-%d")
        path.write_text(json.dumps(ledger, ensure_ascii=False, indent=1))
    log.info("resolve: %s", stats)
    return stats


# ── 3. review ───────────────────────────────────────────────────────────────
BANDS = [(0.0, 0.2), (0.2, 0.4), (0.4, 0.6), (0.6, 0.8), (0.8, 1.01)]


def review(dash: Path, now: datetime | None = None, write: bool = True) -> dict:
    now = now or datetime.now(UTC)
    items = _load(dash / "data" / "judgments.json", {"items": []})["items"]
    done = [j for j in items if j.get("outcome") in (0, 1) and j.get("p") is not None]
    week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    brier = lambda xs: round(sum((j["p"] - j["outcome"]) ** 2 for j in xs) / len(xs), 3) if xs else None
    hit = lambda j: (j["p"] >= 0.5) == (j["outcome"] == 1)
    cal = []
    for lo, hi in BANDS:
        b = [j for j in done if lo <= j["p"] < hi]
        if b:
            cal.append({"band": f"{round(lo * 100)}–{min(100, round(hi * 100))}%", "n": len(b), "said": round(sum(j["p"] for j in b) / len(b), 2), "happened": round(sum(j["outcome"] for j in b) / len(b), 2)})
    grp = lambda j: "시나리오" if j.get("src") == "house_view" else "브리프" if str(j.get("src", "")).startswith("IW.bluf") else "전역" if str(j.get("src", "")).startswith("IW.theaters") else "시장·경제"
    by_src = {}
    for j in done:
        by_src.setdefault(grp(j), []).append(j)
    recent = sorted([j for j in done if (j.get("resolved") or "") >= week_ago], key=lambda j: j.get("resolved") or "", reverse=True)
    over = [c for c in cal if c["n"] >= 3 and abs(c["said"] - c["happened"]) >= 0.2]
    doc = {"generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "week": now.strftime("%G-W%V"), "n_total": len(items), "n_resolved": len(done),
           "n_open": sum(1 for j in items if j.get("outcome") is None), "n_overdue": sum(1 for j in items if j.get("outcome") is None and j.get("due") and j["due"] < now.strftime("%Y-%m-%d")),
           "brier": brier(done), "hit_rate": round(sum(hit(j) for j in done) / len(done), 2) if done else None, "auto_share": round(sum(1 for j in done if j.get("by") == "auto") / len(done), 2) if done else None,
           "calibration": cal, "by_src": {k: {"n": len(v), "brier": brier(v)} for k, v in by_src.items()},
           "miscalibrated": [f"{c['band']} 라고 한 판단이 실제로는 {round(c['happened'] * 100)}% 일어남 ({c['n']}건)" for c in over],
           "recent": [{"id": j["id"], "x": j["x"][:140], "p": j["p"], "outcome": j["outcome"], "hit": hit(j), "by": j.get("by"), "note": (j.get("note") or "")[:200], "resolved": j.get("resolved")} for j in recent[:20]]}
    if write:
        (dash / "data" / "review.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1))
        if now.weekday() == 0:
            rep = dash.parent / "reports"
            rep.mkdir(exist_ok=True)
            (rep / f"REVIEW-{doc['week']}.md").write_text(markdown(doc))
    return doc


def markdown(d: dict) -> str:
    L = [f"# 주간 판단 자기 채점 {d['week']}", "", f"장부 {d['n_total']}건 · 판정 {d['n_resolved']}건 · 미판정 {d['n_open']}건 (기한 경과 {d['n_overdue']}건)", ""]
    if d["n_resolved"]:
        L += [f"**Brier {d['brier']}** (0 완벽, 0.25 동전 던지기) · 방향 적중률 {round(d['hit_rate'] * 100)}% · 자동 판정 비율 {round(d['auto_share'] * 100)}%", ""]
        L += ["| 확률 구간 | 건수 | 우리가 말한 평균 | 실제 발생 |", "|---|---|---|---|"] + [f"| {c['band']} | {c['n']} | {round(c['said'] * 100)}% | {round(c['happened'] * 100)}% |" for c in d["calibration"]] + [""]
        if d["miscalibrated"]:
            L += ["**보정 필요**: " + " · ".join(d["miscalibrated"]), ""]
    if d["recent"]:
        L += ["## 이번 주 판정", ""] + [f"- {'✅ 맞힘' if r['hit'] else '❌ 틀림'} ({round(r['p'] * 100)}% → {'발생' if r['outcome'] else '미발생'}) {r['x']}" + (f" — {r['note']}" if r["note"] else "") for r in d["recent"]]
    return "\n".join(L)


def run(dash: Path, now: datetime | None = None) -> dict:
    st = resolve(dash, now)
    rv = review(dash, now)
    return {"resolve": st, "review": {k: rv[k] for k in ("n_resolved", "brier", "hit_rate")}}
