from __future__ import annotations

import os
import json
import time
import requests
from typing import Any, Dict

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# -------------------------
# OTEL
# -------------------------
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor


def _init_otel(service_name: str) -> None:
    resource = Resource.create(
        {
            "service.name": service_name,
            "service.version": "1.0.0",
            "deployment.environment": os.getenv("ENV", "dev"),
        }
    )
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    if otlp_endpoint:
        exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
    else:
        exporter = ConsoleSpanExporter()

    provider.add_span_processor(BatchSpanProcessor(exporter))

    RequestsInstrumentor().instrument()


def _trace_id() -> str:
    span = trace.get_current_span()
    ctx = span.get_span_context()
    if ctx and ctx.trace_id:
        return f"{ctx.trace_id:032x}"
    return ""


# -------------------------
# Config
# -------------------------
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "")
CORE_API = os.getenv("CORE_API", "http://127.0.0.1:9000")

# -------------------------
# App
# -------------------------
_init_otel("klynx-slack")

app = FastAPI(title="KLYNX Slack Agent", version="1.0.0")
FastAPIInstrumentor.instrument_app(app)


def post_to_slack(channel: str, text: str, thread_ts: str | None = None) -> Dict[str, Any]:
    """
    Uses Slack chat.postMessage API.
    NOTE: No 'blocks' arg here to avoid your earlier crash.
    """
    url = "https://slack.com/api/chat.postMessage"
    payload: Dict[str, Any] = {"channel": channel, "text": text}
    if thread_ts:
        payload["thread_ts"] = thread_ts

    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json; charset=utf-8",
    }

    resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=10)
    return resp.json()


def create_incident_in_core(summary: str) -> Dict[str, Any]:
    """
    Creates incident in core so UI can show it.
    """
    headers = {"Content-Type": "application/json"}
    # Send trace-id through implicitly via OTEL context; core also captures its own trace_id
    resp = requests.post(
        f"{CORE_API}/api/incidents",
        headers=headers,
        data=json.dumps({"summary": summary, "source": "slack"}),
        timeout=10,
    )
    return resp.json()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/slack/events")
async def slack_events(request: Request):
    body = await request.json()

    # Slack URL verification
    if body.get("type") == "url_verification":
        return JSONResponse({"challenge": body.get("challenge")})

    event = body.get("event", {}) or {}
    event_type = event.get("type")

    # Only handle app mentions or messages depending on your bot config
    if event_type not in ("app_mention", "message"):
        return JSONResponse({"ok": True})

    channel = event.get("channel")
    text = event.get("text", "")
    thread_ts = event.get("ts")

    if not channel:
        return JSONResponse({"ok": True})

    # Create incident + reply with trace id
    tid = _trace_id()
    incident = create_incident_in_core(summary=text)
    incident_id = incident.get("id", "unknown")
    incident_trace = incident.get("trace_id", tid)

    msg = (
        "🚨 *Incident detected*\n"
        f"*User message:* {text}\n"
        f"*Incident ID:* {incident_id}\n"
        f"*Trace ID:* {incident_trace}\n"
        "_Analysis in progress..._"
    )

    post_to_slack(channel=channel, text=msg, thread_ts=thread_ts)

    return JSONResponse({"ok": True})

