from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.executors.aws.vpc_delete_dryrun import aws_vpc_delete_dryrun

router = APIRouter(prefix="/api/autofix", tags=["autofix"])


class AwsVpcDryRunRequest(BaseModel):
    vpc_id: str
    region: str = "us-east-1"


@router.post("/aws/vpc/delete/dry-run")
def aws_vpc_delete_dryrun_api(req: AwsVpcDryRunRequest):
    if not req.vpc_id.startswith("vpc-"):
        raise HTTPException(status_code=400, detail="Invalid VPC ID")

    result = aws_vpc_delete_dryrun(
        vpc_id=req.vpc_id,
        region=req.region,
    )

    return result

