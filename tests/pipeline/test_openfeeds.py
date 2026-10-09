import json
import sys
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import openfeeds as of  # noqa: E402

NOW = datetime(2026, 10, 9, 12, tzinfo=UTC)


def test_parse_ioda_summary_and_alert_gate(monkeypatch):
    payload = {"data": [{"entity": {"code": "ir", "name": "Iran"}, "scores": {"overall": 52000.5, "bgp": 300, "ping-slash24": 51700}, "event_cnt": 3},
                        {"entity": {"code": "FR", "name": "France"}, "scores": {"overall": 20}},
                        {"entity": {"code": "ZZ", "name": "Nowhere"}, "scores": {"overall": 99999}},
                        {"entity": {"code": "LT", "name": "Lithuania"}, "scores": {"overall": 4540, "gtr.sarima": 4540}}, "junk"]}
    rows = of.parse_ioda_summary(payload)
    assert [r["code"] for r in rows] == ["ZZ", "IR", "LT", "FR"] and rows[1]["sources"]["ping-slash24"] == 51700
    monkeypatch.setattr(of, "_get_json", lambda *a, **k: payload)
    d = of.fetch_ioda(NOW)
    alerts = [r["code"] for r in d["countries"] if r["alert"]]
    assert alerts == ["IR"] and d["n_alerts"] == 1  # 감시 국가가 아니면(ZZ) 경보 아님, 구글 트래픽 단독(LT)·저점수(FR)도 아님
    ev = of.ioda_events(d, NOW)
    assert ev[0]["th"] == "iran" and ev[0]["t"] == "D" and "ping-slash24" in ev[0]["x"] and ev[0]["s"].endswith("IR?d=2026-10-09")


def test_parse_markets_handles_json_strings_and_events():
    events = [{"slug": "iran-strike", "title": "Iran", "markets": [
        {"question": "Will the US strike Iran by December 31?", "outcomes": '["Yes", "No"]', "outcomePrices": '["0.23", "0.77"]', "volume": "125000", "endDate": "2026-12-31T00:00:00Z", "slug": "m1"},
        {"question": "Closed one", "outcomes": '["Yes","No"]', "outcomePrices": '["1","0"]', "closed": True}]},
        {"question": "Who wins?", "outcomes": ["Alice", "Bob"], "outcomePrices": ["0.5", "0.5"]},
        {"question": "Will China blockade Taiwan in 2026?", "outcomes": ["Yes", "No"], "outcomePrices": ["0.04", "0.96"], "volume": 900000, "slug": "tw"}]
    ms = of.parse_markets(events)
    assert [m["q"][:10] for m in ms] == ["Will China", "Will the U"]  # 거래량 순, 마감·비(Yes/No) 시장 제외
    assert ms[1]["p"] == 0.23 and ms[1]["end"] == "2026-12-31" and ms[1]["url"].endswith("/iran-strike")
    mapping = {"hormuz_war": {"q": r"(US|Israel)\b.*\bstrikes?\b.*\bIran"}, "taiwan_quarantine": {"q": "China.*blockade.*Taiwan"}, "x": {"q": "Taiwan", "invert": True}, "none": {"q": "Mars"}}
    m = of.match_scenarios(ms, mapping)
    assert m["hormuz_war"]["p"] == 0.23 and m["taiwan_quarantine"]["p"] == 0.04 and m["x"]["p"] == 0.96 and m["x"]["inverted"] and "none" not in m


def test_prediction_map_regexes_compile_and_hit_examples():
    import re

    import yaml
    sc = yaml.safe_load((ROOT / "dashboard/pipeline/prediction_map.yaml").read_text())["scenarios"]
    for sid, spec in sc.items():
        re.compile(spec["q"], re.I)
    samples = {"hormuz_war": "Will the U.S. strike Iran before 2027?", "taiwan_quarantine": "Will China invade Taiwan in 2026?",
               "korea_strategic": "North Korea nuclear test in 2026?", "us_recession": "US recession in 2026?"}
    for sid, q in samples.items():
        assert re.search(sc[sid]["q"], q, re.I), sid


