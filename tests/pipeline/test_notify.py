import json
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "dashboard"))

from pipeline import notify  # noqa: E402

NOW = datetime(2026, 10, 9, 12, tzinfo=UTC)


def _dash(tmp_path, fired, events=()):
    (tmp_path / "data").mkdir(exist_ok=True)
    (tmp_path / "data" / "tripwires.json").write_text(json.dumps({"fired": fired}))
    (tmp_path / "data_snapshot.json").write_text(json.dumps({"events": list(events)}))
    return tmp_path


def test_only_new_alerts_are_sent_and_refire_after_clear(tmp_path, monkeypatch):
    sent = []
    monkeypatch.setattr(notify, "send", lambda new, env: sent.append([a["key"] for a in new]) or ["ntfy"])
    env = {"NTFY_TOPIC": "t"}
    ev = {"id": "firms-x-2026-10-09", "src": "firms", "d": "2026-10-09", "r": 3, "x": "위성 열점"}
    _dash(tmp_path, [{"id": "a", "title": "A", "sev": 4, "current": 1}, {"id": "low", "title": "L", "sev": 2}], [ev, {**ev, "id": "old", "d": "2026-09-01"}])
    notify.run(tmp_path, NOW, env)
    assert sent[-1] == ["trip:a", "ev:firms-x-2026-10-09"]  # 낮은 등급·오래된 사건 제외
    notify.run(tmp_path, NOW + timedelta(hours=6), env)
    assert len(sent) == 1  # 같은 경보는 다시 안 보냄
    _dash(tmp_path, [], [ev]); notify.run(tmp_path, NOW + timedelta(hours=12), env)
    _dash(tmp_path, [{"id": "a", "title": "A", "sev": 4}], [ev]); notify.run(tmp_path, NOW + timedelta(hours=18), env)
    assert sent[-1] == ["trip:a"]  # 해제 후 재발동은 다시 알림


def test_no_channel_does_nothing_and_failure_keeps_state(tmp_path, monkeypatch):
    _dash(tmp_path, [{"id": "a", "title": "A", "sev": 5}])
    assert notify.run(tmp_path, NOW, {}) == {"sent": [], "channels": []}
    assert not (tmp_path / "data" / "notify_state.json").exists()
    monkeypatch.setattr(notify, "send", lambda new, env: (_ for _ in ()).throw(RuntimeError("down")))
    assert notify.run(tmp_path, NOW, {"NTFY_TOPIC": "t"}).get("error")
    assert not (tmp_path / "data" / "notify_state.json").exists()  # 실패하면 다음에 다시 보낸다
    title, body, prio = notify.message([{"sev": 5, "src": "트립와이어", "title": "x"}])
    assert prio == 5 and "긴급" in title and body.startswith("• [트립와이어]")
