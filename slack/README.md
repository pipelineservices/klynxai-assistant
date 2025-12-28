# slack

Runs the Slack Agent API on port 9100.

## Endpoints
- GET /health
- POST /slack/events   (Slack Events API)
- POST /slack/actions  (Interactive buttons)

## Env
Create /opt/klynxaiagent/slack/.env

Required:
- SLACK_BOT_TOKEN=xoxb-...
- SLACK_SIGNING_SECRET=...
- CORE_BASE_URL=http://127.0.0.1:9000

Optional:
- SLACK_APP_TOKEN=xapp-... (only if you later use Socket Mode)

