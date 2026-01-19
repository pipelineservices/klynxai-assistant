import os
import json
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import openai

router = APIRouter()

openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

# -------------------------
# Non-streaming (already works)
# -------------------------
@router.post("")
def chat(req: ChatRequest):
    resp = openai.ChatCompletion.create(
        model=MODEL,
        messages=[m.dict() for m in req.messages],
    )

    return {
        "reply": resp.choices[0].message.content,
        "actions": [],
        "request_id": resp.id,
    }

# -------------------------
# STREAMING ENDPOINT (FIX)
# -------------------------
@router.post("/stream")
def chat_stream(req: ChatRequest, request: Request):
    def event_generator():
        try:
            stream = openai.ChatCompletion.create(
                model=MODEL,
                messages=[m.dict() for m in req.messages],
                stream=True,
            )

            for chunk in stream:
                if request.client is None:
                    break

                delta = chunk["choices"][0]["delta"]
                content = delta.get("content")

                if content:
                    yield f"data: {content}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

