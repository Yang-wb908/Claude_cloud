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
from datetime import UTC, datetime, timedelta
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
    ("Y", r"(cyber ?attack|hack(ed|ers?|ing)|ransomware|data breach|DDoS|malware|zero-day|해킹|랜섬웨어|사이버 ?공격)"),
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
    ("carib", r"Caribbean|Venezuel|Maduro|Haiti|Colombia|Southern Spear|Port-au-Prince|Caracas|SOUTHCOM"),
    ("latam", r"Brazil|Lula|Bolsonaro|Argentin|Milei|\bChile|Escondida|Centinela|Codelco|\bPeru|Fujimori|Bolivia|Ecuador|Uruguay|Paraguay|Mercosur|Santiago|S[aã]o Paulo|Bras[ií]lia|Buenos Aires|Antofagasta|Atacama"),
    ("oceania", r"Australi|Canberra|AUKUS|Papua|Bougainville|Solomon Islands|Honiara|\bFiji|Vanuatu|\bTonga|\bSamoa|Pacific Islands Forum|Pilbara|Port Hedland|Fortescue|Rio Tinto|\bBHP\b|New Zealand|Kiribati|Nauru|\bGuam"),
    ("southasia", r"\bIndia\b|Indian Army|Indian Navy|New Delhi|\bModi\b|Bangladesh|Dhaka|Sri Lanka|Colombo|\bNepal|Kathmandu|Maldives|Line of Control|\bLoC\b|Siachen"),
    ("europe", r"Baltic|\bNATO\b|Kaliningrad|Estonia|Latvia|Lithuania|Finland|Sweden|Norway|Denmark|Poland|Germany|Berlin|France|Paris|Macron|\bMerz|Brussels|European Commission|European Union|shadow fleet|Northern Sea Route|Arctic|Murmansk|Svalbard|Greenland|Ust-Luga|Primorsk|Vaindloo|Gotland|Bornholm|undersea cable"),
    ("namerica", r"Canada|Carney|Ottawa|USMCA|Sheinbaum|Mexic|Sinaloa|CJNG|Tijuana|Ciudad Ju[aá]rez|Culiac[aá]n|midterm|government shutdown|U\.?S\.? Congress|Capitol Hill|Federal Reserve|Section 338|Gulf of Mexico|Gulf Coast"),
]
REGION_TH = {"latam", "namerica", "oceania", "europe", "southasia"}
WIKI_CAT = {"Armed conflicts and attacks": None, "International relations": "D", "Politics and elections": "D", "Business and economy": "E",
            "Health and environment": "H", "Disasters and accidents": "X", "Law and crime": "C"}
RELEVANT_KW = re.compile(r"(\bwars?\b|warfare|strike|attack|missile|drone|troops|military|navy|carrier|sanction|blockade|ceasefire|offensive|rebel|militia|coup|pirat|hijack|"
                         r"tanker|Hormuz|Houthi|Taiwan|\bPLA\b|North Korea|nuclear|IAEA|NATO|Kremlin|Pentagon|CENTCOM|humanitarian|refugee|displaced|famine|Ebola|plague|outbreak|quarantine|WHO\b|pandemic|election|runoff|tariff|treaty|indict|cartel|mediation|shadow fleet|hurricane|tropical storm|LNG|pipeline|copper|iron ore|lithium|undersea cable|GPS|cyber|espionage|coast guard|border|protest)", re.I)


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
    # 지역형 전역(남미·북미·오세아니아·유럽·남아시아)은 지명만으로는 부족하고 안보·경제 키워드가 있어야 사건이 된다
    relevant = (bool(th) and th not in REGION_TH) or bool(RELEVANT_KW.search(text))
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
            "t": {"type": "string", "enum": ["S", "G", "M", "A", "D", "E", "H", "X", "C", "Y"]},
            "th": {"anyOf": [{"type": "string", "enum": ["iran", "ukraine", "yemen", "ethiopia", "sudan", "gaza", "afpak", "korea", "lebanon", "sahel", "drc", "somalia", "myanmar", "taiwan", "scs", "carib", "bio", "latam", "namerica", "oceania", "europe", "southasia"]}, {"type": "null"}],
                   "description": "전역 id. 어느 전역에도 속하지 않으면 null"},
            "p": {"type": "string", "description": "가장 구체적인 지명의 한국어 표기, 없으면 빈 문자열"},
            "lat": {"anyOf": [{"type": "number"}, {"type": "null"}]}, "lon": {"anyOf": [{"type": "number"}, {"type": "null"}]},
            "rel": {"type": "integer", "enum": [0, 1, 2, 3], "description": "지정학·안보 상황판 관련도: 0 무관, 1 배경, 2 관련, 3 핵심"},
        }}}},
}
SYSTEM = ("너는 국가 정보기관 상황실의 수집 분석관이다. 영어 뉴스 항목을 받아 한국어 한 줄 요약(x), 사건 유형(t: S 공습·드론·미사일, G 지상전·점령, "
          "M 해상, A 테러·민간인 공격, D 외교·정치, E 경제·제재, H 보건, X 재난·사고, C 범죄·치안, Y 사이버 공격·해킹), 관련 전역(th), 가장 구체적인 지명(p, 한국어)과 그 좌표(lat, lon), "
          "관련도(rel)를 매긴다. 좌표는 확신할 때만 적고 모르면 null. 요약은 추측 없이 기사에 있는 사실만, 60자 이내. "
          "rel 기준: 3 핵심(분쟁·군사·제재·해협·에너지/원자재 공급·정권 변동·대형 재난·감염병), 2 관련(외교·선거·무역정책·치안·경제 지표·인프라), "
          "1 배경(일반 정치·사회·경제 기사), 0 무관(문화·연예·스포츠·과학 일반·생활·소비자 서비스·수상·축제·인물 인터뷰). "
          "남미·북미·오세아니아·유럽·남아시아처럼 넓은 지역 전역은 지명만으로 2를 주지 말고 안보·경제 함의가 있을 때만 2 이상을 준다.")


