from __future__ import annotations

from enum import Enum


class EventSource(str, Enum):
    CHAT = "CHAT"
    SLACK = "SLACK"
    API = "API"
    SYSTEM = "SYSTEM"


class IncidentSource(str, Enum):
    CHAT = "CHAT"
    SLACK = "SLACK"
    API = "API"
    SYSTEM = "SYSTEM"


# Backward/compat alias (in case older code expects Source or similar)
Source = EventSource

__all__ = ["EventSource", "IncidentSource", "Source"]

