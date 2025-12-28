from fastapi import APIRouter
from core.api.incidents import create_incident_record, notify_slack_incident

router = APIRouter(prefix="/otel", tags=["otel"])


@router.post("/ingest")
async def ingest(payload: dict):
    msg = payload.get("message", "Telemetry received")
    sev = payload.get("severity", "P3")

    # normalize severity to P1-P4 if caller used "critical/high/medium/low"
    sev_map = {
        "critical": "P1",
        "high": "P2",
        "medium": "P3",
        "low": "P4",
    }
    sev = sev_map.get(str(sev).lower(), str(sev))

    incident = create_incident_record(
        summary="OTEL Event",
        description=msg,
        source="otel",
        raw=payload,
        severity=sev,
    )

    # notify only for important ones
    if sev in ("P1", "P2"):
        try:
            notify_slack_incident(incident)
        except Exception:
            pass

    return {"status": "ok"}

