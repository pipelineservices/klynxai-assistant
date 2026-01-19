from __future__ import annotations

import os
import uuid
import json
import importlib
from typing import Any, Dict, List, Optional

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, ConfigDict, model_validator


# ------------------------------------------------------------
# Models
# ------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class Action(BaseModel):
    model_config = ConfigDict(extra="allow")

    type: str = Field(default="task")
    title: str = Field(default="")
    name: Optional[str] = None
    risk: Optional[str] = None

    @model_validator(mode="after")
    def fill_required(self) -> "Action":
        if not self.title:
            self.title = self.name or "action"
        if not self.type:
            self.type = "task"
        return self


class ChatResponse(BaseModel):
    reply: str
    actions: List[Action] = Field(default_factory=list)
    request_id: str


class OTelIngestRequest(BaseModel):
    service: str = "unknown"
    severity: str = "P3"   # P1/P2 => incident
    message: str
    trace_id: Optional[str] = None
    raw: Dict[str, Any] = Field(default_factory=dict)


# ------------------------------------------------------------
# Minimal incident store (self-contained)
# ------------------------------------------------------------

INCIDENTS: Dict[str, Dict[str, Any]] = {}


def _new_incident_id() -> str:
    return "inc_" + uuid.uuid4().hex


def create_incident(summary: str, description: str = "", source: str = "otel") -> Dict[str, Any]:
    incident_id = _new_incident_id()
    record = {
        "id": incident_id,
        "summary": summary,
        "description": description,
        "source": source,
        "status": "open",
    }
    INCIDENTS[incident_id] = record
    return record


def close_incident(incident_id: str, reason: str = "closed") -> Dict[str, Any]:
    if incident_id not in INCIDENTS:
        raise HTTPException(404, "incident not found")
    INCIDENTS[incident_id]["status"] = "closed"
    INCIDENTS[incident_id]["close_reason"] = reason
    return INCIDENTS[incident_id]


# ------------------------------------------------------------
# Slack notify (Webhook-based, reliable)
# ------------------------------------------------------------

def notify_slack(text: str) -> None:
    """
    Uses SLACK_WEBHOOK_URL (recommended).
    This avoids depending on your slack-agent endpoint path which currently returns 404.
    """
    url = os.getenv("SLACK_WEBHOOK_URL", "").strip()
    if not url:
        return

    try:
        requests.post(url, json={"text": text}, timeout=5)
    except Exception:
        # do not crash core if slack fails
        pass


# ------------------------------------------------------------
# LLM loader (safe fallback)
# ------------------------------------------------------------

class _FallbackLocalLLM:
    async def reply(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        user_text = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
        return {"reply": f"Hello! You said: {user_text}", "actions": []}


def _load_llm() -> Any:
    candidates = [
        ("core.llm.bedrock_llm", "BedrockLLM"),
        ("core.llm.local_llm", "LocalLLM"),
        ("llm.local_llm", "LocalLLM"),
        ("local_llm", "LocalLLM"),
    ]
    for mod_name, cls_name in candidates:
        try:
            module = importlib.import_module(mod_name)
            cls = getattr(module, cls_name)
            return cls()
        except Exception:
            continue
    return _FallbackLocalLLM()


LLM = _load_llm()


def normalize_actions(raw: Any) -> List[Action]:
    if not raw:
        return []
    if isinstance(raw, dict):
        raw = [raw]
    if isinstance(raw, str):
        raw = [{"title": raw, "type": "message"}]
    out: List[Action] = []
    if isinstance(raw, list):
        for r in raw:
            if isinstance(r, dict):
                out.append(Action(**r))
    return out


# ------------------------------------------------------------
# OpenAI support (optional)
# ------------------------------------------------------------

def _is_openai_provider() -> bool:
    return os.getenv("KLYNX_LLM_PROVIDER", "").lower() == "openai"


def _openai_client():
    from openai import OpenAI
    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        raise HTTPException(500, "OPENAI_API_KEY not set")
    return OpenAI(api_key=key)


# ------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------

app = FastAPI(title="KLYNX Core API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"service": "klynx-core", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}


# ------------------------------------------------------------
# Incidents endpoints
# ------------------------------------------------------------

@app.get("/api/incidents")
def list_incidents():
    return {"incidents": list(INCIDENTS.values())}

@app.post("/api/incidents")
def create_incident_api(payload: Dict[str, Any]):
    summary = str(payload.get("summary", "incident"))
    desc = str(payload.get("description", ""))
    inc = create_incident(summary=summary, description=desc, source="api")
    notify_slack(f"🟠 *Incident created* `{inc['id']}`\n*Summary:* {inc['summary']}")
    return inc

@app.post("/api/incidents/{incident_id}/action")
def action_incident(incident_id: str, payload: Dict[str, Any]):
    action = str(payload.get("action", "open"))
    if incident_id not in INCIDENTS:
        INCIDENTS[incident_id] = {
            "id": incident_id,
            "summary": "external",
            "description": "",
            "source": "api",
            "status": "open",
        }

    INCIDENTS[incident_id]["status"] = action
    notify_slack(f"🟣 *Incident update* `{incident_id}` → *{action}*")
    return {"incident_id": incident_id, "action": action, "status": "updated"}


# ------------------------------------------------------------
# OTEL ingest → incident + slack
# ------------------------------------------------------------

@app.post("/api/otel/ingest")
def otel_ingest(req: OTelIngestRequest):
    sev = (req.severity or "P3").upper()
    is_incident = sev in ("P1", "P2")

    if is_incident:
        inc = create_incident(
            summary=f"[{sev}] {req.service}: {req.message}",
            description=json.dumps({"trace_id": req.trace_id, "raw": req.raw}, default=str)[:8000],
            source="otel",
        )
        notify_slack(
            f"🚨 *OTEL Incident* `{inc['id']}`\n"
            f"*Severity:* {sev}\n"
            f"*Service:* {req.service}\n"
            f"*Message:* {req.message}\n"
            f"*Trace:* {req.trace_id or '-'}"
        )
        return {"ok": True, "incident_id": inc["id"]}

    # Non-incident telemetry
    notify_slack(f"ℹ️ OTEL `{req.service}` [{sev}]: {req.message}")
    return {"ok": True}


# ------------------------------------------------------------
# Chat (non-streaming)
# ------------------------------------------------------------

@app.post("/api/chat")
async def chat(req: ChatRequest) -> ChatResponse:
    request_id = str(uuid.uuid4())
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    if _is_openai_provider():
        client = _openai_client()
        completion = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.3")),
        )
        reply = completion.choices[0].message.content or ""
        actions: List[Action] = []
    else:
        res = await LLM.reply(messages)
        reply = str(res.get("reply", "")) if isinstance(res, dict) else str(res)
        actions = normalize_actions(res.get("actions", [])) if isinstance(res, dict) else []

    return ChatResponse(reply=reply, actions=actions, request_id=request_id)


# ------------------------------------------------------------
# Chat streaming (SSE)
# ------------------------------------------------------------

@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    if not _is_openai_provider():
        raise HTTPException(400, "Streaming requires KLYNX_LLM_PROVIDER=openai")

    client = _openai_client()
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    def sse(data: str) -> str:
        return f"data: {data}\n\n"

    def generator():
        try:
            stream = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=messages,
                temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.3")),
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                token = getattr(delta, "content", None)
                if token:
                    yield sse(token)
            yield sse("[DONE]")
        except Exception as e:
            yield sse(f"[ERROR] {e}")
            yield sse("[DONE]")

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

