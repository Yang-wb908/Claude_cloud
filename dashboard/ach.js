/* 경쟁가설분석(ACH, Analysis of Competing Hypotheses) 매트릭스 (6차).
   질문마다 가설 H1..Hn 과 증거 E1..En. 각 증거는 출처 등급(Admiralty)·날짜·출처와, 가설별 일치도 벡터를 가진다.
   CC 강하게 일치 / C 일치 / N 중립·무관 / I 불일치 / II 강하게 불일치. ACH 점수는 가중 불일치 합(낮을수록 생존). 등급 가중치 A·B 1.0, C 0.7, D·E 0.4. */
const ACH = {
  asof: "2026-10-08",
  weights: {A: 1.0, B: 1.0, C: 0.7, D: 0.4, E: 0.4, F: 0.2},
  questions: [
    { id: "hormuz", th: "iran", q: "호르무즈 통항은 11월 초까지 어떤 상태인가?", scn: {H1: "hormuz_persist", H2: "hormuz_reopen", H3: "hormuz_war"},
      hyp: {H1: "통제된 해협 지속(선별 통항·간헐 공격)", H2: "중재 타결로 단계적 재개방", H3: "미·이란 직접 교전으로 장기 폐쇄"},
      ev: [
        {id: "E1", d: "2026-10-06", g: "B2", x: "Kpler: 호르무즈 상업선 일 통과 7~10척(평시 85척), 7/23 이후 최저", src: "intel.sea", v: {H1: "C", H2: "I", H3: "C"}},
        {id: "E2", d: "2026-09-28", g: "B2", x: "트럼프, 이란의 '7일 내 재개방' 조건부 제안 거부, 중간선거 후 공습 재개 시사", src: "https://www.cnbc.com/2026/09/28/oil-price-today-wti-brent-trump-iran.html", v: {H1: "C", H2: "I", H3: "C"}},
        {id: "E3", d: "2026-10-05", g: "B3", x: "카타르·오만 중재 접촉은 유지, 이란 외무부 '조건 충족 시 통항 보장' 반복", src: "IW.theaters.iran", v: {H1: "N", H2: "C", H3: "I"}},
        {id: "E4", d: "2026-10-03", g: "A2", x: "미 해군 3번째 항모가 중부사령부로 이동, 서태평양 공백", src: "IW.posture", v: {H1: "C", H2: "N", H3: "CC"}},
        {id: "E5", d: "2026-10-01", g: "B2", x: "이란 IRGC, 10월 들어 유조선 공격 재개(케이프 다오호 피격 사망 1)", src: "IW.theaters.iran", v: {H1: "C", H2: "II", H3: "C"}},
        {id: "E6", d: "2026-10-07", g: "B2", x: "브렌트 $100 안팎·Dated 프리미엄 사상 최고($19)이나 선물 커브는 급격한 백워데이션(해소 기대)", src: "INTEL.cm.energy", v: {H1: "C", H2: "C", H3: "N"}},
        {id: "E7", d: "2026-09-25", g: "B2", x: "이란 GDP -10.1%, 내부 압력 증가, 그러나 지도부 교체 이후 양보 징후 없음", src: "IW.theaters.iran", v: {H1: "C", H2: "N", H3: "N"}},
        {id: "E8", d: "2026-10-06", g: "C3", x: "걸프 산유국 LNG·정유 시설 피격 보도 없음(9월 이후)", src: "INTEL.cm.energy", v: {H1: "C", H2: "C", H3: "I"}}
      ]},
    { id: "blacksea", th: "ukraine", q: "흑해 곡물 회랑은 연말까지 어떻게 되는가?", scn: {H1: null, H2: "blacksea_deal", H3: "blacksea_escalate"},
      hyp: {H1: "현 상태 교착(러 터미널 부분 가동, 우크라 수출 -30~40%)", H2: "3자 회담 후 해상 휴전·터미널 복구", H3: "오데사·노보로시스크 동시 타격으로 회랑 중단"},
      ev: [
        {id: "E1", d: "2026-09-30", g: "A2", x: "우크라이나 9월 곡물 수출 148.8만t(-36.7% y/y)", src: "https://ukragroconsult.com/en/news/ukraine-exported-almost-1-5-mln-tons-of-grain-in-september/", v: {H1: "C", H2: "N", H3: "C"}},
        {id: "E2", d: "2026-09-25", g: "B2", x: "로이터: 공격 중단 시 러 흑해 터미널 80% 신속 재가동 가능, NKHP 복구 4개월", src: "https://www.usnews.com/news/world/articles/2026-09-25/russia-can-restart-80-of-black-sea-grain-export-terminals-if-attacks-stop", v: {H1: "N", H2: "C", H3: "N"}},
        {id: "E3", d: "2026-10-02", g: "B2", x: "우크라 농업장관: 항만 봉쇄 미해제 시 시즌 수출 3,000만t 손실", src: "https://www.pravda.com.ua/eng/news/2026/10/02/8056113/", v: {H1: "C", H2: "I", H3: "C"}},
        {id: "E4", d: "2026-10-07", g: "B2", x: "10월 말 3자 회담 추진, 그러나 전선 교착·'소모의 겨울' 전략", src: "IW.theaters.ukraine", v: {H1: "C", H2: "N", H3: "I"}},
        {id: "E5", d: "2026-09-18", g: "B2", x: "러시아 동계곡물 파종 2013년 이후 최저(610만ha), 수출세 0 루블로 인하", src: "https://blog.sizov.report/russias-winter-crop-sowing-pace-is-the-slowest-since-2013/", v: {H1: "C", H2: "C", H3: "N"}},
        {id: "E6", d: "2026-10-07", g: "B2", x: "CBOT 밀 $7 아래·SRW 펀드 순숏 2.2만 계약: 시장은 확전 미반영", src: "INTEL.cm.ags", v: {H1: "C", H2: "C", H3: "I"}},
        {id: "E7", d: "2026-10-05", g: "C3", x: "흑해 전쟁위험 보험 인수 지속(할증 상승), 중단 보도 없음", src: "INTEL.sea", v: {H1: "C", H2: "N", H3: "I"}}
      ]},
    { id: "fed", th: "macro", q: "연준의 다음 행보(12월 FOMC까지)는?", scn: {H1: "fed_hawkish", H2: null, H3: "us_recession"},
      hyp: {H1: "추가 인상(10년물 5.5% 접근)", H2: "동결 유지", H3: "경기 급랭으로 긴급 인하"},
      ev: [
        {id: "E1", d: "2026-10-07", g: "A2", x: "미 10년물 5.28~5.35%, 2002년 이후 최고", src: "INTEL.cm.macro", v: {H1: "C", H2: "N", H3: "I"}},
        {id: "E2", d: "2026-10-07", g: "B2", x: "Fed 10월 인상 확률 20% 미만(선물)", src: "INTEL.cm.energy", v: {H1: "I", H2: "C", H3: "N"}},
        {id: "E3", d: "2026-10-01", g: "A2", x: "유가 $100·요소 +24% 등 비용 인플레 재점화, 헤드라인 CPI 반등 전망", src: "INTEL.cm.macro", v: {H1: "C", H2: "N", H3: "I"}},
        {id: "E4", d: "2026-10-03", g: "A2", x: "고용 둔화 신호 혼재, 삼 룰 미발동", src: "INTEL.economy", v: {H1: "N", H2: "C", H3: "I"}},
        {id: "E5", d: "2026-10-06", g: "B2", x: "VIX 15 안팎, 하이일드 스프레드 안정", src: "INTEL.cm.macro", v: {H1: "N", H2: "C", H3: "II"}},
        {id: "E6", d: "2026-10-07", g: "B2", x: "헤지펀드 국채 베이시스 $1.2조, 급격한 금리 변동 시 디레버리징 위험", src: "INTEL.cm.macro", v: {H1: "N", H2: "N", H3: "C"}}
      ]},
    { id: "enso", th: "weather", q: "엘니뇨는 역대급(1950년 이후 최강)으로 가는가?", scn: {H1: "elnino_super", H2: null, H3: null},
      hyp: {H1: "역대급 강도로 정점(ONI 2.5+)", H2: "강한 엘니뇨(2.0 안팎)에서 정점", H3: "조기 약화"},
      ev: [
        {id: "E1", d: "2026-10-05", g: "A2", x: "NOAA CPC: 매우 강한 엘니뇨 >90%, OND 역대급 확률 75%", src: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml", v: {H1: "CC", H2: "C", H3: "II"}},
        {id: "E2", d: "2026-10-01", g: "A2", x: "호주 BOM: 근래 최고 수준 엘니뇨, 늦봄~여름 정점", src: "https://www.bom.gov.au/climate/ahead/outlooks/", v: {H1: "C", H2: "C", H3: "I"}},
        {id: "E3", d: "2026-09-30", g: "A2", x: "인도 몬순 LPA 87%(-12.6%), 2015년 이후 최악", src: "https://www.business-standard.com/industry/agriculture/2026-monsoon-ends-with-nearly-13-rain-deficit-worst-since-2015-imd-126093001389_1.html", v: {H1: "C", H2: "C", H3: "N"}},
        {id: "E4", d: "2026-09-28", g: "A2", x: "파나마 가툰호 9월 강우로 회복(85.7ft 전망), 단기 건조 신호 약함", src: "https://pancanal.com/en/panama-canal-announces-increase-in-draft-and-daily-transit/", v: {H1: "N", H2: "N", H3: "C"}},
        {id: "E5", d: "2026-10-07", g: "B2", x: "팜유 재고 사상최고 전망(337만t): 엘니뇨 생산 감소가 아직 수치에 미반영", src: "INTEL.cm.ags", v: {H1: "N", H2: "N", H3: "N"}}
      ]},
    { id: "taiwan", th: "taiwan", q: "중국은 미 항모 공백기에 대만 압박을 키우는가?", scn: {H1: null, H2: null, H3: "taiwan_quarantine"},
      hyp: {H1: "해빙 속 회색지대 유지", H2: "선거 국면 압박 재개(대규모 훈련·ADIZ 급증)", H3: "격리·봉쇄 시도"},
      ev: [
        {id: "E1", d: "2026-10-07", g: "A2", x: "대만 국방부 일일 PLA 활동 낮은 수준 유지, 40대 이상 연속일 없음", src: "IW.theaters.taiwan", v: {H1: "C", H2: "I", H3: "II"}},
        {id: "E2", d: "2026-10-03", g: "A2", x: "미 항모 3척 중부사령부 집결로 서태평양 공백", src: "IW.posture", v: {H1: "N", H2: "C", H3: "C"}},
        {id: "E3", d: "2026-09-28", g: "B2", x: "미중 정상회담 휴전 연장, 대두 관세 유지·희토류 통제 유예", src: "https://www.dtnpf.com/agriculture/web/ag/columns/washington-insider/article/2026/09/28/us-china-extends-trade-truce-new", v: {H1: "C", H2: "I", H3: "II"}},
        {id: "E4", d: "2026-10-05", g: "B3", x: "중국 해경 '검역' 용어 사용·대만해협 해경 상시 순찰 보도", src: "IW.theaters.taiwan", v: {H1: "N", H2: "C", H3: "C"}},
        {id: "E5", d: "2026-10-06", g: "B2", x: "중국 경기 둔화·부양 논의: 대외 긴장 고조 유인 낮음", src: "INTEL.gp", v: {H1: "C", H2: "N", H3: "I"}}
      ]}
  ]
};
window.ACH = ACH;
