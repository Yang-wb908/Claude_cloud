"""Agentic advisor: Claude investigates the board with tools and proposes house-view changes, judgments and warnings.

Runs weekly (advisor.yml) or on demand: `python dashboard/pipeline/run.py advise`.
With ANTHROPIC_API_KEY the Anthropic SDK tool runner lets Claude call the read-only tools below (events, series moves,
simulation, scorecard, ledger, analog library) for several rounds, then return one JSON object. Without a key a
rules-only pass produces the same shape from the scorecard and ledger (no model). The workflow turns the result into a
GitHub Issue (labels scenario + advisor) whose "### 시나리오 설정" block the intake bot evaluates; ticking the house-view
checkbox in that Issue adopts the proposal.
"""

from __future__ import annotations

import bisect
import json
import logging
import os
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path

from . import forecast

log = logging.getLogger("pipeline.advisor")
SYSTEM = ("너는 국가 정보기관의 선임 지정학·시장 분석관이자 자율 에이전트다. 상황판 저장소의 데이터를 도구로 조회해 하우스 뷰(시나리오 확률)가 최근 사건·시세·채점 결과에 비춰 타당한지 점검하고, "
          "바꿔야 할 확률, 새로 등록할 판단(ICD 203 확률 용어+숫자, 판정 기한), 경고 보고가 필요한 전역을 낸다. 조사는 도구로 하고, 모든 수치 주장에 도구 결과를 근거로 달아라. "
          "마지막 답은 반드시 아래 JSON 하나만 출력한다(설명은 JSON 안의 문자열로): "
          '{"summary": "...", "proposals": [{"id": "시나리오id", "p": 0-100, "k": 0.5-2, "reason": "..."}], '
          '"new_judgments": [{"x": "...", "p": 0-1, "due": "YYYY-MM-DD"}], "warnings": [{"th": "전역id", "level": 1-5, "x": "경고 요지", "indicators": ["확인 징후"]}], '
          '"ledger_verdicts": [{"id": "판단id", "outcome": 1|0, "note": "..."}]}. proposals에는 하우스 뷰의 모든 시나리오를 (바꾸지 않더라도) 포함하라.')


class Tools:
    """Read-only accessors over dashboard/ (shared by the Claude tool runner and the rules fallback)."""

    def __init__(self, dash: Path):
        self.dash = dash
        self.snap = json.loads((dash / "data_snapshot.json").read_text()) if (dash / "data_snapshot.json").exists() else {"events": []}
        self.series = json.loads((dash / "data" / "series.json").read_text()).get("series", {}) if (dash / "data" / "series.json").exists() else {}
        self.scen = forecast.load_js(dash, "scenario.js", "SCEN")
        self.analogs = forecast.load_js(dash, "analogs.js", "ANALOGS")
        self.house = json.loads((dash / "data" / "house_view.json").read_text()) if (dash / "data" / "house_view.json").exists() else {"scenarios": []}
        self.score = json.loads((dash / "data" / "scorecard.json").read_text()) if (dash / "data" / "scorecard.json").exists() else None
        self.ledger = json.loads((dash / "data" / "judgments.json").read_text()) if (dash / "data" / "judgments.json").exists() else {"items": []}

    def recent_events(self, days: int = 7, theater: str | None = None, query: str | None = None, limit: int = 30) -> list[dict]:
        cut = (datetime.now(UTC) - timedelta(days=int(days))).strftime("%Y-%m-%d")
        terms = [t for t in (query or "").lower().split() if t]
        ev = [e for e in self.snap.get("events", []) if e.get("d", "") >= cut and (not theater or e.get("th") == theater) and all(t in (e.get("x", "") + " " + (e.get("p") or "")).lower() for t in terms)]
        ev.sort(key=lambda e: e.get("d", ""), reverse=True)
        return [{"d": e["d"], "t": e.get("t"), "th": e.get("th"), "p": e.get("p"), "x": e.get("x"), "g": e.get("g")} for e in ev[:limit]]

    def series_move(self, sym: str, days: int = 20) -> dict:
        s = self.series.get(sym)
        if not s:
            raise ValueError(f"시계열 없음: {sym}. 사용 가능: {', '.join(sorted(self.series))}")
        n = len(s["c"]); i = max(0, n - 1 - int(days))
        return {"sym": sym, "label": s.get("l"), "from": s["d"][i], "to": s["d"][-1], "start": s["c"][i], "last": s["c"][-1], "pct": round((s["c"][-1] / s["c"][i] - 1) * 100, 2) if s["c"][i] else None,
                "high": max(s["c"][i:]), "low": min(s["c"][i:])}

    def simulate(self, view: list[dict]) -> list[dict]:
        rows = forecast.simulate(self.scen, view, n=4000, seed=11)
        return [{"asset": r["a"], "e": r["e"], "p5": r["p5"], "p50": r["p50"], "p95": r["p95"], "up": r["up"], "unit": "bp" if r["bp"] else "%"} for r in rows[:15]]

    def scorecard(self) -> dict:
        sc = self.score or {}
        return {"n_forecasts": sc.get("n_forecasts"), "n_scored": sc.get("n_scored"), "overall": sc.get("overall"), "by_asset": sc.get("by_asset"),
                "pending": [{"d": f["d"], "elapsed": f["elapsed"], "top": [{"a": r["a"], "e": r["e"], "real": r.get("real")} for r in f["rows"][:6]]} for f in sc.get("forecasts", []) if f.get("status") != "scored"][-3:]}

    def ledger_overdue(self) -> list[dict]:
        today = datetime.now(UTC).strftime("%Y-%m-%d")
        return [{"id": j["id"], "p": j["p"], "due": j.get("due"), "x": j["x"]} for j in self.ledger["items"] if j.get("outcome") is None and j.get("due") and j["due"] < today][:20]

    def analog_list(self, category: str | None = None) -> list[dict]:
        return [{"id": a["id"], "date": a["date"], "n": a["n"], "cat": a["cat"], "brent_d20": (a["moves"].get("brent") or {}).get("d20"), "wheat_d20": (a["moves"].get("wheat") or {}).get("d20"), "vix_d20": (a["moves"].get("vix") or {}).get("d20")}
                for a in self.analogs.get("analogs", []) if not category or a.get("cat") == category][:25]


