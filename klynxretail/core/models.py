from typing import List, Optional
from pydantic import BaseModel, Field

class Product(BaseModel):
    id: str
    title: str
    brand: str
    price: float
    currency: str = "USD"
    retailer: str
    url: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    rating: Optional[float] = None
    availability: Optional[str] = "in_stock"

class SearchRequest(BaseModel):
    query: str
    region: Optional[str] = None
    limit: int = 5

class SearchResponse(BaseModel):
    request_id: str
    items: List[Product]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    region: Optional[str] = None
    limit: int = 5

class ChatResponse(BaseModel):
    request_id: str
    reply: str
    items: List[Product] = []

class EventRequest(BaseModel):
    event: str
    session_id: str
    metadata: dict = {}
