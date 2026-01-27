from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from devops_orchestrator import settings
from devops_orchestrator import audit
from devops_orchestrator import dragon_client, incident_client, slack_client, vcs_client
from devops_orchestrator.models import (
    DecisionRequest,
    GenerateRequest,
    GenerateResponse,
    PullRequestRequest,
    PullRequestResponse,
    PipelineEvent,
    ObservabilityEvent,
)

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


def _gate_decision(title: str, action: str, rationale: str, impact: str) -> dict:
    audit.write_event("decision.requested", title, {"action": action})
    result = dragon_client.create_decision(title, action, rationale, impact)
    if not result.get("ok"):
        audit.write_event("decision.failed", title, {"status": result.get("status")})
        return {"decision_id": "unknown", "approved": False, "status": "error"}
    data = result.get("data", {})
    decision_id = data.get("id", "unknown")
    audit.write_event("decision.created", decision_id, {"action": action})
    return {"decision_id": decision_id, "approved": False, "status": "pending"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    gate = _gate_decision(
        title="Auto code generation",
        action="generate_code",
        rationale=req.prompt,
        impact=f"repo={req.repo}",
    )
    audit.write_event("code.generated", req.repo, {"draft_id": gate["decision_id"]})
    return GenerateResponse(
        draft_id=gate["decision_id"],
        summary="Draft generated. Pending approval.",
        files=[],
        decision_gate={"decision_id": gate["decision_id"], "approved": False, "status": gate["status"]},
    )


@app.post("/api/pr", response_model=PullRequestResponse)
def create_pr(req: PullRequestRequest):
    gate = _gate_decision(
        title="Auto PR creation",
        action="create_pull_request",
        rationale=req.description,
        impact=f"repo={req.repo}",
    )
    if gate["status"] != "pending":
        return PullRequestResponse(pr_id="blocked", status="pending_approval", decision_gate=gate)
    result = vcs_client.create_pr_draft(req.repo, req.branch, req.title, req.description)
    audit.write_event("pr.draft", req.repo, {"status": result.get("status"), "pr_id": result.get("pr_id")})
    return PullRequestResponse(
        pr_id=result.get("pr_id"),
        status=result.get("status"),
        decision_gate=gate,
    )


@app.post("/api/ci/event")
def ci_event(req: PipelineEvent):
    audit.write_event("ci.event", req.project, {"status": req.status, "provider": req.provider})
    if req.status.lower() != "failed":
        return {"status": "ok"}

    incident = incident_client.create_incident(
        title=f"{req.provider} pipeline failure",
        summary=req.project,
        metadata={"pipeline_id": req.pipeline_id, "url": req.url, "logs": req.logs, "metrics": req.metrics},
    )
    slack_client.post_message(
        text=f"CI/CD failure detected for {req.project}. Incident: {incident.get('data', {}).get('incident_id', 'pending')}"
    )
    audit.write_event("incident.created", req.project, {"incident": incident.get("data")})
    return {"status": "incident_created", "incident": incident.get("data")}


@app.post("/api/observability/alert")
def observability_alert(req: ObservabilityEvent):
    audit.write_event("observability.alert", req.title, {"source": req.source, "severity": req.severity})
    incident = incident_client.create_incident(
        title=f"{req.source} alert: {req.title}",
        summary=req.description or req.title,
        severity="SEV-2" if req.severity.lower() in ("high", "critical") else "SEV-3",
        metadata={"metrics": req.metrics, "logs": req.logs},
    )
    slack_client.post_message(
        text=f"Observability alert from {req.source}. Incident: {incident.get('data', {}).get('incident_id', 'pending')}"
    )
    audit.write_event("incident.created", req.title, {"incident": incident.get("data")})
    return {"status": "incident_created", "incident": incident.get("data")}


@app.post("/api/autofix/suggest")
def autofix_suggest(payload: dict):
    audit.write_event("autofix.suggested", payload.get("target", "unknown"), payload)
    return JSONResponse(
        {
            "status": "suggested",
            "note": "Autofix requires human confirmation.",
            "next": "POST /api/autofix/confirm with approval",
        }
    )


@app.post("/api/autofix/confirm")
def autofix_confirm(payload: dict):
    approved = payload.get("approved") is True
    if not approved:
        return JSONResponse({"status": "rejected", "detail": "explicit approval required"}, status_code=403)
    audit.write_event("autofix.confirmed", payload.get("target", "unknown"), payload)
    return {"status": "queued", "detail": "autofix queued after approval"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("devops_orchestrator.app:app", host=settings.HOST, port=settings.PORT, log_level="info")
