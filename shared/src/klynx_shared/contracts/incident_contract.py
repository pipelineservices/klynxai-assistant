from pydantic import BaseModel
from klynx_shared.models.incident import Incident

class IncidentCreateRequest(BaseModel):
    incident: Incident

