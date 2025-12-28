from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from klynx_shared.enums.severity import Severity
from klynx_shared.enums.source import EventSource

class TelemetryEvent(BaseModel):
    source: EventSource = EventSource.OTEL
    name: str = Field(min_length=1)
    severity: Severity = Severity.MEDIUM
    attributes: Dict[str, Any] = Field(default_factory=dict)
    message: Optional[str] = None

