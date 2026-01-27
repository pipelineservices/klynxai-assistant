from __future__ import annotations

import hashlib
import hmac
import json
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from devops_orchestrator import settings
from devops_orchestrator import audit
from devops_orchestrator import dragon_client, incident_client, slack_client, vcs_client
from devops_orchestrator import github_client, idempotency, policy, rca
from devops_orchestrator.models import (
    GenerateRequest,
    GenerateResponse,
    PullRequestRequest,
    PullRequestResponse,
    PipelineEvent,
    ObservabilityEvent,
    ApprovalPayload,
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


def _gate_decision(title: str, action: str, rationale: str, impact: str, risk: dict | None = None) -> dict:
    audit.write_event("decision.requested", title, {"action": action, "risk": risk})
    result = dragon_client.create_decision(title, action, rationale, impact, risk=risk or {})
    if not result.get("ok"):
        audit.write_event("decision.failed", title, {"status": result.get("status")})
        return {"decision_id": "unknown", "approved": False, "status": "error"}
    data = result.get("data", {})
    decision_id = data.get("id", "unknown")
    audit.write_event("decision.created", decision_id, {"action": action})
    return {"decision_id": decision_id, "approved": False, "status": "pending"}


def _verify_github_signature(body: bytes, signature: Optional[str]) -> bool:
    if not settings.GITHUB_WEBHOOK_SECRET:
        return True
    if not signature:
        return False
    expected = "sha256=" + hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def _extract_failure_step(jobs_payload: Optional[dict]) -> str:
    if not jobs_payload:
        return "unknown"
    jobs = jobs_payload.get("jobs", [])
    for job in jobs:
        if job.get("conclusion") == "failure":
            steps = job.get("steps") or []
            for step in steps:
                if step.get("conclusion") == "failure":
                    return f"{job.get('name')} :: {step.get('name')}"
            return job.get("name") or "job_failed"
    return "unknown"


def _create_incident_from_run(payload: dict) -> dict:
    repo = payload["repository"]["full_name"]
    run = payload["workflow_run"]
    run_id = run["id"]
    run_url = run.get("html_url")
    workflow_name = run.get("name")
    logs_url = run.get("logs_url")

    jobs_payload = github_client.get_workflow_jobs(payload["repository"]["owner"]["login"], payload["repository"]["name"], run_id)
    failure_step = _extract_failure_step(jobs_payload)
    logs_excerpt = f"{workflow_name} failed at {failure_step}"

    assessment = policy.assess_risk(workflow_name or "", failure_step, logs_excerpt)
    rca_summary = rca.summarize_rca(logs_excerpt)
    audit.write_event("rca.generated", repo, {"summary": rca_summary})

    incident = incident_client.create_incident(
        title=f"CI/CD failure: {workflow_name}",
        summary=f"{repo} failed run {run_id}",
        severity="SEV-2",
        metadata={
            "repo": repo,
            "branch": run.get("head_branch"),
            "commit_sha": run.get("head_sha"),
            "workflow": workflow_name,
            "run_url": run_url,
            "failure_step": failure_step,
            "logs_excerpt": logs_excerpt,
            "rca_summary": rca_summary,
            "pr_url": "",
            "decision_id": "",
            "approval_id": "",
        },
    )

    incident_id = incident.get("data", {}).get("incident_id", "pending")
    decision = _gate_decision(
        title="apply_autofix",
        action="apply_autofix",
        rationale=rca_summary,
        impact=f"repo={repo} run={run_id}",
        risk={
            "risk_level": assessment.risk_level,
            "risk_score": assessment.risk_score,
            "blast_radius": assessment.blast_radius,
            "change_types": assessment.change_types,
            "decision_gate": assessment.decision_gate,
        },
    )

    incident_client.update_incident(
        incident_id,
        metadata={
            "decision_id": decision["decision_id"],
            "rca_summary": rca_summary,
            "logs_excerpt": logs_excerpt,
        },
    )

    slack_client.post_approval_request(
        incident_id=incident_id,
        decision_id=decision["decision_id"],
        summary=f"{repo} workflow {workflow_name} failed",
        run_url=run_url or "",
    )
    audit.write_event("slack.approval_requested", repo, {"incident_id": incident_id})

    state_key = f"gh:workflow_run:{run_id}"
    idempotency.update(
        state_key,
        {
            "incident_id": incident_id,
            "decision_id": decision["decision_id"],
            "run_id": run_id,
            "repo": repo,
            "workflow": workflow_name,
            "logs_url": logs_url,
        },
    )
    idempotency.update(
        f"incident:{incident_id}",
        {
            "incident_id": incident_id,
            "decision_id": decision["decision_id"],
            "run_id": run_id,
            "repo": repo,
            "workflow": workflow_name,
            "logs_url": logs_url,
        },
    )
    audit.write_event(
        "cicd.failure",
        repo,
        {
            "run_id": run_id,
            "incident_id": incident_id,
            "decision_id": decision["decision_id"],
            "risk_level": assessment.risk_level,
        },
    )
    return {"incident_id": incident_id, "decision_id": decision["decision_id"], "risk": assessment}


def _open_autofix_pr(state: dict, approver: str, justification: str) -> dict:
    repo_full = state.get("repo", "")
    if "/" not in repo_full:
        return {"ok": False, "detail": "invalid_repo"}
    owner, repo = repo_full.split("/", 1)
    run_id = state.get("run_id")

    if settings.DRY_RUN:
        audit.write_event("autofix.dry_run", repo_full, {"approver": approver})
        return {"ok": True, "pr_url": "dry-run", "status": "skipped"}

    repo_info = github_client.get_repo(owner, repo)
    if not repo_info:
        return {"ok": False, "detail": "repo_not_found"}
    base_ref = repo_info.get("default_branch", settings.GITHUB_DEFAULT_BRANCH)
    base_sha = github_client.get_branch_sha(owner, repo, base_ref)
    if not base_sha:
        return {"ok": False, "detail": "base_sha_not_found"}

    branch = f"fix/{state.get('incident_id', 'incident')}"
    created = github_client.create_branch(owner, repo, base_sha, branch)
    if not created:
        return {"ok": False, "detail": "branch_create_failed"}

    content = (
        "# KLYNX Autofix Draft\n\n"
        f"Incident: {state.get('incident_id')}\n"
        f"Decision: {state.get('decision_id')}\n"
        f"Approver: {approver}\n"
        f"Justification: {justification}\n"
    )
    file_path = f".klynx/autofix/{state.get('incident_id', 'incident')}.md"
    github_client.create_file(owner, repo, branch, file_path, content, "Add KLYNX autofix draft")

    pr_url = github_client.open_pull_request(
        owner,
        repo,
        branch,
        title=f"KLYNX autofix for {state.get('incident_id')}",
        body=f"Autofix draft for incident {state.get('incident_id')} (decision {state.get('decision_id')}).",
    )
    if pr_url:
        audit.write_event("autofix.pr_opened", repo_full, {"pr_url": pr_url})
    return {"ok": bool(pr_url), "pr_url": pr_url or ""}


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
        metadata={"pipeline_id": req.pipeline_id, "url": req.url, "logs_excerpt": req.logs, "metrics": req.metrics},
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
        metadata={"metrics": req.metrics, "logs_excerpt": req.logs},
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


@app.post("/webhooks/github")
async def github_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    event = request.headers.get("X-GitHub-Event")

    if not _verify_github_signature(body, signature):
        audit.write_event("github.webhook.rejected", "signature", {})
        return JSONResponse({"detail": "invalid_signature"}, status_code=401)

    payload = json.loads(body.decode("utf-8") or "{}")
    if event == "workflow_run":
        run = payload.get("workflow_run", {})
        if run.get("conclusion") != "failure":
            return {"status": "ignored"}
        run_id = run.get("id")
        state_key = f"gh:workflow_run:{run_id}"
        if not idempotency.set_once(state_key, {"received": True}):
            return {"status": "duplicate"}
        result = _create_incident_from_run(payload)
        return {"status": "incident_created", "data": result}

    if event == "check_suite":
        check = payload.get("check_suite", {})
        if check.get("conclusion") != "failure":
            return {"status": "ignored"}
        suite_id = check.get("id")
        state_key = f"gh:check_suite:{suite_id}"
        if not idempotency.set_once(state_key, {"received": True}):
            return {"status": "duplicate"}
        repo = payload["repository"]["full_name"]
        incident = incident_client.create_incident(
            title="Check suite failure",
            summary=repo,
            severity="SEV-2",
            metadata={
                "repo": repo,
                "branch": check.get("head_branch"),
                "commit_sha": check.get("head_sha"),
                "workflow": "check_suite",
                "run_url": check.get("url"),
                "failure_step": "check_suite",
                "logs_excerpt": "check_suite failure",
                "rca_summary": "RCA pending: check suite failure.",
            },
        )
        incident_id = incident.get("data", {}).get("incident_id", "pending")
        idempotency.update(f"incident:{incident_id}", {"incident_id": incident_id, "repo": repo})
        audit.write_event("cicd.failure", repo, {"incident": incident.get("data")})
        return {"status": "incident_created", "incident": incident.get("data")}

    return {"status": "ignored"}


@app.post("/api/approvals")
def approvals(payload: ApprovalPayload):
    audit.write_event("approval.received", payload.incident_id, {"decision": payload.decision_id})
    if not payload.approved:
        audit.write_event("approval.denied", payload.incident_id, {"decision": payload.decision_id})
        return {"status": "denied"}

    if not dragon_client.is_approved(payload.decision_id):
        return JSONResponse({"detail": "decision_not_approved"}, status_code=403)

    state_key = f"incident:{payload.incident_id}"
    state = idempotency.get(state_key) or {}
    if not state:
        return JSONResponse({"detail": "incident_state_missing"}, status_code=404)
    result = _open_autofix_pr(state, payload.approver, payload.justification or "")
    idempotency.update(state_key, {"pr_url": result.get("pr_url")})
    audit.write_event("autofix.executed", payload.incident_id, {"pr_url": result.get("pr_url")})
    return {"status": "executed", "pr_url": result.get("pr_url")}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("devops_orchestrator.app:app", host=settings.HOST, port=settings.PORT, log_level="info")
