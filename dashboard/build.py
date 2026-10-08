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
        + ";\nconst SOURCES = " + registry() + ";\n")
out = (app.replace("/*__WORLD__*/", rd("world.json")).replace("/*__WORLD110__*/", rd("world110.json"))
          .replace("/*__DATA__*/", rd("data_snapshot.json")).replace("/*__THEATERS__*/", theaters)
          .replace("/*__IW__*/", rd("iw.js")).replace("/*__EN__*/", rd("labels_en.js")).replace("/*__INTEL__*/", rd("intel.js") + auto))
(B / "index.html").write_text(out)
print("built", len(out), "bytes")
