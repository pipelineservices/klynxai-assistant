import requests

from devops_orchestrator import settings


def create_incident(title: str, summary: str, severity: str = "SEV-3", metadata: dict | None = None) -> dict:
    payload = {
        "title": title,
        "summary": summary,
        "severity": severity,
        "metadata": metadata or {},
    }
    if not settings.INCIDENT_API_BASE:
        return {"ok": False, "status": 0, "data": {"detail": "incident_api_not_configured"}}
    resp = requests.post(settings.INCIDENT_API_BASE, json=payload, timeout=15)
    return {"ok": resp.ok, "status": resp.status_code, "data": resp.json()}
