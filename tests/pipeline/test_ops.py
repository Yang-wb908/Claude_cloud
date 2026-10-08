import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
DASH = ROOT / "dashboard"

from pipeline import intake, products  # noqa: E402


def _dash(tmp_path):
    d = tmp_path / "dashboard"; (d / "data").mkdir(parents=True)
    for f in ("iw.js", "theaters.js", "scenario.js"):
        shutil.copy(DASH / f, d / f)
    for f in ("pirs.json", "watchcon.json", "watch_log.json", "judgments.json"):
        shutil.copy(DASH / "data" / f, d / "data" / f)
    (d / "data_snapshot.json").write_text(json.dumps({"events": [{"d": "2026-10-08", "t": "S", "th": "iran", "x": "타격", "g": "B2"}]}))
    (d / "data" / "tripwires.json").write_text(json.dumps({"fired": [{"id": "brent_110", "title": "브렌트유 110달러 돌파", "current": 112, "op": ">", "threshold": 110, "sev": 4, "why": "x"}]}))
    return d


def test_intake_ops_handlers(tmp_path, monkeypatch):
    d = _dash(tmp_path)
    monkeypatch.setattr(intake, "DASH", d); monkeypatch.setenv("GITHUB_OUTPUT", str(tmp_path / "o")); monkeypatch.setenv("ISSUE_AUTHOR", "duty")
    r = intake.pir({"PIR id": "", "우선순위": "1", "전역": "yemen", "정보 요구(질문)": "후티 전력?", "담당과": "중동과", "기한 (YYYY-MM-DD)": "2026-11-01", "EEI (한 줄에 하나)": "발사 간격 | 24h 2건 | ukmto,gn_redsea\n잔존 전력 | BDA | centcom"})
    pirs = json.loads((d / "data" / "pirs.json").read_text())
    new = pirs["items"][-1]
    assert new["id"] == "PIR-10" and len(new["eei"]) == 2 and new["eei"][0]["src"] == ["ukmto", "gn_redsea"] and "PIR-10" in r
    r2 = intake.pir({"PIR id": "PIR-10", "EEI (한 줄에 하나)": "추가 질문 | 징후 | usni"})
    assert len(json.loads((d / "data" / "pirs.json").read_text())["items"][-1]["eei"]) == 3 and "3건" in r2
    r3 = intake.handover({"교대": "야간 (20:00~08:00 KST)", "당직 분석관": "kim", "상황 요약": "조용", "미결 사항 (한 줄에 하나)": "- a\n- b", "다음 근무 과업 (한 줄에 하나)": "c"})
    e = json.loads((d / "data" / "watch_log.json").read_text())["entries"][-1]
    assert e["shift"] == "야간" and e["open"] == ["a", "b"] and e["tasks"] == ["c"] and "인수인계" in r3
    r4 = intake.watchcon({"전역": "taiwan", "새 단계": "3 긴장", "근거 (판단)": "PLA 활동 급증", "확인된 징후 (한 줄에 하나)": "항공기 45대"})
    wc = json.loads((d / "data" / "watchcon.json").read_text())["theaters"]["taiwan"]
    assert wc["level"] == 3 and wc["history"][-1]["from"] == 2 and wc["history"][-1]["indicators"] == ["항공기 45대"] and "2 → **3**" in r4
    pend = json.loads((d / "data" / "warnings_pending.json").read_text()); assert pend[0]["kind"] == "watchcon"
    r5 = intake.dissent({"판단 id": "bluf-1", "대안 판단과 근거": "중재 타결 가능성 과소평가", "대안 확률 (0~100)": "45"})
    j = next(x for x in json.loads((d / "data" / "judgments.json").read_text())["items"] if x["id"] == "bluf-1")
    assert j["dissent"][0]["p"] == 0.45 and "이견 기록" in r5
    # products: DIB + WR for the fired tripwire + the pending watchcon change
    res = products.run(d, tmp_path / "products")
    assert res["written"][0].startswith("DIB-") and sum(1 for s in res["written"] if s.startswith("WR-")) == 2
    dib = (tmp_path / "products" / res["written"][0] + ".md").read_text() if False else (tmp_path / "products" / (res["written"][0] + ".md")).read_text()
    assert "## 1. BLUF" in dib and "PIR-10" in dib and "이견" in dib and "taiwan" in dib
    idx = json.loads((tmp_path / "products" / "index.json").read_text())
    assert len(idx["products"]) == 3 and (d / "data" / "products_index.json").exists()
    # idempotent: second run rewrites the DIB, adds no duplicate WR
    res2 = products.run(d, tmp_path / "products")
    assert len(json.loads((tmp_path / "products" / "index.json").read_text())["products"]) == 3 and res2["written"] == [res["written"][0]]
