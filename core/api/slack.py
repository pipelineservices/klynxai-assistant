import json
import os
import time
import hmac
import hashlib
from typing import Dict, Any, Optional

from fastapi import APIRouter, Request, Header, HTTPException, BackgroundTasks

from core.integrations.slack_notify import (
    slack_post_incident_blocks,
    slack_post_text_reply,
)

router = APIRouter(prefix="/api/slack", tags=["slack"])

SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "").strip()

# -------------------------------------------------
# Signature verification
# -------------------------------------------------
def verify_signature(timestamp: str, body: bytes, signature: str) -> bool:
    if not SLACK_SIGNING_SECRET:
        print("⚠️ SLACK_SIGNING_SECRET not set – skipping verification")
        return True

    base = f"v0:{timestamp}:".encode() + body
    expected = "v0=" + hmac.new(
        SLACK_SIGNING_SECRET.encode(),
        base,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)

# -------------------------------------------------
# Slack Events
# -------------------------------------------------
@router.post("/events")
async def slack_events(
    request: Request,
    background: BackgroundTasks,
    x_slack_request_timestamp: Optional[str] = Header(None),
    x_slack_signature: Optional[str] = Header(None),
):
    raw = await request.body()

    if not verify_signature(
        x_slack_request_timestamp or "",
        raw,
        x_slack_signature or "",
    ):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = json.loads(raw.decode())

    # URL verification
    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    event = payload.get("event", {})
    event_type = event.get("type")

    # ONLY respond to app mentions
    if event_type == "app_mention":
        background.add_task(handle_app_mention, event)

    return {"ok": True}

# -------------------------------------------------
# App mention handler (SINGLE RESPONSE)
# -------------------------------------------------
def handle_app_mention(event: Dict[str, Any]) -> None:
    print("🔥 SLACK APP MENTION RECEIVED")

    text = (event.get("text") or "").lower()
    channel = event.get("channel")
    thread_ts = event.get("thread_ts") or event.get("ts")

    incident_id = f"INC-{int(time.time())}"

    # ---- Heuristic detection ----
    region = "us-east-1"
    vpc_id = "unknown"

    for token in text.split():
        if token.startswith("vpc-"):
            vpc_id = token
        if token.startswith("us-"):
            region = token

    summary = f"AI Assistant unable to remove VPC `{vpc_id}` in `{region}`"

    slack_post_incident_blocks(
        channel=channel,
        thread_ts=thread_ts,
        incident_id=incident_id,
        severity="SEV-3",
        summary=summary,
        probable_causes=[
            "VPC has dependent resources",
            "Insufficient IAM permissions",
            "VPC currently in use",
        ],
        next_steps=[
            "Remove dependent resources (subnets, IGW, NAT, endpoints)",
            "Verify IAM permissions",
            "Retry VPC deletion",
        ],
        autofix_plan=[
            "Enumerate dependencies",
            "Validate no EC2 usage",
            "Retry deletion",
        ],
    )

# -------------------------------------------------
# Slack Button Actions
# -------------------------------------------------
@router.post("/actions")
async def slack_actions(request: Request):
    form = await request.form()
    payload = json.loads(form.get("payload"))

    action = payload["actions"][0]
    action_id = action["action_id"]
    incident_id = action["value"]

    channel = payload["channel"]["id"]
    ts = payload["message"]["ts"]
    user = payload["user"]["username"]

    if action_id == "apply_autofix":
        slack_post_text_reply(
            channel,
            ts,
            f"🚀 Auto-fix requested by `{user}` for `{incident_id}`",
        )

    if action_id == "skip_autofix":
        slack_post_text_reply(
            channel,
            ts,
            f"⏭️ Auto-fix skipped by `{user}` for `{incident_id}`",
        )

    return {"ok": True}

