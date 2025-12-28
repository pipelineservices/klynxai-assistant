from __future__ import annotations

import json
import os
import time
import uuid
from typing import Any, Dict, List, Optional

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(prefix="/api", tags=["incidents"])


# ----------------------------
# Storage (simple + safe)
# ----------------------------

DATA_DIR = os.environ.get("KLYNX_DATA_DIR", "/opt/klynxaiagent/core/data")
INCIDENTS_FILE = os.path.join(DATA_DIR, "incidents.json")


def _ensure_storage() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(INCIDENTS_FILE):
        with open(INCIDENTS_FILE, "w", encoding="utf-8") as f:
            json.dump({"incidents": []}, f)


def _read_all() -> Dict[str, Any]:
    _ensure_storage()
    with open(INCIDENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _atomic_write(payload: Dict[str, Any]) -> None:
    _ensure_storage()
    tmp = f"{INCIDENTS_FILE}.tmp.{uuid.uuid4().hex}"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, INCIDENTS_FILE)


def list_incidents() -> List[Dict[str, Any]]:
    data = _read_all()
    incidents = data.get("incidents", [])
    if not isinstance(incidents, list):
        return []
    return sorted(incidents, key=lambda x: x.get("created_at", 0), reverse=True)


def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    for inc in list_incidents():
        if inc.get("id") == incident_id:
            return inc
    return None


# ----------------------------
# Required by core/app.py imports
# ----------------------------

def create_incident_record(
    summary: Optional[str] = None,
    description: Optional[str] = None,
    source: str = "manual",
    severity: str = "P3",
    status: str = "open",
    trace_id: Optional[str] = None,
    user_message: Optional[str] = None,
    **extra: Any,
) -> Dict[str, Any]:
    now = int(time.time())
    title = extra.get("title") or summary or "Incident"
    incident = {
        "id": extra.get("id") or uuid.uuid4().hex,
        "title": title,
        "summary": summary or title,
        "description": description or extra.get("description") or "",
        "severity": extra.get("severity") or severity,
        "source": extra.get("source") or source,
        "status": extra.get("status") or status,
        "trace_id": trace_id,
        "user_message": user_message,
        "created_at": extra.get("created_at") or now,
        "updated_at": extra.get("updated_at") or now,
        "actions": extra.get("actions") or [],
        "raw": extra.get("raw") or extra or {},
    }

    data = _read_all()
    incidents = data.get("incidents", [])
    if not isinstance(incidents, list):
        incidents = []

    replaced = False
    for i, existing in enumerate(incidents):
        if existing.get("id") == incident["id"]:
            incident["created_at"] = existing.get("created_at", incident["created_at"])
            incident["updated_at"] = now
            incidents[i] = incident
            replaced = True
            break

    if not replaced:
        incidents.append(incident)

    data["incidents"] = incidents
    _atomic_write(data)
    return incident


def notify_slack_incident(incident: Dict[str, Any]) -> None:
    webhook = os.environ.get("SLACK_WEBHOOK_URL", "").strip()
    if not webhook:
        return

    text = (
        f"🚨 *New Incident*\n"
        f"*ID:* `{incident.get('id')}`\n"
        f"*Severity:* {incident.get('severity')}\n"
        f"*Title:* {incident.get('title')}\n"
        f"*Status:* {incident.get('status')}\n"
    )
    try:
        requests.post(webhook, json={"text": text}, timeout=3)
    except Exception:
        return


# ----------------------------
# Router models + endpoints
# ----------------------------

class IncidentCreate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    severity: str = "P3"
    source: str = "manual"


class IncidentAction(BaseModel):
    action: str = Field(..., min_length=1)
    actor: str = "ui"


@router.get("/incidents")
def api_list_incidents() -> Dict[str, Any]:
    return {"incidents": list_incidents()}


@router.post("/incidents")
def api_create_incident(payload: IncidentCreate) -> Dict[str, Any]:
    inc = create_incident_record(
        title=payload.title,
        summary=payload.summary or payload.title,
        description=payload.description,
        severity=payload.severity,
        source=payload.source,
        raw=payload.model_dump(),
    )
    notify_slack_incident(inc)
    return inc


@router.post("/incidents/{incident_id}/action")
def api_incident_action(incident_id: str, payload: IncidentAction) -> Dict[str, Any]:
    data = _read_all()
    incidents = data.get("incidents", [])
    if not isinstance(incidents, list):
        incidents = []

    now = int(time.time())
    found = None
    for i, inc in enumerate(incidents):
        if inc.get("id") == incident_id:
            found = inc
            actions = inc.get("actions", [])
            if not isinstance(actions, list):
                actions = []
            actions.append({"ts": now, "actor": payload.actor, "action": payload.action})
            inc["actions"] = actions
            inc["updated_at"] = now

            a = payload.action.lower()
            if a in ("resolve", "resolved", "close", "closed"):
                inc["status"] = "resolved"
            elif a in ("ack", "acknowledge", "acknowledged"):
                inc["status"] = "acknowledged"

            incidents[i] = inc
            break

    if not found:
        raise HTTPException(status_code=404, detail="Incident not found")

    data["incidents"] = incidents
    _atomic_write(data)
    return get_incident(incident_id) or found

