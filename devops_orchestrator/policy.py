from dataclasses import dataclass
from typing import List


LOW_RISK_KEYWORDS = ("lint", "format", "docs", "readme", "typo", "test")
HIGH_RISK_KEYWORDS = ("terraform", "helm", "kubernetes", "prod", "production", "iam", "security", "policy", "secrets")


@dataclass
class RiskAssessment:
    risk_level: str
    risk_score: int
    blast_radius: str
    change_types: List[str]
    decision_gate: str


def assess_risk(workflow: str, failure_step: str, logs_excerpt: str) -> RiskAssessment:
    text = " ".join([workflow or "", failure_step or "", logs_excerpt or ""]).lower()
    change_types: List[str] = []

    if any(word in text for word in HIGH_RISK_KEYWORDS):
        change_types.append("infra_or_security")
        return RiskAssessment(
            risk_level="HIGH",
            risk_score=85,
            blast_radius="prod",
            change_types=change_types,
            decision_gate="COMMANDER",
        )

    if any(word in text for word in LOW_RISK_KEYWORDS):
        change_types.append("tests_docs_format")
        return RiskAssessment(
            risk_level="LOW",
            risk_score=20,
            blast_radius="non-prod",
            change_types=change_types,
            decision_gate="ALLOW",
        )

    change_types.append("application_logic")
    return RiskAssessment(
        risk_level="MEDIUM",
        risk_score=55,
        blast_radius="non-prod",
        change_types=change_types,
        decision_gate="REVIEW",
    )
