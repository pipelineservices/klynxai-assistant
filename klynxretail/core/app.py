from __future__ import annotations
import uuid
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.models import SearchRequest, SearchResponse, ChatRequest, ChatResponse, EventRequest, CartRequest, CartResponse
from core.services.orchestrator import Orchestrator
from core import settings
from core import analytics

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

def _dashboard_allowed(request: Request) -> bool:
    if not settings.DASHBOARD_TOKEN:
        return True
    token = request.query_params.get("token") or request.headers.get("X-Dashboard-Token")
    return token == settings.DASHBOARD_TOKEN

@app.middleware("http")
async def dashboard_auth(request: Request, call_next):
    if request.url.path in ("/dashboard.html", "/api/analytics/summary"):
        if not _dashboard_allowed(request):
            return JSONResponse({"detail": "unauthorized"}, status_code=401)
    return await call_next(request)
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
    analytics.write_event(req.event, req.session_id, req.metadata)
    return {"ok": True, "event": req.event}

@app.post("/api/cart", response_model=CartResponse)
def create_cart(req: CartRequest):
    subtotal = sum(p.price for p in req.items)
    cart_id = str(uuid.uuid4())
    # Placeholder checkout URL; replace with real retailer cart integration.
    checkout_url = f"{settings.CHECKOUT_BASE_URL}?cart_id={cart_id}"
    return CartResponse(
        cart_id=cart_id,
        currency=req.currency,
        subtotal=round(subtotal, 2),
        checkout_url=checkout_url,
    )

@app.get("/api/analytics/summary")
def analytics_summary():
    return analytics.summary_last_24h()

# Serve embed widget assets
app.mount("/embed", StaticFiles(directory="embed", html=True), name="embed")

# Serve web demo
app.mount("/", StaticFiles(directory="web", html=True), name="web")
