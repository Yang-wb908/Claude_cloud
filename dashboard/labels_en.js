/* 지도 라벨용 영어 표기. 패널·브리핑은 한국어, 지도 위 텍스트는 영어로 표시한다. */
const EN = {
  theaters: {
    iran:"IRAN · HORMUZ", ukraine:"RUSSIA–UKRAINE", yemen:"YEMEN · RED SEA", ethiopia:"ETHIOPIA · TIGRAY", sudan:"SUDAN", gaza:"GAZA · WEST BANK",
    afpak:"AFGHANISTAN–PAKISTAN", korea:"KOREAN PENINSULA", lebanon:"LEBANON · SYRIA", sahel:"SAHEL", drc:"EASTERN DRC · EBOLA", somalia:"SOMALIA · GULF OF ADEN",
    myanmar:"MYANMAR", taiwan:"TAIWAN STRAIT", scs:"SOUTH CHINA SEA", carib:"CARIBBEAN"
  },
  chokepoints: { hormuz:["Hormuz","7–10 / 85 ships/day"], bab:["Bab el-Mandeb","ground war"], suez:["Suez","−55%"], cape:["Cape of Good Hope","main detour"] },
  cities: {
    "키이우":"Kyiv","모스크바":"Moscow","하르키우":"Kharkiv","오데사":"Odesa","자포리자":"Zaporizhzhia","도네츠크":"Donetsk","민스크":"Minsk","바르샤바":"Warsaw",
    "테헤란":"Tehran","반다르아바스":"Bandar Abbas","이스파한":"Isfahan","바그다드":"Baghdad","리야드":"Riyadh","두바이":"Dubai","도하":"Doha","무스카트":"Muscat",
    "텔아비브":"Tel Aviv","예루살렘":"Jerusalem","가자시티":"Gaza City","베이루트":"Beirut","다마스쿠스":"Damascus","앙카라":"Ankara","카이로":"Cairo",
    "사나":"Sanaa","아덴":"Aden","호데이다":"Hodeidah","지부티":"Djibouti","카르툼":"Khartoum","엘파셰르":"El Fasher","엘오베이드":"El Obeid","포트수단":"Port Sudan",
    "아디스아바바":"Addis Ababa","메켈레":"Mekelle","아스마라":"Asmara","모가디슈":"Mogadishu","나이로비":"Nairobi","고마":"Goma","킨샤사":"Kinshasa",
    "바마코":"Bamako","니아메":"Niamey","와가두구":"Ouagadougou","아부자":"Abuja","카불":"Kabul","이슬라마바드":"Islamabad","페샤와르":"Peshawar","뉴델리":"New Delhi",
    "양곤":"Yangon","네피도":"Naypyidaw","평양":"Pyongyang","서울":"Seoul","도쿄":"Tokyo","베이징":"Beijing","상하이":"Shanghai","타이베이":"Taipei","마닐라":"Manila",
    "싱가포르":"Singapore","로테르담":"Rotterdam","런던":"London","워싱턴":"Washington","카라카스":"Caracas","포르토프랭스":"Port-au-Prince"
  },
  bases: {
    "알우데이드":"Al Udeid AB","5함대 사령부(바레인)":"NSA Bahrain / 5th Fleet","알다프라":"Al Dhafra AB","알리 알살렘":"Ali Al Salem AB","캠프 아리프잔":"Camp Arifjan",
    "무와파크 살티":"Muwaffaq Salti AB","알아사드":"Al Asad AB","에르빌":"Erbil","인지를리크":"Incirlik AB","캠프 르모니에":"Camp Lemonnier","디에고가르시아":"Diego Garcia",
    "수다만":"Souda Bay","로타":"NAVSTA Rota","람슈타인":"Ramstein AB","RAF 페어포드":"RAF Fairford","요코스카":"Yokosuka","사세보":"Sasebo","가데나":"Kadena AB",
    "이와쿠니":"MCAS Iwakuni","미사와":"Misawa AB","괌(앤더슨·아프라)":"Guam (Andersen / Apra)","캠프 험프리스":"Camp Humphreys","오산":"Osan AB","군산":"Kunsan AB","다윈":"Darwin"
  },
  sites: {
    "나탄즈":"Natanz","포르도":"Fordow","이스파한":"Isfahan NTC","아라크":"Arak","부셰르":"Bushehr NPP","반다르아바스":"Bandar Abbas NB","자스크":"Jask","카르그섬":"Kharg Island",
    "라스타누라":"Ras Tanura","아브카이크":"Abqaiq","얀부":"Yanbu","푸자이라":"Fujairah","호데이다":"Hodeidah","페림섬":"Perim Island","모카":"Mocha","아사브":"Assab",
    "영변":"Yongbyon","풍계리":"Punggye-ri","소해":"Sohae","신포":"Sinpo","디모나":"Dimona"
  },
  units: {
    "시어도어 루스벨트 CSG(CVN-71)":"CVN-71 ROOSEVELT CSG","매킨 아일랜드 ARG·13 MEU":"LHD-8 MAKIN ISLAND ARG","조지 H.W. 부시 CSG(CVN-77)":"CVN-77 BUSH CSG",
    "조지 워싱턴 CSG(CVN-73)":"CVN-73 WASHINGTON CSG","에이브러햄 링컨 CSG(CVN-72)":"CVN-72 LINCOLN CSG"
  },
  pipelines: { "사우디 동서 파이프라인(Petroline)":"Petroline (East–West)", "하브샨–푸자이라":"Habshan–Fujairah", "고레–자스크":"Goreh–Jask", "키르쿠크–제이한":"Kirkuk–Ceyhan" }
};
