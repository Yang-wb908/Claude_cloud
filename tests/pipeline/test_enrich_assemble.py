import json
import sys
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import assemble, enrich, tripwires  # noqa: E402


def test_rule_enrich_theater_type_geocode():
    it = {"title": "Drone strikes hit El Obeid as RSF shells North Kordofan", "summary": "", "published": "2026-10-07T10:00:00Z", "extra": {}}
    e = enrich.rule_enrich(it)
    assert e["th"] == "sudan" and e["t"] == "S" and e["rel"] == 2
    assert e["p"] == "엘오베이드" and abs(e["at"][0] - 30.23) < 0.5


def test_geocode_prefers_specific_place():
    loc = enrich.geocode("Explosion reported in Port Sudan as fighting continues in Sudan")
    assert loc["p"] == "포트수단"


def test_grade_url():
    assert enrich.grade_url("https://www.reuters.com/x") == "B2"
    assert enrich.grade_url("https://reliefweb.int/report/x") == "A2"
    assert enrich.grade_url("") == "F6"
    assert enrich.grade_url("https://random-blog.example/x") == "C4"


def test_merge_events_dedup_and_cap():
    now = datetime(2026, 10, 8, tzinfo=UTC)
    existing = [{"d": "2026-10-07", "t": "S", "x": "기존 사건", "s": "https://a/1", "th": "iran"}]
    new = [{"d": "2026-10-07", "t": "M", "x": "새 사건", "s": "https://a/1", "th": "iran", "id": "a1", "auto": True},   # dup url
           {"d": "2026-10-07", "t": "M", "x": "기존 사건", "s": "https://a/2", "th": "iran", "id": "a2", "auto": True},  # dup text
           {"d": "2026-10-07", "t": "M", "x": "진짜 새 사건", "s": "https://a/3", "th": "iran", "id": "a3", "auto": True},
           {"d": "2026-08-01", "t": "M", "x": "오래된 사건", "s": "https://a/4", "th": "iran", "id": "a4", "auto": True}]   # too old
    merged, added = assemble.merge_events(existing, new, now)
    assert added == 1 and len(merged) == 2
    assert merged[0]["x"] in ("기존 사건", "진짜 새 사건")


def test_assemble_writes_files(tmp_path):
    dash = tmp_path
    (dash / "data_snapshot.json").write_text(json.dumps({"events": [], "cities": [], "lanes": [], "chokepoints": [], "markets": {}}))
    items = [
        {"id": "a1", "sid": "bbc_world", "kind": "news", "title": "Houthis strike tanker in Red Sea", "summary": "", "url": "https://www.bbc.com/1", "published": "2026-10-07T09:00:00Z",
         "extra": {"domain": "bbc.com"}, "grade": "B2", "enr": {"t": "M", "th": "yemen", "at": [43.4, 12.6], "p": "바브엘만데브", "x": "후티, 홍해에서 유조선 공격", "rel": 3, "lang": "ko"}},
        {"id": "m1", "sid": "markets", "kind": "metric", "title": "브렌트유", "url": "https://finance.yahoo.com/quote/BZ%3DF", "published": "2026-10-07T00:00:00Z",
         "extra": {"sym": "BZ=F", "label": "브렌트유 ($/bbl)", "value": 112.5, "chg": "+2.0%", "date": "2026-10-07", "domain": "finance.yahoo.com"}},
        {"id": "p1", "sid": "portwatch", "kind": "metric", "title": "pw", "url": "https://portwatch.imf.org/", "published": "2026-10-06T00:00:00Z",
         "extra": {"choke": "hormuz", "date": "2026-10-06", "n_total": 7, "n_tanker": 3, "n_container": 1, "domain": "portwatch.imf.org"}},
    ]
    status = [{"id": "bbc_world", "name": "BBC", "ok": True, "n": 1}, {"id": "ukmto", "name": "UKMTO", "ok": False, "n": 0, "err": "HTTP 403"}]
    res = assemble.assemble(items, status, now=datetime(2026, 10, 8, 4, tzinfo=UTC), dash=dash)
    auto = json.loads((dash / "intel.auto.json").read_text())
    assert auto["counts"]["added"] == 1 and auto["markets"][0]["v"] == 112.5
    assert auto["portwatch"]["hormuz"]["latest"]["n_total"] == 7
    assert auto["gaps"] == ["UKMTO: HTTP 403"]
    assert (dash / "data" / "latest.json").exists() and len(list((dash / "data" / "history").glob("*.json"))) == 1
    snap = json.loads((dash / "data_snapshot.json").read_text())
    assert snap["events"][0]["x"] == "후티, 홍해에서 유조선 공격" and snap["events"][0]["auto"] is True
    # tripwires: brent > 110 and hormuz < 10 fire; event_count maritime 24h (1 event) does not
    fired = tripwires.evaluate(auto, snap["events"], now=datetime(2026, 10, 8, 4, tzinfo=UTC))
    ids = {f["id"] for f in fired}
    assert {"brent_110", "hormuz_transits_low"} <= ids and "maritime_attacks" not in ids
    # second run produces a diff against history
    res2 = assemble.assemble(items, status, now=datetime(2026, 10, 8, 10, tzinfo=UTC), dash=dash)
    assert res2["auto"]["changes"]["since"] == "2026-10-08T04:00:00Z" and res2["auto"]["changes"]["new_count"] == 0


