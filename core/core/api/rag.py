from __future__ import annotations

import os
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.rag import RagStore, ingest_dir

router = APIRouter(prefix="/api/rag", tags=["rag"])

RAG_ENABLED = os.getenv("RAG_ENABLED", "0") == "1"
DOCS_DIR = os.getenv("RAG_DOCS_DIR", "/opt/klynxaiagent/docs")

_store: Optional[RagStore] = None


def store() -> RagStore:
    global _store
    if _store is None:
        _store = RagStore()
    return _store


class RagIngestResponse(BaseModel):
    ok: bool = True
    docs_dir: str
    docs_indexed: int
    chunks_indexed: int


class RagSearchRequest(BaseModel):
    query: str = Field(min_length=1)
    k: int = Field(default=5, ge=1, le=20)


class RagSearchResponse(BaseModel):
    query: str
    hits: list[Dict[str, Any]]


@router.post("/ingest", response_model=RagIngestResponse)
def rag_ingest() -> RagIngestResponse:
    if not RAG_ENABLED:
        raise HTTPException(status_code=400, detail="RAG is disabled (set RAG_ENABLED=1)")

    docs, chunks = ingest_dir(store(), DOCS_DIR)
    return RagIngestResponse(docs_dir=DOCS_DIR, docs_indexed=docs, chunks_indexed=chunks)


@router.post("/search", response_model=RagSearchResponse)
def rag_search(req: RagSearchRequest) -> RagSearchResponse:
    if not RAG_ENABLED:
        raise HTTPException(status_code=400, detail="RAG is disabled (set RAG_ENABLED=1)")

    hits = store().search(req.query, k=req.k)
    return RagSearchResponse(
        query=req.query,
        hits=[
            {
                "doc_id": h.doc_id,
                "source": h.source,
                "chunk_id": h.chunk_id,
                "score": h.score,
                "content": h.content,
            }
            for h in hits
        ],
    )

