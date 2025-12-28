from typing import List, Dict
from core.llm.base import BaseLLM

class LocalLLM(BaseLLM):
    def chat(self, messages: List[Dict[str, str]]) -> str:
        last = ""
        for m in messages:
            if m.get("role") == "user":
                last = m.get("content", "")
        return (
            "RequestId: local-dev\n\n"
            "✅ Understood.\n\n"
            "### What I think is happening\n"
            f"- You said: {last}\n\n"
            "### Next best step\n"
            "- Share the exact error text / service name / region, and I’ll produce root cause + fix plan.\n"
        )

