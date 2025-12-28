import os
from typing import Any, Dict
import httpx
from dotenv import load_dotenv

load_dotenv()

class CoreClient:
    def __init__(self):
        self.base = os.getenv("CORE_BASE_URL", "http://127.0.0.1:9000").rstrip("/")

    async def chat(self, text: str) -> Dict[str, Any]:
        payload = {"messages": [{"role": "user", "content": text}]}
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(f"{self.base}/api/chat", json=payload)
            r.raise_for_status()
            data = r.json()
            # Normalize output
            data.setdefault("actions", [])
            data.setdefault("request_id", data.get("requestId", ""))
            return data

    async def execute_action(self, request_id: str, action_name: str, user: str | None = None) -> Dict[str, Any]:
        payload = {"request_id": request_id, "action": action_name, "user": user}
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(f"{self.base}/api/actions/execute", json=payload)
            r.raise_for_status()
            return r.json()

