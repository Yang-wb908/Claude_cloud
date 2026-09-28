import numpy as np

from sarship.detect import (
    Detection,
    DetectorConfig,
    ShipDetector,
    cluster_detections,
    filter_weak_detections,
)
from sarship.s1 import PixelWindow
from sarship.synthetic import inject_targets, k_clutter


def test_detector_finds_injected_targets():
    rng = np.random.default_rng(10)
    sea = k_clutter((800, 800), enl=4.4, nu=8.0, mean=0.02, rng=rng)
    img, truth = inject_targets(sea, 12, scr_db=(15, 25), rng=rng)
    cfg = DetectorConfig(method="k", pfa=1e-6, guard=15, background=40, min_peak_db=-40)
    dets, _, nu = ShipDetector(cfg).detect_array(img)
    assert 3 < nu < 30
    found = sum(any(np.hypot(d.row - t.row, d.col - t.col) < 10 for d in dets) for t in truth)
    false = sum(all(np.hypot(d.row - t.row, d.col - t.col) >= 10 for t in truth) for d in dets)
    assert found >= 11
    assert false <= 2


def test_land_is_excluded():
    rng = np.random.default_rng(11)
    img = k_clutter((300, 300), enl=4.4, nu=8.0, mean=0.02, rng=rng)
    img[:, :100] = 5.0  # bright "land"
    land = np.zeros(img.shape, bool)
    land[:, :110] = True
    dets, res, _ = ShipDetector(DetectorConfig(pfa=1e-5, guard=5, background=20,
                                               min_peak_db=-40)).detect_array(img, land)
    assert not res.detections[:, :110].any()
    assert all(d.col > 110 for d in dets)


def test_cluster_geometry():
    mask = np.zeros((100, 100), bool)
    mask[50:52, 20:50] = True  # 30 px long, 2 px wide, along the columns
    sigma0 = np.where(mask, 1.0, 0.01)
    cfg = DetectorConfig(min_area_px=4, max_length_m=1000, min_peak_db=-10)
    (d,) = cluster_detections(mask, sigma0, cfg, pixel_spacing=10.0)
    assert abs(d.length_m - 300) < 15
    assert abs(d.width_m - 20) < 5
    assert d.orientation_deg in (0.0, 180.0) or abs(d.orientation_deg) < 1
    assert abs(d.row - 50.5) < 1e-6 and abs(d.col - 34.5) < 1e-6


def test_cluster_filters():
    mask = np.zeros((200, 200), bool)
    mask[10, 10] = True  # too small
    mask[100:102, 10:150] = True  # 1.4 km: a breakwater, not a ship
    mask[50:54, 50:54] = True  # keeps
    sigma0 = np.where(mask, 1.0, 0.01)
    dets = cluster_detections(mask, sigma0, DetectorConfig(min_area_px=4, max_length_m=450))
    assert len(dets) == 1 and abs(dets[0].row - 51.5) < 1e-6


def _det(row, col, peak_db):
    return Detection(id=0, row=row, col=col, lat=0, lon=0, area_px=10, length_m=50,
                     width_m=10, orientation_deg=0, peak_db=peak_db, mean_db=peak_db - 3,
                     incidence_deg=35)


def test_weak_detections_need_open_sea():
    window = PixelWindow(0, 200, 0, 200)
    land = np.zeros((200, 200), bool)
    land[:, :20] = True
    landlike = land.copy()
    landlike[150:190, 150:190] = True  # a sand bar the coastline database lacks
    landlike[100:103, 100:104] = True  # a weak ship's own blob
    cfg = DetectorConfig(weak_peak_db=5, coastal_zone_m=300, neighbourhood_m=300,
                         max_landlike_fraction=0.01)
    dets = [
        _det(50, 40, 0.0),    # weak, 200 m from land -> dropped
        _det(50, 40, 12.0),   # strong, same place -> kept
        _det(101, 101, 0.0),  # weak, open sea, own blob ignored -> kept
        _det(170, 170, 0.0),  # weak, on the sand bar -> dropped
        _det(130, 130, 0.0),  # weak, sand bar fills >1% of neighbourhood -> dropped
    ]
    kept = filter_weak_detections(dets, window, land, landlike, cfg)
    assert [(d.row, d.peak_db) for d in kept] == [(50, 12.0), (101, 0.0)]
    assert [d.id for d in kept] == [1, 2]
