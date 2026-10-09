import json
import shutil
import sys
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))
DASH = ROOT / "dashboard"

from pipeline import assemble, bayes, calib, collectors, coverage, fetch, forecast, llm  # noqa: E402


def test_llm_parse_json_and_mode(monkeypatch):
    assert llm.parse_json('{"a": 1}') == {"a": 1}
    assert llm.parse_json('text before ```json\n{"a": [1,2]}\n``` after') == {"a": [1, 2]}
    assert llm.parse_json('blah {"x": "y"} trailing') == {"x": "y"}
    assert llm.parse_json("nothing") is None
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False); monkeypatch.delenv("CLAUDE_CODE_OAUTH_TOKEN", raising=False); monkeypatch.delenv("PIPELINE_NO_CLAUDE", raising=False)
    assert llm.mode() is None
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k"); assert llm.mode() == "api"
    monkeypatch.setenv("PIPELINE_NO_CLAUDE", "1"); assert llm.mode() is None


def test_coverage_clusters_unmapped_items():
    now = datetime(2026, 10, 8, tzinfo=UTC)
    mk = lambda t, d, dom, th=None: {"kind": "news", "title": t, "summary": "", "published": d + "T00:00:00Z", "url": f"https://{dom}/x", "extra": {"domain": dom}, "enr": {"th": th, "rel": 2}}
    items = [mk("Irkutsk plague scare grows", "2026-10-06", "a.com"), mk("Plague fears in Irkutsk hospital quarantine", "2026-10-07", "b.com"), mk("Irkutsk lab worker death", "2026-10-07", "c.com"),
             mk("Mapped item about Hormuz", "2026-10-07", "d.com", th="iran"), mk("Old Irkutsk story", "2026-09-01", "e.com"), mk("Random single", "2026-10-07", "f.com")]
    cl = coverage.clusters(items, now=now)
    assert cl and cl[0]["n"] == 3 and cl[0]["domains"] == 3 and cl[0]["key"].endswith("이르쿠츠크")


def test_corroboration_and_source_scores():
    ev = [{"d": "2026-10-05", "th": "iran", "t": "M", "p": "호르무즈", "x": "유조선 피격 호르무즈 인근 공격 보도", "s": "https://www.reuters.com/a", "g": "B2", "src": "reuters"},
          {"d": "2026-10-05", "th": "iran", "t": "M", "p": "호르무즈", "x": "호르무즈 인근 유조선 피격 공격 보도 확인", "s": "https://www.bbc.com/b", "g": "B2", "src": "bbc_world"},
          {"d": "2026-10-06", "th": "iran", "t": "M", "p": "호르무즈", "x": "유조선 피격 호르무즈 공격 추가 보도", "s": "https://www.aljazeera.com/c", "g": "B3", "src": "aljazeera"},
          {"d": "2026-10-05", "th": "sudan", "t": "S", "p": "엘오베이드", "x": "드론 공격", "s": "https://www.reuters.com/d", "g": "B2", "src": "reuters"}]
    out = assemble.corroborate(ev)
    hz = [e for e in out if e["th"] == "iran"]
    assert all(e["cc"] == 3 for e in hz) and all(e["g"] == "B1" for e in hz) and hz[2]["g0"] == "B3"
    assert [e for e in out if e["th"] == "sudan"][0]["cc"] == 1
    sc = assemble.source_scores(out, [{"id": "reuters", "ok": True}], now=datetime(2026, 10, 8, tzinfo=UTC))
    assert sc["reuters"]["n"] == 2 and sc["reuters"]["corroborated"] == 0.5 and sc["bbc_world"]["corroborated"] == 1.0


def test_bayes_update_shifts_within_group():
    scen = forecast.load_js(DASH, "scenario.js", "SCEN")
    iw = forecast.load_js(DASH, "iw.js", "IW")
    house = {"scenarios": [{"id": "hormuz_persist", "p": 60}, {"id": "hormuz_reopen", "p": 30}, {"id": "hormuz_war", "p": 10}, {"id": "fed_hawkish", "p": 25}]}
    lr = {"scenarios": {"hormuz_war": [{"key": "tw:brent_110", "lr": 3}], "hormuz_reopen": [{"key": "tw:brent_85", "lr": 3}], "fed_hawkish": [{"key": "risk:index>=75", "lr": 2}]}}
    res = bayes.update(house, lr, scen, iw, fired={"brent_110"}, risk_index=80)
    p = {v["id"]: v for v in res["scenarios"]}
    assert p["hormuz_war"]["p"] > 10 and p["hormuz_persist"]["p"] < 60 and abs(sum(p[k]["p"] for k in ("hormuz_persist", "hormuz_reopen", "hormuz_war")) - 100) < 1.5
    assert p["fed_hawkish"]["p"] > 25 and p["fed_hawkish"]["evidence"][0]["key"] == "risk:index>=75"
    res0 = bayes.update(house, lr, scen, iw, fired=set(), risk_index=10)
    assert all(abs(v["p"] - v["prior"]) < 1e-6 for v in res0["scenarios"] if not v["evidence"])


