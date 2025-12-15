from fastapi import APIRouter, Request
from opentelemetry import trace

from chat_backend.services.slack_service import post_message

router = APIRouter(tags=["slack"])
tracer = trace.get_tracer("klynx-chat-backend")


@router.post("/slack/events")
async def slack_events(request: Request):
    payload = await request.json()

    if payload.get("type") == "url_verification":
        return {"challenge": payload["challenge"]}

    with tracer.start_as_current_span("slack.event") as span:
        event = payload.get("event", {})
        span.set_attribute("slack.event.type", event.get("type", "unknown"))

        if event.get("type") == "app_mention":
            await post_message(
                channel=event["channel"],
                text="👋 Incident received. Processing..."
            )

    return {"ok": True}

