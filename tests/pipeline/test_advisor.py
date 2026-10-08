import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
DASH = ROOT / "dashboard"

from pipeline import advisor  # noqa: E402


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
