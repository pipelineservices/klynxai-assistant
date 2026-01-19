from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid

from core.integrations.slack_notify import slack_post_incident_blocks

router = APIRouter(prefix="/api/otel", tags=["otel"])

class OtelPayload(BaseModel):
    service: str
    severity: str
    message: str
    trace_id: Optional[str] = None
    raw: Dict[str, Any] = {}

@router.post("/ingest")
def ingest(payload: OtelPayload):
    incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"

    region = payload.raw.get("region", "us-east-1")
    resource = payload.raw.get("vpc_id") or payload.raw.get("resource") or "unknown"

    # NOTE: for OTEL we typically post to a fixed alert channel.
    # If you want per-team channel routing later, we’ll add mapping by service.
    alert_channel = payload.raw.get("slack_channel", os.getenv("SLACK_ALERT_CHANNEL", "")).strip()

    if alert_channel:
        slack_post_incident_blocks(
            channel=alert_channel,
            thread_ts=str(int(uuid.uuid4().int % 1000000000)),  # not a real thread; best practice: post top-level
            incident_id=incident_id,
            severity=payload.severity,
            summary=f"[{payload.service}] {payload.message} (resource `{resource}` in `{region}`)",
            probable_causes=[
                "Dependent resources exist",
                "IAM permission issue",
                "Resource currently in use",
            ],
            next_steps=[
                "Delete dependent resources (subnets, IGW, NAT, endpoints)",
                "Verify IAM permissions",
                "Retry operation",
            ],
            autofix_plan=[
                "Enumerate dependencies",
                "Validate usage/locks",
                "Retry safely",
            ],
        )

    return {"ok": True, "incident_id": incident_id}

