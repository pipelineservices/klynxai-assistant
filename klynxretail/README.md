# Klynx Retail Assistant (PoC)

Retailer-agnostic shopping assistant demo with mock data.

## Local Run

### Core API + Web

1) Create a venv in `core` and install requirements:
   - python -m venv .venv
   - .venv\Scripts\Activate.ps1
   - pip install -r requirements.txt

2) Start the API (serves web UI too):
   - python main.py

3) Open: http://127.0.0.1:9200

### Slack (optional)

1) Create a venv in `slack` and install requirements:
   - python -m venv .venv
   - .venv\Scripts\Activate.ps1
   - pip install -r requirements.txt

2) Start slack service:
   - uvicorn app:app --host 0.0.0.0 --port 9101

## Notes
- This PoC uses mock retailer data.
- Replace `core/connectors/mock.py` with real connectors when you get API access.
