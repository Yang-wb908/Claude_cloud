"""Enrichment: rule-based classification, gazetteer geocoding, source grading, and optional Claude
refinement (Korean one-line summary, type, theater, place, relevance).

Rules run first so the pipeline produces a usable snapshot without an API key. When
ANTHROPIC_API_KEY (or an `ant auth login` profile) is available, items are sent to Claude in
batches with a strict JSON schema; the rules result is kept as fallback for anything Claude
leaves blank or the request fails.
"""

from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path

log = logging.getLogger("pipeline.enrich")
HERE = Path(__file__).resolve().parent

# ── Source grading (Admiralty). Mirrors the dashboard's SRC_GRADE table. ───
GRADE_RULES = [
    (r"reuters\.com|apnews\.com|afp\.com|bbc\.com|bbc\.co\.uk|bloomberg\.com|ft\.com|wsj\.com", "B2"),
    (r"aljazeera|france24|dw\.com|theguardian|nytimes|latimes|cnbc|thehill|upi\.com|rfi\.fr|straitstimes|channelnewsasia|timesofisrael|kyivindependent|arabnews|alarabiya|gulfnews|middleeasteye|africanews|politico|economist|washingtonpost|cnn\.com|nikkei|scmp|yna\.co\.kr|koreaherald|koreatimes|npr\.org|pbs\.org|japantimes|taipeitimes|focustaiwan|thediplomat|dawn\.com", "B3"),
    (r"criticalthreats|understandingwar|csis\.org|iiss\.org|sipri|rand\.org|crisisgroup|brookings|cfr\.org|carnegie|chathamhouse|acleddata|lloydslist|usni\.org|twz\.com|janes|rusi\.org|warontherocks|thebulletin", "B2"),
    (r"\.gov|\.mil|un\.org|imf\.org|worldbank|iea\.org|opec\.org|fao\.org|who\.int|nato\.int|europa\.eu|reliefweb\.int|portwatch\.imf\.org|ukmto\.org|eia\.gov", "A2"),
    (r"tradingeconomics|drewry|finance\.yahoo|balticexchange|spglobal|kpler|vortexa|windward|marinetraffic", "B2"),
    (r"wikipedia\.org", "C3"),
    (r"gcaptain|splash247|seatrade|hellenicshippingnews|maritime-executive|oilprice|addisstandard|sudantribune|garoweonline|nknews|irrawaddy", "C3"),
]


def grade_url(url: str, fallback: str = "C4") -> str:
    if not url:
        return "F6"
    for rx, g in GRADE_RULES:
        if re.search(rx, url, re.I):
            return g
    return fallback


