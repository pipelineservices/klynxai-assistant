from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from services.llm_router import stream_openai, resolve_model
import json

router = APIRouter()

@router.post("/stream")
async def chat_stream(request: Request):
    payload = await request.json()
    messages = payload.get("messages", [])
    provider = payload.get("provider", "openai")

    tenant_id = request.state.tenant_id
    model = resolve_model(tenant_id)

    def event_stream():
        for token in stream_openai(messages, model):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

