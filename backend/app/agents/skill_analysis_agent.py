from typing import Tuple
from app.schemas.agents import (
    OrchestratorRequest,
    ProfileAgentOutput,
    SkillAnalysisAgentOutput,
    SkillGapSummary,
)
from app.services.gemini_service import GeminiStructuredClient


def deterministic_skill_analysis(
    req: OrchestratorRequest,
    _profile_out: ProfileAgentOutput,
) -> SkillAnalysisAgentOutput:
    verified_map = {v.skill.lower(): v for v in req.verified_skills}
    strong, weak, missing, unverified = [], [], [], []
    gaps = []

    self_skills = {s.skill.lower(): s for s in req.self_reported_skills}
    for key, s_item in self_skills.items():
        v = verified_map.get(key)
        if v is None or v.score is None:
            unverified.append(f"{s_item.skill} (self-rated {s_item.rating}% — unverified)")

    for target in req.career_requirements:
        v = verified_map.get(target.skill.lower())
        score = v.score if v else None
        if score is None:
            cls = "Missing"
            missing.append(target.skill)
            gap_size = float(target.required_score)
        elif score >= target.required_score:
            cls = "Strong"
            strong.append(target.skill)
            gap_size = 0.0
        elif score < 50:
            cls = "Weak"
            weak.append(target.skill)
            gap_size = float(target.required_score - score)
        else:
            cls = "Intermediate"
            gap_size = float(max(0, target.required_score - score))

        priority = round(gap_size * target.importance, 2)
        gaps.append(
            SkillGapSummary(
                skill=target.skill,
                classification=cls,
                verified_score=score,
                required_score=target.required_score,
                priority_score=priority,
            )
        )

    gaps.sort(key=lambda g: g.priority_score, reverse=True)
    return SkillAnalysisAgentOutput(
        strong_skills=strong,
        weak_skills=weak,
        missing_skills=missing,
        unverified_claims=unverified,
        prioritized_gaps=gaps,
        evidence_summary=(
            f"Verified {len(strong)} strong, {len(weak)} weak, and {len(missing)} unverified/missing "
            f"skills against {req.target_career_title} targets."
        ),
    )


async def run_skill_analysis_agent(
    client: GeminiStructuredClient,
    req: OrchestratorRequest,
    profile_out: ProfileAgentOutput,
) -> Tuple[SkillAnalysisAgentOutput, int, bool]:
    prompt = (
        f"Separate self-reported skills from verified evidence for {req.target_career_title}.\n"
        f"Verified: {[v.model_dump() for v in req.verified_skills]}\n"
        f"Self-reported (unverified): {[s.model_dump() for s in req.self_reported_skills]}\n"
        f"Targets: {[c.model_dump() for c in req.career_requirements]}"
    )
    return await client.generate_structured(
        system_instruction=(
            "You are the Skill Analysis Agent. Never count self-reported ratings as verified mastery. "
            "Output strict JSON matching the schema."
        ),
        prompt=prompt,
        schema_model=SkillAnalysisAgentOutput,
        fallback_fn=lambda: deterministic_skill_analysis(req, profile_out),
    )