# ── Rule-based type / theater classification (port of the dashboard's live-feed rules) ──
TYPE_RULES = [
    ("M", r"\b(ship|ships|tanker|vessel|maritime|pirat|naval|blockade|merchant|convoy|freighter|cargo ship|lng carrier|hijack)"),
    ("G", r"(captur|retak|recaptur|seiz|take control|took [^.]{0,30}control|took over|launch(es|ed)? [^.]{0,30}(offensive|operation)|ground (operation|offensive)|troops (enter|advance)|withdr)"),
    ("S", r"(airstrike|air strike|drone|missile|shell|bomb|rocket|strikes? (on|against|at)|struck|artillery|ballistic|icbm|irbm)"),
    ("A", r"(suicide|bomber|massacre|kill(ed|s) civilians|attack on (a )?(village|market|camp|mosque|church|school)|gunmen|militants? (attack|kill)|terror)"),
    ("H", r"(ebola|cholera|outbreak|epidemic|who declares|vaccin|famine|malnutrition|plague|pneumonic|quarantin|biosafety|lab leak|hantavirus|nipah|marburg|h5n1|avian influenza|anthrax|smallpox|rospotrebnadzor|pandemic)"),
    ("E", r"(sanction|tariff|export control|price cap|oil price|brent|opec|inflation|rate hike|central bank|gdp|currency|rial|ruble|won\b)"),
    ("X", r"(earthquake|flood|typhoon|hurricane|cyclone|wildfire|collapse|crash|explosion at)"),
    ("C", r"(gang|cartel|smuggl|trafficking|arrest|indict|police)"),
    ("D", r"(summit|talks|negotiat|ceasefire|truce|minister|ambassador|embassy|treaty|agreement|un security council|resolution|election|parliament|president|visit)"),
]
THEATER_RULES = [
    ("bio", r"plague|pneumonic|Irkutsk|Rospotrebnadzor|anti-plague|biosafety|lab leak|laboratory accident|Nipah|hantavirus|H5N1|avian influenza|Marburg|smallpox|anthrax|pandemic|Buryatia|Khovd|PHEIC"),
    ("ukraine", r"Russo-Ukrainian|Ukrain|Kyiv|Kharkiv|Odesa|Zaporizh|Donetsk|Belgorod|Kursk|Kremlin|Moscow|Crimea|Black Sea"),
    ("iran", r"Hormuz|\bIran|Tehran|IRGC|Kharg|Bandar Abbas|Persian Gulf|\bIraq|Basra|Erbil"),
    ("yemen", r"Yemen|Houthi|Red Sea|Mandeb|Mandab|Bab al|Hodeidah|Sanaa|Aden\b|Perim|Mocha|Taiz|Marib|Jizan|Najran"),
    ("gaza", r"Gaza|West Bank|Hamas|settler|Rafah|Khan Younis|Jenin|Nablus|Hebron"),
    ("lebanon", r"Leban|Hezbollah|Syria|Beirut|Damascus|Homs|Aleppo|Latakia|Golan"),
    ("ethiopia", r"Ethiopi|Tigray|Eritre|Amhara|Afar|Mekelle|Addis|Asmara|TPLF|Fano"),
    ("sudan", r"Sudan|Darfur|Kordofan|Rapid Support|RSF|Khartoum|El Fasher|El Obeid|Port Sudan"),
    ("afpak", r"Afghan|Pakistan|Khyber|Taliban|Kashmir|Kabul|Islamabad|Peshawar|Kunar|Helmand|TTP"),
    ("sahel", r"\bMali\b|\bNiger\b|Nigeria|Burkina|Sahel|Boko Haram|JNIM|Bamako|Niamey|Kidal|Gao\b|Timbuktu|Borno|Maiduguri"),
    ("drc", r"\bCongo|\bDRC\b|M23|Ebola|Rwanda|Goma|Bukavu|Kinshasa|Kivu"),
    ("somalia", r"Somali|Puntland|al-Shabaab|Mogadishu|Baidoa|Gulf of Aden|pirat"),
    ("myanmar", r"Myanmar|Rakhine|Tatmadaw|Arakan|Sittwe|Naypyidaw|Yangon|junta"),
    ("korea", r"North Korea|Korean Peninsula|Pyongyang|Kim Jong|\bDMZ\b|Seoul|Yongbyon|Wonsan|Panmunjom|ballistic missile toward"),
    ("taiwan", r"Taiwan|Cross-strait|East China Sea|\bPLA\b|ADIZ|Kinmen|Senkaku|Okinawa"),
    ("scs", r"South China Sea|Philippin|Scarborough|Spratly|Second Thomas|Palawan|Manila"),
    ("carib", r"Caribbean|Venezuel|Haiti|Colombia|Southern Spear|cartel|Port-au-Prince|Caracas|SOUTHCOM"),
]
WIKI_CAT = {"Armed conflicts and attacks": None, "International relations": "D", "Politics and elections": "D", "Business and economy": "E",
            "Health and environment": "H", "Disasters and accidents": "X", "Law and crime": "C"}
RELEVANT_KW = re.compile(r"(war|strike|attack|missile|drone|troops|military|navy|carrier|sanction|blockade|ceasefire|offensive|rebel|militia|coup|pirat|hijack|"
                         r"tanker|Hormuz|Houthi|Taiwan|PLA|North Korea|nuclear|IAEA|NATO|Kremlin|Pentagon|CENTCOM|humanitarian|refugee|displaced|famine|Ebola|plague|outbreak|quarantine|WHO\b|pandemic)", re.I)


