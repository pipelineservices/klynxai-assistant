import json
import os
import time
from typing import Any, Dict, List
from uuid import uuid4

RUN_DIR = os.getenv("KLYNX_RUN_DIR", "/opt/klynxaiagent/run")
INCIDENTS_PATH = os.path.join(RUN_DIR, "incidents.json")

def _ensure():
    os.makedirs(RUN_DIR, exist_ok=True)
    if not os.path.exists(INCIDENTS_PATH):
        with open(INCIDENTS_PATH, "w", encoding="utf-8") as f:
            json.dump({"incidents": []}, f)

def create_incident(source: str, title: str, description: str, severity: str = "P2") -> Dict[str, Any]:
    _ensure()
    incident = {
        "id": str(uuid4()),
        "created_at": int(time.time()),
        "source": source,
        "severity": severity,
        "status": "OPEN",
        "title": title,
        "description": description,
    }
    with open(INCIDENTS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["incidents"].append(incident)
    with open(INCIDENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return incident

def list_incidents() -> List[Dict[str, Any]]:
    _ensure()
    with open(INCIDENTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f).get("incidents", [])

