# /opt/klynxaiagent/slack/slack_agent/routes/slack_actions.py

import json
from fastapi import Request
from slack_sdk import WebClient
from config import SLACK_BOT_TOKEN

client = WebClient(token=SLACK_BOT_TOKEN)


async def handle_slack_action(req: Request):
    """
    Handles Slack interactive button actions (Apply Auto-Fix / Skip)
    """
    body = await req.body()
    payload = json.loads((await req.form())["payload"])

    action = payload["actions"][0]
    action_id = action["action_id"]

    channel_id = payload["channel"]["id"]
    message_ts = payload["message"]["ts"]

    if action_id == "apply_fix":
        text = "✅ *Auto-fix request received.*\nValidating dependencies and permissions…"
    elif action_id == "skip_fix":
        text = "⏭️ *Incident skipped by user.* No action will be taken."
    else:
        text = "⚠️ Unknown action received."

    client.chat_postMessage(
        channel=channel_id,
        thread_ts=message_ts,
        text=text,
    )

    # Slack requires 200 OK quickly
    return {"ok": True}

