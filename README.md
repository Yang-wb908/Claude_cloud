# sarship: ship detection in Sentinel-1 SAR imagery

From raw Sentinel-1 GRD data to geolocated ship detections, using only public
data read directly from the [Sentinel-1 bucket on AWS](https://registry.opendata.aws/sentinel-1/).

![Detections over Busan](docs/figures/busan_detections.png)

## Pipeline

```
raw GRD (DN) ─► calibration σ⁰ ─► land mask ─► CFAR ─► clustering ─► GeoJSON
                (+ noise LUT)     Natural Earth  K-dist.   size / shape /
                                  + image-based  clutter   open-sea filters
```

- **Data access**: parses the annotation XML (calibration, thermal noise, geolocation grid) and reads only the image tiles it needs over HTTP range requests
- **Land mask**: Natural Earth coastline mapped into image geometry, then extended over piers, reclaimed land and bridges found in the image (Otsu threshold + connectivity)
- **CFAR**: cell-averaging CFAR under a gamma, K-distribution or Gaussian clutter model. The K texture shape is estimated with log-cumulants, which ships barely affect
- **Validation**: on simulated K clutter, only the K-CFAR holds its design false-alarm rate. At Pfa = 1e-4 the Gaussian CFAR exceeds it 49× and the gamma CFAR 6×

![False-alarm validation](docs/figures/pfa_validation.png)

## Usage

```bash
pip install -e ".[dev]"
pytest

sarship search --lon 129.05 --lat 35.08 --start 2021-06-04 --end 2021-06-04
sarship detect GRD/2021/6/4/IW/DV/S1B_IW_GRDH_1SDV_20210604T212406_20210604T212439_027212_034029_2B33 \
    --bbox 128.9 34.75 129.45 35.2 --out busan.geojson --figure busan.png
```

The full analysis is in [`notebooks/busan_ship_detection.ipynb`](notebooks/busan_ship_detection.ipynb).
It is generated from `scripts/build_notebook.py`.

## Status

Work in progress. The limitations are listed at the end of the notebook: there is no AIS ground truth, azimuth ambiguities are not filtered, and ship widths are overestimated.
