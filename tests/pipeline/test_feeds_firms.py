import json
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import feeds, firms  # noqa: E402

NOW = datetime(2026, 10, 9, 12, tzinfo=UTC)


def test_parse_eia_weekly_changes():
    rows = [{"period": f"2026-0{m}-0{d}", "series": "WCESTUS1", "value": str(420000 + i * 1000), "units": "MBBL"} for i, (m, d) in enumerate([(8, 1), (8, 8), (8, 9), (9, 1), (9, 5), (9, 8)])]
    rows += [{"period": "2026-09-08", "series": "WCSSTUS1", "value": "400000"}, {"period": "2026-09-08", "series": "XXX", "value": "1"}, {"period": "2026-09-01", "series": "WCSSTUS1", "value": "n/a"}]
    out = feeds.parse_eia({"response": {"data": rows}})
    assert set(out) == {"WCESTUS1", "WCSSTUS1"}
    c = out["WCESTUS1"]
    assert c["d"] == "2026-09-08" and c["v"] == 425000 and c["chg_w"] == 1000 and c["chg_4w"] == 4000 and out["WCSSTUS1"]["chg_w"] is None


def test_parse_fred_skips_missing_and_computes_changes():
    obs = [{"date": f"2026-09-{d:02d}", "value": str(1 + d / 100)} for d in range(1, 30)] + [{"date": "2026-09-30", "value": "."}]
    p = feeds.parse_fred({"observations": list(reversed(obs))})
    assert p["d"] == "2026-09-29" and abs(p["v"] - 1.29) < 1e-9 and abs(p["chg_1w"] - 0.05) < 1e-9 and len(p["series"]) == 29
    assert feeds.parse_fred({"observations": [{"date": "2026-09-01", "value": "."}]}) is None


