from pydantic import BaseModel, Field
from typing import List, Optional
from klynx_shared.models.message import Message
from klynx_shared.models.action import Action

class ChatRequest(BaseModel):
    messages: List[Message] = Field(min_length=1)
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    actions: List[Action] = Field(default_factory=list)

