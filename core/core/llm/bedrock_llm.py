# /opt/klynxaiagent/core/core/llm/bedrock_llm.py
from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional


class BedrockLLM:
    """
    Bedrock-backed LLM adapter used by core.app via _load_llm().

    - If BEDROCK_MODEL_ID is not set, init will raise to allow fallback loader.
    - Supports common request formats:
        * Anthropic Claude on Bedrock
        * Amazon Titan Text
      (If model family is unknown, it tries a safe generic prompt mode.)
    """

    def __init__(self) -> None:
        self.region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "us-east-1"
        self.model_id = os.getenv("BEDROCK_MODEL_ID", "").strip()
        if not self.model_id:
            raise RuntimeError("BEDROCK_MODEL_ID not set")

        # Lazy import so core still boots even if boto3 isn't installed
        import boto3  # type: ignore

        self._client = boto3.client("bedrock-runtime", region_name=self.region)

        # Tunables
        self.max_tokens = int(os.getenv("BEDROCK_MAX_TOKENS", "512"))
        self.temperature = float(os.getenv("BEDROCK_TEMPERATURE", "0.3"))
        self.top_p = float(os.getenv("BEDROCK_TOP_P", "0.9"))

        # Optional system prompt
        self.system_prompt = os.getenv(
            "KLYNX_SYSTEM_PROMPT",
            "You are KLYNX, an enterprise assistant. Be concise, helpful, and accurate.",
        )

    async def reply(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Input: [{"role":"user|assistant|system","content":"..."}]
        Output: {"reply": "...", "actions": []}
        """
        # Convert chat messages -> a single prompt, unless model supports chat schema
        user_prompt = self._to_prompt(messages)

        # Choose payload schema by model_id hints
        mid = self.model_id.lower()
        if "anthropic.claude" in mid or "claude" in mid:
            text = self._invoke_anthropic(messages)
        elif "amazon.titan" in mid or "titan" in mid:
            text = self._invoke_titan(user_prompt)
        else:
            # Unknown family: try Titan-style first, then fallback to simple
            try:
                text = self._invoke_titan(user_prompt)
            except Exception:
                text = self._invoke_generic_prompt(user_prompt)

        return {"reply": (text or "").strip(), "actions": []}

    def _to_prompt(self, messages: List[Dict[str, str]]) -> str:
        parts: List[str] = []
        parts.append(f"System: {self.system_prompt}")
        for m in messages:
            role = (m.get("role") or "").strip()
            content = (m.get("content") or "").strip()
            if not content:
                continue
            if role == "system":
                parts.append(f"System: {content}")
            elif role == "assistant":
                parts.append(f"Assistant: {content}")
            else:
                parts.append(f"User: {content}")
        parts.append("Assistant:")
        return "\n".join(parts)

    def _invoke_anthropic(self, messages: List[Dict[str, str]]) -> str:
        """
        Claude Messages API on Bedrock (common schema).
        """
        # Claude expects structured messages (no "system" inside messages list typically)
        claude_messages: List[Dict[str, Any]] = []
        for m in messages:
            role = (m.get("role") or "user").strip()
            content = (m.get("content") or "").strip()
            if not content:
                continue
            if role == "system":
                # we keep system_prompt separately
                continue
            if role not in ("user", "assistant"):
                role = "user"
            claude_messages.append({"role": role, "content": [{"type": "text", "text": content}]})

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "system": self.system_prompt,
            "messages": claude_messages or [{"role": "user", "content": [{"type": "text", "text": "Hello"}]}],
        }

        resp = self._client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body).encode("utf-8"),
        )
        raw = resp["body"].read().decode("utf-8")
        data = json.loads(raw)

        # Claude commonly returns: {"content":[{"type":"text","text":"..."}], ...}
        content = data.get("content", [])
        if isinstance(content, list) and content:
            first = content[0]
            if isinstance(first, dict) and "text" in first:
                return str(first.get("text") or "")
        # Some variants: {"completion": "..."}
        if "completion" in data:
            return str(data.get("completion") or "")
        return ""

    def _invoke_titan(self, prompt: str) -> str:
        """
        Titan Text (common schema).
        """
        body = {
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": self.max_tokens,
                "temperature": self.temperature,
                "topP": self.top_p,
            },
        }

        resp = self._client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body).encode("utf-8"),
        )
        raw = resp["body"].read().decode("utf-8")
        data = json.loads(raw)

        # Titan often returns: {"results":[{"outputText":"..."}]}
        results = data.get("results", [])
        if isinstance(results, list) and results:
            first = results[0]
            if isinstance(first, dict) and "outputText" in first:
                return str(first.get("outputText") or "")
        return ""

    def _invoke_generic_prompt(self, prompt: str) -> str:
        """
        Generic prompt attempt: many models accept {"prompt": "..."}.
        """
        body = {"prompt": prompt, "max_tokens": self.max_tokens, "temperature": self.temperature}

        resp = self._client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body).encode("utf-8"),
        )
        raw = resp["body"].read().decode("utf-8")
        data = json.loads(raw)

        # Try common fields
        for k in ("output", "text", "completion", "generated_text"):
            if k in data and isinstance(data[k], str):
                return data[k]
        return ""

