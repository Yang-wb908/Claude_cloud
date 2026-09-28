"""Land masking with Natural Earth coastlines, rasterised into SAR image geometry.

Natural Earth 1:10m polygons are accurate to a few hundred metres, so the mask
is dilated by a buffer to keep coastline clutter, harbour walls and small
islets out of the detector. Anything the coarse coastline still misses is
caught later by the cluster size filter.
"""

from __future__ import annotations

import json
import urllib.request
from functools import lru_cache
from pathlib import Path

import numpy as np
import shapely
from rasterio import features
from rasterio.transform import Affine
from scipy import ndimage
from shapely.geometry import Polygon, shape

from .annotation import GeoGrid
from .s1 import PixelWindow, default_cache_dir

NE_BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson"
NE_LAYERS = ("ne_10m_land.geojson", "ne_10m_minor_islands.geojson")


def _download(name: str, cache_dir: Path) -> Path:
    path = cache_dir / "naturalearth" / name
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(f"{NE_BASE}/{name}", timeout=120) as resp:
            data = resp.read()
        path.with_suffix(".part").write_bytes(data)
        path.with_suffix(".part").replace(path)
    return path


@lru_cache(maxsize=2)
def load_land(cache_dir: str | None = None) -> tuple[shapely.STRtree, list]:
    """All Natural Earth land polygons, with a spatial index."""
    root = Path(cache_dir) if cache_dir else default_cache_dir()
    geoms = []
    for name in NE_LAYERS:
        with open(_download(name, root)) as f:
            geoms += [shape(feat["geometry"]) for feat in json.load(f)["features"]]
    return shapely.STRtree(geoms), geoms


def land_mask(
    geo: GeoGrid,
    window: PixelWindow,
    buffer_px: int = 50,
    geometries=None,
) -> np.ndarray:
    """Boolean mask (True = land or within ``buffer_px`` of it) for ``window``.

    Land polygons are clipped to the window footprint, their vertices mapped to
    (row, col) through the inverse geolocation model and burned into a raster.
    ``geometries`` overrides the Natural Earth polygons (used by tests).
    """
    if geometries is None:
        tree, all_geoms = load_land()
    else:
        all_geoms = list(geometries)
        tree = shapely.STRtree(all_geoms)
    pad = buffer_px + 2
    footprint = Polygon(geo.footprint((max(0, window.row0 - pad), window.row1 + pad,
                                       max(0, window.col0 - pad), window.col1 + pad)))
    # Pad in degrees so polygons straddling the border are kept, but stay inside
    # the scene: the inverse geolocation model is undefined beyond it.
    clip = footprint.buffer(0.02).intersection(Polygon(geo.footprint()).buffer(-1e-4))

    def to_pixels(coords: np.ndarray) -> np.ndarray:
        rows, cols = geo.latlon_to_pixel(coords[:, 1], coords[:, 0])
        # Pixel coordinates refer to pixel centres; raster cells span [c, c+1).
        return np.column_stack([cols - window.col0 + 0.5, rows - window.row0 + 0.5])

    shapes = []
    for i in tree.query(clip, predicate="intersects"):
        part = all_geoms[i].intersection(clip)
        if part.is_empty:
            continue
        pix = shapely.transform(part, to_pixels)
        if not pix.is_valid:
            pix = shapely.make_valid(pix)
        if not pix.is_empty:
            shapes.append(pix)

    mask = np.zeros(window.shape, dtype=bool)
    if shapes:
        mask = features.rasterize(
            ((s, 1) for s in shapes), out_shape=window.shape, transform=Affine.identity(),
            fill=0, dtype="uint8", all_touched=True,
        ).astype(bool)
    if buffer_px > 0 and mask.any():
        mask = ndimage.distance_transform_edt(~mask) <= buffer_px
    return mask


def otsu_threshold(values: np.ndarray, bins: int = 256) -> float:
    """Threshold maximising the between-class variance of a 1-D sample."""
    hist, edges = np.histogram(values, bins=bins)
    centers = (edges[:-1] + edges[1:]) / 2
    w0 = np.cumsum(hist)
    w1 = w0[-1] - w0
    m0 = np.cumsum(hist * centers) / np.maximum(w0, 1)
    m1 = (np.sum(hist * centers) - np.cumsum(hist * centers)) / np.maximum(w1, 1)
    between = w0 * w1 * (m0 - m1) ** 2
    # Empty bins between the classes give ties; split the gap in the middle.
    best = np.flatnonzero(between >= between.max() * (1 - 1e-9))
    return float((edges[best[0] + 1] + edges[best[-1] + 1]) / 2)


def refine_land_mask(
    sigma0: np.ndarray,
    land: np.ndarray,
    smooth_px: int = 11,
    buffer_px: int = 10,
    min_island_px: int = 2_500,
    min_contrast_db: float = 4.0,
    landlike_contrast_db: float = 3.0,
) -> tuple[np.ndarray, np.ndarray, float]:
    """Extend a coarse land mask with land-like areas found in the image itself.

    Coastline databases miss reclaimed land, piers, breakwaters and bridges,
    which are exactly the bright, structured features a CFAR fires on. Here
    the image is smoothed (``smooth_px`` box, in dB) and split into dark sea and
    bright land-like pixels with Otsu's threshold. A bright region is added to
    the mask if it touches the existing land mask (structures attached to the
    coast) or is larger than ``min_island_px`` (islands the database lacks).
    Isolated ships are far smaller than either, so they stay in the sea.

    Also returns a looser land-like map (``landlike_contrast_db`` above the
    median sea level) that catches darker features such as sand bars, for
    screening weak detections, and the mask threshold in dB.
    """
    finite = np.isfinite(sigma0)
    db = 10 * np.log10(np.where(finite, np.maximum(sigma0, 1e-6), 1e-6))
    w = ndimage.uniform_filter(finite.astype(np.float32), smooth_px)
    smooth = ndimage.uniform_filter(np.where(finite, db, 0).astype(np.float32), smooth_px)
    smooth = np.where(w > 0.5, smooth / np.maximum(w, 1e-6), np.nan)
    sample = smooth[np.isfinite(smooth)][::7]
    # Without land in the window Otsu would split the sea in two; never go
    # below ``min_contrast_db`` above the typical sea level.
    sea_level = float(np.nanmedian(smooth[~land & np.isfinite(smooth)][::7]))
    threshold = max(otsu_threshold(sample), sea_level + min_contrast_db)
    bright = np.isfinite(smooth) & (smooth > threshold)
    landlike = np.isfinite(smooth) & (smooth > sea_level + landlike_contrast_db)
    labels, n = ndimage.label(bright)
    if n == 0:
        return land, landlike, threshold
    touching = np.unique(labels[bright & ndimage.binary_dilation(land, iterations=2)])
    sizes = np.bincount(labels.ravel(), minlength=n + 1)
    keep = np.zeros(n + 1, dtype=bool)
    keep[touching] = True
    keep[sizes >= min_island_px] = True
    keep[0] = False
    extra = keep[labels]
    if buffer_px > 0 and extra.any():
        extra = ndimage.distance_transform_edt(~extra) <= buffer_px
    return land | extra, landlike, threshold
