from datetime import datetime
from pydantic import BaseModel, Field
from klynx_shared.enums.source import EventSource


class Incident(BaseModel):
    id: str
    source: EventSource
    title: str
    description: str
    severity: str = Field(default="P3")
    created_at: datetime = Field(default_factory=datetime.utcnow)

