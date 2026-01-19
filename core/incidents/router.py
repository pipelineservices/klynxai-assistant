from fastapi import APIRouter
from .service import get_incidents

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("")
def list_incidents():
    return {"incidents": get_incidents()}

