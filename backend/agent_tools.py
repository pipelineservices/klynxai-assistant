# Minimal tool registry so backend loads properly

def dummy_tool(input: str):
    return f"Tool execution placeholder. Input was: {input}"

TOOL_REGISTRY = {
    "dummy_tool": dummy_tool
}
