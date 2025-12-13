import httpx
from app_config import get_settings

settings = get_settings()

async def call_llm(messages):
    """
    Calls OpenAI Chat Completion.
    """
    url = "https://api.openai.com/v1/chat/completions"

    payload = {
        "model": settings.openai_model,
        "messages": messages,
        "temperature": 0.2,
    }

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"]
