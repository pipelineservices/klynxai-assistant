import json
import os
from typing import Any, Dict, List, Optional

class IncidentStore:
    def __init__(self, path: str):
        self.path = path
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        if not os.path.exists(self.path):
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump({"incidents": {}}, f)

    def _load(self) -> Dict[str, Any]:
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save(self, data: Dict[str, Any]) -> None:
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.replace(tmp, self.path)

    def upsert(self, incident: Dict[str, Any]) -> None:
        data = self._load()
        data.setdefault("incidents", {})
        data["incidents"][incident["incident_id"]] = incident
        self._save(data)

    def get(self, incident_id: str) -> Optional[Dict[str, Any]]:
        data = self._load()
        return data.get("incidents", {}).get(incident_id)

    def list_all(self) -> List[Dict[str, Any]]:
        data = self._load()
        return list(data.get("incidents", {}).values())

