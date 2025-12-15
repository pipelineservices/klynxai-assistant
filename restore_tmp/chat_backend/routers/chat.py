from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from providers.openai_client import OpenAIError, chat_completion

router = APIRouter()


# Chat 1 only guardrail:
# UI sends conversation_id as "chat1"/"chat2"/"chat3" (or "Chat 1" etc).
# We accept multiple spellings, but only allow OpenAI when it resolves to chat1.
def _is_chat1(conversation_id: Optional[str]) -> bool:
    if not conversation_id:
        return False
    v = conversation_id.strip().lower().replace(" ", "")
    return v in {"chat1", "1"}


class Msg(BaseModel):
    role: str = Field(..., examples=["user", "assistant", "system"])
    content: str


class ChatRequest(BaseModel):
    provider: str = Field("mock", examples=["mock", "openai"])
    conversation_id: Optional[str] = Field(default="chat1")
    messages: List[Msg]


class ChatResponse(BaseModel):
    reply: str
    provider: str
    conversation_id: Optional[str]


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    provider = (req.provider or "mock").strip().lower()
    conversation_id = req.conversation_id or "chat1"

    # Normalize to plain dict list for OpenAI
    msgs: List[Dict[str, str]] = [{"role": m.role, "content": m.content} for m in req.messages]

    if provider == "openai":
        # enforce Chat 1 only
        if not _is_chat1(conversation_id):
            raise HTTPException(
                status_code=403,
                detail="OpenAI is enabled for Chat 1 only. Use provider=mock for other chats.",
            )

        try:
            reply = chat_completion(msgs)
            return ChatResponse(reply=reply, provider="openai", conversation_id=conversation_id)
        except OpenAIError as e:
            # return 502 so UI can show a friendly message without crashing
            raise HTTPException(status_code=502, detail=f"OpenAI call failed: {str(e)}")

    # Default mock provider (always available)
    return ChatResponse(reply="Mock response", provider="mock", conversation_id=conversation_id)

