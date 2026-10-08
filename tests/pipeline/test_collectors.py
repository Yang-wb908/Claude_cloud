"""Offline parser tests for the collection pipeline (no network)."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import collectors  # noqa: E402

FX = Path(__file__).parent / "fixtures"


def test_parse_rss_basic():
    items = collectors.parse_feed((FX / "sample_rss.xml").read_bytes(), "bbc_world")
    assert len(items) == 2
    assert items[0]["title"] == "Tankers hit near Strait of Hormuz as attacks resume"
    assert items[0]["url"].startswith("https://www.bbc.com/")
    assert items[0]["published"].startswith("2026-10-07")
    assert items[0]["extra"]["domain"] == "bbc.com"
    assert "<" not in items[0]["summary"]


def test_gdelt_parse_dates():
    payload = json.loads((FX / "gdelt.json").read_text())
    items = collectors.parse_gdelt(payload, "gdelt_conflict")
    assert items[0]["published"] == "2026-10-07T18:30:00Z"
    assert items[0]["extra"]["domain"] == "reuters.com"


def test_portwatch_parse_maps_chokepoints():
    payload = json.loads((FX / "portwatch.json").read_text())
    items = collectors.parse_portwatch(payload, "portwatch")
    chokes = {it["extra"]["choke"] for it in items}
    assert chokes == {"hormuz", "bab"}
    h = next(it for it in items if it["extra"]["choke"] == "hormuz")
    assert h["extra"]["n_total"] == 7 and h["extra"]["date"] == "2026-10-06"


def test_yf_parse_change():
    payload = json.loads((FX / "yf_brent.json").read_text())
    it = collectors.parse_yf(payload, "BZ=F", "브렌트유", "markets")
    assert it["extra"]["value"] == 101.6
    assert it["extra"]["chg"] == "+1.3%"
    assert it["extra"]["date"] == "2026-10-07"


def test_wiki_month_parse():
    html = (FX / "wiki_month.html").read_text()
    items = collectors.parse_wiki_month(html, "wiki_current", "2026-10-06")
    assert len(items) == 2
    assert items[0]["extra"]["cat"] == "Armed conflicts and attacks"
    assert "Tigray" in items[0]["extra"]["wiki_links"]
    assert items[0]["url"].startswith("https://www.aljazeera.com/")
    assert items[0]["summary"].endswith("Mekelle.")  # trailing (source) parenthetical stripped


def test_taiwan_mnd_parse():
    html = (FX / "taiwan_mnd.html").read_text()
    items = collectors.parse_taiwan_mnd(html, "taiwan_mnd")
    assert items[0]["extra"] == {"metric": "pla_daily", "date": "2026-10-07", "aircraft": 23, "ships": 8, "domain": "mnd.gov.tw"}


def test_gnews_publisher_split():
    items = collectors.parse_feed((FX / "gnews.xml").read_bytes(), "gn_hormuz")
    import re
    t = items[0]["title"]
    m = re.match(r"^(.*)\s+-\s+([^-]{2,60})$", t)
    assert m and m.group(2) == "Reuters"
