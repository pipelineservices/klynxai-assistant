import os
from typing import Any, Dict, List

from core.llm.base import BaseLLM


def _normalize_messages(messages: List[Any]) -> List[Dict[str, str]]:
    normalized: List[Dict[str, str]] = []
    for m in messages or []:
        if isinstance(m, dict):
            role = m.get("role")
            content = m.get("content")
        else:
            role = getattr(m, "role", None)
            content = getattr(m, "content", None)
        if role and content is not None:
            normalized.append({"role": str(role), "content": str(content)})
    return normalized


class OpenAILLM(BaseLLM):
    def chat(self, messages: List[Any]) -> str:
        try:
            from openai import OpenAI
        except Exception as exc:
            raise RuntimeError("OpenAI SDK not installed. Run: pip install openai") from exc

        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")

        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))

        normalized = _normalize_messages(messages)
        if not normalized:
            return "No messages provided."

        completion = client.chat.completions.create(
            model=model,
            messages=normalized,
            temperature=temperature,
        )
        return completion.choices[0].message.content or ""
