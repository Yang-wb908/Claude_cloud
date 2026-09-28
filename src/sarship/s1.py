"""Reading Sentinel-1 GRD products and turning digital numbers into sigma0.

Products are addressed by their key in the public ``sentinel-s1-l1c`` bucket
(``GRD/2021/6/4/IW/DV/S1B_IW_GRDH_...``), which is laid out with short file
names (``measurement/iw-vv.tiff``). A local directory with the same layout
works too. Annotation XML is small and is cached on disk; the measurement
GeoTIFFs are tiled, so only the tiles covering the requested window are
fetched over HTTP range requests.
"""

from __future__ import annotations

import json
import os
import urllib.request
from dataclasses import dataclass
from functools import cached_property
from pathlib import Path

import numpy as np
import rasterio
from rasterio.windows import Window

from .annotation import NoiseLUT, ProductAnnotation, VectorLUT, parse_calibration, parse_noise
from .annotation import parse_product as _parse_product

AWS_BASE = "https://sentinel-s1-l1c.s3.amazonaws.com"

#: Equivalent number of looks of IW GRDH products (S-1 product definition, Table 5-3).
ENL_IW_GRDH = 4.4


def default_cache_dir() -> Path:
    return Path(os.environ.get("SARSHIP_CACHE", Path.home() / ".cache" / "sarship"))


@dataclass(frozen=True)
class PixelWindow:
    """Half-open pixel window ``[row0, row1) x [col0, col1)``."""

    row0: int
    row1: int
    col0: int
    col1: int

    @property
    def shape(self) -> tuple[int, int]:
        return self.row1 - self.row0, self.col1 - self.col0

    @property
    def rows(self) -> np.ndarray:
        return np.arange(self.row0, self.row1, dtype=np.float64)

    @property
    def cols(self) -> np.ndarray:
        return np.arange(self.col0, self.col1, dtype=np.float64)

    def to_rasterio(self) -> Window:
        return Window(self.col0, self.row0, self.col1 - self.col0, self.row1 - self.row0)


class S1Product:
    def __init__(self, root: str, cache_dir: str | Path | None = None):
        self.root = root.rstrip("/")
        self.is_remote = self.root.startswith(("http://", "https://"))
        self.name = self.root.rsplit("/", 1)[-1]
        self.cache_dir = Path(cache_dir) if cache_dir else default_cache_dir()

    @classmethod
    def from_aws(cls, key: str, **kwargs) -> S1Product:
        return cls(f"{AWS_BASE}/{key.strip('/')}", **kwargs)

    def __repr__(self) -> str:
        return f"S1Product({self.name!r})"

    # -- file access -------------------------------------------------------

    def read_file(self, relpath: str) -> bytes:
        if not self.is_remote:
            return (Path(self.root) / relpath).read_bytes()
        cached = self.cache_dir / self.name / relpath
        if not cached.exists():
            cached.parent.mkdir(parents=True, exist_ok=True)
            with urllib.request.urlopen(f"{self.root}/{relpath}", timeout=60) as resp:
                data = resp.read()
            tmp = cached.with_suffix(cached.suffix + ".part")
            tmp.write_bytes(data)
            tmp.replace(cached)
        return cached.read_bytes()

    @cached_property
    def info(self) -> dict:
        """``productInfo.json`` (footprint, times, file list)."""
        return json.loads(self.read_file("productInfo.json"))

    @property
    def mode(self) -> str:
        return self.name.split("_")[1].lower()

    @property
    def polarisations(self) -> list[str]:
        files = self.info["filenameMap"].values()
        return sorted(f.rsplit("-", 1)[-1][:2] for f in files if f.startswith("measurement/"))

    def _annotation_path(self, pol: str, kind: str = "") -> str:
        base = f"{self.mode}-{pol.lower()}.xml"
        return f"annotation/calibration/{kind}-{base}" if kind else f"annotation/{base}"

    def annotation(self, pol: str = "vv") -> ProductAnnotation:
        return self._cached(("product", pol), lambda: _parse_product(
            self.read_file(self._annotation_path(pol))))

    def calibration(self, pol: str = "vv", kind: str = "sigmaNought") -> VectorLUT:
        return self._cached(("cal", pol, kind), lambda: parse_calibration(
            self.read_file(self._annotation_path(pol, "calibration")), kind))

    def noise(self, pol: str = "vv") -> NoiseLUT:
        return self._cached(("noise", pol), lambda: parse_noise(
            self.read_file(self._annotation_path(pol, "noise"))))

    def _cached(self, key, make):
        store = self.__dict__.setdefault("_parsed", {})
        if key not in store:
            store[key] = make()
        return store[key]

    def measurement_uri(self, pol: str = "vv") -> str:
        path = f"measurement/{self.mode}-{pol.lower()}.tiff"
        return f"/vsicurl/{self.root}/{path}" if self.is_remote else f"{self.root}/{path}"

    # -- pixel data --------------------------------------------------------

    def read_dn(self, pol: str = "vv", window: PixelWindow | None = None) -> np.ndarray:
        env = {"GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR", "GDAL_HTTP_MULTIRANGE": "YES"}
        with rasterio.Env(**env), rasterio.open(self.measurement_uri(pol)) as ds:
            return ds.read(1, window=window.to_rasterio() if window else None)

    def read_sigma0(
        self,
        pol: str = "vv",
        window: PixelWindow | None = None,
        denoise: bool = True,
        floor: float = 1e-5,
    ) -> np.ndarray:
        """Calibrated backscatter (linear sigma0) for ``window``.

        sigma0 = (DN^2 - noise) / A_sigma^2, where A_sigma is the calibration
        LUT and ``noise`` the thermal noise estimate. Pixels outside the valid
        swath (DN == 0) are returned as NaN; denoised values are clipped at
        ``floor`` so the result stays positive.
        """
        ann = self.annotation(pol)
        window = window or PixelWindow(0, ann.n_lines, 0, ann.n_samples)
        dn = self.read_dn(pol, window).astype(np.float32)
        power = dn * dn
        if denoise:
            power -= self.noise(pol).interpolate(window.rows, window.cols).astype(np.float32)
        a = self.calibration(pol).interpolate(window.rows, window.cols).astype(np.float32)
        sigma0 = power / (a * a)
        if denoise:
            np.maximum(sigma0, floor, out=sigma0)
        sigma0[dn == 0] = np.nan
        return sigma0

    def window_from_bbox(
        self, lon_min: float, lat_min: float, lon_max: float, lat_max: float, pol: str = "vv"
    ) -> PixelWindow:
        """Smallest pixel window containing the geographic bounding box."""
        ann = self.annotation(pol)
        t = np.linspace(0, 1, 50)
        lon = np.concatenate([lon_min + (lon_max - lon_min) * t, np.full_like(t, lon_max),
                              lon_max - (lon_max - lon_min) * t, np.full_like(t, lon_min)])
        lat = np.concatenate([np.full_like(t, lat_min), lat_min + (lat_max - lat_min) * t,
                              np.full_like(t, lat_max), lat_max - (lat_max - lat_min) * t])
        rows, cols = ann.geo.latlon_to_pixel(lat, lon)
        ok = np.isfinite(rows)
        if not ok.any():
            raise ValueError("bounding box does not intersect the product footprint")
        # Parts of the box may fall outside the swath; clamp to the image.
        return PixelWindow(
            max(0, int(np.floor(rows[ok].min()))),
            min(ann.n_lines, int(np.ceil(rows[ok].max())) + 1),
            max(0, int(np.floor(cols[ok].min()))),
            min(ann.n_samples, int(np.ceil(cols[ok].max())) + 1),
        )
