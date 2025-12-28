import os
from fastapi import FastAPI
from dotenv import load_dotenv

from slack_agent.routes.slack_events import router as slack_router

load_dotenv()

app = FastAPI(title="KLYNX Slack Agent", version="0.1.0")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(slack_router, prefix="/slack")

