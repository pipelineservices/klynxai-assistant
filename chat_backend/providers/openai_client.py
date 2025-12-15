import os
import time
from typing import Any, Dict, List

import httpx


OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT_S = float(os.getenv("OPENAI_TIMEOUT_S", "60"))


class OpenAIError(Exception):
    pass


def _get_api_key() -> str:
    key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not key:
        raise OpenAIError("OPENAI_API_KEY is not set")
    # basic sanity check — prevents accidentally pasting non-OpenAI tokens
    if not key.startswith("sk-"):
        raise OpenAIError("OPENAI_API_KEY does not look like a valid OpenAI key (expected it to start with 'sk-')")
    return key


def chat_completion(messages: List[Dict[str, str]]) -> str:
    """
    Calls OpenAI Chat Completions API using httpx.
    Returns assistant message content (string).
    """
    api_key = _get_api_key()

    url = f"{OPENAI_API_BASE.rstrip('/')}/chat/completions"
    payload: Dict[str, Any] = {
        "model": OPENAI_MODEL,
        "messages": messages,
        "temperature": 0.2,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    start = time.time()
    try:
        with httpx.Client(timeout=OPENAI_TIMEOUT_S) as client:
            r = client.post(url, json=payload, headers=headers)
            if r.status_code >= 400:
                # include a short response body for debugging but keep it compact
                body = r.text
                if len(body) > 800:
                    body = body[:800] + "...(truncated)"
                raise OpenAIError(f"OpenAI HTTP {r.status_code}: {body}")

            data = r.json()
            # Standard chat.completions shape
            content = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            return (content or "").strip() or "(empty response)"
    except httpx.TimeoutException:
        raise OpenAIError(f"OpenAI call timed out after {OPENAI_TIMEOUT_S}s")
    except httpx.RequestError as e:
        raise OpenAIError(f"OpenAI request error: {str(e)}")
    finally:
        _ = time.time() - start

