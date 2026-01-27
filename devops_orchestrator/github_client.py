import base64
import json
import time
from typing import Optional

import jwt
import requests

from devops_orchestrator import settings


def _pem_key() -> str:
    if not settings.GITHUB_APP_PRIVATE_KEY_PEM:
        return ""
    return settings.GITHUB_APP_PRIVATE_KEY_PEM.replace("\\n", "\n")


def _app_jwt() -> str:
    now = int(time.time())
    payload = {"iat": now - 60, "exp": now + 540, "iss": settings.GITHUB_APP_ID}
    return jwt.encode(payload, _pem_key(), algorithm="RS256")


def _app_headers() -> dict:
    return {
        "Authorization": f"Bearer {_app_jwt()}",
        "Accept": "application/vnd.github+json",
    }


def _request(method: str, url: str, headers: dict, **kwargs) -> requests.Response:
    for attempt in range(3):
        resp = requests.request(method, url, headers=headers, timeout=20, **kwargs)
        if resp.status_code < 500:
            return resp
        time.sleep(1 + attempt)
    return resp


def get_installation_id(owner: str, repo: str) -> Optional[int]:
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/installation"
    resp = _request("GET", url, _app_headers())
    if not resp.ok:
        return None
    return resp.json().get("id")


def get_installation_token(installation_id: int) -> Optional[str]:
    url = f"{settings.GITHUB_API_BASE}/app/installations/{installation_id}/access_tokens"
    resp = _request("POST", url, _app_headers())
    if not resp.ok:
        return None
    return resp.json().get("token")


def _install_headers(owner: str, repo: str) -> Optional[dict]:
    installation_id = get_installation_id(owner, repo)
    if not installation_id:
        return None
    token = get_installation_token(installation_id)
    if not token:
        return None
    return {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}


def get_workflow_run(owner: str, repo: str, run_id: int) -> Optional[dict]:
    headers = _install_headers(owner, repo)
    if not headers:
        return None
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs/{run_id}"
    resp = _request("GET", url, headers)
    return resp.json() if resp.ok else None


def get_workflow_jobs(owner: str, repo: str, run_id: int) -> Optional[dict]:
    headers = _install_headers(owner, repo)
    if not headers:
        return None
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs/{run_id}/jobs"
    resp = _request("GET", url, headers)
    return resp.json() if resp.ok else None


def get_repo(owner: str, repo: str) -> Optional[dict]:
    headers = _install_headers(owner, repo)
    if not headers:
        return None
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}"
    resp = _request("GET", url, headers)
    return resp.json() if resp.ok else None


def get_branch_sha(owner: str, repo: str, branch: str) -> Optional[str]:
    headers = _install_headers(owner, repo)
    if not headers:
        return None
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/git/ref/heads/{branch}"
    resp = _request("GET", url, headers)
    if not resp.ok:
        return None
    return resp.json().get("object", {}).get("sha")


def create_branch(owner: str, repo: str, base_sha: str, branch: str) -> bool:
    headers = _install_headers(owner, repo)
    if not headers:
        return False
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/git/refs"
    payload = {"ref": f"refs/heads/{branch}", "sha": base_sha}
    resp = _request("POST", url, headers, json=payload)
    return resp.ok


def create_file(owner: str, repo: str, branch: str, path: str, content: str, message: str) -> bool:
    headers = _install_headers(owner, repo)
    if not headers:
        return False
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    payload = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
        "branch": branch,
    }
    resp = _request("PUT", url, headers, json=payload)
    return resp.ok


def open_pull_request(owner: str, repo: str, branch: str, title: str, body: str) -> Optional[str]:
    headers = _install_headers(owner, repo)
    if not headers:
        return None
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/pulls"
    payload = {"title": title, "head": branch, "base": settings.GITHUB_DEFAULT_BRANCH, "body": body, "draft": True}
    resp = _request("POST", url, headers, json=payload)
    if not resp.ok:
        return None
    return resp.json().get("html_url")


def rerun_workflow(owner: str, repo: str, run_id: int) -> bool:
    headers = _install_headers(owner, repo)
    if not headers:
        return False
    url = f"{settings.GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs/{run_id}/rerun"
    resp = _request("POST", url, headers)
    return resp.ok
