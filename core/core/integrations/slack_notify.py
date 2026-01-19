import json
import os
import time
from typing import Any, Dict, List, Optional

import requests

# -----------------------------------------------------------------------------
# Slack Notification (De-duped) + Block Kit message with buttons
# -----------------------------------------------------------------------------
#
# Supports:
# - Incoming Webhook: SLACK_WEBHOOK_URL
# OR
# - Bot Token: SLACK_BOT_TOKEN + SLACK_CHANNEL (chat.postMessage)
#
# De-dupe:
# - Stores a small JSON state file to avoid sending the same incident multiple
#   times (common with retries, multiple triggers, or concurrent workers).
# - Default TTL = 10 minutes.
#
# Buttons:
# - "Apply Auto-Fix" and "Skip" are included as interactive buttons.
# - Your Slack App must have Interactivity enabled + Request URL configured
#   to receive button clicks. (Posting buttons itself works without that, but
#   clicking them requires your handler endpoint.)
# -----------------------------------------------------------------------------

DEDUP_STATE_PATH = os.getenv("KLYNX_SLACK_DEDUP_PATH", "/var/tmp/klynx_slack_dedup.json")
DEDUP_TTL_SECONDS = int(os.getenv("KLYNX_SLACK_DEDUP_TTL_SECONDS", "600"))  # 10 minutes

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "").strip()
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "").strip()
SLACK_CHANNEL = os.getenv("SLACK_CHANNEL", "").strip()  # e.g. "#all-klynx-ai-assistant" OR channel ID


def _now() -> int:
    return int(time.time())


def _load_dedup_state() -> Dict[str, int]:
    try:
        if not os.path.exists(DEDUP_STATE_PATH):
            return {}
        with open(DEDUP_STATE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            # Ensure values are ints
            out: Dict[str, int] = {}
            for k, v in data.items():
                try:
                    out[str(k)] = int(v)
                except Exception:
                    continue
            return out
        return {}
    except Exception:
        return {}


def _save_dedup_state(state: Dict[str, int]) -> None:
    try:
        os.makedirs(os.path.dirname(DEDUP_STATE_PATH), exist_ok=True)
        tmp_path = f"{DEDUP_STATE_PATH}.tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(state, f)
        os.replace(tmp_path, DEDUP_STATE_PATH)
    except Exception:
        # If we fail to persist, we still don't want to crash the API.
        pass


def _dedup_should_send(key: str) -> bool:
    """
    Returns True only if we have NOT sent this key recently.
    """
    state = _load_dedup_state()
    now = _now()

    # prune old keys
    pruned: Dict[str, int] = {}
    for k, ts in state.items():
        if now - ts <= DEDUP_TTL_SECONDS:
            pruned[k] = ts

    last_ts = pruned.get(key)
    if last_ts is not None and (now - last_ts) <= DEDUP_TTL_SECONDS:
        _save_dedup_state(pruned)
        return False

    pruned[key] = now
    _save_dedup_state(pruned)
    return True


def _fmt_kv(label: str, value: str) -> Dict[str, Any]:
    return {"type": "mrkdwn", "text": f"*{label}:*\n{value}"}


def build_incident_blocks(
    *,
    incident_id: str,
    severity: str,
    summary: str,
    region: Optional[str] = None,
    resource: Optional[str] = None,
    probable_causes: Optional[List[str]] = None,
    next_steps: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    probable_causes = probable_causes or []
    next_steps = next_steps or []

    # Render bullet lists cleanly
    pc_text = "\n".join([f"• {x}" for x in probable_causes]) if probable_causes else "• (not provided)"
    ns_text = "\n".join([f"• {x}" for x in next_steps]) if next_steps else "• (not provided)"

    fields: List[Dict[str, Any]] = [
        _fmt_kv("Incident ID", f"`{incident_id}`"),
        _fmt_kv("Severity", severity),
    ]

    if region:
        fields.append(_fmt_kv("Region", region))
    if resource:
        fields.append(_fmt_kv("Resource", f"`{resource}`"))

    blocks: List[Dict[str, Any]] = [
        {"type": "header", "text": {"type": "plain_text", "text": "🚨 Incident Detected"}},
        {"type": "section", "fields": fields},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Summary:*\n{summary}"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Probable cause:*\n{pc_text}"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Suggested next steps:*\n{ns_text}"}},
        {"type": "divider"},
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "*Auto-fix plan (dry-run):*\n• Enumerate dependencies\n• Validate no active usage\n• Retry operation safely"},
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Apply Auto-Fix"},
                    "style": "primary",
                    "action_id": "klynx_apply_autofix",
                    "value": json.dumps({"incident_id": incident_id}),
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Skip"},
                    "style": "danger",
                    "action_id": "klynx_skip_autofix",
                    "value": json.dumps({"incident_id": incident_id}),
                },
            ],
        },
    ]

    return blocks


def _send_via_webhook(payload: Dict[str, Any]) -> None:
    if not SLACK_WEBHOOK_URL:
        raise RuntimeError("SLACK_WEBHOOK_URL not set")
    resp = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=10)
    resp.raise_for_status()


def _send_via_bot(payload: Dict[str, Any]) -> None:
    if not SLACK_BOT_TOKEN or not SLACK_CHANNEL:
        raise RuntimeError("SLACK_BOT_TOKEN or SLACK_CHANNEL not set")

    api_url = "https://slack.com/api/chat.postMessage"
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json; charset=utf-8",
    }

    # chat.postMessage needs channel
    body = dict(payload)
    body["channel"] = SLACK_CHANNEL

    resp = requests.post(api_url, headers=headers, json=body, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Slack chat.postMessage failed: {data}")


def post_incident_once(
    *,
    incident_id: str,
    severity: str,
    summary: str,
    region: Optional[str] = None,
    resource: Optional[str] = None,
    probable_causes: Optional[List[str]] = None,
    next_steps: Optional[List[str]] = None,
    dedup_key_suffix: str = "created",
) -> bool:
    """
    Returns True if posted, False if skipped due to de-dupe.
    """
    key = f"slack:{incident_id}:{dedup_key_suffix}"
    if not _dedup_should_send(key):
        return False

    blocks = build_incident_blocks(
        incident_id=incident_id,
        severity=severity,
        summary=summary,
        region=region,
        resource=resource,
        probable_causes=probable_causes,
        next_steps=next_steps,
    )

    payload: Dict[str, Any] = {
        "text": f"Incident Detected: {incident_id}",  # fallback text
        "blocks": blocks,
    }

    # Prefer webhook if configured, else bot token.
    if SLACK_WEBHOOK_URL:
        _send_via_webhook(payload)
    else:
        _send_via_bot(payload)

    return True

