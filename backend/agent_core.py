from app_config import get_settings
from models.llm import call_llm
from agent_tools import TOOL_REGISTRY

settings = get_settings()

async def run_agent_turn(messages: list[dict]):
    """
    Single-turn agent execution combining LLM + tools.
    """
    # LLM basic response for now
    reply = await call_llm(messages)
    return reply
