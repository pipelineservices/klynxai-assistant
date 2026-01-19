import json
from pathlib import Path
from typing import List
from .models import MemoryMessage, ConversationMemory

BASE_DIR = Path("/opt/klynxaiagent/core/data/memory")
BASE_DIR.mkdir(parents=True, exist_ok=True)


def _file_for(thread_id: str) -> Path:
    safe = thread_id.replace("/", "_").replace(" ", "_")
    return BASE_DIR / f"{safe}.json"


def load_memory(thread_id: str) -> List[dict]:
    path = _file_for(thread_id)
    if not path.exists():
        return []

    try:
        data = json.loads(path.read_text())
        return data.get("messages", [])
    except Exception:
        return []


def append_memory(thread_id: str, role: str, content: str) -> None:
    path = _file_for(thread_id)

    if path.exists():
        try:
            data = json.loads(path.read_text())
        except Exception:
            data = {"thread_id": thread_id, "messages": []}
    else:
        data = {"thread_id": thread_id, "messages": []}

    data["messages"].append({
        "role": role,
        "content": content
    })

    path.write_text(json.dumps(data, indent=2))

