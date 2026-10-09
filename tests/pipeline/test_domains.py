import json
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import domains as dm  # noqa: E402

NOW = datetime(2026, 10, 9, 12, tzinfo=UTC)


def test_roles_and_aoi_summary():
    assert dm.role_of("R135") == "isr" and dm.role_of("k35r") == "tanker" and dm.role_of("B52") == "bomber" and dm.role_of("F16") == "other"
    ac = [{"lat": 24.0, "lon": 120.5, "t": "P8", "flight": "PEGASUS1 "}, {"lat": 24.5, "lon": 121.0, "t": "K35R"}, {"lat": 26.0, "lon": 52.0, "t": "R135"},
          {"lat": 0, "lon": 0, "t": "C17"}, {"lat": "x", "lon": 1}]
    s = dm.summarize_adsb({"ac": ac})
    assert s["taiwan"]["n"] == 2 and s["taiwan"]["by_role"] == {"isr": 1, "tanker": 1} and s["taiwan"]["ac"][0]["flight"] == "PEGASUS1"
    assert s["gulf"]["by_role"] == {"isr": 1} and s["korea"]["n"] == 0


def test_adsb_baseline_surge_and_events(tmp_path):
    (tmp_path / "data").mkdir()
    quiet = {"ac": [{"lat": 24.0, "lon": 120.5, "t": "P8"}]}
    busy = {"ac": [{"lat": 24.0 + i * 0.1, "lon": 120.5, "t": t} for i, t in enumerate(["P8", "R135", "K35R", "K35R", "Q4"])]}
    import pipeline.domains as mod
    for i in range(9):
        mod._get_json = lambda *a, **k: quiet
        d = mod.fetch_adsb(tmp_path, NOW - timedelta(hours=6 * (9 - i)))
    assert d["areas"]["taiwan"]["status"] == "normal" and d["areas"]["taiwan"]["base"] == 1
    mod._get_json = lambda *a, **k: busy
    d = mod.fetch_adsb(tmp_path, NOW)
    t = d["areas"]["taiwan"]
    assert t["status"] == "surge" and t["key"] == 5 and d["n_surge"] == 1
    ev = dm.adsb_events(d["areas"], NOW)
    assert len(ev) == 1 and ev[0]["th"] == "taiwan" and ev[0]["t"] == "M" and "정찰·급유기 5대" in ev[0]["x"]
    assert d["areas"]["korea"]["status"] == "normal"  # 0대 → 0대


def test_kev_recent_edge_and_events():
    vulns = [{"cveID": f"CVE-2020-{i}", "vendorProject": "Acme", "product": "Thing", "dateAdded": "2020-01-01"} for i in range(600)]
    vulns += [{"cveID": "CVE-2026-1111", "vendorProject": "Ivanti", "product": "Connect Secure", "vulnerabilityName": "Auth bypass", "dateAdded": "2026-10-08", "knownRansomwareCampaignUse": "Unknown"},
              {"cveID": "CVE-2026-2222", "vendorProject": "Acme", "product": "CMS", "vulnerabilityName": "RCE", "dateAdded": "2026-10-07", "knownRansomwareCampaignUse": "Known"},
              {"cveID": "CVE-2026-3333", "vendorProject": "Acme", "product": "App", "vulnerabilityName": "XSS", "dateAdded": "2026-10-08"}]
    dm._get_json = lambda *a, **k: {"vulnerabilities": vulns}
    d = dm.fetch_kev(Path("."), NOW)
    assert d["n_recent"] == 3 and d["n_week"] == 3 and d["recent"][0]["added"] == "2026-10-08"
    ev = dm.kev_events(d, NOW)
    assert {e["id"] for e in ev} == {"kev-CVE-2026-1111", "kev-CVE-2026-2222"} and all(e["t"] == "Y" for e in ev)


def test_ransomware_parse_summary_and_kr_events():
    rows = dm.parse_rw([{"victim": "Hanbit Co", "group": "lockbit", "country": "KR", "activity": "Manufacturing", "discovered": "2026-10-08 10:00"},
                        {"victim": "Acme", "group": "akira", "country": "US", "discovered": "2026-10-07"},
                        {"victim": "Old", "group": "x", "country": "KR", "discovered": "2026-09-01"}, {"group": "no victim"}])
    s = dm.summarize_rw(rows, NOW)
    assert s["n_week"] == 2 and s["by_country"] == {"KR": 1, "US": 1} and [r["victim"] for r in s["kr"]] == ["Hanbit Co"]
    ev = dm.rw_events(s)
    assert ev[0]["th"] == "korea" and ev[0]["t"] == "Y" and "미확인" in ev[0]["x"]


def test_run_isolates_failures(tmp_path):
    (tmp_path / "data").mkdir()
    (tmp_path / "data_snapshot.json").write_text(json.dumps({"events": []}))

    def fake(url, params=None, timeout=40):
        if "adsb" in url:
            raise RuntimeError("HTTP 429")
        if "cisa" in url:
            return {"vulnerabilities": [{"cveID": f"CVE-1-{i}", "dateAdded": "2020-01-01"} for i in range(600)]}
        return [{"victim": "Hanbit Co", "group": "lockbit", "country": "KR", "discovered": "2026-10-08"}]
    dm._get_json = fake
    doc = dm.run(tmp_path, NOW)
    assert not doc["adsb"]["ok"] and doc["kev"]["ok"] and doc["ransom"]["ok"]
    assert doc["summary"]["ransom_kr_week"] == 1 and doc["summary"]["events"] == 1
    assert json.loads((tmp_path / "data_snapshot.json").read_text())["events"][0]["src"] == "ransomware"