def classify_type(text: str, wiki_cat: str | None = None) -> str:
    if wiki_cat in WIKI_CAT and WIKI_CAT[wiki_cat]:
        return WIKI_CAT[wiki_cat]
    for t, rx in TYPE_RULES:
        if re.search(rx, text, re.I):
            return t
    return "D"


def classify_theater(text: str) -> str | None:
    for th, rx in THEATER_RULES:
        if re.search(rx, text):
            return th
    return None


# ── Gazetteer geocoding ───────────────────────────────────────────────────
_GAZ: list[dict] | None = None


def gazetteer() -> list[dict]:
    global _GAZ
    if _GAZ is None:
        _GAZ = json.loads((HERE / "gazetteer.json").read_text())
        # longest names first so "Port Sudan" wins over "Sudan"
        _GAZ.sort(key=lambda g: -len(g["en"]))
        for g in _GAZ:
            g["_rx"] = re.compile(r"(?<![A-Za-z])" + re.escape(g["en"]) + r"(?![A-Za-z])", re.I)
    return _GAZ


PREFER = {"city": 3, "site": 3, "base": 3, "choke": 2, "sea": 1, "region": 1}


def geocode(text: str, hints: list[str] | None = None) -> dict | None:
    """Return {"at": [lon, lat], "p": Korean name} for the most specific place mentioned."""
    cands = []
    hay = text + " " + " ".join(hints or [])
    for g in gazetteer():
        m = g["_rx"].search(hay)
        if m:
            cands.append((PREFER.get(g["k"], 0), -m.start(), g))
    if not cands:
        return None
    cands.sort(key=lambda c: (-c[0], -c[1]))
    g = cands[0][2]
    return {"at": [g["lon"], g["lat"]], "p": g["ko"]}


def rule_enrich(item: dict) -> dict:
    text = f"{item.get('title', '')} {item.get('summary', '')}"
    ex = item.get("extra", {})
    t = classify_type(text, ex.get("cat"))
    th = classify_theater(text)
    loc = geocode(text, ex.get("wiki_links") or ex.get("countries"))
    relevant = bool(th) or bool(RELEVANT_KW.search(text))
    return {"t": t, "th": th, "at": loc["at"] if loc else None, "p": loc["p"] if loc else "", "x": item.get("title", "")[:140],
            "rel": 2 if th else (1 if relevant else 0), "lang": "en"}


# ── Claude refinement ─────────────────────────────────────────────────────
SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["items"],
    "properties": {"items": {"type": "array", "items": {
        "type": "object", "additionalProperties": False,
        "required": ["id", "x", "t", "th", "p", "lat", "lon", "rel"],
        "properties": {
            "id": {"type": "string"},
            "x": {"type": "string", "description": "한국어 한 줄 요약, 60자 이내, 사실만. 숫자·지명 유지"},
            "t": {"type": "string", "enum": ["S", "G", "M", "A", "D", "E", "H", "X", "C"]},
            "th": {"type": ["string", "null"], "enum": ["iran", "ukraine", "yemen", "ethiopia", "sudan", "gaza", "afpak", "korea", "lebanon", "sahel", "drc", "somalia", "myanmar", "taiwan", "scs", "carib", None]},
            "p": {"type": "string", "description": "가장 구체적인 지명의 한국어 표기, 없으면 빈 문자열"},
            "lat": {"type": ["number", "null"]}, "lon": {"type": ["number", "null"]},
            "rel": {"type": "integer", "minimum": 0, "maximum": 3, "description": "지정학·안보 상황판 관련도: 0 무관, 1 배경, 2 관련, 3 핵심"},
        }}}},
}
SYSTEM = ("너는 국가 정보기관 상황실의 수집 분석관이다. 영어 뉴스 항목을 받아 한국어 한 줄 요약(x), 사건 유형(t: S 공습·드론·미사일, G 지상전·점령, "
          "M 해상, A 테러·민간인 공격, D 외교·정치, E 경제·제재, H 보건, X 재난·사고, C 범죄·치안), 관련 전역(th), 가장 구체적인 지명(p, 한국어)과 그 좌표(lat, lon), "
          "관련도(rel)를 매긴다. 좌표는 확신할 때만 적고 모르면 null. 요약은 추측 없이 기사에 있는 사실만, 60자 이내.")


