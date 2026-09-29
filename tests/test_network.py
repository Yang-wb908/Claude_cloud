"""Integration tests against the public Sentinel-1 bucket.

Skipped by default; run with ``pytest -m network``.
"""

import numpy as np
import pytest

from sarship import DetectorConfig, S1Product, ShipDetector
from sarship.s1 import PixelWindow

KEY = "GRD/2021/6/4/IW/DV/S1B_IW_GRDH_1SDV_20210604T212406_20210604T212439_027212_034029_2B33"

pytestmark = pytest.mark.network


@pytest.fixture(scope="module")
def product():
    return S1Product.from_aws(KEY)


def test_annotation_and_geolocation(product):
    ann = product.annotation("vv")
    assert (ann.mission, ann.mode, ann.pass_direction) == ("S1B", "IW", "Descending")
    assert product.polarisations == ["vh", "vv"]
    # Busan port lies inside the scene and maps back onto itself.
    row, col = ann.geo.latlon_to_pixel(35.09, 129.06)
    lat, lon = ann.geo.pixel_to_latlon(row, col)
    assert abs(lat - 35.09) < 1e-4 and abs(lon - 129.06) < 1e-4


def test_sigma0_is_plausible(product):
    window = PixelWindow(12000, 12512, 12000, 12512)  # open sea south of Busan
    sigma0 = product.read_sigma0("vv", window)
    db = 10 * np.log10(np.nanmedian(sigma0))
    assert -25 < db < -10  # C-band VV sea backscatter at ~35 deg incidence


def test_detection_in_busan_anchorage(product):
    result = ShipDetector(DetectorConfig()).run(product, bbox=(129.0, 34.95, 129.15, 35.1))
    assert 30 <= len(result.detections) <= 80
    assert all(34.9 < d.lat < 35.15 and 128.95 < d.lon < 129.2 for d in result.detections)
