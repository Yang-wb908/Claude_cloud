import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
FX = Path(__file__).parent / "fixtures"

from pipeline import backtest, collectors  # noqa: E402


def _series(start=100.0, n=130, step=1.0):
    dates = [f"2026-{1 + i // 28:02d}-{1 + i % 28:02d}" for i in range(n)]
    return backtest.Series(dates, [start + step * i for i in range(n)])


def test_series_forward_returns():
    s = _series()
    assert s.fwd("2026-01-01", 1) == 1.0
    assert s.fwd("2026-01-01", 20) == 20.0
    assert s.fwd("2026-05-18", 60) is None  # runs off the end
    assert s.idx_on_or_before("2025-12-31") is None


def test_parse_yf_series_fixture():
    ts = [1759190400 + 86400 * i for i in range(8)]  # 2025-09-30 ... daily
    payload = {"chart": {"result": [{"meta": {}, "timestamp": ts, "indicators": {"quote": [{"close": [100, 101, None, 103, 104, 105, 106, 107]}]}}]}}
    it = collectors.parse_yf_series(payload, "BZ=F", "브렌트유", "series")
    assert it["kind"] == "series" and len(it["extra"]["dates"]) == len(it["extra"]["closes"]) >= 5
    assert it["extra"]["dates"] == sorted(it["extra"]["dates"])


def test_event_study_and_tripwires():
    series = {"BZ=F": _series(90, 130, 0.5), "ZW=F": _series(600, 130, -1.0), "^GSPC": _series(5000, 130, 2.0)}
    events = [{"d": "2026-01-10", "t": "S", "th": "iran", "x": "strike"}, {"d": "2026-01-12", "t": "D", "th": "iran", "x": "talks"}, {"d": "2026-02-01", "t": "M", "th": "sudan", "x": "low sev"}]
    es = backtest.event_study(events, series, {"iran": 5, "sudan": 3})
    assert es["n"] == 1 and es["rows"][0]["moves"]["brent"]["d20"] > 0 and es["summary"]["wheat"]["d5"]["hit_up"] == 0.0
    trips = [{"id": "brent_100", "title": "Brent > 100", "metric": "markets.BZ=F", "op": ">", "value": 100}, {"id": "ev", "title": "events", "kind": "event_count", "op": ">=", "value": 1}]
    tb = backtest.tripwire_backtest(trips, series)
    assert len(tb) == 1 and tb[0]["episodes"] == 1 and tb[0]["active_now"] is True and tb[0]["rows"][0]["spx_60"] is not None


def test_ledger_stats_brier_and_bins():
    items = [{"id": "a", "p": 0.7, "outcome": 1, "due": "2026-01-01"}, {"id": "b", "p": 0.3, "outcome": 0, "due": "2026-01-01"}, {"id": "c", "p": 0.9, "outcome": 0, "due": "2026-01-01"}, {"id": "d", "p": 0.5, "outcome": None, "due": "2020-01-01"}]
    st = backtest.ledger_stats(items)
    assert st["resolved"] == 3 and st["n"] == 4 and st["overdue"] == ["d"]
    assert abs(st["brier"] - round((0.09 + 0.09 + 0.81) / 3, 3)) < 1e-9
    assert [b["n"] for b in st["bins"]] == [0, 1, 0, 1, 1]
