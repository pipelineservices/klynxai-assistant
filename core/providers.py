from __future__ import annotations

import os

from core.llm.local import LocalLLM


def get_llm_provider():
    """
    For now always return LocalLLM to keep Core stable.
    Later: switch based on env (OPENAI, HYBRID, etc.).
    """
    provider = os.getenv("KLYNX_LLM_PROVIDER", "local").lower().strip()

    # Freeze to local until we confirm other providers are correct.
    if provider not in ("local", ""):
        return LocalLLM()

    return LocalLLM()

