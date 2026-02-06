"""
Authentication and Authorization for Dragon DevOps Orchestrator
Supports API key and JWT token authentication
"""

from typing import Optional
from datetime import datetime, timedelta
import jwt
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from devops_orchestrator import settings
from devops_orchestrator.exceptions import AuthenticationError, AuthorizationError

# Security scheme
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = settings.DRAGON_API_TOKEN  # Use existing token as JWT secret for now
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class User:
    """Represents an authenticated user"""
    def __init__(self, user_id: str, email: str, roles: list[str]):
        self.user_id = user_id
        self.email = email
        self.roles = roles

    def has_role(self, role: str) -> bool:
        """Check if user has a specific role"""
        return role in self.roles

    def can_approve(self, decision_id: str) -> bool:
        """Check if user can approve decisions"""
        return self.has_role("approver") or self.has_role("admin")

    def can_create_incident(self) -> bool:
        """Check if user can create incidents"""
        return self.has_role("developer") or self.has_role("approver") or self.has_role("admin")


def create_access_token(user_id: str, email: str, roles: list[str]) -> str:
    """Create a JWT access token"""
    expires = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "email": email,
        "roles": roles,
        "exp": expires,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError(
            message="Token has expired",
            error_code="TOKEN_EXPIRED",
            details={}
        )
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(
            message="Invalid token",
            error_code="INVALID_TOKEN",
            details={"error": str(e)}
        )


def verify_api_key(api_key: str) -> bool:
    """Verify API key against configured keys"""
    # For now, use Dragon API token as valid API key
    # TODO: Implement proper API key management
    return api_key == settings.DRAGON_API_TOKEN


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> User:
    """
    Dependency to get current authenticated user.
    Supports both JWT tokens and API keys.
    """
    token = credentials.credentials

    # Try JWT token first
    try:
        payload = decode_access_token(token)
        return User(
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            roles=payload.get("roles", [])
        )
    except AuthenticationError:
        pass  # Try API key next

    # Try API key
    if verify_api_key(token):
        # API keys get admin role for backward compatibility
        return User(
            user_id="api-key-user",
            email="api@klynxai.com",
            roles=["admin", "approver", "developer"]
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def require_role(role: str):
    """Dependency factory to require specific role"""
    async def role_checker(user: User = Security(get_current_user)) -> User:
        if not user.has_role(role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {role}"
            )
        return user
    return role_checker


# Pre-built role dependencies
async def require_approver(user: User = Security(get_current_user)) -> User:
    """Require approver role"""
    if not user.can_approve(""):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires approver permissions"
        )
    return user


async def require_admin(user: User = Security(get_current_user)) -> User:
    """Require admin role"""
    if not user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin permissions"
        )
    return user


# Optional authentication - for public endpoints that can work with or without auth
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security, auto_error=False)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
