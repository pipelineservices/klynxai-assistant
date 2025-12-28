from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
import uuid

router = APIRouter()

INCIDENTS: Dict[str, dict] = {}

class IncidentCreate(BaseModel):
    summary: str

class IncidentAction(BaseModel):
    action: str

@router.get("")
def list_incidents():
    return {"incidents": list(INCIDENTS.values())}

@router.post("")
def create_incident(payload: IncidentCreate):
    incident_id = str(uuid.uuid4())
    INCIDENTS[incident_id] = {
        "id": incident_id,
        "summary": payload.summary,
        "status": "open"
    }
    return INCIDENTS[incident_id]

@router.post("/{incident_id}/action")
def act_on_incident(incident_id: str, payload: IncidentAction):
    if incident_id not in INCIDENTS:
        INCIDENTS[incident_id] = {
            "id": incident_id,
            "summary": "external",
            "status": "open"
        }

    INCIDENTS[incident_id]["status"] = payload.action
    return {
        "incident_id": incident_id,
        "action": payload.action,
        "status": "updated"
    }

