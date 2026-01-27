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
