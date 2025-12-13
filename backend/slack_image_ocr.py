import os
import re
import aiohttp
from typing import Optional

from PIL import Image
import pytesseract

# Optional OpenAI Vision fallback
try:
    from openai import OpenAI
    _oai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except Exception:
    _oai = None


async def _download_slack_file(url_private: str, slack_bot_token: str) -> bytes:
    headers = {"Authorization": f"Bearer {slack_bot_token}"}
    async with aiohttp.ClientSession() as session:
        async with session.get(url_private, headers=headers, timeout=60) as resp:
            resp.raise_for_status()
            return await resp.read()


def _tesseract_ocr(image_bytes: bytes) -> str:
    from io import BytesIO
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    text = pytesseract.image_to_string(img)
    # cleanup
    text = re.sub(r"[ \t]+\n", "\n", text).strip()
    return text


async def _openai_vision_ocr(image_bytes: bytes) -> str:
    """
    Uses OpenAI vision to extract text from image.
    Requires OPENAI_API_KEY.
    """
    if _oai is None:
        return ""

    import base64
    b64 = base64.b64encode(image_bytes).decode("utf-8")

    model = os.environ.get("OPENAI_VISION_MODEL", os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"))
    prompt = (
        "Extract all readable text from this screenshot. "
        "Return only the extracted text. If no text, return empty."
    )

    resp = _oai.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
            ]}
        ],
        temperature=0.0
    )
    return (resp.choices[0].message.content or "").strip()


async def extract_text_from_slack_image(
    url_private: str,
    slack_bot_token: str,
) -> str:
    """
    Primary: local Tesseract OCR.
    Fallback: OpenAI Vision OCR (if configured).
    """
    data = await _download_slack_file(url_private, slack_bot_token)

    # Try local OCR first
    try:
        txt = _tesseract_ocr(data)
        if txt:
            return txt
    except Exception:
        pass

    # Fallback to OpenAI (optional)
    try:
        txt2 = await _openai_vision_ocr(data)
        return txt2
    except Exception:
        return ""
