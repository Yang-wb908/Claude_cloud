"""Collection pipeline CLI.

    python dashboard/pipeline/run.py all            # collect -> enrich -> assemble -> tripwires -> build
    python dashboard/pipeline/run.py collect --offline   # replay from cache
    python dashboard/pipeline/run.py report         # write reports/SITREP-<date>.md

Environment: ANTHROPIC_API_KEY (optional, enables Korean summaries), PIPELINE_MODEL (default claude-opus-5-5),
PIPELINE_NO_CLAUDE=1 to force rules-only enrichment.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
DASH = HERE.parent
sys.path.insert(0, str(DASH))
from pipeline import assemble, collectors, enrich, fetch, report, tripwires  # noqa: E402

log = logging.getLogger("pipeline")
RAW = HERE / "cache" / "raw.json"
ENR = HERE / "cache" / "enriched.json"


def load_sources() -> tuple[dict, list[dict]]:
    cfg = yaml.safe_load((HERE / "sources.yaml").read_text())
    srcs = [s for s in cfg["sources"] if s.get("enabled", True)]
    return cfg.get("defaults", {}), srcs


def cmd_collect(args) -> None:
    fetch.OFFLINE = args.offline
    fetch.UA = os.environ.get("PIPELINE_UA", fetch.UA)
    defaults, srcs = load_sources()
    if args.only:
        srcs = [s for s in srcs if s["id"] in args.only.split(",")]
    items, status = [], []

    def one(src):
        t0 = time.time()
        try:
            got = collectors.collect(src, defaults)
            return src, got, None, int((time.time() - t0) * 1000)
        except Exception as e:  # noqa: BLE001
            return src, [], f"{type(e).__name__}: {str(e)[:160]}", int((time.time() - t0) * 1000)

    with ThreadPoolExecutor(max_workers=8) as ex:
        for fut in as_completed([ex.submit(one, s) for s in srcs]):
            src, got, err, ms = fut.result()
            for it in got:
                it["id"] = assemble.item_id(it)
            items += got
            status.append({"id": src["id"], "name": src["name"], "kind": src["kind"], "grade": src.get("grade"), "ok": err is None, "n": len(got), "err": err, "ms": ms,
                           "verify": bool(src.get("verify")), "tags": src.get("tags", []), "region": src.get("region", "")})
            log.info("%-18s %s %3d items %5dms %s", src["id"], "ok " if err is None else "ERR", len(got), ms, err or "")
    # dedupe by id, prefer richer summary
    byid: dict[str, dict] = {}
    for it in items:
        cur = byid.get(it["id"])
        if not cur or len(it.get("summary", "")) > len(cur.get("summary", "")):
            byid[it["id"]] = it
    items = list(byid.values())
    status.sort(key=lambda s: s["id"])
    RAW.parent.mkdir(parents=True, exist_ok=True)
    RAW.write_text(json.dumps({"generated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"), "items": items, "status": status}, ensure_ascii=False))
    ok = sum(1 for s in status if s["ok"])
    log.info("collected %d unique items from %d/%d sources", len(items), ok, len(status))


def cmd_enrich(args) -> None:
    raw = json.loads(RAW.read_text())
    use_claude = not (args.no_claude or os.environ.get("PIPELINE_NO_CLAUDE"))
    items = enrich.enrich_all(raw["items"], use_claude=use_claude)
    ENR.write_text(json.dumps({"generated": raw["generated"], "items": items, "status": raw["status"]}, ensure_ascii=False))
    n_cl = sum(1 for it in items if it.get("enr", {}).get("claude"))
    n_rel = sum(1 for it in items if it.get("enr", {}).get("rel", 0) >= 2)
    log.info("enriched %d items (%d relevant, %d refined by Claude)", len(items), n_rel, n_cl)


def cmd_assemble(args) -> None:
    enr = json.loads(ENR.read_text())
    res = assemble.assemble(enr["items"], enr["status"])
    c = res["auto"]["counts"]
    log.info("assembled: +%d events (%d candidates), markets %d, portwatch %d", c["added"], c["candidates"], len(res["auto"]["markets"]), len(res["auto"]["portwatch"]))


def cmd_tripwires(args) -> None:
    fired = tripwires.run(DASH)
    for f in fired:
        log.warning("TRIPWIRE %s: %s (현재 %s)", f["id"], f["title"], f["current"])
    log.info("tripwires fired: %d", len(fired))


def cmd_report(args) -> None:
    p = report.run(DASH, DASH.parent / "reports")
    log.info("report written: %s", p)


def cmd_build(args) -> None:
    subprocess.run([sys.executable, str(DASH / "build.py")], check=True)


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description="세계 상황판 수집 파이프라인")
    ap.add_argument("cmd", choices=["collect", "enrich", "assemble", "tripwires", "report", "build", "all"])
    ap.add_argument("--offline", action="store_true", help="네트워크 없이 캐시만 사용")
    ap.add_argument("--only", help="수집원 id 목록(쉼표)")
    ap.add_argument("--no-claude", action="store_true", help="규칙 기반 분류만 사용")
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    steps = {"collect": cmd_collect, "enrich": cmd_enrich, "assemble": cmd_assemble, "tripwires": cmd_tripwires, "report": cmd_report, "build": cmd_build}
    if args.cmd == "all":
        for name in ["collect", "enrich", "assemble", "tripwires", "report", "build"]:
            steps[name](args)
    else:
        steps[args.cmd](args)


if __name__ == "__main__":
    main()
