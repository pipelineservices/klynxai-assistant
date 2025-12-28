import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.api.incidents import router as incidents_router

PORT = int(os.getenv("PORT", "9000"))

app = FastAPI(title="KLYNX Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(incidents_router, prefix="/api/incidents")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)

