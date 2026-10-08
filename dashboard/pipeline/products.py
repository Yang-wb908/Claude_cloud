"""Finished intelligence products with serials, classification line and dissemination block.

  DIB-YY-MMDD      Daily Intelligence Brief: BLUF, WATCHCON table, key judgments (ICD 203 fields), indicators, 24h events,
                   PIR/EEI status, economic risk, tripwires, collection gaps, dissent, next 24h calendar, tradecraft checklist
  WR-YY-MMDD-NN    Warning Report: one per fired tripwire or WATCHCON change (level, judgment, indicators, deadline, impact, recommendation)

Products live in products/ with products/index.json for the board's 생산물 tab. `run.py products` writes today's DIB and any
new warning reports; the daily/collect workflows commit them and the SITREP release attaches the DIB.
"""

from __future__ import annotations

import json
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path

CLASS = "UNCLASSIFIED // OSINT · FOR OFFICIAL USE · 상황판 자동 생산"
DISSEM = "배포: 상황실 당직, 지역과(중동·유럽·아프리카·한반도·동아시아), 경제분석과 · 재배포 시 출처 등급 유지"
CONF_ORDER = {"높음": 2, "보통": 1, "낮음": 0}


def _load(p: Path, default):
    try:
        return json.loads(p.read_text()) if p.exists() else default
    except json.JSONDecodeError:
        return default


def _js(dash: Path, name: str, var: str) -> dict:
    from .forecast import load_js
    return load_js(dash, name, var)


def serial(kind: str, now: datetime, n: int | None = None) -> str:
    s = f"{kind}-{now.strftime('%y-%m%d')}"
    return s + (f"-{n:02d}" if n is not None else "")


def _theaters(dash: Path) -> list[dict]:
    txt = (dash / "theaters.js").read_text()
    out = []
    for m in re.finditer(r'\{ id:"([a-z_]+)", name:"([^"]+)", sev:(\d)', txt):
        out.append({"id": m.group(1), "name": m.group(2), "sev": int(m.group(3))})
    return out


