from __future__ import annotations

from core.llm.base import BaseLLM


class LocalLLM(BaseLLM):
    """
    Minimal local provider so Core never crashes.
    Replace later with Ollama/LLM runtime call.
    """

    async def reply(self, prompt: str) -> str:
        return (
            "### What I think is happening\n"
            f"- You said: {prompt}\n\n"
            "### Next best step\n"
            "- Share the exact error text / service / region."
        )

