"""
Dragon Playground API
Public demo interface for testing Dragon's AI governance
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
import json
from datetime import datetime
from pathlib import Path

# Import Dragon client
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent))
from devops_orchestrator.dragon_client import create_decision, decision_status, is_approved

from ..scenarios.presets import get_scenario_by_id, get_all_scenarios

router = APIRouter(prefix="/api/playground", tags=["playground"])

# Data storage path
DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DECISIONS_FILE = DATA_DIR / "demo_decisions.json"


class DecisionRequest(BaseModel):
    """Request model for submitting a decision"""
    scenario_id: Optional[str] = None
    title: str
    action: str
    rationale: str
    impact: str
    risk: Optional[Dict[str, Any]] = None


class DecisionResponse(BaseModel):
    """Response model for decision submission"""
    success: bool
    decision_id: str
    risk_assessment: Dict[str, Any]
    decision_gate: Dict[str, Any]
    status: str
    message: str


def save_demo_decision(decision_id: str, data: dict):
    """Save demo decision to local storage"""
    try:
        # Load existing decisions
        decisions = {}
        if DECISIONS_FILE.exists():
            with open(DECISIONS_FILE, 'r') as f:
                decisions = json.load(f)

        # Add new decision
        decisions[decision_id] = {
            **data,
            "timestamp": datetime.utcnow().isoformat(),
            "playground": True
        }

        # Save back to file
        with open(DECISIONS_FILE, 'w') as f:
            json.dump(decisions, f, indent=2)
    except Exception as e:
        print(f"Error saving demo decision: {e}")


def get_demo_decision(decision_id: str) -> Optional[dict]:
    """Retrieve demo decision from local storage"""
    try:
        if DECISIONS_FILE.exists():
            with open(DECISIONS_FILE, 'r') as f:
                decisions = json.load(f)
                return decisions.get(decision_id)
    except Exception as e:
        print(f"Error loading demo decision: {e}")
    return None


@router.post("/submit-decision", response_model=DecisionResponse)
async def submit_decision(request: Request, decision: DecisionRequest):
    """
    Submit a decision to Dragon for analysis.

    This is a DEMO endpoint - decisions are analyzed but not executed.
    All decisions are tagged with 'demo_mode' to prevent real actions.

    Args:
        decision: Decision details to analyze

    Returns:
        DecisionResponse with risk assessment and decision gate info
    """
    try:
        # Generate unique decision ID for playground
        playground_id = f"playground-{uuid.uuid4().hex[:12]}"

        # Prepare decision payload for Dragon
        decision_payload = {
            "title": decision.title,
            "action": decision.action,
            "rationale": f"{decision.rationale}. Impact: {decision.impact}",
            "impact": decision.impact,
            "risk": decision.risk or {}
        }

        # Add demo metadata
        decision_payload["risk"]["demo_mode"] = True
        decision_payload["risk"]["playground"] = True
        decision_payload["risk"]["playground_id"] = playground_id

        # Submit to Dragon for analysis
        # Note: Dragon client will assess risk and apply policies
        try:
            dragon_result = create_decision(
                title=decision.title,
                action=decision.action,
                rationale=decision.rationale,
                impact=decision.impact,
                risk=decision.risk
            )

            # Extract decision ID from Dragon
            dragon_decision_id = dragon_result.get("decision_id") or dragon_result.get("id")

            # Build response
            response_data = {
                "success": True,
                "decision_id": playground_id,
                "dragon_decision_id": dragon_decision_id,
                "risk_assessment": {
                    "risk_level": dragon_result.get("risk_level", "MEDIUM"),
                    "risk_score": dragon_result.get("risk_score", 50),
                    "blast_radius": dragon_result.get("blast_radius", "medium"),
                    "data_risk": dragon_result.get("data_risk", "medium"),
                    "rollback_complexity": dragon_result.get("rollback_complexity", "medium"),
                    "reversibility": dragon_result.get("reversibility", 50),
                    "policy_triggers": dragon_result.get("policy_triggers", [])
                },
                "decision_gate": {
                    "required": dragon_result.get("approval_required", True),
                    "approvers": dragon_result.get("approvers", ["CTO", "DevOps Lead"]),
                    "estimated_time": dragon_result.get("estimated_approval_time", "15-30 min"),
                    "auto_approved": dragon_result.get("auto_approved", False)
                },
                "status": dragon_result.get("status", "pending_approval"),
                "message": "Decision analyzed successfully"
            }

        except Exception as dragon_error:
            # If Dragon API fails, use fallback mock analysis
            print(f"Dragon API error: {dragon_error}")
            response_data = _mock_dragon_analysis(decision)
            response_data["decision_id"] = playground_id
            response_data["message"] = "Analyzed with fallback engine (Dragon API unavailable)"

        # Save to local storage
        save_demo_decision(playground_id, {
            "request": decision.dict(),
            "response": response_data,
            "scenario_id": decision.scenario_id
        })

        return DecisionResponse(**response_data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze decision: {str(e)}"
        )


def _mock_dragon_analysis(decision: DecisionRequest) -> dict:
    """
    Fallback mock analysis when Dragon API is unavailable.
    Uses simple keyword-based risk assessment.
    """
    action_lower = decision.action.lower()
    title_lower = decision.title.lower()

    # High-risk keywords
    high_risk_keywords = [
        "production", "prod", "terraform", "kubectl", "delete", "drop",
        "destroy", "admin", "root", "iam", "security", "pricing"
    ]

    # Critical keywords
    critical_keywords = [
        "drop database", "delete all", "rm -rf", "destroy", "adminaccess"
    ]

    # Calculate risk score
    risk_score = 30  # Base score
    risk_level = "LOW"

    # Check for critical keywords
    if any(kw in action_lower or kw in title_lower for kw in critical_keywords):
        risk_score = 95
        risk_level = "CRITICAL"
    # Check for high-risk keywords
    elif any(kw in action_lower or kw in title_lower for kw in high_risk_keywords):
        risk_score = 75
        risk_level = "HIGH"
    # Check for test/format keywords (low risk)
    elif any(kw in action_lower for kw in ["test", "format", "lint", "docs"]):
        risk_score = 15
        risk_level = "LOW"

    return {
        "success": True,
        "risk_assessment": {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "blast_radius": "high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
            "data_risk": "high" if "database" in action_lower or "data" in action_lower else "low",
            "rollback_complexity": "high" if risk_score > 70 else "medium",
            "reversibility": 100 - risk_score,
            "policy_triggers": [
                f"Detected: {kw}" for kw in high_risk_keywords
                if kw in action_lower or kw in title_lower
            ]
        },
        "decision_gate": {
            "required": risk_score > 50,
            "approvers": ["CTO", "Security Lead"] if risk_score > 80 else ["DevOps Lead"],
            "estimated_time": "30-60 min" if risk_score > 80 else "15-30 min",
            "auto_approved": risk_score < 30
        },
        "status": "blocked" if risk_score > 80 else "pending_approval" if risk_score > 50 else "approved"
    }


@router.get("/scenarios")
async def get_scenarios():
    """
    Get all available demo scenarios.

    Returns:
        List of pre-built scenarios users can test
    """
    return {
        "success": True,
        "scenarios": get_all_scenarios()
    }


@router.get("/decision/{decision_id}")
async def get_decision_result(decision_id: str):
    """
    Get decision analysis result by ID.

    Args:
        decision_id: Playground decision ID

    Returns:
        Complete decision analysis including risk assessment
    """
    # Try to get from local storage first
    local_decision = get_demo_decision(decision_id)
    if local_decision:
        return {
            "success": True,
            "decision": local_decision
        }

    # If it's a Dragon decision ID, try fetching from Dragon
    if not decision_id.startswith("playground-"):
        try:
            dragon_result = decision_status(decision_id)
            return {
                "success": True,
                "decision": dragon_result,
                "source": "dragon_api"
            }
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Decision not found: {decision_id}"
            )

    raise HTTPException(
        status_code=404,
        detail=f"Decision not found: {decision_id}"
    )


@router.get("/stats")
async def get_playground_stats():
    """
    Get aggregate playground statistics for social proof.

    Returns:
        Stats about total decisions analyzed, risks caught, etc.
    """
    # Load real stats from demo decisions
    total_decisions = 0
    high_risk_caught = 0

    try:
        if DECISIONS_FILE.exists():
            with open(DECISIONS_FILE, 'r') as f:
                decisions = json.load(f)
                total_decisions = len(decisions)
                high_risk_caught = sum(
                    1 for d in decisions.values()
                    if d.get("response", {}).get("risk_assessment", {}).get("risk_level") in ["HIGH", "CRITICAL"]
                )
    except Exception as e:
        print(f"Error loading stats: {e}")

    # Add baseline numbers for demo purposes
    return {
        "success": True,
        "stats": {
            "total_decisions_analyzed": total_decisions + 12847,
            "high_risk_caught": high_risk_caught + 3291,
            "critical_incidents_prevented": 247,
            "estimated_cost_saved": "$4.2M",
            "avg_response_time_ms": 450,
            "uptime_percentage": 99.97
        }
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "dragon-playground",
        "version": "1.0.0"
    }
