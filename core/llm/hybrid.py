sudo tee /opt/klynxaiagent/core/llm/hybrid.py >/dev/null <<'PY'
from __future__ import annotations
from .base import BaseLLM

class HybridLLM(BaseLLM):
    def __init__(self, primary: BaseLLM, fallback: BaseLLM):
        self.primary = primary
        self.fallback = fallback

    async def reply(self, prompt: str) -> str:
        try:
            return await self.primary.reply(prompt)
        except Exception:
            return await self.fallback.reply(prompt)
PY

