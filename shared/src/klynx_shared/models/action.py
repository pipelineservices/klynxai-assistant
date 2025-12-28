from pydantic import BaseModel, Field
from typing import Literal, Optional, Dict, Any

ActionType = Literal["apply_autofix", "skip", "open_incident"]

class Action(BaseModel):
    type: ActionType
    title: str = Field(min_length=1)
    payload: Optional[Dict[str, Any]] = None

