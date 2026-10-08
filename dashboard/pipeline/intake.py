"""GitHub Issue intake: turn issue-form submissions into data changes and a reply comment.

    python dashboard/pipeline/intake.py scenario   # computes the shock matrix for the submitted scenario set
    python dashboard/pipeline/intake.py judgment   # records analyst verdicts into dashboard/data/judgments.json
    python dashboard/pipeline/intake.py event      # appends a field report to dashboard/data_snapshot.json

Reads ISSUE_BODY (form markdown) and ISSUE_NUMBER / ISSUE_AUTHOR from the environment, prints the reply markdown to stdout,
and writes `changed=true|false` to $GITHUB_OUTPUT when present. The workflow commits whatever changed.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
DASH = HERE.parent
sys.path.insert(0, str(DASH))
from pipeline import backtest, enrich  # noqa: E402


def parse_form(body: str) -> dict[str, str]:
    """GitHub issue forms render as '### Label\\n\\nvalue' blocks."""
    out: dict[str, str] = {}
    for m in re.finditer(r"^### (.+?)\n+(.*?)(?=^### |\Z)", body.replace("\r", ""), re.S | re.M):
        v = m.group(2).strip()
        out[m.group(1).strip()] = "" if v in ("_No response_", "None") else v
    return out


def set_output(key: str, val: str) -> None:
    p = os.environ.get("GITHUB_OUTPUT")
    if p:
        with open(p, "a") as f:
            f.write(f"{key}={val}\n")


def git_user() -> str:
    return os.environ.get("ISSUE_AUTHOR", "analyst")


# ── scenario ────────────────────────────────────────────────────────────────
def scenario(form: dict) -> str:
    spec = form.get("시나리오 설정") or form.get("scenarios") or ""
    pairs = [p.strip() for p in re.split(r"[,\n]", spec) if p.strip()]
    if not pairs:
        return "시나리오 설정을 읽지 못했습니다. `id:확률:강도` 형식으로 쉼표 구분해 적어 주세요. 예: `hormuz_war:15:1.5,redsea_houthi:30:1`"
    js = f"""
const fs = require('fs'); globalThis.window = {{}};
const load = f => (0, eval)(fs.readFileSync(f, 'utf8').replace(/^const /m, 'var '));
load('{DASH}/commodities.js'); load('{DASH}/scenario.js');
const spec = {json.dumps(pairs)}.map(p => {{ const [id, pr, k] = p.split(':'); return {{id, p: +pr || null, k: +k || 1}}; }});
const T = Object.fromEntries(SCEN.templates.map(t => [t.id, t])); const CM = Object.fromEntries(COMMOD.registry.map(c => [c.id, c.n]));
const sel = spec.filter(s => T[s.id]).map(s => ({{t: T[s.id], p: (s.p == null ? T[s.id].p : s.p) / 100, k: s.k}}));
if (!sel.length) {{ console.log('알 수 없는 시나리오 id: ' + spec.map(s => s.id).join(', ') + '\\n\\n사용 가능: ' + SCEN.templates.map(t => t.id + ' (' + t.n + ')').join(', ')); process.exit(0); }}
const groups = {{}}; sel.forEach(s => (groups[s.t.th] = groups[s.t.th] || []).push(s));
const gl = Object.values(groups).map(g => {{ const sum = g.reduce((a, s) => a + s.p, 0); const n = sum > 1 ? 1 / sum : 1; return g.map(s => ({{...s, p: s.p * n}})); }});
const H = Math.max(...sel.map(s => s.t.h)); const N = 5000;
const gauss = () => {{ let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }};
const assets = Object.keys(SCEN.assets).filter(a => sel.some(s => s.t.shocks[a])); const sims = {{}}; const exp = {{}}; assets.forEach(a => {{ sims[a] = []; exp[a] = 0; }});
gl.forEach(g => g.forEach(s => Object.entries(s.t.shocks).forEach(([a, sh]) => exp[a] += s.p * s.k * sh.m)));
for (let i = 0; i < N; i++) {{ const shock = {{}}; gl.forEach(g => {{ const u = Math.random(); let c = 0; for (const s of g) {{ c += s.p; if (u < c) {{ Object.entries(s.t.shocks).forEach(([a, sh]) => shock[a] = (shock[a] || 0) + s.k * (sh.m + sh.s * gauss())); break; }} }} }});
  assets.forEach(a => {{ const A = SCEN.assets[a]; const noise = A.bp ? 12 * Math.sqrt(H / 20) * gauss() : A.vol * Math.sqrt(H / 252) * gauss(); sims[a].push(A.bp ? (shock[a] || 0) + noise : Math.max(-95, (shock[a] || 0) + noise)); }}); }}