def claude_enrich(items: list[dict], model: str | None = None, batch: int = 30) -> dict[str, dict]:
    """Returns {item_id: refinement}. Silently returns {} when no credentials are available."""
    from . import llm
    model = model or os.environ.get("PIPELINE_ENRICH_MODEL") or None
    if llm.mode() == "cli":
        from concurrent.futures import ThreadPoolExecutor
        chunks = [items[i:i + batch] for i in range(0, len(items), batch)]

        def one_cli(chunk: list[dict]) -> dict[str, dict]:
            lines = [{"id": it["id"], "source": it.get("extra", {}).get("domain", ""), "date": it["published"][:10], "title": it["title"], "summary": it.get("summary", "")[:400]} for it in chunk]
            res = llm.complete_json(SYSTEM, "항목:\n" + json.dumps(lines, ensure_ascii=False), SCHEMA, model=model)
            got = {}
            for r in (res or {}).get("items", []) if isinstance(res, dict) else []:
                if isinstance(r, dict) and r.get("id"):
                    got[r["id"]] = r
            return got

        out: dict[str, dict] = {}
        with ThreadPoolExecutor(max_workers=int(os.environ.get("PIPELINE_ENRICH_WORKERS") or 4)) as ex:
            for got in ex.map(one_cli, chunks):
                out.update(got)
        return out
    if llm.mode() != "api":
        return {}
    try:
        import anthropic
    except ImportError:
        log.warning("anthropic SDK not installed; skipping Claude enrichment")
        return {}
    model = model or os.environ.get("PIPELINE_ENRICH_MODEL") or os.environ.get("PIPELINE_MODEL") or "claude-opus-5-5"
    client = anthropic.Anthropic()
    out: dict[str, dict] = {}
    chunks = [items[i:i + batch] for i in range(0, len(items), batch)]
    stop = {"flag": False}

    def one(bi: int, chunk: list[dict]) -> dict[str, dict]:
        if stop["flag"]:
            return {}
        lines = [{"id": it["id"], "source": it.get("extra", {}).get("domain", ""), "date": it["published"][:10], "title": it["title"], "summary": it.get("summary", "")[:400]} for it in chunk]
        got: dict[str, dict] = {}
        try:
            resp = client.beta.messages.create(
                model=model, max_tokens=8000,
                betas=["server-side-fallback-2026-07-01"], fallbacks="default",
                output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
                system=[{"type": "text", "text": SYSTEM, "cache_control": {"type": "ephemeral"}}],
                messages=[{"role": "user", "content": "항목:\n" + json.dumps(lines, ensure_ascii=False)}],
            )
            if resp.stop_reason == "refusal":
                log.warning("batch %d refused: %s", bi, getattr(resp, "stop_details", None))
                return {}
            text = next(b.text for b in resp.content if b.type == "text")
            for r in json.loads(text).get("items", []):
                got[r["id"]] = r
        except anthropic.RateLimitError as e:
            log.warning("rate limited; stopping enrichment early: %s", e); stop["flag"] = True
        except anthropic.APIStatusError as e:
            log.warning("API error %s on batch %d: %s", e.status_code, bi, e.message)
            if e.status_code == 400:  # 스키마·모델 오류는 모든 배치가 똑같이 실패하므로 바로 멈춘다
                stop["flag"] = True
        except anthropic.APIConnectionError as e:
            log.warning("connection error: %s", e); stop["flag"] = True
        except (StopIteration, json.JSONDecodeError, KeyError) as e:
            log.warning("unparseable batch %d: %s", bi, e)
        return got

    # 배치를 4개씩 동시에 보낸다 (순차로는 30여 배치에 20분 넘게 걸린다)
    from concurrent.futures import ThreadPoolExecutor
    workers = int(os.environ.get("PIPELINE_ENRICH_WORKERS") or 4)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for got in ex.map(lambda t: one(*t), list(enumerate(chunks))):
            out.update(got)
    return out


