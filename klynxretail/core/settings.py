import os

APP_NAME = "klynx-retail-core"
HOST = os.getenv("KLYNX_RETAIL_HOST", "0.0.0.0")
PORT = int(os.getenv("KLYNX_RETAIL_PORT", "9200"))
DEFAULT_REGION = os.getenv("KLYNX_RETAIL_REGION", "US")

MCP_ENABLED = os.getenv("KLYNX_MCP_ENABLED", "false").lower() == "true"
MCP_ENDPOINT = os.getenv("KLYNX_MCP_ENDPOINT", "http://127.0.0.1:9090/mcp")
MCP_AUTH_TOKEN = os.getenv("KLYNX_MCP_AUTH_TOKEN")
MCP_PROTOCOL_VERSION = os.getenv("KLYNX_MCP_PROTOCOL_VERSION", "2025-03-26")
MCP_TOOL_CATALOG_SEARCH = os.getenv("KLYNX_MCP_TOOL_CATALOG_SEARCH", "catalog.search")
MCP_TIMEOUT_S = int(os.getenv("KLYNX_MCP_TIMEOUT_S", "10"))

CHECKOUT_BASE_URL = os.getenv("KLYNX_RETAIL_CHECKOUT_URL", "https://retail.klynxai.com/checkout")
ANALYTICS_DB_PATH = os.getenv("KLYNX_RETAIL_ANALYTICS_DB", os.path.join("run", "analytics.db"))
