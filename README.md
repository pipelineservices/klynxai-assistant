# KLYNX AI Platform

Enterprise-grade AI Operations Platform providing:
- Incident ingestion
- Automated remediation suggestions
- Slack integration
- RAG-powered reasoning
- OTEL observability
- Role-based access control
- Pluggable LLMs (Bedrock / fallback)
- Extensible playbook engine

---

## Architecture Overview

KLYNX is composed of multiple services:

- **Core API (FastAPI)** – central brain
- **Incident Engine** – incident lifecycle + actions
- **OTEL Ingest API** – telemetry → incidents
- **RAG Engine** – document-based reasoning
- **LLM Router** – Bedrock / fallback
- **Slack Agent** – alerts & interaction
- **Chat UI** – enterprise assistant frontend
- **OTEL Collector** – tracing & telemetry backend

---

## Services & Ports

| Component | Port |
|--------|------|
| Core API | 9000 |
| Slack Agent | 9100 |
| Chat UI | 3000 |
| OTEL Collector | 4317 |
| Jaeger UI | 16686 |

---

## Authentication

Headers required:

