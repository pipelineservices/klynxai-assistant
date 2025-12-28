import os
from core.llm.local import LocalLLM
from core.llm.openai import OpenAILLM
from core.llm.hybrid import HybridLLM

def get_llm_provider():
    mode = (os.getenv("LLM_MODE") or "local").lower()
    if mode == "openai":
        return OpenAILLM()
    if mode == "hybrid":
        return HybridLLM()
    return LocalLLM()

