from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

class Incident(BaseModel):
    incident_id: str = Field(default_factory=lambda: f"INC-{uuid.uuid4().hex[:4].upper()}")
    severity: str = "SEV-3"
    summary: str = "Cloud / DevOps incident reported"
    probable_cause: List[str] = Field(default_factory=list)
    suggested_steps: List[str] = Field(default_factory=list)
    auto_fix_plan: List[str] = Field(default_factory=list)
    decision: str = "needs_more_info"  # apply_fix | dry_run_only | needs_more_info
    cloud_provider: str = "unknown"    # aws|azure|gcp|kubernetes|unknown
    region: Optional[str] = None
    resources: List[str] = Field(default_factory=list)
    raw_text: str = ""

class AutoFixResult(BaseModel):
    ok: bool
    dry_run: bool = True
    actions: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)

class OTelAlert(BaseModel):
    name: Optional[str] = None
    severity: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    labels: Dict[str, Any] = Field(default_factory=dict)
    annotations: Dict[str, Any] = Field(default_factory=dict)

class OTelPayload(BaseModel):
    alerts: List[OTelAlert] = Field(default_factory=list)
