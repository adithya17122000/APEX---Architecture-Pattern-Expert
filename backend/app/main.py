from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers.architecture import router as architecture_router

settings = get_settings()

app = FastAPI(
    title="APEX - Architecture Pattern EXpert",
    description="AI-powered architectural design generator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(architecture_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "APEX"}