def test_calibration_from_analogs():
    scen = forecast.load_js(DASH, "scenario.js", "SCEN")
    an = forecast.load_js(DASH, "analogs.js", "ANALOGS")
    c = calib.calibrate(scen, an)
    assert "hormuz_war" in c and "brent" in c["hormuz_war"]["assets"] and c["hormuz_war"]["assets"]["brent"]["n"] >= 2


def test_forecast_auto_view_scored_separately(tmp_path):
    dash = tmp_path / "dashboard"; (dash / "data").mkdir(parents=True)
    (dash / "data" / "house_view.json").write_text(json.dumps({"asof": "2026-10-01", "scenarios": [{"id": "hormuz_war", "p": 40, "k": 1}]}))
    (dash / "data" / "house_view_auto.json").write_text(json.dumps({"asof": "2026-10-01", "scenarios": [{"id": "hormuz_war", "p": 70, "k": 1}]}))
    forecast.make_forecast(dash, src_dir=DASH, date="2026-10-01")
    forecast.make_forecast(dash, src_dir=DASH, date="2026-10-01", view_name="auto")
    assert (dash / "data" / "forecasts" / "2026-10-01-auto.json").exists()
    import datetime as dt
    d0 = dt.date(2026, 10, 1); dates = [(d0 + dt.timedelta(days=i)).isoformat() for i in range(40)]
    (dash / "data" / "series.json").write_text(json.dumps({"series": {"BZ=F": {"l": "b", "d": dates, "c": [100 * 1.01 ** i for i in range(40)]}}}))
    sc = forecast.score(dash)
    assert sc["n_forecasts"] == 2 and sc["overall"]["n"] == 1 and sc["overall_auto"]["n"] == 1
    assert sc["forecasts"][1]["view_name"] == "auto" and sc["forecasts"][1]["view"][0]["p"] == 70


FEED = b"""<?xml version="1.0"?><rss><channel><item><title>Plague alert in Irkutsk - Kyiv Independent</title><link>https://news.google.com/rss/articles/x</link><pubDate>Tue, 06 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>"""


def test_rss_falls_back_to_google_news_site_search(monkeypatch):
    calls = []

    def fake_get(url, params=None, timeout=25, retries=2, cache=True):
        calls.append(url)
        if url.startswith("https://kyivindependent.com"):
            raise RuntimeError("HTTPError: 404 Client Error")
        return FEED
    monkeypatch.setattr(fetch, "get", fake_get)
    src = {"id": "kyivindependent", "kind": "rss", "url": "https://kyivindependent.com/feed/", "lang": "en"}
    items = collectors.rss(src, {})
    assert len(items) == 1 and items[0]["extra"]["publisher"] == "Kyiv Independent"
    assert "site%3Akyivindependent.com" in calls[1] and "404" in src["_note"] and "site:kyivindependent.com" in src["_note"]
    strict = {**src, "no_fallback": True}
    import pytest
    with pytest.raises(RuntimeError):
        collectors.rss(strict, {})


SOCRATA_COT = """id,market_and_exchange_names,report_date_as_yyyy_mm_dd,open_interest_all,m_money_positions_long_all,m_money_positions_short_all,change_in_m_money_long_all,change_in_m_money_short_all
1,"COPPER - COMMODITY EXCHANGE INC.",2026-10-06T00:00:00.000,300000,120000,40000,5000,-2000
2,"COPPER - COMMODITY EXCHANGE INC.",2026-09-29T00:00:00.000,290000,110000,45000,1000,1000
3,"GOLD - COMMODITY EXCHANGE INC.",2026-10-06T00:00:00.000,500000,250000,50000,0,0
"""


