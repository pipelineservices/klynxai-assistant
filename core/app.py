from __future__ import annotations

import os
import uuid
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from core.security import authorize
from core.api.incidents import (
    router as incidents_router,
    create_incident_record,
    notify_slack_incident,
)
from core.api.otel import router as otel_router
from core.api.slack_actions import router as slack_router

# Optional RAG
try:
    from core.api.rag import router as rag_router
except Exception:
    rag_router = None

from core.incident_intelligence import analyze_text


# =====================================================
# APP
# =====================================================

app = FastAPI(title="KLYNX Core API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# AUTH MIDDLEWARE (AFTER app exists!)
# -----------------------------------------------------
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    authorize(request)
    return await call_next(request)


# -----------------------------------------------------
# ROUTERS
# -----------------------------------------------------
app.include_router(incidents_router)
app.include_router(otel_router)
app.include_router(slack_router)

if rag_router:
    app.include_router(rag_router)


# -----------------------------------------------------
# HEALTH
# -----------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}


# -----------------------------------------------------
# CHAT
# -----------------------------------------------------
@app.post("/api/chat")
async def chat(payload: Dict[str, Any]):
    messages = payload.get("messages", [])
    text = ""

    if messages:
        text = messages[-1].get("content", "")

    # Intelligence engine
    analysis = analyze_text(text)

    # Auto-create incident
    create_incident_record(
        summary="Chat interaction",
        description=text,
        source="chat",
        raw=payload,
    )

    return {
        "reply": analysis.get("reply", "OK"),
        "actions": analysis.get("actions", []),
        "request_id": str(uuid.uuid4()),
    }

