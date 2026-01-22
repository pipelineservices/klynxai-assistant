import os

APP_NAME = "klynx-retail-core"
HOST = os.getenv("KLYNX_RETAIL_HOST", "0.0.0.0")
PORT = int(os.getenv("KLYNX_RETAIL_PORT", "9200"))
DEFAULT_REGION = os.getenv("KLYNX_RETAIL_REGION", "US")
