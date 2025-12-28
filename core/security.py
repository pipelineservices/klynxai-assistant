from fastapi import Request, HTTPException
import os

API_KEY = os.getenv("KLYNX_API_KEY", "klynx-admin-123")

# Role → allowed HTTP methods
ROLE_MATRIX = {
    "viewer": {"GET", "POST"},
    "operator": {"GET", "POST"},
    "admin": {"GET", "POST", "PUT", "PATCH", "DELETE"},
}

PUBLIC_PREFIXES = (
    "/",
    "/health",
    "/docs",
    "/openapi",
)

WEBHOOK_PREFIXES = (
    "/otel",
    "/slack",
)

def authorize(request: Request):
    path = request.url.path
    method = request.method.upper()

    # Allow system / public routes
    if path.startswith(PUBLIC_PREFIXES):
        return

    # Allow webhook integrations
    if path.startswith(WEBHOOK_PREFIXES):
        return

    api_key = request.headers.get("X-API-Key")
    role = (request.headers.get("X-Role") or "viewer").lower()

    if not api_key or api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    allowed = ROLE_MATRIX.get(role)
    if not allowed:
        raise HTTPException(status_code=403, detail="Invalid role")

    if method not in allowed:
        raise HTTPException(
            status_code=403,
            detail=f"Role '{role}' not allowed for {method}"
        )

