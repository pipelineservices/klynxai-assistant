from fastapi import APIRouter, Request
import logging

from slack_agent.services.slack_client import post_to_slack

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/slack/events")
async def slack_events(request: Request):
    payload = await request.json()

    # Slack URL verification
    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    event = payload.get("event", {})

    # Ignore bot messages to avoid loops
    if event.get("subtype") == "bot_message":
        return {"ok": True}

    text = event.get("text", "").lower()
    channel_id = event.get("channel")
    thread_ts = event.get("ts")

    logger.info(f"Slack event received: {text}")

    # ============================
    # 🚨 INCIDENT INTERCEPT (FIX)
    # ============================
    if "unable to delete vpc" in text or "delete vpc" in text:
        slack_payload = {
            "channel": channel_id,
            "thread_ts": thread_ts,
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "🚨 Incident Detected"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": "*Incident ID:*\n`INC-43D3`"},
                        {"type": "mrkdwn", "text": "*Severity:*\nSEV-3"}
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Summary:*\nAI Assistant App unable to remove VPC `vpc-0123456789abcdef` in `us-east-1`"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Probable cause:*\n• VPC has dependent resources (subnets, gateways, ENIs)\n• Insufficient IAM permissions\n• VPC currently in use"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Suggested next steps:*\n• Check and remove dependent resources\n• Verify IAM permissions\n• Retry VPC deletion"
                    }
                },
                {"type": "divider"},
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Auto-fix plan (dry-run, cloud-safe):*\n• Enumerate and delete dependencies\n• Ensure no EC2 usage\n• Retry VPC deletion"
                    }
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Apply Auto-Fix"},
                            "style": "primary",
                            "value": "apply_fix",
                            "action_id": "apply_fix"
                        },
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Skip"},
                            "style": "danger",
                            "value": "skip_fix",
                            "action_id": "skip_fix"
                        }
                    ]
                }
            ]
        }

        post_to_slack(slack_payload)
        return {"ok": True}

    # ============================
    # 🔁 FALLBACK (UNCHANGED)
    # ============================
    fallback_text = f"I understand. You said: {event.get('text')}"
    post_to_slack({
        "channel": channel_id,
        "thread_ts": thread_ts,
        "text": fallback_text
    })

    return {"ok": True}

