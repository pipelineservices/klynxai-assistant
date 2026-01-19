from pydantic import BaseModel
from typing import List


class MemoryMessage(BaseModel):
    role: str
    content: str


class ConversationMemory(BaseModel):
    thread_id: str
    messages: List[MemoryMessage] = []