def claude_candidates(items: list[dict], known_urls: set[str] | None = None, signal_only: bool = True) -> list[dict]:
    """Which news items are worth a Claude call: not already on the board (URL known from earlier runs) and with at least one
    rule signal (theater, security/economy keyword, or a gazetteer place). Pure noise and re-fetched stories are skipped,
    which cuts the per-run call volume by roughly 80-90% at steady state."""
    known = known_urls or set()
    out = []
    for it in items:
        if it.get("kind") not in ("news", "report"):
            continue
        if it.get("url") and it["url"] in known:
            continue
        if not signal_only:
            out.append(it); continue
        e = it.get("enr") or {}
        text = (it.get("title") or "") + " " + (it.get("summary") or "")[:400]
        if e.get("th") or e.get("at") or RELEVANT_KW.search(text):
            out.append(it)
    return out


CACHE_DAYS = 10


def cache_key(it: dict) -> str:
    return it.get("url") or ("t:" + (it.get("title") or "")[:160])


def load_cache(path: Path | None) -> dict:
    if not path or not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except ValueError:
        return {}


def save_cache(path: Path | None, cache: dict) -> None:
    if not path:
        return
    cut = (datetime.now(UTC) - timedelta(days=CACHE_DAYS)).strftime("%Y-%m-%dT%H:%M")
    path.write_text(json.dumps({k: v for k, v in cache.items() if v.get("at", "") >= cut}, ensure_ascii=False, separators=(",", ":")))


def enrich_all(items: list[dict], use_claude: bool = True, known_urls: set[str] | None = None, cache_path: Path | None = None) -> list[dict]:
    """Attach `enr` to each item. Rules first, Claude refinement second (when available)."""
    for it in items:
        it["enr"] = rule_enrich(it)
        it["grade"] = grade_url(it.get("url", ""), "C3" if it.get("sid", "").startswith("gn_") else "C4")
    from . import llm
    if use_claude and (llm.mode() is not None or os.environ.get("PIPELINE_FORCE_CLAUDE")):
        # 구독(cli)은 추가 비용이 없으니 새 기사 전부, API(유료)는 규칙 신호가 있는 새 기사만
        news = claude_candidates(items, known_urls, signal_only=(llm.mode() == "api"))
        # 이전 실행에서 이미 판정한 기사(RSS 에 며칠씩 남는다)는 저장된 판정을 그대로 쓰고 새 기사만 Claude 에 보낸다
        cache = load_cache(cache_path)
        fresh = [it for it in news if cache_key(it) not in cache]
        log.info("claude candidates: %d of %d news items (known urls %d) — cached %d, new %d", len(news), sum(1 for it in items if it.get("kind") in ("news", "report")),
                 len(known_urls or ()), len(news) - len(fresh), len(fresh))
        ref = claude_enrich(fresh) if fresh else {}
        stamp = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M")
        for it in fresh:
            if it["id"] in ref:
                cache[cache_key(it)] = {"r": ref[it["id"]], "at": stamp}
        for it in news:
            if it["id"] not in ref and cache_key(it) in cache:
                ref[it["id"]] = cache[cache_key(it)]["r"]
        save_cache(cache_path, cache)
        for it in news:
            r = ref.get(it["id"])
            if not r:
                continue
            e = it["enr"]
            th_ok = SCHEMA["properties"]["items"]["items"]["properties"]["th"]["anyOf"][0]["enum"]
            e["x"] = (r.get("x") or e["x"])[:140]
            e["t"] = r.get("t") if r.get("t") in ("S", "G", "M", "A", "D", "E", "H", "X", "C", "Y") else e["t"]
            e["th"] = r["th"] if r.get("th") in th_ok else e["th"]
            e["p"] = r.get("p") or e["p"]
            try:
                if r.get("lat") is not None and r.get("lon") is not None and -90 <= float(r["lat"]) <= 90 and -180 <= float(r["lon"]) <= 180:
                    e["at"] = [round(float(r["lon"]), 3), round(float(r["lat"]), 3)]
                rel = int(r.get("rel", e["rel"]))
            except (TypeError, ValueError):
                rel = e["rel"]
            if e["th"] in REGION_TH and rel < 3 and not RELEVANT_KW.search(it.get("title", "") + " " + it.get("summary", "")[:400]):
                rel = min(rel, 1)  # 지역형 전역: 문화·생활·스포츠처럼 안보·경제 키워드가 없는 항목은 사건으로 올리지 않는다
            e["rel"] = max(e["rel"], rel) if e["th"] not in REGION_TH else rel
            e["lang"] = "ko"
            e["claude"] = True
    return items
