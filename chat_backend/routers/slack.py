from fastapi import APIRouter, Request, Header
from services.slack_service import post_message
from services.llm_router import stream_llm_response

router = APIRouter(prefix="/api/slack", tags=["slack"])

PROCESSED_EVENTS = set()


@router.post("/events")
async def slack_events(
    request: Request,
    x_slack_retry_num: str | None = Header(default=None),
):
    body = await request.json()

    # Slack URL verification
    if body.get("type") == "url_verification":
        return {"challenge": body["challenge"]}

    event_id = body.get("event_id")
    if event_id:
        if event_id in PROCESSED_EVENTS:
            return {"ok": True}
        PROCESSED_EVENTS.add(event_id)

    event = body.get("event", {})

    # ONLY app_mention
    if event.get("type") != "app_mention":
        return {"ok": True}

    channel = event["channel"]
    text = event.get("text", "")

    text = " ".join(w for w in text.split() if not w.startswith("<@"))

    response_text = ""
    async for token in stream_llm_response(
        provider="openai",
        messages=[{"role": "user", "content": text}],
    ):
        response_text += token

    await post_message(
        channel=channel,
        text=f"*KLYNXAI Assistant*\n{response_text}",
    )

    return {"ok": True}

