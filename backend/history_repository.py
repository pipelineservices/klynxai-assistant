import os
import json
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

DB_PATH = os.getenv("INCIDENTS_DB_PATH", os.path.join(os.path.dirname(__file__), "data", "incidents.db"))

# ---- DB helpers ----

def _connect() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def _table_cols(conn: sqlite3.Connection, table: str) -> Dict[str, str]:
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    cols = {}
    for r in cur.fetchall():
        cols[r["name"]] = r["type"]
    return cols

def _ensure_table(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        thread_ts TEXT UNIQUE,
        channel_id TEXT,
        created_at TEXT,
        status TEXT,
        severity TEXT,
        summary TEXT,
        cloud TEXT,
        region TEXT,
        resources TEXT,
        probable_cause TEXT,
        analysis_text TEXT,
        plan_json TEXT,
        last_updated_at TEXT
    )
    """)
    conn.commit()

def _ensure_columns(conn: sqlite3.Connection) -> None:
    """
    Auto-migrate older DBs:
    - Adds any missing columns safely.
    - Never drops/reorders columns.
    """
    _ensure_table(conn)
    existing = _table_cols(conn, "incidents")

    # Column name -> SQL type
    required = {
        "id": "TEXT",
        "thread_ts": "TEXT",
        "channel_id": "TEXT",
        "created_at": "TEXT",
        "status": "TEXT",
        "severity": "TEXT",
        "summary": "TEXT",
        "cloud": "TEXT",
        "region": "TEXT",
        "resources": "TEXT",
        "probable_cause": "TEXT",
        "analysis_text": "TEXT",
        "plan_json": "TEXT",
        "last_updated_at": "TEXT",
    }

    cur = conn.cursor()
    for col, ctype in required.items():
        if col not in existing:
            cur.execute(f"ALTER TABLE incidents ADD COLUMN {col} {ctype}")
    conn.commit()

def init_db() -> None:
    conn = _connect()
    try:
        _ensure_columns(conn)
    finally:
        conn.close()

# ---- CRUD ----

def save_incident(
    *,
    incident_id: str,
    thread_ts: str,
    channel_id: str,
    severity: str,
    summary: str,
    cloud: str,
    region: str,
    resources: str,
    probable_cause: str,
    analysis_text: str,
    plan: Dict[str, Any],
    status: str = "open",
) -> None:
    conn = _connect()
    try:
        _ensure_columns(conn)
        now = datetime.utcnow().isoformat()

        # Use explicit column list to avoid "N columns but M values"
        conn.execute(
            """
            INSERT OR REPLACE INTO incidents
            (id, thread_ts, channel_id, created_at, status, severity, summary, cloud, region,
             resources, probable_cause, analysis_text, plan_json, last_updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                incident_id,
                thread_ts,
                channel_id,
                now,
                status,
                severity,
                summary,
                cloud,
                region,
                resources,
                probable_cause,
                analysis_text,
                json.dumps(plan, ensure_ascii=False),
                now,
            ),
        )
        conn.commit()
    finally:
        conn.close()

def get_incident_by_thread_ts(thread_ts: str) -> Optional[Dict[str, Any]]:
    conn = _connect()
    try:
        _ensure_columns(conn)
        cur = conn.execute("SELECT * FROM incidents WHERE thread_ts = ?", (thread_ts,))
        row = cur.fetchone()
        if not row:
            return None
        d = dict(row)
        if d.get("plan_json"):
            try:
                d["plan"] = json.loads(d["plan_json"])
            except Exception:
                d["plan"] = {}
        else:
            d["plan"] = {}
        return d
    finally:
        conn.close()

def list_incidents(limit: int = 50) -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        _ensure_columns(conn)
        cur = conn.execute("SELECT * FROM incidents ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = cur.fetchall()
        out = []
        for r in rows:
            d = dict(r)
            if d.get("plan_json"):
                try:
                    d["plan"] = json.loads(d["plan_json"])
                except Exception:
                    d["plan"] = {}
            else:
                d["plan"] = {}
            out.append(d)
        return out
    finally:
        conn.close()

def update_incident_status(thread_ts: str, status: str) -> None:
    conn = _connect()
    try:
        _ensure_columns(conn)
        now = datetime.utcnow().isoformat()
        conn.execute(
            "UPDATE incidents SET status = ?, last_updated_at = ? WHERE thread_ts = ?",
            (status, now, thread_ts),
        )
        conn.commit()
    finally:
        conn.close()

def update_incident_analysis(thread_ts: str, analysis_text: str, probable_cause: str = "") -> None:
    conn = _connect()
    try:
        _ensure_columns(conn)
        now = datetime.utcnow().isoformat()
        conn.execute(
            "UPDATE incidents SET analysis_text = ?, probable_cause = ?, last_updated_at = ? WHERE thread_ts = ?",
            (analysis_text, probable_cause, now, thread_ts),
        )
        conn.commit()
    finally:
        conn.close()

def update_incident_plan(thread_ts: str, plan: Dict[str, Any]) -> None:
    conn = _connect()
    try:
        _ensure_columns(conn)
        now = datetime.utcnow().isoformat()
        conn.execute(
            "UPDATE incidents SET plan_json = ?, last_updated_at = ? WHERE thread_ts = ?",
            (json.dumps(plan, ensure_ascii=False), now, thread_ts),
        )
        conn.commit()
    finally:
        conn.close()

