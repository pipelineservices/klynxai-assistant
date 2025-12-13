from typing import Any, AsyncGenerator, Dict, List, Optional

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from services.llm_router import route_llm_stream

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    provider: str = Field(default="mock")
    messages: List[ChatMessage] = Field(default_factory=list)


@router.post("")
async def chat(req: ChatRequest):
    """
    Non-streaming endpoint.
    For now: returns a simple mock reply or a short OpenAI completion by consuming stream.
    """
    provider = (req.provider or "mock").lower().strip()
    messages = [m.model_dump() for m in req.messages]

    # Consume streaming generator to build the full text
    parts: List[str] = []
    async for token in route_llm_stream(provider=provider, messages=messages):
        parts.append(token)

    text = "".join(parts).strip()
    if not text:
        text = "(empty response)"

    return JSONResponse({"reply": text})


def _sse_format(data: str) -> str:
    # SSE requires "data: ...\n\n"
    # ensure no bare CRLF issues
    data = (data or "").replace("\r", "")
    return f"data: {data}\n\n"


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """
    Streaming SSE endpoint.
    Emits:
      data: <token>
      ...
      data: [DONE]
    """
    provider = (req.provider or "mock").lower().strip()
    messages = [m.model_dump() for m in req.messages]

    async def event_generator() -> AsyncGenerator[str, None]:
        async for token in route_llm_stream(provider=provider, messages=messages):
            yield _sse_format(token)
        yield _sse_format("[DONE]")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

