from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List
import os
import uuid

from openai import OpenAI

# memory
from core.memory.store import load_memory, append_memory

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    actions: list
    request_id: str


# -----------------------------
# Normal Chat (non-stream)
# -----------------------------
@router.post("/api/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    x_api_key: str | None = Header(default=None),
    x_thread_id: str | None = Header(default=None),
):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

    thread_id = x_thread_id or "default"

    # load memory
    memory = load_memory(thread_id)

    # build messages
    messages = []
    for m in memory:
        messages.append({"role": m["role"], "content": m["content"]})

    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    completion = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=messages,
        temperature=0.3,
    )

    reply = completion.choices[0].message.content

    # persist memory
    for m in req.messages:
        append_memory(thread_id, m.role, m.content)

    append_memory(thread_id, "assistant", reply)

    return ChatResponse(
        reply=reply,
        actions=[],
        request_id=str(uuid.uuid4())
    )


# -------------------------------------------------------
# STREAMING (SSE) — safe, chunked, grouped
# -------------------------------------------------------

from fastapi.responses import StreamingResponse
import asyncio


@router.post("/api/chat/stream")
async def chat_stream(
    req: ChatRequest,
    x_thread_id: str | None = Header(default=None),
):
    thread_id = x_thread_id or "default"

    memory = load_memory(thread_id)

    messages = []
    for m in memory:
        messages.append({"role": m["role"], "content": m["content"]})

    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    async def event_stream():
        buffer = ""

        stream = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            stream=True,
        )

        full_reply = ""

        for chunk in stream:
            delta = chunk.choices[0].delta.get("content")
            if not delta:
                continue

            buffer += delta
            full_reply += delta

            # flush clean chunks
            if any(buffer.endswith(x) for x in [" ", "\n", ".", ",", "!", "?", ":"]):
                yield f"data: {buffer}\n\n"
                buffer = ""

        if buffer:
            yield f"data: {buffer}\n\n"

        yield "data: [DONE]\n\n"

        # persist memory
        for m in req.messages:
            append_memory(thread_id, m.role, m.content)

        append_memory(thread_id, "assistant", full_reply)

    return StreamingResponse(event_stream(), media_type="text/event-stream")

