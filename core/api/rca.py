from __future__ import annotations

import os
import json
import time
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.api.incidents import (
    list_incidents,          # must exist in your incidents module
    notify_slack_incident,   # already exists in your project
)

router = APIRouter(tags=["rca"])

# -----------------------------
# Models
# -----------------------------

class RCARequest(BaseModel):
    post_to_slack: bool = Field(default=False)
    force_regenerate: bool = Field(default=False)


class RCAResponse(BaseModel):
    incident_id: str
    generated_at: float
    rca_markdown: str


# -----------------------------
# Helpers
# -----------------------------

def _is_openai_provider() -> bool:
    return os.getenv("KLYNX_LLM_PROVIDER", "").strip().lower() == "openai"


def _openai_client():
    from openai import OpenAI  # type: ignore
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=key)


def _find_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    for inc in list_incidents():
        if inc.get("id") == incident_id:
            return inc
    return None


def _safe_string(x: Any, max_len: int = 4000) -> str:
    s = "" if x is None else str(x)
    if len(s) > max_len:
        return s[:max_len] + "...(trimmed)"
    return s


def _format_incident_for_llm(inc: Dict[str, Any]) -> str:
    # Keep only what we need; avoid dumping secrets
    summary = _safe_string(inc.get("summary"))
    description = _safe_string(inc.get("description"))
    severity = _safe_string(inc.get("severity") or inc.get("risk") or "P?")
    status = _safe_string(inc.get("status") or "OPEN")
    source = _safe_string(inc.get("source") or "unknown")
    trace_id = _safe_string(inc.get("trace_id") or "")

    timeline = inc.get("timeline") or []
    # Timeline events should be small and ordered
    timeline_lines = []
    for e in timeline[:200]:
        ts = e.get("ts") or e.get("time") or ""
        etype = e.get("type") or "event"
        st = e.get("status") or ""
        msg = _safe_string(e.get("message") or e.get("summary") or "", 800)
        tid = _safe_string(e.get("trace_id") or "", 120)
        timeline_lines.append(f"- ts={ts} type={etype} status={st} trace_id={tid} msg={msg}")

    timeline_blob = "\n".join(timeline_lines) if timeline_lines else "(no timeline events yet)"

    return f"""
INCIDENT
- id: {inc.get("id")}
- severity: {severity}
- status: {status}
- source: {source}
- trace_id: {trace_id}
- summary: {summary}
- description: {description}

TIMELINE (ordered events)
{timeline_blob}
""".strip()


def _fallback_rca(inc: Dict[str, Any]) -> str:
    # Non-LLM fallback: still produces a useful structure
    summary = _safe_string(inc.get("summary") or "Incident")
    severity = _safe_string(inc.get("severity") or "P?")
    trace_id = _safe_string(inc.get("trace_id") or "")
    timeline = inc.get("timeline") or []

    first_ts = timeline[0].get("ts") if timeline else None
    last_ts = timeline[-1].get("ts") if timeline else None

    return f"""# RCA (Auto-generated)

## Summary
{summary}

## Severity
{severity}

## Trace
{trace_id if trace_id else "(none)"}

## Timeline
- start: {first_ts if first_ts else "(unknown)"}
- end: {last_ts if last_ts else "(unknown)"}
- events: {len(timeline)}

## Root Cause (Hypothesis)
Insufficient data to confidently identify root cause. Add more OTEL signals (span status, exception message, service.name, http.status_code) into the timeline.

## Fix / Mitigation
- Validate service health and rollback recent changes if applicable.
- Improve alert signal quality and attach key span attributes.

## Follow-ups
- Add correlation fields into OTEL ingest → incident timeline.
- Add dedupe policy on trace_id + service + fingerprint.
""".strip()


def _rca_prompt(incident_text: str) -> str:
    return f"""
You are an SRE/Platform Engineer writing a clear Root Cause Analysis (RCA) for managers and engineers.

Requirements:
- Use ONLY the incident and timeline details provided.
- If something is unknown, label it explicitly as "Unknown" and provide a reasonable hypothesis.
- Produce RCA in Markdown with these sections EXACTLY:
  1) Summary (2-3 lines)
  2) Impact (who/what affected, magnitude if known)
  3) Detection (how it was detected)
  4) Timeline (bulleted, chronological)
  5) Root Cause (1-2 paragraphs, include evidence from timeline)
  6) Contributing Factors (bullets)
  7) Mitigation / Resolution (what stopped the issue)
  8) Preventative Actions (owner-like action items, 5-8 bullets)

Keep it concise but complete.

INCIDENT INPUT:
{incident_text}
""".strip()


def _generate_rca_markdown(inc: Dict[str, Any]) -> str:
    if not _is_openai_provider():
        return _fallback_rca(inc)

    client = _openai_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.2"))

    incident_text = _format_incident_for_llm(inc)
    prompt = _rca_prompt(incident_text)

    try:
        resp = client.chat.completions.create(
            model=model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": "You generate high-quality incident RCAs."},
                {"role": "user", "content": prompt},
            ],
        )
        out = resp.choices[0].message.content or ""
        out = out.strip()
        if not out:
            return _fallback_rca(inc)
        return out
    except Exception:
        return _fallback_rca(inc)


# -----------------------------
# API
# -----------------------------

@router.post("/api/incidents/{incident_id}/rca", response_model=RCAResponse)
async def generate_rca(incident_id: str, req: RCARequest):
    inc = _find_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    # If already generated and not forcing regeneration
    if (not req.force_regenerate) and inc.get("rca_markdown"):
        return RCAResponse(
            incident_id=incident_id,
            generated_at=float(inc.get("rca_generated_at") or time.time()),
            rca_markdown=str(inc.get("rca_markdown")),
        )

    rca_md = _generate_rca_markdown(inc)

    # Persist back into incident object (in-memory store in your current implementation)
    inc["rca_markdown"] = rca_md
    inc["rca_generated_at"] = time.time()

    if req.post_to_slack:
        # Reuse your slack notifier; keep message short
        try:
            notify_slack_incident({
                **inc,
                "summary": f"📄 RCA generated for incident {incident_id}",
                "description": rca_md[:3000],  # avoid huge Slack payloads
            })
        except Exception:
            pass

    return RCAResponse(
        incident_id=incident_id,
        generated_at=float(inc["rca_generated_at"]),
        rca_markdown=rca_md,
    )

