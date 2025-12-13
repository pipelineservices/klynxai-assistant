from __future__ import annotations

import os
import json
import re
from typing import List, Optional
from models import Incident

try:
    from openai import OpenAI  # type: ignore
    _openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except Exception:
    _openai_client = None

_REGION_CANDIDATES = ["us-east-1","us-west-2","eu-west-1","ap-south-1","westeurope","eastus","centralus","us-central1"]

def _decide(incident: Incident) -> str:
    if not incident.raw_text or incident.raw_text.strip() in ("<@U0A2NUD5JNP>", "<@"):
        return "needs_more_info"
    if incident.severity in ("SEV-1","SEV-2") and incident.auto_fix_plan:
        return "dry_run_only"
    if incident.auto_fix_plan and incident.cloud_provider == "aws":
        return "dry_run_only"
    return "needs_more_info"

def _llm_analyze_issue(message_text: str) -> Incident:
    if _openai_client is None:
        raise RuntimeError("OpenAI client not available")

    model = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")

    system_prompt = (
        "You are a senior cloud SRE (AWS/Azure/GCP/Kubernetes). "
        "Given a message describing an incident, return ONLY valid JSON with keys: "
        "severity, summary, probable_cause, suggested_steps, auto_fix_plan, cloud_provider, region, resources. "
        "severity must be one of SEV-1..SEV-5. "
        "cloud_provider must be aws|azure|gcp|kubernetes|unknown. "
        "resources is a list of ids/names. Do not include any extra text."
    )

    resp = _openai_client.chat.completions.create(
        model=model,
        messages=[
            {"role":"system","content":system_prompt},
            {"role":"user","content":message_text},
        ],
        temperature=0.2,
    )
    content = resp.choices[0].message.content.strip()
    data = json.loads(content)

    inc = Incident(
        severity=data.get("severity","SEV-3"),
        summary=data.get("summary","Cloud / DevOps incident reported"),
        probable_cause=list(data.get("probable_cause",[]) or []),
        suggested_steps=list(data.get("suggested_steps",[]) or []),
        auto_fix_plan=list(data.get("auto_fix_plan",[]) or []),
        cloud_provider=data.get("cloud_provider","unknown"),
        region=data.get("region"),
        resources=list(data.get("resources",[]) or []),
        raw_text=message_text,
    )
    inc.decision = _decide(inc)
    return inc

