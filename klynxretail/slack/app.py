import os
import requests
from fastapi import FastAPI, Request

app = FastAPI(title="klynx-retail-slack", version="0.1.0")

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "").strip()
CORE_BASE_URL = os.getenv("CORE_BASE_URL", "http://127.0.0.1:9200").strip()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/slack/events")
async def events(request: Request):
    payload = await request.json()

    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    if payload.get("type") == "event_callback":
        event = payload.get("event", {})
        if event.get("type") == "app_mention":
            text = event.get("text", "")
            channel = event.get("channel")
            thread_ts = event.get("thread_ts") or event.get("ts")
            if channel and SLACK_BOT_TOKEN:
                reply = _call_core(text)
                _post_slack(channel, reply, thread_ts)

    return {"ok": True}

@app.post("/slack/actions")
async def actions(request: Request):
    return {"ok": True}


def _call_core(text: str) -> str:
    try:
        res = requests.post(
            f"{CORE_BASE_URL}/api/chat",
            json={"messages": [{"role": "user", "content": text}]},
            timeout=10,
        )
        data = res.json()
        return data.get("reply", "Here are results.")
    except Exception:
        return "Sorry, I could not reach the retail core service."


def _post_slack(channel: str, text: str, thread_ts: str | None):
    try:
        headers = {"Authorization": f"Bearer {SLACK_BOT_TOKEN}"}
        payload = {"channel": channel, "text": text}
        if thread_ts:
            payload["thread_ts"] = thread_ts
        requests.post("https://slack.com/api/chat.postMessage", json=payload, headers=headers, timeout=10)
    except Exception:
        pass
