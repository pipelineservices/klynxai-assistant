import hashlib
import hmac
import os
import time
from typing import Optional
from urllib.parse import parse_qs

from fastapi import APIRouter, Header, HTTPException, Request

from core.api.incidents import append_incident_timeline, close_incident

router = APIRouter(prefix="/api/slack", tags=["slack"])

SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "")


def _verify_slack_signature(body: bytes, timestamp: str, signature: str) -> bool:
    if not SLACK_SIGNING_SECRET:
        return True  # allow in dev

    if abs(time.time() - int(timestamp)) > 60 * 5:
        return False

    basestring = f"v0:{timestamp}:{body.decode('utf-8')}".encode("utf-8")
    my_sig = "v0=" + hmac.new(
        SLACK_SIGNING_SECRET.encode("utf-8"),
        basestring,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(my_sig, signature)


@router.post("/actions")
async def slack_actions(
    request: Request,
    x_slack_request_timestamp: Optional[str] = Header(default=None),
    x_slack_signature: Optional[str] = Header(default=None),
):
    body = await request.body()
    if not _verify_slack_signature(body, x_slack_request_timestamp or "", x_slack_signature or ""):
        raise HTTPException(status_code=401, detail="Invalid Slack signature")

    form = parse_qs(body.decode("utf-8"))
    payload = form.get("payload", [None])[0]
    if not payload:
        raise HTTPException(status_code=400, detail="Missing payload")

    import json
    p = json.loads(payload)

    actions = p.get("actions") or []
    if not actions:
        return {"ok": True}

    action = actions[0]
    action_id = action.get("action_id")
    incident_id = action.get("value")

    if not incident_id:
        return {"ok": True}

    if action_id == "apply_autofix":
        append_incident_timeline(
            incident_id,
            {"type": "autofix", "message": "Auto-fix requested from Slack", "source": "slack"},
        )
        # You can later trigger real automation here
        return {
            "response_type": "ephemeral",
            "text": f"✅ Auto-fix requested for `{incident_id}` (dry-run).",
        }

    if action_id == "skip_autofix":
        append_incident_timeline(
            incident_id,
            {"type": "autofix", "message": "Auto-fix skipped from Slack", "source": "slack"},
        )
        close_incident(incident_id, reason="Auto-fix skipped from Slack")
        return {
            "response_type": "ephemeral",
            "text": f"⏭️ Skipped auto-fix and closed `{incident_id}`.",
        }

    return {"ok": True}

