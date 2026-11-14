from typing import Tuple
from app.schemas.agents import (
    AssessmentAgentOutput,
    LearningPlannerAgentOutput,
    OrchestratorRequest,
    SkillAnalysisAgentOutput,
)
from app.services.gemini_service import GeminiStructuredClient


def deterministic_assessment_agent(
    req: OrchestratorRequest,
    skill_out: SkillAnalysisAgentOutput,
    planner_out: LearningPlannerAgentOutput,
) -> AssessmentAgentOutput:
    latest = req.recent_quiz_scores[0] if req.recent_quiz_scores else None
    remediation_needed = bool(latest is not None and latest < 50)
    advanced_eligible = bool(latest is not None and latest >= 80)

    topics = list(
        dict.fromkeys(
            skill_out.weak_skills
            + skill_out.missing_skills[:3]
            + [m.topic for m in planner_out.modules[:3]]
        )
    )[:6]
    if not topics:
        topics = ["JavaScript", "REST APIs"]

    diff = "beginner" if remediation_needed else "advanced" if advanced_eligible else "mixed"
    summary = (
        f"Recommended diagnostic focus on {', '.join(topics[:3])} at {diff} difficulty."
        + (" Remediation triggered from <50% score." if remediation_needed else "")
    )
    return AssessmentAgentOutput(
        recommended_quiz_topics=topics,
        recommended_difficulty=diff,
        remediation_needed=remediation_needed,
        advanced_unlock_eligible=advanced_eligible,
        diagnostic_summary=summary,
    )


async def run_assessment_agent(
    client: GeminiStructuredClient,
    req: OrchestratorRequest,
    skill_out: SkillAnalysisAgentOutput,
    planner_out: LearningPlannerAgentOutput,
) -> Tuple[AssessmentAgentOutput, int, bool]:
    prompt = (
        f"Recommend next diagnostic assessment focus.\n"
        f"Weak skills: {skill_out.weak_skills}, Missing: {skill_out.missing_skills}\n"
        f"Planned modules: {[m.topic for m in planner_out.modules]}\n"
        f"Recent quiz scores: {req.recent_quiz_scores}"
    )
    return await client.generate_structured(
        system_instruction="You are the Assessment Agent. Recommend targeted diagnostics and output valid JSON.",
        prompt=prompt,
        schema_model=AssessmentAgentOutput,
        fallback_fn=lambda: deterministic_assessment_agent(req, skill_out, planner_out),
    )
