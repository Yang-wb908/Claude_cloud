# 수집 파이프라인

`sources.yaml`의 수집원에서 뉴스·보고서·지표를 모아 분류·지오코딩·등급을 붙이고 상황판 데이터로 조립합니다. GitHub Actions가 6시간마다 돌립니다.

```
collect ──▶ enrich ──▶ assemble ──▶ tripwires ──▶ report ──▶ build
 RSS/API      규칙+Claude   events 병합    임계치 평가   SITREP.md   index.html
 cache/raw    cache/enr    intel.auto     data/trip    reports/
```

## 실행

```bash
pip install -r dashboard/pipeline/requirements.txt
python dashboard/pipeline/run.py all              # 전체
python dashboard/pipeline/run.py collect --only bbc_world,portwatch
python dashboard/pipeline/run.py enrich --no-claude   # 규칙 분류만
python dashboard/pipeline/run.py collect --offline    # 캐시 재생
```

환경변수: `ANTHROPIC_API_KEY`(API 키) 또는 `CLAUDE_CODE_OAUTH_TOKEN`(Claude Pro/Max 구독 토큰, `claude setup-token`; `llm.py`가 `claude -p`로 호출), `PIPELINE_MODEL`(기본 `claude-opus-5-5`), `PIPELINE_NO_CLAUDE=1`. 새 명령: `bayes`(징후 갱신 자동 뷰), `calib`(사례 보정), `redteam`, `simulate`(에이전트용 시뮬레이션 도우미), `products`.

## 산출물

| 파일 | 내용 |
|---|---|
| `dashboard/data_snapshot.json` | 사건 목록. 사람이 큐레이션한 사건은 유지, 자동 사건(`auto: true`)은 30일 뒤 만료 |
| `dashboard/intel.auto.json` | 시세, PortWatch 통항 시계열, PLA 일일 활동, 수집원 상태, 변화 요약 |
| `dashboard/data/latest.json` | GitHub Pages용 공개 JSON (사건+지표) |
| `dashboard/data/history/*.json` | 실행별 요약. 직전 실행과 비교해 `data/changes.json` 생성 |
| `dashboard/data/tripwires.json` | 발동된 트립와이어. 워크플로가 Issue(`tripwire` 라벨)로 만듭니다 |
| `dashboard/data/rfi.json` | 열린 `rfi` Issue. 브리프 탭 '열린 정보 요청'에 표시 |
| `reports/SITREP-<date>.md` | 일일 상황보고. Release `sitrep-<date>`로 보존 |
| `dashboard/data/series.json` | 2년 일봉 종가(26개 심볼). `run.py series`. 주간 백테스트 입력 |
| `dashboard/data/backtest.json` | 사건 연구·트립와이어 발동 이력·판단 장부 통계. `run.py backtest` → `reports/BACKTEST-latest.md` |
| `dashboard/data/judgments.json` | 판단 장부. `intake.py judgment`(Issue 양식)로 판정 기록 |
| `dashboard/data/badges/*.json` | shields.io 엔드포인트 배지 (브렌트·TTF·밀·VIX·원/달러·사건 수·갱신 시각) |
| `dashboard/snapshots/*.png` | 워크플로가 찍는 상황판 스크린샷 (latest + 일자별 30일) |

## 보강 규칙

1. 규칙: 유형(S/G/M/A/D/E/H/X/C) 정규식, 전역 정규식, 가제티어(`gazetteer.json`, 223곳) 지명 매칭, 도메인별 Admiralty 등급.
2. Claude(선택): 20건 묶음으로 한국어 한 줄 요약·유형·전역·지명·좌표·관련도(0~3)를 JSON 스키마로 받습니다. 관련도 2 이상만 상황판에 올라갑니다. 거부(refusal)·속도제한은 건너뛰고 규칙 결과를 씁니다.
3. 병합: URL 또는 (날짜, 정규화 제목)이 같은 사건은 중복 제거, 전역·일자당 12건 상한.

## 수집원 추가

`sources.yaml`에 항목을 넣으면 됩니다. `verify: true`를 달아 두면 상황판 수집원 탭에 '검증 전'으로 표시되고, 첫 실행 상태표에서 실패하면 바로 보입니다. 새 종류(API)는 `collectors.py`에 함수를 추가하고 `COLLECTORS`에 등록합니다.

## 트립와이어

`tripwires.yaml`. `metric` 경로(`portwatch.hormuz.latest.n_total`, `markets.BZ=F`, `pla.latest.aircraft`) 또는 `kind: event_count`(전역·유형·기간 필터)를 임계치와 비교합니다. 같은 제목의 열린 Issue가 있으면 댓글로 재확인만 남깁니다.

## Issue 접수 (`intake.py`)

