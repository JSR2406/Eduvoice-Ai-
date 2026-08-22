import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys

# Ensure Vercel can find the 'app' module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
from app.config.settings import get_settings
from app.api.routes.api_router import router
from app.api.routes.sarvam_test_router import router as sarvam_test_router
from app.api.routes.websocket_router import router as websocket_router

settings = get_settings()

app = FastAPI(
    title="EduVoice AI API",
    description="AI Voice Content Creator for Teachers — Powered by Sarvam AI",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core API routes
app.include_router(router, prefix="/api")

# Sarvam AI testing & validation routes
app.include_router(sarvam_test_router)

# WebSocket routes for Multi-Agent real-time Voice
app.include_router(websocket_router)


@app.get("/")
def root():
    return {
        "message": "EduVoice AI API",
        "version": "2.0.0",
        "powered_by": "Sarvam AI",
        "docs": "/docs",
        "sarvam_tests": "/api/sarvam-test/health",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "EduVoice AI Backend",
        "ai_provider": "Sarvam AI",
        "provider_status": "active",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)
