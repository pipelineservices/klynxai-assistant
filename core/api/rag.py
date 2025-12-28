from __future__ import annotations

import os
import re
import sqlite3
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(prefix="/api/rag", tags=["rag"])


# ------------------------------------------------------------
# Config
# ------------------------------------------------------------

DATA_DIR = Path(os.environ.get("KLYNX_DATA_DIR", "/opt/klynxaiagent/core/data"))
DB_PATH = Path(os.environ.get("KLYNX_RAG_DB", str(DATA_DIR / "rag.db")))

# If you want a hard kill-switch later:
# export RAG_ENABLED=0
RAG_ENABLED = os.environ.get("RAG_ENABLED", "1").strip() not in ("0", "false", "False", "no", "NO")


# ------------------------------------------------------------
# Models
# ------------------------------------------------------------

class RAGIngestRequest(BaseModel):
    """
    Ingest documents from a directory (recommended) or a single file.

    Example:
      {"path":"/opt/klynxaiagent/docs","extensions":[".md",".txt"],"chunk_chars":1200,"overlap_chars":150}
    """
    path: str = Field(..., min_length=1)
    extensions: List[str] = Field(default_factory=lambda: [".md", ".txt"])
    chunk_chars: int = Field(default=1200, ge=200, le=8000)
    overlap_chars: int = Field(default=150, ge=0, le=2000)
    max_files: int = Field(default=500, ge=1, le=5000)


class RAGIngestResponse(BaseModel):
    ok: bool
    db_path: str
    ingested_files: int
    created_chunks: int
    note: str = ""


class RAGSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    k: int = Field(default=5, ge=1, le=20)


class RAGHit(BaseModel):
    score: float
    doc_path: str
    chunk_id: str
    text: str


class RAGSearchResponse(BaseModel):
    query: str
    k: int
    results: List[RAGHit]
    note: str = ""


# ------------------------------------------------------------
# Storage
# ------------------------------------------------------------

