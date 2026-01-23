from __future__ import annotations

import json
import os
import sqlite3
import threading
from typing import Any, Dict, Optional, Tuple

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


def _time_clause(start: Optional[str], end: Optional[str]) -> Tuple[str, Tuple[Any, ...]]:
    if start and end:
        return "ts BETWEEN ? AND ?", (start, end)
    if start:
        return "ts >= ?", (start,)
    if end:
        return "ts <= ?", (end,)
    return "ts >= datetime('now','-1 day')", ()


def write_event(event: str, session_id: str, metadata: Dict[str, Any]) -> None:
    init_db()
    with _lock, _connect() as conn:
        conn.execute(
            "INSERT INTO events (event, session_id, metadata) VALUES (?, ?, ?)",
            (event, session_id, json.dumps(metadata)),
        )


def summary_last_24h(start: Optional[str] = None, end: Optional[str] = None) -> Dict[str, Any]:
    init_db()
    where, params = _time_clause(start, end)
    with _lock, _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            f"SELECT COUNT(*) FROM events WHERE {where}",
            params,
        )
        total = cur.fetchone()[0]
        cur.execute(
            f"SELECT COUNT(*) FROM events WHERE event='page.view' AND {where}",
            params,
        )
        views = cur.fetchone()[0]
        cur.execute(
            f"SELECT COUNT(*) FROM events WHERE event='chat.submit' AND {where}",
            params,
        )
        chats = cur.fetchone()[0]
        cur.execute(
            f"SELECT COUNT(*) FROM events WHERE event='cart.export' AND {where}",
            params,
        )
        exports = cur.fetchone()[0]
        conversion = f"{(exports / chats * 100):.1f}%" if chats else "0%"

        cur.execute(
            f"""SELECT metadata FROM events
               WHERE event='chat.submit' AND {where}
               ORDER BY ts DESC LIMIT 200""",
            params,
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
            f"""SELECT ts, event, session_id
               FROM events WHERE {where}
               ORDER BY ts DESC LIMIT 50""",
            params,
        )
        events = [
            {"ts": r[0], "event": r[1], "session_id": r[2]} for r in cur.fetchall()
        ]

        cur.execute(
            f"""SELECT metadata FROM events
               WHERE event='chat.response' AND {where}
               ORDER BY ts DESC LIMIT 500""",
            params,
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
            f"""SELECT metadata FROM events
               WHERE event='cart.export' AND {where}
               ORDER BY ts DESC LIMIT 500""",
            params,
        )
        raw_exports = [r[0] for r in cur.fetchall()]
        export_counts: Dict[str, int] = {}
        for m in raw_exports:
            if isinstance(m, str):
                try:
                    obj = json.loads(m)
                    retailers = obj.get("retailers", [])
                    for r in retailers:
                        export_counts[r] = export_counts.get(r, 0) + 1
                except json.JSONDecodeError:
                    pass

        retailer_funnel = []
        for r, c in sorted(retailer_counts.items(), key=lambda x: x[1], reverse=True):
            exp = export_counts.get(r, 0)
            conv = f"{(exp / c * 100):.1f}%" if c else "0%"
            retailer_funnel.append(
                {"retailer": r, "responses": c, "exports": exp, "conversion": conv}
            )

    return {
        "total": total,
        "views": views,
        "chats": chats,
        "exports": exports,
        "conversion": conversion,
        "top_queries": top_queries,
        "top_retailers": top_retailers,
        "retailer_funnel": retailer_funnel,
        "events": events,
    }


def export_csv(start: Optional[str] = None, end: Optional[str] = None) -> str:
    init_db()
    where, params = _time_clause(start, end)
    with _lock, _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            f"SELECT ts, event, session_id, metadata FROM events WHERE {where} ORDER BY ts DESC",
            params,
        )
        rows = cur.fetchall()
    lines = ["ts,event,session_id,metadata"]
    for ts, event, session_id, metadata in rows:
        meta = metadata.replace('"', '""') if isinstance(metadata, str) else ""
        lines.append(f"\"{ts}\",\"{event}\",\"{session_id}\",\"{meta}\"")
    return "\n".join(lines)
