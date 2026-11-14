from typing import Tuple
from app.schemas.agents import OrchestratorRequest, ProfileAgentOutput
from app.services.gemini_service import GeminiStructuredClient


def deterministic_profile(req: OrchestratorRequest) -> ProfileAgentOutput:
    hours = max(2, min(60, req.weekly_study_hours))
    daily_mins = max(20, round((hours * 60) / 5))
    pace = "steady" if hours <= 6 else "balanced" if hours <= 14 else "intensive"
    return ProfileAgentOutput(
        normalized_weekly_hours=hours,
        daily_study_minutes=daily_mins,
        recommended_pace=pace,
        preferred_language=req.preferred_language,
        preferred_learning_style=req.preferred_learning_style,
        constraints_summary=(
            f"{req.full_name} targets {req.target_career_title} with {hours}h/week "
            f"({daily_mins}m across 5 study days) in {req.preferred_language} ({req.preferred_learning_style})."
        ),
    )


async def run_profile_agent(
    client: GeminiStructuredClient,
    req: OrchestratorRequest,
) -> Tuple[ProfileAgentOutput, int, bool]:
    prompt = (
        f"Normalize learner study constraints into JSON.\n"
        f"Student: {req.full_name}, Career: {req.target_career_title}, "
        f"Weekly Hours: {req.weekly_study_hours}, Language: {req.preferred_language}, "
        f"Style: {req.preferred_learning_style}, Study Time: {req.preferred_study_time}."
    )
    return await client.generate_structured(
        system_instruction="You are the SkillPath Profile Agent. Output strict JSON matching the schema.",
        prompt=prompt,
        schema_model=ProfileAgentOutput,
        fallback_fn=lambda: deterministic_profile(req),
    )
