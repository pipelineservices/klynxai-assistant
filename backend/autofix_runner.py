# autofix_runner.py
from typing import Dict, Any

import json

# For now we do a *safe dry run* with AWS CLI command suggestions.
# Later you can swap this to real boto3 calls if you want.


def simulate_autofix(incident: Dict[str, Any]) -> str:
    """
    Given an incident row from the DB, produce a safe description
    of what we *would* do, and the actual AWS CLI commands.
    This string is posted back to Slack.
    """
    summary = incident.get("summary", "")
    resources = incident.get("resources", "")
    region = incident.get("region") or "us-east-1"

    explanation_lines = []
    cli_commands = []

    if "Unable to delete VPC" in summary and resources:
        vpc_id = resources
        explanation_lines.append(
            f"Detected VPC deletion issue for `{vpc_id}` in `{region}`."
        )
        cli_commands.extend(
            [
                f"aws ec2 describe-subnets --filters Name=vpc-id,Values={vpc_id} --region {region}",
                f"aws ec2 describe-network-interfaces --filters Name=vpc-id,Values={vpc_id} --region {region}",
                f"aws ec2 describe-security-groups --filters Name=vpc-id,Values={vpc_id} --region {region}",
                f"aws ec2 describe-route-tables --filters Name=vpc-id,Values={vpc_id} --region {region}",
                f"aws ec2 delete-vpc --vpc-id {vpc_id} --region {region}  # run only after cleaning dependencies",
            ]
        )
    else:
        explanation_lines.append(
            "No specific auto-fix handler implemented yet for this incident type. "
            "Providing generic diagnostics commands."
        )
        cli_commands.append("# TODO: Add provider-specific commands here.")

    explanation = "\n".join(f"- {line}" for line in explanation_lines)
    commands_block = "\n".join(f"`{cmd}`" for cmd in cli_commands)

    result_text = (
        "*Auto-fix dry-run result:*\n"
        f"{explanation}\n\n"
        "*Suggested AWS CLI commands:*\n"
        f"{commands_block}\n"
        "\n_No destructive actions were executed automatically._"
    )

    # You could also return structured JSON if you want:
    _ = json.dumps(
        {"explanation": explanation_lines, "cli_commands": cli_commands},
        indent=2,
    )

    return result_text
