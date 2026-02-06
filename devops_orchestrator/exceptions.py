"""
Exception hierarchy for Dragon DevOps Orchestrator
Provides structured error handling with clear error codes
"""

class DevOpsException(Exception):
    """Base exception for all DevOps orchestrator operations"""
    def __init__(self, message: str, error_code: str, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> dict:
        """Convert exception to dict for API responses"""
        return {
            "error": self.error_code,
            "message": self.message,
            "details": self.details
        }


# Dragon API Exceptions
class DragonException(DevOpsException):
    """Base exception for Dragon API operations"""
    pass


class DragonAPIError(DragonException):
    """Dragon API returned an error"""
    pass


class DragonTimeoutError(DragonException):
    """Dragon API request timed out"""
    pass


class DragonAuthError(DragonException):
    """Dragon authentication failed"""
    pass


class DragonConnectionError(DragonException):
    """Failed to connect to Dragon API"""
    pass


# GitHub API Exceptions
class GitHubException(DevOpsException):
    """Base exception for GitHub operations"""
    pass


class GitHubAPIError(GitHubException):
    """GitHub API returned an error"""
    pass


class GitHubAuthError(GitHubException):
    """GitHub authentication failed"""
    pass


class GitHubRateLimitError(GitHubException):
    """GitHub API rate limit exceeded"""
    pass


class GitHubNotFoundError(GitHubException):
    """GitHub resource not found"""
    pass


# Incident Management Exceptions
class IncidentException(DevOpsException):
    """Base exception for incident operations"""
    pass


class IncidentAPIError(IncidentException):
    """Incident API returned an error"""
    pass


class IncidentNotFoundError(IncidentException):
    """Incident not found"""
    pass


# Validation Exceptions
class ValidationException(DevOpsException):
    """Input validation failed"""
    pass


class InvalidRepositoryError(ValidationException):
    """Invalid repository format"""
    pass


class InvalidBranchError(ValidationException):
    """Invalid branch name"""
    pass


class InvalidFilePathError(ValidationException):
    """Invalid file path"""
    pass


# Authentication & Authorization Exceptions
class AuthenticationError(DevOpsException):
    """Authentication failed"""
    pass


class AuthorizationError(DevOpsException):
    """Authorization/permission denied"""
    pass


# State Management Exceptions
class StateException(DevOpsException):
    """State management error"""
    pass


class StateNotFoundError(StateException):
    """State not found"""
    pass


class StateLockError(StateException):
    """Failed to acquire state lock"""
    pass
