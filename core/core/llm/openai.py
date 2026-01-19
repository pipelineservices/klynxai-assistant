import os
from typing import List, Dict
from core.llm.base import BaseLLM

class OpenAILLM(BaseLLM):
    def chat(self, messages: List[Dict[str, str]]) -> str:
        # Placeholder: we’ll wire real OpenAI later once you decide keys + policy.
        # For now keep it non-breaking.
        return "OpenAI mode is configured, but the client is not wired yet."

