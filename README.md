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
