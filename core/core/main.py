import os
import uvicorn

PORT = int(os.getenv("PORT", "9000"))

def main():
    uvicorn.run(
        "core.app:app",
        host="0.0.0.0",
        port=PORT,
        log_level="info",
    )

if __name__ == "__main__":
    main()