def test_parse_gfw_both_shapes_and_summary():
    a = {"entries": [{"public-global-presence:v3.0": [{"date": "2026-09-30", "hours": 240}, {"date": "2026-09-30", "hours": 240}, {"date": "2026-10-01", "hours": 120}]}]}
    b = [{"date": "2026-09-30T00:00:00Z", "detections": 3}]
    assert feeds.parse_gfw(a, "hours") == {"2026-09-30": 480.0, "2026-10-01": 120.0}
    assert feeds.parse_gfw({"entries": b}, "detections") == {"2026-09-30": 3.0}
    days = [(NOW - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(14, 0, -1)]
    pres = {d: (480 if i < 7 else 240) for i, d in enumerate(days)}  # 선박 20척 → 10척
    s = feeds.summarize_gfw(pres, {days[-1]: 5}, {days[-1]: 2})
    assert s["vessels_avg7"] == 10.0 and s["vessels_prev7"] == 20.0 and s["chg"] == -0.5 and s["dark_7d"] == 2 and s["latest"] == days[-1]


def test_feeds_run_without_keys_keeps_previous(tmp_path, monkeypatch):
    for k in ("EIA_API_KEY", "FRED_API_KEY", "GFW_TOKEN"):
        monkeypatch.delenv(k, raising=False)
    (tmp_path / "data").mkdir()
    (tmp_path / "data" / "feeds.json").write_text(json.dumps({"fred": {"ok": True, "at": "x", "data": {"STLFSI4": {"v": 0.3}}}}))
    doc = feeds.run(tmp_path, now=NOW)
    assert doc["fred"]["data"]["STLFSI4"]["v"] == 0.3 and doc["fred"]["ok"] is False and "미설정" in doc["fred"]["err"] and doc["eia"]["ok"] is False


def test_feeds_error_message_masks_key(tmp_path, monkeypatch):
    monkeypatch.setenv("FRED_API_KEY", "SECRETKEY123")
    monkeypatch.delenv("EIA_API_KEY", raising=False); monkeypatch.delenv("GFW_TOKEN", raising=False)
    def boom(k):
        raise RuntimeError(f"403 for url https://api.stlouisfed.org/fred?api_key={k}")
    monkeypatch.setattr(feeds, "fetch_fred", boom)
    doc = feeds.run(tmp_path, now=NOW)
    assert "SECRETKEY123" not in json.dumps(doc) and "***" in doc["fred"]["err"]


CSV_HEAD = "latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight\n"


def _csv(rows):
    return CSV_HEAD + "".join(f"{la},{lo},330,0.4,0.4,{d},0130,N20,VIIRS,n,2.0NRT,290,{frp},N\n" for la, lo, d, frp in rows)


def test_firms_parse_and_site_radius():
    site = {"id": "s", "lat": 53.38, "lon": 55.97, "r_km": 6}
    rows = firms.parse_csv(_csv([(53.39, 55.98, "2026-10-09", 40.5), (53.38, 55.97, "2026-10-09", 3), (53.80, 55.97, "2026-10-09", 99)]))
    assert len(rows) == 3 and firms.parse_csv("Invalid MAP_KEY.") == []
    by = firms.summarize_site(site, rows)
    assert by["2026-10-09"][0] == 2 and by["2026-10-09"][1] == 40.5  # 47km 떨어진 점은 제외
    b = firms.site_bbox(site)
    assert b[0] < 55.97 < b[2] and b[1] < 53.38 < b[3]


def test_firms_baseline_learning_then_alert():
    h = {}
    assert firms.judge(h, NOW, "sites")["status"] == "learning"
    for i in range(2, 12):  # 평소: 하루 2건·FRP 8MW (플레어)
        h[(NOW - timedelta(days=i)).strftime("%Y-%m-%d")] = [2, 8.0, 53.38, 55.97]
    h[NOW.strftime("%Y-%m-%d")] = [3, 9.0, 53.38, 55.97]
    assert firms.judge(h, NOW, "sites")["status"] == "normal"
    h[NOW.strftime("%Y-%m-%d")] = [9, 95.0, 53.39, 55.98]
    j = firms.judge(h, NOW, "sites")
    assert j["status"] == "alert" and j["base_n"] == 2 and j["at"] == [55.98, 53.39]


def test_firms_run_with_fake_fetcher_creates_events(tmp_path, monkeypatch):
    dash = tmp_path; (dash / "data").mkdir()
    watch = {"sites": [{"id": "salavat", "n": "살라바트", "en": "Salavat", "lat": 53.38, "lon": 55.97, "r_km": 6, "th": "ukraine", "kind": "energy"}], "aois": []}
    monkeypatch.setattr(firms, "load_watch", lambda: watch)
    hist = {"sites": {"salavat": {(NOW - timedelta(days=i)).strftime("%Y-%m-%d"): [1, 5.0, 53.38, 55.97] for i in range(2, 10)}}, "aois": {}}
    (dash / "data" / "firms_history.json").write_text(json.dumps(hist))
    (dash / "data_snapshot.json").write_text(json.dumps({"events": []}))
    today = NOW.strftime("%Y-%m-%d")
    fake = lambda bbox: firms.parse_csv(_csv([(53.38, 55.97, today, 120)] * 6))
    doc = firms.run(dash, now=NOW, key="K", fetcher=fake)
    assert doc["n_alerts"] == 1 and doc["alerts"][0]["th"] == "ukraine" and "살라바트" in doc["alerts"][0]["x"]
    snap = json.loads((dash / "data_snapshot.json").read_text())
    assert snap["events"][0]["src"] == "firms" and snap["events"][0]["t"] == "X"
    doc2 = firms.run(dash, now=NOW, key="K", fetcher=fake)  # 같은 경보는 중복 사건을 만들지 않는다
    assert len(json.loads((dash / "data_snapshot.json").read_text())["events"]) == 1 and doc2["n_alerts"] == 1


def test_firms_no_key_and_all_fail(tmp_path, monkeypatch):
    monkeypatch.delenv("FIRMS_MAP_KEY", raising=False)
    assert firms.run(tmp_path, now=NOW) is None
    monkeypatch.setattr(firms, "load_watch", lambda: {"sites": [{"id": "a", "n": "a", "en": "a", "lat": 1, "lon": 1, "r_km": 5, "th": "iran", "kind": "energy"}], "aois": []})
    def boom(bbox):
        raise RuntimeError("403 https://firms/api/area/csv/MYKEY/x")
    doc = firms.run(tmp_path, now=NOW, key="MYKEY", fetcher=boom)
    assert doc["errors"] and "MYKEY" not in json.dumps(doc) and not (tmp_path / "data" / "firms.json").exists()
