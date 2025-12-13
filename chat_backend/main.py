from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.health import router as health_router
from routers.apps import router as apps_router
from routers.tools import router as tools_router
from routers.oauth import router as oauth_router
from routers.chat import router as chat_router

app = FastAPI(title="KLYNX Chat Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(apps_router)
app.include_router(tools_router)
app.include_router(oauth_router)
app.include_router(chat_router)

