from __future__ import annotations

import json
from typing import Any, Dict, List

from core.mcp import MCPClient
from core.models import Product
from core import settings


class MCPConnector:
    def __init__(self) -> None:
        self.client = MCPClient(
            endpoint=settings.MCP_ENDPOINT,
            protocol_version=settings.MCP_PROTOCOL_VERSION,
            client_name="klynx-retail",
            client_version="0.1.0",
            auth_token=settings.MCP_AUTH_TOKEN,
            timeout_s=settings.MCP_TIMEOUT_S,
        )

    def _parse_products(self, payload: Any) -> List[Product]:
        if payload is None:
            return []
        if isinstance(payload, dict) and "items" in payload:
            items = payload["items"]
            return [Product(**item) for item in items]
        return []

    def _extract_from_content(self, result: Dict[str, Any]) -> List[Product]:
        content = result.get("content", [])
        for item in content:
            if item.get("type") == "json":
                return self._parse_products(item.get("data"))
            if item.get("type") == "text":
                text = item.get("text", "")
                try:
                    return self._parse_products(json.loads(text))
                except json.JSONDecodeError:
                    continue
        return []

    def search(self, query: str, limit: int = 5) -> List[Product]:
        response = self.client.call_tool(
            settings.MCP_TOOL_CATALOG_SEARCH,
            {"query": query, "limit": limit, "region": settings.DEFAULT_REGION},
        )
        result = response.get("result", {})
        products = self._parse_products(result)
        if products:
            return products
        return self._extract_from_content(result)
