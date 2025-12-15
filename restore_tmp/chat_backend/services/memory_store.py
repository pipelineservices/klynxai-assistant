# /opt/klynxagentent/klynxai-enterprise/chat_backend/services/memory_store.py

from __future__ import annotations
from typing import Dict, List, Any
import threading

_LOCK = threading.Lock()

# conversation_id -> messages[]
_STORE: Dict[str, List[dict]] = {}

# Keep memory bounded
MAX_MESSAGES = 40  # last N messages (user+assistant together)


def get_messages(conversation_id: str) -> List[dict]:
    with _LOCK:
        return list(_STORE.get(conversation_id, []))


def append_messages(conversation_id: str, new_messages: List[dict]) -> List[dict]:
    """
    Append messages and return updated list (bounded).
    """
    with _LOCK:
        current = _STORE.get(conversation_id, [])
        current.extend(new_messages)
        # Keep only last MAX_MESSAGES
        if len(current) > MAX_MESSAGES:
            current = current[-MAX_MESSAGES:]
        _STORE[conversation_id] = current
        return list(current)


def reset(conversation_id: str) -> None:
    with _LOCK:
        _STORE.pop(conversation_id, None)

