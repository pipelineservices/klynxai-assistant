import os
import json
import boto3
from typing import List, Dict, Any


class BedrockLLM:
    def __init__(self):
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.model_id = os.getenv("BEDROCK_MODEL_ID", "").strip()

        if not self.model_id:
            raise RuntimeError("BEDROCK_MODEL_ID not set")

        self.client = boto3.client("bedrock-runtime", region_name=self.region)

    async def reply(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Claude-compatible Bedrock invocation.
        Falls back gracefully if AWS rejects request.
        """

        # Convert chat messages → Claude format
        user_prompt = ""
        system_prompt = ""

        for m in messages:
            if m["role"] == "system":
                system_prompt += m["content"] + "\n"
            elif m["role"] == "user":
                user_prompt += m["content"] + "\n"

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 800,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "user",
                    "content": user_prompt.strip()
                }
            ],
        }

        if system_prompt.strip():
            body["system"] = system_prompt.strip()

        try:
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json",
            )

            payload = json.loads(response["body"].read())

            text = ""
            for block in payload.get("content", []):
                if block.get("type") == "text":
                    text += block.get("text", "")

            return {
                "reply": text.strip(),
                "actions": []
            }

        except Exception as e:
            # IMPORTANT: never crash core
            return {
                "reply": f"[LLM fallback] Unable to reach Bedrock: {str(e)}",
                "actions": []
            }

