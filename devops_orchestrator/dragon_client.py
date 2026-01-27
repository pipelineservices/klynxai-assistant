import requests

from devops_orchestrator import settings


def _headers():
    return {
        "X-Token": settings.DRAGON_TOKEN,
        "X-Org-Id": settings.DRAGON_ORG,
        "X-Region": settings.DRAGON_REGION,
        "Content-Type": "application/json",
    }


def create_decision(title: str, action: str, rationale: str, impact: str, risk: dict | None = None) -> dict:
    payload = {
        "alert_id": "devops-workflow",
        "proposer": "devops-orchestrator",
        "proposed_action": action,
        "rationale": f"{title}. {rationale}. Impact: {impact}. Risk: {risk or {}}",
    }
    url = f"{settings.DRAGON_BASE_URL}/api/decisions"
    resp = requests.post(url, headers=_headers(), json=payload, timeout=15)
    return {"ok": resp.ok, "status": resp.status_code, "data": resp.json()}


def decision_status(decision_id: str) -> dict:
    url = f"{settings.DRAGON_BASE_URL}/api/decisions/{decision_id}"
    resp = requests.get(url, headers=_headers(), timeout=15)
    return {"ok": resp.ok, "status": resp.status_code, "data": resp.json()}


def is_approved(decision_id: str) -> bool:
    result = decision_status(decision_id)
    if not result.get("ok"):
        return False
    status = str(result.get("data", {}).get("status", "")).lower()
    return status in ("approved", "approve", "allowed", "allow")
