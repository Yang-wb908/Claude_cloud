import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
DASH = ROOT / "dashboard"

from pipeline import forecast  # noqa: E402


def test_simulate_is_seeded_and_weighted():
    scen = forecast.load_js(DASH, "scenario.js", "SCEN")
    view = [{"id": "hormuz_war", "p": 50, "k": 1}, {"id": "hormuz_reopen", "p": 50, "k": 1}]
    a = forecast.simulate(scen, view, n=2000, seed=1)
    b = forecast.simulate(scen, view, n=2000, seed=1)
    assert a == b
    brent = next(r for r in a if r["a"] == "brent")
    assert abs(brent["e"] - (0.5 * 45 + 0.5 * -18)) < 1e-6 and brent["p5"] < brent["p50"] < brent["p95"]
    rates = next(r for r in a if r["a"] == "rates")
    assert rates["bp"] and rates["sym"] == "^TNX"


def _series(sym, start, step, n=60, first="2026-10-01"):
    import datetime as dt
    d0 = dt.date.fromisoformat(first)
    dates = [(d0 + dt.timedelta(days=i)).isoformat() for i in range(n)]
    return {"l": sym, "d": dates, "c": [round(start * (1 + step) ** i, 4) for i in range(n)]}


def test_forecast_and_score(tmp_path):
    dash = tmp_path / "dashboard"; (dash / "data").mkdir(parents=True)
    (dash / "data" / "house_view.json").write_text(json.dumps({"asof": "2026-10-01", "scenarios": [{"id": "hormuz_war", "p": 40, "k": 1}, {"id": "blacksea_escalate", "p": 50, "k": 1}]}))
    doc = forecast.make_forecast(dash, src_dir=DASH, date="2026-10-01")
    assert (dash / "data" / "forecasts" / "2026-10-01.json").exists() and len(doc["view"]) == 2
    brent = next(r for r in doc["rows"] if r["a"] == "brent")
    assert brent["e"] > 0 and brent["analog"] is not None  # analogs attached to hormuz_war carry brent d20
    # realised: brent +1%/day (up, inside?), wheat flat, rates up 2bp/day
    series = {"BZ=F": _series("BZ=F", 100, 0.01), "ZW=F": _series("ZW=F", 600, 0.0), "^TNX": {"l": "t", "d": _series("x", 1, 0)["d"], "c": [5.0 + 0.02 * i for i in range(60)]}}
    (dash / "data" / "series.json").write_text(json.dumps({"series": series}))
    (dash / "data" / "judgments.json").write_text(json.dumps({"items": [{"id": "a", "p": 0.8, "outcome": 1, "resolved": "2026-10-05"}, {"id": "b", "p": 0.6, "outcome": 0, "resolved": "2026-10-09"}]}))
    sc = forecast.score(dash)
    assert sc["n_forecasts"] == 1 and sc["n_scored"] == 1 and sc["overall"]["n"] == 3
    f = sc["forecasts"][0]
    b = next(r for r in f["rows"] if r["a"] == "brent")
    assert b["done"] and abs(b["real"] - ((1.01 ** 20) - 1) * 100) < 0.01 and b["dir"] is True and 0 <= b["pit"] <= 1
    r = next(r for r in f["rows"] if r["a"] == "rates")
    assert abs(r["real"] - 40) < 0.5  # 20 days * 2bp
    assert sum(sc["pit_hist"]) == 3 and sc["ledger_brier"][-1]["n"] == 2 and abs(sc["ledger_brier"][-1]["brier"] - 0.2) < 1e-9
    # pending forecast (made 10 days before the end of the series)
    forecast.make_forecast(dash, src_dir=DASH, date="2026-11-20")
    sc2 = forecast.score(dash)
    pend = next(x for x in sc2["forecasts"] if x["d"] == "2026-11-20")
    assert pend["status"] == "partial" and 0 < pend["elapsed"] < 20 and sc2["n_pending"] == 1
    md = forecast.markdown(sc2)
    assert "방향 적중" in md and "| brent |" in md