def test_enrich_cache_skips_already_judged_items(tmp_path, monkeypatch):
    from pipeline import enrich, llm
    calls = []

    def fake_enrich(items, model=None, batch=30):
        calls.append([it["id"] for it in items])
        return {it["id"]: {"id": it["id"], "x": "요약 " + it["id"], "t": "Y", "th": None, "rel": 1} for it in items}
    monkeypatch.setattr(enrich, "claude_enrich", fake_enrich)
    monkeypatch.setattr(llm, "mode", lambda: "cli")
    mk = lambda i: {"id": f"i{i}", "kind": "news", "url": f"https://ex.com/{i}", "title": f"hackers breach ministry {i}", "summary": "", "published": "2026-10-09T00:00:00Z", "sid": "x"}
    cp = tmp_path / "cache.json"
    enrich.enrich_all([mk(1), mk(2)], known_urls=set(), cache_path=cp)
    out = enrich.enrich_all([mk(1), mk(2), mk(3)], known_urls=set(), cache_path=cp)
    assert calls == [["i1", "i2"], ["i3"]]  # 두 번째 실행은 새 기사만 Claude 로
    assert all(it["enr"].get("claude") and it["enr"]["t"] == "Y" for it in out)  # 캐시 판정도 똑같이 적용, 사이버(Y) 허용


def test_sensor_events_are_not_merged_and_quality_flags():
    from pipeline import assemble as A
    ev = [{"d": "2026-10-09", "th": "namerica", "t": "X", "p": "미국", "x": "GDACS 적색 경보 · 열대성 폭풍 Tropical Cyclone SIMON-26", "s": "https://gdacs/1", "src": "gdacs", "auto": True, "g": "A2"},
          {"d": "2026-10-09", "th": "namerica", "t": "X", "p": "미국", "x": "GDACS 주황 경보 · 열대성 폭풍 Tropical Cyclone ISAIAS-26", "s": "https://gdacs/2", "src": "gdacs", "auto": True, "g": "A2"},
          {"d": "2026-10-09", "th": "ukraine", "t": "S", "p": "Kyiv", "x": "키이우 드론 공격 3명 사망", "s": "https://a.com/1", "src": "x", "auto": True, "g": "C3"},
          {"d": "2026-10-09", "th": "ukraine", "t": "S", "p": "키이우", "at": [100.0, 10.0], "x": "러시아 미사일 공습", "s": "https://rt.com/1", "src": "y", "auto": True, "g": "D4"},
          {"d": "2026-10-09", "th": "ukraine", "t": "D", "p": "", "x": "회담", "s": "https://b.com/1", "src": "z", "auto": True, "g": "C3"}]
    out = A.collapse_duplicates(A.corroborate(ev))
    assert sum(1 for e in out if e["src"] == "gdacs") == 2  # 다른 태풍 두 건이 합쳐지지 않음
    st = A.quality_pass(out, {"kyiv": [30.52, 50.45], "키이우": [30.52, 50.45]})
    by = {e["s"]: e for e in out}
    assert by["https://a.com/1"]["at"] == [30.52, 50.45] and by["https://a.com/1"]["geo"] == "gaz" and by["https://a.com/1"]["q"] == "single"
    assert by["https://rt.com/1"]["geo"] == "fixed" and by["https://rt.com/1"]["q"] == "lowcred"
    assert "q" not in by["https://b.com/1"] and "q" not in by["https://gdacs/1"]  # 외교 사건·센서 사건은 표시 안 함
    assert st["geo_filled"] == 1 and st["geo_fixed"] == 1 and st["single"] == 1 and st["lowcred"] == 1


def test_state_media_graded_low():
    from pipeline.enrich import grade_url
    assert grade_url("https://www.rt.com/news/1") == "D4" and grade_url("https://www.presstv.ir/x") == "D4" and grade_url("https://www.reuters.com/x") == "B2"
    assert grade_url("https://www.art.com/x") != "D4"


def test_kst_date_boundary():
    kst_date = assemble.kst_date
    assert kst_date("2026-10-09T16:30:00Z") == "2026-10-10"   # KST 01:30 → 다음 날
    assert kst_date("2026-10-09T14:59:59Z") == "2026-10-09"   # KST 23:59
    assert kst_date("2026-10-09T00:00:00Z") == "2026-10-09"   # 시각 없는 날짜는 그대로
    assert kst_date("2026-10-09T12:00:00Z") == "2026-10-09"
    assert kst_date("2026-10-09") == "2026-10-09"
