def summarize_rca(logs_excerpt: str) -> str:
    if not logs_excerpt:
        return "RCA pending: logs unavailable."
    lines = [line.strip() for line in logs_excerpt.splitlines() if line.strip()]
    if not lines:
        return "RCA pending: logs empty."
    first = lines[0][:280]
    return f"Likely root cause from logs: {first}"
