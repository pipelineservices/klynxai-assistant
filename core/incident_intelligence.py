from __future__ import annotations

from typing import Dict, Any, List

def analyze_text(text: str) -> Dict[str, Any]:
    """
    MUST NEVER THROW.
    Returns: {severity: P1..P4, actions: [...]}
    """
    try:
        t = (text or "").lower()
        actions: List[Dict[str, Any]] = []

        def add(title: str, name: str, risk: str = "low"):
            actions.append({"type": "task", "title": title, "name": name, "risk": risk})

        # Heuristics
        if "timeout" in t or "timed out" in t or "504" in t:
            add("Inspect upstream latency/timeouts", "check_upstream_latency", "medium")
            add("Review gateway/ALB timeouts", "check_gateway_timeouts", "medium")

        if "5xx" in t or "500" in t or "502" in t or "503" in t:
            add("Check service health + error spikes", "check_service_errors", "high")

        if "cpu" in t or "throttle" in t:
            add("Check CPU saturation / throttling", "check_cpu_throttle", "high")

        if "memory" in t or "oom" in t:
            add("Check memory pressure / OOM", "check_memory_oom", "high")

        if "bedrock" in t or "invoke" in t or "validationexception" in t or "malformed" in t:
            add("Inspect Bedrock request payload formatting", "fix_bedrock_payload", "low")
            add("Verify BEDROCK_MODEL_ID / region / IAM", "check_bedrock_env_and_iam", "low")

        # Severity scoring
        severity = "P4"
        if any(a.get("risk") == "high" for a in actions):
            severity = "P1"
        elif any(a.get("risk") == "medium" for a in actions):
            severity = "P2"
        elif actions:
            severity = "P3"

        return {"severity": severity, "actions": actions}
    except Exception:
        # Absolute safety net
        return {"severity": "P4", "actions": []}

