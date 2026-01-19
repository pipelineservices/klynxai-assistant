import hmac
import hashlib
import time
import os
import json
import requests

from fastapi import APIRouter, Request, HTTPException

router = APIRouter(prefix="/api/slack", tags=["slack"])

SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

def verify_slack_signature(req: Request, body: bytes):
    ts = req.headers.get("X-Slack-Request-Timestamp")
    sig = req.headers.get("X-Slack-Signature")

    if not ts or not sig:
        raise HTTPException(status_code=401)

    if abs(time.time() - int(ts)) > 60 * 5:
        raise HTTPException(status_code=401)

    base = f"v0:{ts}:{body.decode()}".encode()
    my_sig = "v0=" + hmac.new(
        SLACK_SIGNING_SECRET.encode(),
        base,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(my_sig, sig):
        raise HTTPException(status_code=401)

@router.post("/events")
async def slack_events(req: Request):
    body = await req.body()
    verify_slack_signature(req, body)

    payload = json.loads(body)

    # Slack URL verification
    if payload.get("type") == "url_verification":
        return {"challenge": payload["challenge"]}

    event = payload.get("event", {})

    # Only handle @mentions
    if event.get("type") != "app_mention":
        return {"ok": True}

    text = event.get("text", "")
    channel = event.get("channel")
    thread_ts = event.get("ts")

    # Call internal triage
    triage_resp = requests.post(
        "http://127.0.0.1:9000/api/triage",
        json={"text": text, "source": "slack"},
        timeout=5,
    ).json()

    reply = triage_resp.get("reply", "I’m looking into this.")

    # Post threaded reply
    requests.post(
        "https://slack.com/api/chat.postMessage",
        headers={
            "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
            "Content-Type": "application/json",
        },
        json={
            "channel": channel,
            "text": reply,
            "thread_ts": thread_ts,
        },
        timeout=5,
    )

    return {"ok": True}

