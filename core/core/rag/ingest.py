from __future__ import annotations

import os
import re
from typing import List, Tuple

from .store import RagStore

DEFAULT_DOCS_DIR = os.getenv("RAG_DOCS_DIR", "/opt/klynxaiagent/docs")
DEFAULT_MAX_CHARS = int(os.getenv("RAG_CHUNK_MAX_CHARS", "1200"))
DEFAULT_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP_CHARS", "150"))

TEXT_EXTS = {".txt", ".md", ".log", ".json", ".yaml", ".yml", ".py", ".ts", ".tsx", ".js"}


def _read_text_file(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _clean(text: str) -> str:
    # Collapse whitespace a bit to keep chunks tidy
    text = text.replace("\r\n", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(text: str, max_chars: int = DEFAULT_MAX_CHARS, overlap: int = DEFAULT_OVERLAP) -> List[str]:
    text = _clean(text)
    if not text:
        return []

    chunks: List[str] = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + max_chars, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= n:
            break
        start = max(0, end - overlap)

    return chunks


def discover_files(docs_dir: str = DEFAULT_DOCS_DIR) -> List[str]:
    out: List[str] = []
    for root, _, files in os.walk(docs_dir):
        for name in files:
            p = os.path.join(root, name)
            _, ext = os.path.splitext(name.lower())
            if ext in TEXT_EXTS:
                out.append(p)
    return sorted(out)


def ingest_dir(store: RagStore, docs_dir: str = DEFAULT_DOCS_DIR) -> Tuple[int, int]:
    files = discover_files(docs_dir)
    total_docs = 0
    total_chunks = 0

    for path in files:
        rel = os.path.relpath(path, docs_dir)
        doc_id = rel.replace(os.sep, "/")
        try:
            raw = _read_text_file(path)
            chunks = chunk_text(raw)
            if chunks:
                store.upsert_chunks(doc_id=doc_id, source=path, chunks=chunks)
                total_docs += 1
                total_chunks += len(chunks)
        except Exception:
            # Ignore unreadable files to keep ingestion robust
            continue

    return total_docs, total_chunks

