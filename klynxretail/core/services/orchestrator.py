from typing import List
from core.connectors.mock import MockConnector
from core.connectors.mcp_connector import MCPConnector
from core.models import Product
from core import settings

class Orchestrator:
    def __init__(self) -> None:
        if settings.MCP_ENABLED:
            self.connectors = [MCPConnector()]
        else:
            self.connectors = [MockConnector()]

    def search(self, query: str, limit: int = 5) -> List[Product]:
        results: List[Product] = []
        for c in self.connectors:
            results.extend(c.search(query, limit=limit))
        # simple de-dupe by id
        seen = set()
        unique: List[Product] = []
        for p in results:
            if p.id in seen:
                continue
            seen.add(p.id)
            unique.append(p)
        return unique[: max(1, limit)]
