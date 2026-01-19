import os
import time
import json
from typing import List, Optional, Dict, Any

import requests

# -------------------- CONFIG --------------------
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "").strip()
SLACK_WEB_API = "https://slack.com/api/chat.postMessage"

# DEDUP (for incident_id based dedup, optional)
DEDUP_PATH = "/var/tmp/klynx_slack_dedup.json"
DEDUP_TTL = 600  # 10 minutes

def _load() -> Dict[str, int]:
    try:
        with open(DEDUP_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _save(data: Dict[str, int]) -> None:
    os.makedirs(os.path.dirname(DEDUP_PATH), exist_ok=True)
    with open(DEDUP_PATH, "w") as f:
        json.dump(data, f)

def should_send(key: str) -> bool:
    now = int(time.time())
    data = _load()
    data = {k: v for k, v in data.items() if now - v < DEDUP_TTL}

    if key in data:
        _save(data)
        return False

    data[key] = now
    _save(data)
    return True

def _post_to_slack(payload: Dict[str, Any]) -> None:
    if not SLACK_BOT_TOKEN:
        print("[WARN] SLACK_BOT_TOKEN not set; cannot post to Slack.")
        return

    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json; charset=utf-8",
    }
    r = requests.post(SLACK_WEB_API, headers=headers, json=payload, timeout=10)
    try:
        data = r.json()
    except Exception:
        data = {"ok": False, "error": "non_json_response"}

    if not data.get("ok"):
        print(f"[WARN] Slack post failed: {data}")

def slack_post_text_reply(*, channel: str, thread_ts: str, text: str) -> None:
    payload = {"channel": channel, "thread_ts": thread_ts, "text": text}
    _post_to_slack(payload)

def slack_post_incident_blocks(
    *,
    channel: str,
    thread_ts: str,
    incident_id: str,
    severity: str,
    summary: str,
    probable_causes: List[str],
    next_steps: List[str],
    autofix_plan: List[str],
) -> None:
    # Optional dedup per incident
    if not should_send(f"incident:{incident_id}:{channel}:{thread_ts}"):
        return

    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": "🚨 Incident Detected"}},
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Incident ID:*\n`{incident_id}`"},
                {"type": "mrkdwn", "text": f"*Severity:*\n{severity}"},
            ],
        },
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Summary:*\n{summary}"}},
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Probable cause:*\n" + "\n".join(f"• {x}" for x in probable_causes),
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Suggested next steps:*\n" + "\n".join(f"• {x}" for x in next_steps),
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Auto-fix plan (dry-run):*\n" + "\n".join(f"• {x}" for x in autofix_plan),
            },
        },
        {"type": "actions",
         "elements": [
             {
                 "type": "button",
                 "style": "primary",
                 "text": {"type": "plain_text", "text": "Apply Auto-Fix"},
                 "action_id": "apply_autofix",
                 "value": incident_id,
             },
             {
                 "type": "button",
                 "style": "danger",
                 "text": {"type": "plain_text", "text": "Skip"},
                 "action_id": "skip_autofix",
                 "value": incident_id,
             },
         ]},
    ]

    payload = {
        "channel": channel,
        "thread_ts": thread_ts,
        "text": f"Incident Detected: {incident_id}",
        "blocks": blocks,
    }
    _post_to_slack(payload)