def test_cot_falls_back_to_socrata_api(monkeypatch):
    calls = []

    def fake_get(url, params=None, timeout=25, retries=2, cache=True):
        calls.append((url, params))
        if "cftc.gov/dea" in url:
            raise RuntimeError("HTTPError: 403 Client Error")
        return SOCRATA_COT.encode()
    monkeypatch.setattr(fetch, "get", fake_get)
    src = {"id": "cftc_cot", "kind": "cot", "url": "https://www.cftc.gov/dea/newcot/f_disagg.txt", "alt_url": "https://publicreporting.cftc.gov/resource/72hh-3qpy.csv", "markets": {"COPPER": "구리", "GOLD": "금"}}
    items = collectors.collect(src, {})
    by = {i["extra"]["key"]: i["extra"] for i in items}
    assert by["COPPER"]["date"] == "2026-10-06" and by["COPPER"]["mm_net"] == 80000 and by["COPPER"]["net_chg"] == 7000 and by["GOLD"]["oi"] == 500000
    assert "$where" in calls[1][1] and "대체 2건" in src["_note"]


def test_generic_fallback_domain(monkeypatch):
    monkeypatch.setattr(fetch, "get", lambda url, params=None, timeout=25, retries=2, cache=True: FEED)
    monkeypatch.setitem(collectors.COLLECTORS, "boom", lambda src, cfg: (_ for _ in ()).throw(RuntimeError("403")))
    src = {"id": "reliefweb", "kind": "boom", "fallback_domain": "reliefweb.int"}
    assert len(collectors.collect(src, {})) == 1 and "site:reliefweb.int" in src["_note"]


def test_metric_items_sharing_a_url_keep_distinct_ids():
    a = {"kind": "metric", "sid": "cftc_cot", "title": "COT 금 2026-09-29", "url": "https://www.cftc.gov/x"}
    b = {"kind": "metric", "sid": "cftc_cot", "title": "COT 구리 2026-09-29", "url": "https://www.cftc.gov/x"}
    n1 = {"kind": "news", "sid": "s1", "title": "t1", "url": "https://e.com/1"}; n2 = {"kind": "news", "sid": "s2", "title": "t2", "url": "https://e.com/1"}
    assert assemble.item_id(a) != assemble.item_id(b) and assemble.item_id(n1) == assemble.item_id(n2)


def test_empty_model_env_falls_back_to_default(monkeypatch):
    monkeypatch.setenv("PIPELINE_MODEL", "")
    assert llm.model_name() == "claude-opus-5-5"


UNSUPPORTED = {"minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minLength", "maxLength", "pattern", "format", "minItems", "maxItems", "uniqueItems", "multipleOf", "patternProperties", "if", "then", "else", "not", "oneOf", "allOf"}


