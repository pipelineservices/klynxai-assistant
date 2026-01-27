import os

APP_NAME = "klynx-devops-orchestrator"
HOST = os.getenv("KLYNX_DEVOPS_HOST", "0.0.0.0")
PORT = int(os.getenv("KLYNX_DEVOPS_PORT", "9400"))
AUDIT_PATH = os.getenv("KLYNX_DEVOPS_AUDIT_PATH", os.path.join("run", "devops_audit.jsonl"))

# KLYNX Dragon
DRAGON_BASE_URL = os.getenv("KLYNX_DRAGON_BASE_URL", "https://dragon.klynxai.com")
DRAGON_TOKEN = os.getenv("KLYNX_DRAGON_TOKEN", "commander-token")
DRAGON_ORG = os.getenv("KLYNX_DRAGON_ORG", "default-org")
DRAGON_REGION = os.getenv("KLYNX_DRAGON_REGION", "global")

# Incident + Slack
INCIDENT_API_BASE = os.getenv("KLYNX_INCIDENT_API_BASE", "https://klynxai.com/api/incidents")
SLACK_WEBHOOK_URL = os.getenv("KLYNX_SLACK_WEBHOOK_URL", "")
SLACK_APPROVAL_CHANNEL = os.getenv("KLYNX_SLACK_APPROVAL_CHANNEL", "#klynx-devops-approvals")
SLACK_ACTIONS_ENDPOINT = os.getenv("KLYNX_SLACK_ACTIONS_ENDPOINT", "https://api.klynxai.com/integrations/slack/actions")

# GitLab/Jenkins
GITLAB_API_BASE = os.getenv("GITLAB_API_BASE", "")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN", "")
GITLAB_PROJECT_ID = os.getenv("GITLAB_PROJECT_ID", "")

JENKINS_URL = os.getenv("JENKINS_URL", "")
JENKINS_USER = os.getenv("JENKINS_USER", "")
JENKINS_TOKEN = os.getenv("JENKINS_TOKEN", "")

# GitHub App auth
GITHUB_APP_ID = os.getenv("GITHUB_APP_ID", "")
GITHUB_APP_PRIVATE_KEY_PEM = os.getenv("GITHUB_APP_PRIVATE_KEY_PEM", "")
GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")
GITHUB_API_BASE = os.getenv("GITHUB_API_BASE", "https://api.github.com")
GITHUB_DEFAULT_BRANCH = os.getenv("GITHUB_DEFAULT_BRANCH", "main")
STATE_PATH = os.getenv("KLYNX_DEVOPS_STATE_PATH", os.path.join("run", "devops_state.jsonl"))

# Safety
DRY_RUN = os.getenv("KLYNX_DEVOPS_DRY_RUN", "true").lower() == "true"
