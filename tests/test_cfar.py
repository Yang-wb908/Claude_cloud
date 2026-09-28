import numpy as np
import pytest
from scipy import stats

from sarship import cfar
from sarship.synthetic import gamma_clutter, k_clutter


def test_box_sum_matches_brute_force():
    rng = np.random.default_rng(0)
    a = rng.random((23, 17))
    out = cfar.box_sum(a, 3)
    p = np.pad(a, 3)
    brute = np.array([[p[i:i + 7, j:j + 7].sum() for j in range(17)] for i in range(23)])
    np.testing.assert_allclose(out, brute, atol=1e-10)


def test_ring_stats_excludes_guard_and_invalid():
    img = np.ones((41, 41))
    img[20, 20] = 1000.0  # CUT; inside the guard window
    valid = np.ones_like(img, bool)
    valid[0, :] = False
    img[0, :] = 50.0  # invalid row must not leak into the statistics
    st = cfar.ring_stats(img, valid, guard=2, background=6)
    assert st.mean[20, 20] == pytest.approx(1.0)
    assert st.std[20, 20] == pytest.approx(0.0, abs=1e-6)
    assert st.count[20, 20] == 13 * 13 - 5 * 5


def test_ring_stats_rejects_bad_windows():
    with pytest.raises(ValueError):
        cfar.ring_stats(np.ones((5, 5)), np.ones((5, 5), bool), guard=3, background=3)


@pytest.mark.parametrize("pfa", [1e-2, 1e-3])
def test_gamma_cfar_false_alarm_rate(pfa):
    img = gamma_clutter((600, 600), enl=4.0, rng=1)
    res = cfar.ca_cfar_gamma(img, pfa, enl=4.0, guard=3, background=12)
    tested = res.stats.count >= 200
    rate = res.detections[tested].mean()
    # Binomial 4-sigma band around the nominal rate.
    n = tested.sum()
    assert abs(rate - pfa) < 4 * np.sqrt(pfa / n) + 0.1 * pfa


def test_two_parameter_cfar_overshoots_on_speckle():
    """The Gaussian assumption badly underestimates the gamma tail."""
    img = gamma_clutter((600, 600), enl=4.4, rng=2)
    res = cfar.two_parameter_cfar(img, 1e-4, guard=3, background=12)
    rate = res.detections[res.stats.count >= 200].mean()
    assert rate > 10 * 1e-4


def test_k_sf_reduces_to_gamma_for_large_nu():
    for t in (1.5, 3.0, 5.0):
        assert cfar.k_sf(t, 4.4, np.inf) == pytest.approx(stats.gamma.sf(t, 4.4, scale=1 / 4.4))
        assert cfar.k_sf(t, 4.4, 1e4) == pytest.approx(cfar.k_sf(t, 4.4, np.inf), rel=0.02)


def test_k_threshold_grows_with_heavier_tails():
    light = cfar.k_threshold_multiplier(1e-6, 4.4, 50.0)
    heavy = cfar.k_threshold_multiplier(1e-6, 4.4, 2.0)
    assert heavy > light > 1.0


@pytest.mark.parametrize("nu", [1.5, 5.0])
def test_k_shape_estimators(nu):
    img = k_clutter((800, 800), enl=4.4, nu=nu, rng=3)
    assert cfar.k_shape_from_log_cumulants(img, 4.4) == pytest.approx(nu, rel=0.1)
    assert cfar.k_shape_from_moments(img, 4.4) == pytest.approx(nu, rel=0.2)


def test_log_cumulant_estimator_is_robust_to_bright_outliers():
    img = k_clutter((800, 800), enl=4.4, nu=5.0, rng=4)
    img.flat[::5000] = 1e4  # a few "ships"
    assert cfar.k_shape_from_log_cumulants(img, 4.4) == pytest.approx(5.0, rel=0.15)
    assert cfar.k_shape_from_moments(img, 4.4) < 0.1  # moments are wrecked


def test_k_shape_of_pure_speckle_is_infinite():
    img = gamma_clutter((800, 800), enl=4.4, rng=5)
    assert cfar.k_shape_from_log_cumulants(img, 4.4) > 50


def test_k_cfar_false_alarm_rate_on_k_clutter():
    pfa = 1e-3
    img = k_clutter((700, 700), enl=4.4, nu=3.0, rng=6)
    res = cfar.ca_cfar_k(img, pfa, enl=4.4, nu=3.0, guard=3, background=15)
    rate = res.detections[res.stats.count >= 200].mean()
    assert 0.6 * pfa < rate < 1.6 * pfa
    # Assuming pure speckle on the same data gives many more false alarms.
    gam = cfar.ca_cfar_gamma(img, pfa, enl=4.4, guard=3, background=15)
    assert gam.detections[gam.stats.count >= 200].mean() > 3 * pfa


def test_nan_pixels_are_never_detected():
    img = gamma_clutter((200, 200), enl=4.4, rng=7)
    img[50:60, 50:60] = np.nan
    res = cfar.ca_cfar_gamma(img, 1e-2, enl=4.4, guard=2, background=10)
    assert not res.detections[50:60, 50:60].any()