def _parse_json(text: str) -> dict | None:
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
    cands = [m.group(1)] if m else []
    i, j = text.find("{"), text.rfind("}")
    if i >= 0 and j > i:
        cands.append(text[i:j + 1])
    for c in cands:
        try:
            return json.loads(c)
        except json.JSONDecodeError:
            continue
    return None


def claude_advise(t: Tools, model: str | None = None) -> dict | None:
    try:
        import anthropic
        from anthropic import beta_tool
    except ImportError:
        log.warning("anthropic SDK not installed")
        return None
    model = model or os.environ.get("PIPELINE_MODEL", "claude-opus-5-5")
    client = anthropic.Anthropic()

    @beta_tool
    def search_events(days: int = 7, theater: str = "", query: str = "") -> str:
        """상황판 사건 검색.

        Args:
            days: 최근 며칠.
            theater: 전역 id (iran, ukraine, yemen, ethiopia, sudan, gaza, afpak, korea, lebanon, sahel, drc, somalia, myanmar, taiwan, scs, carib). 빈 문자열이면 전체.
            query: 공백으로 구분한 키워드(모두 포함).
        """
        return json.dumps(t.recent_events(days, theater or None, query or None), ensure_ascii=False)

    @beta_tool
    def series_move(sym: str, days: int = 20) -> str:
        """시세 시계열의 최근 변동(시작·최근 종가, 변동률, 고저). 심볼 예: BZ=F 브렌트, ZW=F 밀, GC=F 금, ^VIX, ^KS11 코스피, KRW=X, ^TNX 미10년, HG=F 구리, SB=F 설탕.

        Args:
            sym: 야후 파이낸스 심볼.
            days: 거래일 수.
        """
        return json.dumps(t.series_move(sym, days), ensure_ascii=False)

    @beta_tool
    def run_simulation(view_json: str) -> str:
        """시나리오 조합을 몬테카를로로 평가해 상품별 기대 변동·P5·P50·P95·상승확률 상위 15개를 반환.

        Args:
            view_json: JSON 배열 문자열 [{"id": 시나리오id, "p": 확률%, "k": 강도}].
        """
        return json.dumps(t.simulate(json.loads(view_json)), ensure_ascii=False)

    @beta_tool
    def list_scenarios() -> str:
        """시나리오 템플릿 목록(id, 이름, 전역, 기본 확률, 조건부 충격 상위)과 현재 하우스 뷰."""
        return json.dumps({"templates": [{"id": x["id"], "n": x["n"], "th": x["th"], "p_default": x["p"], "h": x["h"], "top_shocks": sorted(x["shocks"].items(), key=lambda kv: -abs(kv[1]["m"]))[:5]} for x in t.scen["templates"]], "house_view": t.house.get("scenarios")}, ensure_ascii=False)

    @beta_tool
    def get_scorecard() -> str:
        """예측 적중 채점표(방향 적중·구간 포함·스킬·자산별)와 진행 중 예측, 판단 장부의 기한 경과 항목."""
        return json.dumps({"scorecard": t.scorecard(), "ledger_overdue": t.ledger_overdue()}, ensure_ascii=False)

    @beta_tool
    def get_analogs(category: str = "") -> str:
        """과거 사례 라이브러리(사건 후 20일 브렌트·밀·VIX 변동). 범주: hormuz, redsea, blacksea, taiwan, korea, financial, pandemic, opec, weather, tariff, other.

        Args:
            category: 범주. 빈 문자열이면 전체.
        """
        return json.dumps(t.analog_list(category or None), ensure_ascii=False)

    task = ("오늘 기준으로 하우스 뷰를 재검토하라. 1) 최근 7일 사건과 시세 변동을 도구로 확인하고 2) 채점표에서 모델이 틀려온 방향을 보고 3) 필요하면 시뮬레이션으로 대안 확률 조합을 비교한 뒤 "
            "4) 지정된 JSON 하나로 답하라. 오늘: " + datetime.now(UTC).strftime("%Y-%m-%d"))
    try:
        runner = client.beta.messages.tool_runner(model=model, max_tokens=16000, max_iterations=10, system=SYSTEM,
                                                  tools=[search_events, series_move, run_simulation, list_scenarios, get_scorecard, get_analogs],
                                                  messages=[{"role": "user", "content": task}])
        last = None
        for message in runner:
            last = message
        if last is None:
            return None
        if getattr(last, "stop_reason", "") == "refusal":
            log.warning("advisor refused")
            return None
        text = "\n".join(b.text for b in last.content if getattr(b, "type", "") == "text")
        data = _parse_json(text)
        if data is None:
            log.warning("advisor returned no JSON: %s", text[:200])
            return None
        data["claude"] = True; data["model"] = model
        return data
    except anthropic.APIStatusError as e:
        log.warning("advisor API error %s: %s", e.status_code, e.message)
    except anthropic.APIConnectionError as e:
        log.warning("advisor connection error: %s", e)
    return None


