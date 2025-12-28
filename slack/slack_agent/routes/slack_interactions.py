from fastapi import APIRouter, Request
import uuid

from slack_agent.services.slack_client import post_to_slack

router = APIRouter()

@router.post("/slack/events")
async def slack_events(req: Request):
    payload = await req.json()

    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    event = payload.get("event", {})
    if event.get("bot_id"):
        return {"ok": True}

    text = event.get("text", "")
    channel = event.get("channel")
    thread_ts = event.get("ts")

    # 🔑 Generate trace_id here (shared with Core later)
    trace_id = uuid.uuid4().hex

    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "🚨 *Incident detected*",
            },
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Trace ID:*\n`{trace_id}`"},
                {"type": "mrkdwn", "text": f"*Message:*\n{text}"},
            ],
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Apply Auto-Fix ✅"},
                    "style": "primary",
                    "action_id": "apply_fix",
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Skip ❌"},
                    "style": "danger",
                    "action_id": "skip_fix",
                },
            ],
        },
    ]

    await post_to_slack(
        channel=channel,
        thread_ts=thread_ts,
        text=f"Incident detected | Trace ID: {trace_id}",
        blocks=blocks,
    )

    return {"ok": True}

