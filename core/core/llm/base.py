from typing import List, Dict

class BaseLLM:
    def chat(self, messages: List[Dict[str, str]]) -> str:
        raise NotImplementedError

