import httpx
from typing import Any, Dict, List, Optional

from config import SLACK_BOT_TOKEN

SLACK_API_BASE = "https://slack.com/api"


async def _slack_post(method: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json; charset=utf-8",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{SLACK_API_BASE}/{method}", headers=headers, json=payload)
        data = resp.json()
        if not data.get("ok"):
            # keep error visible in logs
            raise RuntimeError(f"Slack API error calling {method}: {data}")
        return data


async def post_to_slack(
    channel: str,
    text: str,
    thread_ts: Optional[str] = None,
    blocks: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"channel": channel, "text": text}
    if thread_ts:
        payload["thread_ts"] = thread_ts
    if blocks:
        payload["blocks"] = blocks
    return await _slack_post("chat.postMessage", payload)


async def update_message(
    channel: str,
    ts: str,
    text: str,
    blocks: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"channel": channel, "ts": ts, "text": text}
    if blocks:
        payload["blocks"] = blocks
    return await _slack_post("chat.update", payload)


async def post_ephemeral(
    channel: str,
    user: str,
    text: str,
    thread_ts: Optional[str] = None,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"channel": channel, "user": user, "text": text}
    if thread_ts:
        payload["thread_ts"] = thread_ts
    return await _slack_post("chat.postEphemeral", payload)

