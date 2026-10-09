"""dashboard/ 소스를 index.html 하나로 조립한다. 자동 수집 산출물(intel.auto.json, data/*.json)과 수집원 레지스트리가 있으면 함께 주입한다."""
import json
import pathlib
import re

B = pathlib.Path(__file__).parent


def rd(n):
    return (B / n).read_text().strip()


def opt_json(path, default):
    p = B / path
    try:
        return json.dumps(json.loads(p.read_text()), ensure_ascii=False) if p.exists() else json.dumps(default, ensure_ascii=False)
    except Exception:
        return json.dumps(default, ensure_ascii=False)


def opt_json_raw(path):
    p = B / path
    try:
        return json.loads(p.read_text()) if p.exists() else None
    except Exception:
        return None


def registry():
    try:
        import yaml
        s = yaml.safe_load((B / "pipeline" / "sources.yaml").read_text())
        return json.dumps([{k: v for k, v in x.items() if k in ("id", "name", "kind", "grade", "region", "tags", "enabled", "verify", "note", "url")} for x in s["sources"]], ensure_ascii=False)
    except Exception:
        return "[]"


app = (B / "app.html").read_text()
theaters = re.sub(r"^\s*<script>\s*", "", (B / "theaters.js").read_text()).rstrip()
auto = ("\nconst INTEL_AUTO = " + opt_json("intel.auto.json", None) + ";\nconst RFI = " + opt_json("data/rfi.json", []) + ";\nconst TRIP = " + opt_json("data/tripwires.json", None)
        + ";\nconst SOURCES = " + registry() + ";\nconst JUDG = " + opt_json("data/judgments.json", {"items": []}) + ";\nconst BT = " + opt_json("data/backtest.json", None)
        + ";\nconst SERIES = " + opt_json("data/series.json", None) + ";\nconst HOUSE = " + opt_json("data/house_view.json", None) + ";\nconst SCORE = " + opt_json("data/scorecard.json", None) + ";\nconst COVERAGE = " + opt_json("data/coverage.json", None) + ";\nconst HOUSE_AUTO = " + opt_json("data/house_view_auto.json", None) + ";\nconst CALIB = " + opt_json("data/shock_calib.json", None) + ";\nconst REDTEAM = " + opt_json("data/redteam.json", None)
        + ";\nconst PIRS = " + opt_json("data/pirs.json", None) + ";\nconst WATCHCON = " + opt_json("data/watchcon.json", None) + ";\nconst WATCHLOG = " + opt_json("data/watch_log.json", None) + ";\nconst PRODUCTS = " + opt_json("data/products_index.json", None)
        + ";\nconst BRIEFS = " + opt_json("data/theater_briefs.json", None) + ";\nconst FEEDS = " + opt_json("data/feeds.json", None) + ";\nconst FIRMS = " + opt_json("data/firms.json", None) + ";\nconst RISK = " + opt_json("data/risk.json", None) + ";\nconst RISK_HIST = " + opt_json("data/risk_history.json", []) + ";\n" + rd("ach.js") + "\n" + rd("scenario.js") + "\n" + rd("analogs.js") + "\n")
out = (app.replace("/*__WORLD__*/", rd("world.json")).replace("/*__WORLD110__*/", rd("world110.json"))
          .replace("/*__DATA__*/", rd("data_snapshot.json")).replace("/*__THEATERS__*/", theaters)
          .replace("/*__IW__*/", rd("iw.js")).replace("/*__EN__*/", rd("labels_en.js")).replace("/*__COMMOD__*/", rd("commodities.js")).replace("/*__INTEL__*/", rd("intel.js") + auto).replace("/*__ANALYST__*/", rd("analyst.js") + "\n" + rd("agent.js") + "\n" + rd("risk.js") + "\n" + rd("ops.js") + "\n" + rd("live.js")))
(B / "index.html").write_text(out)
print("built", len(out), "bytes")
