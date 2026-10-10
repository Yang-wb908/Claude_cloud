import json
import sys
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import resolve as rs  # noqa: E402

NOW = datetime(2026, 10, 26, 3, tzinfo=UTC)  # 월요일


def _dash(tmp_path, items, house=None):
    (tmp_path / "data").mkdir(exist_ok=True)
    (tmp_path / "data" / "judgments.json").write_text(json.dumps({"items": items}))
    (tmp_path / "data_snapshot.json").write_text(json.dumps({"events": [
        {"d": "2026-10-20", "th": "iran", "t": "M", "x": "호르무즈 통항 여전히 하루 5척", "s": "https://ex.com/a", "r": 3},
        {"d": "2026-10-21", "th": "korea", "t": "S", "x": "북한 미사일", "s": "https://ex.com/b", "r": 3}]}))
    if house:
        (tmp_path / "data" / "house_view.json").write_text(json.dumps(house))
    return tmp_path


def J(i, due, p=0.7, th=("iran",), **kw):
    return {"id": i, "d": "2026-10-08", "x": f"판단 {i}", "p": p, "th": list(th), "due": due, "outcome": None, "resolved": None, "note": "", **kw}


def test_due_items_resolved_with_evidence_and_human_verdicts_untouched(tmp_path):
    items = [J("a", "2026-10-23"), J("b", "2026-12-31"), J("c", "2026-10-20", by="analyst", outcome=1, resolved="2026-10-21"), J("d", "2026-10-24", th=("korea",))]
    _dash(tmp_path, items)
    seen = []

    def judge(payload):
        seen.append(payload)
        ids = [j["id"] for j in payload["judgments"]]
        return {"items": [{"id": i, "outcome": 1 if i == "a" else None, "confidence": "높음" if i == "a" else "낮음", "rationale": "근거", "evidence": ["https://ex.com/a"]} for i in ids]}
    st = rs.resolve(tmp_path, NOW, sweep=False, judge=judge)
    led = {j["id"]: j for j in json.loads((tmp_path / "data" / "judgments.json").read_text())["items"]}
    assert st["candidates"] == 2 and st["resolved"] == 1 and st["held"] == 1
    assert led["a"]["outcome"] == 1 and led["a"]["by"] == "auto" and led["a"]["evidence"] == ["https://ex.com/a"]
    assert led["d"]["outcome"] is None and led["d"]["auto_tries"] == 1 and led["d"]["auto_next"] == "2026-11-02"
    assert led["c"]["by"] == "analyst" and led["b"]["outcome"] is None  # 분석관 판정·기한 전 항목은 손대지 않음
    ev_iran = next(p for p in seen if p["judgments"][0]["id"] == "a")["evidence"]["events"]
    assert len(ev_iran) == 1 and ev_iran[0][4] == "https://ex.com/a"  # 같은 전역 근거만


def test_weekly_sweep_and_low_confidence_not_written(tmp_path):
    _dash(tmp_path, [J("b", "2026-12-31"), J("e", "2026-12-31")])
    judge = lambda payload: {"items": [{"id": "b", "outcome": 0, "confidence": "보통", "rationale": "이미 반대로 확정", "evidence": []},
                                       {"id": "e", "outcome": 1, "confidence": "낮음", "rationale": "애매", "evidence": []}]}
    st = rs.resolve(tmp_path, NOW, judge=judge)  # 월요일 → 전수 점검
    led = {j["id"]: j for j in json.loads((tmp_path / "data" / "judgments.json").read_text())["items"]}
    assert st["sweep"] and led["b"]["outcome"] == 0 and led["e"]["outcome"] is None and "auto_tries" not in led["e"]  # 기한 전 보류는 시도 횟수 안 셈


def test_scenarios_enter_ledger_once(tmp_path):
    house = {"asof": "2026-10-08", "scenarios": [{"id": "hormuz_war", "p": 10}, {"id": "nope", "p": 5}]}
    d = _dash(tmp_path, [], house)
    import shutil
    shutil.copy(ROOT / "dashboard" / "scenario.js", d / "scenario.js")
    rs.resolve(d, NOW, sweep=False, judge=lambda p: {"items": []})
    rs.resolve(d, NOW, sweep=False, judge=lambda p: {"items": []})
    items = json.loads((d / "data" / "judgments.json").read_text())["items"]
    assert [j["id"] for j in items] == ["scn-hormuz_war-2026-10-08"] and items[0]["p"] == 0.1 and items[0]["src"] == "house_view" and items[0]["due"] > "2026-10-08"


def test_review_calibration_and_markdown(tmp_path):
    items = [J(f"h{i}", "2026-10-20", p=0.8, outcome=1, resolved="2026-10-22", by="auto") for i in range(3)] + \
            [J(f"m{i}", "2026-10-20", p=0.8, outcome=0, resolved="2026-10-23") for i in range(3)] + [J("o", "2026-10-01")]
    _dash(tmp_path, items)
    d = rs.review(tmp_path, NOW)
    assert d["n_resolved"] == 6 and d["hit_rate"] == 0.5 and d["brier"] == round((3 * 0.04 + 3 * 0.64) / 6, 3) and d["n_overdue"] == 1
    assert d["calibration"][0]["said"] == 0.8 and d["calibration"][0]["happened"] == 0.5 and d["miscalibrated"]
    md = (tmp_path.parent / "reports" / f"REVIEW-{d['week']}.md").read_text()
    assert "Brier" in md and "❌ 틀림" in md and "✅ 맞힘" in md
