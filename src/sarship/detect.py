"""End-to-end ship detection: sigma0 -> land mask -> CFAR -> clustered targets."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np
from scipy import ndimage

from . import cfar
from .annotation import GeoGrid
from .landmask import land_mask, refine_land_mask
from .s1 import ENL_IW_GRDH, PixelWindow, S1Product


@dataclass
class DetectorConfig:
    pol: str = "vv"
    method: str = "k"  # "k", "gamma" or "two-parameter"
    pfa: float = 1e-7
    enl: float = ENL_IW_GRDH
    guard: int = 20  # px; half-size of the guard window (10 m pixels)
    background: int = 50  # px; half-size of the background window
    land_buffer_m: float = 500.0
    refine_land: bool = True  # grow the coastline mask over piers, breakwaters, bridges
    # Weak detections (peak below ``weak_peak_db``) are only kept in open sea.
    # Near the coast, or among small land-like features the masks missed (sand
    # bars, rocks), the clutter is not the K-distributed sea the threshold assumes.
    weak_peak_db: float = 5.0
    coastal_zone_m: float = 300.0
    neighbourhood_m: float = 400.0  # half-size of the window checked for land-like pixels
    max_landlike_fraction: float = 0.01
    min_area_px: int = 4
    max_length_m: float = 450.0
    min_peak_db: float = -5.0  # sigma0 of the brightest pixel; rejects faint speckle blobs
    # Thermal noise is additive and nearly constant over a CFAR window, so it is
    # simply part of the clutter. Subtracting it and clipping the negative
    # values would distort the speckle statistics the thresholds rely on.
    denoise: bool = False


@dataclass
class Detection:
    id: int
    row: float
    col: float
    lat: float
    lon: float
    area_px: int
    length_m: float
    width_m: float
    orientation_deg: float  # major axis in image coordinates, from the column axis
    peak_db: float
    mean_db: float
    incidence_deg: float


@dataclass
class DetectionResult:
    product: str
    window: PixelWindow
    config: DetectorConfig
    sigma0: np.ndarray
    land: np.ndarray
    mask: np.ndarray  # raw CFAR detections before clustering
    detections: list[Detection]
    nu: float | None = None
    extra: dict = field(default_factory=dict)

    def to_geojson(self) -> dict:
        feats = [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [d.lon, d.lat]},
                "properties": {k: v for k, v in asdict(d).items() if k not in ("lat", "lon")},
            }
            for d in self.detections
        ]
        return {
            "type": "FeatureCollection",
            "properties": {"product": self.product, "window": asdict(self.window),
                           "config": asdict(self.config), "k_shape_nu": self.nu},
            "features": feats,
        }

    def save_geojson(self, path: str | Path) -> None:
        Path(path).write_text(json.dumps(self.to_geojson(), indent=1))


def run_cfar(sigma0: np.ndarray, sea: np.ndarray, cfg: DetectorConfig):
    """Apply the configured CFAR; returns (result, estimated K shape or None)."""
    kw = dict(guard=cfg.guard, background=cfg.background, valid=sea)
    if cfg.method == "k":
        res = cfar.ca_cfar_k(sigma0, cfg.pfa, cfg.enl, **kw)
        return res, res.params["nu"]
    if cfg.method == "gamma":
        return cfar.ca_cfar_gamma(sigma0, cfg.pfa, cfg.enl, **kw), None
    if cfg.method == "two-parameter":
        return cfar.two_parameter_cfar(sigma0, cfg.pfa, **kw), None
    raise ValueError(f"unknown CFAR method {cfg.method!r}")


def cluster_detections(
    mask: np.ndarray,
    sigma0: np.ndarray,
    cfg: DetectorConfig,
    pixel_spacing: float = 10.0,
    geo: GeoGrid | None = None,
    window: PixelWindow | None = None,
) -> list[Detection]:
    """Group detected pixels into targets and measure them.

    Pixels are joined with 8-connectivity after a one-pixel closing, so a ship
    broken up by speckle stays one object. Length and width come from the
    second moments of the pixel cloud (a uniform rectangle of length L has
    variance L^2/12 along its axis).
    """
    row0, col0 = (window.row0, window.col0) if window else (0, 0)
    joined = ndimage.binary_closing(mask, structure=np.ones((3, 3)))
    labels, n = ndimage.label(joined, structure=np.ones((3, 3)))
    out: list[Detection] = []
    for idx, sl in enumerate(ndimage.find_objects(labels), start=1):
        if sl is None:
            continue
        sub = (labels[sl] == idx) & mask[sl]  # measure only pixels CFAR actually flagged
        area = int(sub.sum())
        if area < cfg.min_area_px:
            continue
        rr, cc = np.nonzero(sub)
        vals = sigma0[sl][rr, cc]
        rr = rr + sl[0].start
        cc = cc + sl[1].start
        w = vals / vals.sum()
        r_c, c_c = float((w * rr).sum()), float((w * cc).sum())
        if area >= 3:
            ev, evec = np.linalg.eigh(np.cov(np.vstack([cc, rr])))
            length = np.sqrt(12 * max(ev[1], 0) + 1) * pixel_spacing
            width = np.sqrt(12 * max(ev[0], 0) + 1) * pixel_spacing
            angle = float(np.degrees(np.arctan2(evec[1, 1], evec[0, 1])) % 180)
        else:
            length = width = np.sqrt(area) * pixel_spacing
            angle = 0.0
        peak_db = float(10 * np.log10(vals.max()))
        if length > cfg.max_length_m or peak_db < cfg.min_peak_db:
            continue
        lat = lon = inc = float("nan")
        if geo is not None:
            la, lo = geo.pixel_to_latlon(r_c + row0, c_c + col0)
            lat, lon = float(la), float(lo)
            inc = float(geo.incidence(r_c + row0, c_c + col0))
        out.append(Detection(
            id=len(out) + 1, row=r_c + row0, col=c_c + col0, lat=lat, lon=lon, area_px=area,
            length_m=round(float(length), 1), width_m=round(float(width), 1),
            orientation_deg=round(angle, 1), peak_db=round(peak_db, 2),
            mean_db=round(float(10 * np.log10(vals.mean())), 2), incidence_deg=round(inc, 2),
        ))
    return out


def filter_weak_detections(
    dets: list[Detection],
    window: PixelWindow,
    land: np.ndarray,
    landlike: np.ndarray | None,
    cfg: DetectorConfig,
    pixel_spacing: float = 10.0,
) -> list[Detection]:
    """Keep weak detections only if they sit in open sea.

    A detection with peak below ``cfg.weak_peak_db`` is dropped when it is
    within ``coastal_zone_m`` of land, or when more than
    ``max_landlike_fraction`` of its neighbourhood is land-like, not counting
    the bright blob under the detection itself.
    """
    dist_m = (ndimage.distance_transform_edt(~land) * pixel_spacing if land.any()
              else np.full(land.shape, np.inf))
    labels = sizes = None
    if landlike is not None:
        labels = ndimage.label(landlike)[0]
        sizes = np.bincount(labels.ravel())
    half = int(round(cfg.neighbourhood_m / pixel_spacing))
    # A ship's own bright blob is at most a few hundred pixels; a larger blob
    # under a weak detection means it sits on an extended feature (sand bar).
    max_own_px = (cfg.max_length_m / pixel_spacing) * 10
    kept = []
    for d in dets:
        r, c = int(round(d.row)) - window.row0, int(round(d.col)) - window.col0
        if d.peak_db < cfg.weak_peak_db:
            if dist_m[r, c] < cfg.coastal_zone_m:
                continue
            if labels is not None:
                sl = (slice(max(r - half, 0), r + half + 1), slice(max(c - half, 0), c + half + 1))
                patch = labels[sl]
                own = labels[max(r - 2, 0):r + 3, max(c - 2, 0):c + 3]
                own = np.unique(own[own > 0])
                if (sizes[own] > max_own_px).any():
                    continue
                others = (patch > 0) & ~np.isin(patch, own)
                if others.mean() > cfg.max_landlike_fraction:
                    continue
        kept.append(d)
    for i, d in enumerate(kept, start=1):
        d.id = i
    return kept


class ShipDetector:
    def __init__(self, config: DetectorConfig | None = None):
        self.config = config or DetectorConfig()

    def detect_array(self, sigma0: np.ndarray, land: np.ndarray | None = None,
                     pixel_spacing: float = 10.0):
        """Run CFAR and clustering on an in-memory sigma0 image (no geocoding)."""
        land = np.zeros(sigma0.shape, bool) if land is None else land
        sea = np.isfinite(sigma0) & ~land
        res, nu = run_cfar(sigma0, sea, self.config)
        return cluster_detections(res.detections, sigma0, self.config, pixel_spacing), res, nu

    def run(
        self,
        product: S1Product,
        window: PixelWindow | None = None,
        bbox: tuple[float, float, float, float] | None = None,
    ) -> DetectionResult:
        cfg = self.config
        ann = product.annotation(cfg.pol)
        if window is None:
            window = (product.window_from_bbox(*bbox, pol=cfg.pol) if bbox
                      else PixelWindow(0, ann.n_lines, 0, ann.n_samples))
        sigma0 = product.read_sigma0(cfg.pol, window, denoise=cfg.denoise)
        spacing = ann.range_spacing
        land = land_mask(ann.geo, window, buffer_px=int(round(cfg.land_buffer_m / spacing)))
        extra = {}
        landlike = None
        if cfg.refine_land:
            land, landlike, extra["land_threshold_db"] = refine_land_mask(sigma0, land)
        sea = np.isfinite(sigma0) & ~land
        res, nu = run_cfar(sigma0, sea, cfg)
        dets = cluster_detections(res.detections, sigma0, cfg, spacing, ann.geo, window)
        n_before = len(dets)
        dets = filter_weak_detections(dets, window, land, landlike, cfg, spacing)
        extra["weak_rejected"] = n_before - len(dets)
        extra["threshold"] = res.threshold
        return DetectionResult(product.name, window, cfg, sigma0, land, res.detections, dets, nu,
                               extra=extra)
