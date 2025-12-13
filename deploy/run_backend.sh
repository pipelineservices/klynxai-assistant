
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="YOUR_KEY_HERE"
uvicorn backend.main:app --host 0.0.0.0 --port 8000
