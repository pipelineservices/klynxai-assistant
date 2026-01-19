from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
import time

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

# In-memory store
INCIDENTS: Dict[str, dict] = {}


class IncidentCreate(BaseModel):
    summary: str
    description: str = ""
    severity: str = "P3"
    service: str = "unknown"
    trace_id: Optional[str] = None
    source: str = "manual"
    raw: Dict[str, Any] = {}


class IncidentAction(BaseModel):
    action: str  # "close" | "ack" | "autofix" | etc
    note: str = ""


def create_incident_record(
    *,
    summary: str,
    description: str = "",
    source: str = "unknown",
    severity: str = "P3",
    service: str = "unknown",
    trace_id: Optional[str] = None,
    raw: Optional[dict] = None,
) -> dict:
    incident_id = f"inc_{uuid.uuid4().hex}"
    now = int(time.time())

    incident = {
        "id": incident_id,
        "summary": summary,
        "description": description,
        "severity": severity,
        "service": service,
        "trace_id": trace_id,
        "source": source,
        "status": "OPEN",  # OPEN | CLOSED
        "created_at": now,
        "timeline": [
            {
                "ts": now,
                "type": "create",
                "message": "Incident created",
                "source": source,
            }
        ],
        "rca": None,
        "raw": raw or {},
        "closed_at": None,
        "close_reason": None,
    }

    INCIDENTS[incident_id] = incident
    return incident


def append_incident_timeline(incident_id: str, item: Dict[str, Any]):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident["timeline"].append({**item, "ts": int(time.time())})
    return incident


def close_incident(incident_id: str, reason: str) -> Optional[dict]:
    incident = INCIDENTS.get(incident_id)
    if not incident:
        return None

    if incident["status"] == "CLOSED":
        return incident

    incident["status"] = "CLOSED"
    incident["close_reason"] = reason
    incident["closed_at"] = int(time.time())
    append_incident_timeline(
        incident_id,
        {"type": "close", "message": reason, "source": "system"},
    )
    return incident


def generate_incident_rca(incident_id: str, force: bool = False) -> dict:
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.get("rca") and not force:
        return incident["rca"]

    # Simple baseline RCA (you can upgrade later with LLM + logs)
    rca = {
        "summary": f"RCA for {incident_id}",
        "root_cause": "Likely dependency issue / permission issue / resource in-use",
        "fix_steps": [
            "Enumerate dependencies (subnets, IGW, NAT, endpoints, routes)",
            "Verify IAM permissions for the operation",
            "Retry operation after cleanup",
        ],
        "generated_at": int(time.time()),
    }

    incident["rca"] = rca
    append_incident_timeline(
        incident_id,
        {"type": "rca", "message": "RCA generated", "source": "system"},
    )
    return rca


@router.get("")
def list_incidents():
    return {"incidents": list(INCIDENTS.values())}


@router.post("")
def create_incident(payload: IncidentCreate):
    incident = create_incident_record(
        summary=payload.summary,
        description=payload.description,
        severity=payload.severity,
        service=payload.service,
        trace_id=payload.trace_id,
        source=payload.source,
        raw=payload.raw,
    )
    return incident


@router.get("/{incident_id}")
def get_incident(incident_id: str):
    inc = INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@router.post("/{incident_id}/action")
def act_on_incident(incident_id: str, payload: IncidentAction):
    inc = INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if payload.action.lower() == "close":
        close_incident(incident_id, payload.note or "Closed manually")
    else:
        append_incident_timeline(
            incident_id,
            {"type": "action", "message": f"{payload.action}: {payload.note}".strip(), "source": "manual"},
        )

    return {"ok": True, "incident_id": incident_id}


@router.post("/{incident_id}/rca")
def rca(incident_id: str, force: bool = False):
    return generate_incident_rca(incident_id, force=force)

