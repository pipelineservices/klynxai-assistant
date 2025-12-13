import os
import secrets
from urllib.parse import urlencode
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse

router = APIRouter(prefix="/oauth", tags=["oauth"])

OAUTH_STATE = {}

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:8010/api/oauth/google/callback",
)

SLACK_CLIENT_ID = os.getenv("SLACK_CLIENT_ID", "")
SLACK_REDIRECT_URI = os.getenv(
    "SLACK_REDIRECT_URI",
    "http://localhost:8010/api/oauth/slack/callback",
)

@router.get("/google/start")
def google_start():
    if not GOOGLE_CLIENT_ID:
        return JSONResponse(
            {"error": "Missing GOOGLE_CLIENT_ID"}, status_code=400
        )

    state = secrets.token_urlsafe(24)
    OAUTH_STATE[state] = {"provider": "google"}

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return RedirectResponse(
        "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    )

@router.get("/google/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state or state not in OAUTH_STATE:
        return JSONResponse({"error": "Invalid callback"}, status_code=400)

    return {"ok": True, "provider": "google", "code_received": True}

@router.get("/slack/start")
def slack_start():
    if not SLACK_CLIENT_ID:
        return JSONResponse(
            {"error": "Missing SLACK_CLIENT_ID"}, status_code=400
        )

    state = secrets.token_urlsafe(24)
    OAUTH_STATE[state] = {"provider": "slack"}

    params = {
        "client_id": SLACK_CLIENT_ID,
        "redirect_uri": SLACK_REDIRECT_URI,
        "scope": "chat:write,channels:read",
        "state": state,
    }
    return RedirectResponse(
        "https://slack.com/oauth/v2/authorize?" + urlencode(params)
    )

@router.get("/slack/callback")
async def slack_callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state or state not in OAUTH_STATE:
        return JSONResponse({"error": "Invalid callback"}, status_code=400)

    return {"ok": True, "provider": "slack", "code_received": True}
