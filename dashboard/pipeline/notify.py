"""Push new alerts to a phone (ntfy) and/or Slack — only what is new since the last push.

Alerts: fired tripwires, sensor events (FIRMS, IODA, USGS, GDACS, OFAC, ADS-B, CISA KEV, ransomware) from the last two days
with relevance 3, and watch-level raises in the last two days. data/notify_state.json remembers what was sent; a tripwire
that clears and fires again is sent again.

Channels (GitHub Secrets → env):
  NTFY_TOPIC         ntfy topic name (install the ntfy app, subscribe to the same name). Keep it hard to guess.
  NTFY_SERVER        optional, default https://ntfy.sh
  SLACK_WEBHOOK_URL  optional
  BOARD_URL          optional link opened when the notification is tapped
  NOTIFY_MIN_SEV     optional, default 3 (1–5)
No channel configured → nothing is sent and the state is left alone.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import UTC, datetime, timedelta
from pathlib import Path

from . import fetch

log = logging.getLogger("pipeline.notify")
SENSOR_SRC = {"firms": "위성 열점", "ioda": "인터넷 장애", "usgs": "지진", "gdacs": "재난", "ofac": "제재", "adsb": "군용기", "cisa_kev": "사이버", "ransomware": "사이버"}


def collect_alerts(dash: Path, now: datetime) -> list[dict]:
    rd = lambda p: json.loads(p.read_text()) if p.exists() else None
    out = []
    trip = rd(dash / "data" / "tripwires.json") or {}
    for f in trip.get("fired", []):
        out.append({"key": "trip:" + f["id"], "sev": int(f.get("sev") or 3), "src": "트립와이어", "title": f"{f['title']} (현재 {f.get('current')})"})
    cut = (now - timedelta(days=2)).strftime("%Y-%m-%d")
    snap = rd(dash / "data_snapshot.json") or {}
    for e in snap.get("events", []):
        if e.get("src") in SENSOR_SRC and e.get("d", "") >= cut and (e.get("r") or 0) >= 3:
            out.append({"key": "ev:" + (e.get("id") or e.get("s", "")), "sev": 4, "src": SENSOR_SRC[e["src"]], "title": e.get("x", "")[:140]})
    wc = rd(dash / "data" / "watchcon.json") or {}
    for th, w in (wc.get("theaters") or {}).items():
        for h in w.get("history", []):
            if h.get("from") is not None and h.get("to", 0) > h["from"] and h.get("d", "") >= cut:
                out.append({"key": f"wc:{th}:{h['d']}:{h['to']}", "sev": min(5, int(h["to"])), "src": "경보단계", "title": f"{th} {h['from']}→{h['to']} {h.get('why', '')[:90]}"})
    return out


def diff(alerts: list[dict], state: dict, now: datetime, min_sev: int) -> tuple[list[dict], dict]:
    sent = dict(state.get("sent") or {})
    live_trip = {a["key"] for a in alerts if a["key"].startswith("trip:")}
    for k in [k for k in sent if k.startswith("trip:") and k not in live_trip]:
        del sent[k]  # 해제된 트립와이어는 다시 발동하면 또 알린다
    keep = (now - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M")
    sent = {k: v for k, v in sent.items() if k.startswith("trip:") or v >= keep}
    new = [a for a in alerts if a["sev"] >= min_sev and a["key"] not in sent]
    stamp = now.strftime("%Y-%m-%dT%H:%M")
    for a in alerts:
        sent.setdefault(a["key"], stamp)
    return sorted(new, key=lambda a: -a["sev"]), {"sent": sent, "at": stamp}


def message(new: list[dict]) -> tuple[str, str, int]:
    top = max(a["sev"] for a in new)
    title = f"상황판 경보 {len(new)}건" + (" · 긴급" if top >= 5 else "")
    lines = [f"• [{a['src']}] {a['title']}" for a in new[:8]] + ([f"… 외 {len(new) - 8}건"] if len(new) > 8 else [])
    return title, "\n".join(lines), 5 if top >= 5 else 4 if top >= 4 else 3


def send(new: list[dict], env: dict) -> list[str]:
    title, body, prio = message(new)
    done = []
    if env.get("NTFY_TOPIC"):
        payload = {"topic": env["NTFY_TOPIC"], "title": title, "message": body, "priority": prio, "tags": ["rotating_light" if prio >= 4 else "globe_with_meridians"]}
        if env.get("BOARD_URL"):
            payload["click"] = env["BOARD_URL"]
        r = fetch.session().post(env.get("NTFY_SERVER") or "https://ntfy.sh", json=payload, timeout=20)
        r.raise_for_status(); done.append("ntfy")
    if env.get("SLACK_WEBHOOK_URL"):
        r = fetch.session().post(env["SLACK_WEBHOOK_URL"], json={"text": f"*{title}*\n{body}" + (f"\n<{env['BOARD_URL']}|상황판 열기>" if env.get("BOARD_URL") else "")}, timeout=20)
        r.raise_for_status(); done.append("slack")
    return done


def run(dash: Path, now: datetime | None = None, env: dict | None = None) -> dict:
    now = now or datetime.now(UTC)
    env = env if env is not None else dict(os.environ)
    if not (env.get("NTFY_TOPIC") or env.get("SLACK_WEBHOOK_URL")):
        log.info("notify: no channel configured (NTFY_TOPIC / SLACK_WEBHOOK_URL)"); return {"sent": [], "channels": []}
    sp = dash / "data" / "notify_state.json"
    state = json.loads(sp.read_text()) if sp.exists() else {}
    new, state2 = diff(collect_alerts(dash, now), state, now, int(env.get("NOTIFY_MIN_SEV") or 3))
    channels = []
    if new:
        try:
            channels = send(new, env)
        except Exception as e:  # noqa: BLE001
            log.warning("notify send failed: %s", str(e).replace(env.get("NTFY_TOPIC") or "\0", "***")[:200])
            return {"sent": [], "channels": [], "error": True}  # 실패하면 상태를 저장하지 않아 다음에 다시 보낸다
    sp.write_text(json.dumps(state2, ensure_ascii=False, separators=(",", ":")))
    log.info("notify: %d new → %s", len(new), channels or "nothing to send")
    return {"sent": [a["key"] for a in new], "channels": channels}