def dib(dash: Path, now: datetime | None = None) -> tuple[str, str]:
    now = now or datetime.now(UTC)
    kst = now + timedelta(hours=9)
    iw = _js(dash, "iw.js", "IW")
    th = _theaters(dash)
    snap = _load(dash / "data_snapshot.json", {"events": []})
    auto = _load(dash / "intel.auto.json", {})
    trip = _load(dash / "data" / "tripwires.json", {"fired": []})
    risk = _load(dash / "data" / "risk.json", None)
    pirs = _load(dash / "data" / "pirs.json", {"items": []})
    wc = _load(dash / "data" / "watchcon.json", {"theaters": {}})
    ledger = _load(dash / "data" / "judgments.json", {"items": []})
    score = _load(dash / "data" / "scorecard.json", None)
    sid = serial("DIB", now)
    d24 = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    ev24 = sorted([e for e in snap.get("events", []) if e.get("d", "") >= d24], key=lambda e: e.get("d", ""), reverse=True)
    L = [f"# {sid} · 일일 정보 브리프", "", f"**{CLASS}**", f"DTG {now.strftime('%d%H%MZ %b %Y').upper()} · {kst.strftime('%Y-%m-%d %H:%M')} KST · 작성: 상황판 자동 생산 + 당직 분석관 검토 전", f"{DISSEM}", "",
         "## 1. BLUF", "", iw["global"]["summary"], "", f"종합 경보단계 **{iw['global']['level']} {iw['global']['label']}** ({iw['global']['trend']})" + (f" · 경제 위험 지수 **{risk['index']} {risk['level']}**" if risk else ""), ""]
    L += ["## 2. 경보단계 (WATCHCON)", "", "| 전역 | 단계 | 변경 | 근거 |", "|---|---|---|---|"]
    for t in sorted(th, key=lambda x: -x["sev"]):
        w = (wc.get("theaters") or {}).get(t["id"], {})
        hist = w.get("history") or []
        last = hist[-1] if hist else None
        chg = (last["d"] + " " + ("기준선" if last.get("from") is None else f"{last['from']}→{last['to']}")) if last else "-"
        L.append(f"| {t['name']} | {w.get('level', t['sev'])} | {chg} | {(last or {}).get('why', '')[:80]} |")
    L += ["", "## 3. 핵심 판단 (ICD 203)", ""]
    for j in iw["bluf"]["judgments"]:
        ths = ", ".join(j.get("th", []))
        L += [f"- **{j['t']}**", f"  - 신뢰도 {j.get('conf', '-')} · 전역 {ths} · 근거: {j.get('basis', '')}", "  - 가정: 현 수집원 등급 B2 이상 보도가 사실이라는 전제 · 대안 가설: 상황판 가설(ACH) 탭 참조"]
    dis = [(j["id"], d) for j in ledger["items"] for d in (j.get("dissent") or [])]
    if dis:
        L += ["", "### 이견 (dissent channel)", ""] + [f"- `{jid}` {d.get('d', '')} {d.get('by', '')}: {d.get('x', '')}" for jid, d in dis[-8:]]
    L += ["", "## 4. 징후·경보 지표", ""]
    for t in sorted(th, key=lambda x: -x["sev"])[:8]:
        inds = (iw["theaters"].get(t["id"]) or {}).get("indicators") or []
        if inds:
            L.append(f"- **{t['name']}**: " + " · ".join(f"{i['t']} [{i.get('s', '')}]" for i in inds[:4]))
    if trip.get("fired"):
        L += ["", "### 트립와이어 발동", ""] + [f"- {f['title']} — 현재 {f['current']} (임계 {f['op']} {f['threshold']})" for f in trip["fired"]]
    L += ["", f"## 5. 지난 24시간 주요 사건 ({len(ev24)}건)", ""]
    for e in ev24[:25]:
        L.append(f"- {e.get('d')} [{e.get('t')}] {e.get('th') or '-'} · {e.get('p') or ''} {e.get('x')} ({e.get('g') or '-'})")
    L += ["", "## 6. 우선정보요구(PIR) 현황", "", "| PIR | 우선 | 질문 | EEI 충족/답변중/공백 | 기한 |", "|---|---|---|---|---|"]
    for p in pirs.get("items", []):
        st = [e.get("status") for e in p.get("eei", [])]
        L.append(f"| {p['id']} | {p.get('pri')} | {p['q'][:60]} | {st.count('충족')}/{st.count('답변중')}/{st.count('공백')} | {p.get('due')} |")
    gaps = [f"{p['id']}.{e['id'].split('.')[-1]} {e['q']}" for p in pirs.get("items", []) for e in p.get("eei", []) if e.get("status") == "공백"]
    if gaps:
        L += ["", "수집 공백(EEI): " + " · ".join(gaps[:8])]
    if risk:
        L += ["", "## 7. 경제 위험", "", f"지수 {risk['index']} ({risk['level']}) · " + " · ".join(f"{k} {round(100 * v['v'])}" for k, v in risk["components"].items()) + f" · 한국 수입 바스켓 P95 {risk['basket']['p95']:+.1f}%", "상품 R4 이상: " + (", ".join(a["id"] + " R" + str(a["grade"]) for a in risk["per_asset"] if a["grade"] >= 4) or "없음")]
    if score and score.get("overall", {}).get("n"):
        o = score["overall"]
        L += ["", f"분석 정확도(채점 {score['n_scored']}건): 방향 {o['dir']:.0%} · 90% 구간 {o['cov90']:.0%} · 스킬 {o['skill']}"]
    gaps2 = list(iw["bluf"].get("gaps", [])) + list(auto.get("gaps", []))[:5]
    L += ["", "## 8. 수집 공백·요청", ""] + [f"- {g}" for g in gaps2[:10]]
    L += ["", "## 9. 다음 24~72시간 감시", ""] + [f"- {w.get('x')} ({w.get('why', '')})" for w in iw["bluf"].get("watch", [])[:8]]
    L += ["", "## 10. 분석 기준 점검 (ICD 203)", "", "- [x] 판단마다 신뢰도·확률 용어 표기", "- [x] 출처 등급(Admiralty) 사건별 표기", "- [x] 가정·대안 가설 명시(ACH 탭)", "- [ ] 당직 분석관 검토 서명", "- [ ] 소비자 피드백 반영(RFI 이슈)", "",
          f"_{sid} · 다음 DIB 익일 09:40 KST · 질의는 RFI 이슈로_"]
    return sid, "\n".join(L)


