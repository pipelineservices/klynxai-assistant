import json
import os
from threading import Lock
from typing import Optional

from devops_orchestrator import settings

_LOCK = Lock()


def _ensure_dir(path: str) -> None:
    folder = os.path.dirname(path)
    if folder and not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)


def _load_state() -> dict:
    _ensure_dir(settings.STATE_PATH)
    if not os.path.exists(settings.STATE_PATH):
        return {}
    with open(settings.STATE_PATH, "r", encoding="utf-8") as f:
        raw = f.read().strip()
        if not raw:
            return {}
        return json.loads(raw)


def _save_state(state: dict) -> None:
    _ensure_dir(settings.STATE_PATH)
    with open(settings.STATE_PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(state))


def get(key: str) -> Optional[dict]:
    with _LOCK:
        state = _load_state()
        return state.get(key)


def set_once(key: str, value: dict) -> bool:
    with _LOCK:
        state = _load_state()
        if key in state:
            return False
        state[key] = value
        _save_state(state)
        return True


def update(key: str, patch: dict) -> None:
    with _LOCK:
        state = _load_state()
        current = state.get(key, {})
        current.update(patch)
        state[key] = current
        _save_state(state)