`intake.yml`이 라벨(`scenario`·`judgment`·`event`)로 종류를 가려 실행합니다. 양식은 `.github/ISSUE_TEMPLATE/`.

```bash
ISSUE_BODY="$(printf '### 시나리오 설정\n\nhormuz_war:15:1.5,redsea_houthi:30:1\n')" python dashboard/pipeline/intake.py scenario
ISSUE_BODY="$(printf '### 판정 (한 줄에 하나)\n\nbluf-1 적중 통항 12척\n')" python dashboard/pipeline/intake.py judgment
```

- `scenario`: `scenario.js` 템플릿으로 몬테카를로(5,000회)를 돌려 충격표를 댓글로 답합니다. 데이터는 바꾸지 않습니다.
- `judgment`: `data/judgments.json`에 결과·근거·판정자를 기록하고 Brier·보정표를 댓글로 단 뒤 Issue를 닫습니다.
- `event`: `data_snapshot.json` 사건 목록에 추가(`manual: true`, 등급은 선택값 또는 URL 자동 산정, 지명사전으로 좌표). 다음 수집 배포에 반영됩니다.

## 백테스트 (`backtest.py`)

```bash
python dashboard/pipeline/run.py series      # Yahoo 2년 일봉 → data/series.json
python dashboard/pipeline/run.py backtest    # data/backtest.json + reports/BACKTEST-latest.md
```

사건 연구는 경보 4 이상 전역의 S/M/A 유형 사건을 대상으로 사건일 종가 대비 +1/+5/+20/+60 거래일 변동률(브렌트·밀·금·달러·VIX·코스피·원/달러·S&P)을 냅니다. 트립와이어는 `markets.*` 지표에 대해 임계치 최초 돌파일을 찾아 자기 자신·브렌트·S&P의 60일 수익률 중앙값을 냅니다.

## 일일 예측·채점 (`forecast.py`)

```bash
python dashboard/pipeline/run.py series && python dashboard/pipeline/run.py forecast && python dashboard/pipeline/run.py score
```

`daily.yml`이 매일 09:20 KST에 실행합니다. 예측은 `data/forecasts/<날짜>.json`, 채점은 `data/scorecard.json`과 `reports/SCORECARD-latest.md`. 지평은 20거래일이며 방향 적중(부호 일치, ±1% 또는 ±10bp 이내는 '무변동'으로 취급), 90%·50% 구간 포함, PIT, MAE 대비 무변동·과거 사례 스킬을 냅니다.

## 에이전트 분석관 (`advisor.py`)

```bash
python dashboard/pipeline/run.py advise    # 에이전트 재검토 → data/advisor.json, reports/ADVISOR-latest.md (ANTHROPIC_API_KEY 없으면 규칙 점검)
```

`advisor.py`는 `@beta_tool` 함수 6개(사건 검색, 시세 변동, 시뮬레이션, 시나리오 목록, 채점표, 과거 사례)를 `tool_runner`에 넘겨 최대 10라운드 조사 후 JSON 제안을 받습니다. `advisor.yml`이 매주 월요일 Issue(`scenario`+`advisor`)로 올리고, intake 봇이 충격표를 댓글로 답합니다.

## 경제 위험 지수 (`risk.py`)

```bash
python dashboard/pipeline/run.py risk   # data/risk.json, data/risk_history.json, data/badges/risk.json, reports/RISK-latest.md
```

상황판 `risk.js`와 같은 구성(시나리오 꼬리 30 · 시장 25 · 공급망 20 · 포지셔닝 10 · 사건 10 · 모델 5)을 저장소 데이터(시계열·intel.auto·PortWatch·COT·채점표)로 계산합니다. 트립와이어 경로 `risk.index`.

## 생산물 (`products.py`)

```bash
python dashboard/pipeline/run.py products   # products/DIB-YY-MMDD.md, products/WR-YY-MMDD-NN.md, products/index.json, data/products_index.json
```

DIB는 매 실행마다 당일 것을 다시 쓰고, WR은 발동 트립와이어와 `data/warnings_pending.json`(경보단계 변경 Issue가 남김)마다 하루 한 번만 발행합니다. 수집(6시간)·일일 동기화 워크플로가 호출하고 SITREP Release가 DIB를 첨부합니다.

## 테스트

```bash
python -m pytest tests/pipeline -q
```

네트워크 없이 고정 입력(fixtures)으로 파서·보강·병합·트립와이어를 검사합니다.


### 피드 대체 수집

`kind: rss` 수집원은 원 피드가 403/404이거나 비어 있으면 자동으로 Google News `site:<도메인> when:2d` 검색 RSS로 대체된다. 등급·도메인은 원 수집원 것을 그대로 쓰고, 상태표(`intel.auto.json.sources[].note`)와 부트스트랩/수집 요약에 사유가 남는다. 특정 수집원에서 끄려면 `no_fallback: true`.
