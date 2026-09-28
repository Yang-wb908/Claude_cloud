"""Constant false alarm rate (CFAR) detectors for SAR intensity images.

Each detector compares a cell under test (CUT) with clutter statistics
estimated in a square ring around it::

    +-----------------------+
    |      background       |   background ring: clutter estimate
    |    +-------------+    |
    |    |    guard    |    |   guard ring: excluded, so a ship's own
    |    |     CUT     |    |   pixels do not inflate the estimate
    |    +-------------+    |
    +-----------------------+

Local sums over the rings are computed with integral images, so the cost is
O(N) regardless of window size. Only pixels flagged ``valid`` (open sea)
contribute to the statistics; near coastlines and image edges the ring simply
holds fewer samples.

Thresholds come from the clutter model:

* ``ca_cfar_gamma``  - L-look gamma speckle (homogeneous sea). With the mean
  estimated from N independent cells, X / mean_hat follows an F(2L, 2NL)
  distribution, which gives an exact threshold for finite N.
* ``ca_cfar_k``      - K-distributed clutter (gamma speckle modulated by gamma
  texture with shape nu), the standard model for high-resolution sea clutter.
* ``two_parameter_cfar`` - Gaussian assumption, threshold mean + k * std. It is
  the classic detector in SAR ship detection tools, and is included as a
  baseline because its real false-alarm rate on speckle is far above nominal.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from scipy import integrate, optimize, special, stats


def box_sum(a: np.ndarray, radius: int) -> np.ndarray:
    """Sum of ``a`` over the (2r+1)^2 window centred on each pixel (zeros outside)."""
    k = 2 * radius + 1
    p = np.pad(a.astype(np.float64, copy=False), ((radius + 1, radius), (radius + 1, radius)))
    c = p.cumsum(0).cumsum(1)
    return c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]


@dataclass
class RingStats:
    mean: np.ndarray
    std: np.ndarray
    count: np.ndarray


def ring_stats(img: np.ndarray, valid: np.ndarray, guard: int, background: int) -> RingStats:
    """Mean, standard deviation and sample count in the background ring of every pixel."""
    if not 0 <= guard < background:
        raise ValueError("need 0 <= guard < background")
    w = valid.astype(np.float64)
    x = np.where(valid, img, 0.0).astype(np.float64)
    n = box_sum(w, background) - box_sum(w, guard)
    s1 = box_sum(x, background) - box_sum(x, guard)
    s2 = box_sum(x * x, background) - box_sum(x * x, guard)
    n = np.rint(n)  # integral image round-off
    with np.errstate(invalid="ignore", divide="ignore"):
        mean = s1 / n
        var = np.maximum(s2 / n - mean * mean, 0.0)
    return RingStats(mean, np.sqrt(var), n)


@dataclass
class CFARResult:
    detections: np.ndarray  # bool, CUT exceeded the threshold
    threshold: np.ndarray  # threshold in the units of the input image
    stats: RingStats
    params: dict = field(default_factory=dict)  # model parameters used, e.g. {"nu": ...}


def _finish(img, valid, threshold, stats, min_samples, **params) -> CFARResult:
    ok = valid & (stats.count >= min_samples) & np.isfinite(threshold)
    det = np.zeros(img.shape, dtype=bool)
    det[ok] = img[ok] > threshold[ok]
    return CFARResult(det, threshold, stats, params)


def _default_valid(img, valid):
    finite = np.isfinite(img)
    return finite if valid is None else (valid & finite)


def ca_cfar_gamma(
    img: np.ndarray,
    pfa: float,
    enl: float,
    guard: int = 20,
    background: int = 50,
    valid: np.ndarray | None = None,
    min_samples: int = 200,
) -> CFARResult:
    """Cell-averaging CFAR for L-look gamma-distributed intensity."""
    valid = _default_valid(img, valid)
    st = ring_stats(img, valid, guard, background)
    # The multiplier depends only on the sample count: evaluate it once per distinct count.
    counts, inverse = np.unique(st.count.astype(np.int64), return_inverse=True)
    table = np.where(counts >= min_samples,
                     stats.f.isf(pfa, 2 * enl, 2 * np.maximum(counts, 1) * enl), np.nan)
    alpha = table[inverse.reshape(img.shape)]
    return _finish(img, valid, alpha * st.mean, st, min_samples)


def k_shape_from_moments(intensity: np.ndarray, enl: float) -> float:
    """Method-of-moments estimate of the K-distribution texture shape nu.

    For K-distributed intensity E[I^2] / E[I]^2 = (1 + 1/L)(1 + 1/nu).
    Returns ``inf`` when the data are no more heterogeneous than pure speckle.
    Sensitive to outliers (ships!); prefer :func:`k_shape_from_log_cumulants`.
    """
    x = intensity[np.isfinite(intensity)].astype(np.float64)
    m2 = np.mean(x * x) / np.mean(x) ** 2
    excess = m2 / (1.0 + 1.0 / enl) - 1.0
    return float("inf") if excess <= 0 else 1.0 / excess


def k_shape_from_log_cumulants(intensity: np.ndarray, enl: float) -> float:
    """Log-cumulant (Mellin) estimate of the K texture shape nu.

    For K-distributed intensity Var[ln I] = psi1(L) + psi1(nu), with psi1 the
    trigamma function. Logarithms compress the bright tail, so a handful of
    ship pixels barely moves the estimate, unlike the second moment.
    """
    x = intensity[np.isfinite(intensity) & (intensity > 0)].astype(np.float64)
    excess = np.var(np.log(x)) - special.polygamma(1, enl)
    if excess <= special.polygamma(1, 1e4):
        return float("inf")
    if excess >= special.polygamma(1, 1e-2):
        return 1e-2
    return float(optimize.brentq(lambda nu: special.polygamma(1, nu) - excess, 1e-2, 1e4))


def k_sf(t: float, enl: float, nu: float) -> float:
    """P(I > t * mean) for K-distributed intensity with unit mean."""
    if np.isinf(nu):
        return float(stats.gamma.sf(t, enl, scale=1.0 / enl))

    def integrand(x):
        return stats.gamma.sf(t, enl, scale=x / enl) * stats.gamma.pdf(x, nu, scale=1.0 / nu)

    # Split at the texture mean so quad resolves the peak for large nu.
    upper = stats.gamma.isf(1e-16, nu, scale=1.0 / nu)
    return float(sum(integrate.quad(integrand, a, b, limit=200)[0]
                     for a, b in ((0.0, 1.0), (1.0, upper))))


def k_threshold_multiplier(pfa: float, enl: float, nu: float) -> float:
    """alpha such that P(I > alpha * mean) = pfa under the K model."""
    hi = 2.0
    while k_sf(hi, enl, nu) > pfa:
        hi *= 2.0
    return optimize.brentq(lambda t: np.log(k_sf(t, enl, nu)) - np.log(pfa), 1e-3, hi,
                           xtol=1e-6)


def ca_cfar_k(
    img: np.ndarray,
    pfa: float,
    enl: float,
    nu: float | None = None,
    guard: int = 20,
    background: int = 50,
    valid: np.ndarray | None = None,
    min_samples: int = 200,
) -> CFARResult:
    """Cell-averaging CFAR for K-distributed clutter.

    ``nu`` is the texture shape. If omitted it is estimated with log-cumulants
    from the valid pixels after dividing each by its local ring mean, so
    large-scale brightness trends (incidence angle, wind fronts) do not count
    as texture. The local mean is taken from the background ring; with
    thousands of ring samples its estimation error is negligible next to the
    clutter tail.
    """
    valid = _default_valid(img, valid)
    st = ring_stats(img, valid, guard, background)
    if nu is None:
        ok = valid & (st.count >= min_samples)
        nu = k_shape_from_log_cumulants(img[ok] / st.mean[ok], enl)
    alpha = k_threshold_multiplier(pfa, enl, nu)
    return _finish(img, valid, alpha * st.mean, st, min_samples, nu=nu, alpha=alpha)


def two_parameter_cfar(
    img: np.ndarray,
    pfa: float,
    guard: int = 20,
    background: int = 50,
    valid: np.ndarray | None = None,
    min_samples: int = 200,
) -> CFARResult:
    """Gaussian two-parameter CFAR: detect where I > mean + k * std."""
    valid = _default_valid(img, valid)
    st = ring_stats(img, valid, guard, background)
    k = stats.norm.isf(pfa)
    return _finish(img, valid, st.mean + k * st.std, st, min_samples)
