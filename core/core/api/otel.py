from typing import Any, Dict, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.integrations.slack_notify import post_incident_once

router = APIRouter()


class OtelIngestPayload(BaseModel):
    service: str = Field(..., description="Service name emitting signal")
    severity: str = Field(..., description="P1/P2/P3/SEV-1/SEV-2/SEV-3 etc")
    message: str = Field(..., description="Short error/incident message")
    trace_id: Optional[str] = None
    raw: Dict[str, Any] = Field(default_factory=dict)


@router.post("/ingest")
def ingest(payload: OtelIngestPayload) -> Dict[str, Any]:
    """
    Minimal OTEL ingest:
    - Creates an incident_id
    - Posts ONE Slack alert (de-duped) with buttons
    """
    # If you already generate incident ids elsewhere, plug that in here.
    # Keeping this logic local so it never posts 4 times from different call sites.
    import uuid

    incident_id = f"inc_{uuid.uuid4().hex}"

    # Map to your Slack message format.
    region = payload.raw.get("region") or payload.raw.get("aws_region") or "us-east-1"
    resource = payload.raw.get("resource") or payload.raw.get("vpc_id") or payload.raw.get("resource_id")

    probable_causes = [
        "Dependent resources still attached",
        "Insufficient IAM permissions",
        "Resource currently in use",
    ]

    next_steps = [
        "Enumerate and remove dependencies (subnets, IGW/NAT, route tables, endpoints, ENIs)",
        "Verify IAM permissions for delete operations",
        "Retry deletion after dependencies are removed",
    ]

    summary = f"{payload.service}: {payload.message}"
    severity = payload.severity

    # ✅ This is the single Slack post point (de-duped by incident_id).
    post_incident_once(
        incident_id=incident_id,
        severity=severity,
        summary=summary if not resource else f"{summary}\nResource: {resource}",
        region=region,
        resource=resource,
        probable_causes=probable_causes,
        next_steps=next_steps,
        dedup_key_suffix="created",
    )

    return {"ok": True, "incident_id": incident_id}

