from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

SERVICE_NAME = "klynx-chat-backend"


def setup_otel(app):
    resource = Resource.create({
        "service.name": SERVICE_NAME
    })

    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    # Console exporter (SAFE, no infra needed)
    provider.add_span_processor(
        BatchSpanProcessor(ConsoleSpanExporter())
    )

    # Auto-instrument
    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()

    return trace.get_tracer(SERVICE_NAME)

