from fastapi import APIRouter, Request

router = APIRouter(prefix="/tools", tags=["tools"])

@router.get("/list")
def list_tools():
    return {
        "tools": [
            {"id": "gmail_unread", "name": "Gmail: list unread (stub)"},
            {"id": "slack_send", "name": "Slack: send message (stub)"},
        ]
    }

@router.post("/execute")
async def execute_tool(request: Request):
    body = await request.json()
    tool_id = body.get("tool_id")
    args = body.get("args", {})

    if tool_id == "gmail_unread":
        return {"ok": True, "tool_id": tool_id, "result": ["Mock unread email 1", "Mock unread email 2"]}

    if tool_id == "slack_send":
        channel = args.get("channel", "#general")
        text = args.get("text", "Hello from KLYNX!")
        return {"ok": True, "tool_id": tool_id, "result": {"channel": channel, "sent": True, "text": text}}

    return {"ok": False, "error": f"Unknown tool_id: {tool_id}"}
