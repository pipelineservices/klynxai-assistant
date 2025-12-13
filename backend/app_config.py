# app_config.py
import os
from pathlib import Path
from functools import lru_cache

try:
    # Optional: load .env if python-dotenv is installed
    from dotenv import load_dotenv  # type: ignore

    BASE_DIR = Path(__file__).resolve().parent
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except Exception:
    # If dotenv isn't installed, we just rely on real env vars
    pass


class Settings:
    """
    Very lightweight settings loader.
    No pydantic dependency; reads from environment / .env.
    """

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    # Slack
    SLACK_SIGNING_SECRET: str = os.getenv("SLACK_SIGNING_SECRET", "")
    SLACK_BOT_TOKEN: str = os.getenv("SLACK_BOT_TOKEN", "")

    # Optional: bot user ID to avoid replying to itself (recommended)
    # Example: U0A2NUD5JNP
    SLACK_BOT_USER_ID: str = os.getenv("SLACK_BOT_USER_ID", "")

    # Workspace / tooling
    WORKSPACE_DIR: str = os.getenv(
        "WORKSPACE_DIR", "/opt/klynxagentent/workspace"
    )

    # Auto-fix behaviour: DRY_RUN=True means **only describe** actions, do not
    # actually call AWS APIs. Flip to "false" once you are ready.
    AUTOFIX_DRY_RUN: bool = os.getenv("AUTOFIX_DRY_RUN", "true").lower() == "true"


@lru_cache
def get_settings() -> Settings:
    return Settings()
