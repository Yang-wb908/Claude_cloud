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

환경변수: `ANTHROPIC_API_KEY`(선택, 한국어 요약·유형·전역·좌표 보강), `PIPELINE_MODEL`(기본 `claude-opus-5-5`), `PIPELINE_NO_CLAUDE=1`.

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

## 보강 규칙

1. 규칙: 유형(S/G/M/A/D/E/H/X/C) 정규식, 전역 정규식, 가제티어(`gazetteer.json`, 223곳) 지명 매칭, 도메인별 Admiralty 등급.
2. Claude(선택): 20건 묶음으로 한국어 한 줄 요약·유형·전역·지명·좌표·관련도(0~3)를 JSON 스키마로 받습니다. 관련도 2 이상만 상황판에 올라갑니다. 거부(refusal)·속도제한은 건너뛰고 규칙 결과를 씁니다.
3. 병합: URL 또는 (날짜, 정규화 제목)이 같은 사건은 중복 제거, 전역·일자당 12건 상한.

## 수집원 추가

`sources.yaml`에 항목을 넣으면 됩니다. `verify: true`를 달아 두면 상황판 수집원 탭에 '검증 전'으로 표시되고, 첫 실행 상태표에서 실패하면 바로 보입니다. 새 종류(API)는 `collectors.py`에 함수를 추가하고 `COLLECTORS`에 등록합니다.

## 트립와이어

`tripwires.yaml`. `metric` 경로(`portwatch.hormuz.latest.n_total`, `markets.BZ=F`, `pla.latest.aircraft`) 또는 `kind: event_count`(전역·유형·기간 필터)를 임계치와 비교합니다. 같은 제목의 열린 Issue가 있으면 댓글로 재확인만 남깁니다.

## 테스트

```bash
python -m pytest tests/pipeline -q
```

네트워크 없이 고정 입력(fixtures)으로 파서·보강·병합·트립와이어를 검사합니다.
