import os

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "")
SLACK_APP_TOKEN = os.getenv("SLACK_APP_TOKEN", "")

def is_configured() -> bool:
    return all([
        SLACK_BOT_TOKEN,
        SLACK_SIGNING_SECRET,
    ])

