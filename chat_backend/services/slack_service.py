import httpx
import os

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage"


async def post_message(channel: str, text: str):
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "channel": channel,
        "text": text,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            SLACK_POST_MESSAGE_URL,
            headers=headers,
            json=payload,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

