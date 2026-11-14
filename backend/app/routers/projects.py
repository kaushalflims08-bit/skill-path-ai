from fastapi import APIRouter, Depends

from app.auth import AuthenticatedUser
from app.config import Settings, get_settings
from app.schemas.agents import (
    ProjectReviewRequest,
    ProjectReviewResponse,
    ProjectReviewSchema,
)
from app.services.gemini_service import GeminiStructuredClient
from app.services.rate_limiter import enforce_rate_limit

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.post("/review", response_model=ProjectReviewResponse)
async def review_project(
    payload: ProjectReviewRequest,
    _user: AuthenticatedUser = Depends(enforce_rate_limit),
    settings: Settings = Depends(get_settings),
) -> ProjectReviewResponse:
    def deterministic() -> ProjectReviewSchema:
        has_repo = bool((payload.githubUrl or "").strip())
        has_live = bool((payload.liveUrl or "").strip())
        base = 65 + (12 if has_repo else 0) + (8 if has_live else 0) + min(12, len(payload.description) // 20)
        return ProjectReviewSchema(
            summary=f"Constructive rubric feedback for {payload.projectTitle}.",
            strengths=[
                f"Covers core skills: {', '.join(payload.skills[:3]) or 'Full Stack fundamentals'}",
                "GitHub repository linked for inspection" if has_repo else "Clear feature implementation summary",
            ],
            improvements=[
                "Add automated tests for invalid inputs and edge cases",
                "Include architecture notes and live demo instructions" if not has_live else "Document API error contracts",
            ],
            estimatedScore=min(96, base),
        )

    client = GeminiStructuredClient(settings)
    review, _retries, used_fallback = await client.generate_structured(
        system_instruction=(
            "Provide constructive rubric feedback for a college software project. "
            "Never guarantee jobs, salaries, or hiring outcomes."
        ),
        prompt=(
            f"Project: {payload.projectTitle}\nSkills: {payload.skills}\n"
            f"Description: {payload.description}\nGitHub: {payload.githubUrl}\n"
            f"Live URL: {payload.liveUrl}\nRubric: {payload.rubricCriteria}"
        ),
        schema_model=ProjectReviewSchema,
        fallback_fn=deterministic,
    )

    return ProjectReviewResponse(
        source="offline" if used_fallback else "gemini",
        notice=(
            "AI feedback — not an official grade. (Sample output — connect Gemini for live AI generation.)"
            if used_fallback
            else "AI feedback — not an official grade."
        ),
        review=review,
    )
