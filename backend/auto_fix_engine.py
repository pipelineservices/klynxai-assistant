from __future__ import annotations
import os
from models import Incident, AutoFixResult

def _aws_fix_plan(incident: Incident, dry_run: bool = True) -> AutoFixResult:
    result = AutoFixResult(ok=True, dry_run=dry_run, actions=[], errors=[], notes=[])

    try:
        import boto3  # type: ignore
    except Exception as e:
        result.ok = False
        result.errors.append(f"boto3 not available: {e}")
        result.notes.append("Install boto3 in the service venv or run in dry_run mode only.")
        return result

    region = incident.region or os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1"
    text = (incident.raw_text or "").lower()

    if "alb" in text or "target group" in text or "503" in text or "504" in text or "bad gateway" in text:
        result.actions.append(f"[dry_run={dry_run}] Check ALB target group health in {region}.")
        result.actions.append(f"[dry_run={dry_run}] Validate health check path/port/timeouts; scale service if saturated.")
        return result

    if "insufficient subnets" in text and "lambda" in text:
        result.actions.append(f"[dry_run={dry_run}] Validate Lambda VPC subnets have free IPs in {region}.")
        result.actions.append(f"[dry_run={dry_run}] Update Lambda config to use healthy subnets across 2+ AZs.")
        return result

    if "unable to delete vpc" in text or "unable to remove vpc" in text:
        result.actions.append(f"[dry_run={dry_run}] Enumerate VPC dependents (IGW/NAT/endpoints/ENIs) in {region}.")
        result.actions.append(f"[dry_run={dry_run}] Generate safe deletion order checklist; execute only with approval.")
        return result

    result.ok = False
    result.errors.append("No matching AWS auto-fix recipe for this incident yet.")
    return result

def run_auto_fix(incident: Incident, approve: bool, dry_run_default: bool = True) -> AutoFixResult:
    dry_run = True if (not approve) else dry_run_default
    provider = (incident.cloud_provider or "unknown").lower()

    if provider == "aws":
        return _aws_fix_plan(incident, dry_run=dry_run)

    return AutoFixResult(
        ok=False,
        dry_run=True,
        actions=[],
        errors=[f"Auto-fix not implemented for provider: {provider}"],
        notes=["Supported today: aws (safe plan). Azure/GCP coming next."],
    )
