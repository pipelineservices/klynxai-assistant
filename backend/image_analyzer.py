from __future__ import annotations
import io
from typing import Tuple, List
from PIL import Image

def extract_text_from_image_bytes(image_bytes: bytes) -> Tuple[str, List[str]]:
    warnings: List[str] = []
    try:
        import pytesseract  # type: ignore
    except Exception as e:
        return ("", [f"OCR not available (pytesseract import failed): {e}"])

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return ("", [f"Image decode failed: {e}"])

    try:
        import cv2  # type: ignore
        import numpy as np  # type: ignore
        arr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(arr, cv2.COLOR_BGR2GRAY)
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        img = Image.fromarray(gray)
    except Exception:
        pass

    try:
        text = pytesseract.image_to_string(img)
        text = (text or "").strip()
        if not text:
            warnings.append("OCR ran but produced no text (image may be too low-res).")
        return (text, warnings)
    except Exception as e:
        return ("", [f"OCR failed (is system tesseract installed?): {e}"])
