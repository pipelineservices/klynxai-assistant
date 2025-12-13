from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body
from history_repository import init_db, list_incidents, get_incident_by_thread_ts
from slack_handler import slack_router

app = FastAPI(title="KLYNX AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def root():
    return {"status": "ok", "service": "klynx-ai-backend"}

# Slack
app.include_router(slack_router)

# --- APIs for Web UI ---

@app.get("/api/incidents")
def api_list_incidents(limit: int = 50):
    return {"items": list_incidents(limit=limit)}

@app.get("/api/incidents/by-thread/{thread_ts}")
def api_incident(thread_ts: str):
    inc = get_incident_by_thread_ts(thread_ts)
    return {"item": inc}

@app.post("/chat")
async def chat(message: dict = Body(...)):
    return {
        "reply": f"I received: {message.get('message')}. AI engine coming next."
    }

