# core (LLM Gateway)

Runs the central "brain" API consumed by chat_ui / slack / otel.

## Run (dev)
```bash
cd /opt/klynxaiagent/core
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e ../shared
pip install -r <(python - <<'PY'
print("fastapi\nuvicorn\nhttpx\npython-dotenv")
PY)
python main.py

