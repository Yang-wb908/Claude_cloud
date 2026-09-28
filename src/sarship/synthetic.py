"""Synthetic SAR scenes with known statistics, for testing detectors."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


def gamma_clutter(shape, enl: float, mean: float = 1.0, rng=None) -> np.ndarray:
    """Homogeneous L-look speckle: intensity ~ Gamma(L, mean / L)."""
    rng = np.random.default_rng(rng)
    return rng.gamma(enl, mean / enl, size=shape)


def k_clutter(shape, enl: float, nu: float, mean: float = 1.0, rng=None,
              correlation_px: float = 0.0) -> np.ndarray:
    """K-distributed intensity: gamma speckle times gamma texture of shape ``nu``.

    ``correlation_px`` > 0 makes the texture spatially correlated (swell-like
    patches), which is closer to real sea clutter; the texture keeps its
    Gamma(nu, 1/nu) marginal via a Gaussian copula.
    """
    rng = np.random.default_rng(rng)
    if correlation_px > 0:
        from scipy import ndimage, stats

        g = ndimage.gaussian_filter(rng.standard_normal(shape), correlation_px)
        g /= g.std()
        texture = stats.gamma.ppf(stats.norm.cdf(g), nu, scale=1.0 / nu)
    else:
        texture = rng.gamma(nu, 1.0 / nu, size=shape)
    return texture * rng.gamma(enl, mean / enl, size=shape)


@dataclass
class Target:
    row: int
    col: int
    length: int
    width: int
    angle_deg: float
    scr_db: float  # peak signal-to-clutter ratio


def inject_targets(img: np.ndarray, n: int, scr_db=(8.0, 20.0), length=(5, 30), width=(2, 5),
                   margin: int = 60, rng=None) -> tuple[np.ndarray, list[Target]]:
    """Add ``n`` elongated bright targets with gamma-fluctuating returns.

    Targets are placed at least ``margin`` px from the border and from each
    other, so each can be scored independently.
    """
    rng = np.random.default_rng(rng)
    out = img.copy()
    mean = np.nanmean(img)
    targets: list[Target] = []
    rr, cc = np.mgrid[-20:21, -20:21]
    tries = 0
    while len(targets) < n:
        tries += 1
        if tries > 100 * n:
            raise RuntimeError("could not place targets; image too small")
        r = int(rng.integers(margin, img.shape[0] - margin))
        c = int(rng.integers(margin, img.shape[1] - margin))
        if any(np.hypot(t.row - r, t.col - c) < margin for t in targets):
            continue
        t = Target(r, c, int(rng.integers(*length)), int(rng.integers(*width)),
                   float(rng.uniform(0, 180)), float(rng.uniform(*scr_db)))
        a = np.deg2rad(t.angle_deg)
        u = cc * np.cos(a) + rr * np.sin(a)
        v = -cc * np.sin(a) + rr * np.cos(a)
        shape = (np.abs(u) <= t.length / 2) & (np.abs(v) <= t.width / 2)
        peak = mean * 10 ** (t.scr_db / 10)
        # Swerling-like fluctuation: exponential returns around a smooth profile.
        profile = peak * np.exp(-(u / (0.6 * t.length)) ** 2)
        returns = np.where(shape, profile * rng.exponential(1.0, shape.shape), 0.0)
        out[r - 20:r + 21, c - 20:c + 21] += returns
        targets.append(t)
    return out, targets
