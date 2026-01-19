from typing import List
from klynx_shared.models.incident import Incident

_INCIDENTS: List[Incident] = []

def add_incident(incident: Incident):
    _INCIDENTS.append(incident)

def list_incidents() -> List[Incident]:
    return _INCIDENTS

