from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from typing import Any, Dict, List
import os

app = FastAPI()

# ---------------------------------------------------------
# OPENAI CLIENT (lazy import)
# ---------------------------------------------------------

def _openai_client():
    try:
        from openai import OpenAI
    except Exception as e:  # pragma: no cover - runtime only
        raise HTTPException(status_code=500, detail=f"openai package not installed: {e}")

    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

    return OpenAI(api_key=key)

def _extract_messages(payload: Any) -> List[Dict[str, str]]:

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid request payload")

    messages = payload.get("messages")
    if isinstance(messages, list):
        out: List[Dict[str, str]] = []
        for m in messages:
            if not isinstance(m, dict):
                continue
            content = str(m.get("content", "") or "")
            if not content.strip():
                continue
            role = str(m.get("role", "user") or "user")
            out.append({"role": role, "content": content})
        if out:
            return out

    for key in ("message", "prompt", "text"):
        v = payload.get(key)
        if isinstance(v, str) and v.strip():
            return [{"role": "user", "content": v}]

    raise HTTPException(status_code=400, detail="No messages provided")

def _bing_web_search(query: str, count: int = 6) -> List[Dict[str, str]]:
    key = os.getenv("BING_SEARCH_KEY", "").strip()
    if not key or not query:
        return []
    try:
        import requests
        url = "https://api.bing.microsoft.com/v7.0/search"
        headers = {"Ocp-Apim-Subscription-Key": key}
        params = {"q": query, "mkt": "en-US", "count": count, "textFormat": "Raw"}
        res = requests.get(url, headers=headers, params=params, timeout=8)
        res.raise_for_status()
        data = res.json()
        items = data.get("webPages", {}).get("value", [])
        out = []
        for item in items:
            out.append(
                {
                    "name": str(item.get("name", "")),
                    "url": str(item.get("url", "")),
                    "snippet": str(item.get("snippet", "")),
                }
            )
        return out
    except Exception:
        return []


def _bing_image_search(query: str, count: int = 3) -> List[Dict[str, str]]:
    key = os.getenv("BING_SEARCH_KEY", "").strip()
    if not key or not query:
        return []
    try:
        import requests
        url = "https://api.bing.microsoft.com/v7.0/images/search"
        headers = {"Ocp-Apim-Subscription-Key": key}
        params = {"q": query, "mkt": "en-US", "count": count, "safeSearch": "Moderate"}
        res = requests.get(url, headers=headers, params=params, timeout=8)
        res.raise_for_status()
        data = res.json()
        items = data.get("value", [])
        out = []
        for item in items:
            out.append(
                {
                    "name": str(item.get("name", "")),
                    "url": str(item.get("contentUrl", "")),
                    "thumbnail": str(item.get("thumbnailUrl", "")),
                    "host": str(item.get("hostPageUrl", "")),
                }
            )
        return out
    except Exception:
        return []


def _pick_sources(results: List[Dict[str, str]]) -> List[Dict[str, str]]:
    def score(url: str) -> int:
        u = (url or "").lower()
        if "aws.amazon.com" in u or "docs.aws.amazon.com" in u:
            return 3
        if "youtube.com" in u or "youtu.be" in u:
            return 2
        return 1

    ranked = sorted(results, key=lambda r: score(r.get("url", "")), reverse=True)
    uniq = []
    seen = set()
    for r in ranked:
        url = r.get("url", "")
        if not url or url in seen:
            continue
        seen.add(url)
        uniq.append(r)
        if len(uniq) >= 6:
            break
    return uniq


def _build_extras(query: str) -> str:
    q = (query or "").strip()
    if not q:
        return ""
    web_results = _bing_web_search(q)
    sources = _pick_sources(web_results)
    images = _bing_image_search(q)

    images_md = "\n".join([f"![{i.get('name','diagram')}]({i.get('url','')})" for i in images[:3] if i.get("url")])
    sources_md = "\n".join([f"- [{s['name']}]({s['url']})" for s in sources if s.get("url")])
    if not images_md and not sources_md:
        return ""

    extra = "\n\n---\n\n"
    if images_md:
        extra += "**Diagrams**\n\n" + images_md + "\n\n"
    if sources_md:
        extra += "**Sources**\n\n" + sources_md + "\n"
    return extra

# ---------------------------------------------------------
# API
# ---------------------------------------------------------

@app.post("/api/chat")
async def chat(request: Request):
    payload = await request.json()
    messages = _extract_messages(payload)
    last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    extras = _build_extras(last_user)

    client = _openai_client()
    completion = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=messages,
        temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.3")),
    )

    reply = completion.choices[0].message.content or ""
    return {"reply": reply + extras}


@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    payload = await request.json()
    messages = _extract_messages(payload)
    last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    extras = _build_extras(last_user)
    client = _openai_client()

    def event_stream():
        try:
            stream = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=messages,
                temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.3")),
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                token = getattr(delta, "content", None)
                if token:
                    yield f"data: {token}\n\n"
            if extras:
                for part in extras.splitlines(keepends=True):
                    if part:
                        yield f"data: {part}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {e}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )


@app.get("/health")
def health():
    return {"status": "ok"}
