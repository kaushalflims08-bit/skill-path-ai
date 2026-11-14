from typing import Tuple
from app.schemas.agents import (
    AssessmentAgentOutput,
    LearningPlannerAgentOutput,
    MentorAgentOutput,
    OrchestratorRequest,
    ProfileAgentOutput,
)
from app.services.gemini_service import GeminiStructuredClient


def deterministic_mentor_agent(
    req: OrchestratorRequest,
    profile_out: ProfileAgentOutput,
    planner_out: LearningPlannerAgentOutput,
    assessment_out: AssessmentAgentOutput,
) -> MentorAgentOutput:
    first_module = planner_out.modules[0].title if planner_out.modules else req.target_career_title
    lang = profile_out.preferred_language
    if lang == "Tamil":
        note = f"வணக்கம் {req.full_name}! உங்கள் {req.target_career_title} பயணத்தில் இன்று '{first_module}' பாடத்தில் {profile_out.daily_study_minutes} நிமிடங்கள் பயிற்சி செய்யலாம்."
        prompt = f"'{first_module}' பற்றி எளிய உதாரணத்துடன் விளக்கவா?"
    elif lang == "Tanglish":
        note = f"Hey {req.full_name}! Super momentum ({req.streak_days}-day streak). Today '{first_module}' la {profile_out.daily_study_minutes} mins focus pannalam!"
        prompt = f"'{first_module}' topic-a step-by-step practice panlama?"
    else:
        note = (
            f"Hi {req.full_name}! Your {req.target_career_title} roadmap is updated "
            f"({planner_out.estimated_weeks_to_complete} weeks est. at {profile_out.normalized_weekly_hours}h/week). "
            f"Start with '{first_module}'."
        )
        prompt = (
            f"Ready for a quick {assessment_out.recommended_quiz_topics[0] if assessment_out.recommended_quiz_topics else 'skill'} "
            f"concept check or walkthrough?"
        )
    return MentorAgentOutput(
        encouragement_note=note,
        next_action_prompt=prompt,
        language=lang,
    )


async def run_mentor_agent(
    client: GeminiStructuredClient,
    req: OrchestratorRequest,
    profile_out: ProfileAgentOutput,
    planner_out: LearningPlannerAgentOutput,
    assessment_out: AssessmentAgentOutput,
) -> Tuple[MentorAgentOutput, int, bool]:
    prompt = (
        f"Create a concise encouraging kickoff message from Pathy for {req.full_name} in {profile_out.preferred_language}.\n"
        f"Target career: {req.target_career_title}, First module: {planner_out.modules[0].title if planner_out.modules else 'Foundations'}, "
        f"Assessment plan: {assessment_out.diagnostic_summary}"
    )
    return await client.generate_structured(
        system_instruction=(
            "You are Pathy, the AI Mentor Agent. Be warm, concise, honest (never guarantee jobs/salaries), "
            "and respond in the requested language."
        ),
        prompt=prompt,
        schema_model=MentorAgentOutput,
        fallback_fn=lambda: deterministic_mentor_agent(req, profile_out, planner_out, assessment_out),
    )
