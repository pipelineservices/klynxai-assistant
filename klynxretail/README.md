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

## MCP integration (optional)

Enable MCP to fetch catalog data from an MCP server instead of mock data.

Environment variables:
- `KLYNX_MCP_ENABLED=true`
- `KLYNX_MCP_ENDPOINT=http://127.0.0.1:9090/mcp`
- `KLYNX_MCP_AUTH_TOKEN=...` (optional)
- `KLYNX_MCP_PROTOCOL_VERSION=2025-03-26`
- `KLYNX_MCP_TOOL_CATALOG_SEARCH=catalog.search`
- `KLYNX_MCP_TIMEOUT_S=10`

## Embed widget (Rufus-style)

Add this script tag to any third-party site:

```
<script>
  window.KlynxRetailWidget = {
    baseUrl: "https://retail.klynxai.com",
    label: "Rufus",
    title: "Klynx Retail Assistant",
    accent: "#2563eb",
    position: "right"
  };
</script>
<script src="https://retail.klynxai.com/embed/widget.js"></script>
```

This opens a right-side drawer using the embedded UI (`/?embed=1`).
