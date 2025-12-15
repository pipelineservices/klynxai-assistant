import os
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ✅ THIS is what your service is missing:
app = FastAPI(title="KLYNX Chat Backend")


# Optional: allow browser/Next proxy calls safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    provider: Optional[str] = "openai"
    conversation_id: Optional[str] = None
    messages: List[Message]


class ChatResponse(BaseModel):
    reply: str


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Simple mock mode
    if (req.provider or "").lower() == "mock":
        last = req.messages[-1].content if req.messages else ""
        return ChatResponse(reply=f"(mock) You said: {last}")

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_APIKEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY not set in /etc/klynx/chat-backend.env",
        )

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    payload = {
        "model": model,
        "messages": [m.model_dump() for m in req.messages],
        "temperature": 0.2,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        if r.status_code >= 400:
            raise HTTPException(status_code=500, detail=f"OpenAI error: {r.text}")

        data = r.json()
        reply = data["choices"][0]["message"]["content"]
        return ChatResponse(reply=reply)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backend failure: {str(e)}")

