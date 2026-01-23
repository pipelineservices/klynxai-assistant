from __future__ import annotations

import json
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
            (event, session_id, json.dumps(metadata)),
        )


def summary_last_24h() -> Dict[str, Any]:
    init_db()
    with _lock, _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT COUNT(*) FROM events WHERE ts >= datetime('now','-1 day')"
        )
        total = cur.fetchone()[0]
        cur.execute(
            "SELECT COUNT(*) FROM events WHERE event='page.view' AND ts >= datetime('now','-1 day')"
        )
        views = cur.fetchone()[0]
        cur.execute(
            "SELECT COUNT(*) FROM events WHERE event='chat.submit' AND ts >= datetime('now','-1 day')"
        )
        chats = cur.fetchone()[0]
        cur.execute(
            "SELECT COUNT(*) FROM events WHERE event='cart.export' AND ts >= datetime('now','-1 day')"
        )
        exports = cur.fetchone()[0]
        conversion = f"{(exports / chats * 100):.1f}%" if chats else "0%"

        cur.execute(
            """SELECT metadata FROM events
               WHERE event='chat.response' AND ts >= datetime('now','-1 day')
               ORDER BY ts DESC LIMIT 200"""
        )
        raw_resp = [r[0] for r in cur.fetchall()]
        retailer_counts: Dict[str, int] = {}
        for m in raw_resp:
            if isinstance(m, str):
                try:
                    obj = json.loads(m)
                    retailers = obj.get("retailers", [])
                    for r in retailers:
                        retailer_counts[r] = retailer_counts.get(r, 0) + 1
                except json.JSONDecodeError:
                    pass
        top_retailers = [
            {"retailer": r, "count": c}
            for r, c in sorted(retailer_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        cur.execute(
            """SELECT metadata FROM events
               WHERE event='chat.submit' AND ts >= datetime('now','-1 day')
               ORDER BY ts DESC LIMIT 200"""
        )
        raw = [r[0] for r in cur.fetchall()]
        counts: Dict[str, int] = {}
        for m in raw:
            text = ""
            if isinstance(m, str):
                try:
                    obj = json.loads(m)
                    text = obj.get("text", "")
                except json.JSONDecodeError:
                    pass
            if text:
                counts[text] = counts.get(text, 0) + 1
        top_queries = [
            {"query": q, "count": c}
            for q, c in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        cur.execute(
            """SELECT ts, event, session_id
               FROM events ORDER BY ts DESC LIMIT 50"""
        )
        events = [
            {"ts": r[0], "event": r[1], "session_id": r[2]} for r in cur.fetchall()
        ]

    return {
        "total": total,
        "views": views,
        "chats": chats,
        "exports": exports,
        "conversion": conversion,
        "top_queries": top_queries,
        "top_retailers": top_retailers,
        "events": events,
    }