def _connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            path TEXT UNIQUE NOT NULL,
            mtime INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chunks (
            id TEXT PRIMARY KEY,
            doc_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            text TEXT NOT NULL,
            tokens TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(doc_id) REFERENCES documents(id)
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_docs_path ON documents(path);")
    conn.commit()


# ------------------------------------------------------------
# Tokenization + chunking
# ------------------------------------------------------------

_TOKEN_RE = re.compile(r"[a-zA-Z0-9_]+")


def _tokenize(s: str) -> List[str]:
    return [t.lower() for t in _TOKEN_RE.findall(s)]


def _chunk_text(text: str, chunk_chars: int, overlap_chars: int) -> List[str]:
    text = text.replace("\r\n", "\n")
    if len(text) <= chunk_chars:
        return [text.strip()] if text.strip() else []

    chunks: List[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_chars, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= n:
            break

        # overlap
        start = max(0, end - overlap_chars)
        if start == end:
            start = end + 1

    return chunks


def _is_allowed_file(p: Path, extensions: List[str]) -> bool:
    ext = p.suffix.lower()
    return ext in {e.lower() for e in extensions}


def _iter_files(base: Path, extensions: List[str], max_files: int) -> List[Path]:
    files: List[Path] = []
    if base.is_file():
        return [base]

    for p in sorted(base.rglob("*")):
        if len(files) >= max_files:
            break
        if p.is_file() and _is_allowed_file(p, extensions):
            files.append(p)
    return files


def _new_id(prefix: str) -> str:
    return f"{prefix}_{int(time.time() * 1000)}_{os.urandom(4).hex()}"


# ------------------------------------------------------------
# Ingest logic
# ------------------------------------------------------------

def _upsert_document(conn: sqlite3.Connection, path: str, mtime: int) -> str:
    cur = conn.execute("SELECT id, mtime FROM documents WHERE path = ?", (path,))
    row = cur.fetchone()
    if row:
        doc_id, old_mtime = row
        if int(old_mtime) != int(mtime):
            conn.execute("UPDATE documents SET mtime = ? WHERE id = ?", (int(mtime), doc_id))
        return str(doc_id)

    doc_id = _new_id("doc")
    now = int(time.time())
    conn.execute(
        "INSERT INTO documents (id, path, mtime, created_at) VALUES (?, ?, ?, ?)",
        (doc_id, path, int(mtime), now),
    )
    return doc_id


def _replace_chunks(conn: sqlite3.Connection, doc_id: str, chunks: List[str]) -> int:
    # delete old chunks
    conn.execute("DELETE FROM chunks WHERE doc_id = ?", (doc_id,))
    now = int(time.time())

    created = 0
    for i, ch in enumerate(chunks):
        toks = _tokenize(ch)
        if not toks:
            continue
        chunk_id = _new_id("chunk")
        conn.execute(
            "INSERT INTO chunks (id, doc_id, chunk_index, text, tokens, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (chunk_id, doc_id, i, ch, " ".join(toks), now),
        )
        created += 1
    return created


# ------------------------------------------------------------
# Search logic (simple & safe)
# ------------------------------------------------------------

@dataclass
class _ChunkRow:
    chunk_id: str
    doc_id: str
    text: str
    tokens: str


def _fetch_all_chunks(conn: sqlite3.Connection) -> List[_ChunkRow]:
    cur = conn.execute("SELECT id, doc_id, text, tokens FROM chunks")
    rows = cur.fetchall()
    return [_ChunkRow(chunk_id=r[0], doc_id=r[1], text=r[2], tokens=r[3]) for r in rows]


def _doc_paths(conn: sqlite3.Connection) -> Dict[str, str]:
    cur = conn.execute("SELECT id, path FROM documents")
    return {r[0]: r[1] for r in cur.fetchall()}


def _score(query_tokens: List[str], chunk_tokens: List[str]) -> float:
    if not query_tokens or not chunk_tokens:
        return 0.0
    qset = set(query_tokens)
    cset = set(chunk_tokens)
    overlap = len(qset & cset)
    # lightweight normalization: overlap / sqrt(|q|*|c|)
    denom = (len(qset) * len(cset)) ** 0.5
    return float(overlap / denom) if denom else 0.0


# ------------------------------------------------------------
# Routes
# ------------------------------------------------------------

@router.post("/ingest", response_model=RAGIngestResponse)
def ingest(req: RAGIngestRequest) -> RAGIngestResponse:
    if not RAG_ENABLED:
        return RAGIngestResponse(
            ok=True,
            db_path=str(DB_PATH),
            ingested_files=0,
            created_chunks=0,
            note="RAG disabled (RAG_ENABLED=0). No ingestion performed.",
        )

    base = Path(req.path).expanduser()
    if not base.exists():
        raise HTTPException(status_code=400, detail=f"Path does not exist: {base}")

    conn = _connect()
    try:
        _init_db(conn)

        files = _iter_files(base, req.extensions, req.max_files)
        ingested_files = 0
        created_chunks = 0

        for fp in files:
            try:
                text = fp.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                # skip unreadable files
                continue

            st = fp.stat()
            doc_id = _upsert_document(conn, str(fp), int(st.st_mtime))

            chunks = _chunk_text(text, req.chunk_chars, req.overlap_chars)
            created_chunks += _replace_chunks(conn, doc_id, chunks)
            ingested_files += 1

        conn.commit()

        return RAGIngestResponse(
            ok=True,
            db_path=str(DB_PATH),
            ingested_files=ingested_files,
            created_chunks=created_chunks,
            note=f"Ingested from: {str(base)}",
        )
    finally:
        conn.close()


@router.post("/search", response_model=RAGSearchResponse)
def search(req: RAGSearchRequest) -> RAGSearchResponse:
    if not RAG_ENABLED:
        return RAGSearchResponse(
            query=req.query,
            k=req.k,
            results=[],
            note="RAG disabled (RAG_ENABLED=0).",
        )

    conn = _connect()
    try:
        _init_db(conn)

        query_tokens = _tokenize(req.query)
        chunks = _fetch_all_chunks(conn)
        if not chunks:
            return RAGSearchResponse(query=req.query, k=req.k, results=[], note="No docs ingested yet.")

        doc_path_map = _doc_paths(conn)

        scored: List[Tuple[float, _ChunkRow]] = []
        for ch in chunks:
            ctoks = ch.tokens.split()
            s = _score(query_tokens, ctoks)
            if s > 0:
                scored.append((s, ch))

        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[: req.k]

        results: List[RAGHit] = []
        for s, ch in top:
            results.append(
                RAGHit(
                    score=float(round(s, 6)),
                    doc_path=doc_path_map.get(ch.doc_id, "unknown"),
                    chunk_id=ch.chunk_id,
                    text=ch.text,
                )
            )

        return RAGSearchResponse(query=req.query, k=req.k, results=results, note="RAG search active.")
    finally:
        conn.close()

