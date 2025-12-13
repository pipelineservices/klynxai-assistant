# KLYNX AI Enterprise Backend (Final)

## Endpoints
- Slack: `POST /api/slack/events`
- OTEL: `POST /api/alerts/otel`
- Incidents list: `GET /api/incidents`
- Incident by thread: `GET /api/incidents/{thread_ts}`
- Multi-cloud outage placeholder: `GET /api/outages`

## Install
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 127.0.0.1 --port 8000
```
