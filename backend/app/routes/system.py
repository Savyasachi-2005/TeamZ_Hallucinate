from fastapi import APIRouter
from ..config import YOUTUBE_API_KEY, GEMINI_API_KEY

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Niche Trend Intelligence Copilot API"}


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "youtube_api_key_configured": bool(YOUTUBE_API_KEY),
        "gemini_api_key_configured": bool(GEMINI_API_KEY),
    }
