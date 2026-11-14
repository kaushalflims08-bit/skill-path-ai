from fastapi import APIRouter, Depends

from app.auth import AuthenticatedUser
from app.config import Settings, get_settings
from app.schemas.agents import MentorChatRequest, MentorChatResponse
from app.services.gemini_service import GeminiStructuredClient
from app.services.rate_limiter import enforce_rate_limit

router = APIRouter(prefix="/api/v1/mentor", tags=["mentor"])


@router.post("/chat", response_model=MentorChatResponse)
async def mentor_chat(
    payload: MentorChatRequest,
    user: AuthenticatedUser = Depends(enforce_rate_limit),
    settings: Settings = Depends(get_settings),
) -> MentorChatResponse:
    client = GeminiStructuredClient(settings)
    system_instruction = "\n".join(
        part
        for part in [
            "You are Pathy, a warm, encouraging college study companion and career mentor for SkillPath AI.",
            "Never guarantee jobs, placements, or salaries.",
            "Keep advice concrete, step-by-step, and adapted to the learner context.",
            f"Mentor mode: {payload.mode}.",
            f"Language preference: {payload.language}.",
            f"Authenticated learner UID: {user.uid}.",
            f"Learner context: {payload.learnerContext}" if payload.learnerContext else "",
            f"Lesson context: {payload.lessonContext}" if payload.lessonContext else "",
        ]
        if part
    )

    history_str = "\n".join(f"{h.role}: {h.content}" for h in payload.history[-6:])
    prompt = f"{history_str}\n\nStudent message: {payload.message}".strip()
    fallback = (
        f"Hi! Focusing on your {payload.mode} request in {payload.language}: break the concept "
        f"into a 15-minute worked example, test edge cases with 3 inputs, and verify with a short quiz."
    )

    reply_text, used_fallback = await client.generate_text(
        system_instruction=system_instruction,
        prompt=prompt,
        fallback_text=fallback,
    )

    return MentorChatResponse(
        source="offline" if used_fallback else "gemini",
        notice="Offline mentor guidance." if used_fallback else None,
        reply=reply_text,
    )
