# 세계 상황판 (World Situation Board)

OSINT 기반 지정학 상황판의 소스입니다. 게시본: https://claude.ai/artifact/VdTv11W2Zv8j55Rpf4aBGJ

## 구성
- `app.html` — 페이지 템플릿(스타일·마크업·앱 로직). `/*__WORLD__*/`, `/*__DATA__*/`, `/*__THEATERS__*/`, `/*__IW__*/` 자리에 데이터가 삽입됩니다.
- `world.json` — 세계 지도 TopoJSON (110m).
- `data_snapshot.json` — 스냅숏 데이터: 해협, 항로, 시장, 도시, 사건(출처 URL 포함).
- `theaters.js` — 전역(theater) 브리핑 16건.
- `iw.js` — 징후·경보(I&W) 프레임: 종합 경보단계, BLUF 핵심판단·신뢰도, 72시간 변화, 감시 항목, 수집 공백, 전역별 판단·징후 지표·시나리오·행위자·정보 공백, 군사태세(기지·시설·송유관·부대), 전역 간 연계, 한국 영향.
- `build.py` — 위 파일을 하나의 `index.html`로 합칩니다.

## 빌드
```
python3 dashboard/build.py   # dashboard/index.html 생성
```

## 분석 관례
- 신뢰도: 높음/보통/낮음 (ICD 203 준용). 확률대는 ICD 203 척도 표현.
- 출처 등급: Admiralty 코드(신뢰성 A~F, 신빙성 1~6). 매체 유형 기준 자동 1차 등급.
- 징후 지표 상태: obs(관측) / part(부분·미확인) / no(미관측).
- 부대 위치는 보도 시점 광역 추정(C3~C4)이며 갱신 대상입니다.
