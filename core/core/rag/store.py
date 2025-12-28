from __future__ import annotations

import os
import sqlite3
import time
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

DEFAULT_DB_PATH = os.getenv("RAG_DB_PATH", "/opt/klynxaiagent/core/data/rag.sqlite3")


@dataclass
class RagHit:
    doc_id: str
    source: str
    chunk_id: int
    content: str
    score: float


class RagStore:
    """
    SQLite-backed store using FTS5 for retrieval.
    No external deps; fast enough for small/medium internal docs.
    """

    def __init__(self, db_path: Optional[str] = None) -> None:
        self.db_path = db_path or DEFAULT_DB_PATH
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS rag_meta (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS rag_chunks (
                    doc_id TEXT NOT NULL,
                    source TEXT NOT NULL,
                    chunk_id INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    updated_at INTEGER NOT NULL,
                    PRIMARY KEY (doc_id, chunk_id)
                );
                """
            )

            # FTS5 virtual table for content searching
            conn.execute(
                """
                CREATE VIRTUAL TABLE IF NOT EXISTS rag_fts
                USING fts5(content, doc_id UNINDEXED, source UNINDEXED, chunk_id UNINDEXED);
                """
            )

    def clear(self) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM rag_chunks;")
            conn.execute("DELETE FROM rag_fts;")
            conn.execute("INSERT OR REPLACE INTO rag_meta(key,value) VALUES(?,?)", ("last_cleared", str(int(time.time()))))

    def upsert_chunks(self, doc_id: str, source: str, chunks: List[str]) -> int:
        now = int(time.time())
        with self._conn() as conn:
            # Remove existing for doc_id (simpler consistency)
            conn.execute("DELETE FROM rag_chunks WHERE doc_id = ?", (doc_id,))
            conn.execute("DELETE FROM rag_fts WHERE doc_id = ?", (doc_id,))

            for idx, content in enumerate(chunks):
                conn.execute(
                    "INSERT INTO rag_chunks(doc_id, source, chunk_id, content, updated_at) VALUES(?,?,?,?,?)",
                    (doc_id, source, idx, content, now),
                )
                conn.execute(
                    "INSERT INTO rag_fts(content, doc_id, source, chunk_id) VALUES(?,?,?,?)",
                    (content, doc_id, source, idx),
                )

            conn.execute(
                "INSERT OR REPLACE INTO rag_meta(key,value) VALUES(?,?)",
                (f"doc:{doc_id}", str(now)),
            )
        return len(chunks)

    def search(self, query: str, k: int = 5) -> List[RagHit]:
        # bm25() available in SQLite FTS5
        sql = """
        SELECT doc_id, source, chunk_id, content, bm25(rag_fts) AS score
        FROM rag_fts
        WHERE rag_fts MATCH ?
        ORDER BY score
        LIMIT ?;
        """
        # FTS query: simple escaping — wrap in quotes for phrase-like matching if needed
        q = query.strip()
        if not q:
            return []

        with self._conn() as conn:
            rows = conn.execute(sql, (q, int(k))).fetchall()

        hits: List[RagHit] = []
        for r in rows:
            hits.append(
                RagHit(
                    doc_id=str(r["doc_id"]),
                    source=str(r["source"]),
                    chunk_id=int(r["chunk_id"]),
                    content=str(r["content"]),
                    score=float(r["score"]) if r["score"] is not None else 0.0,
                )
            )
        return hits

