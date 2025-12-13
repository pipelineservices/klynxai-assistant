import os
import json
import hmac
import hashlib
from typing import Any, Dict, Optional

from fastapi import APIRouter, Request, HTTPException
from slack_sdk import WebClient

from autofix_engine import build_plan, execute_plan, generate_incident_id
from history_repository import save_incident, get_incident_by_thread_ts, update_incident_status, update_incident_plan

slack_router = APIRouter(prefix="/api/slack")

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "")

client = WebClient(token=SLACK_BOT_TOKEN) if SLACK_BOT_TOKEN else None

def _verify_slack_signature(request: Request, raw_body: bytes) -> None:
    """
    Optional but recommended. If you don't have signing secret set, it will skip verification.
    """
    if not SLACK_SIGNING_SECRET:
        return

    timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    sig = request.headers.get("X-Slack-Signature", "")
    if not timestamp or not sig:
        raise HTTPException(status_code=401, detail="Missing Slack signature headers")

    basestring = f"v0:{timestamp}:{raw_body.decode('utf-8')}"
    my_sig = "v0=" + hmac.new(
        SLACK_SIGNING_SECRET.encode("utf-8"),
        basestring.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(my_sig, sig):
        raise HTTPException(status_code=401, detail="Invalid Slack signature")

def _blocks_for_plan(incident_id: str, plan: Dict[str, Any]) -> list:
    meta = plan.get("meta", {})
    cloud = meta.get("cloud", "unknown")
    severity = meta.get("severity", "SEV-4")
    region = meta.get("region", "unknown")
    summary = meta.get("summary", "")

    probable = plan.get("probable_cause", "unknown")
    steps = plan.get("steps", [])

    step_lines = []
    for s in steps[:4]:
        step_lines.append(f"• *{s.get('title')}* _(risk: {s.get('risk','unknown')})_")
    step_text = "\n".join(step_lines) if step_lines else "• (no steps)"

    return [
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Incident ID:* `{incident_id}`\n*Severity:* `{severity}`\n*Cloud:* `{cloud}`\n*Region:* `{region}`"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Summary:*\n{summary}"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Probable Cause:*\n{probable}"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Auto-fix plan (dry-run, cloud-safe):*\n{step_text}"}},
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "style": "primary",
                    "text": {"type": "plain_text", "text": "Apply Auto-Fix"},
                    "action_id": "apply_fix",
                    "value": incident_id,
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Skip"},
                    "action_id": "skip_fix",
                    "value": incident_id,
                },
            ],
        },
    ]

@slack_router.post("/events")
async def slack_events(request: Request):
    raw = await request.body()
    _verify_slack_signature(request, raw)

    payload = json.loads(raw.decode("utf-8"))

    # URL verification challenge
    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    if payload.get("type") != "event_callback":
        return {"ok": True}

    event = payload.get("event", {})

    # Ignore bot messages to avoid loops
    if event.get("subtype") == "bot_message" or event.get("bot_id"):
        return {"ok": True}

    # We respond to app mentions and also plain messages if you route them to the app
    text = event.get("text", "") or ""
    channel = event.get("channel", "")
    thread_ts = event.get("thread_ts") or event.get("ts")  # respond in thread

    if not client:
        raise HTTPException(status_code=500, detail="SLACK_BOT_TOKEN missing")

    incident_id = generate_incident_id()
    plan = build_plan(text=text, cloud="unknown")

    meta = plan.get("meta", {})
    severity = meta.get("severity", "SEV-4")
    summary = meta.get("summary", text)
    cloud = meta.get("cloud", "unknown")
    region = meta.get("region", "unknown")

    # Save to DB
    save_incident(
        incident_id=incident_id,
        thread_ts=thread_ts,
        channel_id=channel,
        severity=severity,
        summary=summary,
        cloud=cloud if isinstance(cloud, str) else "unknown",
        region=region if isinstance(region, str) else "unknown",
        resources="N/A",
        probable_cause=plan.get("probable_cause", ""),
        analysis_text=plan.get("analysis_text", ""),
        plan=plan,
        status="open",
    )

    blocks = _blocks_for_plan(incident_id, plan)

    # Slack best practice: always include top-level text
    client.chat_postMessage(
        channel=channel,
        thread_ts=thread_ts,
        text=f"Incident {incident_id} detected. Severity {severity}.",
        blocks=blocks,
    )

    return {"ok": True}

@slack_router.post("/actions")
async def slack_actions(request: Request):
    raw = await request.body()
    # Slack actions are form-encoded; signature verify should use the raw bytes too
    _verify_slack_signature(request, raw)

    form = await request.form()
    payload = json.loads(form.get("payload", "{}"))

    action = payload["actions"][0]["action_id"]
    user = payload.get("user", {}).get("username", "unknown")
    message = payload.get("message", {})
    channel = payload.get("channel", {}).get("id", "")
    thread_ts = message.get("thread_ts") or message.get("ts")

    inc = get_incident_by_thread_ts(thread_ts)
    if not inc:
        return {"text": "⚠️ Incident not found in DB for this thread."}

    plan = inc.get("plan", {}) or {}

    if action == "skip_fix":
        update_incident_status(thread_ts, "skipped")
        return {"text": f"⏭ Auto-fix skipped by *{user}*."}

    if action == "apply_fix":
        # Execute in DRY-RUN first (safe). You can flip to apply later.
        update_incident_status(thread_ts, "fix_running")
        results = execute_plan(plan, dry_run=True)

        # Save executed results into plan for UI later
        plan["execution"] = results
        update_incident_plan(thread_ts, plan)
        update_incident_status(thread_ts, "fix_dry_run_complete")

        # Post execution summary in thread
        lines = []
        for r in results.get("results", [])[:6]:
            lines.append(f"• {r['title']} — `{r['status']}` ({r['mode']})")
        msg = "\n".join(lines) if lines else "No steps executed."

        if client and channel and thread_ts:
            client.chat_postMessage(
                channel=channel,
                thread_ts=thread_ts,
                text=f"✅ Auto-fix dry-run approved by {user}.",
                blocks=[
                    {"type": "section", "text": {"type": "mrkdwn", "text": f"*Dry-run results (approved by {user}):*\n{msg}"}},
                    {"type": "section", "text": {"type": "mrkdwn", "text": "_To enable real apply mode, wire apply_cmd to your runbooks and set KLYNX_DRY_RUN_DEFAULT=false._"}},
                ],
            )

        return {"text": f"✅ Dry-run executed (approved by {user}). Check thread for details."}

    return {"text": "Unknown action."}

