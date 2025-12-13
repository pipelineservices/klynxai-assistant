
"""Example Zero-Ops flow script for a FastAPI service on EKS.

This is a POC that:
- Asks the backend to generate CI YAML + tests
- Runs lint + tests
- Commits + pushes
- Triggers CI

You can adapt it for full automation.
"""
from __future__ import annotations
import os
import requests

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


def call_agent(messages):
    resp = requests.post(f"{BACKEND_URL}/api/chat", json={"messages": messages}, timeout=60)
    resp.raise_for_status()
    return resp.json()


def main():
    history = [
        {
            "role": "user",
            "content": (
                "You are KLYNXAIAssistant. For this repo, generate CI YAML and tests for a "
                "Python FastAPI service deployed to EKS. Then run lint/tests and push."
            ),
        }
    ]
    result = call_agent(history)
    print("Assistant reply:")
    print(result["assistant_reply"])


if __name__ == "__main__":
    main()
