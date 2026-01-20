import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

from core.autofix_store import AutofixStore


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def log(job: Dict[str, Any], message: str) -> None:
    job.setdefault("logs", [])
    job["logs"].append(f"{utc_now()} {message}")


def assume_role_if_needed(region: str):
    import boto3

    role_arn = os.getenv("AUTOFIX_ASSUME_ROLE_ARN", "").strip()
    if not role_arn:
        return boto3.session.Session(region_name=region)

    sts = boto3.client("sts", region_name=region)
    resp = sts.assume_role(RoleArn=role_arn, RoleSessionName="klynx-autofix")
    creds = resp["Credentials"]
    return boto3.session.Session(
        aws_access_key_id=creds["AccessKeyId"],
        aws_secret_access_key=creds["SecretAccessKey"],
        aws_session_token=creds["SessionToken"],
        region_name=region,
    )


def list_dependencies(ec2, vpc_id: str) -> List[str]:
    summary: List[str] = []
    subnets = ec2.describe_subnets(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("Subnets", [])
    summary.append(f"subnets={len(subnets)}")

    igws = ec2.describe_internet_gateways(Filters=[{"Name": "attachment.vpc-id", "Values": [vpc_id]}]).get(
        "InternetGateways", []
    )
    summary.append(f"igw={len(igws)}")

    rts = ec2.describe_route_tables(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("RouteTables", [])
    summary.append(f"route_tables={len(rts)}")

    sgs = ec2.describe_security_groups(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("SecurityGroups", [])
    summary.append(f"security_groups={len(sgs)}")

    endpoints = ec2.describe_vpc_endpoints(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("VpcEndpoints", [])
    summary.append(f"vpc_endpoints={len(endpoints)}")

    nacs = ec2.describe_network_acls(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("NetworkAcls", [])
    summary.append(f"network_acls={len(nacs)}")

    return summary


def delete_vpc(ec2, vpc_id: str, job: Dict[str, Any]) -> None:
    # Best-effort cleanup order. Individual failures are logged and not fatal.
    endpoints = ec2.describe_vpc_endpoints(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("VpcEndpoints", [])
    for ep in endpoints:
        try:
            ec2.delete_vpc_endpoints(VpcEndpointIds=[ep["VpcEndpointId"]])
            log(job, f"deleted vpc_endpoint {ep['VpcEndpointId']}")
        except Exception as exc:
            log(job, f"failed deleting vpc_endpoint {ep['VpcEndpointId']}: {exc}")

    igws = ec2.describe_internet_gateways(Filters=[{"Name": "attachment.vpc-id", "Values": [vpc_id]}]).get(
        "InternetGateways", []
    )
    for igw in igws:
        try:
            ec2.detach_internet_gateway(InternetGatewayId=igw["InternetGatewayId"], VpcId=vpc_id)
            ec2.delete_internet_gateway(InternetGatewayId=igw["InternetGatewayId"])
            log(job, f"deleted igw {igw['InternetGatewayId']}")
        except Exception as exc:
            log(job, f"failed deleting igw {igw['InternetGatewayId']}: {exc}")

    subnets = ec2.describe_subnets(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("Subnets", [])
    for subnet in subnets:
        try:
            ec2.delete_subnet(SubnetId=subnet["SubnetId"])
            log(job, f"deleted subnet {subnet['SubnetId']}")
        except Exception as exc:
            log(job, f"failed deleting subnet {subnet['SubnetId']}: {exc}")

    rts = ec2.describe_route_tables(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("RouteTables", [])
    for rt in rts:
        is_main = any(assoc.get("Main") for assoc in rt.get("Associations", []))
        if is_main:
            continue
        try:
            ec2.delete_route_table(RouteTableId=rt["RouteTableId"])
            log(job, f"deleted route_table {rt['RouteTableId']}")
        except Exception as exc:
            log(job, f"failed deleting route_table {rt['RouteTableId']}: {exc}")

    sgs = ec2.describe_security_groups(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("SecurityGroups", [])
    for sg in sgs:
        if sg.get("GroupName") == "default":
            continue
        try:
            ec2.delete_security_group(GroupId=sg["GroupId"])
            log(job, f"deleted security_group {sg['GroupId']}")
        except Exception as exc:
            log(job, f"failed deleting security_group {sg['GroupId']}: {exc}")

    nacs = ec2.describe_network_acls(Filters=[{"Name": "vpc-id", "Values": [vpc_id]}]).get("NetworkAcls", [])
    for nac in nacs:
        if nac.get("IsDefault"):
            continue
        try:
            ec2.delete_network_acl(NetworkAclId=nac["NetworkAclId"])
            log(job, f"deleted network_acl {nac['NetworkAclId']}")
        except Exception as exc:
            log(job, f"failed deleting network_acl {nac['NetworkAclId']}: {exc}")

    try:
        ec2.delete_vpc(VpcId=vpc_id)
        log(job, f"deleted vpc {vpc_id}")
    except Exception as exc:
        log(job, f"failed deleting vpc {vpc_id}: {exc}")
        raise


def process_job(store: AutofixStore, job: Dict[str, Any]) -> None:
    job["status"] = "running"
    job["updated_at"] = utc_now()
    log(job, "job started")
    store.upsert(job)

    region = job.get("region", "")
    vpc_id = job.get("vpc_id", "")
    dry_run = bool(job.get("dry_run", True))
    allow_delete = os.getenv("AUTOFIX_ALLOW_DELETE", "false").lower() == "true"

    try:
        import boto3  # noqa: F401
    except Exception as exc:
        log(job, f"boto3 not available: {exc}")
        job["status"] = "failed"
        job["updated_at"] = utc_now()
        store.upsert(job)
        return

    if not region or not vpc_id:
        log(job, "missing region or vpc_id")
        job["status"] = "failed"
        job["updated_at"] = utc_now()
        store.upsert(job)
        return

    session = assume_role_if_needed(region)
    ec2 = session.client("ec2")

    deps = list_dependencies(ec2, vpc_id)
    log(job, f"dependencies: {', '.join(deps)}")

    if dry_run or not allow_delete:
        log(job, "dry_run enabled or AUTOFIX_ALLOW_DELETE not true; no changes applied")
        job["status"] = "completed"
        job["updated_at"] = utc_now()
        store.upsert(job)
        return

    try:
        delete_vpc(ec2, vpc_id, job)
        job["status"] = "completed"
    except Exception:
        job["status"] = "failed"
    finally:
        job["updated_at"] = utc_now()
        store.upsert(job)


def run_once() -> None:
    store = AutofixStore(path=os.getenv("AUTOFIX_STORE_PATH", "/opt/klynxaiagent/run/autofix_jobs.json"))
    jobs = store.list_all()
    for job in jobs:
        if job.get("status") == "queued":
            process_job(store, job)


if __name__ == "__main__":
    interval = int(os.getenv("AUTOFIX_POLL_INTERVAL_SECS", "5"))
    while True:
        run_once()
        time.sleep(interval)
