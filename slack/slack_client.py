import httpx
from config import CORE_API_URL, SLACK_BOT_TOKEN


async def call_core_chat(user_text: str) -> str:
    payload = {
        "messages": [
            {"role": "user", "content": user_text}
        ]
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{CORE_API_URL}/api/chat",
            json=payload
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("reply", "")


async def post_to_slack(channel: str, text: str):
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "channel": channel,
        "text": text,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://slack.com/api/chat.postMessage",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()

