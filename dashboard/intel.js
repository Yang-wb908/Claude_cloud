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
/* 상품 시장 조사(4차) */
INTEL.cm = {
 "energy": {
  "groups": [
   {
    "id": "crude",
    "title": "원유 (Brent/WTI/Dubai·재고·OPEC+)",
    "metrics": [
     {
      "l": "Brent 선물 (ICE 근월) 정산",
      "v": "$100.20/bbl",
      "d": "2026-10-07",
      "chg": "-$0.38 (-0.38%)",
      "trend": "down",
      "n": "IEA 비축유 방출 가속 합의로 하락, 10/8 장중 $101.5~102.5로 반등(호르무즈 유조선 공격)",
      "src": "https://www.cnbc.com/2026/10/07/oil-prices-today-brent-wti-hormuz.html"
     },
     {
      "l": "WTI 선물 (NYMEX 근월) 정산",
      "v": "$88.28/bbl",
      "d": "2026-10-07",
      "chg": "-$1.16 (-1.3%)",
      "trend": "down",
      "n": "10/8 장중 ~$89.4; 멕시코만 허리케인 대비 생산 셧인 시작",
      "src": "https://au.investing.com/news/commodities-news/oil-rises-as-middle-east-supply-concerns-persist-amid-shipping-attacks-4678422"
     },
     {
      "l": "DME Oman 원유",
      "v": "$105.79/bbl",
      "d": "2026-10-02",
      "chg": "9월 평균 $112.36 (범위 94.3~131.0)",
      "trend": "down",
      "n": "중동 사워 벤치마크가 Brent 대비 프리미엄 유지 (걸프 공급 리스크 집중)",
      "src": "https://cbonds.com/indexes/189217/"
     },
     {
      "l": "Brent-WTI 스프레드",
      "v": "$13.80/bbl",
      "d": "2026-10-06",
      "chg": "10/1 $14 초과 → 10/7 정산 기준 ~$12",
      "trend": "flat",
      "n": "걸프발 해상운임 ~$33/bbl이 해상 벤치마크 Brent를 WTI 대비 밀어올림",
      "src": "https://www.vantagemarkets.com/market-analysis/why-brent-held-premium-over-wti-tanker-freight-record-october-5-9-2026/"
     },
     {
      "l": "Brent-Dubai EFS",
      "v": "$7.57/bbl",
      "d": "2026-10-06",
      "chg": "일중 약 -$2",
      "trend": "down",
      "n": "Dubai Nov/Dec 스프레드 $3.30→$2.70로 완화; 사우디 OSP 인하 반영",
      "src": "https://discoveryalert.com.au/crude-oil-price-spread-mechanics-2026/"
     },
     {
      "l": "Dated Brent (현물) / 물리적 프리미엄",
      "v": "$125.53/bbl, 차익 $19.105/bbl (사상최고)",
      "d": "2026-10-07",
      "chg": "9/18 ICE 근월 대비 +$21.55",
      "trend": "up",
      "n": "선물 $100 근처 vs 현물 $120+ — 물리적 타이트니스가 선물 곡선보다 훨씬 심각",
      "src": "https://no1sdailydigest.substack.com/p/daily-digest-2026-10-07"
     },
     {
      "l": "EIA 상업용 원유재고",
      "v": "424.1백만 bbl",
      "d": "2026-10-02",
      "chg": "-3.186백만 bbl (예상 +1.9)",
      "trend": "down",
      "n": "5년 평균 대비 +1%; 예상외 감소로 유가 지지",
      "src": "https://www.oilandgas360.com/crude-inventories-10-2-2/"
     },
     {
      "l": "EIA 휘발유 재고",
      "v": "5년 평균 대비 -6%",
      "d": "2026-10-02",
      "chg": "+0.4백만 bbl",
      "trend": "up",
      "n": "휘발유 생산 9.3 mb/d, 소비 8.8 mb/d (-0.3% y/y)",
      "src": "https://www.oilandgas360.com/crude-inventories-10-2-2/"
     },
     {
      "l": "EIA 중간유분(디젤) 재고",
      "v": "5년 평균 대비 -12%",
      "d": "2026-10-02",
      "chg": "전주비 변동 없음(예상 증가)",
      "trend": "flat",
      "n": "4주 평균 소비 3.8 mb/d; 디젤 타이트니스 지속",
      "src": "https://www.oilandgas360.com/crude-inventories-10-2-2/"
     },
     {
      "l": "Cushing 재고 변동",
      "v": "+0.444백만 bbl",
      "d": "2026-10-02",
      "chg": "전주 +0.553",
      "trend": "up",
      "n": "9/25 기준 수준 24.3백만 bbl (2차 소스)",
      "src": "https://www.newsquawk.com/headlines/eia-cushing-crude-oil-stocks-change-oct02-0444m-prev-0553m"
     },
     {
      "l": "미 SPR 잔량",
      "v": "283.0백만 bbl",
      "d": "2026-10-02",
      "chg": "-0.8백만 bbl (283.8→283.0)",
      "trend": "down",
      "n": "IEA 400mb 비상방출 계획에 따른 지속 매각",
      "src": "https://vtmarkets.com/en-eu/live-updates/eia-data-show-surprise-distillate-stock-draw-tightening-diesel-and-heating-oil-supply-outlook"
     },
     {
      "l": "미 정제가동률",
      "v": "92.7%",
      "d": "2026-10-02",
      "chg": "9/11 96.8% → 9/25 92.5% → 92.7%",
      "trend": "flat",
      "n": "가을 정기보수 구간; 제품 재고 회복 제한",
      "src": "https://vtmarkets.com/en-eu/live-updates/eia-data-show-surprise-distillate-stock-draw-tightening-diesel-and-heating-oil-supply-outlook"
     },
     {
      "l": "EIA STEO Brent 전망 (4Q26)",
      "v": "$105/bbl (2026 평균 $96.32)",
      "d": "2026-10-06",
      "chg": "전월 STEO 대비 +$14",
      "trend": "up",
      "n": "2Q27 $87 → 4Q27 $74로 하락 경로; 중동 생산 2Q27 말 정상화 가정",
      "src": "https://www.trend.az/business/4231907.html"
     },
     {
      "l": "EIA 글로벌 재고 변동",
      "v": "3Q26 -1.9 mb/d, 4Q26 -0.7 mb/d",
      "d": "2026-10-06",
      "chg": "9월 STEO는 -3.0/-1.7 전망",
      "trend": "down",
      "n": "재고 감소폭 축소 추정이나 여전히 역대급 draw",
      "src": "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf"
     },
     {
      "l": "OPEC+ 7개국 8월 생산",
      "v": "25.0 mb/d",
      "d": "2026-08-31",
      "chg": "+630 kb/d m/m, 전쟁 전(2월) 대비 -5 mb/d",
      "trend": "up",
      "n": "걸프 수출 평시의 60~80%; 쿼터 증산은 '서류상' 증산",
      "src": "https://www.cnbc.com/2026/10/04/opec-agrees-to-keep-november-oil-output-targets-steady.html"
     },
     {
      "l": "OPEC 12 8월 생산 변동",
      "v": "+346 kb/d (이라크 +664, 이란 -399, 사우디 -75)",
      "d": "2026-09-10",
      "chg": "OPEC MOMR 9월호",
      "trend": "up",
      "n": "사우디 8월 생산 OPEC 7.27 vs IEA 5.97 mb/d로 통계 불일치",
      "src": "https://peakoilbarrel.com/opec-monthly-oil-market-report-september-2026/"
     },
     {
      "l": "사우디 11월 OSP Arab Light 아시아",
      "v": "Oman/Dubai -$5.00/bbl",
      "d": "2026-10-05",
      "chg": "-$3 m/m (2020년 6월 이후 최대 할인)",
      "trend": "down",
      "n": "시장 예상(+$5 인상)과 정반대; VLCC 운임 $1.2m/일 보전·시장점유 방어 목적, 유럽은 +$3",
      "src": "https://gulfbusiness.com/en/2026/saudi-arabia/saudi-aramco-cuts-asia-oil-prices-six-year-low/"
     },
     {
      "l": "러시아 해상 원유수출 (4주 평균)",
      "v": "3.71 mb/d (최종주 3.99)",
      "d": "2026-09-27",
      "chg": "8월 초 이후 최고, 7월 피크 4.2 대비 하락",
      "trend": "up",
      "n": "디젤 수출금지로 원유 수출 확대; 주간 수출액 $27.5억",
      "src": "https://www.themoscowtimes.com/2026/09/29/russias-crude-exports-rise-as-diesel-ban-limits-gains-from-higher-oil-prices-a93821"
     },
     {
      "l": "Urals 인도 인도분 vs Dated Brent",
      "v": "10월 인도분 최대 +$1 프리미엄",
      "d": "2026-09-30",
      "chg": "9월 인도분 -$1~2 할인 → 프리미엄 전환",
      "trend": "up",
      "n": "중동 공급 차질로 러시아산 할인 소멸 (6월엔 -$2~3)",
      "src": "https://www.marinelink.com/news/maritime/urals"
     },
     {
      "l": "이란 원유 선적",
      "v": "0 bbl (9월)",
      "d": "2026-09-30",
      "chg": "8월 220~255 kb/d → 0; 3월 ~2 mb/d",
      "trend": "down",
      "n": "7/14 미 해상봉쇄 이후 돌파 0건; Kpler 2013년 집계 이래 최초 0",
      "src": "https://www.briefs.co/news/iran-s-september-crude-loadings-dropped-to-zero-as-us-blocka/"
     },
     {
      "l": "이란 봉쇄선 밖 해상재고",
      "v": "~10백만 bbl",
      "d": "2026-10-06",
      "chg": "7월 ~100백만 bbl에서 급감",
      "trend": "down",
      "n": "중국向 ~1 mb/d 인도 중, 10월 말 소진 전망 → 중국 독립정유사 원료 공백",
      "src": "https://edition.cnn.com/2026/10/06/business/iran-economy-blockade-strait-of-hormuz-oil"
     },
     {
      "l": "걸프 원유수출(이란 제외)",
      "v": "≥16.5 mb/d (9월 평균)",
      "d": "2026-09-30",
      "chg": "전쟁 전 대비 ~80% 회복",
      "trend": "up",
      "n": "호르무즈 물리적 통과는 2025년 흐름의 40%; 오만만·홍해 우회 비중 확대",
      "src": "https://www.cnbc.com/2026/09/30/iran-war-strait-hormuz-gulf-oil-fuel.html"
     },
     {
      "l": "호르무즈 통과 선박 (Windward)",
      "v": "13척",
      "d": "2026-10-04",
      "chg": "전주 24척",
      "trend": "down",
      "n": "9/29 이후 유조선 최소 12척 피격; 푸자이라 STS 환적 증가",
      "src": "https://gcaptain.com/irans-offshore-oil-stockpile-nears-exhaustion-as-blockade-chokes-new-supply"
     },
     {
      "l": "걸프 해상 원유(floating+transit)",
      "v": "~130백만 bbl",
      "d": "2026-09-30",
      "chg": "4월 말 적체 피크 104mb 이후 정상화",
      "trend": "flat",
      "n": "Kpler: MoU 60일간 374mb 소화, 그러나 호르무즈 재개방 없음",
      "src": "https://www.kpler.com/blog/60-days-of-a-broken-us-iran-mou-the-market-stopped-waiting-for-hormuz"
     },
     {
      "l": "중국 산둥 원유재고",
      "v": "~360백만 bbl (7월 말)",
      "d": "2026-07-31",
      "chg": "7월 -35mb, 2016년 집계 이래 최대 월간 감소",
      "trend": "down",
      "n": "Bloomberg(9/9): 티팟 가동률 수주 내 추가 감축 가능 → 수입수요 약화",
      "src": "https://www.bloomberg.com/news/articles/2026-09-09/china-s-teapots-may-cut-run-rates-in-blow-to-crude-import-demand"
     },
     {
      "l": "VLCC 스팟운임 (오만만 적재)",
      "v": "$1.162백만/일",
      "d": "2026-10-07",
      "chg": "9/10 ~$800k → $1m 돌파",
      "trend": "up",
      "n": "전쟁위험보험 선가의 6~10%; 아시아 정유사 원가 압박",
      "src": "https://breakbulk.news/vlcc-rates-top-1-million-a-day-as-hormuz-attacks-lift-gulf-risk-premium/"
     }
    ],
    "drivers": [
     "호르무즈 유조선 공격 주간 최다(9/29~) → 지정학 프리미엄·운임 급등으로 Brent $100 지지",
     "IEA 비축유 방출 가속·디젤 우선 방출(10/7)·G7 100mb → 단기 선물 상단 억제",
     "미 원유재고 예상외 -3.2mb, 글로벌 재고 3Q -1.9 mb/d draw → 현물 타이트니스(Dated $125)",
     "OPEC+ 11월 동결(10/4), 실제 생산은 쿼터 하회 → 증산 여력 실효성 낮음"
    ],
    "risks": [
     "이란 해상재고 10월 말 소진 → 중국 티팟 원료 공백·대체 수요 vs 수요파괴 동시 진행",
     "멕시코만 열대성폭풍 Isaias 셧인 확대 시 WTI 단기 스파이크·Brent-WTI 축소",
     "미-이란 교섭/휴전 재개 시 백워데이션 급격 해소(6월 MoU 당시 급락 선례)"
    ],
    "dev": [
     {
      "d": "2026-10-08",
      "x": "Brent $101.5~102.5 반등, 호르무즈 유조선 공격 주간 최다·미 GoM 셧인",
      "src": "https://oilprice.com/Latest-Energy-News/World-News/Oil-Jumps-2-as-Iran-Steps-Up-Attacks-on-Hormuz-Tankers.html"
     },
     {
      "d": "2026-10-07",
      "x": "IEA 회원국 비축유 방출 가속·디젤 우선 합의, Brent $100.20 정산",
      "src": "https://www.cnbc.com/2026/10/07/oil-prices-today-brent-wti-hormuz.html"
     },
     {
      "d": "2026-10-06",
      "x": "EIA STEO: 4Q26 Brent $105 (+$14), 2026 평균 $96.32",
      "src": "https://www.trend.az/business/4231907.html"
     },
     {
      "d": "2026-10-05",
      "x": "아람코 11월 OSP 아시아 -$3 (Arab Light -$5 vs O/D, 6년 최저), 유럽 +$3",
      "src": "https://energynow.com/2026/10/saudi-arabia-unexpectedly-cuts-november-oil-prices-to-asia-to-6-year-lows/"
     },
     {
      "d": "2026-10-04",
      "x": "OPEC+ 7개국 11월 생산목표 동결, 차기회의 11/1, 2027 쿼터용 생산능력 평가 지연",
      "src": "https://www.cnbc.com/2026/10/04/opec-agrees-to-keep-november-oil-output-targets-steady.html"
     },
     {
      "d": "2026-09-30",
      "x": "Kpler/Vortexa: 이란 9월 원유 선적 0, 걸프 수출(이란 제외) 16.5 mb/d",
      "src": "https://www.cnbc.com/2026/09/30/iran-war-strait-hormuz-gulf-oil-fuel.html"
     }
    ]
   },
   {
    "id": "products",
    "title": "석유제품 (크랙·디젤/제트)",
    "metrics": [
     {
      "l": "미국 3-2-1 크랙",
      "v": "$65.10/bbl",
      "d": "2026-10-06",
      "chg": "8월 월평균 $65.61 (2006년 6월 이후 최고)",
      "trend": "flat",
      "n": "정제마진 역대급 유지",
      "src": "https://rbnenergy.com/market-data/3-2-1-crack-spread"
     },
     {
      "l": "미국 디젤(ULSD) 크랙 사상최고",
      "v": "$102.20/bbl",
      "d": "2026-08-17",
      "chg": "8월 평균 ~$94.73 (2022.10 고점 $94.94 근접)",
      "trend": "up",
      "n": "걸프·우크라이나 전쟁+러 정유시설 피격+러 디젤수출 제한",
      "src": "https://dieselnet.com/news/2026/08diesel-crack.php"
     },
     {
      "l": "USGC 제트 크랙 vs WTI",
      "v": "$72.51/bbl (8월)",
      "d": "2026-08-31",
      "chg": "시리즈 고점",
      "trend": "up",
      "n": "디젤/제트 동반 타이트; 10월 수치 미확인",
      "src": "https://globaloilshock.com/en/data/crack-spread-chart/"
     },
     {
      "l": "USGC 휘발유 크랙",
      "v": "$51.05/bbl (8월)",
      "d": "2026-08-31",
      "chg": "7월 $54.86 대비 하락",
      "trend": "down",
      "n": "휘발유는 디젤 대비 상대적 약세",
      "src": "https://globaloilshock.com/en/data/crack-spread-chart/"
     },
     {
      "l": "NWE ICE 가스오일 크랙 / 싱가포르 가스오일 크랙",
      "v": "~$78 / ~$72/bbl (8월 말)",
      "d": "2026-08-31",
      "chg": "NWE 8월 고점 ~$95",
      "trend": "down",
      "n": "중동 제품수출 제약 지속",
      "src": "https://energynewsbeat.co/downstream/asia-europe-and-us-diesel-crack-spreads-are-on-fire-what-does-this-mean-for-consumers-and-investors/"
     },
     {
      "l": "미 중간유분 재고 (5년평균 대비)",
      "v": "-12%",
      "d": "2026-10-02",
      "chg": "변동 없음",
      "trend": "flat",
      "n": "EIA STEO: 전망기간 내내 2021~25 평균 하회",
      "src": "https://www.oilandgas360.com/crude-inventories-10-2-2/"
     }
    ],
    "drivers": [
     "IEA 디젤 우선 비축방출(10/7) → 디젤 크랙 단기 상단 압박",
     "러시아 디젤 수출금지·정유시설 피격 지속 → 유럽 중간유분 공급 부족",
     "미 정제가동률 92.7%(보수기) → 제품 재고 회복 지연",
     "미 디젤 수출 제한 논의(RBN) → 미국내 크랙 하락·해외 크랙 상승 리스크"
    ],
    "risks": [
     "미국 디젤 수출 제한 현실화 시 대서양 디젤 스프레드 급변",
     "난방철 진입·농번기 겹치며 중간유분 재고 5년 최저권 심화",
     "고유가발 수요파괴로 휘발유 크랙 추가 압축"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "IEA 회원국, 디젤 재고 우선 방출 합의 (3월 400mb 계획의 일부라는 해석)",
      "src": "https://www.cnbc.com/2026/10/07/oil-prices-today-brent-wti-hormuz.html"
     },
     {
      "d": "2026-09-29",
      "x": "러시아 디젤 수출 금지 지속, 원유 수출로 전환",
      "src": "https://www.themoscowtimes.com/2026/09/29/russias-crude-exports-rise-as-diesel-ban-limits-gains-from-higher-oil-prices-a93821"
     }
    ]
   },
   {
    "id": "gas",
    "title": "천연가스/LNG (HH·TTF·JKM·EU 저장)",
    "metrics": [
     {
      "l": "Henry Hub 11월물",
      "v": "$3.197/MMBtu (장중)",
      "d": "2026-10-07",
      "chg": "+$0.083 (+2.67%), 전일 종가 $3.114",
      "trend": "up",
      "n": "4일 연속 상승; 열대성폭풍 Isaias·생산 둔화·수요 전망 상향",
      "src": "https://fxempire.com/forecasts/article/natural-gas-news-isaias-has-shorts-covering-as-november-gas-tests-resistance-1636398"
     },
     {
      "l": "EU TTF 근월물",
      "v": "€75.69/MWh",
      "d": "2026-10-07",
      "chg": "9월 중순 고점 €84 (2022.12 이후 최고)",
      "trend": "up",
      "n": "NBP 11월물 주간 +7%; 카타르 FM·저장 부족이 지지",
      "src": "https://prestigebusiness.energy/marketreports/energy-market-update07-oct2026"
     },
     {
      "l": "아시아 JKM",
      "v": "$25.79/MMBtu",
      "d": "2026-10-07",
      "chg": "+$0.84",
      "trend": "up",
      "n": "NWE LNG $24.38 — 대서양 아비트라지 열림, 미 LNG 수출 유인 극대",
      "src": "https://prestigebusiness.energy/marketreports/energy-market-update07-oct2026"
     },
     {
      "l": "EU 가스저장률 (GIE AGSI+)",
      "v": "71.3% (9월 말) / 72.83% (10/5)",
      "d": "2026-10-05",
      "chg": "전년 82.5%, 2024년 94.2%",
      "trend": "up",
      "n": "11/1 목표 90%→80%(최대 -4%p 유예)로 완화; 현 추세 종료 ~75~78%",
      "src": "https://www.businesstoday.in/world/story/europe-enters-winter-with-gas-storage-at-71-raising-fears-of-supply-shortages-and-higher-prices-559334-2026-10-03"
     },
     {
      "l": "카타르 LNG 불가항력",
      "v": "11월 말까지 연장",
      "d": "2026-09-28",
      "chg": "월 단위 반복 연장 중",
      "trend": "flat",
      "n": "Ras Laffan 3월 피격 후 감산; 8월까지 18카고 vs 전년 509",
      "src": "https://www.thenationalnews.com/business/energy/2026/09/28/qatar-extends-lng-force-majeure-as-hormuz-disruption-threatens-winter-supply/"
     },
     {
      "l": "미 LNG 피드가스",
      "v": "16.9 bcfd (10월 누계)",
      "d": "2026-10-06",
      "chg": "9월 17.9, 4월 기록 18.8",
      "trend": "down",
      "n": "Freeport 보수 영향; 10/6 17.6 bcfd로 회복 예상",
      "src": "https://brecorder.com/news/40442813/us-natgas-higher-as-demand-forecasts-rise"
     },
     {
      "l": "미 가스저장 (EIA)",
      "v": "3,415 Bcf",
      "d": "2026-09-25",
      "chg": "+64 Bcf; 전년比 -3.9%, 5년평균比 +2.4%",
      "trend": "up",
      "n": "10/2주 예상 +79 Bcf (5년평균 +96 하회); STEO 9월말 3,523 Bcf",
      "src": "https://tradingeconomics.com/united-states/natural-gas-stocks-change"
     },
     {
      "l": "EIA STEO Henry Hub 전망",
      "v": "$3.16/MMBtu 평균",
      "d": "2026-10-06",
      "chg": "6~8월 실적 $2.93",
      "trend": "up",
      "n": "10월 말 저장 ~4 Tcf 근접 전망",
      "src": "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf"
     }
    ],
    "drivers": [
     "카타르 FM 연장(11월 말)·호르무즈 차질 → TTF/JKM $24~26 고착",
     "EU 저장 71~73%로 7년 최저 → 겨울 인출 리스크 프리미엄",
     "미 HH는 저장 5년평균 상회로 $3 초반 — 국제가와 디커플링, LNG 수출 유인 최대",
     "열대성폭풍 Isaias로 멕시코만 생산·LNG 터미널 단기 교란"
    ],
    "risks": [
     "한파 조기 도래 시 EU 저장 인출 가속 → TTF €90+ 재시도",
     "미 LNG 터미널 허리케인 피해 시 HH 하락·TTF 상승 동시 발생",
     "카타르 Ras Laffan 복구 속도가 2027 상반기 수급 좌우"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "HH 4일 연속 상승, 열대성폭풍 Isaias 멕시코만 형성",
      "src": "https://naturalgasintel.com/news/why-is-natural-gas-rallying-in-peak-shoulder-season"
     },
     {
      "d": "2026-09-28",
      "x": "QatarEnergy 아시아·유럽 LNG 불가항력 11월 말까지 연장, Edison은 12월 초",
      "src": "https://www.bloomberg.com/news/articles/2026-09-28/qatar-extends-lng-force-majeure-as-hormuz-disruptions-drag-on"
     }
    ]
   },
   {
    "id": "coal_uranium",
    "title": "석탄·우라늄",
    "metrics": [
     {
      "l": "Newcastle 6,000kcal 석탄",
      "v": "$148.94/t",
      "d": "2026-10-03",
      "chg": "TE 석탄 10/7 $150.25 (-1.28%), 주초 23개월 최고 $152.20",
      "trend": "up",
      "n": "LNG 고가→가스-석탄 전환 수요",
      "src": "https://www.oilpriceapi.com/live/coal-price"
     },
     {
      "l": "API2 (유럽 석탄)",
      "v": "$116.75/t",
      "d": "2026-08-10",
      "chg": "당시 Newcastle 대비 -$12.25",
      "trend": "flat",
      "n": "10월 수치 미확인",
      "src": "https://www.oilpriceapi.com/live/coal-price"
     },
     {
      "l": "우라늄 U3O8 스팟",
      "v": "$89.95/lb",
      "d": "2026-10-06",
      "chg": "10/2 $89.75; 장기가 $97.00",
      "trend": "flat",
      "n": "장기계약가 > 스팟 역전 지속 — 유틸리티 장기계약 수요 견조",
      "src": "https://sparverius.substack.com/p/morning-espresso-oct-06-2026"
     }
    ],
    "drivers": [
     "TTF/JKM 고가로 아시아·유럽 석탄 발전 전환",
     "우라늄 스팟 $90 박스권, 장기가 $97로 역전 구조"
    ],
    "risks": [
     "중국 수력·재생 발전 증가 시 해상 석탄 수요 둔화",
     "우라늄 스팟은 펀드(SPUT) 매수 재개 여부에 좌우"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "석탄 23개월 최고($152.20) 후 소폭 조정",
      "src": "https://tradingeconomics.com/commodity/coal"
     }
    ]
   },
   {
    "id": "precious",
    "title": "귀금속 (금·은·백금·팔라듐)",
    "metrics": [
     {
      "l": "금 현물",
      "v": "$4,109.61/oz",
      "d": "2026-10-07",
      "chg": "-1.32% d/d; 1월 고점 ~$5,595 대비 -26%",
      "trend": "down",
      "n": "실질금리 상승·달러 강세, FOMC 의사록 앞두고 하락",
      "src": "https://tradingeconomics.com/commodity/gold"
     },
     {
      "l": "은 현물",
      "v": "$60.68/oz",
      "d": "2026-10-07",
      "chg": "-1.07% d/d, 월간 -7.7%, 전년比 +24%",
      "trend": "down",
      "n": "Silver Institute 2026 6년 연속 적자(46.3 Moz) 전망이 구조적 지지",
      "src": "https://tradingeconomics.com/commodity/silver"
     },
     {
      "l": "백금 현물",
      "v": "$1,674.10/oz",
      "d": "2026-10-07",
      "chg": "-2.06% d/d, 월간 -8.3%",
      "trend": "down",
      "n": "Heraeus 밴드 $1,300~1,800 상단; 적자 축소 전망",
      "src": "https://tradingeconomics.com/commodity/platinum"
     },
     {
      "l": "팔라듐 현물",
      "v": "$1,168.50/oz",
      "d": "2026-10-07",
      "chg": "소스별 $1,103~1,168",
      "trend": "flat",
      "n": "자동차 촉매 수요 의존, 소스간 편차 큼",
      "src": "https://www.jmbullion.com/charts/palladium-price/"
     },
     {
      "l": "중앙은행 순매입 (WGC 2Q26)",
      "v": "289t",
      "d": "2026-06-30",
      "chg": "+62% y/y (2Q25 177.9t)",
      "trend": "up",
      "n": "1~8월 총매입 595t, 순매입 ~170t로 둔화; 서베이 45%가 추가 매입 의향",
      "src": "https://www.business-standard.com/amp/markets/news/gold-caught-between-central-bank-demand-and-real-yield-pressure-kotak-sec-126100700700_1.html"
     },
     {
      "l": "금 ETF 플로우 (2Q26)",
      "v": "-45t",
      "d": "2026-06-30",
      "chg": "서방 ETF 순유출",
      "trend": "down",
      "n": "실질금리 민감; 10y TIPS 2.5% 근접",
      "src": "https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-q2-2026/outlook"
     },
     {
      "l": "Fed 10월 인상 확률",
      "v": "<20%",
      "d": "2026-10-07",
      "chg": "9월 고용 +29k(예상 84~90k)로 급락",
      "trend": "down",
      "n": "인상 리스크 소멸에도 실질금리 상승이 금 압박",
      "src": "https://www.business-standard.com/amp/markets/news/gold-caught-between-central-bank-demand-and-real-yield-pressure-kotak-sec-126100700700_1.html"
     }
    ],
    "drivers": [
     "실질금리 상승·달러 강세 → 금 $4,100 하향 압력",
     "Fed 인상 확률 <20%로 하락이 하단 지지",
     "중앙은행 매입 견조 vs 서방 ETF 유출의 수급 분기",
     "은·백금은 산업 적자 서사 유지되나 월간 -8% 조정"
    ],
    "risks": [
     "FOMC(10월 말) 매파 시 실질금리 추가 상승 → 금 추가 조정",
     "중동 확전 시 안전자산 수요로 급반등",
     "COMEX 은 등록재고 커버리지(13~28%) 취약 → 스퀴즈 변동성"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "금 -1.3%, 은 -1.1%, 백금 -2.1% — Fed 의사록·실질금리 상승",
      "src": "https://finance.yahoo.com/personal-finance/investing/article/gold-price-today-wednesday-october-7-2026-gold-prices-losing-ground-ahead-of-fed-minutes-105600743.html"
     },
     {
      "d": "2026-10-06",
      "x": "금 1월 고점 대비 -26%, 스팟 ~$4,129",
      "src": "https://www.business-standard.com/amp/finance/personal-finance/gold-is-26-below-its-2026-peak-buy-now-or-wait-what-investors-should-do-126100600129_1.html"
     }
    ]
   },
   {
    "id": "base",
    "title": "비철금속 (구리·알루미늄·아연·니켈·주석)",
    "metrics": [
     {
      "l": "LME 구리 3M",
      "v": "$14,415/t",
      "d": "2026-10-07",
      "chg": "-0.03% d/d; 1월 기록 $14,527 근접",
      "trend": "flat",
      "n": "중국 연휴 복귀 후 10/8 상승(Bloomberg); AI/테크 랠리 연동",
      "src": "https://www.lme.com/metals/non-ferrous/lme-copper"
     },
     {
      "l": "COMEX 구리",
      "v": "$6.61/lb",
      "d": "2026-10-07",
      "chg": "+0.17% d/d, 월간 -1.98%, 전년比 +31.8%",
      "trend": "up",
      "n": "COMEX 재고 706,818t(10/5) 기록적 — 타이트니스는 LME/SHFE에 집중",
      "src": "https://tradingeconomics.com/commodity/copper"
     },
     {
      "l": "LME 구리 재고",
      "v": "242,975t",
      "d": "2026-10-06",
      "chg": "-6,425t (9/30 249,400)",
      "trend": "down",
      "n": "8/21 기준 취소워런트 비율 50.5%",
      "src": "https://news.metal.com/newscontent/104144340-smm-analysis-copper-market-review-and-outlook-after-chinas-national-day-holiday"
     },
     {
      "l": "SHFE 구리 재고",
      "v": "38,744t",
      "d": "2026-09-30",
      "chg": "-17.8% w/w, 2024년 1월 이후 최저",
      "trend": "down",
      "n": "SMM 국내 주요시장 재고 73,700t",
      "src": "https://discoveryalert.com/news/lme-copper-stocks-fall-shanghai-golden-week-october-2026/"
     },
     {
      "l": "구리 TC/RC 2026 벤치마크",
      "v": "$0/t, 0c/lb",
      "d": "2025-12-19",
      "chg": "2025 $21.25 → $0 (사상 최저)",
      "trend": "down",
      "n": "스팟 -$78.50/t(4/9 Platts); 제련능력 과잉 vs 광산 공급 부족",
      "src": "https://www.mining.com/web/antofagasta-agrees-zero-copper-processing-charges-for-2026-with-chinese-smelter/"
     },
     {
      "l": "Grasberg 3Q 밀 처리량",
      "v": "140kt/d (정상의 67%)",
      "d": "2026-10-02",
      "chg": "Block Cave 70kt/d",
      "trend": "up",
      "n": "80% 회복 2027 중반, 완전복구 2027 말로 지연; PB1S 재가동 2027 중반",
      "src": "https://www.sec.gov/Archives/edgar/data/0000831259/000083125926000043/fcx_261002.htm"
     },
     {
      "l": "칠레 노무 리스크",
      "v": "Escondida 감독직 파업 가결, Centinela 최종안 거부",
      "d": "2026-10-01",
      "chg": "Antofagasta 상반기 생산 -9.5%(285kt)",
      "trend": "up",
      "n": "7~8월 폭풍 피해에 이어 노무 리스크 가중",
      "src": "https://www.riotimesonline.com/copper-markets-latam-friday-october-2-2026/"
     },
     {
      "l": "Kamoa-Kakula 2026 가이던스",
      "v": "최대 330kt",
      "d": "2026-03-31",
      "chg": "12월 가이던스 380~420kt에서 하향",
      "trend": "down",
      "n": "지진 피해; 자체 제련소로 정광 외부판매 감소",
      "src": "https://www.ivanhoemines.com/news-stories/news-release/ivanhoe-mines-announces-kamoa-kakula-copper-production-guidance-for-2026-and-2027-as-recovery-plan-advances/"
     },
     {
      "l": "LME 알루미늄 cash/3M",
      "v": "$3,102.5 / $3,114",
      "d": "2026-10-07",
      "chg": "월간 -6.5%, 전년比 +13.1%; 재고 238,875t",
      "trend": "down",
      "n": "에너지 비용 상승에도 수요 둔화로 조정",
      "src": "https://www.westmetall.com/en/markdaten.php"
     },
     {
      "l": "LME 아연 cash/3M",
      "v": "$3,799 / $3,756",
      "d": "2026-10-07",
      "chg": "전년比 ~+25%; 재고 127,750t (+475)",
      "trend": "up",
      "n": "현물 백워데이션 ~$43 — 프롬프트 타이트",
      "src": "https://www.westmetall.com/en/markdaten.php"
     },
     {
      "l": "LME 니켈 cash/3M",
      "v": "$15,645 / $15,840",
      "d": "2026-10-07",
      "chg": "월간 -6.4%; 재고 284,178t",
      "trend": "down",
      "n": "인니 2026 RKAB 260~270Mt wmt(2025 379Mt) 쿼터 감축에도 재고 과잉",
      "src": "https://www.westmetall.com/en/markdaten.php"
     },
     {
      "l": "LME 주석 cash/3M",
      "v": "$54,000 / $54,150",
      "d": "2026-10-07",
      "chg": "전년比 +48.3%; 재고 4,325t (-80)",
      "trend": "up",
      "n": "재고 극소 — 스퀴즈 취약",
      "src": "https://www.westmetall.com/en/markdaten.php"
     }
    ],
    "drivers": [
     "Grasberg 복구 지연(80% 2027 중반)+칠레 노무·DRC 차질 → 정광 부족, TC $0",
     "LME/SHFE 재고 감소 vs COMEX 기록적 재고 — 지역 아비트라지 왜곡",
     "AI/테크 랠리·중국 연휴 복귀 매수심리, 달러 약세",
     "고에너지 비용이 알루미늄·아연 제련 공급을 제약하나 수요 둔화도 동반"
    ],
    "risks": [
     "Escondida 파업 현실화 시 구리 $14,500 돌파 시도",
     "중국 부동산·철강 부진이 알루미늄·아연 수요 추가 압박",
     "LME Week(10/19~) 전후 2027 TC/RC 협상 — 음(-)의 벤치마크 가능성"
    ],
    "dev": [
     {
      "d": "2026-10-08",
      "x": "구리 등 금속 상승 — 중국 연휴 복귀 후 긍정적 심리",
      "src": "https://www.bloomberg.com/news/articles/2026-10-08/copper-gains-with-other-metals-as-china-returns-in-positive-mood"
     },
     {
      "d": "2026-10-02",
      "x": "Freeport 8-K: Grasberg 3Q 밀 처리 140kt/d, 4Q·연간 실적 중대 영향",
      "src": "https://www.sec.gov/Archives/edgar/data/0000831259/000083125926000043/fcx_261002.htm"
     },
     {
      "d": "2026-10-01",
      "x": "Escondida 감독직 파업 승인, Centinela 계약안 거부",
      "src": "https://www.riotimesonline.com/copper-markets-latam-friday-october-2-2026/"
     }
    ]
   },
   {
    "id": "bulk",
    "title": "벌크 (철광석·철강)",
    "metrics": [
     {
      "l": "철광석 62% Fe",
      "v": "$91.13/t",
      "d": "2026-10-07",
      "chg": "-0.05% d/d, 월간 -8.9%, 전년比 -12.6%",
      "trend": "down",
      "n": "공급 풍부·중국 항구재고 증가·제철소 감산; 다롄 9월 말 5주 최저",
      "src": "https://tradingeconomics.com/commodity/iron-ore"
     },
     {
      "l": "중국 NBS 제조업 PMI",
      "v": "50.1 (9월)",
      "d": "2026-09-30",
      "chg": "8월 49.8",
      "trend": "up",
      "n": "건설 PMI 8월 46.9, 8월 조강생산 -3.7% y/y; CISA 감산 요청",
      "src": "https://tradingeconomics.com/china/business-confidence"
     },
     {
      "l": "중국 철강(HRC) 가격",
      "v": "3,081 CNY/t",
      "d": "2026-10-08",
      "chg": "하락",
      "trend": "down",
      "n": "철강 마진 압박 → 철광석 수입 수요 약화",
      "src": "https://tradingeconomics.com/commodity/steel"
     },
     {
      "l": "Port Hedland 철광석 출하 (8월)",
      "v": "46.60 Mt (중국向 38.0 Mt)",
      "d": "2026-08-31",
      "chg": "+5.4% m/m, +5.2% y/y",
      "trend": "up",
      "n": "9월 수치 미공개; BHP 항만 노사협상 결렬(9/8, 2차 소스)",
      "src": "https://www.steelorbis.com/steel-news/latest-news/iron-ore-exports-via-port-hedland-up-54-percent-in-august-2026-from-july-1478046.htm"
     }
    ],
    "drivers": [
     "호주·브라질 공급 풍부+중국 감산 → 철광석 $90선 하향 압력",
     "중국 PMI 50.1 회복에도 건설·철강 수요 부진",
     "LME Steel HRC Shanghai 선물 10/27 상장 — 가격발견 변화"
    ],
    "risks": [
     "BHP Port Hedland 파업 시 공급 차질로 단기 반등",
     "중국 추가 부양책 발표 시 숏커버 랠리"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "철광석 $91.13, 월간 -8.9%",
      "src": "https://tradingeconomics.com/commodity/iron-ore"
     }
    ]
   },
   {
    "id": "battery_critical",
    "title": "배터리·핵심광물 (리튬·코발트·희토류·텅스텐 등)",
    "metrics": [
     {
      "l": "탄산리튬 (GFEX 기준)",
      "v": "$18,315/t",
      "d": "2026-10-06",
      "chg": "중국 ¥122,800/t (10/2); 3/14 고점 $23,726",
      "trend": "down",
      "n": "CATL Jianxiawo 광산 정지가 지지, 호주 증산이 상단 제한",
      "src": "https://metalcharts.org/lithium-price"
     },
     {
      "l": "코발트 (SMM 국내/국제)",
      "v": "$45,278 / $56,284/t",
      "d": "2026-09-04",
      "chg": "2025.1~2026.6 수산화코발트 +167%",
      "trend": "up",
      "n": "DRC 2026~27 수출쿼터 96,600t(2024년의 ~절반); 10월 가격 미확인",
      "src": "https://critical-minerals-news.com/cobalt-price/"
     },
     {
      "l": "NdPr 산화물 (SMM)",
      "v": "$97,302/t ($97.30/kg)",
      "d": "2026-09-30",
      "chg": "7월 +21.4% m/m 후 9월 초 조정",
      "trend": "up",
      "n": "미 DoD MP Materials 가격하한 $110/kg 하회 지속",
      "src": "https://rare-earth-mining.com/neodymium-price/"
     },
     {
      "l": "중국 희토류 수출통제 유예 만료",
      "v": "2026-11-10",
      "d": "2026-10-06",
      "chg": "잔여 35일(10/6 기준)",
      "trend": "flat",
      "n": "연장·선택적 재개·전면 재개(0.1% 역외규정) 3가지 시나리오; 美하원 4개 법안 패키지",
      "src": "https://www.techtimes.com/articles/328654/20261006/congress-moves-break-china-rare-earth-grip-before-november-deadline.htm"
     },
     {
      "l": "텅스텐 APT (로테르담)",
      "v": ">$3,000/mtu",
      "d": "2026-04-30",
      "chg": "연초 대비 +200%",
      "trend": "up",
      "n": "중국 2026~27 수출허가 15개사 제한; 8월 중국 내수 조정",
      "src": "https://www.mining.com/web/tungsten-breaks-records-as-china-export-curbs-military-demand-boost-investment/"
     },
     {
      "l": "안티모니 잉곳 (중국 EXW / FOB)",
      "v": "$17,267 / $27,072/t",
      "d": "2026-09-21",
      "chg": "FOB-EXW 스프레드 ~$9,800",
      "trend": "flat",
      "n": "수출통제로 역내외 이중가격",
      "src": "https://www.scrapmonster.com/metal-prices/minor-metals"
     },
     {
      "l": "갈륨 99.99% (중국 EXW / FOB)",
      "v": "$304.53 / $507.02/kg",
      "d": "2026-09-21",
      "chg": "IEA: 유럽가 중국 내수의 ~5배",
      "trend": "flat",
      "n": "게르마늄 이산화물 $3,311/kg EXW; 유럽 중국의 ~3배",
      "src": "https://www.scrapmonster.com/metal-prices/minor-metals"
     }
    ],
    "drivers": [
     "11/10 중국 희토류 통제 유예 만료 임박 → 역외 NdPr 프리미엄·재고 축적",
     "DRC 코발트 쿼터제(96.6kt)로 공급 반감 → 가격 고공",
     "리튬은 CATL 광산 정지 vs 호주 증산으로 $18k 박스권",
     "텅스텐·안티모니·갈륨은 중국 수출허가제로 역외가 2~5배"
    ],
    "risks": [
     "11/10 전면 재개 시 자석·방산 공급망 쇼크, 선택적 재개 시 품목별 차별화",
     "DRC 쿼터 실집행률(33~50% 추정, 미검증) 변화에 따른 코발트 급변",
     "리튬 중국 환경감독 완화 시 공급 복귀로 하락"
    ],
    "dev": [
     {
      "d": "2026-10-06",
      "x": "美하원 공화당, 희토류 국내채굴·비축 4개 법안 패키지 (만료 35일 전)",
      "src": "https://www.techtimes.com/articles/328654/20261006/congress-moves-break-china-rare-earth-grip-before-november-deadline.htm"
     },
     {
      "d": "2026-10-02",
      "x": "희토류 자석: 11/10 데드라인과 미국 공급 갭 분석",
      "src": "https://www.techtimes.com/articles/328392/20261002/rare-earth-magnets-chinas-november-10-deadline-us-gap-money-cant-close.htm"
     }
    ]
   }
  ],
  "positioning": [
   {
    "l": "WTI+Brent 매니지드머니 순매수 (합산)",
    "v": "335,000 계약",
    "d": "2026-09-29",
    "chg": "-31,000 w/w (5주 최저)",
    "src": "https://home.saxo/en-sg/content/articles/commodities/cot-on-forex-and-commodities---week-to-29-sept-2026-05102026"
   },
   {
    "l": "WTI 투기적 순매수",
    "v": "~109,500 계약",
    "d": "2026-09-29",
    "chg": "감소 (9/8 140,046 대비)",
    "src": "https://www.fxstreet.com/analysis/cftc-report-speculators-turn-more-defensive-as-oil-exposure-falls-202610041345"
   },
   {
    "l": "Henry Hub 대형투기자 순매도 (Legacy)",
    "v": "-231,020 계약",
    "d": "2026-09-29",
    "chg": "-14,490 w/w (숏 확대)",
    "src": "https://futuresbench.com/cot/natural-gas/"
   },
   {
    "l": "Henry Hub 매니지드머니 순매도",
    "v": "-65,547 계약",
    "d": "2026-09-22",
    "chg": "-34,658 w/w",
    "src": "https://www.whipsawwire.com/markets/natural-gas"
   },
   {
    "l": "COMEX 금 매니지드머니 순매수",
    "v": "134,972 계약",
    "d": "2026-09-08",
    "chg": "~-1,800 w/w (8/25 144,700)",
    "src": "https://thevaultreport.com/cot"
   },
   {
    "l": "COMEX 구리 매니지드머니 순매수",
    "v": "~76,300 계약",
    "d": "2026-08-25",
    "chg": "-2,377 w/w",
    "src": "https://en.macromicro.me/series/8311/copper-futures-and-options-manage-money-net-position"
   }
  ],
  "curve": [
   {
    "l": "Brent M1-M2",
    "v": ">$7/bbl 백워데이션",
    "d": "2026-10-03",
    "n": "8월 말 <$1에서 급확대; 호르무즈 차질로 프롬프트 극단 타이트 — 롤수익 큼, 숏 롤 비용 큼",
    "src": "https://fxnx.com/en/blog/oil-backwardation-2026-why-brent-s-6-month-spread-topped-20"
   },
   {
    "l": "Dated Brent - ICE Brent 근월",
    "v": "~$19~21/bbl 프리미엄 (Dated $125.53)",
    "d": "2026-10-07",
    "n": "물리적 차익 사상최고 — 현물 스퀴즈, 선물은 IEA 방출 기대로 상대 약세",
    "src": "https://no1sdailydigest.substack.com/p/daily-digest-2026-10-07"
   },
   {
    "l": "Brent-WTI",
    "v": "$13.80/bbl",
    "d": "2026-10-06",
    "n": "운임 $33/bbl 반영; 미 수출 아비트라지 최대 개방",
    "src": "https://www.vantagemarkets.com/market-analysis/why-brent-held-premium-over-wti-tanker-freight-record-october-5-9-2026/"
   },
   {
    "l": "Brent-Dubai EFS",
    "v": "$7.57/bbl",
    "d": "2026-10-06",
    "n": "Dubai Nov/Dec $2.70 백워데이션; 아시아 사워 상대 약세 → 사우디 OSP 인하와 일관",
    "src": "https://discoveryalert.com.au/crude-oil-price-spread-mechanics-2026/"
   },
   {
    "l": "EIA STEO Brent 경로",
    "v": "4Q26 $105 → 2Q27 $87 → 4Q27 $74",
    "d": "2026-10-06",
    "n": "공식 전망도 깊은 백워데이션 지지",
    "src": "https://www.trend.az/business/4231907.html"
   },
   {
    "l": "LME 아연 cash-3M",
    "v": "+$43/t 백워데이션",
    "d": "2026-10-07",
    "n": "프롬프트 타이트; 알루미늄(-$11.5)·니켈(-$195)·주석(-$150)은 콘탱고",
    "src": "https://www.westmetall.com/en/markdaten.php"
   },
   {
    "l": "TTF 9월 고점 vs 현재",
    "v": "€84 → €75.69/MWh",
    "d": "2026-10-07",
    "n": "겨울 리스크 프리미엄 유지, 저장 부족으로 겨울물 프리미엄",
    "src": "https://prestigebusiness.energy/marketreports/energy-market-update07-oct2026"
   }
  ],
  "calendar": [
   {
    "d": "2026-10-08",
    "x": "EIA 주간 천연가스 저장 (10/2주, 예상 +79 Bcf)",
    "why": "5년평균 +96 하회 여부 → HH 방향",
    "src": "https://tradingeconomics.com/united-states/natural-gas-stocks-change"
   },
   {
    "d": "2026-10-09",
    "x": "CFTC COT (10/6 기준)",
    "why": "원유 순매수 5주 최저 후 재축적 여부, 금 포지션 청산 정도",
    "src": "https://www.cftc.gov/MarketReports/CommitmentsofTraders/ReleaseSchedule/index.htm"
   },
   {
    "d": "2026-10-13",
    "x": "OPEC 월간보고서(MOMR) 10월호",
    "why": "9월 생산·2026 수요 6번째 하향 여부",
    "src": "https://www.mtsinsights.com/events/4241"
   },
   {
    "d": "2026-10-14",
    "x": "IEA 석유시장보고서(OMR) 10월호 (10:00 파리)",
    "why": "2026 수요 -1.6 mb/d 수정·재고 draw·비축방출 평가",
    "src": "https://www.iea.org/events/oil-market-report-october-2026"
   },
   {
    "d": "2026-10-15",
    "x": "EIA 주간석유재고 (10/9주, 콜럼버스데이로 목요일 12:00 연기)",
    "why": "중간유분 5년평균 -12% 심화 여부",
    "src": "https://www.eia.gov/petroleum/supply/weekly/schedule.php"
   },
   {
    "d": "2026-10-19",
    "x": "LME Week 런던 (세미나 10/19, 만찬 10/20)",
    "why": "2027 TC/RC 벤치마크·구리 수급 컨센서스",
    "src": "https://www.lme.com/events/lme-week/what-s-on"
   },
   {
    "d": "2026-10-27",
    "x": "LME Steel HRC Shanghai 선물 상장",
    "why": "중국 철강 가격발견 변화",
    "src": "https://gen10.net/lme-week-2026-whats-on-the-agenda-for-metals-traders"
   },
   {
    "d": "2026-10-31",
    "x": "중국 NBS 10월 PMI",
    "why": "철광석·비철 수요 확인",
    "src": "https://tradingeconomics.com/china/business-confidence"
   },
   {
    "d": "2026-11-01",
    "x": "OPEC+ 8개국 회의 (12월 생산)",
    "why": "동결 지속 vs 2027 쿼터 논의; 실생산 쿼터 하회 상태",
    "src": "https://www.cnbc.com/2026/10/04/opec-agrees-to-keep-november-oil-output-targets-steady.html"
   },
   {
    "d": "2026-11-01",
    "x": "EU 가스저장 목표일 (80%, 최대 -4%p 유예)",
    "why": "현 71~73%로 미달 가능성 → TTF 프리미엄",
    "src": "https://www.businesstoday.in/world/story/europe-enters-winter-with-gas-storage-at-71-raising-fears-of-supply-shortages-and-higher-prices-559334-2026-10-03"
   },
   {
    "d": "2026-11-10",
    "x": "중국 희토류 추가 수출통제 유예 만료",
    "why": "NdPr·자석·방산 공급망 쇼크 트리거",
    "src": "https://finance.yahoo.com/markets/commodities/articles/china-rare-earth-export-pause-123614106.html"
   },
   {
    "d": "2026-11-11",
    "x": "OPEC MOMR 11월호",
    "why": "10월 생산 집계",
    "src": "https://www.mtsinsights.com/events/4241"
   },
   {
    "d": "2026-11-30",
    "x": "카타르 LNG 불가항력 현 종료일",
    "why": "재연장 시 JKM/TTF 겨울 프리미엄 고착",
    "src": "https://www.thenationalnews.com/business/energy/2026/09/28/qatar-extends-lng-force-majeure-as-hormuz-disruption-threatens-winter-supply/"
   }
  ],
  "judgments": [
   "Brent 선물 $100 부근은 IEA 방출 기대로 눌려 있으나 현물(Dated $125, 차익 $19 사상최고)·M1-M2 $7+ 백워데이션이 보여주듯 물리적 스퀴즈는 심화 중이므로 플랫 숏보다 프롬프트 스프레드 롱이 유리하다 (근거: Dated Brent 10/7 $125.53·차익 $19.1, M1-M2 >$7, EIA 원유 -3.2mb·3Q 글로벌 재고 -1.9 mb/d).",
   "아람코의 예상 밖 아시아 OSP -$3 인하와 Brent-Dubai EFS 축소는 아시아 사워 수요 약화(티팟 감산·이란 해상재고 소진)를 시사하므로 Dubai 대비 Brent 상대 강세·Brent-WTI $13~14 고착 전략이 유효하다 (근거: 11월 Arab Light -$5 vs O/D, EFS $7.57, 산둥 재고 8개월 최저, Brent-WTI $13.80).",
   "미국 중간유분 재고 5년평균 -12%·정제가동률 92.7%·러 디젤 수출금지 속 IEA 디젤 우선 방출은 크랙 상단을 일시 누를 뿐 겨울 전 구조적 디젤 타이트니스는 유지되므로 디젤 크랙 조정 시 재매수 관점이다 (근거: 8/17 디젤 크랙 $102.2 기록, 3-2-1 $65.1, 중간유분 -12% vs 5yr).",
   "EU 저장 71~73%(7년 최저)·카타르 FM 11월 말 연장·TTF €75 vs HH $3.2의 격차는 겨울 TTF/JKM 상방 스큐와 미 LNG 수출 극대화를 뒷받침하므로 TTF 겨울물 콜·HH-TTF 스프레드 확대 포지션이 합리적이다 (근거: GIE 72.83% 10/5, JKM $25.79, HH 11월물 $3.197, 피드가스 16.9 bcfd).",
   "구리는 Grasberg 복구 지연(80% 2027 중반)·TC $0·칠레 파업 리스크로 LME/SHFE 재고가 감소 중이나 COMEX 재고 70만t 기록·관리머니 롱 축소로 플랫 가격은 $14,500 저항권이므로 LME 프롬프트 타이트닝(캐시-3M)과 지역 아비트라지에 집중하는 편이 낫다 (근거: LME 재고 242,975t·SHFE 38,744t 최저, COMEX 706,818t, 구리 MM 순매수 76.3k 감소세).",
   "금은 중앙은행 순매입(2Q 289t)에도 실질금리 상승·ETF 유출로 고점 대비 -26% 조정 국면이며 Fed 인상 확률 <20%가 하단만 지지하므로 금 롱은 10/9 COT 포지션 청산 확인 후 실질금리 반전 신호를 기다리는 것이 적절하다 (근거: 금 $4,109.61 -1.32%, 10y TIPS ~2.5%, 2Q ETF -45t, 9월 고용 +29k)."
  ],
  "gaps": [
   "ICE Brent M1-M2 정확한 정산 수치(10/7) — 2차 소스 '>$7' 수준만 확인",
   "Platts Dubai 10월 일별 평가·Dubai/Oman 공식 월평균",
   "10월 ULSD·휘발유·제트 크랙 정산치 (8월까지만 확보), EIA 휘발유·중간유분 절대 재고량(백만 bbl)",
   "CFTC 10/2 발표(9/29 기준) 금·구리·천연가스 매니지드머니 수치 — 레거시/비상업 수치로 대체",
   "OPEC+ 9월 국가별 생산 서베이(Reuters/Platts)·준수율, Urals FOB 할인 9월 평가(Argus)",
   "중국 9월 원유 수입량(세관 중순 발표 예정)·산둥 티팟 9월 가동률",
   "글로벌 플로팅 스토리지 10월 공식 수치(Vortexa/Kpler 원문)",
   "API2 10월 가격, 코발트 10월 Fastmarkets $/lb 평가, 철광석 Platts 62% 10/7 평가(TE 프록시 사용)",
   "Port Hedland 9월 출하량, BHP 항만 파업 결과(주류 매체 미확인)",
   "FOMC 10월 회의 정확한 일자, EIA 천연가스 저장 10/8 실제 발표치"
  ]
 },
 "ags": {
  "groups": [
   {
    "id": "grains",
    "title": "곡물 (밀·옥수수·쌀)",
    "metrics": [
     {
      "l": "CBOT 밀 12월물",
      "v": "686.50 ¢/bu",
      "d": "2026-10-07",
      "chg": "6주 저점 부근, 10/5 692.25 대비 하락",
      "trend": "down",
      "n": "흑해 공급차질에도 7달러 아래 유지, 10/9 WASDE 대기",
      "src": "https://www.ams.usda.gov/mnreports/ams_3192.pdf"
     },
     {
      "l": "CBOT 옥수수 12월물",
      "v": "502.00 ¢/bu",
      "d": "2026-10-07",
      "chg": "10/5 497.25 대비 +4.75¢",
      "trend": "up",
      "n": "수확 지연(23% 완료)으로 단기 지지",
      "src": "https://www.ams.usda.gov/mnreports/ams_3192.pdf"
     },
     {
      "l": "KC HRW 밀 12월물",
      "v": "$7.385/bu",
      "d": "2026-10-07",
      "chg": "-17.75¢ (장중 고점 $7.5875)",
      "trend": "down",
      "n": "남부 평원 파종 진행, 베이시스 보합",
      "src": "https://rallies.ai/news/us-plains-hrw-wheat-plantings-proceed-basis-stays-mostly-flat-bac72668db80ce64"
     },
     {
      "l": "Euronext 제분밀 12월물",
      "v": "€244.25/t",
      "d": "2026-10-07",
      "chg": "-1.3% (장중 €248.50, 9/9 이후 최고)",
      "trend": "down",
      "n": "미국 작황 데이터 앞두고 4주 고점에서 반락",
      "src": "https://www.investing.com/news/commodities-news/euronext-wheat-drops-from-fourweek-high-ahead-of-us-crop-data-93CH-4937567"
     },
     {
      "l": "미국 옥수수 수확률",
      "v": "23% (5년 평균 27%)",
      "d": "2026-10-04",
      "chg": "평년 대비 -4%p",
      "trend": "down",
      "n": "9월 하반기 중서부 기록적 다우로 지연, 성숙 83%",
      "src": "https://www.dtnpf.com/agriculture/web/ag/news/article/2026/10/05/usda-crop-progress-corn-23-harvested"
     },
     {
      "l": "미국 대두 수확률 / 작황",
      "v": "25% / G-E 57%",
      "d": "2026-10-04",
      "chg": "5년 평균 하회",
      "trend": "down",
      "n": "낙엽률 85%(평년 87%), 옥수수 G-E 54%",
      "src": "https://www.dtnpf.com/agriculture/web/ag/news/article/2026/10/05/usda-crop-progress-corn-23-harvested"
     },
     {
      "l": "미국 겨울밀 파종률",
      "v": "90%",
      "d": "2026-10-04",
      "chg": "-",
      "trend": "flat",
      "n": "오클라호마 서남부 가뭄 지속, 캔자스 서부 최근 강우로 일부 완화",
      "src": "https://rfdtv.com/rfd-tv-weekly-state-by-state-crop-progress-livestock-report-monday-october-5-2026"
     },
     {
      "l": "미국 주간 수출판매 (9/24주)",
      "v": "옥수수 53.6만t / 대두 103만t / 밀 28.4만t",
      "d": "2026-09-24",
      "chg": "옥수수 -36% w/w (MY 최저)",
      "trend": "flat",
      "n": "대두는 중국 58.9만t 포함 상단 상회, 옥수수·밀은 하단",
      "src": "https://www.indexbox.io/blog/us-agricultural-export-sales-soybeans-corn-and-wheat-lead-week-ending-september-24-2026/"
     },
     {
      "l": "러시아 밀 FOB 노보로시스크 (12.5%)",
      "v": "$231~233/t (7월초 기준)",
      "d": "2026-07-07",
      "chg": "-$4 w/w (당시)",
      "trend": "flat",
      "n": "8월 이후 터미널 가동중단으로 최신 호가 미확인; 수출세 2026년 말까지 0 적용 보도",
      "src": "https://cropgpt.ai/russian-wheat-export-prices-slide-as-harvest-starts"
     },
     {
      "l": "러시아 곡물 수출세",
      "v": "0 루블/t (2026년 잔여기간)",
      "d": "2026-09-01",
      "chg": "기존 787.5루블/t에서 폐지",
      "trend": "down",
      "n": "흑해 터미널 피격에 따른 수출지원; FOB $3~4/t 하락 효과 추정",
      "src": "https://www.global-agriculture.com/farming-agriculture/russia-zeroes-out-grain-export-duties-as-black-sea-attacks-choke-shipping/"
     },
     {
      "l": "우크라이나 9월 곡물 수출",
      "v": "148.8만t",
      "d": "2026-09-30",
      "chg": "-36.7% y/y",
      "trend": "down",
      "n": "밀 109.4만t, 옥수수 30.9만t; MY 누적 502만t(9/28)",
      "src": "https://ukragroconsult.com/en/news/ukraine-exported-almost-1-5-mln-tons-of-grain-in-september/"
     },
     {
      "l": "러시아 동계곡물 파종면적",
      "v": "610만ha (9/18 기준)",
      "d": "2026-09-18",
      "chg": "전년 710만ha 대비 -14%, 5년평균 -25%",
      "trend": "down",
      "n": "2013년 이후 최저 속도; 남부 2년 연속 토양수분 부족, 내수 밀가격 6월 이후 -40%",
      "src": "https://blog.sizov.report/russias-winter-crop-sowing-pace-is-the-slowest-since-2013/"
     },
     {
      "l": "SovEcon 러시아 밀 생산 전망",
      "v": "8,750만t",
      "d": "2026-10-08",
      "chg": "-0.8% 하향",
      "trend": "down",
      "n": "남부 저수분으로 2027년작 리스크 가중",
      "src": "https://www.graincentral.com/markets/daily-market-wire-08-october-2026/"
     },
     {
      "l": "호주 밀 생산 (ABARES 9월)",
      "v": "2,990만t",
      "d": "2026-09-01",
      "chg": "6월 2,670만t 대비 상향, 전년 -17%",
      "trend": "up",
      "n": "남부 작황 호조; USDA 9월 WASDE는 3,100만t",
      "src": "https://www.agriculture.gov.au/abares/research-topics/agricultural-outlook/australian-crop-report/september-2026"
     },
     {
      "l": "태국 5% 쇄미",
      "v": "$460/t",
      "d": "2026-10-03",
      "chg": "보합 w/w",
      "trend": "flat",
      "n": "베트남 5% $420~430/t(약세); 필리핀 추가 구매 주시",
      "src": "https://brecorder.com/news/40442186/asia-rice-indian-rice-export-prices-rise-to-over-one-year-high-on-firm-demand-production-concerns"
     },
     {
      "l": "아르헨티나 밀 생산 전망 (BAGE)",
      "v": "2,130만t",
      "d": "2026-09-30",
      "chg": "전년 기록 2,780만t 대비 -23.4%",
      "trend": "down",
      "n": "파종 완료, 11월 수확 개시; 과습이 작기 초 문제",
      "src": "https://www.graincentral.com/markets/argentinas-soybeans-are-in-the-bin-but-corn-harvest-lags/"
     }
    ],
    "drivers": [
     "10/9 WASDE 앞두고 옥수수 단수 하향 여부(트레이드 평균 177.8 vs USDA 178.5)가 핵심",
     "흑해 러시아 수출 터미널 약 20% 중장기 손상, 우크라이나 9월 수출 -37%로 공급 병목",
     "중서부 다우로 수확 지연(옥수수 23%, 대두 25%)이 단기 베이시스 지지",
     "러시아 동계작물 파종 2013년 이후 최저 속도 — 2027년작 리스크 선반영 시작"
    ],
    "risks": [
     "WASDE에서 옥수수 구곡 재고 20.95억bu 반영 시 재고/소비 완화로 약세 압력",
     "흑해 휴전·터미널 복구(최대 80% 재가동 가능) 시 밀 프리미엄 급락",
     "인도 몬순 -12.6%(2015년 이후 최악)로 인도 쌀·밀 수출정책 재강화 가능성"
    ],
    "dev": [
     {
      "d": "2026-10-05",
      "x": "USDA 작황: 옥수수 수확 23%, 대두 25%로 평년 하회",
      "src": "https://www.dtnpf.com/agriculture/web/ag/news/article/2026/10/05/usda-crop-progress-corn-23-harvested"
     },
     {
      "d": "2026-10-02",
      "x": "우크라이나 농업장관: 항만 봉쇄 미해제 시 시즌 농산물 수출 3,000만t 손실",
      "src": "https://www.pravda.com.ua/eng/news/2026/10/02/8056113/"
     },
     {
      "d": "2026-09-30",
      "x": "USDA 분기재고: 2025/26 옥수수 기말재고 20.95억bu(9월 WASDE 대비 +1.73억)",
      "src": "https://www.profarmer.com/news/agriculture-news/october-wasde-preview-key-metrics-watch-corn-soybeans-wheat-and-cotton"
     },
     {
      "d": "2026-09-25",
      "x": "로이터: 공격 중단 시 러시아 흑해 곡물 터미널 80% 신속 재가동 가능, NKHP 복구 최대 4개월",
      "src": "https://www.usnews.com/news/world/articles/2026-09-25/russia-can-restart-80-of-black-sea-grain-export-terminals-if-attacks-stop"
     }
    ]
   },
   {
    "id": "oilseeds_veg",
    "title": "유지작물·식물성유지",
    "metrics": [
     {
      "l": "CBOT 대두 11월물",
      "v": "1297.50 ¢/bu",
      "d": "2026-10-07",
      "chg": "10/5 1280.75 대비 +16.75¢",
      "trend": "up",
      "n": "수확압력 vs 중국 수요; 현물 평균 $12.39",
      "src": "https://www.ams.usda.gov/mnreports/ams_3192.pdf"
     },
     {
      "l": "대두박 / 대두유 (10/7 장중)",
      "v": "대두박 +$8~9/st, 대두유 -200~219pt",
      "d": "2026-10-07",
      "chg": "박 강세·유 약세 스프레드",
      "trend": "flat",
      "n": "2026-27 RVO 바이오디젤 88.6억 RIN로 유지 수요 구조적 지지",
      "src": "https://inkl.com/news/soybeans-fading-lower-on-wednesday-rza179nx"
     },
     {
      "l": "미국 대두 단수 (USDA 9월)",
      "v": "52.8 bu/ac, 생산 45.35억bu",
      "d": "2026-09-11",
      "chg": "기말재고 3.10억bu (8월 3.20억)",
      "trend": "flat",
      "n": "10월 WASDE 트레이드 단수 평균 52.9",
      "src": "https://www.profarmer.com/news/agriculture-news/october-wasde-preview-key-metrics-watch-corn-soybeans-wheat-and-cotton"
     },
     {
      "l": "중국 미국산 대두 구매 (MY 2026/27)",
      "v": "약 1,300만t",
      "d": "2026-09-15",
      "chg": "8월초 600만t 대비 급증",
      "trend": "up",
      "n": "연 2,500만t 약속 대비 절반 초과; 9/23~25 정상회담은 신규 약속 없음, 대두 13% 관세 유지",
      "src": "https://en.sedaily.com/international/2026/09/15/china-buys-us-soybeans-ahead-of-xis-washington-trip"
     },
     {
      "l": "브라질 대두 파종률 (AgRural)",
      "v": "7.3% (전년 9.0%)",
      "d": "2026-10-07",
      "chg": "전년 대비 지연",
      "trend": "down",
      "n": "Conab 전망 1억8,160만t 기록; 마투그로수 10월 강우 평년 하회 예보",
      "src": "https://www.global-agriculture.com/latam-agriculture/brazils-conab-projects-record-soybean-crop-as-planting-lags/"
     },
     {
      "l": "아르헨티나 대두 생산 전망 (로사리오)",
      "v": "4,780만t",
      "d": "2026-09-30",
      "chg": "-20만t 하향",
      "trend": "down",
      "n": "옥수수 마진 우위로 면적 이동; 1기작 파종 10월말 개시",
      "src": "https://www.thepoultrysite.com/news/2026/09/argentina-cuts-soybean-harvest-outlook-as-corn-margins-improve"
     },
     {
      "l": "말레이시아 팜유 12월물",
      "v": "RM4,524/t",
      "d": "2026-10-07",
      "chg": "-0.79% d/d",
      "trend": "down",
      "n": "9월 재고 사상최고(337만t) 전망에 2일 연속 하락",
      "src": "https://www.brecorder.com/news/40443061/palm-extends-losses-as-weaker-chicago-soyoil-weighs"
     },
     {
      "l": "말레이시아 팜유 재고 (8월 MPOB)",
      "v": "282만t",
      "d": "2026-08-31",
      "chg": "수출 -7.5% m/m (129만t)",
      "trend": "up",
      "n": "9월 로이터 서베이: 생산 210만t(사상최고), 재고 337만t(+19.5%)",
      "src": "https://www.fastmarkets.com/insights/malaysias-end-september-palm-oil-stocks/"
     },
     {
      "l": "ICE 카놀라 11월물",
      "v": "C$826.30/t",
      "d": "2026-10-06",
      "chg": "+33% y/y, 월간 -1.1%",
      "trend": "up",
      "n": "커브 콘탱고(5월물 C$851.20)",
      "src": "https://albertacanola.com/grower-resources/marketing/daily-canola-prices/"
     },
     {
      "l": "해바라기유 (글로벌, Q2 벤치마크)",
      "v": "$1,411/t (미국) / $1,649/t (프랑스)",
      "d": "2026-06-30",
      "chg": "3년 고점 부근",
      "trend": "up",
      "n": "10월 최신 호가 미확인",
      "src": "https://www.imarcgroup.com/sunflower-oil-pricing-report"
     }
    ],
    "drivers": [
     "중국 국영 구매 1,300만t 도달 — 11월 선적 이후 추가 구매 속도가 가격 방향 결정",
     "팜유 재고 사상최고 경신 전망(10/12 MPOB)이 식물성유지 전반 압박",
     "미국 RVO·45Z로 대두유 바이오연료 수요 +25% 전망, 압착 기록(2.78억bu)",
     "브라질 파종 지연 + 10/7~ 중서부 1주 건조·고온 예보"
    ],
    "risks": [
     "MPOB 9월 재고 337만t 상회 시 팜유 추가 급락 → 대두유 동반 약세",
     "엘니뇨 피크(11월)로 동남아 팜 생산 2027년 상반기 감소 vs 브라질 남부 과습",
     "중국이 11월 미 선적 종료 후 남미로 전환 시 대두 베이시스 붕괴"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "팜유 2일 연속 하락, 시카고 대두유 약세·재고 우려",
      "src": "https://www.brecorder.com/news/40443061/palm-extends-losses-as-weaker-chicago-soyoil-weighs"
     },
     {
      "d": "2026-09-30",
      "x": "USDA 플래시: 대두 10.5만t 미상 목적지 판매",
      "src": "https://www.fas.usda.gov/data/commodities/soybeans"
     },
     {
      "d": "2026-09-28",
      "x": "미중 정상회담 휴전 연장, 대두 관세 인하 대상 제외·신규 구매 약속 없음",
      "src": "https://www.dtnpf.com/agriculture/web/ag/columns/washington-insider/article/2026/09/28/us-china-extends-trade-truce-new"
     }
    ]
   },
   {
    "id": "softs",
    "title": "소프트 (설탕·커피·코코아·면화)",
    "metrics": [
     {
      "l": "ICE 원당 No.11 (3월물 근월)",
      "v": "약 20.3~20.6 ¢/lb",
      "d": "2026-10-07",
      "chg": "10월물 9/28 17.46¢ 대비 급등, 19개월 고점",
      "trend": "up",
      "n": "ISO 2026/27 -20만t 적자 전망; 정확한 정산가 미확인",
      "src": "https://tradingeconomics.com/commodity/sugar"
     },
     {
      "l": "런던 백설탕 10월물",
      "v": "$555.70/t",
      "d": "2026-10-07",
      "chg": "-0.80 d/d",
      "trend": "flat",
      "n": "8/20 17개월 고점 이후 고점권 횡보",
      "src": "https://www.barchart.com/futures/quotes/SWV26"
     },
     {
      "l": "브라질 중남부 설탕 생산 (UNICA 7/1 누적)",
      "v": "1,075만t",
      "d": "2026-07-01",
      "chg": "-12.4% y/y",
      "trend": "down",
      "n": "설탕 배분비 42.5%(전년 51.0%); 9월 하반기 데이터 미확인",
      "src": "https://www.ynsugar.com/unica-sugar-production-brazil-report/"
     },
     {
      "l": "ICE 아라비카 12월물",
      "v": "292.55 ¢/lb",
      "d": "2026-10-05",
      "chg": "+1.3% d/d",
      "trend": "up",
      "n": "헤알 4.5개월 고점; ICE 재고 9/15 27년 저점 217,646백 → 260,054백 회복",
      "src": "https://www.comunicaffe.com/coffee-futures-prices-fall-in-the-first-session-of-the-week-on-brazil-rains-vietnams-harvesting-season-approaching/"
     },
     {
      "l": "런던 로부스타 11월물",
      "v": "$3,528/t",
      "d": "2026-10-05",
      "chg": "+1.7% d/d",
      "trend": "up",
      "n": "베트남 구곡 소진·신곡 지연; 1~8월 베트남 수출 133만t(+13.7%)",
      "src": "https://brecorder.com/news/40442218/vietnam-coffee-market-quiet-as-traders-await-fresh-harvest-supplies"
     },
     {
      "l": "브라질 2026/27 커피 생산 (Conab)",
      "v": "6,760만백",
      "d": "2026-09-15",
      "chg": "상향 (아라비카 4,821만백 +34.8%, 로부스타 1,939만백 -6.6%)",
      "trend": "up",
      "n": "USDA 7,190만백, Marex 7,590만백 등 추정치 이견 큼",
      "src": "https://www.sorafutures.com/archives/43447"
     },
     {
      "l": "ICE 뉴욕 코코아 12월물",
      "v": "$5,700/t (정산)",
      "d": "2026-10-06",
      "chg": "-$167 (-2.85%)",
      "trend": "down",
      "n": "ICE 재고 2.25년 고점 353.9만백; 4월 저점 $2,846 대비 2배",
      "src": "https://www.cocoaintel.com/cocoa-pulls-back-despite-persistent-crop-risks-6-october-2026/"
     },
     {
      "l": "코트디부아르 2026/27 농가수매가",
      "v": "1,200 CFA/kg (~$2.12)",
      "d": "2026-09-01",
      "chg": "전년 2,800 대비 -57%",
      "trend": "down",
      "n": "선도판매 110만t 초과; 수확 2027-02-28까지",
      "src": "https://www.cnbcafrica.com/2026/ivory-coast-sets-cocoa-farmgate-price-at-1200-cfa-francs-per-kg-for-2026-27-main-crop-official-says"
     },
     {
      "l": "가나 2026/27 농가수매가",
      "v": "GH¢42,400/t (~$3,647)",
      "d": "2026-09-25",
      "chg": "+2.4%",
      "trend": "up",
      "n": "COCOBOD 생산 최대 40% 감소 경고; FOB의 71.18% 보장",
      "src": "https://cropgpt.ai/ghana-increases-cocoa-producer-price-by-2-4-for-2026-27-season"
     },
     {
      "l": "ICE 면화 12월물",
      "v": "80.57 ¢/lb (장중)",
      "d": "2026-10-07",
      "chg": "9/25 주간 83.31¢ 대비 하락",
      "trend": "down",
      "n": "수확기 날씨 우려; 미결제약정 382,367",
      "src": "https://www.wfmz.com/news/ap/ap-spanish/bc-cotton-futures/article_a329dbd5-adf7-5286-b4c6-530a0360e03e.html"
     },
     {
      "l": "ICE 오렌지주스 11월물",
      "v": "143.15 ¢/lb",
      "d": "2026-09-18",
      "chg": "52주 범위 125.75~254.95",
      "trend": "down",
      "n": "10월 최신가 미확인",
      "src": "https://www.investing.com/commodities/orange-juice"
     }
    ],
    "drivers": [
     "ISO 2026/27 설탕 수급 적자(-20만t) 전환 + 브라질 설탕 배분비 급감으로 원당 19개월 고점",
     "코코아: 서아프리카 농가가 57% 인하·가나 생산 -40% 경고 vs ICE 재고 2.25년 고점의 줄다리기",
     "커피: 브라질 기록작 전망(6,760만~7,590만백)에도 ICE 재고 27년 저점·헤알 강세가 하단 지지",
     "엘니뇨(사상 최강 가능)로 인도·태국 설탕, 서아프리카 코코아, 베트남 로부스타에 날씨 프리미엄"
    ],
    "risks": [
     "브라질 헤알 반락 시 커피·설탕 동반 롱 청산 (펀드 설탕 순매수 21.8만계약 과밀)",
     "코코아 ICE 재고 증가 지속 시 $5,000 하향 테스트",
     "인도 마하라슈트라 가뭄으로 제당 가동 3개월 한정 → 백설탕 프리미엄 확대"
    ],
    "dev": [
     {
      "d": "2026-10-06",
      "x": "NY 코코아 12월물 -2.85% 정산, ICE 재고 2.25년 고점",
      "src": "https://www.cocoaintel.com/cocoa-pulls-back-despite-persistent-crop-risks-6-october-2026/"
     },
     {
      "d": "2026-10-05",
      "x": "아라비카 292.55¢ (+1.3%), 로부스타 $3,528 (+1.7%) — 헤알 강세",
      "src": "https://www.comunicaffe.com/coffee-futures-prices-fall-in-the-first-session-of-the-week-on-brazil-rains-vietnams-harvesting-season-approaching/"
     },
     {
      "d": "2026-09-29",
      "x": "ISO 2026/27 글로벌 설탕 -20만t 적자 전망 (2025/26 +110만t 흑자에서 전환)",
      "src": "https://www.barchart.com/story/news/4381207/sugar-prices-climb-as-iso-projects-a-global-deficit"
     },
     {
      "d": "2026-09-25",
      "x": "가나 COCOBOD 2026/27 수매가 GH¢42,400/t 발표, 시즌 개막",
      "src": "https://cropgpt.ai/ghana-increases-cocoa-producer-price-by-2-4-for-2026-27-season"
     }
    ]
   },
   {
    "id": "livestock",
    "title": "축산",
    "metrics": [
     {
      "l": "CME 생우 10월물",
      "v": "$221.225/cwt",
      "d": "2026-10-06",
      "chg": "+3.975",
      "trend": "up",
      "n": "12월물 $224.10; 적색 디젤 도로사용 허용 행정명령에 반등",
      "src": "https://www.indexbox.io/blog/usda-national-daily-direct-slaughter-cattle-report-october-6-2026-negotiated-purchases/"
     },
     {
      "l": "CME 비육우 10월물 / 지수",
      "v": "$340.50 / 337.76",
      "d": "2026-10-06",
      "chg": "+6.65 / +0.92",
      "trend": "up",
      "n": "75년래 최소 사육두수, 멕시코 생우 수입 2026년 -67%(1만두) 전망",
      "src": "https://www.wlj.net/market-wrap-up-tuesday-oct-6/"
     },
     {
      "l": "CME 린호그 (12월물 추정)",
      "v": "$70.37/cwt",
      "d": "2026-10-06",
      "chg": "-0.57",
      "trend": "down",
      "n": "돈육 컷아웃 $83.84 (-2.17), 수요 부진 지속",
      "src": "https://www.brownfieldagnews.com/market-news/closing-grain-and-livestock-futures-october-6-2026/"
     },
     {
      "l": "초이스 박스비프",
      "v": "$382.46/cwt",
      "d": "2026-10-06",
      "chg": "+4.20",
      "trend": "up",
      "n": "현물 협상거래 88두로 극히 부진 (전주 888두)",
      "src": "https://www.indexbox.io/blog/usda-national-daily-direct-slaughter-cattle-report-october-6-2026-negotiated-purchases/"
     }
    ],
    "drivers": [
     "6월 텍사스 나사선충(screwworm) 확인 이후 멕시코 생우 수입 사실상 중단, 공급 타이트 지속",
     "소고기 소매가 기록적 고점 vs 돈육 수요 약세의 종간 괴리"
    ],
    "risks": [
     "나사선충 미국 내 추가 확산 시 소비 심리·수출 타격으로 급락 변동성",
     "옥수수 $5 회복 시 사료비 부담으로 비육우 마진 압박"
    ],
    "dev": [
     {
      "d": "2026-10-06",
      "x": "생우·비육우 전 월물 급등, 린호그 혼조 약세",
      "src": "https://www.brownfieldagnews.com/market-news/closing-grain-and-livestock-futures-october-6-2026/"
     }
    ]
   },
   {
    "id": "fertilizer",
    "title": "비료",
    "metrics": [
     {
      "l": "미국 소매 요소 (46-0-0)",
      "v": "$796.25/st",
      "d": "2026-10-05",
      "chg": "+$66.25 (+9.1%) w/w",
      "trend": "up",
      "n": "9/18주 +24.4% 등 급등세; 호르무즈 차질 지속",
      "src": "https://fertilizerprice.com/"
     },
     {
      "l": "미국 소매 무수암모니아",
      "v": "$945.00/st",
      "d": "2026-10-05",
      "chg": "+$129.50 (+15.9%) w/w",
      "trend": "up",
      "n": "가을 시비 시즌 + 유럽 암모니아 감산",
      "src": "https://fertilizerprice.com/"
     },
     {
      "l": "미국 소매 DAP",
      "v": "$945.56/st",
      "d": "2026-10-05",
      "chg": "-$16.27 (-1.7%) w/w",
      "trend": "down",
      "n": "2월말 $830에서 $900+로 상승 후 소폭 조정",
      "src": "https://fertilizerprice.com/"
     },
     {
      "l": "미국 소매 염화칼륨 (MOP)",
      "v": "$571.35/st",
      "d": "2026-10-05",
      "chg": "+$36.15 (+6.8%) w/w",
      "trend": "up",
      "n": "연초 $490~505 박스권 상향 돌파",
      "src": "https://fertilizerprice.com/"
     },
     {
      "l": "호르무즈 의존국 요소 수출",
      "v": "-83%",
      "d": "2026-08-31",
      "chg": "암모니아 -75%, 메탄올 -80%",
      "trend": "down",
      "n": "전세계 요소 교역의 1/3 경유; 카타르 요소·암모니아 생산 중단(불가항력)",
      "src": "https://news.un.org/en/story/2026/08/1168074"
     },
     {
      "l": "중동 요소 생산 손실 (CRU)",
      "v": "55~60% 가동 중단 추정",
      "d": "2026-09-15",
      "chg": "-",
      "trend": "down",
      "n": "걸프 월 150만t+ 수출 중 상당분 손실, 이란 35~40만t/월 포함",
      "src": "https://www.farmprogress.com/marketing/middle-east-urea-output-plunges-as-hormuz-stays-shut"
     },
     {
      "l": "중국 요소 수출 정책",
      "v": "쿼터 약 500~550만t로 확대, FOB 하한 $430~440 (인도향 $500)",
      "d": "2026-09-18",
      "chg": "7월 수출 40.3만t",
      "trend": "up",
      "n": "3월 수출금지→5월 쿼터→9월 확대; 쿼터 성격 해석 이견",
      "src": "https://www.fertilizerdaily.com/20260918-china-urea-export-quota-2026-nitrogen-price-floor/"
     },
     {
      "l": "TTF 천연가스 (유럽)",
      "v": "€76.655/MWh (10/6 정산)",
      "d": "2026-10-06",
      "chg": "€70 상회 지속",
      "trend": "up",
      "n": "AGF Nitrogen 360만t 암모니아 감산 검토, LAT Grandpuits 영구 폐쇄",
      "src": "https://www.investing.com/commodities/ice-dutch-ttf-gas-c1-futures-historical-data"
     },
     {
      "l": "Henry Hub 천연가스",
      "v": "$3.27/MMBtu",
      "d": "2026-10-07",
      "chg": "+5% d/d, 월간 +12%",
      "trend": "up",
      "n": "주간 주입 64bcf (5년평균 80) — 미국 질소비료 원가 경쟁력 유지",
      "src": "https://tradingeconomics.com/commodity/natural-gas"
     },
     {
      "l": "세계은행 비료가격지수 전망",
      "v": "2026년 +30% 이상",
      "d": "2026-08-31",
      "chg": "2027년 완화 전망",
      "trend": "up",
      "n": "호르무즈 차질 2026Q3 이후 지속 시 상방 리스크",
      "src": "https://blogs.worldbank.org/en/opendata/fertilizer-prices-surge-as-strait-of-hormuz-disruptions-tighten-"
     }
    ],
    "drivers": [
     "호르무즈 차질로 걸프 요소 수출 -83%, 카타르 생산 중단 — 세계 요소 공급 14%+ 결손",
     "중국 수출 쿼터 확대(500~550만t)가 유일한 공급 완충, FOB 하한 $430~440로 하방 경직",
     "TTF €76/MWh로 유럽 암모니아 추가 감산·영구 폐쇄",
     "인도 NFL 입찰 600만t 응찰(목표 170만t)로 수요 과열"
    ],
    "risks": [
     "미-이란 협상 타결·호르무즈 정상화 시 요소 급락 (선물 커브 역전)",
     "미국 가을 시비 수요 피크 후 11월 계절적 약세",
     "러시아·벨라루스 칼륨 제재 변동"
    ],
    "dev": [
     {
      "d": "2026-10-05",
      "x": "미국 소매 요소 +9.1%, 암모니아 +15.9% w/w 급등",
      "src": "https://fertilizerprice.com/"
     },
     {
      "d": "2026-09-18",
      "x": "중국 요소 수출 쿼터·FOB 하한가 체계로 Q4 질소 교역 재편",
      "src": "https://www.fertilizerdaily.com/20260918-china-urea-export-quota-2026-nitrogen-price-floor/"
     }
    ]
   },
   {
    "id": "freight",
    "title": "해상운임",
    "metrics": [
     {
      "l": "발틱건화물지수 (BDI)",
      "v": "3,002",
      "d": "2026-10-06",
      "chg": "-68 (-2.2%), 8/25 이후 최저",
      "trend": "down",
      "n": "10/2 3,148에서 연속 하락",
      "src": "https://www.hellenicshippingnews.com/baltic-dry-bulk-freight-index-hits-six-week-low/"
     },
     {
      "l": "케이프사이즈 지수 / 일일수익",
      "v": "4,638 / $38,561",
      "d": "2026-10-06",
      "chg": "-195 (-4%) / -$1,769",
      "trend": "down",
      "n": "8/21 이후 최저",
      "src": "https://www.hellenicshippingnews.com/baltic-dry-bulk-freight-index-hits-six-week-low/"
     },
     {
      "l": "파나막스 지수 / 일일수익",
      "v": "2,366 / $21,294",
      "d": "2026-10-06",
      "chg": "+2 / +$21",
      "trend": "flat",
      "n": "곡물 수출 시즌 지지",
      "src": "https://www.hellenicshippingnews.com/baltic-dry-bulk-freight-index-hits-six-week-low/"
     },
     {
      "l": "Drewry WCI 종합",
      "v": "$4,434/FEU",
      "d": "2026-10-01",
      "chg": "-1% w/w",
      "trend": "down",
      "n": "상하이-NY $10,428(+1%), 상하이-LA $7,835, 상하이-제벨알리 $8,662; 골든위크 후 하락 전망",
      "src": "https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry"
     },
     {
      "l": "SCFI",
      "v": "3,686",
      "d": "2026-09-25",
      "chg": "-",
      "trend": "flat",
      "n": "10/2 발표치 미확인",
      "src": "https://www.oilpriceapi.com/prices/freight-indices/scfi-shanghai-containerized-freight-index"
     },
     {
      "l": "Freightos FBX 글로벌",
      "v": "3,341",
      "d": "2026-10-02",
      "chg": "보합 w/w",
      "trend": "flat",
      "n": "-",
      "src": "https://klse.i3investor.com/web/blog/detail/ceomorningbrief/2026-10-06-story-h502458146-Baltic_Exchange_Shipping_Updates_Oct_2_2026"
     },
     {
      "l": "VLCC TD3C (MEG-중국)",
      "v": "WS1,145 / TCE $1,221,893/일",
      "d": "2026-10-02",
      "chg": "-12.5pt w/w",
      "trend": "down",
      "n": "9월 평균 WS964.7(+84% m/m), 피크 WS1,200; 1년 TC $213,000/일",
      "src": "https://www.thedcn.com.au/news/baltic-exchange-weekly-report-2-october-2026"
     },
     {
      "l": "아프라막스 TD25 (USG-UKC)",
      "v": "WS730 / TCE ~$227,700/일",
      "d": "2026-10-02",
      "chg": "+34pt w/w",
      "trend": "up",
      "n": "수에즈막스 TD20 +289pt 급등",
      "src": "https://www.thedcn.com.au/news/baltic-exchange-weekly-report-2-october-2026"
     },
     {
      "l": "LNG선 BLNG1 (호주-일본) / BLNG2 (USG-유럽)",
      "v": "$37,700/일 / $28,600/일",
      "d": "2026-10-02",
      "chg": "+$1,300 / -$8,000 w/w",
      "trend": "down",
      "n": "대서양 선복 여유; 1년 TC $52,367/일; 3월 호르무즈 쇼크 시 $300,000/일 기록",
      "src": "https://klse.i3investor.com/web/blog/detail/ceomorningbrief/2026-10-06-story-h502458146-Baltic_Exchange_Shipping_Updates_Oct_2_2026"
     },
     {
      "l": "파나마운하 최대 흘수 / 일일 통항",
      "v": "49ft / 32→33척 (10/15~)",
      "d": "2026-09-28",
      "chg": "8월말 48ft에서 상향",
      "trend": "up",
      "n": "9월 강우로 완화되었으나 유역 적자 지속, 2027년까지 엘니뇨 대비; 가툰호 10월 평균 85.7ft 전망",
      "src": "https://pancanal.com/en/panama-canal-announces-increase-in-draft-and-daily-transit/"
     },
     {
      "l": "수에즈 컨테이너선 통항 (9월)",
      "v": "314척",
      "d": "2026-09-30",
      "chg": "+64% y/y, 후티 공격 이후 최고",
      "trend": "up",
      "n": "아시아-지중해 헤드홀 35% 복귀, 아시아-북유럽 6%; 1~8월 컨선 순톤수 +54.2%",
      "src": "https://www.lloydslist.com/LL1158637/Red-Sea-container-transits-hit-post-crisis-high-as-carriers-accelerate-return"
     },
     {
      "l": "홍해 전쟁위험",
      "v": "미 MARAD 경보 (9/23): 후티 섬 점령·상선 공격 재개",
      "d": "2026-09-23",
      "chg": "7/20 사우디 연계 선박 봉쇄 선언",
      "trend": "up",
      "n": "컨테이너 전쟁위험 할증이 기본운임 초과 사례",
      "src": "https://carraglobe.com/red-sea-carrier-return-2026/"
     }
    ],
    "drivers": [
     "VLCC TCE $120만/일 — 호르무즈·바브엘만데브 리스크 프리미엄 + 중국 용선 복귀",
     "케이프사이즈 6주 저점, BDI 3,000 테스트 — 중국 골든위크·철광석 둔화",
     "수에즈 복귀 가속(9월 314척)이 컨테이너 운임 하락 압력 vs 후티 재공격 리스크",
     "파나마운하 제한 완화(49ft/33척)로 미 걸프 곡물·LNG 수출 경로 안정"
    ],
    "risks": [
     "후티 공격 재확대 시 수에즈 복귀 재반전 → 컨테이너 운임 급등·희망봉 우회",
     "TD3C 스팟-FFA 괴리(Q4 FFA $18만 vs 스팟 $120만)로 급락 가능",
     "멕시코만 열대저기압(TD9) 금요일 북부 걸프 상륙 — 정유·LNG·곡물 터미널 일시 차질"
    ],
    "dev": [
     {
      "d": "2026-10-06",
      "x": "BDI 3,002로 6주 저점, 케이프 -4%",
      "src": "https://www.hellenicshippingnews.com/baltic-dry-bulk-freight-index-hits-six-week-low/"
     },
     {
      "d": "2026-10-02",
      "x": "머스크·하파그 제미니 수에즈 서비스 4개 추가, 코스코·OOCL 홍해 복귀",
      "src": "https://gcaptain.com/container-shipping-returns-to-suez-despite-rising-red-sea-risks/"
     },
     {
      "d": "2026-09-28",
      "x": "파나마운하 흘수 49ft 상향, 10/15부터 일 33척",
      "src": "https://pancanal.com/en/panama-canal-announces-increase-in-draft-and-daily-transit/"
     }
    ]
   },
   {
    "id": "weather",
    "title": "기상·기후",
    "metrics": [
     {
      "l": "NOAA ENSO (10/5 업데이트)",
      "v": "엘니뇨 주의보, 매우 강한 엘니뇨 >90%",
      "d": "2026-10-05",
      "chg": "OND 역대급(1950년 이후 최강) 확률 75%",
      "trend": "up",
      "n": "라니냐 확률 2027년 1~3월까지 0%; 10/8 진단 토론 발표 예정",
      "src": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
     },
     {
      "l": "호주 BOM ENSO",
      "v": "강한 엘니뇨, 근래 최고 수준",
      "d": "2026-10-01",
      "chg": "늦봄~여름 매우 강한 이벤트로 정점",
      "trend": "up",
      "n": "OND 전망: 서부·중부 다우, 북부·남동부 소우; 전국 고온",
      "src": "https://www.bom.gov.au/climate/ahead/outlooks/"
     },
     {
      "l": "미국 가뭄모니터",
      "v": "D1+ 59.4%, 이상건조+ 78.4%",
      "d": "2026-09-29",
      "chg": "-0.4%p w/w",
      "trend": "flat",
      "n": "겨울밀 면적 59% 가뭄(9/1); 남부평원 심각, 북부평원·중서부 개선",
      "src": "https://esmis.nal.usda.gov/sites/default/release-files/796062/wwcb3726.pdf"
     },
     {
      "l": "인도 2026 몬순 최종",
      "v": "LPA 87% (-12.6%)",
      "d": "2026-09-30",
      "chg": "2015년 이후 최악, 2001년 이후 4번째 저조",
      "trend": "down",
      "n": "동북부·동부 -25% (1901년 이후 최저); 10월도 평년 하회 예보, 5개 주 가뭄",
      "src": "https://www.business-standard.com/industry/agriculture/2026-monsoon-ends-with-nearly-13-rain-deficit-worst-since-2015-imd-126093001389_1.html"
     },
     {
      "l": "브라질 10월 강우 전망 (INMET)",
      "v": "마투그로수·고이아스 평년 하회, 기온 +2°C",
      "d": "2026-10-05",
      "chg": "10/7~ 약 1주 건조",
      "trend": "down",
      "n": "10/5~9 MT 강우 0.1~0.5인치, 10/13~18 회복 가능성(신뢰도 낮음)",
      "src": "https://www.agbull.com/u-s-harvest-poised-to-accelerate-as-brazils-planting-risks-persist/"
     },
     {
      "l": "브라질 미나스 커피벨트 강우",
      "v": "평년의 112%",
      "d": "2026-09-27",
      "chg": "개화기 양호",
      "trend": "up",
      "n": "-",
      "src": "https://cropgpt.ai/coffee-futures-jump-to-4-5-month-highs-on-brazil-rains-and-tightening-stocks"
     },
     {
      "l": "대서양 허리케인 (TD9 → 시즌 첫 허리케인)",
      "v": "금요일(10/9) 미 북부 걸프 상륙 예상",
      "d": "2026-10-07",
      "chg": "셰브론·셸·BP 비필수 인력 철수",
      "trend": "up",
      "n": "정유 6곳 영향권; 시즌 전망 8~14개 명명폭풍(평년 하회)",
      "src": "https://energynow.com/2026/10/storm-brewing-us-forecasts-hurricane-later-this-week-in-gulf-of-mexico/"
     },
     {
      "l": "흑해 파종 토양수분",
      "v": "러시아 남부 2년 연속 저수분, 로스토프 '사실상 무강수'",
      "d": "2026-10-08",
      "chg": "우크라 동계곡물 0.17백만ha (전년 0.26)",
      "trend": "down",
      "n": "우크라 겨울밀 면적 -10~15% 추정",
      "src": "https://www.graincentral.com/markets/daily-market-wire-08-october-2026/"
     },
     {
      "l": "파나마 가툰호",
      "v": "10월 평균 85.7ft 전망 (8월말 전망 82.6ft)",
      "d": "2026-09-28",
      "chg": "9월 강우로 상향",
      "trend": "up",
      "n": "엘니뇨로 2027년까지 재하락 리스크",
      "src": "https://www.indexbox.io/blog/panama-canal-eases-restrictions-as-rainfall-improves-gatun-lake-outlook/"
     }
    ],
    "drivers": [
     "1950년 이후 최강 가능성의 엘니뇨 — 인도·동남아·호주 동부·서아프리카 건조, 남미 남부·미 남부 다우 패턴",
     "인도 몬순 -12.6%로 쌀·설탕·면화 공급 및 수출정책 불확실성",
     "브라질 중서부 10월 건조·고온으로 대두 파종 지연 → 사프리냐 옥수수 창 압박",
     "흑해·남부 러시아 건조로 2027년 밀 공급 리스크 조기 가격화"
    ],
    "risks": [
     "10/8 NOAA 진단에서 '역대급' 확률 추가 상향 시 소프트·팜유 날씨 프리미엄 확대",
     "걸프 허리케인 상륙으로 정유·LNG·NOLA 비료 터미널 차질",
     "파나마 유역 엘니뇨 건기 진입 시 2027년 초 흘수 재제한"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "멕시코만 TD9, 수요일 열대폭풍 → 금요일 허리케인 상륙 전망; 메이저 인력 철수",
      "src": "https://oilprice.com/Latest-Energy-News/World-News/Chevron-Shell-and-BP-Pull-Workers-From-the-Gulf-Ahead-of-Hurricane.html"
     },
     {
      "d": "2026-10-05",
      "x": "NOAA CPC: 매우 강한 엘니뇨 >90%, OND 역대급 75%",
      "src": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
     },
     {
      "d": "2026-09-30",
      "x": "IMD: 2026 몬순 LPA 87%로 종료, 2015년 이후 최악",
      "src": "https://www.business-standard.com/industry/agriculture/2026-monsoon-ends-with-nearly-13-rain-deficit-worst-since-2015-imd-126093001389_1.html"
     }
    ]
   }
  ],
  "positioning": [
   {
    "l": "옥수수 매니지드머니 순포지션",
    "v": "+381,220 계약 (롱 439,843 / 숏 58,623)",
    "d": "2026-09-29",
    "chg": "w/w 변화 미확인",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "l": "대두 매니지드머니 순포지션",
    "v": "+246,558 계약 (롱 280,875 / 숏 34,317)",
    "d": "2026-09-29",
    "chg": "w/w 변화 미확인",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "l": "SRW 밀 매니지드머니 순포지션",
    "v": "-22,109 계약 (롱 82,747 / 숏 104,856)",
    "d": "2026-09-29",
    "chg": "9/15 -3,674 대비 숏 확대",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "l": "HRW 밀 매니지드머니 순포지션",
    "v": "+30,677 계약 (롱 71,011 / 숏 40,334)",
    "d": "2026-09-29",
    "chg": "w/w 변화 미확인",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "l": "원당 No.11 매니지드머니 순포지션",
    "v": "+218,336 계약 (롱 314,903 / 숏 96,567)",
    "d": "2026-09-29",
    "chg": "9/22 +216,629 대비 약 +1,700",
    "src": "https://futuresbench.com/cot/sugar/"
   },
   {
    "l": "면화 매니지드머니 순포지션",
    "v": "+67,837 계약 (롱 84,353 / 숏 16,516)",
    "d": "2026-09-29",
    "chg": "9/8 +95,367 대비 3주간 약 -27,500",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "l": "아라비카 커피 매니지드머니 순포지션",
    "v": "+16,206 계약 (롱 34,571 / 숏 18,365)",
    "d": "2026-09-29",
    "chg": "9/8 +22,109 대비 약 -5,900",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "l": "코코아 매니지드머니 순포지션",
    "v": "-4,750 계약 (최신 확인치, 9월초 추정)",
    "d": "2026-09-08",
    "chg": "전주 -10,458 대비 숏 축소",
    "src": "https://www.xtb.com/en/market-analysis/cocoa-gains-1-and-tests-the-6-000-area-how-are-funds-positioned"
   }
  ],
  "calendar": [
   {
    "d": "2026-10-08",
    "x": "NOAA CPC ENSO 월간 진단 토론 발표",
    "why": "역대급 엘니뇨 확률 상향 여부 — 소프트·팜유·호주 밀 날씨 프리미엄",
    "src": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
   },
   {
    "d": "2026-10-08",
    "x": "Drewry WCI 주간 발표 / USDA 주간 수출판매 (10/1주)",
    "why": "골든위크 후 컨테이너 운임 하락 확인, 중국 대두 구매 지속 여부",
    "src": "https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry"
   },
   {
    "d": "2026-10-09",
    "x": "USDA 10월 WASDE·Crop Production (11:00 CT)",
    "why": "옥수수 단수 178.5→177.8 하향 여부, 구곡 재고 20.95억bu 반영, 대두 재고 3.10억bu",
    "src": "https://www.profarmer.com/news/agriculture-news/october-wasde-preview-key-metrics-watch-corn-soybeans-wheat-and-cotton"
   },
   {
    "d": "2026-10-09",
    "x": "CFTC COT (10/6 기준) 발표",
    "why": "옥수수 38만·설탕 22만 계약 순롱 과밀 포지션 변화",
    "src": "https://www.indexbox.io/blog/cftc-weekly-positioning-data-shows-divergent-crop-and-energy-bets/"
   },
   {
    "d": "2026-10-09",
    "x": "멕시코만 허리케인 북부 걸프 상륙 예상",
    "why": "정유 6곳·LNG·NOLA 비료 및 곡물 수출 터미널 차질",
    "src": "https://energynow.com/2026/10/storm-brewing-us-forecasts-hurricane-later-this-week-in-gulf-of-mexico/"
   },
   {
    "d": "2026-10-12",
    "x": "MPOB 9월 팜유 수급 발표",
    "why": "재고 337만t 사상최고 경신 여부 — 식물성유지 방향",
    "src": "https://bepi.mpob.gov.my/"
   },
   {
    "d": "2026-10-13",
    "x": "USDA 작황보고 (10/11 기준)",
    "why": "옥수수·대두 수확 가속 여부, 겨울밀 발아 상태",
    "src": "https://www.nass.usda.gov/Publications/Todays_Reports/reports/prog4026.pdf"
   },
   {
    "d": "2026-10-15",
    "x": "파나마운하 일 통항 33척으로 확대 시행",
    "why": "미 걸프→아시아 곡물·LNG 경로 비용",
    "src": "https://newsroompanama.com/2026/09/28/panama-canal-increases-daily-transits-to-33-and-maximum-draft-to-49-feet/"
   },
   {
    "d": "2026-10-15",
    "x": "Conab 10월 브라질 곡물 수급 보고 (예정일 추정)",
    "why": "대두 1억8,160만t 기록 전망·파종 지연 반영 여부",
    "src": "https://www.global-agriculture.com/latam-agriculture/brazils-conab-projects-record-soybean-crop-as-planting-lags/"
   }
  ],
  "judgments": [
   "10/9 WASDE 전 옥수수는 구곡 재고 상향(+1.73억bu)이 단수 소폭 하향을 상쇄해 $5.00 상단 저항이 유효하며, 펀드 순롱 38만 계약이 과밀해 실망 시 하방 변동성이 크다 (근거: Pro Farmer 프리뷰 단수 177.8 vs 178.5, CFTC 9/29 포지션).",
   "밀은 흑해 공급 차질(러 터미널 20% 손상, 우크라 9월 수출 -37%, 러 동계파종 2013년 이후 최저)이 SRW 펀드 순숏(-2.2만)과 맞물려 숏커버 랠리 여지가 있으나 휴전 헤드라인 리스크가 양방향이다 (근거: Reuters 9/25 터미널 80% 재가동 가능, SovEcon 파종 데이터).",
   "팜유는 10/12 MPOB에서 재고 337만t 사상최고가 확인될 경우 RM4,500 하향 이탈 가능성이 높고 대두유·카놀라에 전염되며, 중기적으로는 엘니뇨 생산 감소가 2027년 상반기 반등 재료다 (근거: 로이터 서베이 재고 +19.5%, NOAA 엘니뇨 >90%).",
   "원당은 ISO 적자 전환·브라질 설탕 배분비 급감·인도 몬순 -12.6%로 펀더멘털은 강하지만 펀드 순롱 21.8만 계약과 헤알 의존도가 높아 20¢ 위에서는 롱 추가보다 콜 스프레드 등 비대칭 전략이 유리하다 (근거: CFTC 9/29, UNICA 배분비 42.5%, IMD 최종).",
   "비료는 호르무즈 요소 수출 -83%·TTF €76에 미국 소매 요소 +9%/암모니아 +16% w/w로 급등 중이며, 중국 쿼터 확대가 유일한 완충이라 미-이란 협상 진전 헤드라인이 최대 하방 리스크다 (근거: UN 8월 분석, FertilizerPrice 10/5, Fertilizer Daily 9/18).",
   "탱커는 TD3C TCE $120만/일이 Q4 FFA($18만)와 극단 괴리되어 평균회귀 리스크가 크고, 건화물은 BDI 3,000 지지 테스트 중이라 케이프 숏/파나막스 롱 스프레드가 곡물 수출 시즌과 정합적이다 (근거: Baltic 10/2 주간, BDI 10/6 3,002)."
  ],
  "gaps": [
   "10월 WASDE 실제 수치 (10/9 발표 예정, 미공개)",
   "러시아 밀 FOB 노보로시스크 10월 호가 (IKAR/SovEcon 주간치 미검색), 러시아 수출세 주간 공식 고시 미확인",
   "원당 No.11 3월물 10/6~7 공식 정산가 (Trading Economics 20.26¢ 외 교차확인 불가)",
   "코코아 매니지드머니 9/29 기준 순포지션, 옥수수·대두 w/w 변화량",
   "UNICA 9월 하반기 중남부 생산 데이터, Conab 마투그로수 주별 파종률",
   "SCFI 10/2 발표치, Drewry WCI 10/8 발표치, LNG선 전쟁위험 보험료 구체 수치",
   "US Drought Monitor 10월 첫 발표(10/1·10/8) 수치, 흑해 10월 강우 데이터",
   "목재(lumber)·고무 10월 가격, 해바라기유 10월 흑해 FOB 호가",
   "린호그 10월물 정확한 정산가 (브라운필드 월물 표기 혼선)",
   "인도 10월 쌀·밀 수출정책 변경 여부 (DGFT 고시 미확인), 중국 10월 대두 신규 구매 보도 없음"
  ]
 },
 "macro": {
  "groups": [
   {
    "id": "rates",
    "title": "금리·통화정책",
    "metrics": [
     {
      "l": "연준 기준금리",
      "v": "3.75–4.00%",
      "d": "2026-09-16",
      "chg": "+25bp",
      "trend": "up",
      "n": "2023년 이후 첫 인상, 12명 만장일치. 점도표 2026말 중앙값 4.1%(16/18명 추가 인상), 워시 의장은 점 미제출",
      "src": "https://www.cnbc.com/2026/09/16/fed-rate-decision-september-2026.html"
     },
     {
      "l": "10/28 FOMC 시장확률",
      "v": "동결 ~80% / 인상 ~20% / 인하 ~0–1%",
      "d": "2026-10-07",
      "chg": "인상확률 ~70%→~20% (9월 고용·PCE 이후)",
      "trend": "down",
      "n": "CME 선물·Kalshi 기준. 9월 FOMC 의사록 10/7 공개",
      "src": "https://predictionmarketspicks.com/tools/fed-rate-tracker"
     },
     {
      "l": "미 2년물",
      "v": "4.77%",
      "d": "2026-10-07",
      "chg": "-2bp",
      "trend": "flat",
      "n": "재무부 par 커브 기준(TE 4.80%)",
      "src": "https://yourbestsavings.com/treasury-yields/"
     },
     {
      "l": "미 10년물",
      "v": "5.28%",
      "d": "2026-10-07",
      "chg": "+1bp",
      "trend": "up",
      "n": "10/5 2002년 4월 이후 최고(장중 5.35%); 10s-2s +51bp",
      "src": "https://www.cnbc.com/2026/10/06/treasury-yields-fed-fomc-minutes.html"
     },
     {
      "l": "미 30년물",
      "v": "5.67%",
      "d": "2026-10-07",
      "chg": "+3bp",
      "trend": "up",
      "n": "2002년 5월 이후 최고 수준",
      "src": "https://fred.stlouisfed.org/series/dgs30"
     },
     {
      "l": "10년 TIPS 실질금리",
      "v": "2.90%",
      "d": "2026-10-06",
      "chg": "9/25 2.83%→",
      "trend": "up",
      "n": "9/17 10년 TIPS 입찰 2.653%, 2008년 이후 최고 — 금·구리 등 무이자 자산 역풍",
      "src": "https://streetstats.finance/rates/tips"
     },
     {
      "l": "10년 BEI",
      "v": "2.36%",
      "d": "2026-10-05",
      "chg": "9/25 2.34%→",
      "trend": "flat",
      "n": "명목금리 상승은 실질금리 주도",
      "src": "https://fred.stlouisfed.org/series/t10yie"
     },
     {
      "l": "ECB 예금금리",
      "v": "2.50%",
      "d": "2026-09-10",
      "chg": "+25bp",
      "trend": "up",
      "n": "10/29 회의: 동결 ~72%(집계), 인상 24%; 9개 회의간 84bp 인상 가격",
      "src": "https://oraclemarkets.io/dashboards/ecb-rates"
     },
     {
      "l": "BOE 기준금리",
      "v": "3.75%",
      "d": "2026-09-17",
      "chg": "동결(6-3, 3명 인상)",
      "trend": "flat",
      "n": "11/5 인상확률 ~80–83%(스왑), 8월 CPI 3.1%",
      "src": "https://hoa.org.uk/news/interest-rate-predictions-2/"
     },
     {
      "l": "BOJ 정책금리",
      "v": "1.25%",
      "d": "2026-09-18",
      "chg": "+25bp (7-2)",
      "trend": "up",
      "n": "1995년 이후 최고. 10/30 동결 전망 우세, 연속 인상 확률 20–30%(모마)",
      "src": "https://www.cnbc.com/2026/09/18/japan-raises-rates-30-year-high-yen-jgb.html"
     },
     {
      "l": "한은 기준금리",
      "v": "3.00%",
      "d": "2026-08-27",
      "chg": "+25bp (7월·8월 연속)",
      "trend": "up",
      "n": "10/22 회의 추가 인상 가능성(UOB: 10월·1월 → 3.25%)",
      "src": "https://tradingeconomics.com/south-korea/interest-rate"
     },
     {
      "l": "중국 LPR 1y/5y",
      "v": "3.00% / 3.50%",
      "d": "2026-09-22",
      "chg": "동결",
      "trend": "flat",
      "n": "9/29 PSL 1년물 1.5%로 25bp 인하, 첫 주택구입 이자보조; 다음 LPR 10/20",
      "src": "https://en.macromicro.me/series/5863/cn-loan-prime-rate-1y"
     }
    ],
    "drivers": [
     "연준·ECB·BOJ·한은 동시 긴축 사이클 — 에너지발 인플레(유로존 9월 HICP 3.8%, 미 PCE 3.4%)에 대응",
     "미 10년 5.3%·30년 5.7%로 2002년 이후 최고 — 장기물 텀프리미엄·재정 우려가 커브 스티프닝 주도",
     "9월 고용 +2.9만·실업 4.2%로 10월 인상 기대 급감, 시장은 '동결 후 12월' 가격"
    ],
    "risks": [
     "9월 CPI(10/14) 3.6% 상회 시 10월 인상 재부각 → 달러·실질금리 급등",
     "MOVE 113→105 급락 후 재상승 시 헤지펀드 베이시스 거래 디레버리징(국채 7% 보유)",
     "BOJ 10/30 서프라이즈 인상 시 엔캐리 청산"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "9월 FOMC 의사록 공개; MOVE 7.4% 급락(105.21), 10y 5.31% 부근 유지",
      "src": "https://www.home.saxo/en-mena/content/articles/options/rates-volatility-cracks-the-yield-holds---options-brief---7-october-2026-07102026"
     },
     {
      "d": "2026-10-05",
      "x": "미 10년물 2002년 4월 이후 최고, 30년 2002년 5월 이후 최고 기록",
      "src": "https://www.cnbc.com/2026/10/06/treasury-yields-fed-fomc-minutes.html"
     },
     {
      "d": "2026-10-02",
      "x": "ECB 이사진 10월 추가 인상 가능성 시사 vs 이코노미스트 다수는 12월 인상 전망",
      "src": "https://www.bloomberg.com/news/articles/2026-09-18/ecb-officials-pave-way-for-more-tightening-as-inflation-worsens"
     },
     {
      "d": "2026-09-30",
      "x": "헤지펀드 국채 보유 비중 사상 최대 7%, 베이시스 거래 $1.2조(-20% YTD)",
      "src": "https://www.cnbc.com/2026/09/30/us-treasury-market-is-relying-more-on-hedge-funds.html"
     }
    ]
   },
   {
    "id": "fx",
    "title": "외환",
    "metrics": [
     {
      "l": "DXY",
      "v": "102.36",
      "d": "2026-10-07",
      "chg": "+0.51%",
      "trend": "up",
      "n": "2025년 4월 이후 최고 근접, RSI 71(과매수)",
      "src": "https://tradingeconomics.com/dxy:cur"
     },
     {
      "l": "EURUSD",
      "v": "1.1229",
      "d": "2026-10-07",
      "chg": "-0.27%",
      "trend": "down",
      "n": "단일 출처(TE), 미검증",
      "src": "https://tradingeconomics.com/dxy:cur"
     },
     {
      "l": "USDJPY",
      "v": "158.29",
      "d": "2026-10-07",
      "chg": "9월말 157.95 부근",
      "trend": "up",
      "n": "160 개입 경계선. 8월 미·일 공조개입(2011년 이후 첫), 8월 개입액 15.4조엔 사상 최대",
      "src": "https://www.cnbc.com/2026/08/03/yen-intervention-us-japan-trump-bessent-katayama.html"
     },
     {
      "l": "USDCNY",
      "v": "6.7048",
      "d": "2026-10-07",
      "chg": "+0.05%",
      "trend": "flat",
      "n": "7월 고시 6.79대 이후 위안 강세 지속, 인민은행 고시로 강세 속도 제어",
      "src": "https://tradingeconomics.com/china/currency"
     },
     {
      "l": "USDKRW",
      "v": "1,339.66",
      "d": "2026-10-07",
      "chg": "+0.14%",
      "trend": "down",
      "n": "50일 평균 1,382 하회, 반도체 수출 호조·한은 긴축으로 원화 강세(30일 저점 1,338.6)",
      "src": "https://tradingeconomics.com/south-korea/currency"
     },
     {
      "l": "USDINR",
      "v": "95.82",
      "d": "2026-09-25",
      "chg": "YTD +6.2%(달러)",
      "trend": "up",
      "n": "루피 약세 지속, 러시아 원유 관세 리스크",
      "src": "https://cambridgecurrencies.com/usd-forecast-2026/"
     },
     {
      "l": "AUDUSD",
      "v": "0.6973",
      "d": "2026-10-07",
      "chg": "1개월 -3.4%",
      "trend": "down",
      "n": "상품통화 약세, RSI 37, 이평선 0.709 하회",
      "src": "https://tradingeconomics.com/australia/currency"
     },
     {
      "l": "USDBRL",
      "v": "수치 미확인(랠리)",
      "d": "2026-10-05",
      "chg": "FX 4–5% 강세 예상(애버딘)",
      "trend": "down",
      "n": "10/4 1차 투표 F.볼소나루 47.3% vs 룰라 44.8% → 10/25 결선, 브라질 자산 급등",
      "src": "https://www.cnbc.com/2026/10/05/brazilian-stocks-jump-bolsonaro-now-heavy-favorite-to-win-presidency.html"
     },
     {
      "l": "금 현물",
      "v": "$4,161",
      "d": "2026-10-01",
      "chg": "9월 -6.6%",
      "trend": "down",
      "n": "52주 고점 $5,598; 실질금리·달러 상승이 압박, MS '$4,000 바닥'",
      "src": "https://invezz.com/ng/news/2026/10/01/gold-prices-stall-near-dollar4160-despite-dollar38-billion-etf-inflows-heres-why/"
     }
    ],
    "drivers": [
     "미 금리 5%대·유가 $100 → 달러 강세, EM·상품통화 약세(AUD -3.4%/월)",
     "엔 160 방어 개입 반복 vs BOJ 점진 인상 — 미일 금리차 축소 제한적",
     "원화는 반도체 수출 사상 최대(9월 $1,209억)·경상흑자로 역행 강세"
    ],
    "risks": [
     "USDJPY 160 돌파 시 3차 공조개입 → 달러 급변동",
     "미 10년 6% 논쟁 확산 시 EM 채권 자금이탈(9월 EM채 -2.9%)",
     "브라질 결선(10/25) 결과 반전 시 헤알 급락"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "DXY 102.4, 2025년 4월 이후 최고 근접; 고금리·고유가가 달러 지지",
      "src": "https://www.instaforex.eu/forex_analysis/459359"
     },
     {
      "d": "2026-10-05",
      "x": "브라질 1차 투표 후 페트로브라스·발레 급등, 결선 볼소나루 승리 확률 80%+",
      "src": "https://www.cnbc.com/2026/10/05/brazilian-stocks-jump-bolsonaro-now-heavy-favorite-to-win-presidency.html"
     },
     {
      "d": "2026-09-30",
      "x": "가타야마 재무상 구두개입에 엔 0.6% 강세(157.95)",
      "src": "https://tradingeconomics.com/japan/currency/news/504605"
     }
    ]
   },
   {
    "id": "growth",
    "title": "성장·물가",
    "metrics": [
     {
      "l": "미 9월 비농업고용",
      "v": "+29k / 실업 4.2%",
      "d": "2026-10-02",
      "chg": "예상 84k 하회, 7·8월 -60k 수정",
      "trend": "down",
      "n": "시간당임금 +3.0% y/y, 참가율 61.8%",
      "src": "https://www.cnbc.com/2026/10/02/jobs-report-september-2026.html"
     },
     {
      "l": "미 8월 핵심 PCE",
      "v": "3.0% y/y (헤드라인 3.4%)",
      "d": "2026-09-30",
      "chg": "예상 3.3% 하회",
      "trend": "down",
      "n": "7월 연간치 3.3→3.0% 하향 수정 포함; 9월 PCE 10/29",
      "src": "https://www.fxstreet.com/news/us-core-pce-inflation-set-to-rise-in-august-pressuring-the-federal-reserve-202609300830"
     },
     {
      "l": "미 8월 CPI",
      "v": "3.4% y/y",
      "d": "2026-09-11",
      "chg": "9월 컨센 3.6%",
      "trend": "up",
      "n": "9월 CPI 10/14 08:30 ET 발표",
      "src": "https://www.financecalendar.com/us-cpi-report/"
     },
     {
      "l": "미 S&P 제조업/종합 PMI (9월)",
      "v": "55.9 / 58.4",
      "d": "2026-10-01",
      "chg": "8월 53.9 / 56.0",
      "trend": "up",
      "n": "2022년 5월 이후 최고; 철강·전자 부족, 관세·에너지로 투입가격 재가속",
      "src": "https://tradingeconomics.com/united-states/manufacturing-pmi"
     },
     {
      "l": "GDPNow Q3",
      "v": "3.68%",
      "d": "2026-10-06",
      "chg": "Q2 확정 2.2%",
      "trend": "up",
      "n": "Q3 속보치 10/29",
      "src": "https://fred.stlouisfed.org/series/GDPNOW/"
     },
     {
      "l": "글로벌 제조업 PMI (JPM)",
      "v": "53.0",
      "d": "2026-10-01",
      "chg": "8월 52.3",
      "trend": "up",
      "n": "55개월 최고 — AI 인프라·국방지출",
      "src": "https://datatrack.trendforce.com/Chart/content/678/jpmorgan-global-manufacturing-pmi"
     },
     {
      "l": "중국 NBS 제조업 PMI (9월)",
      "v": "50.1 (비제조업 50.2)",
      "d": "2026-09-30",
      "chg": "8월 49.8",
      "trend": "up",
      "n": "원자재 구매가격 60.8·출하가격 54.0 급등, 고용 48.4; RatingDog 52.1",
      "src": "https://investinglive.com/news/china-official-manufacturing-pmi-returns-to-growth-at-50-1-non-manufacturing-50-2/"
     },
     {
      "l": "중국 8월 신규 위안대출",
      "v": "600억 위안",
      "d": "2026-09-16",
      "chg": "전년比 -5,300억",
      "trend": "down",
      "n": "가계대출 -2,029억, 대출잔액 +4.9%; 9월 데이터 10월 중순",
      "src": "https://www.caixinglobal.com/2026-09-16/chinas-new-loans-aggregate-financing-plunge-102485370.html"
     },
     {
      "l": "중국 Q2 GDP / 8월 수출",
      "v": "4.3% y/y / +25% y/y",
      "d": "2026-09-08",
      "chg": "Q2 3년래 최저",
      "trend": "flat",
      "n": "연 목표 4.5–5%; Q3 GDP 10/19, 9월 무역 10/14",
      "src": "https://www.bloomberg.com/news/articles/2026-09-08/china-export-growth-rebounds-as-ai-boom-offsets-extreme-weather"
     },
     {
      "l": "유로존 9월 HICP (속보)",
      "v": "3.8% (핵심 2.5%)",
      "d": "2026-10-02",
      "chg": "8월 3.2%, 예상 3.6%",
      "trend": "up",
      "n": "에너지 18.8% y/y; 확정치 10/16",
      "src": "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-02102026-ap"
     },
     {
      "l": "한국 9월 수출",
      "v": "$1,209억 (+83.5%)",
      "d": "2026-10-01",
      "chg": "반도체 $603억 (+263%)",
      "trend": "up",
      "n": "무역흑자 $498.5억 사상 최대, 비반도체 +23%",
      "src": "https://www.koreatimes.co.kr/economy/20261001/koreas-sept-exports-hit-record-1209-bil-on-robust-chip-sales"
     },
     {
      "l": "한국 9월 CPI",
      "v": "2.9% (핵심 2.8%)",
      "d": "2026-10-02",
      "chg": "8월 3.1%",
      "trend": "down",
      "n": "석유류 +14.8%, 유류가격상한 -0.6%p 효과; 한은 10월 3% 근접 전망",
      "src": "https://www.koreatimes.co.kr/economy/20261002/consumer-prices-up-29-in-september"
     },
     {
      "l": "IMF 2026 세계성장",
      "v": "3.0% (2027 3.4%)",
      "d": "2026-07-01",
      "chg": "4월 3.1%→",
      "trend": "down",
      "n": "10월 WEO 10/13 방콕 연차총회; 세계은행 2.5%",
      "src": "https://finance.yahoo.com/news/imf-edges-2026-global-growth-130116533.html"
     },
     {
      "l": "미 SPR 재고",
      "v": "283.0백만 배럴",
      "d": "2026-10-02",
      "chg": "4월 이후 -128mb",
      "trend": "down",
      "n": "1982–83년 이후 최저; 4,000만 배럴 추가 교환 입찰(10/6), 11–12월 인도",
      "src": "https://www.rigzone.com/news/usa_continues_strategic_petroleum_reserve_release-05-oct-2026-184770-article/"
     }
    ],
    "drivers": [
     "미국 고용 둔화 vs PMI 58.4 호황의 괴리 — AI·국방 투자 주도 성장, 노동시장은 냉각",
     "에너지 쇼크(호르무즈 폐쇄) → 유로존·영국·한국 물가 재상승, 중국 PMI 투입가격 60.8",
     "한국 반도체 수출 사상 최대 → 원화·KOSPI 지지, 한은 긴축 여지"
    ],
    "risks": [
     "미 9월 CPI 3.6%+ 시 스태그플레이션 내러티브 강화",
     "중국 신용 급감·부동산 부진 → 산업금속 수요 실망",
     "IMF 10/13 성장 하향 시 리스크오프"
    ],
    "dev": [
     {
      "d": "2026-10-02",
      "x": "미 9월 고용 +2.9만, 실업 4.2%; Kalshi 10월 동결 85%",
      "src": "https://www.cnbc.com/2026/10/02/jobs-report-september-2026.html"
     },
     {
      "d": "2026-10-02",
      "x": "유로존 9월 HICP 3.8% 서프라이즈, 에너지 18.8%",
      "src": "https://www.fxstreet.com/news/eurozone-flash-hicp-rises-faster-by-38-yoy-in-september-beats-36-estimates-202610020904"
     },
     {
      "d": "2026-09-30",
      "x": "중국 9월 NBS PMI 50.1로 확장 복귀, 원자재 구매가격 60.8",
      "src": "http://english.scio.gov.cn/pressroom/2026-09/30/content_118718778.html"
     },
     {
      "d": "2026-09-29",
      "x": "중국 부동산 패키지: PSL 1.5% 인하, 첫주택 모기지 이자보조(≤150만 위안·120㎡)",
      "src": "https://www.bnnbloomberg.ca/business/international/2026/09/29/china-rolls-out-new-measures-to-bolster-its-property-sector-and-economy/"
     }
    ]
   },
   {
    "id": "policy_trade",
    "title": "정책·무역·제재",
    "metrics": [
     {
      "l": "미 232조 금속관세",
      "v": "원자재 50% / 파생품 25% / 미국산 금속 10%",
      "d": "2026-06-01",
      "chg": "4/6 전체 관세가액 기준 적용, 6/1 파생품 추가",
      "trend": "flat",
      "n": "구리·철강·알루미늄 동일; 금속함량 <15% 면제, 산업·전력장비 15%(~2027말), 러시아산 알루미늄 200%",
      "src": "https://globaltaxnews.ey.com/news/2026-1175-us-issues-proclamation-further-adjusting-section-232-tariff-regimes-for-aluminum-steel-and-copper-expanded-reduced-rates-and-revised-thresholds-announced"
     },
     {
      "l": "미 글로벌 관세 체제",
      "v": "301조 10%/12.5% (60개국)",
      "d": "2026-07-24",
      "chg": "IEEPA 위헌(2/20)→122조 10% 만료(7/24)→301조",
      "trend": "flat",
      "n": "IEEPA 환급 진행(4/20 1단계); 16개국 과잉생산 301조 조사 진행",
      "src": "https://globaltradealert.org/reports/S122-US-Tariff-Estimates"
     },
     {
      "l": "미중 휴전·희토류 통제 유예",
      "v": "2027-01-10까지 연장",
      "d": "2026-09-23",
      "chg": "11/10 → 1/10 (2개월 연장)",
      "trend": "flat",
      "n": "대중관세 36.5%·대미관세 31%; 농산물 $170억 구매 미이행, 희토류 선적 미달",
      "src": "https://www.aljazeera.com/economy/2026/9/24/hostile-but-hooked-whats-behind-the-us-china-trade-truce-extension"
     },
     {
      "l": "갈륨·게르마늄·안티몬 대미 수출금지 유예",
      "v": "2026-11-27 만료",
      "d": "2026-10-05",
      "chg": "연장 발표 없음",
      "trend": "flat",
      "n": "군사용 금지 조항은 유지, 라이선스 필요; 안티몬 구매자 시한 압박",
      "src": "https://www.stocktitan.net/news/AEM/antimony-market-faces-a-nov-27-export-control-deadline-from-b3yjbydljmq1.html"
     },
     {
      "l": "Graham 제재법(러·이란)",
      "v": "10/18 이행 시한",
      "d": "2026-09-18",
      "chg": "서명 후 30일",
      "trend": "up",
      "n": "러시아 원유·가스 상위 5 수입국·우회 5개국 전품목 최대 100% 관세; 중국·인도·터키 거론, 대통령 면제권",
      "src": "https://www.squirepattonboggs.com/insights/publications/sanctions-by-statute-the-graham-act-and-tariffs-on-russia-s-energy-buyers/"
     },
     {
      "l": "인도 러시아 원유수입",
      "v": "8월 -16.5% m/m",
      "d": "2026-09-30",
      "chg": "9월 추가 감소 전망",
      "trend": "down",
      "n": "인도 '에너지 안보 우선' 반발, 정유사 10월 물량 확보·쿼터 요구",
      "src": "https://oilprice.com/Latest-Energy-News/World-News/Indias-Russian-Oil-Imports-Slide-as-Refiners-Hunt-for-Alternatives.html"
     },
     {
      "l": "EU 러시아 유가상한",
      "v": "$44.1 (2/1 발효)",
      "d": "2026-08-03",
      "chg": "$47.6→$44.1; 미국 미동참",
      "trend": "down",
      "n": "21차 패키지 그림자선단 300척+ 지정(상한 $60 동결 보도와 상충); 상한제 폐지·전면 서비스금지 검토",
      "src": "https://researchbriefings.files.parliament.uk/documents/CBP-10342/CBP-10342.pdf"
     },
     {
      "l": "이란 제재(OFAC)",
      "v": "GL X 폐지, 추정거부 정책",
      "d": "2026-10-05",
      "chg": "10/1 자동차·철도 섹터 제재, 10/5 외국금융기관 통지",
      "trend": "up",
      "n": "6월 MOU 60일 면제→7/7 철회; 호르무즈 통행 요구 제재리스크 경보(8/24)",
      "src": "https://ofac.treasury.gov/sanctions-programs-and-country-information/iran-sanctions"
     },
     {
      "l": "호르무즈 해협",
      "v": "10/4 통과 4척 (평시 85척)",
      "d": "2026-10-08",
      "chg": "9/28 이후 선박 8척 피격",
      "trend": "down",
      "n": "2/28 폐쇄, 4/7 휴전·6/17 MOU 후 7월 초 재붕괴; 이란 7개 재개방 조건",
      "src": "https://straits.live/"
     },
     {
      "l": "OPEC+ 7개국",
      "v": "11월 목표 유지(사우디 10.5, 러 9.9mb/d)",
      "d": "2026-10-04",
      "chg": "동결",
      "trend": "flat",
      "n": "걸프 실제생산 쿼터 크게 하회(수출 60–80%); 다음 회의 11/1, 2027 전 조정 어려움",
      "src": "https://www.cnbc.com/2026/10/04/opec-agrees-to-keep-november-oil-output-targets-steady.html"
     },
     {
      "l": "RFS 2026–27 (RVO)",
      "v": "BBD 8.86/8.95bn RINs, 전통 15bn gal",
      "d": "2026-06-15",
      "chg": "제안 대비 상향, SRE 70% 재배분",
      "trend": "up",
      "n": "수입 RIN 감축 2028년으로; 45Z 최종규정 11월 예상(IRS Notice 2026-53 9/8)",
      "src": "https://www.epa.gov/renewable-fuel-standard/final-renewable-fuel-standards-2026-and-2027"
     },
     {
      "l": "EU CBAM",
      "v": "인증서 Q1 €75.36 / Q2 €75.28",
      "d": "2026-07-06",
      "chg": "Q3 가격 10/5 발표 예정(미확인)",
      "trend": "flat",
      "n": "2026 확정단계 첫해, 판매 2027-02-01 개시, 2026 수입분 2027-09-30 제출",
      "src": "https://sentra.world/blogs/cbam/cbam-certificate-price/"
     },
     {
      "l": "EU 삼림벌채규정(EUDR)",
      "v": "2026-12-30 적용",
      "d": "2026-09-30",
      "chg": "2차 연기 확정, 추가 연기 배제",
      "trend": "flat",
      "n": "소규모 2027-06-30; 팜유·대두·코코아·커피·고무·목재",
      "src": "https://polygon-one.com/en/eudr-current-status"
     },
     {
      "l": "아르헨티나 대두 수출세",
      "v": "24% (부산물 22.5%)",
      "d": "2026-06-03",
      "chg": "밀·보리 7.5→5.5%",
      "trend": "down",
      "n": "2027.1부터 월 0.25p→2027말 21%, 2028말 15% 계획(재정 조건부)",
      "src": "https://www.fas.usda.gov/data/gain/2026/06/argentina-argentina-further-cuts-agricultural-export-taxes"
     },
     {
      "l": "인도네시아 수출정책",
      "v": "국영 단일창구(팜유·석탄·합금철)",
      "d": "2026-05-25",
      "chg": "6월 1단계→9월 전면 계획",
      "trend": "flat",
      "n": "니켈(2020)·보크사이트(2023) 금지 유지; 9월 전면시행 여부 미확인",
      "src": "https://www.foodnavigator-asia.com/Article/2026/05/25/indonesia-palm-oil-export-controls-impacts-on-global-food-sector/"
     },
     {
      "l": "중국 비국영 원유수입쿼터",
      "v": "2026년 2.57억 톤",
      "d": "2026-04-08",
      "chg": "4월 5,500만 톤 추가(이란 공급차질 대응)",
      "trend": "flat",
      "n": "2027 1차 배정 미발표(통상 11–12월)",
      "src": "https://chinaglobalsouth.com/2026/04/09/china-teapot-refiners-crude-import-quotas/"
     }
    ],
    "drivers": [
     "Graham법 10/18 시한 — 인도·터키·중국 러시아 원유 수입에 2차 관세 위협, 인도 수입 축소 중",
     "호르무즈 사실상 폐쇄 장기화 + OPEC+ 실생산 쿼터 하회 → Brent $100 고착, SPR 1982년 이후 최저",
     "미중 휴전 1/10 연장으로 희토류 리스크 이연, 단 갈륨·게르마늄·안티몬 11/27 별도 시한",
     "232조 50% 금속관세 + 301조 글로벌 10–12.5% — 미국 내 철강·구리 프리미엄 구조화"
    ],
    "risks": [
     "10/18 Graham법 관세 실제 부과 시 인도·터키 수출주·루피/리라 급락, 러시아 원유 흐름 재편",
     "11/27 갈륨·게르마늄 유예 미연장 시 반도체·방산 소재 급등",
     "EU 유가상한제 폐지·전면 서비스금지 → 그림자선단 476척 추가 필요, 탱커운임 급등"
    ],
    "dev": [
     {
      "d": "2026-10-06",
      "x": "DOE SPR 4,000만 배럴 교환 입찰 마감, 1.72억 배럴 방출 지속(IEA 4억 배럴 공조)",
      "src": "https://www.energy.gov/articles/united-states-energy-department-continues-execution-strategic-reserve-release-commitments"
     },
     {
      "d": "2026-10-05",
      "x": "OFAC 이란 거래 외국금융기관 통지, 10/1 자동차·철도 섹터 제재 발효",
      "src": "https://ofac.treasury.gov/sanctions-programs-and-country-information/iran-sanctions"
     },
     {
      "d": "2026-10-04",
      "x": "OPEC+ 7개국 11월 생산목표 동결, 다음 회의 11/1",
      "src": "https://www.opec.org/pr-detail/616-4-october-2026.html"
     },
     {
      "d": "2026-09-23",
      "x": "베선트, 미중 휴전·희토류 통제 유예 2027-01-10까지 연장 발표(시진핑 방미)",
      "src": "https://www.aljazeera.com/economy/2026/9/24/hostile-but-hooked-whats-behind-the-us-china-trade-truce-extension"
     },
     {
      "d": "2026-09-18",
      "x": "트럼프, Graham 러시아·이란 제재법 서명 — 30일 내 이행",
      "src": "https://www.bakerbotts.com/thought-leadership/publications/2026/september/president-trump-signs-graham-sanctions-act-expanding-russia-sanctions-and-tariff-authorities"
     }
    ]
   },
   {
    "id": "flows_vol",
    "title": "자금흐름·변동성",
    "metrics": [
     {
      "l": "VIX",
      "v": "15.08",
      "d": "2026-10-07",
      "chg": "10/6 15.01",
      "trend": "flat",
      "n": "VVIX 82.6(60일 최저), 내재상관 11.5 — 주식 변동성 억제",
      "src": "https://www.investing.com/indices/volatility-s-p-500-historical-data"
     },
     {
      "l": "MOVE",
      "v": "105.21",
      "d": "2026-10-07",
      "chg": "-7.39% (10/5 113.60)",
      "trend": "down",
      "n": "중앙값 76 대비 여전히 높음, 6월 116 고점",
      "src": "https://www.home.saxo/en-mena/content/articles/options/rates-volatility-cracks-the-yield-holds---options-brief---7-october-2026-07102026"
     },
     {
      "l": "OVX (원유 변동성)",
      "v": "48.65",
      "d": "2026-10-05",
      "chg": "10/2 51.00",
      "trend": "down",
      "n": "52주 범위 28.4–126.0(3월 고점)",
      "src": "https://fred.stlouisfed.org/series/OVXCLS"
     },
     {
      "l": "Brent / WTI",
      "v": "$100.87 / $90.09",
      "d": "2026-10-07",
      "chg": "+0.29% / +0.13%",
      "trend": "up",
      "n": "Brent 전년比 +52%; EIA 10월 STEO 4Q26 Brent $105 전망",
      "src": "https://tradingeconomics.com/commodity/brent-crude-oil"
     },
     {
      "l": "BCOM 지수",
      "v": "142.30 (YTD +29.7%)",
      "d": "2026-10-05",
      "chg": "1년 +35.3%",
      "trend": "up",
      "n": "5월말 YTD 25.0%에서 확대",
      "src": "https://www.bloomberg.com/professional/products/indices/quote/bcom:ind"
     },
     {
      "l": "글로벌 금 ETF 유입",
      "v": "Q3 $310억 (9월 $100억)",
      "d": "2026-10-01",
      "chg": "보유 4,256t 사상 최대(+67t)",
      "trend": "up",
      "n": "가격 하락에도 10주 연속 순유입, 최근 주 27.1t(미국 15.9t)",
      "src": "https://phemex.com/news/article/global-gold-etf-inflows-hit-record-31-billion-in-q3-99060"
     },
     {
      "l": "미국상장 금 ETF 유입",
      "v": "9월 $38억",
      "d": "2026-10-01",
      "chg": "8월 $79억",
      "trend": "down",
      "n": "유입 둔화 속 가격 -6.6%",
      "src": "https://invezz.com/ng/news/2026/10/01/gold-prices-stall-near-dollar4160-despite-dollar38-billion-etf-inflows-heres-why/"
     },
     {
      "l": "COMEX 금 매니지드머니 순매수",
      "v": "134,972 계약",
      "d": "2026-09-08",
      "chg": "주간 -1,799",
      "trend": "down",
      "n": "최신 COT 미확인; 은 MM 순매수 7,614(9/29, 3년 범위 13백분위)",
      "src": "https://metalcharts.org/cot/gold"
     },
     {
      "l": "헤지펀드 국채·베이시스",
      "v": "국채 7% 보유 / 베이시스 $1.2조",
      "d": "2026-09-30",
      "chg": "베이시스 -20% YTD",
      "trend": "down",
      "n": "규제당국 레버리지 경고, 광범위 스트레스 증거는 아직 없음",
      "src": "https://www.cnbc.com/2026/09/30/us-treasury-market-is-relying-more-on-hedge-funds.html"
     },
     {
      "l": "EM 채권",
      "v": "수익률 6.95%, 9월 -2.91%",
      "d": "2026-09-30",
      "chg": "미국채 9월 -2.24%",
      "trend": "down",
      "n": "미 금리 상승이 EM 발행·자금흐름 압박",
      "src": "https://www.nuveen.com/global/insights/fixed-income/fixed-income-weekly-commentary"
     },
     {
      "l": "SHFE 구리",
      "v": "110,370 위안/t",
      "d": "2026-10-08",
      "chg": "국경절 휴장",
      "trend": "flat",
      "n": "1월 금·은·구리·알루미늄 증거금 인상 이후 10월 추가 조치 없음; INE 보세구리 증거금 7/2 조정",
      "src": "https://news.metal.com/newscontent/104144417-bofa-raises-long-term-copper-price-forecast-tight-supply-supports-prices-smm-copper-morning-meeting-summary"
     }
    ],
    "drivers": [
     "BCOM YTD +30% — 에너지(Brent +52% y/y) 주도 상품 강세, 금은 실질금리 역풍으로 조정",
     "금리 변동성(MOVE)이 주식 변동성(VIX 15)에 앞서 상승 — 채권발 리스크 신호",
     "가격 조정에도 금 ETF 사상 최대 유입 → 구조적 매수 vs 선물 투기포지션 축소"
    ],
    "risks": [
     "MOVE 재급등 시 상품 전반 디레버리징(CTA·베이시스 청산)",
     "OVX 48 — 호르무즈 사건 발생 시 3월 수준(126) 재현 가능",
     "중국 국경절 연휴 후 SHFE 재개장(10/9) 갭 리스크"
    ],
    "dev": [
     {
      "d": "2026-10-07",
      "x": "MOVE 7.4% 급락, VIX 15대 유지, 10y 5.31% 고정",
      "src": "https://www.home.saxo/en-mena/content/articles/options/rates-volatility-cracks-the-yield-holds---options-brief---7-october-2026-07102026"
     },
     {
      "d": "2026-10-06",
      "x": "EIA STEO: 4Q26 Brent $105 전망, 사우디 동서 파이프라인 공격 언급",
      "src": "https://www.eia.gov/outlooks/steo/"
     },
     {
      "d": "2026-10-02",
      "x": "월가, 5% 국채금리 '뉴노멀' 적응 중이나 시장 균열 확대(블룸버그)",
      "src": "https://www.bloomberg.com/news/articles/2026-10-02/wall-street-tries-to-live-with-5-yields-as-market-cracks-grow"
     }
    ]
   }
  ],
  "calendar": [
   {
    "d": "2026-10-09",
    "x": "USDA 10월 WASDE·Crop Production (12:00 ET)",
    "why": "미 옥수수·대두 수확 단수, 아르헨 수출세 인하 반영 수급",
    "cat": "ags",
    "src": "https://www.usda.gov/about-usda/general-information/staff-offices/office-chief-economist/commodity-markets/wasde-report"
   },
   {
    "d": "2026-10-09",
    "x": "CFTC COT 발표 (매주 금, 화요일 기준 포지션; 10/16·23·30, 11/6 동일)",
    "why": "매니지드머니 금·은·원유·곡물 포지션 확인",
    "cat": "macro",
    "src": "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm"
   },
   {
    "d": "2026-10-09",
    "x": "SHFE·DCE 국경절 연휴 후 재개장",
    "why": "휴장 중 Brent·LME 변동 반영 갭",
    "cat": "metals",
    "src": "https://news.metal.com/newscontent/104144417-bofa-raises-long-term-copper-price-forecast-tight-supply-supports-prices-smm-copper-morning-meeting-summary"
   },
   {
    "d": "2026-10-13",
    "x": "IMF 10월 WEO 발표·연차총회(방콕)",
    "why": "세계성장 3.0% 유지/하향 여부, 에너지 쇼크 평가",
    "cat": "macro",
    "src": "https://www.imf.org/en/publications/weo"
   },
   {
    "d": "2026-10-13",
    "x": "OPEC 월간보고서(MOMR)",
    "why": "수요전망·회원국 실생산 vs 쿼터",
    "cat": "energy",
    "src": "https://www.opec.org/monthly-oil-market-report.html"
   },
   {
    "d": "2026-10-14",
    "x": "미 9월 CPI (08:30 ET, 컨센 3.6%)",
    "why": "10/28 FOMC 인상 여부 결정 변수, 달러·금",
    "cat": "macro",
    "src": "https://www.bls.gov/schedule/news_release/current_year.asp"
   },
   {
    "d": "2026-10-14",
    "x": "중국 9월 수출입 (03:00 GMT)",
    "why": "원자재 수입량(구리·원유·대두) 및 수출 모멘텀",
    "cat": "macro",
    "src": "https://tradingeconomics.com/china/exports-yoy"
   },
   {
    "d": "2026-10-14",
    "x": "IEA 10월 석유시장보고서(OMR)",
    "why": "호르무즈 공급차질·재고 추정, SPR 공조",
    "cat": "energy",
    "src": "https://www.iea.org/events/oil-market-report-october-2026"
   },
   {
    "d": "2026-10-16",
    "x": "유로존 9월 HICP 확정치",
    "why": "ECB 10/29 인상 여부",
    "cat": "macro",
    "src": "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-02102026-ap"
   },
   {
    "d": "2026-10-17",
    "x": "연준 블랙아웃 시작 (10/17–10/29)",
    "why": "연준 발언 공백, 데이터 의존 변동성",
    "cat": "macro",
    "src": "https://www.atlantafed.org/news-and-events/press-room/blackout-periods"
   },
   {
    "d": "2026-10-18",
    "x": "Graham 제재법 이행 시한 (러시아 원유·가스 수입국 2차 관세)",
    "why": "인도·터키·중국 대상 최대 100% 관세 또는 면제 결정 — 러시아 원유 흐름·루피",
    "cat": "policy",
    "src": "https://www.squirepattonboggs.com/insights/publications/sanctions-by-statute-the-graham-act-and-tariffs-on-russia-s-energy-buyers/"
   },
   {
    "d": "2026-10-19",
    "x": "중국 Q3 GDP·9월 산업생산·소매·고정투자 (02:00 GMT)",
    "why": "Q2 4.3% 이후 추가 둔화 시 부양 기대·금속 수요",
    "cat": "macro",
    "src": "https://www.investing.com/economic-calendar/china-gross-domestic-product-(gdp)-yoy-461"
   },
   {
    "d": "2026-10-20",
    "x": "중국 LPR 고시",
    "why": "부동산 패키지 후속 금리인하 여부",
    "cat": "macro",
    "src": "https://tradingeconomics.com/china/interest-rate"
   },
   {
    "d": "2026-10-20",
    "x": "NYMEX WTI 11월물(CLX26) 최종거래일 (첫 통지일 10/22)",
    "why": "쿠싱 재고·만기 롤 변동성",
    "cat": "energy",
    "src": "https://futuresclock.com/en/contracts/nymex-cl/2611/"
   },
   {
    "d": "2026-10-22",
    "x": "한국은행 금통위",
    "why": "3.00%→3.25% 인상 여부, 원화·KRW 수입단가",
    "cat": "macro",
    "src": "https://robinhood.com/us/en/prediction-markets/economics/events/bank-of-korea-decision-october-22-2026-oct-22-2026/"
   },
   {
    "d": "2026-10-25",
    "x": "브라질 대선 결선 (F.볼소나루 vs 룰라)",
    "why": "헤알·대두·철광석·페트로브라스 정책, 수출세·환경규제",
    "cat": "geo",
    "src": "https://tradersagency.com/blog/flavio-bolsonaro-edges-lula-in-brazils-first-round-setting-up-oct-25-runoff-as-markets-rally"
   },
   {
    "d": "2026-10-27",
    "x": "ICE Brent 12월물 옵션 최종거래일",
    "why": "옵션 감마·행사가 집중 영향",
    "cat": "energy",
    "src": "https://www.ice.com/products/218/Brent-Crude-American-style-Options/expiry"
   },
   {
    "d": "2026-10-28",
    "x": "FOMC 결정 (14:00 ET, 10/27–28)",
    "why": "동결 80% 가격; 인상 시 달러·실질금리 급등 → 금·구리 압박",
    "cat": "macro",
    "src": "https://www.chicagofed.org/utilities/about-us/federal-reserve-calendars"
   },
   {
    "d": "2026-10-29",
    "x": "ECB 통화정책 결정 (14:15 CET, 비전망 회의)",
    "why": "2.50% 동결 vs 인상, 유로·에너지 수입단가",
    "cat": "macro",
    "src": "https://www.financecalendar.com/event/ecb-rate-decision-october-2026/"
   },
   {
    "d": "2026-10-29",
    "x": "미 Q3 GDP 속보치 + 9월 PCE (08:30 ET)",
    "why": "GDPNow 3.7%; 핵심 PCE 3.0% 추세 확인",
    "cat": "macro",
    "src": "https://www.bea.gov/news/schedule"
   },
   {
    "d": "2026-10-30",
    "x": "BOJ 금융정책결정회의·전망보고서 (10/29–30)",
    "why": "1.25% 동결 전망, 서프라이즈 시 엔·캐리",
    "cat": "macro",
    "src": "https://www.financecalendar.com/bank-of-japan-rate-decisions/"
   },
   {
    "d": "2026-10-30",
    "x": "ICE Brent 12월물(CBZ26) 만기",
    "why": "월말 Brent 벤치마크 롤, 실물 인도 압력",
    "cat": "energy",
    "src": "https://www.barchart.com/futures/quotes/CBZ26"
   },
   {
    "d": "2026-11-01",
    "x": "OPEC+ 7개국 월례회의 (12월 생산목표)",
    "why": "쿼터 유지 전망; 걸프 실생산 회복 여부",
    "cat": "energy",
    "src": "https://www.opec.org/pr-detail/616-4-october-2026.html"
   },
   {
    "d": "2026-11-03",
    "x": "미국 중간선거 (하원 전체·상원 35석)",
    "why": "민주 우위(일반투표 D+8.9) — 관세·제재·에너지 정책 입법 지형",
    "cat": "geo",
    "src": "https://www.npr.org/2026/10/06/nx-s1-5989694/midterm-elections-control-congress"
   },
   {
    "d": "2026-11-05",
    "x": "BOE 통화정책결정·MPR",
    "why": "3.75→4.00% 인상 확률 ~80%, 파운드",
    "cat": "macro",
    "src": "https://cambridgecurrencies.com/next-bank-of-england-interest-rate-decision/"
   },
   {
    "d": "2026-11-06",
    "x": "미 10월 고용보고서 (08:30 ET)",
    "why": "9월 +2.9만 이후 추가 둔화 시 12월 인상 철회",
    "cat": "macro",
    "src": "https://www.bls.gov/ces/"
   },
   {
    "d": "2026-11-09",
    "x": "USDA 11월 WASDE / COP31 개막(안탈리아, 11/9–20, 정상회의 11/11–12)",
    "why": "곡물 수급 확정·탄소·메탄 규제 신호",
    "cat": "ags",
    "src": "https://en.wikipedia.org/wiki/2026_United_Nations_Climate_Change_Conference"
   },
   {
    "d": "2026-11-10",
    "x": "미 10월 CPI / EIA 11월 STEO",
    "why": "12월 FOMC 가격·4Q 유가 전망 갱신",
    "cat": "macro",
    "src": "https://www.eia.gov/outlooks/steo/"
   },
   {
    "d": "2026-11-27",
    "x": "중국 갈륨·게르마늄·안티몬·초경질재 대미 수출금지 유예 만료",
    "why": "연장 없으면 반도체·방산 핵심광물 급등",
    "cat": "metals",
    "src": "https://www.stocktitan.net/news/AEM/antimony-market-faces-a-nov-27-export-control-deadline-from-b3yjbydljmq1.html"
   },
   {
    "d": "2026-12-14",
    "x": "G20 정상회의 (마이애미, 12/14–15)",
    "why": "미 주도 무역·에너지 의제",
    "cat": "geo",
    "src": "https://g20.org/events-calendar/"
   },
   {
    "d": "2026-12-30",
    "x": "EU EUDR 적용 개시",
    "why": "팜유·대두·커피·고무 공급망 실사",
    "cat": "policy",
    "src": "https://polygon-one.com/en/eudr-current-status"
   },
   {
    "d": "2027-01-10",
    "x": "미중 휴전·희토류 수출통제 유예 만료",
    "why": "미연장 시 희토류 5종 추가 통제·관세 복원",
    "cat": "policy",
    "src": "https://aljazeera.com/economy/2026/9/24/hostile-but-hooked-whats-behind-the-us-china-trade-truce-extension"
   }
  ],
  "judgments": [
   "향후 4주 상품시장의 핵심 변수는 연준이 아니라 10/14 CPI와 10/18 Graham법 시한이며, CPI 3.6% 상회 시 10월 인상 확률이 20%에서 재상승해 금·구리에 2차 조정 압력이 온다 (근거: 10y TIPS 2.90%·DXY 102.4가 이미 금 9월 -6.6%를 설명, 10월 인상확률 70→20% 급변동성).",
   "에너지는 수급이 아니라 지정학이 가격을 고정하고 있어 Brent $100 하방은 제한적이고, OVX 48은 호르무즈 사건 재발 시 과소평가 상태다 (근거: 10/4 통과 4척 vs 평시 85척, 걸프 실생산 쿼터 하회, SPR 283mb 1982년 이후 최저, EIA 4Q Brent $105).",
   "달러 강세·EM 약세 국면에서 원화는 예외적 강세를 이어갈 가능성이 높고, 한은 10/22 인상은 이를 강화한다 (근거: 9월 수출 $1,209억·무역흑자 $498억 사상 최대, 핵심 CPI 2.8% 연중 최고, USDKRW 50일선 1,382 하회).",
   "금은 선물 투기포지션 축소와 ETF 사상 최대 유입이 맞서는 구간으로 $4,000 지지 테스트 후 FOMC 동결 확인 시 반등 여지가 있다 (근거: Q3 ETF $310억·보유 4,256t 사상 최대, MM 순매수 감소, MS $4,000 바닥 전망).",
   "무역정책 리스크는 1/10 미중 휴전 연장으로 이연됐으나 11/27 갈륨·게르마늄·안티몬 시한과 10/18 2차 관세는 별개 트리거로, 인도·터키 노출 자산과 핵심광물 가격에 비대칭 상방 위험이 있다 (근거: 유예 연장 미발표, Graham법 30일 이행조항, 인도 러시아 원유수입 8월 -16.5%)."
  ],
  "gaps": [
   "CME FedWatch 공식 페이지 수치 미접근 — 제3자 트래커(CME선물/Kalshi) 집계로 대체",
   "10월 인민은행 USDCNY 고시환율 미확인(7월 고시까지만 확인); EURUSD 1.1229는 단일 출처 미검증",
   "USDBRL 1차 투표 이후 실제 레벨 미확인(애널리스트 예상 4–5% 강세만 확인)",
   "최신 CFTC COT(10/2 발표분) 금·원유·구리 매니지드머니 포지션 미확인 — 금 9/8, 은 9/29 데이터만 확보",
   "CBAM 3분기 인증서 가격(10/5 발표 예정) 미확인; 중국 2027 원유수입쿼터 1차 배정 미발표",
   "EU 러시아 유가상한 현재 수준 출처 간 상충($44.1 vs $60 동결) — 공식 이사회 문서 미확인",
   "인도네시아 국영 단일수출창구 9월 전면시행 여부, 터키 러시아 원유 수입량·정부 대응 미확인",
   "중국 9월 신용·TSF 데이터 미발표(10월 중순 예정); 한국 10/22 금통위 일정은 예측시장 기준(한은 공식 캘린더 미확인)",
   "JPMorgan 글로벌 PMI 53.0은 2차 출처(TrendForce), S&P Global 원문 미확인; 최신 경기침체 확률(JPM/골드만) 미확인",
   "OVX·VIX 10/7 종가 출처 간 소폭 상이(15.01 vs 15.08); MOVE 105.21은 Saxo 단일 노트",
   "4차 전회(四中全会)는 2025년 10월 개최 완료 — 2026년 10월 중국 당 전회 일정 없음"
  ]
 }
};
