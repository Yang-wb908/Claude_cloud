import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
DASH = ROOT / "dashboard"

from pipeline import risk, tripwires  # noqa: E402


def test_risk_index_components_and_book(tmp_path):
    d = tmp_path / "dashboard"; (d / "data").mkdir(parents=True)
    for f in ("scenario.js", "theaters.js"):
        shutil.copy(DASH / f, d / f)
    shutil.copy(DASH / "data" / "house_view.json", d / "data" / "house_view.json")
    (d / "data_snapshot.json").write_text(json.dumps({"events": [{"d": "2026-10-07", "t": "S", "th": "iran", "x": "strike"}] * 10}))
    (d / "intel.auto.json").write_text(json.dumps({"markets": [{"sym": "^VIX", "v": 30}, {"sym": "DX-Y.NYB", "v": 105}, {"sym": "^TNX", "v": 5.3}, {"sym": "BZ=F", "v": 100}, {"sym": "KRW=X", "v": 1420}],
                                                   "portwatch": {"hormuz": {"latest": {"n_total": 8}, "avg28": 40}}, "cot": [{"market": "corn", "net": 380000}]}))
    (d / "data" / "book_mtm.json").write_text(json.dumps({"items": [{"id": "pb-1", "cm": "brent", "side": "long", "size": 1, "status": "open"}, {"id": "pb-2", "cm": "kospi", "side": "short", "size": 0.5, "status": "open"}]}))
    import datetime as dt
    r = risk.run(d, src_dir=DASH)
    assert 0 <= r["index"] <= 100 and r["level"] in ("낮음", "보통", "높음", "심각")
    assert set(r["components"]) == set(risk.W) and r["components"]["market"]["v"] > 0.5 and r["components"]["supply"]["v"] > 0.6
    assert r["book"]["n"] == 2 and r["book"]["var95"] < r["book"]["mean"] and r["book"]["es95"] <= r["book"]["var95"] and r["book"]["cond"]
    assert r["per_asset"][0]["grade"] >= r["per_asset"][-1]["grade"] and any(k["a"] == "brent" for k in r["korea"])
    assert (d / "data" / "risk.json").exists() and json.loads((d / "data" / "risk_history.json").read_text())[0]["index"] == r["index"]
    assert json.loads((d / "data" / "badges" / "risk.json").read_text())["schemaVersion"] == 1
    md = risk.markdown(r); assert "경제 위험 지수" in md and "VaR95" in md
    # tripwire metric path risk.index
    assert tripwires._get({"risk": r}, "risk.index") == r["index"]
