from opentelemetry import trace

tracer = trace.get_tracer("klynx-chat-backend")


async def run_llm(provider: str, messages: list):
    with tracer.start_as_current_span("llm.call") as span:
        span.set_attribute("llm.provider", provider)
        span.set_attribute("llm.messages", len(messages))

        # existing logic
        if provider == "mock":
            return "Mock response"

        # OpenAI path already exists in your code
        return "LLM response"

