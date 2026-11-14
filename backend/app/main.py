from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import init_firebase_admin
from app.config import get_settings
from app.routers import agents, assessments, health, mentor, projects


def create_app() -> FastAPI:
    settings = get_settings()
    init_firebase_admin(settings)

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description=(
            "SkillPath AI multi-agent FastAPI backend with Firebase Admin Auth, "
            "server-only Gemini integration, structured Pydantic outputs, and rate limiting."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    app.include_router(health.router)
    app.include_router(agents.router)
    app.include_router(mentor.router)
    app.include_router(assessments.router)
    app.include_router(projects.router)

    return app


app = create_app()
