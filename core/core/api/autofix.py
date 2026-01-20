import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.autofix_store import AutofixStore


router = APIRouter(prefix="/api/autofix", tags=["autofix"])

store = AutofixStore(path=os.getenv("AUTOFIX_STORE_PATH", "/opt/klynxaiagent/run/autofix_jobs.json"))


class AutofixRequest(BaseModel):
    incident_id: Optional[str] = None
    summary: Optional[str] = None
    vpc_id: str
    region: str
    dry_run: bool = True


@router.post("/request")
def request_autofix(req: AutofixRequest) -> Dict[str, Any]:
    job_id = "job_" + uuid.uuid4().hex
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "job_id": job_id,
        "incident_id": req.incident_id,
        "summary": req.summary,
        "vpc_id": req.vpc_id,
        "region": req.region,
        "dry_run": req.dry_run,
        "status": "queued",
        "created_at": now,
        "updated_at": now,
        "logs": [],
    }
    store.upsert(record)
    return {"job_id": job_id, "status": "queued"}


@router.get("/{job_id}")
def get_job(job_id: str) -> Dict[str, Any]:
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return job
