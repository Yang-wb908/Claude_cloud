import numpy as np
import pytest
from shapely.geometry import box

from sarship.annotation import GeoGrid, parse_calibration, parse_noise, parse_product
from sarship.landmask import land_mask
from sarship.s1 import PixelWindow

CAL_XML = """<calibration><calibrationVectorList count="2">
<calibrationVector><line>0</line><pixel count="3">0 50 100</pixel>
  <sigmaNought count="3">10 20 30</sigmaNought><betaNought count="3">1 1 1</betaNought>
</calibrationVector>
<calibrationVector><line>100</line><pixel count="2">0 100</pixel>
  <sigmaNought count="2">30 50</sigmaNought><betaNought count="2">1 1</betaNought>
</calibrationVector></calibrationVectorList></calibration>"""

NOISE_XML = """<noise>
<noiseRangeVectorList count="2">
 <noiseRangeVector><line>0</line><pixel count="2">0 100</pixel>
   <noiseRangeLut count="2">100 200</noiseRangeLut></noiseRangeVector>
 <noiseRangeVector><line>100</line><pixel count="2">0 100</pixel>
   <noiseRangeLut count="2">100 200</noiseRangeLut></noiseRangeVector>
</noiseRangeVectorList>
<noiseAzimuthVectorList count="2">
 <noiseAzimuthVector><swath>IW1</swath><firstAzimuthLine>0</firstAzimuthLine>
   <firstRangeSample>0</firstRangeSample><lastAzimuthLine>100</lastAzimuthLine>
   <lastRangeSample>49</lastRangeSample><line count="2">0 100</line>
   <noiseAzimuthLut count="2">1 3</noiseAzimuthLut></noiseAzimuthVector>
 <noiseAzimuthVector><swath>IW2</swath><firstAzimuthLine>0</firstAzimuthLine>
   <firstRangeSample>50</firstRangeSample><lastAzimuthLine>100</lastAzimuthLine>
   <lastRangeSample>100</lastRangeSample><line count="1">0</line>
   <noiseAzimuthLut count="1">0.5</noiseAzimuthLut></noiseAzimuthVector>
</noiseAzimuthVectorList></noise>"""


def make_geogrid(n_lines=1000, n_samples=1200) -> GeoGrid:
    """Descending-like geometry: lat decreases with line, lon decreases with pixel, slight shear."""
    lines = np.linspace(0, n_lines - 1, 6)
    pixels = np.linspace(0, n_samples - 1, 7)
    ll, pp = np.meshgrid(lines, pixels, indexing="ij")
    lat = 35.0 - 1e-4 * ll - 1e-5 * pp
    lon = 129.0 - 1.2e-4 * pp + 2e-5 * ll + 1e-10 * pp**2
    return GeoGrid(lines, pixels, lat, lon, 30 + 0.01 * pp, n_lines, n_samples)


def product_xml(geo_points: str) -> str:
    return f"""<product><adsHeader><missionId>S1B</missionId><polarisation>VV</polarisation>
    <mode>IW</mode><startTime>2021-06-04T21:24:06</startTime></adsHeader>
    <generalAnnotation><productInformation><pass>Descending</pass></productInformation>
    </generalAnnotation><imageAnnotation><imageInformation><numberOfLines>101</numberOfLines>
    <numberOfSamples>201</numberOfSamples><rangePixelSpacing>10</rangePixelSpacing>
    <azimuthPixelSpacing>10</azimuthPixelSpacing></imageInformation></imageAnnotation>
    <geolocationGrid><geolocationGridPointList>{geo_points}</geolocationGridPointList>
    </geolocationGrid></product>"""


def test_calibration_interpolation_handles_differing_pixel_grids():
    lut = parse_calibration(CAL_XML)
    out = lut.interpolate(np.array([0, 50, 100, 150]), np.array([0, 25, 100]))
    np.testing.assert_allclose(out[0], [10, 15, 30])
    np.testing.assert_allclose(out[2], [30, 35, 50])
    np.testing.assert_allclose(out[1], [20, 25, 40])
    np.testing.assert_allclose(out[3], out[2])  # clamped past the last vector
    beta = parse_calibration(CAL_XML, "betaNought")
    np.testing.assert_allclose(beta.interpolate(np.arange(3), np.arange(3)), 1)


