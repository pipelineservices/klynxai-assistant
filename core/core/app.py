import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

from klynx_shared.contracts.chat_contract import ChatRequest, ChatResponse
from core.providers import get_llm_provider
from core.storage import IncidentStore

app = FastAPI(title="KLYNX Core", version="0.1.0")

store = IncidentStore(path=os.getenv("INCIDENT_STORE_PATH", "/opt/klynxaiagent/run/incidents.json"))
llm = get_llm_provider()

class TriageRequest(BaseModel):
    text: str
    source: str = "unknown"
    user: Optional[str] = None
    channel: Optional[str] = None

class IncidentCreateRequest(BaseModel):
    title: str
    description: str
    source: str = "unknown"
    severity: str = "medium"
    status: str = "open"
    channel: Optional[str] = None
    reporter: Optional[str] = None
    suggested_actions: List[Dict[str, Any]] = []

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    reply = llm.chat(req.messages)
    return ChatResponse(reply=reply, actions=[])

@app.post("/api/triage")
def triage(req: TriageRequest):
    # Phase-1 enterprise “triage brain”: deterministic structure now, LLM later can enrich.
    text = req.text.strip()

    # basic “DevOps incident” heuristic (expand later)
    severity = "medium"
    if any(k in text.lower() for k in ["sev1", "p1", "outage", "down", "data loss"]):
        severity = "high"

    reply = (
        "### What I think is happening\n"
        f"- You said: {text}\n\n"
        "### Next best step\n"
        "- Share the exact error text / service / region.\n"
    )

    actions = [
        {
            "id": "autofix_placeholder",
            "label": "Apply Auto-Fix",
            "type": "button",
            "action": "apply_autofix",
            "enabled": False,
            "reason": "Auto-fix library not enabled yet (Phase next).",
        }
    ]

    return {"reply": reply, "actions": actions, "severity": severity}

@app.post("/api/incidents")
def create_incident(req: IncidentCreateRequest):
    incident_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "incident_id": incident_id,
        "title": req.title,
        "description": req.description,
        "source": req.source,
        "severity": req.severity,
        "status": req.status,
        "channel": req.channel,
        "reporter": req.reporter,
        "suggested_actions": req.suggested_actions,
        "created_at": now,
        "updated_at": now,
        "history": [
            {"ts": now, "event": "created"},
        ],
    }
    store.upsert(record)
    return {"incident_id": incident_id, "status": "created"}

@app.get("/api/incidents")
def list_incidents():
    return {"incidents": store.list_all()}

@app.post("/api/incidents/{incident_id}/apply")
def apply_autofix(incident_id: str, body: Dict[str, Any]):
    # Placeholder: later we integrate AWS APIs + approvals
    rec = store.get(incident_id)
    if not rec:
        return {"message": "Incident not found", "ok": False}

    now = datetime.now(timezone.utc).isoformat()
    rec["status"] = "in_progress"
    rec["updated_at"] = now
    rec["history"].append({"ts": now, "event": "apply_autofix_requested", "by": body.get("user")})
    store.upsert(rec)

    return {"ok": True, "message": "Auto-fix queued (placeholder).", "incident_id": incident_id}

@app.post("/api/incidents/{incident_id}/skip")
def skip_autofix(incident_id: str, body: Dict[str, Any]):
    rec = store.get(incident_id)
    if not rec:
        return {"message": "Incident not found", "ok": False}

    now = datetime.now(timezone.utc).isoformat()
    rec["status"] = "open"
    rec["updated_at"] = now
    rec["history"].append({"ts": now, "event": "autofix_skipped", "by": body.get("user")})
    store.upsert(rec)

    return {"ok": True, "message": "Skipped.", "incident_id": incident_id}

