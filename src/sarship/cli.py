"""Command line interface: ``sarship search`` and ``sarship detect``."""

from __future__ import annotations

import argparse
import sys
from datetime import date, timedelta


def _date(s: str) -> date:
    return date.fromisoformat(s)


def cmd_search(args) -> int:
    from .search import search

    days = [args.start + timedelta(d) for d in range((args.end - args.start).days + 1)]
    for info in search(args.lon, args.lat, days, args.mode, args.polarisation):
        print(info["path"])
    return 0


def cmd_detect(args) -> int:
    from .detect import DetectorConfig, ShipDetector
    from .s1 import S1Product

    product = (S1Product(args.product) if args.product.startswith(("/", ".", "http"))
               else S1Product.from_aws(args.product))
    cfg = DetectorConfig(pol=args.pol, method=args.method, pfa=args.pfa,
                         land_buffer_m=args.land_buffer)
    result = ShipDetector(cfg).run(product, bbox=tuple(args.bbox) if args.bbox else None)
    result.save_geojson(args.out)
    nu = f", K shape nu={result.nu:.2f}" if result.nu is not None else ""
    print(f"{len(result.detections)} ships in window {result.window.shape}{nu} -> {args.out}")
    if args.figure:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        from .viz import orient_north_up, plot_detections, show_mask, show_sigma0

        step = max(1, max(result.sigma0.shape) // 2000)
        fig, ax = plt.subplots(figsize=(10, 10))
        show_sigma0(ax, result.sigma0, step=step)
        show_mask(ax, result.land, step=step)
        plot_detections(ax, result, step=step)
        orient_north_up(ax, result.window, product.annotation(cfg.pol).geo)
        ax.set_title(f"{product.name}\n{len(result.detections)} detections ({cfg.method} CFAR, "
                     f"Pfa={cfg.pfa:g}, {cfg.pol.upper()})", fontsize=9)
        fig.savefig(args.figure, dpi=150, bbox_inches="tight")
        print(f"figure -> {args.figure}")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="sarship", description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="find products covering a point")
    s.add_argument("--lon", type=float, required=True)
    s.add_argument("--lat", type=float, required=True)
    s.add_argument("--start", type=_date, required=True, help="YYYY-MM-DD")
    s.add_argument("--end", type=_date, required=True, help="YYYY-MM-DD (inclusive)")
    s.add_argument("--mode", default="IW")
    s.add_argument("--polarisation", default="DV")
    s.set_defaults(func=cmd_search)

    d = sub.add_parser("detect", help="detect ships in a product")
    d.add_argument("product", help="AWS key (GRD/...) or path/URL of a product directory")
    d.add_argument("--bbox", type=float, nargs=4, metavar=("LON_MIN", "LAT_MIN", "LON_MAX",
                                                           "LAT_MAX"))
    d.add_argument("--pol", default="vv", choices=["vv", "vh", "hh", "hv"])
    d.add_argument("--method", default="k", choices=["k", "gamma", "two-parameter"])
    d.add_argument("--pfa", type=float, default=1e-7)
    d.add_argument("--land-buffer", type=float, default=500.0, help="metres")
    d.add_argument("--out", default="detections.geojson")
    d.add_argument("--figure", help="optional PNG overview")
    d.set_defaults(func=cmd_detect)

    args = p.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
