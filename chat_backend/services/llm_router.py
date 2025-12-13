import os
from typing import Any, AsyncGenerator, Dict, List, Optional

# Messages format expected:
# [{"role":"user","content":"hi"}, {"role":"assistant","content":"hello"}]

def _normalize_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    for m in messages or []:
        role = str(m.get("role", "user"))
        content = str(m.get("content", ""))
        if role not in ("system", "user", "assistant"):
            role = "user"
        out.append({"role": role, "content": content})
    return out


async def route_llm_stream(
    *,
    provider: str,
    messages: List[Dict[str, Any]],
) -> AsyncGenerator[str, None]:
    """
    Returns an async generator yielding raw text tokens/chunks.

    provider:
      - "mock"   -> simple token stream
      - "openai" -> real OpenAI streaming (Chat Completions)
    """
    provider = (provider or "mock").lower().strip()
    norm_messages = _normalize_messages(messages)

    if provider == "mock":
        # Simple streaming mock: emits word-by-word
        text = "(Mock LLM Streaming) " + (norm_messages[-1]["content"] if norm_messages else "")
        for token in text.split():
            yield token + " "
        return

    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            # We stream an error as content so UI still shows something useful
            yield "[ERROR] OPENAI_API_KEY is not set on the server."
            return

        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        # Lazy import so mock works even if openai package not installed
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=api_key)

        # Stream via Chat Completions
        # NOTE: This yields incremental deltas; we forward them to SSE
        stream = await client.chat.completions.create(
            model=model,
            messages=norm_messages,
            temperature=0.2,
            stream=True,
        )

        async for event in stream:
            # event.choices[0].delta.content contains partial text
            try:
                delta = event.choices[0].delta
                piece: Optional[str] = getattr(delta, "content", None)
                if piece:
                    yield piece
            except Exception:
                # Don't crash the stream on a single bad event
                continue

        return

    # Other providers not implemented yet
    yield f"[ERROR] Provider '{provider}' is not implemented yet. Use 'mock' or 'openai'."
    return