def claude_enrich(items: list[dict], model: str | None = None, batch: int = 20) -> dict[str, dict]:
    """Returns {item_id: refinement}. Silently returns {} when no credentials are available."""
    from . import llm
    if llm.mode() == "cli":
        out: dict[str, dict] = {}
        for i in range(0, len(items), batch):
            chunk = items[i:i + batch]
            lines = [{"id": it["id"], "source": it.get("extra", {}).get("domain", ""), "date": it["published"][:10], "title": it["title"], "summary": it.get("summary", "")[:400]} for it in chunk]
            res = llm.complete_json(SYSTEM, "항목:\n" + json.dumps(lines, ensure_ascii=False), SCHEMA)
            for r in (res or {}).get("items", []) if isinstance(res, dict) else []:
                if r.get("id"):
                    out[r["id"]] = r
        return out
    if llm.mode() != "api":
        return {}
    try:
        import anthropic
    except ImportError:
        log.warning("anthropic SDK not installed; skipping Claude enrichment")
        return {}
    model = model or os.environ.get("PIPELINE_MODEL", "claude-opus-5-5")
    client = anthropic.Anthropic()
    out: dict[str, dict] = {}
    for i in range(0, len(items), batch):
        chunk = items[i:i + batch]
        lines = [{"id": it["id"], "source": it.get("extra", {}).get("domain", ""), "date": it["published"][:10], "title": it["title"], "summary": it.get("summary", "")[:400]} for it in chunk]
        try:
            resp = client.beta.messages.create(
                model=model, max_tokens=8000,
                betas=["server-side-fallback-2026-07-01"], fallbacks="default",
                output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
                system=[{"type": "text", "text": SYSTEM, "cache_control": {"type": "ephemeral"}}],
                messages=[{"role": "user", "content": "항목:\n" + json.dumps(lines, ensure_ascii=False)}],
            )
            if resp.stop_reason == "refusal":
                log.warning("batch %d refused: %s", i // batch, getattr(resp, "stop_details", None))
                continue
            text = next(b.text for b in resp.content if b.type == "text")
            for r in json.loads(text).get("items", []):
                out[r["id"]] = r
        except anthropic.RateLimitError as e:
            log.warning("rate limited; stopping enrichment early: %s", e)
            break
        except anthropic.APIStatusError as e:
            log.warning("API error %s on batch %d: %s", e.status_code, i // batch, e.message)
        except anthropic.APIConnectionError as e:
            log.warning("connection error: %s", e)
            break
        except (StopIteration, json.JSONDecodeError, KeyError) as e:
            log.warning("unparseable batch %d: %s", i // batch, e)
    return out


def enrich_all(items: list[dict], use_claude: bool = True) -> list[dict]:
    """Attach `enr` to each item. Rules first, Claude refinement second (when available)."""
    for it in items:
        it["enr"] = rule_enrich(it)
        it["grade"] = grade_url(it.get("url", ""), "C3" if it.get("sid", "").startswith("gn_") else "C4")
    if use_claude and (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN") or os.environ.get("PIPELINE_FORCE_CLAUDE")):
        news = [it for it in items if it.get("kind") in ("news", "report")]
        ref = claude_enrich(news)
        for it in news:
            r = ref.get(it["id"])
            if not r:
                continue
            e = it["enr"]
            e["x"] = r["x"] or e["x"]
            e["t"] = r["t"] or e["t"]
            e["th"] = r["th"] if r["th"] is not None else e["th"]
            e["p"] = r["p"] or e["p"]
            if r["lat"] is not None and r["lon"] is not None:
                e["at"] = [round(float(r["lon"]), 3), round(float(r["lat"]), 3)]
            e["rel"] = max(e["rel"], int(r["rel"]))
            e["lang"] = "ko"
            e["claude"] = True
    return items
