from __future__ import annotations
from fastapi import APIRouter
from models import OTelPayload
from incident_engine import analyze_cloud_issue, format_incident_for_slack
from history_repository import save_incident
import os

try:
    from slack_sdk.web.async_client import AsyncWebClient  # type: ignore
    _slack = AsyncWebClient(token=os.environ.get("SLACK_BOT_TOKEN")) if os.environ.get("SLACK_BOT_TOKEN") else None
except Exception:
    _slack = None

otel_router = APIRouter()

@otel_router.post("/api/alerts/otel")
async def handle_otel(payload: OTelPayload):
    if not payload.alerts:
        return {"status": "no_alerts"}

    parts = []
    for a in payload.alerts[:20]:
        title = a.name or a.summary or "OTEL alert"
        sev = a.severity or "unknown"
        desc = a.description or ""
        parts.append(f"[{sev}] {title} - {desc}".strip())

    combined = "\n".join(parts)
    inc = analyze_cloud_issue(combined)
    analysis_text = format_incident_for_slack(inc)

    save_incident(
        incident_id=inc.incident_id,
        slack_channel="otel",
        slack_ts=inc.incident_id,
        thread_ts=inc.incident_id,
        severity=inc.severity,
        summary=inc.summary,
        cloud_provider=inc.cloud_provider,
        region=inc.region,
        resources=",".join(inc.resources) if inc.resources else "",
        analysis_text=analysis_text,
    )

    channel = os.environ.get("SLACK_OTEL_CHANNEL")
    if _slack and channel:
        await _slack.chat_postMessage(channel=channel, text="🚨 OTEL Alert → Incident\n\n" + analysis_text)

    return {"status": "ok", "incident_id": inc.incident_id}