const q = (arr, f) => {{ const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(f * s.length))]; }};
const f = (v, bp) => (v > 0 ? '+' : '') + (bp ? Math.round(v) + 'bp' : (Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1)) + '%');
const rows = assets.map(a => ({{a, bp: !!SCEN.assets[a].bp, e: exp[a], p5: q(sims[a], .05), p50: q(sims[a], .5), p95: q(sims[a], .95), up: sims[a].filter(x => x > 0).length / N}})).sort((x, y) => Math.abs(y.e) - Math.abs(x.e));
const L = ['### 시나리오 충격 평가 (몬테카를로 ' + N + '회, 지평 ' + H + '일)', '', '| 시나리오 | 확률 | 강도 |', '|---|---|---|'];
sel.forEach(s => L.push('| ' + s.t.n + ' | ' + Math.round(s.p * 100) + '% | ×' + s.k + ' |'));
L.push('', '| 상품 | 기대 변동 | P5 | 중앙값 | P95 | 상승 확률 |', '|---|---|---|---|---|---|');
rows.forEach(r => L.push('| ' + (CM[r.a] || r.a) + ' | ' + f(r.e, r.bp) + ' | ' + f(r.p5, r.bp) + ' | ' + f(r.p50, r.bp) + ' | ' + f(r.p95, r.bp) + ' | ' + Math.round(r.up * 100) + '% |'));
L.push('', '**한국 영향**'); sel.forEach(s => L.push('- ' + s.t.n + ': ' + s.t.korea));
L.push('', '**감시 지표**'); sel.forEach(s => (s.t.watch || []).forEach(w => L.push('- [' + s.t.n + '] ' + w)));
console.log(L.join('\\n'));
"""
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=False)
    if r.returncode != 0:
        return "시나리오 계산 실패:\n```\n" + r.stderr[-1500:] + "\n```"
    note = form.get("분석관 메모") or ""
    adopt = "[x]" in (form.get("하우스 뷰") or "").lower()
    adopted = ""
    if adopt:
        view = []
        for pr in pairs:
            bits = pr.split(":")
            try:
                view.append({"id": bits[0], "p": float(bits[1]) if len(bits) > 1 and bits[1] else None, "k": float(bits[2]) if len(bits) > 2 and bits[2] else 1})
            except ValueError:
                continue
        hv = DASH / "data" / "house_view.json"
        doc = json.loads(hv.read_text()) if hv.exists() else {}
        doc.update({"asof": datetime.now(UTC).strftime("%Y-%m-%d"), "scenarios": view, "by": git_user(), "issue": int(os.environ.get("ISSUE_NUMBER", "0") or 0)})
        hv.write_text(json.dumps(doc, ensure_ascii=False, indent=1))
        set_output("changed", "true")
        adopted = "\n\n**하우스 뷰로 채택했습니다.** 내일부터 일일 예측 스냅숏과 적중 채점이 이 설정으로 돌아갑니다."
    else:
        set_output("changed", "false")
    return r.stdout.strip() + adopted + ("\n\n**분석관 메모**\n" + note if note else "") + "\n\n_템플릿 " + json.dumps(pairs, ensure_ascii=False) + " · 상황판 시나리오 탭에서 동일 설정을 재현할 수 있습니다._"


# ── judgment ────────────────────────────────────────────────────────────────
def judgment(form: dict) -> str:
    path = DASH / "data" / "judgments.json"
    ledger = json.loads(path.read_text())
    byid = {j["id"]: j for j in ledger["items"]}
    raw = form.get("판정 목록 (JSON)") or form.get("items") or ""
    rows: list[dict] = []
    try:
        rows = json.loads(raw) if raw.strip().startswith("[") else []
    except json.JSONDecodeError:
        rows = []
    if not rows:
        for line in (form.get("판정 (한 줄에 하나)") or "").splitlines():
            m = re.match(r"\s*([\w-]+)\s+(적중|빗나감|1|0|true|false|null|미정)\s*(.*)", line)
            if m:
                o = m.group(2)
                rows.append({"id": m.group(1), "outcome": None if o in ("null", "미정") else 1 if o in ("적중", "1", "true") else 0, "note": m.group(3).strip()})
    applied, unknown = [], []
    today = datetime.now(UTC).strftime("%Y-%m-%d")
    for r in rows:
        j = byid.get(r.get("id"))
        if not j:
            unknown.append(r.get("id")); continue
        j["outcome"] = r.get("outcome")
        j["resolved"] = today if r.get("outcome") is not None else None
        j["note"] = (r.get("note") or "")[:300]
        j["by"] = git_user()
        applied.append(j)
    if applied:
        path.write_text(json.dumps(ledger, ensure_ascii=False, indent=1))
    set_output("changed", "true" if applied else "false")
    st = backtest.ledger_stats(ledger["items"])
    L = [f"판정 {len(applied)}건 반영" + (f", 알 수 없는 id {len(unknown)}건 ({', '.join(map(str, unknown))})" if unknown else "") + ".", ""]
    for j in applied:
        L.append(f"- `{j['id']}` {'적중' if j['outcome'] == 1 else '빗나감' if j['outcome'] == 0 else '미정'} · 예측 {round(j['p'] * 100)}% · {j['x'][:80]}" + (f" — {j['note']}" if j.get("note") else ""))
    L += ["", f"**장부 현황** {st['n']}건 중 판정 {st['resolved']}건 · Brier **{st['brier']}** · 기저율 {st['base_rate']} · 기한 경과 미판정 {len(st['overdue'])}건",
          "| 구간 | n | 예측 평균 | 실제 적중률 |", "|---|---|---|---|"] + [f"| {b['bin']}% | {b['n']} | {b['pred']} | {b['obs']} |" for b in st["bins"]]
    return "\n".join(L)


# ── event (field report) ─────────────────────────────────────────────────────
TYPE_MAP = {"타격·미사일 (S)": "S", "지상전 (G)": "G", "공격·테러 (A)": "A", "해상 사건 (M)": "M", "외교·정치 (D)": "D", "경제·제재 (E)": "E", "인도적 (H)": "H"}


def event(form: dict) -> str:
    snap_path = DASH / "data_snapshot.json"
    snap = json.loads(snap_path.read_text())
    d = (form.get("날짜") or datetime.now(UTC).strftime("%Y-%m-%d")).strip()[:10]
    th = (form.get("전역") or "").split(" ")[0].strip() or None
    t = TYPE_MAP.get(form.get("유형") or "", (form.get("유형") or "D")[:1])
    x = (form.get("내용") or "").strip()
    if not x:
        set_output("changed", "false")
        return "내용이 비어 있어 반영하지 않았습니다."
    src = (form.get("출처 URL") or "").strip()
    g = (form.get("출처 등급") or "").strip()[:2] or enrich.grade_url(src)
    place = (form.get("장소") or "").strip()
    at = None
    m = re.match(r"\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)", form.get("좌표 (위도, 경도)") or "")
    if m:
        at = [float(m.group(1)), float(m.group(2))]
    elif place:
        loc = enrich.geocode(place) if hasattr(enrich, "geocode") else None
        if loc and loc.get("at"):
            at = loc["at"]; place = loc.get("p") or place
    ev = {"d": d, "t": t, "at": at, "th": th, "p": place, "x": x[:200], "s": src, "g": g, "src": "issue", "manual": True, "by": git_user(), "issue": int(os.environ.get("ISSUE_NUMBER", "0") or 0)}
    snap["events"].append(ev)
    snap["events"].sort(key=lambda e: e.get("d", ""), reverse=True)
    snap_path.write_text(json.dumps(snap, ensure_ascii=False))
    set_output("changed", "true")
    return f"현장 보고를 사건 목록에 추가했습니다.\n\n- 날짜 {d} · 전역 `{th}` · 유형 `{t}` · 등급 **{g}`\n- 장소 {place or '-'} {('(' + ', '.join(map(str, at)) + ')') if at else '(좌표 없음 — 지도에는 표시되지 않습니다)'}\n- {x[:200]}\n\n다음 수집 주기(6시간)에 GitHub Pages와 상황판에 반영됩니다."


def main() -> None:
    kind = sys.argv[1]
    form = parse_form(os.environ.get("ISSUE_BODY", ""))
    out = {"scenario": scenario, "judgment": judgment, "event": event}[kind](form)
    print(out)


if __name__ == "__main__":
    main()
