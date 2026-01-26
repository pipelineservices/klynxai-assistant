from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional
import uuid

from core import settings
from core.models import Product


@dataclass
class RetailDecision:
    id: str
    decision_type: str
    item_id: str
    item_title: str
    impact_value: float
    currency: str
    margin_risk: str
    policy_decision: str
    policy_reason: str
    approval_required: bool
    status: str
    risk_score: int
    created_at: str


_DECISIONS: Dict[str, RetailDecision] = {}
_AUDIT: List[dict] = []


def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _audit(event: str, decision: RetailDecision, metadata: Optional[dict] = None) -> None:
    _AUDIT.append(
        {
            "id": str(uuid.uuid4()),
            "event": event,
            "ts": _now(),
            "decision_id": decision.id,
            "decision_type": decision.decision_type,
            "metadata": metadata or {},
        }
    )


def list_decisions() -> List[RetailDecision]:
    return list(_DECISIONS.values())


def list_audit() -> List[dict]:
    return list(_AUDIT)


def _risk_score(impact_value: float, limit: float, margin_risk: str) -> int:
    ratio = impact_value / max(limit, 1.0)
    base = min(int(ratio * 60), 60)
    if margin_risk == "HIGH":
        base += 25
    elif margin_risk == "MEDIUM":
        base += 10
    return min(base + 15, 100)


def _margin_risk(impact_value: float, limit: float) -> str:
    ratio = impact_value / max(limit, 1.0)
    if ratio >= 1.2:
        return "HIGH"
    if ratio >= 0.7:
        return "MEDIUM"
    return "LOW"


def _policy_check(impact_value: float, limit: float, margin_risk: str) -> tuple[str, str]:
    if impact_value > limit * 2:
        return "DENY", "impact_exceeds_hard_limit"
    if impact_value > limit:
        return "REVIEW", "impact_exceeds_limit"
    if margin_risk == "HIGH":
        return "REVIEW", "margin_risk_high"
    return "ALLOW", "within_policy"


def create_decision(decision_type: str, item: Product, impact_value: float, limit: float) -> RetailDecision:
    margin_risk = _margin_risk(impact_value, limit)
    policy_decision, policy_reason = _policy_check(impact_value, limit, margin_risk)
    approval_required = impact_value > limit
    risk_score = _risk_score(impact_value, limit, margin_risk)
    status = "pending_approval" if approval_required else "policy_review"
    if policy_decision == "DENY":
        status = "blocked_by_policy"
    elif policy_decision == "ALLOW" and not approval_required:
        status = "auto_ready"

    decision = RetailDecision(
        id=str(uuid.uuid4()),
        decision_type=decision_type,
        item_id=item.id,
        item_title=item.title,
        impact_value=round(impact_value, 2),
        currency=item.currency or "USD",
        margin_risk=margin_risk,
        policy_decision=policy_decision,
        policy_reason=policy_reason,
        approval_required=approval_required,
        status=status,
        risk_score=risk_score,
        created_at=_now(),
    )
    _DECISIONS[decision.id] = decision
    _audit("decision.created", decision, {"policy_decision": policy_decision, "policy_reason": policy_reason})
    _audit("policy.checked", decision, {"limit": limit, "margin_risk": margin_risk})
    return decision


def mark_submitted(decision_ids: List[str]) -> List[RetailDecision]:
    updated: List[RetailDecision] = []
    for decision_id in decision_ids:
        decision = _DECISIONS.get(decision_id)
        if not decision:
            continue
        if decision.status == "pending_approval":
            updated.append(decision)
            _audit("decision.submitted", decision, {"approval_required": True})
        else:
            _audit("decision.submitted", decision, {"approval_required": decision.approval_required})
    return updated


def approval_required_limit(decision_type: str) -> float:
    if decision_type == "price_change":
        return settings.PRICE_CHANGE_LIMIT
    if decision_type == "promotion_approval":
        return settings.PROMO_APPROVAL_LIMIT
    return settings.REORDER_LIMIT


def build_recommendations(items: List[Product]) -> List[RetailDecision]:
    decisions: List[RetailDecision] = []
    for idx, item in enumerate(items[:3]):
        if idx == 0:
            decision_type = "price_change"
            impact = abs(item.price * 0.15 * 20)
        elif idx == 1:
            decision_type = "promotion_approval"
            impact = abs(item.price * 0.2 * 60)
        else:
            decision_type = "inventory_reorder"
            impact = abs(item.price * 12)
        limit = approval_required_limit(decision_type)
        decisions.append(create_decision(decision_type, item, impact, limit))
    return decisions


def governance_banner(decisions: List[RetailDecision]) -> dict:
    approvals = len([d for d in decisions if d.approval_required])
    blocked = len([d for d in decisions if d.status == "blocked_by_policy"])
    max_risk = max([d.risk_score for d in decisions], default=0)
    risk_level = "LOW"
    if max_risk >= 80:
        risk_level = "HIGH"
    elif max_risk >= 50:
        risk_level = "MEDIUM"
    return {
        "policy": "retail_governance_thresholds",
        "risk_level": risk_level,
        "approval_required": approvals,
        "blocked": blocked,
        "max_risk_score": max_risk,
    }
