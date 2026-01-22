from typing import List
from core.models import Product
from core.mock_data import MOCK_PRODUCTS

class MockConnector:
    name = "mock"

    def search(self, query: str, limit: int = 5) -> List[Product]:
        q = (query or "").strip().lower()
        out = []
        for item in MOCK_PRODUCTS:
            hay = " ".join([item.get("title", ""), item.get("brand", ""), item.get("retailer", "")]).lower()
            if q in hay:
                out.append(Product(**item))
        if not out:
            out = [Product(**p) for p in MOCK_PRODUCTS]
        return out[: max(1, limit)]
