from pydantic import BaseModel, Field
from typing import Literal

Role = Literal["system", "user", "assistant", "tool"]

class Message(BaseModel):
    role: Role
    content: str = Field(min_length=1)

