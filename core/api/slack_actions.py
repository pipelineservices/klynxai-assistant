from fastapi import APIRouter
from core.api.incidents import create_incident_record

router = APIRouter(prefix="/slack", tags=["slack"])


@router.post("/actions")
async def slack_action(payload: dict):
    incident = create_incident_record(
        summary="Slack action triggered",
        description=str(payload),
        source="slack",
        raw=payload,
    )

    return {
        "response_type": "ephemeral",
        "text": "✅ Action received and incident updated."
    }

