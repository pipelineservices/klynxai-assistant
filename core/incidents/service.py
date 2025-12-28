from typing import List
from uuid import uuid4
from datetime import datetime

from klynx_shared.models.incident import Incident
from klynx_shared.enums.source import EventSource

_INCIDENTS: List[Incident] = []


def create_incident(
    source: str,
    title: str,
    description: str,
    severity: str = "P3",
) -> Incident:
    incident = Incident(
        id=str(uuid4()),
        source=EventSource(source),
        title=title,
        description=description,
        severity=severity,
        created_at=datetime.utcnow(),
    )
    _INCIDENTS.append(incident)
    return incident


def get_incidents() -> List[Incident]:
    return list(_INCIDENTS)

