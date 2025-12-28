import os
import json
import urllib.request
import urllib.error
from typing import Any, Dict, List


class OllamaLLM:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.1")
        self.timeout = int(os.getenv("OLLAMA_TIMEOUT", "120"))  # seconds

    async def reply(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        prompt = self._messages_to_prompt(messages)

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }

        req = urllib.request.Request(
            url=f"{self.base_url}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "reply": data.get("response", "").strip(),
                    "actions": [],
                }

        except urllib.error.URLError as e:
            return {
                "reply": "⚠️ Ollama is running but response timed out. Please retry.",
                "actions": [],
            }

    def _messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        lines = []
        for m in messages:
            role = m.get("role", "user")
            content = m.get("content", "")
            lines.append(f"{role.upper()}: {content}")
        lines.append("ASSISTANT:")
        return "\n".join(lines)

