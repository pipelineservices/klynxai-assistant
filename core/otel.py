from __future__ import annotations

import os
from typing import Optional

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


_otel_initialized = False


def init_otel() -> None:
    """
    Safe OTEL initializer.
    - If OTEL_EXPORTER_OTLP_ENDPOINT is not set, we still initialize tracer provider
      (no exporter), so trace_id exists and app never crashes.
    """
    global _otel_initialized
    if _otel_initialized:
        return

    service_name = os.getenv("OTEL_SERVICE_NAME", "klynx-core")
    environment = os.getenv("KLYNX_ENV", "prod")

    resource = Resource.create(
        {
            "service.name": service_name,
            "deployment.environment": environment,
        }
    )

    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    if endpoint:
        exporter = OTLPSpanExporter(endpoint=endpoint)
        provider.add_span_processor(BatchSpanProcessor(exporter))

    _otel_initialized = True


def get_trace_id() -> Optional[str]:
    """
    Returns current trace_id as 32-hex string, or None.
    """
    span = trace.get_current_span()
    ctx = span.get_span_context()
    if not ctx or not ctx.is_valid:
        return None
    return f"{ctx.trace_id:032x}"

