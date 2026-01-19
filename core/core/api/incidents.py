from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import uuid
import time

# ------------------------------------------------------------
# Router
# ------------------------------------------------------------

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

# ------------------------------------------------------------
# In-memory incident store (safe, backward compatible)
# ------------------------------------------------------------

INCIDENTS: Dict[str, dict] = {}

# ------------------------------------------------------------
# Models
# ------------------------------------------------------------

class IncidentCreate(BaseModel):
    summary: str
    description: Optional[str] = ""
    severity: str = "P3"
    service: str = "unknown"
    source: str = "manual"
    trace_id: Optional[str] = None
    raw: Dict[str, Any] = Field(default_factory=dict)


class IncidentAction(BaseModel):
    action: str


class TimelineEvent(BaseModel):
    ts: int = Field(default_factory=lambda: int(time.time()))
    severity: str = "P3"
    service: str = "unknown"
    message: str
    trace_id: Optional[str] = None
    source: str = "manual"
    raw: Dict[str, Any] = Field(default_factory=dict)


# ------------------------------------------------------------
# Core helpers (🔥 REQUIRED BY core.app)
# ------------------------------------------------------------

def create_incident_record(
    summary: str,
    description: str = "",
    source: str = "unknown",
    severity: str = "P3",
    service: str = "unknown",
    trace_id: Optional[str] = None,
    raw: Optional[dict] = None,
) -> dict:
    incident_id = f"inc_{uuid.uuid4().hex}"

    incident = {
        "id": incident_id,
        "summary": summary,
        "description": description,
        "severity": severity,
        "service": service,
        "trace_id": trace_id,
        "source": source,
        "status": "open",
        "created_at": int(time.time()),
        "updated_at": int(time.time()),
        "timeline": [],
        "rca": None,
        "close_reason": None,
        "raw": raw or {},
    }

    INCIDENTS[incident_id] = incident
    return incident


def append_incident_timeline(
    incident_id: str,
    severity: str,
    service: str,
    message: str,
    trace_id: Optional[str] = None,
    source: str = "manual",
    raw: Optional[dict] = None,
) -> dict:
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    event = {
        "ts": int(time.time()),
        "severity": severity,
        "service": service,
        "message": message,
        "trace_id": trace_id,
        "source": source,
        "raw": raw or {},
    }

    incident["timeline"].append(event)
    incident["updated_at"] = int(time.time())
    return incident


def generate_incident_rca(incident_id: str, force: bool = False) -> dict:
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.get("rca") and not force:
        return incident["rca"]

    rca = {
        "summary": f"RCA for {incident_id}",
        "root_cause": (
            "Likely dependency failure, configuration drift, or transient capacity issue "
            "(deterministic placeholder)"
        ),
        "fix_steps": [
            "Inspect OTEL traces for failing spans",
            "Check recent deployments or config changes",
            "Rollback or scale resources if required",
            "Validate recovery via error rate and latency",
        ],
        "prevention": [
            "Add SLO-based alerting",
            "Enable circuit breakers",
            "Improve load testing coverage",
        ],
        "generated_at": int(time.time()),
    }

    incident["rca"] = rca
    incident["updated_at"] = int(time.time())
    return rca


def autoclose_incident(
    incident_id: str,
    reason: str,
    force: bool = True,
) -> dict:
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident["status"] == "closed" and not force:
        return incident

    incident["status"] = "closed"
    incident["close_reason"] = reason
    incident["updated_at"] = int(time.time())

    incident["timeline"].append({
        "ts": int(time.time()),
        "severity": incident.get("severity", "P3"),
        "service": incident.get("service", "unknown"),
        "message": f"Incident closed: {reason}",
        "trace_id": incident.get("trace_id"),
        "source": "autoclose",
        "raw": {},
    })

    return incident


# ------------------------------------------------------------
# Slack notifier (safe stub)
# ------------------------------------------------------------

def notify_slack_incident(incident: dict):
    """
    Stub for Slack notifications.
    Slack service already handles actual delivery.
    """
    return True


# ------------------------------------------------------------
# API routes (backward compatible)
# ------------------------------------------------------------

@router.get("")
def list_incidents():
    return {"incidents": list(INCIDENTS.values())}


@router.post("")
def create_incident(payload: IncidentCreate):
    return create_incident_record(
        summary=payload.summary,
        description=payload.description or "",
        severity=payload.severity,
        service=payload.service,
        source=payload.source,
        trace_id=payload.trace_id,
        raw=payload.raw,
    )


@router.post("/{incident_id}/action")
def act_on_incident(incident_id: str, payload: IncidentAction):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        incident = create_incident_record(
            summary="external",
            description="external action",
            source="external",
        )

    incident["status"] = payload.action
    incident["updated_at"] = int(time.time())
    return {
        "incident_id": incident["id"],
        "action": payload.action,
        "status": "updated",
    }

