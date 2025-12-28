import os
import uvicorn

def main():
    port = int(os.getenv("PORT", "9000"))
    uvicorn.run("core.app:app", host="0.0.0.0", port=port, log_level="info")

if __name__ == "__main__":
    main()

