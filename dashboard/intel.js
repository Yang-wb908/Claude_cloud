/* 수집 에이전트 산출(2026-10-08): 해협 물동량·운임·보험 / 전쟁 경제 / 강대국 경쟁. 모든 수치에 날짜·출처 URL 포함. */
const INTEL = {
 "sea": {
  "chokepoints": [
   {
    "id": "hormuz",
    "metrics": [
     {
      "l": "상업선 일일 통과(Kpler)",
      "v": "7척(10/6) → 10척(10/7)",
      "d": "2026-10-07",
      "trend": "down",
      "n": "7/23 이후 최저, 주초 20척 이상에서 급감",
      "src": "https://emirates247.com/world/strait-of-hormuz-transits-hit-2-month-low-after-tanker-attacks-shipping-data-shows/6483",
      "en": "Daily commodity vessel transits (Kpler)"
     },
     {
      "l": "원유 통과량(Kpler)",
      "v": "≥10.1 mb/d",
      "d": "2026-10-07",
      "trend": "down",
      "n": "전주 전시 고점 대비 -27%, 전쟁 전의 74%",
      "src": "https://emirates247.com/world/strait-of-hormuz-transits-hit-2-month-low-after-tanker-attacks-shipping-data-shows/6483",
      "en": "Crude flow through Hormuz (Kpler)"
     },
     {
      "l": "IMF PortWatch AIS 통과",
      "v": "4척/일 (기준 85)",
      "d": "2026-10-04",
      "trend": "down",
      "n": "AIS 송출 선박만 집계, 실제보다 과소",
      "src": "https://straits.live/briefs/2026-10-08",
      "en": "IMF PortWatch AIS transits"
     },
     {
      "l": "Windward AIS 통과(9/16-23 주)",
      "v": "55척 (전쟁 전 대비 -94%)",
      "d": "2026-09-23",
      "trend": "down",
      "n": "10/4 일간 입항 5·출항 8척",
      "src": "https://insights.windward.ai/",
      "en": "Windward weekly AIS transits"
     },
     {
      "l": "해협 인근 대기 선박",
      "v": "145척 (10/7 206척)",
      "d": "2026-10-08",
      "trend": "down",
      "n": "AIS 가시 선박 기준 02:50 UTC",
      "src": "https://straits.live/briefs/2026-10-08",
      "en": "Vessels holding near strait"
     },
     {
      "l": "상선 피격(9/28 이후)",
      "v": "8척 (타 집계 12건/주)",
      "d": "2026-10-05",
      "trend": "up",
      "n": "9/28~10/5 유조선·LNG선 공격 주간 최다",
      "src": "https://mezha.net/eng/news/89f059ab_tanker_attacks_near",
      "en": "Merchant vessels struck since Sep 28"
     },
     {
      "l": "LNG 통과량",
      "v": "전쟁 전 대비 -75% 이상",
      "d": "2026-10-05",
      "trend": "up",
      "n": "9월 출항 LNG 개전 후 최다지만 여전히 급감",
      "src": "https://www.bloomberg.com/news/articles/2026-10-05/lng-trade-through-hormuz-extends-rebound-despite-shipping-risks",
      "en": "LNG flows vs pre-war"
     },
     {
      "l": "이란 원유 선적(8월 초)",
      "v": "약 26만 b/d (전년 170만)",
      "d": "2026-08-28",
      "trend": "down",
      "n": "미 해군 봉쇄로 -80% 이상, 7/14 봉쇄 재개",
      "src": "https://www.cnbc.com/2026/08/28/navy-blockade-iran-oil-exports-sanctions-trump.html",
      "en": "Iran crude loadings (Kpler)"
     },
     {
      "l": "미군 봉쇄 집행",
      "v": "75척 회항·3척 무력화·2척 승선",
      "d": "2026-08-28",
      "trend": "flat",
      "n": "CENTCOM 발표 누계",
      "src": "https://www.cnbc.com/2026/08/28/navy-blockade-iran-oil-exports-sanctions-trump.html",
      "en": "US blockade enforcement actions"
     },
     {
      "l": "사우디 원유 수출(9월)",
      "v": "약 6.0 mb/d (8월 3.4)",
      "d": "2026-09-25",
      "trend": "up",
      "n": "오만 연안 미군 보호 항로 이용, 전쟁 전 7.5 mb/d",
      "src": "https://www.cnbc.com/2026/09/25/saudi-arabia-oil-iran-war-pipeline-strait-hormuz-red-sea-houthis.html",
      "en": "Saudi crude exports Sept"
     },
     {
      "l": "동서 파이프라인(Petroline)",
      "v": "공격 전 ~4 mb/d→9/10 가동중단, 9/22 재가동 보도",
      "d": "2026-09-22",
      "trend": "flat",
      "n": "설계용량 7 mb/d, 드론 공격으로 펌프장 피해",
      "src": "https://www.aljazeera.com/news/2026/9/12/saudi-arabia-shuts-critical-oil-pipeline-after-drone-attack-what-happened",
      "en": "Saudi East-West pipeline flow"
     },
     {
      "l": "UAE Habshan-Fujairah",
      "v": "용량 1.5~1.8 mb/d",
      "d": "2026-05-20",
      "trend": "flat",
      "n": "2호선 50% 완공, 2027 가동 목표",
      "src": "https://www.cnbc.com/2026/05/20/uae-pipeline-strait-hormuz-iran-war-oil.html",
      "en": "UAE Habshan-Fujairah capacity"
     },
     {
      "l": "이란 북측 항로 통행료",
      "v": "최대 200만 달러/척",
      "d": "2026-10-05",
      "trend": "up",
      "n": "IRGC 관할 북측 항로, 오만 남측 항로는 무료",
      "src": "https://www.nbcnews.com/world/iran/irans-tehran-toll-booth-forces-tankers-pay-millions-leave-strait-hormu-rcna265258",
      "en": "Iran transit toll per vessel"
     }
    ],
    "status": "이란은 7개 조건 충족 전까지 폐쇄 주장, 미 CENTCOM은 2,000만 배럴 통과 반박; 10월 첫 주 유조선 공격 주간 최다 속 통과 2개월 최저.",
    "dev": [
     {
      "d": "2026-10-07",
      "x": "Kpler 집계 10/6 7척으로 7/23 이후 최저, 원유 통과 10.1 mb/d로 -27%",
      "src": "https://emirates247.com/world/strait-of-hormuz-transits-hit-2-month-low-after-tanker-attacks-shipping-data-shows/6483"
     },
     {
      "d": "2026-10-05",
      "x": "IRGC, 미군 보호 남측 항로 이용 선박 '파괴' 경고 후 공격 재개",
      "src": "https://hotair.com/john-s-2/2026/10/05/iran-launches-more-attacks-against-tankers-n3819652"
     },
     {
      "d": "2026-10-04",
      "x": "건조 6주 된 라이베리아 선적 LR2 유조선 기관실 피격, 표류",
      "src": "https://maritime-executive.com/article/iran-keeps-up-pace-of-strikes-with-attack-on-brand-new-lr2-tanker"
     },
     {
      "d": "2026-10-02",
      "x": "파나마 선적 유조선 해협 출항 중 피격, 화재·정전(UKMTO)",
      "src": "https://www.manilatimes.net/2026/10/04/world/americas-emea/oil-tankers-attacked-in-strait-of-hormuz-says-uk-agency/2438390"
     },
     {
      "d": "2026-09-10",
      "x": "사우디 동서 파이프라인 드론 공격, 얀부 수출 중단",
      "src": "https://en.wikipedia.org/wiki/2026_East%E2%80%93West_Crude_Oil_Pipeline_attack"
     },
     {
      "d": "2026-09-02",
      "x": "이란, 호르무즈서 사우디 Bahri 유조선 공격 필리핀 선원 2명 사망",
      "src": "https://www.aljazeera.com/news/2026/9/2/saudi-arabia-condemns-deadly-iranian-attack-on-tanker-in-strait-of-hormuz"
     }
    ]
   },
   {
    "id": "bab",
    "metrics": [
     {
      "l": "바브엘만데브 주간 통과(LLI)",
      "v": "290척 (9/21-27, 전주 264)",
      "d": "2026-10-01",
      "trend": "up",
      "n": "4주 평균 280, 6월 평균 316·1월 257",
      "src": "https://www.lloydslistintelligence.com/resources/blog/red-sea-brief-1-october-2026",
      "en": "Bab el-Mandeb weekly transits (LLI)"
     },
     {
      "l": "바브엘만데브 8월 통과",
      "v": "1,166척 (92.7m dwt)",
      "d": "2026-08-31",
      "trend": "down",
      "n": "2023년 대비 -49%",
      "src": "https://www.lloydslistintelligence.com/resources/blog/red-sea-brief-3-september-2026",
      "en": "Bab el-Mandeb August transits"
     },
     {
      "l": "수에즈 8월 통과·수입",
      "v": "1,358척 / 5.671억 달러",
      "d": "2026-09-20",
      "trend": "up",
      "n": "전년比 선박 +27%·수입 +56.7%, SCA 라비 의장",
      "src": "https://allafrica.com/stories/202609220446.html",
      "en": "Suez August transits & revenue"
     },
     {
      "l": "수에즈 일평균 통과(1~8월)",
      "v": "40.8척/일 (2023년 73.7)",
      "d": "2026-08-31",
      "trend": "up",
      "n": "2023 대비 약 55% 수준",
      "src": "https://www.mid-trans.com/blog/suez-canal-traffic-revenue-rebound-august-2026/",
      "en": "Suez avg daily transits vs 2023"
     },
     {
      "l": "수에즈 9월 컨테이너선 통과",
      "v": "314척 (+64% y/y)",
      "d": "2026-09-30",
      "trend": "up",
      "n": "위기 후 최다, 아시아-유럽 항로 약 35%가 홍해 이용",
      "src": "https://lloydslist.com/LL1158637/Red-Sea-container-transits-hit-post-crisis-high-as-carriers-accelerate-return",
      "en": "Suez September container transits"
     },
     {
      "l": "수에즈 FY2025/26 수입",
      "v": "46.7억 달러 (+23%)",
      "d": "2026-06-30",
      "trend": "up",
      "n": "2023년 102.5억 달러의 약 46%",
      "src": "https://egyptianstreets.com/2026/06/30/suez-canal-revenue-rises-23-percent-in-the-2025-2026-fiscal-year-as-regional-tensions-ease/",
      "en": "Suez FY2025/26 revenue"
     },
     {
      "l": "수에즈 2026 연간 전망",
      "v": "58~60억 달러",
      "d": "2026-09-20",
      "trend": "up",
      "n": "SCA 라비 의장 전망",
      "src": "https://sis.gov.eg/en/media-center/news/suez-canal-authority-projects-30-revenue-growth-by-2027/",
      "en": "SCA 2026 revenue forecast"
     },
     {
      "l": "수에즈 원유 유조선 통과",
      "v": "주 67척 평균(7/20~9/13)",
      "d": "2026-10-01",
      "trend": "down",
      "n": "얀부 수출 중단 후 급감",
      "src": "https://www.lloydslistintelligence.com/resources/blog/red-sea-brief-1-october-2026",
      "en": "Suez crude tanker weekly transits"
     },
     {
      "l": "Aspides 호위 실적",
      "v": "670척 이상 보호 (29개월)",
      "d": "2026-07-31",
      "trend": "flat",
      "n": "호위함 부족으로 상선 대기열 발생(Kallas)",
      "src": "https://shippingtelegraph.com/hellenic-shipping-news/eu-reinforces-red-sea-naval-mission-with-strategic-djibouti-deal/",
      "en": "EU Aspides vessels protected"
     }
    ],
    "status": "후티의 사우디 선박 봉쇄(7/20~) 속에서도 바브엘만데브 통과는 주 290척으로 회복, 수에즈 컨테이너 통과는 위기 후 최다이나 2023년의 절반 수준.",
    "dev": [
     {
      "d": "2026-10-04",
      "x": "제품운반선 Chrystal Sky, 모카 남쪽 60nm서 폭발 보고(후티 추정)",
      "src": "https://www.seatrade-maritime.com/security/product-tanker-attacked-in-red-sea-as-hostilities-escalate"
     },
     {
      "d": "2026-09-28",
      "x": "EU Kallas '호위할 프리깃 부족, 상선 대기 중' — 유럽 해군 호르무즈 배치 조정",
      "src": "https://news.usni.org/2026/09/28/eu-needs-more-ships-for-red-sea-european-navies-adjust-hormuz-deployments"
     },
     {
      "d": "2026-08-24",
      "x": "후티, 얀부 앞 Bahri 유조선 Amzan 탄도미사일 공격 주장",
      "src": "https://www.aljazeera.com/news/2026/8/24/yemens-houthis-report-attack-on-saudi-ship"
     },
     {
      "d": "2026-08-12",
      "x": "후티 홍해 화물선 공격으로 6명 사망, 1년 만의 첫 치명적 공격",
      "src": "https://www.semafor.com/article/08/12/2026/houthis-attack-red-sea-cargo-ship-in-first-deadly-strike-in-a-year"
     },
     {
      "d": "2026-08-19",
      "x": "MSC 수에즈 시험 통항 개시, 머스크·CMA CGM·하파그와 동시 복귀",
      "src": "https://www.elestrechodigital.com/en/2026/08/19/msc-starts-test-transits-through-suez-in-the-midst-of-the-recovery-of-the-red-sea-corridor"
     },
     {
      "d": "2026-07-20",
      "x": "후티, 바브엘만데브서 사우디 항만·선박 봉쇄 선언",
      "src": "https://www.cnbc.com/2026/07/22/houthis-red-sea-bab-el-mandeb-saudi-oil-iran.html"
     }
    ]
   },
   {
    "id": "suez",
    "metrics": [
     {
      "l": "8월 통과 선박(LLI)",
      "v": "1,232척 (102.4m dwt)",
      "d": "2026-08-31",
      "trend": "up",
      "n": "위기 전 대비 -39%, 전년比 +28%",
      "src": "https://www.lloydslistintelligence.com/resources/blog/red-sea-brief-3-september-2026",
      "en": "Suez August transits (LLI)"
     },
     {
      "l": "7월 수입",
      "v": "5.05억 달러 (+42% y/y)",
      "d": "2026-07-31",
      "trend": "up",
      "n": "2023.12 이후 월간 최고, 1,340척",
      "src": "https://container-mag.com/update/20260909-suez-canal-revenue-climbs-42-in-july-amid-hormuz-rerouting",
      "en": "Suez July revenue"
     },
     {
      "l": "Q2 2026 수입",
      "v": "12.6억 달러 (+13% q/q)",
      "d": "2026-06-30",
      "trend": "up",
      "n": "호르무즈 폐쇄로 유조선 유입",
      "src": "https://www.riotimesonline.com/suez-canal-revenue-second-quarter-2026",
      "en": "Suez Q2 2026 revenue"
     }
    ],
    "status": "호르무즈 우회 유조선과 컨테이너 선사 복귀로 수입 회복 중이나 통과량은 2023년의 약 55~60%.",
    "dev": [
     {
      "d": "2026-09-20",
      "x": "SCA, 8월 수입 5.671억 달러·1,358척 발표, 항행 안전 선언",
      "src": "https://allafrica.com/stories/202609220446.html"
     }
    ]
   },
   {
    "id": "cape",
    "metrics": [
     {
      "l": "희망봉 일평균 통과(PortWatch)",
      "v": "92.1척/일 (3월~9/13)",
      "d": "2026-09-18",
      "trend": "up",
      "n": "2023년 49.1척/일의 약 2배",
      "src": "https://www.tcbs.com.vn/wp-content/uploads/2026/09/20260918_Shipping_Trade_Flows_Middle_East_2026.pdf",
      "en": "Cape daily transits (PortWatch)"
     },
     {
      "l": "7월 일평균 통과",
      "v": "92.8척/일 (7/1-19)",
      "d": "2026-07-19",
      "trend": "up",
      "n": "2025 평균 89.4, 2월 86.9, 6월 92.5",
      "src": "https://www.worldmonitor.app/research/strait-of-hormuz-transit-report-2026-07/",
      "en": "Cape July daily transits"
     },
     {
      "l": "추가 항해일(아시아-유럽)",
      "v": "+10~14일",
      "d": "2026-09-24",
      "trend": "flat",
      "n": "추가 거리 3,000~4,000nm, TEU당 +200~400달러",
      "src": "https://suaidglobal.com/insights/red-sea-shipping-crisis-2026/",
      "en": "Added days Asia-Europe via Cape"
     },
     {
      "l": "VLCC 걸프→싱가포르 우회",
      "v": "편도 약 +14일",
      "d": "2026-09-01",
      "trend": "flat",
      "n": "호르무즈 직항 대비",
      "src": "https://straits.live/cape-of-good-hope-reroute",
      "en": "VLCC Gulf-Singapore detour days"
     }
    ],
    "status": "홍해 복귀에도 호르무즈 우회 수요로 희망봉 통과는 하루 92척대, 2023년 대비 2배 수준 유지.",
    "dev": [
     {
      "d": "2026-09-18",
      "x": "TCBS 보고서: 희망봉 3월 이후 일 92.1척, 전쟁 전의 거의 2배",
      "src": "https://www.tcbs.com.vn/wp-content/uploads/2026/09/20260918_Shipping_Trade_Flows_Middle_East_2026.pdf"
     }
    ]
   },
   {
    "id": "malacca",
    "metrics": [
     {
      "l": "아시아 해적·강도 사건(상반기)",
      "v": "35건 (-64% y/y)",
      "d": "2026-06-30",
      "trend": "down",
      "n": "2019 상반기 이후 최저, ReCAAP",
      "src": "https://maritime-executive.com/article/strong-decrease-in-incidents-of-piracy-and-armed-robbery-of-ships-in-asia",
      "en": "ReCAAP Asia incidents H1 2026"
     },
     {
      "l": "말라카·싱가포르 해협 사건(상반기)",
      "v": "21건 (전부 싱가포르 해협)",
      "d": "2026-06-30",
      "trend": "down",
      "n": "20건이 동향 항로(필립 수로), 2025년 108건",
      "src": "https://maritime-executive.com/article/strong-decrease-in-incidents-of-piracy-and-armed-robbery-of-ships-in-asia",
      "en": "SOMS incidents H1 2026"
     },
     {
      "l": "싱가포르 선박 입항(5월)",
      "v": "11,729척 (+3.4% y/y)",
      "d": "2026-05-31",
      "trend": "up",
      "n": "컨테이너 394만 TEU +3%",
      "src": "https://www.indexbox.io/blog/port-of-singapore-handles-394-million-teus-in-may-2026-up-3-year-on-year/",
      "en": "Singapore vessel arrivals May"
     },
     {
      "l": "싱가포르 벙커 판매(8월)",
      "v": "477만 톤 (-4% y/y)",
      "d": "2026-08-31",
      "trend": "down",
      "n": "전년 497만 톤",
      "src": "https://www.manifoldtimes.com/news/singapore-bunker-fuel-sales-down-by-4-on-year-in-august-2026",
      "en": "Singapore bunker sales Aug"
     }
    ],
    "status": "말라카·싱가포르 해협 해적 사건은 상반기 급감(21건), 교통 정상이나 벙커 판매는 전년比 감소.",
    "dev": [
     {
      "d": "2026-06-01",
      "x": "ReCAAP, 5/26~6/1 아시아 해적 사건 0건 보고",
      "src": "https://x.com/recaapisc/status/2061729896490311910"
     }
    ]
   },
   {
    "id": "taiwan",
    "metrics": [
     {
      "l": "대만 해협 상선 운항 차질",
      "v": "확인된 차질 없음",
      "d": "2026-10-08",
      "trend": "flat",
      "n": "중국 해경, 대만 동쪽서 상선에 무선 '법집행' 정보 요구(8월)",
      "src": "https://www.riskintelligence.eu/analyst-briefings/could-china-control-shipping-around-taiwan-without-a-blockade",
      "en": "Commercial shipping disruption"
     },
     {
      "l": "스카버러 암초 사건(최근)",
      "v": "7/23-24 중국 해경 물대포",
      "d": "2026-07-24",
      "trend": "flat",
      "n": "10월 상선 피해 보도 없음",
      "src": "https://www.cnn.com/2026/07/24/asia/china-philippines-south-china-sea-scarborough-intl-hnk",
      "en": "Scarborough Shoal latest incident"
     }
    ],
    "status": "10/1 대만 해순서가 프라타스 인근 중국 어선에 물대포 사용, 베이징은 절제된 반응; 상업 해운 차질 보고 없음.",
    "dev": [
     {
      "d": "2026-10-02",
      "x": "대만 해순서, 프라타스 제한수역 침입 중국 어선에 90초 물대포",
      "src": "https://maritime-executive.com/article/video-taiwan-coast-guard-uses-water-cannon-on-chinese-fishing-boat"
     },
     {
      "d": "2026-10-03",
      "x": "대만, 필리핀과 EEZ 중첩 해역서 중국 선박 3척 감시 위해 순찰정 3척 배치",
      "src": "https://focustaiwan.tw/politics/202610030015"
     },
     {
      "d": "2026-08-03",
      "x": "중국 해경, 대만 동쪽 싱가포르 선적 컨테이너선·유조선에 무선 정보 요구",
      "src": "https://www.cw.com.tw/graphics/china-coast-guard-around-taiwan-2026-en/index.html"
     }
    ]
   },
   {
    "id": "blacksea",
    "metrics": [
     {
      "l": "우크라 농산물 수출(9월)",
      "v": "약 300만 톤 (+41% m/m)",
      "d": "2026-09-30",
      "trend": "up",
      "n": "가치 16억 달러, 역량의 40% 수준",
      "src": "https://biz.liga.net/en/agriculture/opinion/an-agricultural-breakthrough-despite-setbacks-how-ukrainian-exports-returned-to-growth-in-september",
      "en": "Ukraine agri exports Sept"
     },
     {
      "l": "우크라 곡물 수출(9월)",
      "v": "148.8만 톤 (-36.7% y/y)",
      "d": "2026-09-30",
      "trend": "down",
      "n": "밀 109.4만 톤",
      "src": "https://ukragroconsult.com/en/news/ukraine-exported-almost-1-5-mln-tons-of-grain-in-september/",
      "en": "Ukraine grain exports Sept"
     },
     {
      "l": "오데사 심해항 가동",
      "v": "7/22 이후 사실상 중단",
      "d": "2026-09-07",
      "trend": "down",
      "n": "정상 월 700만 톤 → 50만 톤 수준",
      "src": "https://www.agbull.com/odesa-pounded-straits-squeezed-black-sea-grain-trade-nears-a-standstill/",
      "en": "Odesa deepwater ports status"
     },
     {
      "l": "대체 경로 수용력",
      "v": "월 140~250만 톤",
      "d": "2026-09-01",
      "trend": "up",
      "n": "다뉴브·철도·도로, 연말 300만 톤 목표",
      "src": "https://www.agbull.com/ukraine-grain-trade-told-to-plan-for-odesa-ports-to-stay-shut-into-winter/",
      "en": "Alternative route capacity"
     },
     {
      "l": "러시아 해상 원유 수출(9월)",
      "v": "4.088 mb/d (+8% m/m)",
      "d": "2026-09-30",
      "trend": "up",
      "n": "S&P Global; 대인도 -59%, 대중국 +22%, 목적지 미상 70.9만 b/d",
      "src": "https://www.hellenicshippingnews.com/russia-september-crude-exports-rise-8-on-month-despite-fresh-sanctions/",
      "en": "Russia seaborne crude exports Sept"
     },
     {
      "l": "러시아 원유 수출(블룸버그 4주)",
      "v": "3.71 mb/d (9/27까지)",
      "d": "2026-09-27",
      "trend": "up",
      "n": "마지막 주 3.99 mb/d, 주간 가치 27.5억 달러",
      "src": "https://www.themoscowtimes.com/2026/09/29/russias-crude-exports-rise-as-diesel-ban-limits-gains-from-higher-oil-prices-a93821",
      "en": "Russia crude exports 4-wk avg (Bloomberg)"
     },
     {
      "l": "러시아기 선박 비중",
      "v": "프리모르스크·노보로시스크 원유의 1/3 이상",
      "d": "2026-09-30",
      "trend": "up",
      "n": "그림자 함대 러시아기 전환",
      "src": "https://www.energyintel.com/000001a0-80e4-d73f-a7a1-ccec25360000",
      "en": "Russian-flagged share of crude exports"
     },
     {
      "l": "우크라 항만 전쟁보험료",
      "v": "선가의 1~1.25%",
      "d": "2026-09-24",
      "trend": "up",
      "n": "12월 0.6~0.8%에서 상승, 러시아 항만 0.6~0.8%",
      "src": "https://beinsure.com/black-sea-war-risk-expansion-raises-shipping-insurance-costs/",
      "en": "Black Sea war-risk premium"
     }
    ],
    "status": "10/5-6 루마니아·불가리아 EEZ서 상선 2척 침몰·1척 화재, NATO 회부; 오데사 심해항 7월 말 이후 사실상 폐쇄로 우크라 수출 역량의 40%.",
    "dev": [
     {
      "d": "2026-10-06",
      "x": "불가리아 EEZ 70nm 해상서 드론 공격, Alfa Watan(토고) 침몰·Able(팔라우) 화재, 18명 구조·2명 중상",
      "src": "https://www.aljazeera.com/news/2026/10/6/bulgaria-says-two-commercial-vessels-were-hit-in-drone-attack-in-its-waters"
     },
     {
      "d": "2026-10-07",
      "x": "불가리아, 흑해 상선 공격을 NATO 본부에 회부; 폰데어라이엔 '용납 불가'",
      "src": "https://www.stripes.com/theaters/europe/2026-10-07/bulgaria-black-sea-drone-attack-23081560.html"
     },
     {
      "d": "2026-10-06",
      "x": "소치 인근서 노보로시스크→인도 원유 적재 Aframax Rio 화재, 우크라 해상드론 추정",
      "src": "https://theins.press/en/news/297986"
     },
     {
      "d": "2026-10-05",
      "x": "루마니아 EEZ서 이즈마일발 옥수수 운반 터키 소유 Royad Mammadov 침몰, 2명 사망·11명 구조, 젤렌스키 러시아 드론 지목",
      "src": "https://www.aljazeera.com/news/2026/10/5/ukraine-says-russian-drone-attack-sinks-ship-in-romanian-waters"
     },
     {
      "d": "2026-09-11",
      "x": "우크라 농업부: 러시아 흑해 봉쇄로 수출 역량의 40%만 가동",
      "src": "https://kyivindependent.com/ukraine-increases-food-exports-in-september-but-is-still-only-at-40-of-its-capacity/"
     }
    ]
   },
   {
    "id": "panama",
    "metrics": [
     {
      "l": "일일 통과 한도",
      "v": "32 → 33척 (10/15부터)",
      "d": "2026-09-28",
      "trend": "up",
      "n": "네오파나막스 10·파나막스 23척",
      "src": "https://newsroompanama.com/2026/09/28/panama-canal-increases-daily-transits-to-33-and-maximum-draft-to-49-feet/",
      "en": "Daily transit slots"
     },
     {
      "l": "네오파나막스 최대 흘수",
      "v": "14.94m (49.0ft)",
      "d": "2026-09-28",
      "trend": "up",
      "n": "1ft 상향, 유역 물 부족 지속",
      "src": "https://www.indexbox.io/blog/panama-canal-to-increase-daily-transits-to-33-from-october-15-2026/",
      "en": "Neopanamax max draft"
     },
     {
      "l": "FY2026 9개월 통과",
      "v": "10,726척 (+5.2%)",
      "d": "2026-06-30",
      "trend": "up",
      "n": "일평균 35척, 매출 48.02억 달러 +17%",
      "src": "https://www.indexbox.io/blog/panama-canal-reports-strong-q3-fy2026-results-prepares-for-potential-severe-el-nio/",
      "en": "FY2026 9-month transits"
     },
     {
      "l": "FY2027 예산 가정",
      "v": "대형선 10,750척 / 매출 55.55억 달러",
      "d": "2026-10-01",
      "trend": "flat",
      "n": "10/1 시작 회계연도",
      "src": "https://www.riotimesonline.com/panama-canal-economy-2026/",
      "en": "FY2027 budget assumptions"
     }
    ],
    "status": "엘니뇨 국가비상(8/25)으로 9월 36→32척 감축했다가 강우 개선으로 10/15부터 33척·흘수 49ft로 소폭 완화.",
    "dev": [
     {
      "d": "2026-09-28",
      "x": "ACP, 흘수 49ft 즉시 상향·10/15부터 일 33척으로 증편 발표",
      "src": "https://dataportuaria.com/en/panama/ports/panama-canal-increases-daily-transits-to-33-and-draft-to-49-feet-702afc"
     },
     {
      "d": "2026-09-15",
      "x": "일일 통과 34→32척 감축(9/4 36→34 이후 2차)",
      "src": "https://www.riotimesonline.com/panama-canal-economy-2026/"
     }
    ]
   },
   {
    "id": "aden",
    "metrics": [
     {
      "l": "아프리카 뿔 해적 사건(2026)",
      "v": "25건 (9월 중순까지)",
      "d": "2026-09-15",
      "trend": "up",
      "n": "2013년 이후 최다, Atalanta",
      "src": "https://adf-magazine.com/2026/09/pirate-attacks-rise-in-gulf-of-aden/",
      "en": "Horn of Africa piracy incidents 2026"
     },
     {
      "l": "상선 피랍(4월 말 이후)",
      "v": "6척, 4척 억류 중·선원 60명+",
      "d": "2026-09-15",
      "trend": "up",
      "n": "2012~2025 14년간 3척 대비 급증, RUSI",
      "src": "https://www.rusi.org/explore-our-research/publications/commentary/somali-piracy-2026-not-just-resurgence-past-problem",
      "en": "Commercial vessels hijacked since late April"
     },
     {
      "l": "IMB 홍해·아덴만 사건(4~7월)",
      "v": "24건",
      "d": "2026-07-31",
      "trend": "up",
      "n": "세계 상반기 총계는 1992년 이후 최저와 대조",
      "src": "https://adf-magazine.com/2026/09/pirate-attacks-rise-in-gulf-of-aden/",
      "en": "IMB Red Sea/GoA incidents Apr-Jul"
     },
     {
      "l": "UKMTO 위협 평가",
      "v": "'심각(severe)'",
      "d": "2026-04-30",
      "trend": "up",
      "n": "4월 말 substantial→severe",
      "src": "https://www.castorvali.com/news/renewed-piracy-threat-somali-basin-gulf-of-aden-2026/",
      "en": "UKMTO threat level"
     },
     {
      "l": "Eureka 몸값 요구",
      "v": "1,000만 달러",
      "d": "2026-10-01",
      "trend": "flat",
      "n": "5/2 피랍, 10/1 푼틀란드군 접근에 해적 이탈·선원 안전",
      "src": "https://safety4sea.com/somali-pirates-abandon-hijacked-tanker-eureka/",
      "en": "Eureka ransom demand"
     }
    ],
    "status": "소말리아 해적 2013년 이후 최고 수위(25건), 후티 지원설 제기; 터키 해군 소말리아 해역 임무 2027.2까지 연장, Atalanta·Aspides 함정 부족.",
    "dev": [
     {
      "d": "2026-10-06",
      "x": "Soufan Center: 호르무즈·홍해 우회 선박 증가가 소말리아 해적 부활의 2차 효과",
      "src": "https://thesoufancenter.org/intelbrief-2026-october-6/"
     },
     {
      "d": "2026-10-01",
      "x": "5개월 억류 유조선 Eureka, 푼틀란드군 접근에 해적 좌초 후 이탈",
      "src": "https://safety4sea.com/somali-pirates-abandon-hijacked-tanker-eureka/"
     },
     {
      "d": "2026-09-30",
      "x": "소말리아 해적, 피랍 유조선 선원 5명 살해; Sibu 1 구출 후 체포 해적 41명 중 28명 탈주",
      "src": "https://www.aljazeera.com/amp/news/2026/9/30/somali-pirates-killed-five-crew-members-on-hijacked-tanker-officials-say"
     },
     {
      "d": "2026-09-15",
      "x": "아덴만서 상선 Glamor 해적 승선, 선원 시타델 대피·Atalanta·일본 초계기·인도 해군 대응",
      "src": "https://adf-magazine.com/2026/09/pirate-attacks-rise-in-gulf-of-aden/"
     },
     {
      "d": "2026-07-17",
      "x": "예멘 하드라마우트 26nm 해상서 유조선 Asana 피랍",
      "src": "https://www.aljazeera.com/news/2026/7/17/suspected-somali-pirates-seize-tanker-near-yemen-amid-wave-of-hijackings"
     }
    ]
   }
  ],
  "freight": [
   {
    "l": "Drewry WCI 종합",
    "v": "$4,434/FEU",
    "d": "2026-10-01",
    "chg": "-1% w/w, 상하이-NY $10,428(+1%), 상하이-LA $7,835, 상하이-로테르담 $3,399(-2%); 10/8 발표치 미확인",
    "src": "https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry"
   },
   {
    "l": "SCFI 종합",
    "v": "3,686.62",
    "d": "2026-09-24",
    "chg": "8/28 3,509.53 대비 약 +5%; 10/2 발표치 미확인",
    "src": "https://cbonds.com/indexes/84037/"
   },
   {
    "l": "Baltic Dry Index",
    "v": "3,002",
    "d": "2026-10-06",
    "chg": "-68pt(-2.2%), 8/25 이후 최저; Capesize 4,638(-4%), Panamax 2,366",
    "src": "https://www.bairdmaritime.com/amp/story/shipping/dry-cargo/bulkers/baltic-dry-bulk-index-hits-six-week-low-on-capesize-decline"
   },
   {
    "l": "BDI 주간",
    "v": "3,148 (10/2)",
    "d": "2026-10-02",
    "chg": "주간 -8.1%, 9/25 3,426",
    "src": "https://www.thedcn.com.au/news/baltic-exchange-weekly-report-2-october-2026"
   },
   {
    "l": "VLCC TD3C (MEG-중국)",
    "v": "WS1,157.5 / $1,235,414/day",
    "d": "2026-09-25",
    "chg": "사상 최고권, 9월 평균 WS964.71(+84% m/m) 일수익 $1,021,029",
    "src": "https://etint.substack.com/p/eti-vtmo-october-2026"
   },
   {
    "l": "VLCC 1년/3년 정기용선",
    "v": "$213,000 / $99,000/day",
    "d": "2026-09-30",
    "chg": "스팟 $1.02M/day 대비 큰 괴리",
    "src": "https://etint.substack.com/p/eti-vtmo-october-2026"
   },
   {
    "l": "LNG선 스팟(대서양 Spark30S)",
    "v": "$20,000/day",
    "d": "2026-09-11",
    "chg": "+$4,500 w/w, 10월 카고 문의로 반등(9/25); 호르무즈 위기 초 $161,750",
    "src": "https://lngprime.com/americas/atlantic-spot-lng-rates-rise-to-20000-per-day/196640/"
   }
  ],
  "insurance": [
   {
    "l": "호르무즈 전쟁보험 추가보험료",
    "v": "선가의 3~10%/항차",
    "d": "2026-09-14",
    "src": "https://www.fairwayeta.com/insights/war-risk-insurance-2026-hidden-cost-shipping"
   },
   {
    "l": "호르무즈 전쟁보험(Marsh)",
    "v": "선가의 7.5~10%",
    "d": "2026-07-22",
    "src": "https://www.spglobal.com/energy/en/news-research/latest-news/shipping/072226-middle-east-shipping-insurance-costs-rise-on-hormuz-risks-marsh"
   },
   {
    "l": "호르무즈 전쟁 전 기준",
    "v": "선가의 0.25%",
    "d": "2026-02-28",
    "src": "https://www.thenationalnews.com/business/2026/07/17/war-risk-shipping-premium-surges-again-as-tensions-escalate-at-strait-of-hormuz/"
   },
   {
    "l": "바브엘만데브 전쟁보험(Marsh)",
    "v": "선가의 0.5% (7/20 전 0.3%)",
    "d": "2026-07-22",
    "src": "https://www.spglobal.com/energy/en/news-research/latest-news/shipping/072226-middle-east-shipping-insurance-costs-rise-on-hormuz-risks-marsh"
   },
   {
    "l": "남부 홍해 전쟁보험",
    "v": "1% 초과",
    "d": "2026-07-23",
    "src": "https://redseafutures.substack.com/p/the-red-sea-feels-the-heat"
   },
   {
    "l": "사우디 연계 유조선(얀부 기항)",
    "v": "선가의 약 3% (7월 초 <1%)",
    "d": "2026-09-25",
    "src": "https://www.insurancejournal.com/news/international/2026/09/25/886769.htm"
   },
   {
    "l": "흑해 우크라 항만 전쟁보험",
    "v": "선가의 1~1.25%",
    "d": "2026-09-24",
    "src": "https://beinsure.com/black-sea-war-risk-expansion-raises-shipping-insurance-costs/"
   },
   {
    "l": "흑해 러시아 항만 전쟁보험",
    "v": "선가의 0.6~0.8%",
    "d": "2026-09-24",
    "src": "https://www.nautilusshipping.com/news-and-insights/war-risk-insurance-in-2026-what-ship-owners-need-to-know"
   }
  ],
  "gaps": [
   "Drewry WCI 10/8 발표치와 SCFI 10/2 발표치 미확인(검색 결과 없음)",
   "호르무즈 전쟁보험료의 10월 시세 미확인(최신 9/14, Marsh 7/22)",
   "이란 원유 수출의 9~10월 수치 미확인(최신 Kpler 8월 26만 b/d)",
   "UAE Habshan-Fujairah 9~10월 실제 송유량 미확인",
   "Lloyd's List Intelligence 10/8 Red Sea Brief(9/28~10/4 주간 통과) 미확인",
   "수에즈 운하 9월 공식 통과·수입 통계 미발표",
   "2026년 후티 선박 공격 전체 건수의 공식 집계(UKMTO/JMIC) 미확인",
   "노보로시스크 10월 원유 수출량 및 그림자 함대 척수 최신치 미확인",
   "덴마크 해군의 2026 아덴만 해적 대응 배치 근거 없음(2024 Iver Huitfeldt가 최신)",
   "대만 해협 10월 상업 해운 차질 보도 없음; 스카버러 10월 사건 보도 없음",
   "IMF PortWatch 공식 대시보드 직접 접근 불가, 2차 인용(10/4 호르무즈 4척, 희망봉 92.1척/일)에 의존",
   "말라카 해협 자체 교통량 통계 및 ReCAAP 하반기(7~9월) 데이터 미확인",
   "LNG선 태평양(Spark25S) 2026년 10월 시세 미확인",
   "파나마 운하 FY2026 연간 확정 실적 미발표",
   "희망봉 추가 비용(TEU당 200~400달러)은 물류 블로그 출처로 신뢰도 낮음"
  ]
 },
 "economy": {
  "groups": [
   {
    "id": "energy",
    "title": "에너지·원유·가스",
    "metrics": [
     {
      "l": "브렌트유",
      "v": "$101.6/bbl (10/7 장중, 10/6 종가 $100.32)",
      "d": "2026-10-07",
      "chg": "+1% 전일比, 9월 초 이후 대부분 $100 상회",
      "trend": "up",
      "n": "후티 사우디 공격 보도로 재반등, 10/8 새벽 $101.5~102.5",
      "src": "https://oilprice.com/Latest-Energy-News/World-News/Brent-Back-Above-100-as-Houthis-Hit-Saudi-Infrastructure.html"
     },
     {
      "l": "WTI",
      "v": "$90.09/bbl",
      "d": "2026-10-07",
      "chg": "+0.13%",
      "trend": "flat",
      "n": "멕시코만 허리케인 대비 생산 셧인으로 지지",
      "src": "https://www.investing.com/commodities/crude-oil-historical-data"
     },
     {
      "l": "유럽 TTF 가스",
      "v": "€75.80/MWh",
      "d": "2026-10-05",
      "chg": "+3% 당일",
      "trend": "up",
      "n": "카타르 불가항력 연장으로 공급 우려 지속",
      "src": "https://tradingeconomics.com/commodity/eu-natural-gas"
     },
     {
      "l": "아시아 JKM LNG",
      "v": "$25.88/MMBtu",
      "d": "2026-10-07",
      "chg": "전년比 +132%",
      "trend": "up",
      "n": "TTF 대비 약 $1.3 프리미엄",
      "src": "https://tradingeconomics.com/commodity/liquefied-natural-gas-japan-korea"
     },
     {
      "l": "IEA 비축유 방출(3월 집단행동 4억배럴)",
      "v": "3.25억 배럴 방출 완료(약 81%)",
      "d": "2026-10-03",
      "chg": "",
      "trend": "down",
      "n": "G7 10/2 발표 1억 배럴은 기존 약정 가속 성격(EU 입장), 디젤 우선",
      "src": "https://energynews.pro/en/iea-tallies-325-million-barrels-of-reserves-released-since-march"
     },
     {
      "l": "미국 SPR 재고",
      "v": "2.83억 배럴(용량의 39.6%)",
      "d": "2026-10-02",
      "chg": "-0.8M 주간, 2/27比 -1.325억",
      "trend": "down",
      "n": "1982년 10월 이후 최저, 1.72억 배럴 긴급교환 방출 진행 중",
      "src": "https://www.oilpriceapi.com/data/inventory/spr"
     },
     {
      "l": "사우디 원유 생산(8월, OPEC 보고)",
      "v": "623.8만 b/d",
      "d": "2026-09-10",
      "chg": "-190만 b/d 전월比",
      "trend": "down",
      "n": "1990년 걸프전 이후 최저, IEA 추정은 597만 b/d",
      "src": "https://www.bloomberg.com/news/articles/2026-09-10/saudis-tell-opec-that-output-slumped-again-to-lowest-since-1990"
     },
     {
      "l": "OPEC+ 11월 생산목표",
      "v": "동결(사우디 1,050만, 러 990만, 이라크 440만 b/d)",
      "d": "2026-10-04",
      "chg": "변동 없음",
      "trend": "flat",
      "n": "핵심 7개국 8월 실제생산 2,500만 b/d, 전쟁前比 -500만; 다음 회의 11/1",
      "src": "https://www.cnbc.com/2026/10/04/opec-agrees-to-keep-november-oil-output-targets-steady.html"
     },
     {
      "l": "걸프 생산 셧인(EIA 추정)",
      "v": "480만 b/d(9월)",
      "d": "2026-09-30",
      "chg": "8월 580만, 5월 피크 1,090만",
      "trend": "down",
      "n": "셧인 축소 추세",
      "src": "https://www.eia.gov/outlooks/steo/report/global_oil.php"
     },
     {
      "l": "중동 원유수출(Kpler, 9월 평균)",
      "v": "1,650만 b/d",
      "d": "2026-09-30",
      "chg": "전쟁前 1,800만比 -8%",
      "trend": "up",
      "n": "9월 말 일부 일자 전쟁前 수준 초과, 걸프 원유 40% 우회 파이프라인 경유",
      "src": "https://www.cnbc.com/2026/09/30/iran-war-strait-hormuz-gulf-oil-fuel.html"
     },
     {
      "l": "이란 원유 선적",
      "v": "8월 중순 이후 신규 선적 0, 생산 약 180만 b/d",
      "d": "2026-10-01",
      "chg": "전쟁前 대비 약 절반",
      "trend": "down",
      "n": "7월 중순 이후 美봉쇄선 통과 화물 없음, 중국 수입 YTD 120만 b/d(-14%)",
      "src": "https://www.iranintl.com/en/202610014929"
     },
     {
      "l": "카타르 LNG",
      "v": "불가항력 연장: 아시아 11월, 유럽 12월까지",
      "d": "2026-09-29",
      "chg": "호르무즈 LNG 통과 2월比 -80%",
      "trend": "down",
      "n": "트레인4·6(12.8mtpa) 수년간 복구 불가, 9월 일부 선적 재개",
      "src": "https://www.euronews.com/2026/09/29/middle-east-oil-exports-rise-as-lng-traffic-through-hormuz-picks-up"
     },
     {
      "l": "호르무즈 전쟁위험보험료",
      "v": "선체가액의 3~8%",
      "d": "2026-10-07",
      "chg": "전쟁前 0.25%의 12~30배",
      "trend": "up",
      "n": "7월 피크 7.5~10%에서 다소 완화",
      "src": "https://www.spglobal.com/energy/en/news-research/latest-news/shipping/072226-middle-east-shipping-insurance-costs-rise-on-hormuz-risks-marsh"
     },
     {
      "l": "미국 휘발유/경유 소매가",
      "v": "$4.37 / $6.32 per gal",
      "d": "2026-10-06",
      "chg": "전년比 +39.4% / +71.7%",
      "trend": "up",
      "n": "9월 월평균 $4.33 역대 9월 최고, 캘리포니아 경유 $8.36",
      "src": "https://www.lendingtree.com/credit-cards/study/us-gas-prices/"
     }
    ],
    "dev": [
     {
      "d": "2026-10-02",
      "x": "G7, IEA 조율 1억 배럴 비축유 방출 발표(4개월간, 초기 20일 디젤 비중↑); EU는 3월 약정 이행분으로 해석",
      "src": "https://in.investing.com/news/stock-market-news/iea-announces-100-million-barrel-oil-reserve-release-93CH-5617129"
     },
     {
      "d": "2026-10-07",
      "x": "IEA 회원국, 3월 합의분 중 약 1억 배럴 조기방출 지지·디젤 우선 합의; 10/14~15 이사회서 세부 결정 예정",
      "src": "https://www.thenationalnews.com/business/energy/2026/10/07/iea-members-support-faster-release-of-reserve-oil-stocks/"
     },
     {
      "d": "2026-10-07",
      "x": "후티, 사우디 자잔(40만 b/d 정유소 소재) 등 공항 공격; 사우디 에너지장관 \"동서 파이프라인 580만 b/d 회복\"",
      "src": "https://www.ibtimes.com.au/oil-prices-rise-houthi-attacks-saudi-supply-concerns-1876348"
     },
     {
      "d": "2026-10-04",
      "x": "OPEC+ 7개국, 11월 생산목표 동결; 설비능력 심사 전까지 2027년 이전 증산 가능성 낮음",
      "src": "https://www.enerdata.net/publications/daily-energy-news/opec-keeps-november-2026-production-targets-unchanged-amid-supply-disruptions.html"
     },
     {
      "d": "2026-10-08",
      "x": "美해군 모니터, 9/28~10/2 호르무즈 유조선 공격 12건 집계; 브렌트 $102.5로 2% 반등",
      "src": "https://oilprice.com/Latest-Energy-News/World-News/Oil-Jumps-2-as-Iran-Steps-Up-Attacks-on-Hormuz-Tankers.html"
     }
    ]
   },
   {
    "id": "macro",
    "title": "거시·물가·금리",
    "metrics": [
     {
      "l": "미국 CPI(8월)",
      "v": "3.4% y/y, 근원 2.4%",
      "d": "2026-09-11",
      "chg": "9월치 10/14 발표, 컨센서스 3.7%",
      "trend": "up",
      "n": "에너지 주도 재가속",
      "src": "https://fedratecalc.com/cpi-release-date/"
     },
     {
      "l": "연준 기준금리",
      "v": "3.75~4.00%",
      "d": "2026-09-16",
      "chg": "+25bp(12-0 만장일치)",
      "trend": "up",
      "n": "10/7 의사록: 대다수 연내 추가 인상 적절 판단, 다음 FOMC 10/28",
      "src": "https://www.cnbc.com/2026/09/16/fed-rate-decision-september-2026.html"
     },
     {
      "l": "미 국채 10년물",
      "v": "5.32%(장중 고점 5.35%)",
      "d": "2026-10-07",
      "chg": "7월 말比 +60bp",
      "trend": "up",
      "n": "2002년 이후 최고, 30년물 5.70%",
      "src": "https://www.cnbc.com/2026/10/07/treasury-yields-auction-fomc-minutes.html"
     },
     {
      "l": "유로존 HICP 속보(9월)",
      "v": "3.8% y/y(에너지 18.8%, 근원 2.5%)",
      "d": "2026-10-02",
      "chg": "8월 3.2%→3.8%, 3년 최고",
      "trend": "up",
      "n": "시장 예상 3.6% 상회",
      "src": "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-02102026-ap"
     },
     {
      "l": "ECB 예금금리",
      "v": "2.50%(MRO 2.65%)",
      "d": "2026-09-10",
      "chg": "+25bp",
      "trend": "up",
      "n": "스태프 전망 2026 물가 3.0%, 다음 회의 10/28~29",
      "src": "https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html"
     },
     {
      "l": "한국 CPI(9월)",
      "v": "2.9% y/y, 근원 2.8%",
      "d": "2026-10-02",
      "chg": "8월 3.1%→2.9%",
      "trend": "down",
      "n": "석유류 +14.8%, 유류가격상한 효과 -0.6%p(미적용시 3.5%)",
      "src": "https://www.koreatimes.co.kr/economy/20261002/consumer-prices-up-29-in-september"
     },
     {
      "l": "한국은행 기준금리",
      "v": "3.00%",
      "d": "2026-08-27",
      "chg": "7·8월 연속 +25bp",
      "trend": "up",
      "n": "다음 결정 10/22, 긴축 편향 유지",
      "src": "https://www.bok.or.kr/eng/main/main.do"
     },
     {
      "l": "일본 CPI(8월)",
      "v": "1.9% y/y",
      "d": "2026-09-17",
      "chg": "전월과 동일, 예상 2.1% 하회",
      "trend": "flat",
      "n": "9월치 10/22 발표",
      "src": "https://tradingeconomics.com/japan/inflation-cpi"
     },
     {
      "l": "일본은행 정책금리",
      "v": "1.25%",
      "d": "2026-09-18",
      "chg": "+25bp(1.00%→1.25%)",
      "trend": "up",
      "n": "31년 만의 최고 수준",
      "src": "https://www.investing.com/economic-calendar/interest-rate-decision-165"
     },
     {
      "l": "중국 CPI(8월)",
      "v": "0.8% y/y",
      "d": "2026-09-10",
      "chg": "7월 0.5%→0.8%",
      "trend": "up",
      "n": "9월치 10/14 발표",
      "src": "https://www.global-rates.com/en/inflation/cpi/76/china/"
     },
     {
      "l": "중국 제조업 PMI(9월)",
      "v": "50.1(비제조업 50.2)",
      "d": "2026-09-30",
      "chg": "8월 49.8→50.1",
      "trend": "up",
      "n": "원자재구매가격지수 60.8, 생산 51.7(연중 최고)",
      "src": "http://english.scio.gov.cn/pressroom/2026-09/30/content_118718778.html"
     },
     {
      "l": "IMF 세계성장률(7월 업데이트)",
      "v": "2026 3.0%, 2027 3.4%",
      "d": "2026-07-28",
      "chg": "4월 3.1%→3.0%",
      "trend": "down",
      "n": "10월 WEO 10/13 방콕 연차총회서 발표 예정; 세계은행 2026 2.5%",
      "src": "https://www.imf.org/-/media/files/publications/weo/2026/update/july/english/text.pdf"
     }
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "FOMC 9월 의사록: 전원 인상 지지, 대다수 연말까지 추가 인상 전망 → 10년물 24년래 최고",
      "src": "https://www.fxstreet.com/news/fed-minutes-set-to-provide-some-insight-into-the-timing-of-next-rate-hikes-202610071400"
     },
     {
      "d": "2026-10-02",
      "x": "유로존 9월 물가 3.8%, 이탈리아 4.1%; 에너지 물가 18.8% 급등",
      "src": "https://qz.com/eurozone-inflation-three-year-high-september-ecb-rate-100226"
     },
     {
      "d": "2026-10-01",
      "x": "블룸버그: 한국 9월 물가 둔화에도 근원물가 연중 최고 → 한은 긴축 편향 뒷받침",
      "src": "https://www.bloomberg.com/news/articles/2026-10-01/s-korea-inflation-stays-sticky-backing-bok-s-tightening-bias"
     }
    ]
   },
   {
    "id": "markets",
    "title": "금융시장",
    "metrics": [
     {
      "l": "S&P 500",
      "v": "7,801.77",
      "d": "2026-10-07",
      "chg": "-0.22% (10/6 사상최고 7,818.93)",
      "trend": "down",
      "n": "금리·유가 상승에 사상최고서 반락",
      "src": "https://www.thestreet.com/stock-market-today/stock-market-today-dow-jones-sp-500-nasdaq-updates-oct-07-2026"
     },
     {
      "l": "나스닥 종합",
      "v": "27,538.69",
      "d": "2026-10-07",
      "chg": "-0.22% (10/6 최고 27,599.79)",
      "trend": "down",
      "n": "다우 51,179.87(-0.66%)",
      "src": "https://www.thestreet.com/stock-market-today/stock-market-today-dow-jones-sp-500-nasdaq-updates-oct-07-2026"
     },
     {
      "l": "KOSPI",
      "v": "6,803.90",
      "d": "2026-10-07",
      "chg": "-1.98%(-137.49p)",
      "trend": "down",
      "n": "외국인 2.6조 순매도, 미 금리·삼성전자 실적 경계",
      "src": "https://news.sbs.co.kr/english/article.do?news_id=N1008787471"
     },
     {
      "l": "원/달러",
      "v": "1,340.4원",
      "d": "2026-10-07",
      "chg": "-3.2원(원화 강세)",
      "trend": "down",
      "n": "반도체 수출업체 달러 매도",
      "src": "https://news.sbs.co.kr/english/article.do?news_id=N1008787479"
     },
     {
      "l": "니케이225",
      "v": "70,035.71",
      "d": "2026-10-07",
      "chg": "-0.92%",
      "trend": "down",
      "n": "반도체 랠리 되돌림(출처별 69,623~70,150 편차)",
      "src": "https://www.ad-hoc-news.de/boerse/news/marktberichte/nikkei-225-closes-0-92-percent-lower-as-chip-rally-reverses/70255028"
     },
     {
      "l": "엔/달러",
      "v": "158.43엔",
      "d": "2026-10-07",
      "chg": "엔 -0.19%",
      "trend": "up",
      "n": "BOJ 인상에도 엔 약세 지속",
      "src": "https://www.riotimesonline.com/asia-intelligence-brief-wednesday-october-7-2026/"
     },
     {
      "l": "상하이종합",
      "v": "3,842.19",
      "d": "2026-09-30",
      "chg": "+0.31%(연휴 전 마지막 종가)",
      "trend": "flat",
      "n": "국경절 휴장(10/1~7), 10/8 재개장",
      "src": "https://www.bbntimes.com/global-economy/sse-composite-shut-for-golden-week-on-1-october-2026-index-parked-at-3-842-19-until-mainland-markets-reopen-on-8-october"
     },
     {
      "l": "금",
      "v": "$4,109.61/oz",
      "d": "2026-10-07",
      "chg": "-1.32%",
      "trend": "down",
      "n": "연준 의사록 앞두고 차익실현",
      "src": "https://tradingeconomics.com/commodity/gold"
     },
     {
      "l": "달러인덱스(DXY)",
      "v": "102.36",
      "d": "2026-10-07",
      "chg": "+0.51%, 1개월 +3.6%",
      "trend": "up",
      "n": "52주 고점 102.54(10/5) 근접, 안전자산 수요",
      "src": "https://tradingeconomics.com/united-states/currency"
     },
     {
      "l": "비트코인",
      "v": "$83,759 (10/7 07:15 ET) → $82,810 (10/8 01:19 ET)",
      "d": "2026-10-08",
      "chg": "-$2,522 전일比, 10/6 고점 $86,592",
      "trend": "down",
      "n": "연준 매파 의사록·ETF 유출·롱 청산 $5.5억+",
      "src": "https://www.coindesk.com/price/bitcoin"
     }
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "미 10년물 5.35% 터치(2002년 이후 최고) → 미·일·한 증시 동반 하락, 러셀2000 -1.31%",
      "src": "https://www.forbes.com/sites/garthfriesen/2026/10/07/why-the-10-year-treasury-yield-just-hit-a-24-year-high/"
     },
     {
      "d": "2026-10-07",
      "x": "코스피 7,000선 재이탈 후 6,800선 턱걸이, 10/8 장초 6,776",
      "src": "https://en.bloomingbit.io/feed/news/121814"
     }
    ]
   },
   {
    "id": "trade",
    "title": "교역·식량·물류",
    "metrics": [
     {
      "l": "FAO 식량가격지수(9월)",
      "v": "136.0",
      "d": "2026-10-02",
      "chg": "+1.5% m/m, +5.8% y/y",
      "trend": "up",
      "n": "2022년 11월 이후 최고, 곡물지수 122.8(+5.1%), 밀 +6% 맥주 +6%",
      "src": "https://www.fao.org/newsroom/detail/fao-food-price-index-rises-in-september-amid-weather-concerns-and-transport-disruptions/en"
     },
     {
      "l": "시카고 밀",
      "v": "$6.98/bu",
      "d": "2026-10-07",
      "chg": "-0.83% 당일, 전년比 +37.7%",
      "trend": "up",
      "n": "흑해 물류 차질·북미 건조",
      "src": "https://tradingeconomics.com/commodity/wheat"
     },
     {
      "l": "시카고 옥수수",
      "v": "$5.00/bu 하회(6주 최저)",
      "d": "2026-10-07",
      "chg": "하락",
      "trend": "down",
      "n": "미 재고 20.95억 bu 상회, 10월 WASDE 수출 +7,500만 bu(우크라 제약 반영)",
      "src": "https://tradingeconomics.com/commodity/corn"
     },
     {
      "l": "요소 비료(북미 소매)",
      "v": "$675/t",
      "d": "2026-09-30",
      "chg": "전년比 +9%",
      "trend": "up",
      "n": "세계은행 도매 $390/t(8월), 4월 호르무즈 봉쇄 시 $700+ 급등",
      "src": "https://www.dtnpf.com/agriculture/web/ag/crops/article/2026/09/16/fertilizer-prices-continue-lower-6-8"
     },
     {
      "l": "우크라이나 농산물 수출 전망(26/27)",
      "v": "2,960만 t",
      "d": "2026-08-07",
      "chg": "기존 6,440만 t比 -54%",
      "trend": "down",
      "n": "밀 수출 830만 t(-53%), 오데사 항만 공격; 8월 초 곡물수출 -76% y/y",
      "src": "https://www.bloomberg.com/news/articles/2026-08-07/ukraine-grain-exports-to-slump-after-russian-strikes-on-odesa"
     },
     {
      "l": "러시아 흑해 곡물",
      "v": "노보로시스크 3개 터미널(2,500만 t 처리) 가동 중단",
      "d": "2026-09-02",
      "chg": "수출관세 2026년 말까지 유예",
      "trend": "down",
      "n": "우크라 공격으로 수출로 70%+ 영향",
      "src": "https://www.bloomberg.com/news/articles/2026-09-02/russia-pauses-grain-export-duty-through-the-end-of-2026"
     },
     {
      "l": "Drewry 세계컨테이너지수",
      "v": "$4,434/FEU",
      "d": "2026-10-01",
      "chg": "-1% w/w",
      "trend": "down",
      "n": "상하이-뉴욕 $10,428, 상하이-제벨알리 $8,662(중동 리스크)",
      "src": "https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry"
     },
     {
      "l": "수에즈 컨테이너선 통항(9월)",
      "v": "314척",
      "d": "2026-09-30",
      "chg": "+64% y/y, 후티 공격 이후 최다",
      "trend": "up",
      "n": "아시아-유럽 항로의 약 35% 홍해 복귀",
      "src": "https://lloydslist.com/LL1158637/Red-Sea-container-transits-hit-post-crisis-high-as-carriers-accelerate-return"
     },
     {
      "l": "중국 수출(8월)",
      "v": "$4,014억(+25.0% y/y)",
      "d": "2026-09-08",
      "chg": "무역흑자 $1,191억, 1~8월 $8,055억",
      "trend": "up",
      "n": "대미 수출 +34.4%, 9월치 미발표",
      "src": "https://www.cnbc.com/2026/09/08/china-exports-imports-august-trade-rebalance-demand-surplus-.html"
     },
     {
      "l": "한국 수출(9월)",
      "v": "$1,209억(사상 최대)",
      "d": "2026-10-01",
      "chg": "반도체 $603억(+262.8%), 무역흑자 $498.5억",
      "trend": "up",
      "n": "수입 $710.9억(+26%), 자동차 -5.5%",
      "src": "https://english.motir.go.kr/eng/article/EATCLdfa319ada/2743/view"
     },
     {
      "l": "한국 에너지 수입액(9월)",
      "v": "$129.6억(+38.0%)",
      "d": "2026-10-01",
      "chg": "원유 $80.0억(+38.4%; 단가 +35.7%, 물량 +2.0%)",
      "trend": "up",
      "n": "3대 에너지(원유·가스·석탄) 합계",
      "src": "https://english.motir.go.kr/eng/article/EATCLdfa319ada/2743/view"
     },
     {
      "l": "한국 경상수지(8월)",
      "v": "$461억 흑자",
      "d": "2026-10-08",
      "chg": "7월 $420.8억→, 역대 2위",
      "trend": "up",
      "n": "한은 2026년 경상흑자 전망 $4,500억으로 상향",
      "src": "https://en.sedaily.com/finance/2026/10/08/koreas-august-current-account-surplus-hits-461-billion"
     }
    ],
    "dev": [
     {
      "d": "2026-10-02",
      "x": "FAO: 호르무즈 불확실성으로 연료·비료·운임 고공행진이 식량가격 3개월 연속 상승 견인",
      "src": "https://www.fao.org/newsroom/detail/fao-food-price-index-rises-in-september-amid-weather-concerns-and-transport-disruptions/en"
     },
     {
      "d": "2026-10-03",
      "x": "러시아군, 오데사주 항만서 라이베리아 선적 화물선 공격(1명 사망·3명 부상)",
      "src": "https://www.ukrinform.net/amp/rubric-ato/4170700-russian-forces-attack-civilian-vessel-in-odesa-region-port-killing-one-and-injuring-three-others.html"
     },
     {
      "d": "2026-09-23",
      "x": "IMF 연구 인용: 해상운임 상승은 수입물가에 2개월, 소비자물가에 최대 12~18개월 시차로 전가 → 美근원재화 물가 아직 +0.7%",
      "src": "https://www.fxstreet.com/analysis/freight-costs-may-reach-us-shelves-after-the-fed-plans-to-stop-hiking-202609231649"
     }
    ]
   },
   {
    "id": "sanctions",
    "title": "제재·경제전쟁",
    "metrics": [
     {
      "l": "미·중 관세 합의",
      "v": "양측 각 $300억 비민감 품목 관세 인하(≈90% MFN 세율)",
      "d": "2026-09-26",
      "chg": "휴전 2027-01-10까지 연장",
      "trend": "down",
      "n": "中 미국산 석탄 2027·2028년 각 1,000만 t 수입, AI 대화 개시; 희토류 미포함",
      "src": "https://www.axios.com/2026/09/26/us-china-tariffs-trade-30-billion"
     },
     {
      "l": "EU 러시아 유가상한(21차 패키지)",
      "v": "원유 $47.6/bbl(2027-07-15까지 자동조정 동결)",
      "d": "2026-07-23",
      "chg": "218건 지정(4년래 최다)",
      "trend": "flat",
      "n": "정유소 거래금지 2027-01-25 시행, 집행위 10/25까지 보고",
      "src": "https://www.kharon.com/brief/eu-russia-21st-sanctions-package-oil-price-cap"
     },
     {
      "l": "OFAC 이란 제재(Operation Economic Outcast)",
      "v": "A7 네트워크 TCO 지정 + 철도·자동차 등 30개 대상",
      "d": "2026-10-01",
      "chg": "8/24 5개 부문·약 60건 추가 이후",
      "trend": "up",
      "n": "홍콩·중국·UAE·터키·독일 소재 기업 포함",
      "src": "https://www.paulhastings.com/insights/client-alerts/treasury-issues-additional-iran-related-sanctions-suspends-general-licenses-and-pledges-additional-action-under-operation-economic-outcast"
     },
     {
      "l": "러시아 석유가스 세수(9월)",
      "v": "4,524억 루블($54.3억)",
      "d": "2026-10-05",
      "chg": "-22% y/y, 1~9월 -17.2%",
      "trend": "down",
      "n": "우랄유 $92+에도 생산·수출 감소, 루블 강세, 정유보조금 3,055억 루블",
      "src": "https://www.pravda.com.ua/eng/news/2026/10/05/8056530/"
     },
     {
      "l": "미 반도체 대중 수출통제",
      "v": "H200/MI325X 건별심사(25% 관세·50% 물량상한)",
      "d": "2026-01-15",
      "chg": "6/1 中본사 해외법인에도 라이선스 적용",
      "trend": "flat",
      "n": "블랙웰·루빈 금지 유지, 10월 신규 BIS 규칙 미확인",
      "src": "https://www.aljazeera.com/economy/2026/6/1/us-says-ban-on-ai-chip-shipments-applies-to-chinese-firms-outside-china"
     },
     {
      "l": "중국 희토류·갈륨 등 수출통제 유예",
      "v": "2026-11-27 만료",
      "d": "2026-09-26",
      "chg": "6월 美기업 10곳(MP Materials 등) 통제명단 추가",
      "trend": "flat",
      "n": "9월 합의에 희토류 조항 없음",
      "src": "https://www.china-briefing.com/news/trump-xi-meeting-outcomes-and-implications/"
     }
    ],
    "dev": [
     {
      "d": "2026-09-29",
      "x": "美, 러 야코블레프·MG-Flot, 이란 사하항공 등 E.O.13949 지정 + MODAFL 조달망 10건",
      "src": "https://www.skadden.com/insights/publications/2026/09/us-government-announces-new-iran-sanctions-measures"
     },
     {
      "d": "2026-10-01",
      "x": "OFAC·FinCEN, 이란의 러시아 연계 그림자 은행 A7 네트워크 제재 및 자금이체 제한 제안",
      "src": "http://bankingjournal.aba.com/2026/10/recent-news-from-treasurys-office-of-foreign-assets-control-oct-5/"
     },
     {
      "d": "2026-09-28",
      "x": "中 상무부, 미중 10개 합의 성과 발표(관세 인하는 양측 국내절차 완료 후 동시 발효)",
      "src": "https://www.globalsecurity.org/wmd/library/news/china/2026/09/china-260928-globaltimes01.htm"
     }
    ]
   },
   {
    "id": "stress",
    "title": "국가별 경제 스트레스",
    "metrics": [
     {
      "l": "이란 GDP(이란력 1분기)",
      "v": "-10.1% y/y(석유가스 -26.4%)",
      "d": "2026-10-01",
      "chg": "IMF 4월 연간 -6.1%, 물가 68.9%",
      "trend": "down",
      "n": "이란통계청 수치, 2차 출처 단일",
      "src": "https://www.karmactive.com/iran-gdp-contraction-10-percent-oil-gas-war-2026/"
     },
     {
      "l": "이란 리알(비공식)",
      "v": "268.8만 리알/$",
      "d": "2026-10-07",
      "chg": "사상 최저, 1년간 가치 절반↓",
      "trend": "down",
      "n": "중앙은행 총재 \"경제 붕괴 아니다\" 반박",
      "src": "https://www.iranintl.com/en/202610079088"
     },
     {
      "l": "이집트 수에즈운하 수입(FY25/26)",
      "v": "$46.7억",
      "d": "2026-10-04",
      "chg": "+23% y/y, 2023년 $102억比 -54%",
      "trend": "up",
      "n": "IMF 경상적자 GDP 4.5%, 개전 후 자본유출 약 $100억",
      "src": "https://www.riotimesonline.com/egypt-suez-canal-revenue-below-peak-2026/"
     },
     {
      "l": "파키스탄 석유수입액(FY26)",
      "v": "$168.6억",
      "d": "2026-07-20",
      "chg": "IMF 추정比 +$15.8억",
      "trend": "up",
      "n": "IMF: 4분기 CPI 10% 상회 전망, 루피 ~280",
      "src": "https://propakistani.pk/2026/07/20/pakistans-oil-import-bill-exceeds-imf-estimate-in-fy26/"
     },
     {
      "l": "레바논 GDP 전망(세계은행)",
      "v": "2026 -6.4%, 물가 17.5%",
      "d": "2026-08-21",
      "chg": "재무장관: 지속시 -7~10%",
      "trend": "down",
      "n": "2023년 이후 누적 손실 최대 $200억",
      "src": "https://www.worldbank.org/en/news/press-release/2026/08/21/renewed-conflict-derails-lebanon-s-fragile-economic-recovery"
     },
     {
      "l": "에티오피아 물가/비르",
      "v": "15.1%(8월) / 162.67비르/$",
      "d": "2026-09-25",
      "chg": "4월 11.7%→15.1%",
      "trend": "up",
      "n": "중동 연료가 충격, NBE 정책금리 16%, 병행환율 ~177",
      "src": "https://www.riotimesonline.com/ethiopia-economy-birr-reform-2026/"
     },
     {
      "l": "수단 물가/파운드",
      "v": "26.14%(8월) / 병행 7,000~9,000파운드/$",
      "d": "2026-09-30",
      "chg": "4월 45.8%서 둔화, 통화 급락",
      "trend": "down",
      "n": "연료 리터당 7,000파운드+, 농산물 수출 -43%",
      "src": "https://sudantribune.com/article/319156"
     },
     {
      "l": "수단 인도적 대응계획 자금",
      "v": "42.6% 확보($29억 중)",
      "d": "2026-09-28",
      "chg": "",
      "trend": "down",
      "n": "3,370만 명 지원 필요",
      "src": "https://www.unocha.org/sudan"
     },
     {
      "l": "예멘 인도적 대응계획 자금",
      "v": "약 20% 확보($21.6억 중)",
      "d": "2026-09-17",
      "chg": "5월 13%→20%",
      "trend": "down",
      "n": "실향민 20만+, IOM \"자금 고갈\"",
      "src": "https://www.iom.int/news/yemen-displacement-tops-200000-needs-soar-and-funding-alarmingly-dries"
     },
     {
      "l": "사우디 재정적자(상반기)",
      "v": "SAR 1,600억",
      "d": "2026-09-15",
      "chg": "연간 전망의 97%",
      "trend": "up",
      "n": "2018년 이후 최대, 8월 생산 1990년래 최저",
      "src": "https://www.agbi.com/opinion/economy/2026/09/the-gulf-must-rethink-how-it-finances-its-future/"
     },
     {
      "l": "카타르 재정적자(상반기)",
      "v": "QAR 315억",
      "d": "2026-09-15",
      "chg": "연간 예산전망 초과",
      "trend": "up",
      "n": "IMF 4월 2026 성장 -14.7%(역내 최악)",
      "src": "https://www.agbi.com/opinion/economy/2026/09/the-gulf-must-rethink-how-it-finances-its-future/"
     },
     {
      "l": "쿠웨이트 재정적자(2026/27 예산)",
      "v": "KD 98억($319억)",
      "d": "2026-08-15",
      "chg": "GDP 10% 초과 가능",
      "trend": "up",
      "n": "IMF 4월 -4.2% 성장 전망, 미래세대기금 의존",
      "src": "https://gulftribune.org/2026/08/gcc-states-adjust-budgets-amid-regional-conflict-shocks/"
     },
     {
      "l": "우크라이나 GDP 전망(EBRD)",
      "v": "2026 1.5%",
      "d": "2026-09-30",
      "chg": "6월 2.2%→1.5%, 경제부 0.5~0.6%",
      "trend": "down",
      "n": "항만 공격·곡물수출 급감, 7월 물가 7.7%, 재정적자 GDP 20.3%(OECD)",
      "src": "https://www.ebrd.com/home/news-and-events/news/2026/ebrd-downgrades-ukraine-s-economic-growth-forecast-amid-escalati.html"
     }
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "이란 중앙은행 총재, 리알 사상최저·석유수출 중단에도 \"경제 작동 중\" 주장",
      "src": "https://www.iranintl.com/en/202610079088"
     },
     {
      "d": "2026-10-04",
      "x": "이집트 총리, 수에즈운하 수입 약 $44억 언급(운하청 $46.7억과 불일치)",
      "src": "https://www.riotimesonline.com/egypt-suez-canal-revenue-below-peak-2026/"
     },
     {
      "d": "2026-09-28",
      "x": "OCHA: 수단 2026 대응계획 43% 미만 확보, 유연 자금 촉구",
      "src": "https://www.globalsecurity.org/military/library/news/2026/09/mil-260928-unocha01.htm"
     },
     {
      "d": "2026-09-10",
      "x": "사우디, OPEC에 8월 생산 623.8만 b/d 보고 — 1990년 걸프전 이후 최저",
      "src": "https://www.bloomberg.com/news/articles/2026-09-10/saudis-tell-opec-that-output-slumped-again-to-lowest-since-1990"
     }
    ]
   }
  ],
  "judgments": [
   "걸프 원유수출은 우회 파이프라인·야간 통항으로 전쟁前의 90%대까지 회복됐지만 호르무즈 유조선 공격(9/28~10/2 12건)과 후티의 사우디 공격이 전쟁 리스크 프리미엄을 유지시켜 브렌트 $100선이 좀처럼 깨지지 않고 있다 (근거: Kpler 9월 중동수출 1,650만 b/d vs 전쟁前 1,800만, 브렌트 10/7 $101.6, 보험료 선체가액 3~8%).",
   "에너지발 인플레이션으로 미·유로·한·일 중앙은행이 동시 인상 사이클에 진입했고 미 10년물이 24년래 최고(5.35%)로 치솟으며 사상최고권 증시(S&P 7,819)와 코스피(-1.98%)에 조정 압력이 커지고 있다 (근거: 연준 3.75~4.00%·ECB 2.50%·BOK 3.00%·BOJ 1.25%, 유로존 9월 물가 3.8%, 美8월 CPI 3.4%→9월 컨센서스 3.7%).",
   "한국은 반도체 초호황(9월 반도체 수출 $603억, 무역흑자 $498.5억, 8월 경상흑자 $461억)이 에너지 수입액 38% 급증을 압도해 원화 강세·역대급 흑자를 기록하고 있으나 에너지 가격 전가(석유류 +14.8%)와 근원물가 2.8%가 한은 추가 인상 가능성을 열어두고 있다 (근거: 산업통상부 10/1, 한은 10/8, 통계청 10/2).",
   "전쟁 비용은 이란(리알 268.8만, 1분기 GDP -10.1%, 선적 0)·카타르(GDP -14.7% 전망)·레바논(-6.4%)·우크라이나(농산물 수출 -54%)와 인도적 자금이 20~43%에 불과한 예멘·수단에 비대칭적으로 집중되고 있으며, 비축유 방출(IEA 3.25억 배럴, 美SPR 1982년래 최저)과 비료·식량가(FAO 136.0, 2022년 11월래 최고) 상승이 취약국 물가를 2차로 압박한다 (근거: 상기 stress·energy·trade 지표)."
  ],
  "gaps": [
   "두바이유 10월 일별 가격: 신뢰할 수 있는 10/7 종가 미확보(Oilprice $99.22는 2일 지연·날짜 불명, FRED 7월 월평균 $77.13만 확인)",
   "IMF 10월 WEO 성장률(세계·미·중·한): 10/13 발표 예정으로 미공개, 7월 업데이트(세계 3.0%)로 대체",
   "미국 9월 CPI(10/14 발표), 중국 9월 수출·CPI(10/13~14 발표), 일본 9월 CPI(10/22), 한은 10월 금리결정(10/22) 미발표",
   "카타르 9월 LNG 수출량(톤 단위) 및 불가항력 해제 여부 공식 확인 불가; 이란 9월 원유수출량의 Kpler/Vortexa 공식 월간 집계 미확보",
   "한국 9월 LNG·석유제품 수입액 세부 분해 미확보(3대 에너지 합계 $129.6억만 확인)",
   "니케이225 10/7 종가 출처별 편차(69,623~70,150), DXY 종가 출처별 102.24~102.36 편차",
   "10월 기준 글로벌 경기침체 확률 코멘트(Moody's ~50% 등은 봄철 자료) 및 사우디 9월 생산량 서베이(Reuters/Bloomberg) 미발표",
   "10월 신규 중국 희토류 수출통제, 10월 신규 BIS 반도체 규칙, 미국의 러시아 유가상한 관련 조치: 검색 결과 없음",
   "에티오피아 2026 인도적 호소 자금 충족률(HNRP 미발간), 미중 $300억 관세인하 발효일 미확정"
  ]
 },
 "gp": {
  "axes": [
   {
    "id": "uschina",
    "title": "미·중 전략경쟁",
    "status": "시진핑 방미(9.23~25)로 '전략적 안정' 틀과 AI대화·군사소통 채널이 합의됐으나, 대만 무기판매 보류·희토류/반도체 통제 데드라인(11월~1월)과 스카버러 공중 근접위협 등 구조적 마찰은 지속.",
    "trend": "flat",
    "facts": [
     {
      "d": "2026-09-26",
      "x": "시진핑 국빈 방미 결과 8개 합의: 300억달러 상호관세 인하 조정, 미·중 통상위원회(Board of Trade) 신설, 미·중 AI대화 신설(첫 회의 11월), AI 사고 통신채널, '전략적 안정의 건설적 관계' 구축",
      "src": "https://www.fmprc.gov.cn/eng/xw/zyxw/202609/t20260926_12031663.html",
      "actors": [
       "미국",
       "중국"
      ]
     },
     {
      "d": "2026-09-26",
      "x": "양국, AI 안전 채널 설치 및 군사위기 소통 메커니즘 가속화에 합의; 무역휴전은 2027-01-10까지 연장(베센트)",
      "src": "https://www.pbs.org/newshour/world/china-and-u-s-agree-to-establish-ai-safety-channel-and-continue-trade-and-military-talks",
      "actors": [
       "미국",
       "중국"
      ]
     },
     {
      "d": "2026-10-04",
      "x": "필리핀군, 10.3 스카버러(바호 데 마신록) 상공서 중국 J-16이 C-208 초계기에 반복 근접기동했다고 공개; 중국 남부전구는 '불법 침입' 경고 주장",
      "src": "https://maritime-executive.com/article/philippines-accuses-pla-of-unsafe-close-encounter-over-south-china-sea",
      "actors": [
       "중국",
       "필리핀"
      ]
     },
     {
      "d": "2026-10-05",
      "x": "약 140억달러 대만 무기판매 패키지 트럼프 결정 보류 지속, 대만 대표 위다레이(Yui) 신속 결정 촉구; F-16V 블록70 첫 2대 10.2 타이둥 도착",
      "src": "https://www.japantimes.co.jp/news/2026/10/05/asia-pacific/taiwan-trump-us-arms-sale/",
      "actors": [
       "미국",
       "대만",
       "중국"
      ]
     },
     {
      "d": "2026-09-30",
      "x": "국경절 전 PLA 항공기 23대 탐지(16대 ADIZ 진입) 후 10.1~2 각 6·5대로 급감; 9월 총 255대(8월 173대), 2026년 1~7월 ADIZ 진입은 전년比 52% 감소",
      "src": "https://taiwansecuritymonitor.substack.com/p/taiwan-security-monitor-weekly-september-f35",
      "actors": [
       "중국",
       "대만"
      ]
     },
     {
      "d": "2026-10-03",
      "x": "중국 지방정부 통제 리스사 Semi-Tech가 수출제한 Nvidia B300 탑재 서버 700대+ 구매 자금 조달(블룸버그); 엔비디아 조사 착수",
      "src": "https://www.taipeitimes.com/News/biz/archives/2026/10/03/2003865294",
      "actors": [
       "중국",
       "미국",
       "Nvidia"
      ]
     },
     {
      "d": "2026-07-14",
      "x": "BIS 케슬러 차관, H200 대중 수출허가(약 100억달러)에도 실제 선적은 '극소수'; 10월 이후 중국 기업 Entity List 추가 없음",
      "src": "https://www.cnbc.com/2026/07/14/nvidia-h200-ai-chips-china.html",
      "actors": [
       "미국",
       "중국"
      ]
     },
     {
      "d": "2026-06-22",
      "x": "중국 상무부, MP Materials·USA Rare Earth 등 미국 기업 10곳 수출통제 명단 등재(미 군사연계 기업 명단 확대에 대응)",
      "src": "https://www.bloomberg.com/news/articles/2026-06-22/china-places-two-us-rare-earths-producers-on-export-control-list",
      "actors": [
       "중국",
       "미국"
      ]
     },
     {
      "d": "2026-07-30",
      "x": "미 국방부, 미·중 군사대화가 '수년 내 최강' 평가; 헤그세스-둥쥔 교류, 콜비-마자오쉬 7.23 회동",
      "src": "https://www.stripes.com/theaters/asia_pacific/2026-07-30/china-pentagon-military-communication-22406286.html",
      "actors": [
       "미국",
       "중국"
      ]
     },
     {
      "d": "2026-10-06",
      "x": "미·중, 상호 핵시설 방문 개시 비공식 예비 논의 중(카네기 확산뉴스)",
      "src": "https://carnegieendowment.org/programs/nuclear-policy/proliferation-news/proliferation-news-october-6-2026",
      "actors": [
       "미국",
       "중국"
      ]
     }
    ],
    "metrics": [
     {
      "l": "상호관세 인하 규모",
      "v": "300억달러",
      "d": "2026-09-26",
      "n": "미측 품목·세율 미공개",
      "src": "https://www.fmprc.gov.cn/eng/xw/zyxw/202609/t20260926_12031663.html"
     },
     {
      "l": "미·중 무역휴전 만료",
      "v": "2027-01-10",
      "d": "2026-09-26",
      "n": "11.10에서 2개월 연장",
      "src": "https://www.pbs.org/newshour/world/china-and-u-s-agree-to-establish-ai-safety-channel-and-continue-trade-and-military-talks"
     },
     {
      "l": "중국 희토류 통제 유예 만료",
      "v": "2026-11-10",
      "d": "2026-08-21",
      "n": "2025.10.9 통제 1년 유예; 대미 갈륨·게르마늄 금지 유예는 11.27",
      "src": "https://www.clarkhill.com/news-events/news/china-hits-pause-on-rare-earth-export-controls-and-what-it-means-for-supply-chains/"
     },
     {
      "l": "9월 대만 주변 PLA 항공기",
      "v": "255대",
      "d": "2026-09-30",
      "n": "8월 173대 대비 증가",
      "src": "https://taiwansecuritymonitor.substack.com/p/taiwan-security-monitor-weekly-september-f35"
     },
     {
      "l": "보류 중 대만 무기판매",
      "v": "약 140억달러",
      "d": "2026-10-05",
      "n": "공화당 상원 서한에 무응답",
      "src": "https://www.japantimes.co.jp/news/2026/10/05/asia-pacific/taiwan-trump-us-arms-sale/"
     }
    ]
   },
   {
    "id": "axis",
    "title": "러·중·북·이란 연대",
    "status": "러-북(두만강 교량, 추가 파병 경고), 러-이란(카스피해 폭약·드론 보급) 군사협력은 제도화 단계로 진입했으나, 중-러 축은 PoS-2 가격 교착과 중국의 '훈련 참여·거래 자제' 이중 행보로 한계 노출.",
    "trend": "up",
    "facts": [
     {
      "d": "2026-09-27",
      "x": "한국, 젤렌스키가 9.23 UN 연설서 북한군 포로 2명 한국 이송을 공개하자 비밀유지 합의 위반이라며 공식 해명·사과 요구",
      "src": "https://www.aljazeera.com/news/2026/9/27/south-korea-ukraine-relations-sour-over-north-korean-pow-transfer",
      "actors": [
       "한국",
       "우크라이나",
       "북한",
       "러시아"
      ]
     },
     {
      "d": "2026-09-29",
      "x": "푸틴 군 병력 확대 명령; 젤렌스키, 러시아가 북한군 1만명 추가 투입 준비 중이라 경고",
      "src": "https://www.cnbc.com/2026/09/29/putin-russia-army-ukraine-zelenskyy-north-korea.html",
      "actors": [
       "러시아",
       "북한",
       "우크라이나"
      ]
     },
     {
      "d": "2026-09-25",
      "x": "러-북, 9.7 두만강 첫 도로교 개통으로 화물·군수 육로 신설",
      "src": "https://neweasterneurope.eu/2026/09/25/russia-and-north-korea-open-a-new-route-for-their-wartime-partnership/",
      "actors": [
       "러시아",
       "북한"
      ]
     },
     {
      "d": "2026-08-17",
      "x": "러시아, 카스피해 경유로 이란에 드론 부품·탄약·TNT 공급(유럽 정부 문건); 미·이스라엘 공습 피해 비축 복구 지원",
      "src": "https://www.nbcnews.com/politics/national-security/russia-shipping-explosives-iran-bolster-missile-drone-arsenal-us-war-rcna592892",
      "actors": [
       "러시아",
       "이란"
      ]
     },
     {
      "d": "2026-09-01",
      "x": "이란, 러시아에 제트추진(최대 600km/h) Geran 드론 요청(FT); 크렘린 '거짓' 부인",
      "src": "https://www.ynetnews.com/article/sjtcjoekgx",
      "actors": [
       "이란",
       "러시아"
      ]
     },
     {
      "d": "2026-10-04",
      "x": "중국군, 러 주최 다국적 'Tsentr-2026' 훈련(첼랴빈스크, 8개국 약 4.7만명) 참가 종료",
      "src": "https://www.africanews.com/2026/10/04/eight-countries-including-china-join-military-exercises-in-russia/",
      "actors": [
       "중국",
       "러시아"
      ]
     },
     {
      "d": "2026-07-13",
      "x": "러-중 'Joint Sea-2026' 칭다오 해상훈련(7.6~13) 및 태평양 합동순찰; 러 바랴그 순양함·우파 잠수함 참가",
      "src": "https://tass.com/defense/2156007",
      "actors": [
       "러시아",
       "중국"
      ]
     },
     {
      "d": "2026-07-20",
      "x": "Power of Siberia 2 가격 교착: 중국 약 50달러/천㎥ 요구 vs 러 250달러; 5월 정상회담서도 미합의",
      "src": "https://asiatimes.com/2026/07/power-of-siberia-2-deadlock-cracks-russia-china-no-limits-pact/",
      "actors": [
       "러시아",
       "중국"
      ]
     },
     {
      "d": "2026-02-10",
      "x": "러-이란, Verba 휴대용 방공 발사기 500기·미사일 2,500발 계약(2027~29 인도); S-400 요청은 거부",
      "src": "https://www.longwarjournal.org/archives/2026/02/russia-to-supply-iran-with-shoulder-fired-air-defense-system.php",
      "actors": [
       "러시아",
       "이란"
      ]
     },
     {
      "d": "2026-08-20",
      "x": "우크라 정보당국, 북한이 KN-23/24 탄도미사일 120발+ 및 미사일부대 90명 추가 파견 계획 평가",
      "src": "https://beyondparallel.csis.org/north-korea-russia-cooperation/",
      "actors": [
       "북한",
       "러시아"
      ]
     }
    ],
    "metrics": [
     {
      "l": "쿠르스크 북한군",
      "v": "약 11,000명(사상 6,000)",
      "d": "2026-02-10",
      "n": "국정원, 2026년 초 기준",
      "src": "https://www.yahoo.com/news/articles/nearly-11-000-north-korean-124958616.html"
     },
     {
      "l": "북한 대러 수입 추정",
      "v": "76.7억~144억달러",
      "d": "2026-09-20",
      "n": "파병·무기수출 합산(한국 분석)",
      "src": "https://defence-blog.com/north-korea-earned-billions-from-russia-arms-transfers/"
     },
     {
      "l": "러-중 가스 가격 격차",
      "v": "50 vs 250달러/천㎥",
      "d": "2026-07-20",
      "n": "PoS-2 협상 교착 원인",
      "src": "https://asiatimes.com/2026/07/power-of-siberia-2-deadlock-cracks-russia-china-no-limits-pact/"
     }
    ]
   },
   {
    "id": "nuclear",
    "title": "핵·군비통제",
    "status": "New START 만료 후 조약 없는 상태 고착(미, 중앙제한 유지 제안 거부), 중국 핵전력 최속 증강, 이란 농축우라늄 소재 1년 이상 미확인, 북한 '극초음속 IRBM' 주장, 리투아니아 핵배치 금지 해제 추진으로 군비통제 공백 확대.",
    "trend": "up",
    "facts": [
     {
      "d": "2026-10-06",
      "x": "미 국무부 Yeaw 차관보, 크렘린의 New START 중앙제한(1,550발/700기) 유지 제안 거부 성명; 미·중은 상호 핵시설 방문 예비 논의",
      "src": "https://carnegieendowment.org/programs/nuclear-policy/proliferation-news/proliferation-news-october-6-2026",
      "actors": [
       "미국",
       "러시아",
       "중국"
      ]
     },
     {
      "d": "2026-02-05",
      "x": "New START 만료, 1972년 이후 처음으로 전략핵 조약 상한 부재; 같은 날 EUCOM-러 군사대화 재개 발표",
      "src": "https://www.npr.org/2026/02/05/nx-s1-5699376/new-start-treaty-between-the-u-s-and-russia-expires-thursday",
      "actors": [
       "미국",
       "러시아"
      ]
     },
     {
      "d": "2026-06-08",
      "x": "SIPRI 연감 2026: 중국 핵탄두 약 620발(+20, 최속 증가), 세계 총 12,187발; 북부 3개 사일로 기지에 수백 발 장전",
      "src": "https://www.sipri.org/media/press-release/2026/increasing-focus-nuclear-weapons-amid-heightened-escalation-risks-new-sipri-yearbook-out-now",
      "actors": [
       "중국",
       "러시아",
       "미국"
      ]
     },
     {
      "d": "2026-05-01",
      "x": "미 정부, 러시아 핵탄두 비축 약 4,600발 추정치 30여 년 만에 첫 공개",
      "src": "https://thebulletin.org/premium/2026-05/russian-nuclear-weapons-2026/",
      "actors": [
       "러시아",
       "미국"
      ]
     },
     {
      "d": "2026-10-07",
      "x": "북한 10.3 '극초음속 탄두 IRBM' 발사 주장(1,000km); 한국 합참은 원산발 700km 비행 탐지—AEI, IRBM 분류·극초음속 능력 미입증 지적",
      "src": "https://www.aei.org/commentary/korean-peninsula-update-october-7-2026/",
      "actors": [
       "북한",
       "한국",
       "일본"
      ]
     },
     {
      "d": "2026-09-20",
      "x": "북한, 동해로 3시간 간격 탄도미사일 2발 발사(약 1주 내 2번째)",
      "src": "https://www.cnn.com/2026/09/20/asia/north-korea-missile-test-intl",
      "actors": [
       "북한"
      ]
     },
     {
      "d": "2026-09-10",
      "x": "IAEA 이사회, 이란 핵파일 UN 안보리 회부; 이란은 22개 사이트 대부분 접근 1년+ 제한, 부셰르만 검증 허용",
      "src": "https://www.fdd.org/analysis/2026/09/10/iaea-refers-irans-nuclear-file-to-un-security-council/",
      "actors": [
       "이란",
       "IAEA"
      ]
     },
     {
      "d": "2026-09-01",
      "x": "IAEA 분기보고: 피폭 시설 농축우라늄 소재 미확인 '확산 우려', 접근 '최우선 긴급' 촉구",
      "src": "https://www.aljazeera.com/news/2026/9/1/urgent-need-for-access-to-iranian-sites-cautions-un-nuclear-watchdog",
      "actors": [
       "이란",
       "IAEA"
      ]
     },
     {
      "d": "2026-10-04",
      "x": "이란 외교부 바가에이, IAEA 사찰단 복귀는 최고지도부 미논의—호르무즈 재개방·봉쇄 해제 선결 요구",
      "src": "https://gulfnews.com/world/mena/trump-weighs-next-iran-move-as-pezeshkian-vows-economic-response-1.500697574",
      "actors": [
       "이란",
       "미국",
       "IAEA"
      ]
     },
     {
      "d": "2026-10-07",
      "x": "CBO, 골든돔 행정명령 요건 충족 시 20년 구축·운영비 약 1.2조달러 추산",
      "src": "https://www.crfb.org/blogs/cbo-estimates-golden-dome-could-cost-more-1-trillion",
      "actors": [
       "미국"
      ]
     },
     {
      "d": "2026-09-14",
      "x": "골든돔 책임자 구에틀라인, 2028년 여름 초기운용 목표 유지; 포트스토리 첫 운용기지 착공, 연내 우주배치 요격체 시험 계획",
      "src": "https://www.nationaldefensemagazine.org/articles/2026/9/14/afa-news-golden-dome-on-track-for-summer-2028-delivery",
      "actors": [
       "미국"
      ]
     },
     {
      "d": "2026-10-06",
      "x": "리투아니아 의회, WMD 배치 금지 헌법조항 폐지 개정안 1독회 통과(최종 2027-01-12); 페스코프 '보복조치' 경고",
      "src": "https://www.cnbc.com/2026/10/06/russia-ukraine-lithuania-trump-nato.html",
      "actors": [
       "리투아니아",
       "러시아",
       "NATO"
      ]
     }
    ],
    "metrics": [
     {
      "l": "중국 핵탄두(SIPRI)",
      "v": "약 620발",
      "d": "2026-06-08",
      "n": "전년 600 → +20, 배치 최대 34",
      "src": "https://www.sipri.org/media/press-release/2026/increasing-focus-nuclear-weapons-amid-heightened-escalation-risks-new-sipri-yearbook-out-now"
     },
     {
      "l": "러시아 핵탄두(미 정부 추정)",
      "v": "약 4,600발",
      "d": "2026-05-01",
      "n": "30여 년 만의 첫 공식 공개",
      "src": "https://thebulletin.org/premium/2026-05/russian-nuclear-weapons-2026/"
     },
     {
      "l": "북한 탄도미사일 발사(한국 집계)",
      "v": "11회(8.12 기준)",
      "d": "2026-08-12",
      "n": "이후 8.20(약 10발), 9.20, 10.3 추가; 16회 공식 집계 미확인",
      "src": "https://www.aljazeera.com/news/2026/8/12/n-korea-launches-ballistic-missile-as-s-korea-us-plan-military-drills"
     },
     {
      "l": "골든돔 20년 비용(CBO)",
      "v": "약 1.2조달러",
      "d": "2026-10-07",
      "n": "트럼프 제시 1,750억달러와 대비",
      "src": "https://www.crfb.org/blogs/cbo-estimates-golden-dome-could-cost-more-1-trillion"
     },
     {
      "l": "IAEA 접근 제한 이란 시설",
      "v": "22개 중 대부분",
      "d": "2026-09-10",
      "n": "부셰르만 허용",
      "src": "https://www.fdd.org/analysis/2026/09/10/iaea-refers-irans-nuclear-file-to-un-security-council/"
     }
    ]
   },
   {
    "id": "alliances",
    "title": "동맹·방위태세",
    "status": "미 전력은 이란 대응 CENTCOM으로 쏠리고 유럽 전진배치(B-1 페어포드 철수)는 위협에 취약성을 노출한 가운데, 메카 동맹 첫 발동·유럽 5% 재무장·일본 9조엔 예산 등 동맹들의 자체 억제력 구축이 가속.",
    "trend": "up",
    "facts": [
     {
      "d": "2026-10-04",
      "x": "미 B-1B 12대 전원 영국 페어포드서 하루 만에 본토 귀환; 이란 연계 의심 테러 모의 체포와 연관, 트럼프 '위협 있었다'·루비오 '정례 교대'로 설명 엇갈림",
      "src": "https://www.airandspaceforces.com/us-b-1-bombers-leave-raf-fairford-uk-base/",
      "actors": [
       "미국",
       "영국",
       "이란"
      ]
     },
     {
      "d": "2026-10-06",
      "x": "조지 H.W. 부시 항모 푸껫 기항으로 중동 항모 1척(조지 워싱턴)만 잔류; 시어도어 루즈벨트 샌디에이고 출항·추가 항모+1만명 배치로 3항모 체제 복귀 가능",
      "src": "https://www.twz.com/sea/where-are-the-aircraft-carriers-october-6-2026",
      "actors": [
       "미국",
       "이란"
      ]
     },
     {
      "d": "2026-10-05",
      "x": "사우디·터키·파키스탄, 리야드 긴급회의서 메카 동맹(8.7 서명) 첫 발동—집단억제 조치 및 사우디 병력 신속 전개 합의(후티 공격 계기)",
      "src": "https://english.alarabiya.net/News/middle-east/2026/10/05/saudi-arabia-turkey-pakistan-to-activate-collective-deterrence-under-mecca-pact",
      "actors": [
       "사우디",
       "터키",
       "파키스탄",
       "후티"
      ]
     },
     {
      "d": "2026-07-06",
      "x": "뤼터 NATO 사무총장, 앙카라 정상회의 앞서 유럽·캐나다 2026년 국방비 약 6,340억달러(GDP 2.53%) 전망; 리투아니아 5.33%·에스토니아 5.11%·폴란드 4.68% 등 5개국 3.5% 초과",
      "src": "https://www.nato.int/en/news-and-events/articles/news/2026/07/06/nato-secretary-general-previews-the-ankara-summit-highlights-progress-on-defence-spending",
      "actors": [
       "NATO"
      ]
     },
     {
      "d": "2026-10-05",
      "x": "메르츠 독일 총리 키이우 방문, 10억유로 군사원조 약속; 러 국방부는 키이우 등 대도시 공격 강화 공언(데이터센터·통신·에너지 표적)",
      "src": "https://www.cnbc.com/2026/10/05/ukraine-war-russia-kyiv-putin-zelenskyy-trump.html",
      "actors": [
       "독일",
       "우크라이나",
       "러시아"
      ]
     },
     {
      "d": "2026-09-05",
      "x": "위트코프·쿠슈너 모스크바서 푸틴 회동, 8개월 교착 협상 재개 시도—'수주 내 다음 단계 발표' 예고",
      "src": "https://www.washingtonpost.com/world/2026/09/05/witkoff-kushner-arrive-moscow-talks-with-putin/",
      "actors": [
       "미국",
       "러시아",
       "우크라이나"
      ]
     },
     {
      "d": "2026-10-06",
      "x": "트럼프, 리투아니아의 영구 미군기지 요청 검토 의사; 리투아니아 총리 비용 부담 의지 표명",
      "src": "https://www.cnbc.com/2026/10/06/russia-ukraine-lithuania-trump-nato.html",
      "actors": [
       "미국",
       "리투아니아",
       "러시아"
      ]
     },
     {
      "d": "2026-08-31",
      "x": "일본 방위성 FY2027 예산 약 8.9조엔 요구; 다카이치 총리, 연내 새 방위력정비계획 발표 예정(무인기·AI 중점)",
      "src": "https://www.bloomberg.com/news/articles/2026-08-31/japan-seeks-record-defense-budget-as-takaichi-plans-buildup",
      "actors": [
       "일본"
      ]
     },
     {
      "d": "2026-05-30",
      "x": "AUKUS 3국, 호주 인수 버지니아급을 전량 중고 3척으로 수정(신조 1척 제외)—비용 절감·미 생산압박 완화",
      "src": "https://www.armyrecognition.com/news/navy-news/2026/revised-aukus-plan-australia-second-hand-us-submarines",
      "actors": [
       "호주",
       "미국",
       "영국"
      ]
     },
     {
      "d": "2026-09-16",
      "x": "브런슨 주한미군사령관, '조건 기반' 전작권 전환 재확인—한국 2028년 완료 목표 vs 미측 FY29 2분기 제시로 이견",
      "src": "https://www.koreatimes.co.kr/southkorea/defense/20260916/usfk-commander-reaffirms-commitment-to-conditions-based-opcon-transfer",
      "actors": [
       "한국",
       "미국"
      ]
     },
     {
      "d": "2026-10-01",
      "x": "트럼프, 한국의 대미 2,000억달러 투자(원전 8기 1,200억·알래스카 LNG 500억) 발표; 한국은 '텍사스 발전소만 확정' 선 긋자 '더 부과하겠다' 압박",
      "src": "https://www.cnbc.com/2026/10/01/trump-south-korea-investment-alaska-lng-nuclear-power.html",
      "actors": [
       "미국",
       "한국"
      ]
     }
    ],
    "metrics": [
     {
      "l": "유럽·캐나다 NATO 국방비 2026",
      "v": "6,340억달러(GDP 2.53%)",
      "d": "2026-07-06",
      "n": "5% 목표는 2035년(스페인 제외)",
      "src": "https://www.nato.int/en/news-and-events/articles/news/2026/07/06/nato-secretary-general-previews-the-ankara-summit-highlights-progress-on-defence-spending"
     },
     {
      "l": "중동 미 항모",
      "v": "1척(증원 중)",
      "d": "2026-10-06",
      "n": "4월 24일 3척 동시 운용 대비",
      "src": "https://www.twz.com/sea/where-are-the-aircraft-carriers-october-6-2026"
     },
     {
      "l": "일본 FY2027 방위예산 요구",
      "v": "약 8.9조엔",
      "d": "2026-08-31",
      "n": "FY2026 9.04조엔 사상 최대",
      "src": "https://www.bloomberg.com/news/articles/2026-08-31/japan-seeks-record-defense-budget-as-takaichi-plans-buildup"
     },
     {
      "l": "메카 동맹 합산 병력",
      "v": "약 140만명",
      "d": "2026-10-05",
      "n": "2026 Global Firepower 기준",
      "src": "https://www.aljazeera.com/news/2026/10/5/mecca-alliance-agrees-to-activate-collective-deterrence-measures"
     },
     {
      "l": "주한미군",
      "v": "약 28,500명",
      "d": "2026-09-16",
      "n": "CRS; 전작권 전환 연계 조정 신호",
      "src": "https://www.congress.gov/crs-product/IF10165"
     }
    ]
   },
   {
    "id": "arctic_cyber",
    "title": "북극·우주·사이버",
    "status": "미·덴마크·그린란드 협정으로 북극 미군 발자국이 제도적으로 확대됐고, 미·중 우주 공세 전환과 중국계 AI정책 전문가 표적 해킹, 발트·호주 해저케이블 손상이 회색지대 경쟁을 심화.",
    "trend": "up",
    "facts": [
     {
      "d": "2026-09-22",
      "x": "미·덴마크·그린란드 UN서 3자 방위협정 서명: 피투피크 기지 확장, 나르사르수아크·메스테르스비 신규 기지, 골든돔 설치, 비NATO국 군사주둔·비EU/NATO 투자 차단권",
      "src": "https://www.usnews.com/news/national-news/articles/2026-09-22/u-s-denmark-greenland-security-deal-whats-in-the-agreement",
      "actors": [
       "미국",
       "덴마크",
       "그린란드"
      ]
     },
     {
      "d": "2026-09-02",
      "x": "미·중 '헌터 위성'·궤도 무기 경쟁—미 우주군, 중국군 ISR 위성 510개+ 접근 평가; 미·영 첫 합동 우주작전으로 중국 정찰위성 경로 대응",
      "src": "https://www.usnews.com/news/top-news/articles/2026-09-02/us-china-arm-for-space-warfare-hunter-satellites-and-orbital-weapons",
      "actors": [
       "미국",
       "중국",
       "영국"
      ]
     },
     {
      "d": "2026-08-20",
      "x": "미 우주사령부, FY29~33 예산서 공세적 대위성(ASAT)·'통합 우주화력'을 최우선 요구",
      "src": "https://asiatimes.com/2026/08/us-anti-satellite-push-revs-up-space-arms-race-with-china-russia/",
      "actors": [
       "미국",
       "중국",
       "러시아"
      ]
     },
     {
      "d": "2026-10-02",
      "x": "중국 국가연계 해커, 아시아 AI전문가·정부기관 피싱(경제학자 사칭); 'Antino' 백도어로 8개국 350개 엔드포인트 침해",
      "src": "https://cybernewsweekly.substack.com/p/cybersecurity-news-review-week-40-06f",
      "actors": [
       "중국"
      ]
     },
     {
      "d": "2026-10-02",
      "x": "중국 연계 TA419, 미국 AI정책 전문가 표적 스파이 캠페인; 미 국방부 DMDC 300만명 PII 유출 통지",
      "src": "https://gbhackers.com/weekly-cybersecurity-newsletter-september-28-october-2-2026/",
      "actors": [
       "중국",
       "미국"
      ]
     },
     {
      "d": "2026-01-26",
      "x": "라트비아-고틀란드 광케이블 손상, 스웨덴이 몰타 선적 Vezhen호 나포; 1.2 리투아니아-라트비아 케이블 손상도 수사",
      "src": "https://thebulletin.org/2026/02/seabed-zero-baltic-sabotage-and-the-global-risks-to-undersea-infrastructure/",
      "actors": [
       "러시아",
       "스웨덴",
       "라트비아"
      ]
     },
     {
      "d": "2026-08-15",
      "x": "호주 퍼스 앞 SUBCO 케이블 2개 연속 장애, 의심 선박 활동 지목(미기소); 대만-마쭈 3호 케이블은 중국 인양선 작업 중 손상·선원 11명 구금",
      "src": "https://referently.com/undersea-cable-damage-log-baltic-sea-taiwan-red-sea-and-australia-incidents-since-2023/",
      "actors": [
       "호주",
       "대만",
       "중국"
      ]
     }
    ],
    "metrics": [
     {
      "l": "중국군 접근 ISR 위성",
      "v": "510개+",
      "d": "2026-09-02",
      "n": "미 우주군 평가",
      "src": "https://www.usnews.com/news/top-news/articles/2026-09-02/us-china-arm-for-space-warfare-hunter-satellites-and-orbital-weapons"
     },
     {
      "l": "그린란드 신규 미군 기지",
      "v": "2곳",
      "d": "2026-09-22",
      "n": "나르사르수아크·메스테르스비 + 피투피크 확장",
      "src": "https://www.usnews.com/news/national-news/articles/2026-09-22/u-s-denmark-greenland-security-deal-whats-in-the-agreement"
     }
    ]
   },
   {
    "id": "south",
    "title": "글로벌 사우스 정렬",
    "status": "BRICS 뉴델리 선언은 미국 명시 없이 무역전쟁만 비판하고 이란 공습 규탄도 회피하는 등 '비선택' 기조; 걸프는 미 보호의 한계를 체감하며 헤징 심화, 인도-중국 국경 안정화, 러 아프리카군단은 말리서 후퇴, 미국은 카리브 선박 타격 71회로 서반구 강압 지속.",
    "trend": "flat",
    "facts": [
     {
      "d": "2026-09-13",
      "x": "제18차 BRICS 뉴델리 정상회의 선언 합의 채택: 결제 TF·현지통화 결제, 미국 미명시 무역전쟁 비판, 중동 자제 촉구(미·이스라엘 공습 미규탄); 모디 'BRICS는 누구에도 반대 않는다'",
      "src": "https://www.aljazeera.com/news/2026/9/13/brics-summit-2026-what-are-the-key-takeaways",
      "actors": [
       "인도",
       "중국",
       "러시아",
       "브라질"
      ]
     },
     {
      "d": "2026-09-25",
      "x": "FP: 걸프국 '헤징하며 고통'—5월 사우디, 호르무즈 호송작전용 기지·영공 사용 거부로 미 작전 취소; 대이란 백채널 유지",
      "src": "https://foreignpolicy.com/2026/09/25/gulf-states-iran-trump-oil-energy-hormuz/",
      "actors": [
       "사우디",
       "UAE",
       "미국",
       "이란"
      ]
     },
     {
      "d": "2026-04-23",
      "x": "이란전으로 중국 호르무즈 경유 원유 수입 4.45mbd→0.22mbd 급감; 인도-중국 러시아 원유 확보 경쟁 격화",
      "src": "https://www.cnbc.com/2026/04/23/india-china-russian-oil-supply-strait-hormuz-disruption.html",
      "actors": [
       "중국",
       "인도",
       "러시아"
      ]
     },
     {
      "d": "2026-09-13",
      "x": "모디-시진핑 BRICS 계기 양자회담, 국경 평화 유지·경제협력 재확인; 인도 주최 Quad 정상회의는 여전히 미정",
      "src": "https://theprint.in/diplomacy/india-hosted-quad-leaders-summit-overdue-but-no-invites-sent-yet-as-us-signals-low-interest/2909787/",
      "actors": [
       "인도",
       "중국",
       "미국"
      ]
     },
     {
      "d": "2026-08-20",
      "x": "HRW: 러 아프리카군단 말리 민간인 9명 학살·가옥 방화; 4~6월 FLA·JNIM 공세로 키달·테살리트 철수, 7.18 가오 매복 50명+ 사망",
      "src": "https://www.hrw.org/news/2026/08/20/mali-russias-africa-corps-massacres-villagers",
      "actors": [
       "러시아",
       "말리",
       "JNIM"
      ]
     },
     {
      "d": "2026-10-04",
      "x": "미 남부사령부, 카리브해 마약 의심 선박 타격 4명 사망—71번째 공격, 누적 사망 239명",
      "src": "https://www.southcom.mil/News/PressReleases/Article/4618776/lethal-kinetic-strike-october-4-2026/",
      "actors": [
       "미국"
      ]
     },
     {
      "d": "2026-09-24",
      "x": "베네수엘라 과도대통령 델시 로드리게스, UN서 선거 약속하되 날짜 미제시; 미국은 3,000억달러 부채 재조정 선결 입장, 석유·금광 거래 체결",
      "src": "https://www.aljazeera.com/news/2026/9/24/venezuelas-delcy-rodriguez-promises-elections-at-un-gives-no-date",
      "actors": [
       "베네수엘라",
       "미국"
      ]
     }
    ],
    "metrics": [
     {
      "l": "미 선박 타격 누적",
      "v": "71회/239명 사망",
      "d": "2026-10-04",
      "n": "2025.9 개시, 마두로 축출(1월) 후 지속",
      "src": "https://www.southcom.mil/News/PressReleases/Article/4618776/lethal-kinetic-strike-october-4-2026/"
     },
     {
      "l": "말리 아프리카군단 병력",
      "v": "약 2,000명",
      "d": "2026-06-15",
      "n": "북부 철수 후 바마코 방어·항공지원 중심",
      "src": "https://adf-magazine.com/2026/06/africa-corps-shifts-tactics-in-mali/"
     },
     {
      "l": "중국 호르무즈 경유 원유 수입",
      "v": "0.22mbd(전쟁 전 4.45)",
      "d": "2026-04-23",
      "n": "4월 기준",
      "src": "https://www.cnbc.com/2026/04/23/india-china-russian-oil-supply-strait-hormuz-disruption.html"
     }
    ]
   },
   {
    "id": "politics",
    "title": "선거·정치 변수",
    "status": "11.3 미 중간선거(민주당 하원 다수 전망)와 11.28 대만 지방선거가 미·중·대만 삼각관계의 정치적 변곡점으로 부상; 중국은 대만 선거 개입 TF를 논의했고 리투아니아 핵·기지 결정은 2027년 1월로 이월.",
    "trend": "up",
    "facts": [
     {
      "d": "2026-10-06",
      "x": "미 중간선거(11.3) 앞두고 민주당 하원 다수 탈환 예측 보도; 전직 중국 외교관 '민주당 의회가 대만·신장서 더 강경 압박' 전망",
      "src": "https://www.dropsitenews.com/p/saudi-turkey-pakistan-defense-mecca-democrats-house-ethiopia-fighting",
      "actors": [
       "미국"
      ]
     },
     {
      "d": "2026-10-05",
      "x": "SCMP: 미 중간선거가 미·중 관계에 '새로운 변동성' 초래 경고(베테랑 외교관)",
      "src": "https://www.scmp.com/news/china/diplomacy/article/3356583/us-midterms-could-bring-renewed-volatility-china-ties-veteran-diplomat-warns",
      "actors": [
       "미국",
       "중국"
      ]
     },
     {
      "d": "2026-05-15",
      "x": "중국 2월 대만공작회의서 11월 대만 지방선거 개입 TF 설치 논의 보도; 농산물 구매·단체관광 등 지방 유인책 예상",
      "src": "https://globaltaiwan.org/2026/05/taiwans-2026-local-elections-key-prc-cognitive-warfare/",
      "actors": [
       "중국",
       "대만"
      ]
     },
     {
      "d": "2026-10-05",
      "x": "디플로맷: 11.28 대만 9합1 지방선거는 중국·라이·미국 쟁점 아닌 지역 이슈 중심—2028 대선 전초전; 국민당-민중당 연합 시험대",
      "src": "https://thediplomat.com/2026/10/taiwans-local-elections-are-not-about-china-president-lai-or-the-united-states/",
      "actors": [
       "대만"
      ]
     },
     {
      "d": "2026-09-30",
      "x": "한국 국정원, 젤렌스키의 북한군 포로 이송 공개는 한국 내 우크라 지원 여론 조성 의도로 평가—한·우크라 신뢰 손상",
      "src": "https://www.washingtonpost.com/world/2026/09/30/south-korea-ukraine-north-russia-pow/0b74a6ec-bc9c-11f1-81fc-9b76f8343b6c_story.html",
      "actors": [
       "한국",
       "우크라이나"
      ]
     },
     {
      "d": "2026-03-15",
      "x": "다카이치 압승 후 일본 안보정책: 2% 조기 달성, 12월까지 안보 3문서 개정 예정",
      "src": "https://carnegieendowment.org/research/2026/03/takaichis-security-agenda-after-the-landslide-election",
      "actors": [
       "일본"
      ]
     }
    ],
    "metrics": [
     {
      "l": "미 중간선거",
      "v": "2026-11-03",
      "d": "2026-10-06",
      "n": "상·하원 다수당 결정",
      "src": "https://bipartisanpolicy.org/article/the-2026-midterms-key-dates-and-events/"
     },
     {
      "l": "대만 지방선거",
      "v": "2026-11-28",
      "d": "2026-10-05",
      "n": "6개 직할시·16개 현시, 9합1",
      "src": "https://en.wikipedia.org/wiki/2026_Taiwanese_local_elections"
     }
    ]
   }
  ],
  "blocs": {
   "west": [
    "미국",
    "영국",
    "프랑스",
    "독일",
    "폴란드",
    "리투아니아",
    "에스토니아",
    "라트비아",
    "덴마크",
    "그린란드",
    "일본",
    "한국",
    "호주",
    "캐나다",
    "대만",
    "필리핀",
    "우크라이나"
   ],
   "axis": [
    "중국",
    "러시아",
    "북한",
    "이란",
    "말리 군정",
    "후티"
   ],
   "hedgers": [
    "인도",
    "사우디아라비아",
    "UAE",
    "카타르",
    "오만",
    "터키",
    "파키스탄",
    "브라질",
    "남아프리카공화국",
    "베네수엘라(과도정부)",
    "몽골",
    "스페인"
   ]
  },
  "judgments": [
   "미·중은 정상급 '전략적 안정' 틀로 긴장을 관리하지만 핵심 쟁점은 11월~1월 데드라인에 묶여 있어 휴전은 취약하다 (근거: 11.10 희토류 유예·1.10 무역휴전 만료, 140억달러 대만 무기판매 보류, 10.3 스카버러 J-16 근접위협).",
   "러-북-이란 군사협력은 보급로·장기계약으로 제도화 단계에 진입했으나 중-러 축은 PoS-2 가격 교착과 중국의 선택적 참여로 경제적 한계가 뚜렷하다 (근거: 9.7 두만강 교량, 카스피해 TNT 보급, Verba 500기 계약 vs 가스 50/250달러 격차).",
   "핵 질서는 조약 없는 상태로 고착되며 중국 증강·이란 농축우라늄 미확인·발트 핵배치 논의가 겹쳐 군비통제 공백이 구조화되고 있다 (근거: 10.6 미 중앙제한 거부, SIPRI 620발, IAEA 안보리 회부, 리투아니아 헌법개정 1독회).",
   "미 전력이 CENTCOM으로 쏠리는 사이 유럽 전진배치는 취약성을 드러냈고 동맹들은 자체 억제력으로 보완하는 '분산 억제'로 이동 중이다 (근거: 10.4 B-1 철수, 중동 항모 1척→증원, 10.5 메카 동맹 발동, 유럽 2.53%·일본 8.9조엔).",
   "글로벌 사우스는 진영 선택 대신 헤징을 심화하며 미국 중심 질서의 구심력이 약화되고 있다 (근거: BRICS 선언 미국 미명시, 사우디 호르무즈 작전 기지 거부, 모디-시 국경 안정화, Quad 정상회의 미정)."
  ],
  "calendar": [
   {
    "d": "2026-10-10",
    "x": "대만 국경일 라이칭더 연설—2024년 Joint Sword-2024B 전례상 PLA 대응 훈련 가능성 주시",
    "src": "https://taiwansecuritymonitor.substack.com/p/taiwan-security-monitor-weekly-september-f35"
   },
   {
    "d": "2026-11-03",
    "x": "미국 중간선거—상·하원 다수당 변화 시 대중·대만 정책 강경화 가능",
    "src": "https://bipartisanpolicy.org/article/the-2026-midterms-key-dates-and-events/"
   },
   {
    "d": "2026-11-10",
    "x": "중국 희토류 수출통제 1년 유예 만료—연장 여부 미정",
    "src": "https://www.clarkhill.com/news-events/news/china-hits-pause-on-rare-earth-export-controls-and-what-it-means-for-supply-chains/"
   },
   {
    "d": "2026-11-27",
    "x": "중국의 대미 갈륨·게르마늄·안티몬 수출금지 유예(공고 46호 2조) 만료",
    "src": "https://www.clarkhill.com/news-events/news/china-hits-pause-on-rare-earth-export-controls-and-what-it-means-for-supply-chains/"
   },
   {
    "d": "2026-11-28",
    "x": "대만 9합1 지방선거(6직할시·16현시)",
    "src": "https://en.wikipedia.org/wiki/2026_Taiwanese_local_elections"
   },
   {
    "d": "2026-12-31",
    "x": "골든돔 우주배치 요격체 첫 시험(연내 예정); 일본 안보 3문서·방위력정비계획 개정 기한",
    "src": "https://www.armyrecognition.com/news/army-news/2026/pentagon-golden-dome-space-interceptor-tests-2026"
   },
   {
    "d": "2027-01-10",
    "x": "미·중 무역휴전 연장 만료",
    "src": "https://www.pbs.org/newshour/world/china-and-u-s-agree-to-establish-ai-safety-channel-and-continue-trade-and-military-talks"
   },
   {
    "d": "2027-01-12",
    "x": "리투아니아 WMD 배치 금지 헌법조항 폐지 최종 표결",
    "src": "https://www.cnbc.com/2026/10/06/russia-ukraine-lithuania-trump-nato.html"
   }
  ],
  "gaps": [
   "2026년 10월 미 상무부(BIS)의 신규 대중 반도체 수출통제 조치는 검색되지 않음(최신은 5.31 역외 중국기업 지침)",
   "2026년 9월 러·중 해상 합동훈련은 확인되지 않음(Joint Sea-2026은 7월, 9월은 Tsentr-2026 지상훈련)",
   "10월 7~8일 기준 호르무즈 해협·미-이란 휴전 협상 현황은 8월 중순 이후 보도 미확인",
   "북한 2026년 미사일 발사 '16회' 공식 집계 미확인(한국 집계 8.12 기준 11회, 이후 최소 3회 추가)",
   "10월 헤그세스-둥쥔 접촉, 미·중 군사소통 채널 실제 가동 여부 미확인",
   "쿠르스크 북한군 9~10월 현재 병력 수치 없음(2월 국정원 1.1만 추정만 확보)",
   "우크라이나 안전보장 '의지의 연합' 9~10월 회의·진전 미확인(최신 1월 파리 선언)",
   "미중 300억달러 관세 인하의 미측 품목·세율 공식 발표 미확인",
   "Quad 정상회의 일정, 10월 인도-미국 양자 동향 미확인",
   "9~10월 러·중 국가배후 '대형' 사이버공격의 공식 귀속 보고서(CISA/FBI) 미확인—업계 주간 요약에 의존"
  ]
 }
};
