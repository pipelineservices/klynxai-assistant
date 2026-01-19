import json
from pathlib import Path

BASE = Path("/opt/klynxaiagent/core/data/memory/slack")
BASE.mkdir(parents=True, exist_ok=True)


def _path(thread_ts: str) -> Path:
    return BASE / f"{thread_ts.replace('.', '_')}.json"


def load_thread(thread_ts: str):
    p = _path(thread_ts)
    if not p.exists():
        return []
    try:
        return json.loads(p.read_text()).get("messages", [])
    except Exception:
        return []


def append_thread(thread_ts: str, role: str, content: str):
    p = _path(thread_ts)
    data = {"thread_ts": thread_ts, "messages": []}

    if p.exists():
        try:
            data = json.loads(p.read_text())
        except Exception:
            pass

    data["messages"].append({
        "role": role,
        "content": content
    })

    p.write_text(json.dumps(data, indent=2))

