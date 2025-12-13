# vision_ocr.py
import os
import base64
import logging
from typing import Optional

import requests
from openai import OpenAI

SLACK_BOT_TOKEN = os.environ["SLACK_BOT_TOKEN"]
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

_logger = logging.getLogger("klynx.vision_ocr")
_client: Optional[OpenAI] = None
if OPENAI_API_KEY:
    _client = OpenAI(api_key=OPENAI_API_KEY)


async def extract_text_from_slack_image(file_id: str) -> str:
    """
    Download a Slack image (files.info + url_private) and run OCR via OpenAI vision.

    Returns plain text extracted from the screenshot. If anything fails, returns "".
    """

    if not SLACK_BOT_TOKEN:
        _logger.error("SLACK_BOT_TOKEN not set, cannot download image")
        return ""

    # 1) Get file metadata
    try:
        info_resp = requests.get(
            "https://slack.com/api/files.info",
            params={"file": file_id},
            headers={"Authorization": f"Bearer {SLACK_BOT_TOKEN}"},
            timeout=15,
        )
        info_resp.raise_for_status()
        info = info_resp.json()
        if not info.get("ok"):
            _logger.error(f"files.info failed: {info}")
            return ""

        file_obj = info.get("file", {})
        url_private = file_obj.get("url_private")
        if not url_private:
            _logger.error("No url_private in Slack file info")
            return ""
    except Exception as e:
        _logger.exception(f"Error calling Slack files.info: {e}")
        return ""

    # 2) Download the image bytes
    try:
        img_resp = requests.get(
            url_private,
            headers={"Authorization": f"Bearer {SLACK_BOT_TOKEN}"},
            timeout=30,
        )
        img_resp.raise_for_status()
        img_bytes = img_resp.content
    except Exception as e:
        _logger.exception(f"Error downloading Slack image: {e}")
        return ""

    # 3) Run OCR using OpenAI vision
    if not _client:
        _logger.error("OPENAI_API_KEY not set, skipping OCR")
        return ""

    try:
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        model = os.environ.get("OPENAI_VISION_MODEL", "gpt-4.1-mini")

        resp = _client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an OCR engine. Extract all legible text from the "
                        "image. Return ONLY the plain text. No explanation."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_image",
                            "image_url": {
                                "url": f"data:image/png;base64,{b64}"
                            },
                        }
                    ],
                },
            ],
            temperature=0.0,
        )

        text = (resp.choices[0].message.content or "").strip()
        _logger.info("OCR extracted %d characters from image %s", len(text), file_id)
        return text
    except Exception as e:
        _logger.exception(f"Error running OpenAI vision OCR: {e}")
        return ""
