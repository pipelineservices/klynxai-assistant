from typing import Dict, List


def aws_vpc_delete_dryrun(*, vpc_id: str, region: str) -> Dict:
    """
    Enterprise-safe DRY-RUN executor.
    NO AWS API calls.
    Produces an ordered remediation plan.
    """

    dependencies = [
        {
            "resource": "Subnets",
            "reason": "VPC cannot be deleted while subnets exist",
            "aws_cli": f"aws ec2 describe-subnets --filters Name=vpc-id,Values={vpc_id}",
            "delete_hint": "Delete all subnets first",
        },
        {
            "resource": "Internet Gateway",
            "reason": "IGW must be detached before VPC deletion",
            "aws_cli": f"aws ec2 describe-internet-gateways --filters Name=attachment.vpc-id,Values={vpc_id}",
            "delete_hint": "Detach and delete IGW",
        },
        {
            "resource": "NAT Gateways",
            "reason": "NAT gateways block VPC deletion",
            "aws_cli": f"aws ec2 describe-nat-gateways --filter Name=vpc-id,Values={vpc_id}",
            "delete_hint": "Delete NAT gateways",
        },
        {
            "resource": "Route Tables",
            "reason": "Custom route tables must be removed",
            "aws_cli": f"aws ec2 describe-route-tables --filters Name=vpc-id,Values={vpc_id}",
            "delete_hint": "Delete custom route tables (not main)",
        },
        {
            "resource": "Security Groups",
            "reason": "Custom SGs must be deleted (except default)",
            "aws_cli": f"aws ec2 describe-security-groups --filters Name=vpc-id,Values={vpc_id}",
            "delete_hint": "Delete non-default SGs",
        },
        {
            "resource": "VPC Endpoints",
            "reason": "Endpoints block deletion",
            "aws_cli": f"aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values={vpc_id}",
            "delete_hint": "Delete VPC endpoints",
        },
    ]

    ordered_plan: List[str] = [
        "Delete NAT Gateways",
        "Detach & delete Internet Gateway",
        "Delete VPC Endpoints",
        "Delete custom Route Tables",
        "Delete custom Security Groups",
        "Delete all Subnets",
        "Delete VPC",
    ]

    return {
        "mode": "dry-run",
        "cloud": "aws",
        "service": "ec2",
        "operation": "delete_vpc",
        "vpc_id": vpc_id,
        "region": region,
        "blocked_by": dependencies,
        "execution_order": ordered_plan,
        "risk": "LOW (dry-run)",
        "note": "No AWS APIs were called. This is a safe diagnostic plan.",
    }

