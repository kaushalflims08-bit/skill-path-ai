from typing import Tuple
from app.schemas.agents import (
    CareerAdvisorAgentOutput,
    OrchestratorRequest,
    SkillAnalysisAgentOutput,
)
from app.services.gemini_service import GeminiStructuredClient


def deterministic_career_advisor(
    req: OrchestratorRequest,
    skill_out: SkillAnalysisAgentOutput,
) -> CareerAdvisorAgentOutput:
    total_req = max(1, len(skill_out.prioritized_gaps))
    matched_ratio = 0.0
    for gap in skill_out.prioritized_gaps:
        if gap.verified_score is not None:
            matched_ratio += min(1.0, gap.verified_score / max(1, gap.required_score))
    readiness = round((matched_ratio / total_req) * 100, 1)
    focus = [
        g.skill
        for g in skill_out.prioritized_gaps
        if g.classification in {"Weak", "Missing", "Intermediate"}
    ][:5]
    return CareerAdvisorAgentOutput(
        target_career=req.target_career_title,
        readiness_percentage=readiness,
        recommended_focus_skills=focus,
        advisory_summary=(
            f"Current verified readiness for {req.target_career_title} is {readiness}%. "
            f"Highest-leverage next skills: {', '.join(focus) if focus else 'capstone projects'}."
        ),
        disclaimer="SkillPath AI never guarantees jobs, placements, or salaries.",
    )


async def run_career_advisor_agent(
    client: GeminiStructuredClient,
    req: OrchestratorRequest,
    skill_out: SkillAnalysisAgentOutput,
) -> Tuple[CareerAdvisorAgentOutput, int, bool]:
    prompt = (
        f"Evaluate verified readiness for {req.target_career_title}.\n"
        f"Prioritized gaps: {[g.model_dump() for g in skill_out.prioritized_gaps]}\n"
        f"Strong: {skill_out.strong_skills}, Weak: {skill_out.weak_skills}, Missing: {skill_out.missing_skills}"
    )
    return await client.generate_structured(
        system_instruction=(
            "You are the Career Advisor Agent. Explain readiness transparently and never guarantee "
            "employment, salaries, or placements."
        ),
        prompt=prompt,
        schema_model=CareerAdvisorAgentOutput,
        fallback_fn=lambda: deterministic_career_advisor(req, skill_out),
    )
