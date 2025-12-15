import os
import httpx

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")


async def post_message(channel: str, text: str):
    if not SLACK_BOT_TOKEN:
        raise RuntimeError("SLACK_BOT_TOKEN not set")

    url = "https://slack.com/api/chat.postMessage"
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "channel": channel,
        "text": text,
    }

    async with httpx.AsyncClient(timeout=5) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()

