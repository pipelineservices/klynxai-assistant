import os
import re
import json
import uuid
from typing import Any, Dict, List, Tuple

DEFAULT_DRY_RUN = os.getenv("KLYNX_DRY_RUN_DEFAULT", "true").lower() in ("1", "true", "yes")

def _guess_cloud(text: str) -> str:
    t = text.lower()
    if any(x in t for x in ["aws", "ec2", "iam", "vpc", "alb", "route53", "cloudwatch", "lambda"]):
        return "aws"
    if any(x in t for x in ["azure", "aks", "entra", "aad", "arm", "resource group"]):
        return "azure"
    if any(x in t for x in ["gcp", "gke", "cloud run", "cloud sql", "vpc network"]):
        return "gcp"
    return "unknown"

def _guess_severity(text: str) -> str:
    t = text.lower()
    if any(x in t for x in ["outage", "down", "sev1", "sev-1", "p0", "major incident"]):
        return "SEV-1"
    if any(x in t for x in ["sev2", "sev-2", "p1", "degraded", "latency high", "errors spike"]):
        return "SEV-2"
    if any(x in t for x in ["sev3", "sev-3", "p2", "intermittent"]):
        return "SEV-3"
    return "SEV-4"

def _extract_region(text: str) -> str:
    m = re.search(r"\b(us|eu|ap|sa|ca|me|af)-[a-z]+-\d\b", text.lower())
    return m.group(0) if m else "unknown"

def _normalize_summary(text: str) -> str:
    # Remove bot mention if present
    t = re.sub(r"<@[^>]+>", "", text).strip()
    # Keep it short
    return (t[:140] + "…") if len(t) > 140 else t

def generate_incident_id() -> str:
    return "INC-" + uuid.uuid4().hex[:4].upper() + uuid.uuid4().hex[4:8].upper()

# ---- Plan templates ----

def _plan_vpc_privatelink_cidr_missing(cloud: str) -> Tuple[str, str, List[Dict[str, Any]]]:
    probable = "PrivateLink CIDR missing or incorrect."
    analysis = (
        "VPC creation/PrivateLink setup often fails when the required PrivateLink CIDR is not configured, "
        "overlaps with existing ranges, or the org/account policy restricts allowed CIDRs."
    )
    steps = [
        {
            "id": "s1",
            "title": "Collect context",
            "risk": "none",
            "dry_run_cmd": "echo 'Gather: account, region, VPC module inputs, requested CIDR, org policy constraints'",
            "apply_cmd": None,
        },
        {
            "id": "s2",
            "title": "Validate CIDR availability",
            "risk": "low",
            "dry_run_cmd": "echo 'Check overlaps: existing VPC CIDRs, subnet CIDRs, IPAM pools (if any)'",
            "apply_cmd": None,
        },
        {
            "id": "s3",
            "title": "Propose safe CIDR",
            "risk": "low",
            "dry_run_cmd": "echo 'Suggest non-overlapping /24 or /22 from approved ranges'",
            "apply_cmd": None,
        },
        {
            "id": "s4",
            "title": "Apply fix (requires approval)",
            "risk": "medium",
            "dry_run_cmd": "echo 'Would update IaC variables / parameters with approved PrivateLink CIDR and re-run pipeline'",
            "apply_cmd": "echo 'APPLY: update IaC vars and re-run pipeline (placeholder)'",
        },
    ]
    return probable, analysis, steps

def _default_plan(text: str) -> Tuple[str, str, List[Dict[str, Any]]]:
    probable = "Insufficient details to propose a safe fix."
    analysis = "Need error message, cloud, region, affected service, and a screenshot/log snippet to propose a cloud-safe remediation."
    steps = [
        {
            "id": "s1",
            "title": "Request details",
            "risk": "none",
            "dry_run_cmd": "echo 'Ask: exact error, cloud, region, service, timeline, recent changes'",
            "apply_cmd": None,
        }
    ]
    return probable, analysis, steps

def build_plan(text: str, cloud: str = "unknown") -> Dict[str, Any]:
    cloud_guess = cloud if cloud and cloud != "unknown" else _guess_cloud(text)
    region = _extract_region(text)
    sev = _guess_severity(text)
    summary = _normalize_summary(text)

    t = text.lower()
    if "privatelink" in t and "cidr" in t:
        probable, analysis, steps = _plan_vpc_privatelink_cidr_missing(cloud_guess)
    else:
        probable, analysis, steps = _default_plan(text)

    return {
        "meta": {
            "cloud": cloud_guess.upper() if cloud_guess != "unknown" else "unknown",
            "region": region,
            "severity": sev,
            "summary": summary,
            "dry_run_default": DEFAULT_DRY_RUN,
        },
        "probable_cause": probable,
        "analysis_text": analysis,
        "steps": steps,
    }

def execute_plan(plan: Dict[str, Any], *, dry_run: bool = True) -> Dict[str, Any]:
    """
    For now this executes only placeholder commands (echo).
    In real deployment, swap apply_cmd with AWS CLI / Terraform / Runbook calls guarded by allow-lists.
    """
    results = []
    for s in plan.get("steps", []):
        cmd = s.get("dry_run_cmd") if dry_run else (s.get("apply_cmd") or s.get("dry_run_cmd"))
        status = "skipped" if (not cmd) else "ok"
        results.append(
            {
                "step_id": s.get("id"),
                "title": s.get("title"),
                "risk": s.get("risk", "unknown"),
                "mode": "dry_run" if dry_run else "apply",
                "status": status,
                "command": cmd,
                "output": "placeholder-execution",
            }
        )
    return {
        "mode": "dry_run" if dry_run else "apply",
        "results": results,
    }

