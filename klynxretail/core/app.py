from __future__ import annotations
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.models import SearchRequest, SearchResponse, ChatRequest, ChatResponse, EventRequest
from core.services.orchestrator import Orchestrator
from core import settings

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/search", response_model=SearchResponse)
def search(req: SearchRequest):
    items = orchestrator.search(req.query, limit=req.limit)
    return SearchResponse(request_id=str(uuid.uuid4()), items=items)

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    last_user = ""
    for m in reversed(req.messages):
        if m.role == "user":
            last_user = m.content
            break
    query = last_user or "shopping"
    items = orchestrator.search(query, limit=req.limit)

    lines = []
    lines.append("?? Shopping Assistant")
    lines.append("")
    lines.append(f"Query: {query}")
    lines.append("")
    lines.append("Top picks:")
    for i, p in enumerate(items[:5], start=1):
        price = f"{p.currency} {p.price:.2f}"
        rating = f"{p.rating:.1f}" if p.rating is not None else "-"
        lines.append(f"{i}. {p.title} ({p.retailer}) ? {price} ? ? {rating}")

    lines.append("")
    lines.append("Quick comparison (price | rating | retailer):")
    for p in items[:5]:
        price = f"{p.currency} {p.price:.2f}"
        rating = f"{p.rating:.1f}" if p.rating is not None else "-"
        lines.append(f"- {p.title} | {price} | {rating} | {p.retailer}")

    lines.append("")
    lines.append("Next steps:")
    lines.append("- Ask to compare any two items")
    lines.append("- Add filters like brand, price range, size")
    lines.append("- Ask for availability in your city")

    reply = "\n".join(lines)
    return ChatResponse(request_id=str(uuid.uuid4()), reply=reply, items=items)

@app.post("/api/events")
def events(req: EventRequest):
    # Basic sink for usage analytics; extend to store or forward later.
    return {"ok": True, "event": req.event}

# Serve embed widget assets
app.mount("/embed", StaticFiles(directory="embed", html=True), name="embed")

# Serve web demo
app.mount("/", StaticFiles(directory="web", html=True), name="web")
