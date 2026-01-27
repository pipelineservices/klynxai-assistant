# KLYNX DevOps Orchestrator (Governed)

This service implements a governed DevOps workflow:

- Draft code generation and PR creation (no merge/deploy without KLYNX Dragon approval)
- CI/CD failure ingestion (GitLab/Jenkins) to incidents + Slack
- Observability alerts (OTEL/Splunk) to incidents + Slack
- Auditable, append-only events

## Run (local)

```
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m devops_orchestrator.app
```

## Environment

```
KLYNX_DEVOPS_HOST=0.0.0.0
KLYNX_DEVOPS_PORT=9400
KLYNX_DEVOPS_AUDIT_PATH=run/devops_audit.jsonl

# KLYNX Dragon
KLYNX_DRAGON_BASE_URL=https://dragon.klynxai.com
KLYNX_DRAGON_TOKEN=commander-token
KLYNX_DRAGON_ORG=default-org
KLYNX_DRAGON_REGION=global

# Incident + Slack
KLYNX_INCIDENT_API_BASE=https://klynxai.com/api/incidents
KLYNX_SLACK_WEBHOOK_URL=

# GitLab/Jenkins (optional)
GITLAB_API_BASE=
GITLAB_TOKEN=
GITLAB_PROJECT_ID=
JENKINS_URL=
JENKINS_USER=
JENKINS_TOKEN=
```

## Notes
- All actions are gated by KLYNX Dragon decisions.
- If a decision is not approved, the orchestrator returns `pending_approval`.
- Incidents created on CI/CD failures or OTEL/Splunk alerts.
