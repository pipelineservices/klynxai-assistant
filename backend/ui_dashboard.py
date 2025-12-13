from __future__ import annotations
from fastapi import APIRouter, HTTPException
from history_repository import list_incidents, get_incident_by_thread_ts
from cloud_outage_engine import detect_multi_cloud_outage

ui_router = APIRouter(prefix="/api")

@ui_router.get("/incidents")
def api_list_incidents(limit: int = 200):
    return {"incidents": list_incidents(limit=limit)}

@ui_router.get("/incidents/{thread_ts}")
def api_get_incident(thread_ts: str):
    inc = get_incident_by_thread_ts(thread_ts)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@ui_router.get("/outages")
def api_outages():
    return detect_multi_cloud_outage()