def _heuristic_analyze_issue(message_text: str) -> Incident:
    text_lower = (message_text or "").lower()
    probable_cause: List[str] = []
    steps: List[str] = []
    fix_plan: List[str] = []
    severity = "SEV-3"
    summary = "Cloud / DevOps incident reported"
    region: Optional[str] = None
    resources: List[str] = []
    cloud_provider = "unknown"

    for r in _REGION_CANDIDATES:
        if r in text_lower:
            region = r
            break

    if any(k in text_lower for k in ["aws","ec2","lambda","vpc","route 53","alb","cloudwatch","rds","eks"]):
        cloud_provider = "aws"
    elif any(k in text_lower for k in ["azure","app service","aks","resource group","eastus","westeurope"]):
        cloud_provider = "azure"
    elif any(k in text_lower for k in ["gcp","gke","cloud run","us-central1","projects/"]):
        cloud_provider = "gcp"
    elif any(k in text_lower for k in ["kubernetes","k8s","pod","deployment","node not ready"]):
        cloud_provider = "kubernetes"

    for pat in [r"(vpc-[0-9a-f]+)", r"(eni-[0-9a-f]+)", r"(i-[0-9a-f]+)", r"(sg-[0-9a-f]+)", r"(subnet-[0-9a-f]+)"]:
        for m in re.findall(pat, message_text or "", flags=re.IGNORECASE):
            resources.append(m)

    if "unable to delete vpc" in text_lower or "unable to remove vpc" in text_lower:
        summary = "Unable to delete VPC"
        severity = "SEV-3"
        cloud_provider = "aws"
        probable_cause = [
            "VPC still has dependent resources (subnets, ENIs, NAT gateways, IGW, route tables, SGs, endpoints)",
            "ENIs are still attached to services (Lambda, EKS, ALB, RDS, etc.)",
        ]
        steps = [
            "List and delete subnets; detach and delete IGW; delete NAT gateways; remove VPC endpoints.",
            "Find and delete/detach ENIs and security groups that reference the VPC.",
            "Retry VPC deletion after dependencies are removed.",
        ]
        fix_plan = [
            "Enumerate dependent resources (subnets, NAT, IGW, endpoints, ENIs).",
            "Safely detach/delete unused dependents.",
            "Re-attempt VPC deletion.",
        ]

    elif "insufficient subnets" in text_lower and "lambda" in text_lower:
        summary = "Lambda deployment failing: insufficient subnets"
        severity = "SEV-2"
        cloud_provider = "aws"
        probable_cause = [
            "Lambda is configured for VPC but selected subnets are invalid/exhausted",
            "Subnets have no free IPs or are not in distinct AZs",
        ]
        steps = [
            "Check Lambda VPC config (subnets/security groups).",
            "Select >=2 subnets across different AZs with free IP capacity.",
            "Redeploy/update stack.",
        ]
        fix_plan = [
            "Validate subnet health and IP availability.",
            "Update Lambda config to use healthy subnets in >=2 AZs.",
        ]

    elif "503" in text_lower or "504" in text_lower or "bad gateway" in text_lower:
        summary = "ALB / upstream 5xx errors observed"
        severity = "SEV-2"
        cloud_provider = "aws"
        probable_cause = [
            "Targets unhealthy or failing health checks",
            "Upstream timeouts / saturation / dependency failures",
        ]
        steps = [
            "Check ALB target group health; verify health check path/port/timeouts.",
            "Review app logs and downstream dependencies (DB, cache, external APIs).",
            "Check scaling and CPU/memory saturation.",
        ]
        fix_plan = [
            "If safe: increase target group timeout and/or scale service.",
            "Recycle unhealthy targets after confirming deploy stability.",
        ]

    else:
        if not (message_text or "").strip() or re.fullmatch(r"<@[^>]+>", (message_text or "").strip()):
            summary = "No issue described in the message."
            severity = "SEV-5"
            probable_cause = ["No information provided"]
            steps = ["Ask the user to share the error text/log snippet or screenshot."]
            fix_plan = ["No action until more information is provided."]
        else:
            probable_cause = ["Underlying service may be unhealthy or missing required dependencies."]
            steps = [
                "Identify the primary component and timeframe.",
                "Check recent deployments/config changes.",
                "Review logs/metrics around the incident.",
            ]
            fix_plan = ["Collect evidence; propose a safe rollback/fix; validate in lower env first."]

    inc = Incident(
        severity=severity,
        summary=summary,
        probable_cause=probable_cause,
        suggested_steps=steps,
        auto_fix_plan=fix_plan,
        cloud_provider=cloud_provider,
        region=region,
        resources=resources,
        raw_text=message_text or "",
    )
    inc.decision = _decide(inc)
    return inc

def analyze_cloud_issue(message_text: str) -> Incident:
    try:
        return _llm_analyze_issue(message_text)
    except Exception:
        return _heuristic_analyze_issue(message_text)

def format_incident_for_slack(incident: Incident) -> str:
    cause_lines = "\n".join(f"- {c}" for c in (incident.probable_cause or ["N/A"]))
    steps_lines = "\n".join(f"- {s}" for s in (incident.suggested_steps or ["N/A"]))
    fix_lines = "\n".join(f"- {f}" for f in (incident.auto_fix_plan or ["N/A"]))
    resources_txt = ", ".join(incident.resources) if incident.resources else "N/A"
    region_txt = incident.region or "N/A"
    cloud_txt = incident.cloud_provider or "unknown"

    return (
        f"*Incident ID:* `{incident.incident_id}`\n"
        f"*Severity:* `{incident.severity}`\n"
        f"*Summary:* {incident.summary}\n"
        f"*Cloud:* `{cloud_txt}`\n"
        f"*Region:* `{region_txt}`\n"
        f"*Resources:* {resources_txt}\n\n"
        f"*Probable cause:*\n{cause_lines}\n\n"
        f"*Suggested next steps:*\n{steps_lines}\n\n"
        f"*Auto-fix plan (dry-run, cloud-safe):*\n{fix_lines}\n"
    )
