from fastapi import APIRouter, Depends

from app.auth import AuthenticatedUser
from app.config import Settings, get_settings
from app.schemas.agents import (
    AdaptiveRecommendationResponse,
    AssessmentAnalysisRequest,
)
from app.services.gemini_service import GeminiStructuredClient
from app.services.rate_limiter import enforce_rate_limit

router = APIRouter(prefix="/api/v1/assessments", tags=["assessments"])


@router.post("/analyze", response_model=AdaptiveRecommendationResponse)
async def analyze_assessment(
    payload: AssessmentAnalysisRequest,
    _user: AuthenticatedUser = Depends(enforce_rate_limit),
    settings: Settings = Depends(get_settings),
) -> AdaptiveRecommendationResponse:
    primary_topic = payload.weak_topics[0] if payload.weak_topics else payload.topics[0]
    prior_fails = payload.prior_fail_counts.get(primary_topic, 0)

    def deterministic() -> AdaptiveRecommendationResponse:
        if payload.score_percentage < 50:
            if prior_fails >= 1:
                switched = "video" if payload.current_learning_style == "hands-on" else "hands-on"
                return AdaptiveRecommendationResponse(
                    action="switch_format_remediation",
                    target_topic=primary_topic,
                    recommended_format=switched,
                    explanation=(
                        f"Repeated struggle ({prior_fails + 1} attempts <50%) in {primary_topic}. "
                        f"Switched remediation format to {switched} while preserving full history."
                    ),
                    source="deterministic",
                )
            return AdaptiveRecommendationResponse(
                action="remediation",
                target_topic=primary_topic,
                recommended_format=payload.current_learning_style,
                explanation=(
                    f"Score {payload.score_percentage}% (<50%) on {payload.title}. "
                    f"Inserted beginner remediation clinic for {primary_topic}."
                ),
                source="deterministic",
            )
        if payload.score_percentage >= 80:
            return AdaptiveRecommendationResponse(
                action="unlock_advanced",
                target_topic=payload.topics[0],
                recommended_format=payload.current_learning_style,
                explanation=(
                    f"High score ({payload.score_percentage}% >= 80%) unlocked advanced "
                    f"challenge material and test-out eligibility for {payload.topics[0]}."
                ),
                source="deterministic",
            )
        return AdaptiveRecommendationResponse(
            action="steady_progress",
            target_topic=primary_topic,
            recommended_format=payload.current_learning_style,
            explanation=f"Solid score ({payload.score_percentage}%). Continue sequential roadmap modules.",
            source="deterministic",
        )

    client = GeminiStructuredClient(settings)
    if not client.is_configured:
        return deterministic()

    result, _retries, used_fallback = await client.generate_structured(
        system_instruction="Analyze assessment performance and determine adaptive roadmap recommendation.",
        prompt=f"Assessment payload: {payload.model_dump_json()}",
        schema_model=AdaptiveRecommendationResponse,
        fallback_fn=deterministic,
    )
    if not used_fallback:
        result.source = "gemini"
    return result
