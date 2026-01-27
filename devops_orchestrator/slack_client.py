import requests

from devops_orchestrator import settings


def post_message(text: str, blocks: list | None = None) -> dict:
    if not settings.SLACK_WEBHOOK_URL:
        return {"ok": False, "status": 0, "data": {"detail": "slack_webhook_not_configured"}}
    payload = {"text": text}
    if blocks:
        payload["blocks"] = blocks
    resp = requests.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=15)
    try:
        data = resp.json()
    except Exception:
        data = {"text": resp.text}
    return {"ok": resp.ok, "status": resp.status_code, "data": data}


def post_approval_request(incident_id: str, decision_id: str, summary: str, run_url: str) -> dict:
    blocks = [
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*CI/CD Failure*\n{summary}"}},
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Incident ID:*\n{incident_id}"},
                {"type": "mrkdwn", "text": f"*Decision ID:*\n{decision_id}"},
            ],
        },
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Run URL:* {run_url or 'n/a'}"}},
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Approve"},
                    "style": "primary",
                    "action_id": "devops_approve",
                    "value": f"{incident_id}|{decision_id}|approve",
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Deny"},
                    "style": "danger",
                    "action_id": "devops_deny",
                    "value": f"{incident_id}|{decision_id}|deny",
                },
            ],
        },
    ]
    return post_message(
        text=f"Approval required for incident {incident_id} (decision {decision_id}).",
        blocks=blocks,
    )
