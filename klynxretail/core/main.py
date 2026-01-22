import uvicorn
from core import settings

if __name__ == "__main__":
    uvicorn.run("core.app:app", host=settings.HOST, port=settings.PORT, log_level="info")
