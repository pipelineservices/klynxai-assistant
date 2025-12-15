from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import os
import hmac
import hashlib
import time
import logging

from chat_backend.services.slack_service import handle_slack_event

router = APIRouter()
logger = logging.getLogger("slack")

SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "")


def verify_slack_signature(req: Request, body: bytes):
    """
    Verify Slack request signature to prevent spoofing
    """
    timestamp = req.headers.get("X-Slack-Request-Timestamp")
    signature = req.headers.get("X-Slack-Signature")

    if not timestamp or not signature:
        raise HTTPException(status_code=401, detail="Missing Slack signature")

    # Prevent replay attacks (5 minutes)
    if abs(time.time() - int(timestamp)) > 60 * 5:
        raise HTTPException(status_code=401, detail="Stale Slack request")

    sig_basestring = f"v0:{timestamp}:{body.decode('utf-8')}"
    my_signature = (
        "v0="
        + hmac.new(
            SLACK_SIGNING_SECRET.encode(),
            sig_basestring.encode(),
            hashlib.sha256,
        ).hexdigest()
    )

    if not hmac.compare_digest(my_signature, signature):
        raise HTTPException(status_code=401, detail="Invalid Slack signature")


@router.post("/api/slack/events")
async def slack_events(request: Request):
    """
    Slack Events API endpoint
    """

    body = await request.body()

    # 🔐 Verify Slack signature
    verify_slack_signature(request, body)

    payload = await request.json()
    event_type = payload.get("type")

    # ✅ REQUIRED: Slack URL verification handshake
    if event_type == "url_verification":
        logger.info("Slack URL verification successful")
        return JSONResponse(
            content={"challenge": payload.get("challenge")},
            status_code=200,
        )

    # Normal event callback
    if event_type == "event_callback":
        event = payload.get("event", {})

        # Ignore bot messages to avoid loops
        if event.get("subtype") == "bot_message":
            return JSONResponse(content={"ok": True})

        try:
            await handle_slack_event(event)
            return JSONResponse(content={"ok": True})
        except Exception as e:
            logger.exception("Slack event handling failed")
            return JSONResponse(
                content={"ok": False, "error": str(e)},
                status_code=500,
            )

    # Unknown Slack payload type
    logger.warning(f"Unhandled Slack payload: {payload}")
    return JSONResponse(content={"ok": True})

