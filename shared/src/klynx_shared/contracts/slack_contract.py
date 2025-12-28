from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class SlackEvent(BaseModel):
    channel: str = Field(min_length=1)
    user: str = Field(min_length=1)
    text: str = Field(min_length=1)
    ts: Optional[str] = None
    raw: Optional[Dict[str, Any]] = None

