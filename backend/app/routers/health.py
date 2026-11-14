from fastapi import APIRouter, Depends

from app.config import Settings, get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
@router.get("/api/v1/health")
async def health_check(settings: Settings = Depends(get_settings)) -> dict:
    return {
        "ok": True,
        "service": settings.app_name,
        "environment": settings.environment,
        "geminiConfigured": settings.has_gemini_key,
        "mode": "live" if settings.has_gemini_key else "offline-deterministic",
    }