def _walk(node, path="$"):
    """구조화 출력(output_config.format.json_schema)이 거부하는 키워드·type 배열을 찾는다."""
    bad = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k in UNSUPPORTED:
                bad.append(f"{path}.{k}")
            if k == "type" and isinstance(v, list):
                bad.append(f"{path}.type[] (anyOf 사용)")
            bad += _walk(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            bad += _walk(v, f"{path}[{i}]")
    return bad


def test_structured_output_schemas_use_supported_subset():
    from pipeline import enrich, redteam, advisor
    import pipeline.report as report
    schemas = {"enrich": enrich.SCHEMA, "redteam": redteam.SCHEMA}
    for name, obj in list(vars(advisor).items()) + list(vars(report).items()):
        if name.endswith("SCHEMA") and isinstance(obj, dict):
            schemas[name] = obj
    for name, sc in schemas.items():
        assert not _walk(sc), f"{name}: {_walk(sc)}"


def test_region_theater_needs_security_keyword_even_after_claude(monkeypatch):
    from pipeline import enrich
    items = [{"id": "a1", "kind": "news", "title": "Nobel literature prize goes to Canadian poet", "summary": "", "url": "https://x.com/1", "published": "2026-10-08T00:00:00Z", "extra": {}},
             {"id": "a2", "kind": "news", "title": "US imposes 50% tariffs on Canadian autos", "summary": "", "url": "https://x.com/2", "published": "2026-10-08T00:00:00Z", "extra": {}}]
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    monkeypatch.setattr(enrich, "claude_enrich", lambda news, model=None, batch=20: {"a1": {"x": "노벨상", "t": "D", "th": "namerica", "p": "", "lat": None, "lon": None, "rel": 2}, "a2": {"x": "관세", "t": "E", "th": "namerica", "p": "", "lat": None, "lon": None, "rel": 2}})
    out = enrich.enrich_all(items)
    assert out[0]["enr"]["rel"] <= 1 and out[1]["enr"]["rel"] == 2


def test_collapse_duplicates_keeps_one_row_with_alt_sources():
    ev = [{"d": "2026-10-08", "th": "latam", "t": "E", "p": "칠레", "x": "칠레 구리 광산 파업으로 공급 우려 부각", "s": "https://a.com/1", "g": "C2", "auto": True},
          {"d": "2026-10-08", "th": "latam", "t": "E", "p": "칠레", "x": "칠레 파업에 따른 생산 위협으로 구리 가격 상승", "s": "https://b.com/2", "g": "B2", "auto": True},
          {"d": "2026-10-08", "th": "latam", "t": "E", "p": "칠레", "x": "칠레 구리광산 노사분쟁 생산량 5% 위험", "s": "https://c.com/3", "g": "C3", "auto": True},
          {"d": "2026-10-08", "th": "latam", "t": "E", "p": "칠레", "x": "분석관 수기 사건", "s": "https://d.com/4", "g": "A1"}]
    out = assemble.collapse_duplicates(assemble.corroborate(ev))
    auto = [e for e in out if e.get("auto")]
    assert len(auto) == 1 and auto[0]["cc"] == 4 and auto[0]["g"] == "B1" and set(auto[0]["alt"]) == {"https://a.com/1", "https://c.com/3"}
    assert any(not e.get("auto") for e in out) and all("_c" not in e for e in out)
    merged = assemble.merge_events(out, [{"d": "2026-10-08", "th": "latam", "t": "E", "p": "칠레", "x": "다시 들어온 같은 기사", "s": "https://a.com/1", "g": "C2", "auto": True, "id": "z"}], datetime(2026, 10, 8, tzinfo=UTC))
    assert isinstance(merged, tuple) and merged[1] == 0


def test_briefs_overlay_only_from_events(tmp_path, monkeypatch):
    from pipeline import briefs
    dash = tmp_path / "dashboard"; (dash / "data").mkdir(parents=True)
    (dash / "theaters.js").write_text('<script>const THEATERS = [\n  { id:"latam", name:"남미", sev:2, headline:"옛 브리핑", asof:"10/1" },\n  { id:"europe", name:"유럽", sev:3, headline:"옛", asof:"10/1" }\n];</script>')
    ev = [{"d": "2026-10-08", "th": "latam", "t": "E", "p": "칠레", "x": f"사건 {i}", "s": f"https://a.com/{i}", "g": "B2", "r": 3} for i in range(4)]
    (dash / "data_snapshot.json").write_text(json.dumps({"events": ev}))
    (dash / "data" / "theater_briefs.json").write_text(json.dumps({"items": {"europe": {"d": "2026-10-07", "asof": "10/7", "headline": "유럽 이전 자동 브리핑", "brief": ["x"], "metrics": [], "sources": [], "trend": "flat"}}}))
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    monkeypatch.setattr(briefs.llm, "complete_json", lambda system, user, schema=None, max_tokens=8000, effort="low", model=None: {"skip": False, "headline": "칠레 파업 확대", "brief": ["10/8 사건 0", "10/8 사건 1"], "metrics": [{"v": "95%", "l": "찬성", "n": "10/7"}], "sources": [{"name": "A", "url": "https://a.com/1"}, {"name": "가짜", "url": "https://nope.com/x"}], "trend": "up"})
    doc = briefs.run(dash, now=datetime(2026, 10, 8, 1, tzinfo=UTC))
    it = doc["items"]
    assert it["latam"]["headline"] == "칠레 파업 확대" and it["latam"]["sources"] == [{"name": "A", "url": "https://a.com/1"}] and it["latam"]["asof"] == "10/8"
    assert it["europe"]["headline"] == "유럽 이전 자동 브리핑"  # 사건 3건 미만 → 이전 자동 브리핑 유지
    assert json.loads((dash / "data" / "theater_briefs.json").read_text())["items"]["latam"]["n_events"] == 4


def test_claude_candidates_skip_known_and_noise():
    from pipeline import enrich
    mk = lambda i, t: {"id": i, "kind": "news", "title": t, "summary": "", "url": f"https://x.com/{i}", "published": "2026-10-08T00:00:00Z", "extra": {}}
    items = [mk("a", "Houthi missile hits tanker near Hormuz"), mk("b", "Nobel literature prize goes to Canadian poet"), mk("c", "US imposes tariffs on Canada"), mk("d", "Kyiv under drone attack")]
    for it in items:
        it["enr"] = enrich.rule_enrich(it)
    out = enrich.claude_candidates(items, known_urls={"https://x.com/d"})
    assert [it["id"] for it in out] == ["a", "c"]  # b: 잡음, d: 이미 상황판에 있음