def test_quakes_near_watch_and_hazard_events():
    t = int(datetime(2026, 10, 8, 3, tzinfo=UTC).timestamp() * 1000)
    feat = lambda mag, lon, lat, **p: {"properties": {"mag": mag, "time": t, "place": p.get("place", "x"), "url": f"https://usgs/{mag}{lon}", **p}, "geometry": {"coordinates": [lon, lat, 10]}}
    payload = {"features": [feat(5.2, 50.9, 28.9, place="near Bushehr"), feat(5.3, -150, -40), feat(6.4, 140, 36), feat(4.6, 50, 50, alert="orange"), {"properties": {}}]}
    qs = of.parse_quakes(payload, NOW)
    assert len(qs) == 3 and any(q["near"] and q["near"].startswith("부셰르") for q in qs)
    gd = of.parse_gdacs({"features": [{"properties": {"eventtype": "TC", "eventid": 1, "episodeid": 2, "alertlevel": "Red", "name": "Storm A", "country": "Philippines",
                                                      "fromdate": "2026-10-07T00:00:00", "todate": "2026-10-09T00:00:00", "url": {"report": "https://gdacs/r"}, "severitydata": {"severitytext": "Category 4"}},
                                       "geometry": {"coordinates": [124, 12]}},
                                      {"properties": {"alertlevel": "Green"}, "geometry": {"coordinates": [0, 0]}}]})
    assert len(gd) == 1 and gd[0]["level"] == "red"
    ev = of.hazard_events(qs, gd, NOW)
    bush = next(e for e in ev if "Bushehr" in e["x"])
    assert bush["th"] == "iran" and bush["r"] == 3
    storm = next(e for e in ev if e["src"] == "gdacs")
    assert storm["th"] == "scs" and "적색" in storm["x"] and storm["s"] == "https://gdacs/r"
    assert len({e["s"] for e in ev}) == len(ev)


SDN = "\n".join([
    '36,"AEROCARIBBEAN AIRLINES",-0- ,"CUBA",-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ',
    '9001,"OCEAN STAR","vessel","IRAN-EO13846",-0- ,"9XXXX","Crude Oil Tanker",-0- ,-0- ,"Panama",-0- ,"IMO 9000000"',
    '9002,"PETRO TRADING LLC",-0- ,"IRAN-EO13902",-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ',
] + [f'{100 + i},"FILLER {i}",-0- ,"SDGT",-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ' for i in range(1200)])


def test_ofac_baseline_then_diff(tmp_path, monkeypatch):
    (tmp_path / "data").mkdir()
    rows = of.parse_sdn(SDN)
    assert rows["9001"]["type"] == "vessel" and rows["9001"]["vess_flag"] == "Panama" and rows["36"]["type"] == "entity"
    base = "\n".join(l for l in SDN.splitlines() if not l.startswith(("9001", "9002")))
    monkeypatch.setattr(of.fetch, "get", lambda *a, **k: base.encode())
    first = of.fetch_ofac(tmp_path, NOW)
    assert first["baseline"] and first["n_new"] == 0 and of.ofac_events(first) == []
    monkeypatch.setattr(of.fetch, "get", lambda *a, **k: SDN.encode())
    second = of.fetch_ofac(tmp_path, NOW)
    assert second["n_new"] == 2 and second["new_vessels"] == 1 and not second["baseline"]
    ev = of.ofac_events(second)
    assert len(ev) == 2 and all(e["th"] == "iran" for e in ev) and len({e["s"] for e in ev}) == 2
    assert any("선박 1척" in e["x"] and "OCEAN STAR" in e["x"] for e in ev)
    third = of.fetch_ofac(tmp_path, NOW)
    assert third["n_new"] == 0


def test_run_isolates_failures_and_merges_events(tmp_path, monkeypatch):
    (tmp_path / "data").mkdir()
    (tmp_path / "data_snapshot.json").write_text(json.dumps({"events": []}))
    (tmp_path / "data" / "openfeeds.json").write_text(json.dumps({"poly": {"ok": True, "data": {"n_markets": 5, "matched": {}, "top": []}}}))
    ioda = {"data": [{"entity": {"code": "IR", "name": "Iran"}, "scores": {"overall": 50000}}]}

    def fake_get_json(url, params=None, timeout=40):
        if "ioda" in url:
            return ioda
        if "polymarket" in url:
            raise RuntimeError("HTTP 503")
        if "usgs" in url:
            return {"features": []}
        return {"features": []}
    monkeypatch.setattr(of, "_get_json", fake_get_json)
    monkeypatch.setattr(of.fetch, "get", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("blocked")))
    doc = of.run(tmp_path, NOW)
    assert doc["ioda"]["ok"] and not doc["poly"]["ok"] and doc["poly"]["data"]["n_markets"] == 5  # 실패 시 이전 값 유지
    assert not doc["ofac"]["ok"] and doc["summary"]["ioda_alerts"] == 1 and doc["summary"]["events"] == 1
    snap = json.loads((tmp_path / "data_snapshot.json").read_text())
    assert snap["events"][0]["src"] == "ioda"
