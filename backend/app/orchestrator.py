from app.agents.assessment_agent import run_assessment_agent
from app.agents.career_advisor_agent import run_career_advisor_agent
from app.agents.learning_planner_agent import run_learning_planner_agent
from app.agents.mentor_agent import run_mentor_agent
from app.agents.profile_agent import run_profile_agent
from app.agents.skill_analysis_agent import run_skill_analysis_agent
from app.schemas.agents import (
    AgentStepTrace,
    OrchestratorRequest,
    OrchestratorResponse,
)
from app.services.gemini_service import GeminiStructuredClient


async def run_six_agent_orchestrator(
    *,
    user_id: str,
    req: OrchestratorRequest,
    gemini_client: GeminiStructuredClient,
) -> OrchestratorResponse:
    steps: list[AgentStepTrace] = []

    profile_out, r1, f1 = await run_profile_agent(gemini_client, req)
    steps.append(
        AgentStepTrace(
            agent_name="Profile Agent",
            status="completed" if not f1 else "validated",
            summary=f"Normalized {profile_out.normalized_weekly_hours}h/week ({profile_out.recommended_pace} pace).",
            retries_used=r1,
            used_fallback=f1,
        )
    )

    skill_out, r2, f2 = await run_skill_analysis_agent(gemini_client, req, profile_out)
    steps.append(
        AgentStepTrace(
            agent_name="Skill Analysis Agent",
            status="completed" if not f2 else "validated",
            summary=skill_out.evidence_summary,
            retries_used=r2,
            used_fallback=f2,
        )
    )

    career_out, r3, f3 = await run_career_advisor_agent(gemini_client, req, skill_out)
    steps.append(
        AgentStepTrace(
            agent_name="Career Advisor Agent",
            status="completed" if not f3 else "validated",
            summary=f"{career_out.target_career} readiness: {career_out.readiness_percentage}%.",
            retries_used=r3,
            used_fallback=f3,
        )
    )

    planner_out, r4, f4 = await run_learning_planner_agent(
        gemini_client, req, profile_out, skill_out, career_out
    )
    steps.append(
        AgentStepTrace(
            agent_name="Learning Planner Agent",
            status="completed" if not f4 else "validated",
            summary=f"Planned {len(planner_out.modules)} modules ({planner_out.adaptation_rule_applied}).",
            retries_used=r4,
            used_fallback=f4,
        )
    )

    assessment_out, r5, f5 = await run_assessment_agent(gemini_client, req, skill_out, planner_out)
    steps.append(
        AgentStepTrace(
            agent_name="Assessment Agent",
            status="completed" if not f5 else "validated",
            summary=assessment_out.diagnostic_summary,
            retries_used=r5,
            used_fallback=f5,
        )
    )

    mentor_out, r6, f6 = await run_mentor_agent(
        gemini_client, req, profile_out, planner_out, assessment_out
    )
    steps.append(
        AgentStepTrace(
            agent_name="AI Mentor Agent",
            status="completed" if not f6 else "validated",
            summary=f"Prepared Pathy kickoff in {mentor_out.language}.",
            retries_used=r6,
            used_fallback=f6,
        )
    )

    return OrchestratorResponse(
        user_id=user_id,
        profile_output=profile_out,
        skill_analysis=skill_out,
        career_advisor=career_out,
        learning_planner=planner_out,
        assessment_plan=assessment_out,
        mentor_kickoff=mentor_out,
        steps=steps,
    )
