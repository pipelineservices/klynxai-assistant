from __future__ import annotations

import os
import sqlite3
import threading
from typing import Any, Dict

from core import settings

_lock = threading.Lock()


def _connect() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(settings.ANALYTICS_DB_PATH), exist_ok=True)
    return sqlite3.connect(settings.ANALYTICS_DB_PATH)


def init_db() -> None:
    with _lock, _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts DATETIME DEFAULT CURRENT_TIMESTAMP,
                event TEXT NOT NULL,
                session_id TEXT NOT NULL,
                metadata TEXT
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_event ON events(event)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)")


def write_event(event: str, session_id: str, metadata: Dict[str, Any]) -> None:
    init_db()
    with _lock, _connect() as conn:
        conn.execute(
            "INSERT INTO events (event, session_id, metadata) VALUES (?, ?, ?)",
            (event, session_id, str(metadata)),
        )
