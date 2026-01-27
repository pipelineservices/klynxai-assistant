import uuid
import requests

from devops_orchestrator import settings


def create_pr_draft(repo: str, branch: str, title: str, description: str) -> dict:
    pr_id = f"draft-{uuid.uuid4()}"
    if settings.DRY_RUN:
        return {"ok": True, "status": "draft_only", "pr_id": pr_id}
    if settings.GITLAB_API_BASE and settings.GITLAB_TOKEN and settings.GITLAB_PROJECT_ID:
        url = f"{settings.GITLAB_API_BASE}/projects/{settings.GITLAB_PROJECT_ID}/merge_requests"
        payload = {
            "source_branch": branch,
            "target_branch": "main",
            "title": title,
            "description": description,
        }
        resp = requests.post(url, headers={"PRIVATE-TOKEN": settings.GITLAB_TOKEN}, data=payload, timeout=15)
        return {"ok": resp.ok, "status": "created" if resp.ok else "failed", "pr_id": pr_id, "data": resp.json()}
    return {"ok": False, "status": "not_configured", "pr_id": pr_id}