def rules_advise(t: Tools) -> dict:
    """No-model fallback: keep the house view, flag what the data says needs a look."""
    sc = t.score or {}
    o = sc.get("overall") or {}
    notes = []
    if o.get("n"):
        if o.get("dir") is not None and o["dir"] < 0.5:
            notes.append(f"방향 적중률 {o['dir']:.0%}로 동전 미만: 조건부 충격 부호 재검토 필요")
        if o.get("cov90") is not None and o["cov90"] < 0.8:
            notes.append(f"90% 구간 포함률 {o['cov90']:.0%}: 분포 과소 산정(변동성 상향 필요)")
        if o.get("skill") is not None and o["skill"] < 0:
            notes.append("무변동 가정보다 못함: 기대 변동 크기 축소 검토")
    overdue = t.ledger_overdue()
    if overdue:
        notes.append(f"기한 경과 미판정 판단 {len(overdue)}건")
    return {"claude": False, "summary": "규칙 기반 점검(모델 미사용). " + ("; ".join(notes) if notes else "채점·장부에서 경고 없음."),
            "proposals": [{"id": v["id"], "p": v.get("p"), "k": v.get("k", 1), "reason": "유지"} for v in t.house.get("scenarios", [])], "new_judgments": [], "warnings": [], "ledger_verdicts": []}


def markdown(res: dict, t: Tools) -> str:
    T = {x["id"]: x for x in t.scen["templates"]}
    H = {v["id"]: v for v in t.house.get("scenarios", [])}
    spec = ",".join(f"{p['id']}:{p.get('p') if p.get('p') is not None else H.get(p['id'], {}).get('p', T.get(p['id'], {}).get('p'))}:{p.get('k', 1)}" for p in res.get("proposals", []) if p.get("id") in T)
    L = [f"### 요약", "", res.get("summary", ""), "", "### 시나리오 설정", "", spec or "(제안 없음)", "", "### 하우스 뷰", "", "- [ ] 이 설정을 하우스 뷰로 채택한다 (일일 예측 스냅숏·적중 채점의 기준이 된다)", "",
         "### 제안 상세", "", "| 시나리오 | 현재 | 제안 | 근거 |", "|---|---|---|---|"]
    for p in res.get("proposals", []):
        if p.get("id") in T:
            cur = H.get(p["id"], {}).get("p", "—")
            L.append(f"| {T[p['id']]['n']} (`{p['id']}`) | {cur}% | {p.get('p')}% ×{p.get('k', 1)} | {p.get('reason', '')} |")
    if res.get("new_judgments"):
        L += ["", "### 새 판단 제안", ""] + [f"- {round(j['p'] * 100)}% · 기한 {j['due']} · {j['x']}" for j in res["new_judgments"]]
    if res.get("warnings"):
        L += ["", "### 경고 보고 필요 전역", ""] + [f"- `{w.get('th')}` 단계 {w.get('level')} · {w.get('x', '')} ({', '.join(w.get('indicators', []))})" for w in res["warnings"]]
    if res.get("ledger_verdicts"):
        L += ["", "### 판정 제안 (판정 Issue에 붙여넣기)", "", "```"] + [f"{v['id']} {'적중' if v.get('outcome') in (1, True) else '빗나감'} {v.get('note', '')}" for v in res["ledger_verdicts"]] + ["```"]
    L += ["", f"_{'Claude 에이전트(' + res.get('model', '') + ')' if res.get('claude') else '규칙 기반'} · 자동 생성 · 체크박스를 켜고 저장하면 봇이 하우스 뷰를 갱신합니다_"]
    return "\n".join(L)


def run(dash: Path, use_claude: bool = True) -> dict:
    t = Tools(dash)
    res = claude_advise(t) if use_claude and os.environ.get("ANTHROPIC_API_KEY") else None
    if res is None:
        res = rules_advise(t)
    res["generated"] = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    res["markdown"] = markdown(res, t)
    (dash / "data").mkdir(exist_ok=True)
    (dash / "data" / "advisor.json").write_text(json.dumps({k: v for k, v in res.items() if k != "markdown"}, ensure_ascii=False, indent=1))
    return res
