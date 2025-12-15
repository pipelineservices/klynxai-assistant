import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def stream_openai(messages, model):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    for chunk in response:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

def resolve_model(tenant_id: str):
    if tenant_id == "enterprise":
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")

