import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
DASH = ROOT / "dashboard"

from pipeline import advisor, book, intake  # noqa: E402


def _dash(tmp_path):
    d = tmp_path / "dashboard"; (d / "data").mkdir(parents=True)
    for f in ("scenario.js", "analogs.js"):
        shutil.copy(DASH / f, d / f)
    for f in ("house_view.json", "judgments.json"):
        shutil.copy(DASH / "data" / f, d / "data" / f)
    (d / "data_snapshot.json").write_text(json.dumps({"events": [{"d": "2026-10-07", "t": "M", "th": "iran", "x": "유조선 피격", "p": "호르무즈"}]}))
    return d


def _series(start, step, n=40, first="2026-10-01"):
    import datetime as dt
    d0 = dt.date.fromisoformat(first)
    return {"l": "x", "d": [(d0 + dt.timedelta(days=i)).isoformat() for i in range(n)], "c": [round(start * (1 + step) ** i, 4) for i in range(n)]}


def test_book_mark_fills_entry_pnl_and_autocloses(tmp_path):
    d = _dash(tmp_path)
    (d / "data" / "book.json").write_text(json.dumps({"items": [
        {"id": "pb-001", "d": "2026-10-02", "cm": "brent", "side": "long", "entry": None, "size": 1, "stop": 150, "target": 260, "thesis": "t", "scn": ["hormuz_persist"], "status": "open"},
        {"id": "pb-002", "d": "2026-10-02", "cm": "wheat", "side": "short", "entry": 600, "size": 2, "stop": 650, "target": 500, "thesis": "t", "scn": ["blacksea_deal"], "status": "open"},
        {"id": "pb-003", "d": "2026-10-02", "cm": "palm", "side": "long", "entry": None, "size": 1, "stop": None, "target": None, "thesis": "no series", "scn": [], "status": "open"}]}))
    bz, zw = _series(100, 0.01, n=80, first="2026-08-01"), _series(600, 0.01, n=80, first="2026-08-01")
    (d / "data" / "series.json").write_text(json.dumps({"series": {"BZ=F": bz, "ZW=F": zw}}))
    m = book.mark(d, src_dir=DASH)
    b = next(x for x in m["items"] if x["id"] == "pb-001")
    assert b["entry"] == bz["c"][bz["d"].index("2026-10-02")] and b["pnl"] > 0 and b["stop_dist"] < 0 < b["target_dist"]
    w = next(x for x in m["items"] if x["id"] == "pb-002")
    assert w["status"] == "closed" and w["auto_closed"] == "stop" and w["pnl"] < 0
    assert m["summary"]["unmarked"] == 1 and m["summary"]["closed"] == 1 and "blacksea_deal" in m["attribution"]
    saved = json.loads((d / "data" / "book.json").read_text())
    assert next(x for x in saved["items"] if x["id"] == "pb-002")["status"] == "closed"
    assert "| pb-001 |" in book.markdown(m)


def test_intake_trade_open_close(tmp_path, monkeypatch):
    d = _dash(tmp_path)
    (d / "data" / "book.json").write_text(json.dumps({"items": []}))
    monkeypatch.setattr(intake, "DASH", d); monkeypatch.setenv("GITHUB_OUTPUT", str(tmp_path / "o")); monkeypatch.setenv("ISSUE_AUTHOR", "a")
    rep = intake.trade({"동작": "개시", "상품": "gold", "방향": "long", "진입가 (비우면 첫 종가)": "", "손절가": "3800", "목표가": "4,600", "논지": "헤지", "근거 시나리오 id (쉼표)": "hormuz_war, taiwan_quarantine"})
    bk = json.loads((d / "data" / "book.json").read_text())
    assert bk["items"][0]["id"] == "pb-001" and bk["items"][0]["target"] == 4600 and bk["items"][0]["scn"] == ["hormuz_war", "taiwan_quarantine"] and "개시" in rep
    rep2 = intake.trade({"동작": "종료", "포지션 id": "pb-001", "종료가 (종료 시, 비우면 최근 종가)": "4200"})
    bk = json.loads((d / "data" / "book.json").read_text())
    assert bk["items"][0]["status"] == "closed" and bk["items"][0]["exit"] == 4200 and "종료" in rep2


def test_advisor_rules_and_tools(tmp_path, monkeypatch):
    d = _dash(tmp_path)
    (d / "data" / "series.json").write_text(json.dumps({"series": {"BZ=F": _series(100, 0.01)}}))
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    t = advisor.Tools(d)
    assert t.recent_events(365, "iran")[0]["x"] == "유조선 피격"
    mv = t.series_move("BZ=F", 10); assert mv["pct"] > 0
    sim = t.simulate([{"id": "hormuz_war", "p": 50, "k": 1}]); assert sim and sim[0]["asset"]
    res = advisor.run(d, use_claude=True)  # no key -> rules
    assert res["claude"] is False and len(res["proposals"]) == len(t.house["scenarios"])
    assert "### 시나리오 설정" in res["markdown"] and "hormuz_persist:60:1" in res["markdown"] and "- [ ]" in res["markdown"]
    assert (d / "data" / "advisor.json").exists()
