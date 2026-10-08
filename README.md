# sarship: ship detection in Sentinel-1 SAR imagery

From raw Sentinel-1 GRD data to geolocated ship detections, using only public
data read directly from the [Sentinel-1 bucket on AWS](https://registry.opendata.aws/sentinel-1/).
Demonstrated on Busan and the Korea Strait.

> **한국어 요약.** 공개 Sentinel-1 SAR 원시 영상(GRD)으로 선박을 탐지하는 Python
> 패키지입니다. 방사 보정(σ⁰)과 열잡음 처리, 해안선 데이터와 영상 기반 육지 마스킹,
> K분포 클러터 모델 기반 CFAR 탐지, 군집화를 거쳐 선박 위치를 GeoJSON으로 출력합니다.
> 2021년 6월 5일 06:24 KST 부산 영상에서 126척을 탐지했고, 그중 98척이 VH 편파에서도
> 확인됐습니다. 합성 클러터 검증에서는 K-CFAR만 설계 오경보율을 지켰습니다.

![Detections over Busan](docs/figures/busan_detections.png)

## Pipeline

```
raw GRD (DN) ─► calibration σ⁰ ─► land mask ─► CFAR ─► clustering ─► GeoJSON
                (+ noise LUT)     Natural Earth  K-dist.   size / shape /
                                  + image-based  clutter   open-sea filters
```

| Stage | What it does | Code |
|---|---|---|
| Data access | Parses the annotation XML (calibration, thermal noise, geolocation grid). Reads only the image tiles covering the area of interest, over HTTP range requests | `s1.py`, `annotation.py` |
| Calibration | σ⁰ = (DN² − N) / A², with the LUTs interpolated onto the image grid. Geolocation uses a bicubic spline over the tie-point grid, with a numerical inverse (round trip < 0.2 px) | `annotation.py` |
| Land mask | Natural Earth coastline mapped into image geometry, plus a 500 m buffer. Extended over piers, reclaimed land and bridges found in the image with an Otsu threshold and a connectivity rule | `landmask.py` |
| CFAR | Cell-averaging CFAR under a gamma, K or Gaussian clutter model, computed in O(N) with integral images. The K texture shape ν is estimated with log-cumulants | `cfar.py` |
| Clustering | Connected components, measured by second moments on the pixels within 15 dB of the peak. Size, peak and open-sea filters remove residual clutter | `detect.py` |

## Results

**Why the clutter model matters.** On simulated K clutter with the ν fitted to
this scene, only the K-CFAR holds its design false-alarm rate. At
Pfa = 10⁻⁴ the Gaussian two-parameter CFAR, the classic choice in SAR tools,
exceeds it 49×, and a gamma model 6×.

<p>
<img src="docs/figures/pfa_validation.png" width="45%">
<img src="docs/figures/clutter_tail.png" width="53%">
</p>

The real sea tail (right) is heavier than gamma, and the K model follows it
down to ~10⁻⁴. Beyond that, point targets too small to cluster make it heavier
than either model. The cluster size, peak brightness and open-sea tests
handle what the threshold cannot.

**Coastline databases miss ports.** Natural Earth has none of Busan's
reclaimed land, piers or breakwaters. Refining the mask from the image itself
removed most harbour false alarms:

![Land mask refinement](docs/figures/land_mask.png)

**Detections.** The Busan window (57 × 58 km) holds 126 detections, mostly
in the outer anchorage south of Yeongdo and along the strait. 98 of them are
also found independently in VH.

![Largest detections](docs/figures/detection_chips.png)

## Usage

```bash
pip install -e ".[dev]"
pytest                 # unit tests (synthetic data, offline)
pytest -m network      # integration tests against the public bucket

# find scenes covering a point
sarship search --lon 129.05 --lat 35.08 --start 2021-06-04 --end 2021-06-04

# detect ships in a bounding box
sarship detect GRD/2021/6/4/IW/DV/S1B_IW_GRDH_1SDV_20210604T212406_20210604T212439_027212_034029_2B33 \
    --bbox 129.0 34.95 129.15 35.1 --out busan.geojson --figure busan.png
```

```python
from sarship import S1Product, ShipDetector, DetectorConfig

product = S1Product.from_aws("GRD/2021/6/4/IW/DV/S1B_IW_GRDH_...")
result = ShipDetector(DetectorConfig(method="k", pfa=1e-7)).run(
    product, bbox=(128.9, 34.75, 129.45, 35.2))
result.save_geojson("ships.geojson")
```

The full analysis, with every figure above, is in
[`notebooks/busan_ship_detection.ipynb`](notebooks/busan_ship_detection.ipynb).
The notebook is generated from `scripts/build_notebook.py` so that it diffs
cleanly. Detections are in [`docs/busan_detections.geojson`](docs/busan_detections.geojson).

## Design notes

- **CFAR runs on σ⁰ without noise subtraction.** Thermal noise is additive and
  nearly constant over a CFAR window, so it is simply part of the clutter.
  Subtracting it and clipping the negatives would distort the speckle
  statistics the threshold depends on.
- **Exact finite-sample threshold for gamma clutter.** With the mean estimated
  from N cells, X / mean̂ follows F(2L, 2NL), so the threshold stays correct near
  masks and image edges, where the ring holds fewer samples.
- **Log-cumulant ν estimation.** The second-moment estimator collapses when
  a few ship pixels are present (ν ≈ 0.008 on this scene). Var[ln I] =
  ψ₁(L) + ψ₁(ν) is robust (ν ≈ 21).

## Limitations

- There is no AIS ground truth. VV/VH agreement is a consistency check, not
  a detection rate.
- Azimuth ambiguities and the azimuth offset of moving ships are not modelled.
- Widths of small targets are still inflated by the ~20 m resolution.

## Project layout

```
src/sarship/   annotation.py  s1.py  landmask.py  cfar.py  detect.py
               synthetic.py   search.py  viz.py  cli.py
tests/         unit tests on synthetic data + network integration tests
notebooks/     executed analysis notebook (Busan, 2021-06-04)
scripts/       notebook builder
docs/          figures and detection GeoJSON
```

---

## 세계 상황판 (dashboard/)

OSINT 기반 지정학 상황판입니다. 게시본: https://claude.ai/artifact/VdTv11W2Zv8j55Rpf4aBGJ · 소스와 운영 방식은 [`dashboard/README.md`](dashboard/README.md), 수집 파이프라인은 [`dashboard/pipeline/README.md`](dashboard/pipeline/README.md).

[![상황판 수집](https://github.com/Yang-wb908/Claude_cloud/actions/workflows/collect.yml/badge.svg)](https://github.com/Yang-wb908/Claude_cloud/actions/workflows/collect.yml)
[![검증](https://github.com/Yang-wb908/Claude_cloud/actions/workflows/validate.yml/badge.svg)](https://github.com/Yang-wb908/Claude_cloud/actions/workflows/validate.yml)

이 저장소가 상황판 운영 체계입니다.

| GitHub 기능 | 역할 |
|---|---|
| Actions `collect.yml` (6시간 주기) | 58개 수집원에서 수집 → Claude 보강 → 스냅숏 병합 → 트립와이어 → SITREP → `index.html` 빌드 → 커밋 → Pages 배포 |
| Pages | 상황판을 자체 주소로 호스팅. 여기서는 외부 데이터(위키백과 Current events)를 실시간으로 읽습니다 |
| Issues `tripwire` | 임계치 돌파(호르무즈 통항 10척 미만, 브렌트 110달러, PLA 40대 등)를 Issue로 자동 생성·재확인 |
| Issues `rfi` / `source-proposal` | 템플릿으로 정보 요청·수집원 제안. 열린 RFI는 상황판 브리프에 '열린 정보 요청'으로 표시 |
| Releases `sitrep-<date>` | 매일 09:40 KST SITREP 마크다운과 데이터 스냅숏 zip을 보존 |
| 커밋 이력 `dashboard/data/history/` | 실행별 요약을 남겨 직전 실행 대비 변화(새 사건, 시세·통항 변동)를 계산 |
| PR 검증 `validate.yml` + CODEOWNERS | 분석관 판단 파일(`iw.js`, `theaters.js`, `intel.js`)은 사람이 검토. 데이터 참조·문법·수집원 설정 자동 검사 |
| Dependabot | 파이프라인 의존성과 Actions 버전 주간 갱신 |
| Issues `scenario` (5차) | 시나리오 탭의 "Issue로 제출" → `intake.yml`이 몬테카를로 충격표를 댓글로 답변. 시나리오 토론 스레드가 됨 |
| Issues `judgment` (5차) | 판단 장부 판정 제출 → `data/judgments.json`에 기록·커밋, Brier 점수와 보정표를 댓글로. 분석관 적중률의 공식 기록 |
| Issues `event` (5차) | 현장 보고 양식 → 사건 목록에 등급·좌표와 함께 추가·커밋 (HUMINT/OSINT 수동 입력 경로) |
| Actions `backtest.yml` (주간) | 2년 일봉 시계열 수집 → 사건 연구·트립와이어 발동 이력·장부 보정 계산 → `data/backtest.json` 커밋, 고정 Issue 스레드에 주간 결과 댓글 |
| `snapshots/` 스크린샷 아카이브 | 수집마다 상황판 화면을 Playwright로 찍어 `latest.png`와 일자별 PNG(30일)를 보관. SITREP Release에 첨부 |
| Pages `data/badges/*.json` | shields.io 엔드포인트 배지(브렌트·TTF·밀·VIX·원/달러·7일 사건 수·갱신 시각) |
| Pages에서 GitHub API | 상황판 수집원 탭이 열린 Issue와 최근 커밋을 실시간 표시 |
| `labels.yml` | 라벨 정의 파일을 고치면 워크플로가 저장소 라벨을 동기화 |
| Actions `daily.yml` (매일 09:20 KST) | 2년 일봉 시계열 갱신 → 하우스 뷰(`data/house_view.json`)를 시나리오 모델에 넣어 오늘 예측 스냅숏 저장(`data/forecasts/`) → 20거래일 지난 예측을 실제 시세와 채점(`data/scorecard.json`) → 빌드·커밋·Pages 배포. 결과는 SITREP과 Job Summary에도 요약 |
| Issues `scenario` + "하우스 뷰로 채택" | 체크하면 봇이 하우스 뷰를 갱신해 다음날부터 그 확률로 예측·채점 |
| Actions `advisor.yml` (주간, 6차) | Claude 에이전트가 SDK 도구 실행기로 사건·시세·시뮬레이션·채점·장부를 직접 조회해 하우스 뷰 재조정·새 판단·포지션을 제안하는 Issue를 연다. 체크박스를 켜면 채택. 키가 없으면 규칙 점검만 |
| Issues `pir` / `handover` / `watchcon` / `dissent` (7차) | 우선정보요구 등록, 당직 인수인계, 경보단계 변경, 이견 제기 양식. 봇이 각각 `pirs.json`·`watch_log.json`·`watchcon.json`·판단 장부에 기록하고, 경보단계 변경은 경고 보고(WR)를 생산 |
| `products/` (7차) | 일련번호가 붙은 완성 생산물: 일일 정보 브리프 DIB-YY-MMDD(BLUF·경보단계·ICD 203 판단·징후·24시간 사건·PIR 현황·경제 위험·수집 공백·이견·분석 기준 점검), 경고 보고 WR-YY-MMDD-NN(트립와이어·경보단계 변경). SITREP Release에 첨부 |
| 경제 위험 지수 (6차) | 일일 동기화가 시나리오 꼬리·시장·공급망·포지셔닝·사건·모델 불확실성을 가중한 0~100 지수를 `data/risk.json`에 쓰고 이력을 쌓음. 70 이상이면 트립와이어 Issue, SITREP·배지에 표시 |
| 아티팩트 ↔ 저장소 동기화 (6차) | 게시된 상황판이 보는 사람의 GitHub 커넥터로 `data/*.json`을 읽어 시세·사건·트립와이어·채점·장부·하우스 뷰를 갱신("저장소 동기화" 버튼). Pages 배포 없이도 아티팩트가 최신을 따라감 |

상황판 상태 배지(Pages 배포 후 동작):

![Brent](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fbrent.json)
![TTF](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fttf.json)
![Wheat](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fwheat.json)
![VIX](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fvix.json)
![KRW](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fkrw.json)
![events](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fevents.json)
![updated](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Fupdated.json)
![econ risk](https://img.shields.io/endpoint?url=https%3A%2F%2Fyang-wb908.github.io%2FClaude_cloud%2Fdata%2Fbadges%2Frisk.json)

최신 화면: `https://yang-wb908.github.io/Claude_cloud/snapshots/latest.png`

처음 켤 때: 저장소 Settings → Pages에서 Source를 **GitHub Actions**로 두고, Secrets에 `ANTHROPIC_API_KEY`(선택)를 넣은 뒤 Actions 탭에서 `상황판 수집`을 한 번 수동 실행합니다.
