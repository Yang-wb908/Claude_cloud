"""Daily SITREP in Markdown. Attached to a GitHub Release by the sitrep workflow.

The report is assembled from data files (no network). When Claude credentials are present a short
BLUF paragraph is generated from the same data; otherwise the BLUF is a deterministic summary.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import UTC, datetime, timedelta
from pathlib import Path

from .enrich import grade_url

log = logging.getLogger("pipeline.report")
TYPE_KO = {"S": "공습·드론·미사일", "G": "지상전·점령", "M": "해상", "A": "테러·민간인 공격", "D": "외교·정치", "E": "경제·제재", "H": "보건", "X": "재난·사고", "C": "범죄·치안"}
TH_KO = {"iran": "이란·호르무즈", "ukraine": "러시아–우크라이나", "yemen": "예멘·홍해", "ethiopia": "에티오피아·티그라이", "sudan": "수단", "gaza": "가자·서안", "afpak": "아프간–파키스탄",
         "korea": "한반도", "lebanon": "레바논·시리아", "sahel": "사헬", "drc": "콩고 동부", "somalia": "소말리아·아덴만", "myanmar": "미얀마", "taiwan": "대만해협", "scs": "남중국해", "carib": "카리브해"}


def _bluf_claude(payload: dict) -> str | None:
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        return None
    try:
        import anthropic
        client = anthropic.Anthropic()
        resp = client.beta.messages.create(
            model=os.environ.get("PIPELINE_MODEL", "claude-opus-5-5"), max_tokens=2000,
            betas=["server-side-fallback-2026-07-01"], fallbacks="default",
            system="너는 국가 정보기관의 일일 상황보고(SITREP) 작성관이다. 주어진 데이터만 근거로 한국어 BLUF 4~6문장을 쓴다. 수치는 날짜와 함께, 추론은 추론이라 밝힌다. 마크다운 기호 없이 평문.",
            messages=[{"role": "user", "content": json.dumps(payload, ensure_ascii=False)[:60000]}],
        )
        if resp.stop_reason == "refusal":
            return None
        return next(b.text for b in resp.content if b.type == "text").strip()
    except Exception as e:  # noqa: BLE001 - report must still be written
        log.warning("Claude BLUF failed: %s", e)
        return None


def build_report(dash: Path, now: datetime | None = None) -> str:
    now = now or datetime.now(UTC)
    snap = json.loads((dash / "data_snapshot.json").read_text())
    auto = json.loads((dash / "intel.auto.json").read_text()) if (dash / "intel.auto.json").exists() else {}
    trip = json.loads((dash / "data" / "tripwires.json").read_text()) if (dash / "data" / "tripwires.json").exists() else {"fired": []}
    since = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    ev24 = [e for e in snap.get("events", []) if e.get("d", "") >= since]
    by_th: dict[str, list] = {}
    for e in ev24:
        by_th.setdefault(e.get("th") or "기타", []).append(e)
    date = now.strftime("%Y-%m-%d")
    dtg = now.strftime("%d%H%MZ %b %y").upper()
    payload = {"date": date, "events_24h": [[e["d"], TYPE_KO.get(e["t"], e["t"]), TH_KO.get(e.get("th") or "", "기타"), e.get("p"), e["x"]] for e in ev24[:120]],
               "markets": auto.get("markets", []), "portwatch": {k: v.get("latest") for k, v in (auto.get("portwatch") or {}).items()}, "tripwires": trip.get("fired", []),
               "changes": auto.get("changes", {})}
    bluf = _bluf_claude(payload) or (f"지난 24시간 사건 {len(ev24)}건이 수집됐고, 가장 많은 전역은 "
                                    + (", ".join(f"{TH_KO.get(k, k)} {len(v)}건" for k, v in sorted(by_th.items(), key=lambda kv: -len(kv[1]))[:3]) or "없음")
                                    + f"입니다. 트립와이어 {len(trip.get('fired', []))}건이 발동 상태입니다. 자동 생성 요약이며 분석관 판단이 아닙니다.")
    lines = [f"# SITREP {date}", "", f"**DTG** {dtg} · UNCLASSIFIED // OSINT · 자동 수집 {auto.get('generated', '-')}", "", "## BLUF", "", bluf, ""]
    if trip.get("fired"):
        lines += ["## 트립와이어 발동", ""] + [f"- **{t['title']}** — 현재 {t['current']} (임계 {t['op']} {t['threshold']}) · {t.get('why', '')}" for t in trip["fired"]] + [""]
    lines += ["## 전역별 24시간 사건", ""]
    for th, evs in sorted(by_th.items(), key=lambda kv: -len(kv[1])):
        lines.append(f"### {TH_KO.get(th, th)} ({len(evs)}건)")
        for e in evs[:8]:
            src = f" [출처]({e['s']})" if e.get("s") else ""
            lines.append(f"- {e['d']} · {TYPE_KO.get(e['t'], e['t'])} · {e.get('p') or ''} — {e['x']}{src} `{e.get("g") or ""}`")
        lines.append("")
    if auto.get("markets"):
        lines += ["## 시장", "", "| 지표 | 값 | 날짜 | 변동 |", "|---|---:|---|---|"] + [f"| {m['l']} | {m['v']} | {m['d']} | {m.get('chg', '')} |" for m in auto["markets"]] + [""]
    if auto.get("portwatch"):
        lines += ["## 해협 통항 (IMF PortWatch)", "", "| 해협 | 최신일 | 척수 | 7일 평균 | 28일 평균 |", "|---|---|---:|---:|---:|"]
        for k, v in auto["portwatch"].items():
            L = v.get("latest") or {}
            lines.append(f"| {k} | {L.get('d', '-')} | {L.get('n_total', '-')} | {v.get('avg7', '-')} | {v.get('avg28', '-')} |")
        lines.append("")
    srcs = auto.get("sources", [])
    if srcs:
        ok = sum(1 for s in srcs if s.get("ok"))
        lines += [f"## 수집원 상태 ({ok}/{len(srcs)} 정상)", ""] + [f"- ❌ {s['name']}: {s.get('err', '')}" for s in srcs if not s.get("ok")] + [""]
    if auto.get("gaps"):
        lines += ["## 수집 공백", ""] + [f"- {g}" for g in auto["gaps"]] + [""]
    lines += ["---", "자동 생성 보고서. 분석관 핵심판단(iw.js)은 사람이 검토해 PR로 갱신합니다."]
    return "\n".join(lines)


def run(dash: Path, out_dir: Path) -> Path:
    now = datetime.now(UTC)
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"SITREP-{now.strftime('%Y-%m-%d')}.md"
    path.write_text(build_report(dash, now))
    (out_dir / "LATEST.md").write_text(path.read_text())
    return path