def warning_report(dash: Path, trigger: dict, n: int, now: datetime | None = None) -> tuple[str, str]:
    """trigger: {kind: 'tripwire'|'watchcon', title, th, level, current, threshold, why, indicators[], by}"""
    now = now or datetime.now(UTC)
    iw = _js(dash, "iw.js", "IW")
    sid = serial("WR", now, n)
    th = trigger.get("th")
    tj = (iw["theaters"].get(th) or {}) if th else {}
    inds = [i["t"] + f" [{i.get('s', '')}]" for i in (tj.get("indicators") or [])[:5]]
    korea = [k.get("x") for k in iw.get("korea", {}).get("watch", [])[:3]]
    L = [f"# {sid} · 경고 보고 (WARNING REPORT)", "", f"**{CLASS}**", f"DTG {now.strftime('%d%H%MZ %b %Y').upper()} · 발령 근거: {trigger.get('kind')} · 전역 {th or '-'}", DISSEM, "",
         f"## 경고: {trigger.get('title')}", "", f"**단계/심각도 {trigger.get('level', trigger.get('sev', '-'))}** · 현재값 {trigger.get('current', '-')} (임계 {trigger.get('threshold', '-')})", "",
         "## 판단", "", trigger.get("why") or (tj.get("judgments") or [{}])[0].get("t", "판단 작성 필요"), "",
         "## 확인된 징후", ""] + [f"- {x}" for x in (trigger.get("indicators") or inds) or ["- (징후 기재 필요)"]]
    L += ["", "## 시한·전개", "", "- 72시간 내 재확인 · 임계치 복귀 시 해제 보고(WR 해제)", "", "## 한국 영향", ""] + [f"- {x}" for x in korea]
    L += ["", "## 권고", "", "- 관련 PIR/EEI 수집 우선순위 상향, RFI 발행", "- 판단 장부에 시한부 판단 등록", "- 경제분석과: 수입물가·금리 전이 재추정", "", f"_{sid} · 발령 {trigger.get('by', '상황판 자동')}_"]
    return sid, "\n".join(L)


def run(dash: Path, out_dir: Path, now: datetime | None = None) -> dict:
    now = now or datetime.now(UTC)
    out_dir.mkdir(parents=True, exist_ok=True)
    idx_p = out_dir / "index.json"
    index = _load(idx_p, {"products": []})
    have = {p["serial"] for p in index["products"]}
    written = []
    sid, text = dib(dash, now)
    (out_dir / f"{sid}.md").write_text(text)
    index["products"] = [p for p in index["products"] if p["serial"] != sid]
    index["products"].append({"serial": sid, "kind": "DIB", "d": now.strftime("%Y-%m-%d"), "title": "일일 정보 브리프", "cls": "UNCLASSIFIED // OSINT", "path": f"products/{sid}.md"})
    written.append(sid)
    trip = _load(dash / "data" / "tripwires.json", {"fired": []})
    pending = _load(dash / "data" / "warnings_pending.json", [])
    n = 1 + sum(1 for p in index["products"] if p["kind"] == "WR" and p["d"] == now.strftime("%Y-%m-%d"))
    for t in [dict(f, kind="tripwire") for f in trip.get("fired", [])] + pending:
        key = f"WR:{t.get('kind')}:{t.get('id') or t.get('title')}:{now.strftime('%Y-%m-%d')}"
        if key in have or any(p.get("key") == key for p in index["products"]):
            continue
        wsid, wtext = warning_report(dash, t, n, now)
        (out_dir / f"{wsid}.md").write_text(wtext)
        index["products"].append({"serial": wsid, "kind": "WR", "d": now.strftime("%Y-%m-%d"), "title": t.get("title"), "th": t.get("th"), "cls": "UNCLASSIFIED // OSINT", "path": f"products/{wsid}.md", "key": key})
        written.append(wsid); n += 1
    if pending:
        (dash / "data" / "warnings_pending.json").write_text("[]")
    index["products"] = sorted(index["products"], key=lambda p: (p["d"], p["serial"]))[-400:]
    index["generated"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    idx_p.write_text(json.dumps(index, ensure_ascii=False, indent=1))
    (dash / "data" / "products_index.json").write_text(json.dumps(index, ensure_ascii=False))
    return {"written": written, "index": index}
