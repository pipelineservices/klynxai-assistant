from typing import List, Dict
from core.llm.base import BaseLLM
from core.llm.local import LocalLLM
from core.llm.openai import OpenAILLM

class HybridLLM(BaseLLM):
    def __init__(self):
        self.local = LocalLLM()
        self.remote = OpenAILLM()

    def chat(self, messages: List[Dict[str, str]]) -> str:
        # Phase 1: use local stable path
        return self.local.chat(messages)

