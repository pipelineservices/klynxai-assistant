sudo tee /opt/klynxaiagent/core/llm/openai.py >/dev/null <<'PY'
from __future__ import annotations
import os
from .base import BaseLLM

class OpenAILLM(BaseLLM):
    """
    Placeholder to keep imports stable.
    If you later add real OpenAI calls, implement reply() here.
    """
    async def reply(self, prompt: str) -> str:
        _ = os.getenv("OPENAI_API_KEY", "")
        return "OpenAI provider is not enabled yet. Falling back is recommended."
PY

