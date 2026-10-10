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


def js_json(text):
    """큰 데이터는 JS 객체 리터럴보다 JSON.parse('…') 가 빨리 해석된다(V8). </script> 가 끼지 않게 '</' 를 이스케이프."""
    return "JSON.parse(" + json.dumps(text, ensure_ascii=False).replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029") + ")"


def jopt(path, default):
    return js_json(opt_json(path, default))


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
        return json.dumps([{k: v for k, v in x.items() if k in ("id", "name", "kind", "grade", "region", "tags", "enabled", "verify", "note", "url", "feed")} for x in s["sources"]], ensure_ascii=False)
    except Exception:
        return "[]"


app = (B / "app.html").read_text()
theaters = re.sub(r"^\s*<script>\s*", "", (B / "theaters.js").read_text()).rstrip()
auto = ("\nconst INTEL_AUTO = " + jopt("intel.auto.json", None) + ";\nconst RFI = " + jopt("data/rfi.json", []) + ";\nconst TRIP = " + jopt("data/tripwires.json", None)
        + ";\nconst SOURCES = " + registry() + ";\nconst JUDG = " + jopt("data/judgments.json", {"items": []}) + ";\nconst BT = " + jopt("data/backtest.json", None)
        + ";\nconst SERIES = " + jopt("data/series.json", None) + ";\nconst HOUSE = " + jopt("data/house_view.json", None) + ";\nconst SCORE = " + jopt("data/scorecard.json", None) + ";\nconst COVERAGE = " + jopt("data/coverage.json", None) + ";\nconst HOUSE_AUTO = " + jopt("data/house_view_auto.json", None) + ";\nconst CALIB = " + jopt("data/shock_calib.json", None) + ";\nconst REDTEAM = " + jopt("data/redteam.json", None)
        + ";\nconst PIRS = " + jopt("data/pirs.json", None) + ";\nconst WATCHCON = " + jopt("data/watchcon.json", None) + ";\nconst WATCHLOG = " + jopt("data/watch_log.json", None) + ";\nconst PRODUCTS = " + jopt("data/products_index.json", None)
        + ";\nconst BRIEFS = " + jopt("data/theater_briefs.json", None) + ";\nconst FEEDS = " + jopt("data/feeds.json", None) + ";\nconst FIRMS = " + jopt("data/firms.json", None) + ";\nconst OPEN = " + jopt("data/openfeeds.json", None) + ";\nconst DOMAINS = " + jopt("data/domains.json", None) + ";\nconst REVIEW = " + jopt("data/review.json", None) + ";\nconst RISK = " + jopt("data/risk.json", None) + ";\nconst RISK_HIST = " + jopt("data/risk_history.json", []) + ";\n" + rd("ach.js") + "\n" + rd("scenario.js") + "\n" + rd("analogs.js") + "\n")
out = (app.replace("/*__WORLD__*/", rd("world.json")).replace("/*__WORLD110__*/", rd("world110.json"))
          .replace("/*__DATA__*/", js_json(rd("data_snapshot.json"))).replace("/*__THEATERS__*/", theaters)
          .replace("/*__IW__*/", rd("iw.js")).replace("/*__EN__*/", rd("labels_en.js")).replace("/*__COMMOD__*/", rd("commodities.js")).replace("/*__INTEL__*/", rd("intel.js") + auto).replace("/*__ANALYST__*/", rd("analyst.js") + "\n" + rd("agent.js") + "\n" + rd("risk.js") + "\n" + rd("ops.js") + "\n" + rd("first.js") + "\n" + rd("live.js")))
(B / "index.html").write_text(out)
print("built", len(out), "bytes")
