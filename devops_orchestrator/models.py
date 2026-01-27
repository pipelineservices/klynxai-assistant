from typing import Optional, List
from pydantic import BaseModel, Field


class DecisionRequest(BaseModel):
    title: str
    rationale: str
    action: str
    impact: str


class DecisionGate(BaseModel):
    decision_id: str
    status: str
    approved: bool


class GenerateRequest(BaseModel):
    repo: str
    prompt: str
    language: Optional[str] = "python"


class GenerateResponse(BaseModel):
    draft_id: str
    summary: str
    files: List[str] = Field(default_factory=list)
    decision_gate: DecisionGate


class PullRequestRequest(BaseModel):
    repo: str
    branch: str
    title: str
    description: str
    draft_id: Optional[str] = None


class PullRequestResponse(BaseModel):
    pr_id: str
    status: str
    decision_gate: DecisionGate


class PipelineEvent(BaseModel):
    provider: str
    status: str
    project: str
    pipeline_id: Optional[str] = None
    url: Optional[str] = None
    logs: Optional[str] = None
    metrics: Optional[dict] = None


class ObservabilityEvent(BaseModel):
    source: str
    severity: str
    title: str
    description: Optional[str] = None
    metrics: Optional[dict] = None
    logs: Optional[str] = None


class IncidentResponse(BaseModel):
    incident_id: str
    status: str
