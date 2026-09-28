"""Plotting helpers for sigma0 images and detections."""

from __future__ import annotations

import numpy as np
from matplotlib.axes import Axes
from matplotlib.colors import ListedColormap

from .detect import Detection, DetectionResult
from .s1 import PixelWindow


def to_db(sigma0: np.ndarray) -> np.ndarray:
    with np.errstate(divide="ignore", invalid="ignore"):
        return 10 * np.log10(sigma0)


def show_sigma0(ax: Axes, sigma0: np.ndarray, vmin: float = -25, vmax: float = 0,
                step: int = 1, extent=None, **kw):
    """Display sigma0 in dB; ``step`` decimates large images by block averaging."""
    img = sigma0
    if step > 1:
        h, w = (s // step * step for s in sigma0.shape)
        img = np.nanmean(sigma0[:h, :w].reshape(h // step, step, w // step, step), axis=(1, 3))
    im = ax.imshow(to_db(img), cmap="gray", vmin=vmin, vmax=vmax, extent=extent,
                   interpolation="nearest", **kw)
    ax.set_xticks([])
    ax.set_yticks([])
    return im


def show_mask(ax: Axes, mask: np.ndarray, color: str = "#d9a441", alpha: float = 0.35,
              step: int = 1, extent=None):
    m = mask[::step, ::step]
    ax.imshow(np.ma.masked_where(~m, m), cmap=ListedColormap([color]), alpha=alpha,
              extent=extent, interpolation="nearest")


def plot_detections(ax: Axes, result: DetectionResult, step: int = 1, color: str = "#29d3e6",
                    size: float = 10, detections: list[Detection] | None = None, **kw):
    dets = result.detections if detections is None else detections
    rows = [(d.row - result.window.row0) / step for d in dets]
    cols = [(d.col - result.window.col0) / step for d in dets]
    ax.scatter(cols, rows, s=size**2, facecolors="none", edgecolors=color, linewidths=1.2, **kw)


def north_up_flips(window: PixelWindow, geo) -> tuple[bool, bool]:
    """(flip_ud, flip_lr) that make the window appear roughly north-up, east-right.

    SAR images are stored in acquisition geometry: on a descending pass the
    first line is the northernmost and range (columns) increases westward, so
    the raw image is a mirror image of the map.
    """
    w = window
    rows = np.array([w.row0, w.row1 - 1, w.row0])
    cols = np.array([w.col0, w.col0, w.col1 - 1])
    lat, lon = geo.pixel_to_latlon(rows, cols)
    return bool(lat[1] > lat[0]), bool(lon[2] < lon[0])


def orient_north_up(ax: Axes, window: PixelWindow, geo) -> tuple[bool, bool]:
    """Invert the axes of an image plot of ``window`` so it is north-up, east-right."""
    flip_ud, flip_lr = north_up_flips(window, geo)
    if flip_ud:
        ax.invert_yaxis()
    if flip_lr:
        ax.invert_xaxis()
    return flip_ud, flip_lr


def chip(result: DetectionResult, det: Detection, half: int = 32) -> np.ndarray:
    """Sub-image of sigma0 centred on a detection (NaN-padded at the borders)."""
    r = int(round(det.row - result.window.row0))
    c = int(round(det.col - result.window.col0))
    out = np.full((2 * half + 1, 2 * half + 1), np.nan, dtype=np.float32)
    h, w = result.sigma0.shape
    r0, r1, c0, c1 = max(r - half, 0), min(r + half + 1, h), max(c - half, 0), min(c + half + 1, w)
    out[r0 - (r - half):r1 - (r - half), c0 - (c - half):c1 - (c - half)] = \
        result.sigma0[r0:r1, c0:c1]
    return out