def test_noise_applies_azimuth_blocks():
    noise = parse_noise(NOISE_XML)
    out = noise.interpolate(np.array([0.0, 50, 100]), np.array([0.0, 50, 100]))
    np.testing.assert_allclose(out[:, 0], [100, 200, 300])  # IW1: azimuth LUT 1 -> 3
    np.testing.assert_allclose(out[:, 1:], [[75, 100]] * 3)  # IW2: constant 0.5


def test_noise_without_azimuth_vectors():
    xml = NOISE_XML.split("<noiseAzimuthVectorList")[0] + "</noise>"
    out = parse_noise(xml).interpolate(np.array([0.0]), np.array([0.0, 100]))
    np.testing.assert_allclose(out, [[100, 200]])


def test_parse_product():
    pts = "".join(
        f"<geolocationGridPoint><line>{ln}</line><pixel>{px}</pixel>"
        f"<latitude>{35 - ln * 1e-3}</latitude><longitude>{129 + px * 1e-3}</longitude>"
        f"<incidenceAngle>{30 + px * 0.01}</incidenceAngle></geolocationGridPoint>"
        for ln in (0, 50, 100) for px in (0, 100, 200)
    )
    ann = parse_product(product_xml(pts))
    assert (ann.mission, ann.mode, ann.pass_direction) == ("S1B", "IW", "Descending")
    assert (ann.n_lines, ann.n_samples, ann.range_spacing) == (101, 201, 10.0)
    lat, lon = ann.geo.pixel_to_latlon(25, 150)
    assert lat == pytest.approx(34.975) and lon == pytest.approx(129.15)
    assert ann.geo.incidence(0, 100) == pytest.approx(31.0)


def test_geogrid_round_trip():
    geo = make_geogrid()
    rng = np.random.default_rng(0)
    r, c = rng.uniform(0, 999, 200), rng.uniform(0, 1199, 200)
    r2, c2 = geo.latlon_to_pixel(*geo.pixel_to_latlon(r, c))
    assert np.max(np.hypot(r2 - r, c2 - c)) < 0.5
    assert np.isnan(geo.latlon_to_pixel(40.0, 120.0)[0])


def test_land_mask_rasterises_in_image_geometry():
    geo = make_geogrid()
    window = PixelWindow(200, 600, 300, 900)
    # Land = everything east of a meridian that cuts through the window.
    lat_c, lon_c = geo.pixel_to_latlon(400, 600)
    land = box(float(lon_c), 34.0, 131.0, 36.0)
    mask = land_mask(geo, window, buffer_px=0, geometries=[land])
    # lon decreases with pixel -> land is on the low-column side.
    lat, lon = geo.pixel_to_latlon(window.rows[:, None], window.cols[None, :])
    expected = lon >= lon_c
    assert (mask == expected).mean() > 0.995
    buffered = land_mask(geo, window, buffer_px=10, geometries=[land])
    assert buffered.sum() > mask.sum()
    assert not land_mask(geo, window, geometries=[box(0, 0, 1, 1)]).any()


def test_refine_land_mask_grows_attached_structures_only():
    from sarship.landmask import otsu_threshold, refine_land_mask
    from sarship.synthetic import gamma_clutter

    rng = np.random.default_rng(3)
    sigma0 = gamma_clutter((300, 300), 4.4, mean=0.02, rng=rng)  # sea at -17 dB
    sigma0[:, :60] = gamma_clutter((300, 60), 4.4, mean=0.3, rng=rng)  # land
    sigma0[140:160, 60:160] = gamma_clutter((20, 100), 4.4, mean=0.3, rng=rng)  # pier
    sigma0[250:254, 220:250] = 30.0  # a ship, isolated
    coarse = np.zeros(sigma0.shape, bool)
    coarse[:, :55] = True  # the database coastline misses the pier
    land, landlike, thr = refine_land_mask(sigma0, coarse, buffer_px=0)
    assert land[150, 150] and land[150, 100]
    assert not land[252, 235]
    assert not land[60:130, 100:].any()
    assert landlike[150, 150] and not landlike[50, 200]
    assert -17 < thr < -5
    assert abs(otsu_threshold(np.r_[np.zeros(100), np.ones(100)]) - 0.5) < 0.05


def test_refine_land_mask_leaves_open_sea_alone():
    from sarship.landmask import refine_land_mask
    from sarship.synthetic import k_clutter

    sigma0 = k_clutter((300, 300), 4.4, nu=10, mean=0.02, rng=4)
    land, _, _ = refine_land_mask(sigma0, np.zeros(sigma0.shape, bool))
    assert land.mean() < 0.001
