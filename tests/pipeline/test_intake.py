import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import intake  # noqa: E402

BODY = """### 시나리오 설정

hormuz_war:15:1.5,redsea_houthi:30:1

### 분석관 메모

_No response_

### 관심 지평

단기 (2주)
"""


def test_parse_form():
    f = intake.parse_form(BODY)
    assert f["시나리오 설정"] == "hormuz_war:15:1.5,redsea_houthi:30:1" and f["분석관 메모"] == "" and f["관심 지평"] == "단기 (2주)"


def test_scenario_reply_has_tables():
    out = intake.scenario(intake.parse_form(BODY))
    assert "| 브렌트유 |" in out and "유조선 운임" in out and "전면 확전" in out and "감시 지표" in out


def test_scenario_unknown_id():
    out = intake.scenario({"시나리오 설정": "nope:10:1"})
    assert "알 수 없는 시나리오" in out


def test_judgment_and_event_write(tmp_path, monkeypatch):
    dash = tmp_path / "dashboard"
    (dash / "data").mkdir(parents=True)
    shutil.copy(ROOT / "dashboard" / "data" / "judgments.json", dash / "data" / "judgments.json")
    (dash / "data_snapshot.json").write_text(json.dumps({"events": [{"d": "2026-10-01", "t": "D", "x": "old"}]}))
    monkeypatch.setattr(intake, "DASH", dash)
    monkeypatch.setenv("GITHUB_OUTPUT", str(tmp_path / "out.txt"))
    monkeypatch.setenv("ISSUE_AUTHOR", "tester")
    rep = intake.judgment({"판정 목록 (JSON)": json.dumps([{"id": "bluf-1", "outcome": 1, "note": "확인"}, {"id": "zzz", "outcome": 0}])})
    led = json.loads((dash / "data" / "judgments.json").read_text())
    j = next(x for x in led["items"] if x["id"] == "bluf-1")
    assert j["outcome"] == 1 and j["by"] == "tester" and "Brier" in rep and "zzz" in rep
    rep2 = intake.judgment({"판정 (한 줄에 하나)": "bluf-2 빗나감 선사 복귀 유지"})
    led = json.loads((dash / "data" / "judgments.json").read_text())
    assert next(x for x in led["items"] if x["id"] == "bluf-2")["outcome"] == 0 and "빗나감" in rep2
    rep3 = intake.event({"날짜": "2026-10-08", "전역": "iran 이란 전쟁과 호르무즈", "유형": "해상 사건 (M)", "장소": "Port Sudan", "내용": "유조선 피격", "출처 URL": "https://www.reuters.com/x"})
    snap = json.loads((dash / "data_snapshot.json").read_text())
    ev = snap["events"][0]
    assert ev["t"] == "M" and ev["th"] == "iran" and ev["g"] == "B2" and ev["manual"] and ev["at"] and "사건 목록에 추가" in rep3
    assert "changed=true" in (tmp_path / "out.txt").read_text()
