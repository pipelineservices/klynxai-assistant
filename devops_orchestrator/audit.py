import json
import os
from datetime import datetime
from typing import Optional
import uuid

from devops_orchestrator import settings


def _ensure_dir(path: str) -> None:
    folder = os.path.dirname(path)
    if folder and not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)


def write_event(action: str, target: str, metadata: Optional[dict] = None) -> dict:
    payload = {
        "id": str(uuid.uuid4()),
        "ts": datetime.utcnow().isoformat() + "Z",
        "action": action,
        "target": target,
        "metadata": metadata or {},
    }
    _ensure_dir(settings.AUDIT_PATH)
    with open(settings.AUDIT_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload) + "\n")
    return payload
