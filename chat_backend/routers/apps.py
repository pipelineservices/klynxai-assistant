from fastapi import APIRouter

router = APIRouter(prefix="/apps", tags=["apps"])

@router.get("/list")
def list_apps():
    return {
        "apps": [
            {"id": "gmail", "name": "Gmail", "status": "stub"},
            {"id": "slack", "name": "Slack", "status": "stub"},
            {"id": "instagram", "name": "Instagram", "status": "stub"},
            {"id": "facebook", "name": "Facebook", "status": "stub"},
        ]
    }
