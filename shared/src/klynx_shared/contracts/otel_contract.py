from pydantic import BaseModel
from klynx_shared.models.telemetry import TelemetryEvent

class OTelIngestRequest(BaseModel):
    event: TelemetryEvent

