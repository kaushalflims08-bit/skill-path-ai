import math
from typing import Tuple
from app.schemas.agents import (
    CareerAdvisorAgentOutput,
    LearningPlannerAgentOutput,
    OrchestratorRequest,
    PlannedModule,
    ProfileAgentOutput,
    SkillAnalysisAgentOutput,
)
from app.services.gemini_service import GeminiStructuredClient


def deterministic_learning_planner(
    req: OrchestratorRequest,
    profile_out: ProfileAgentOutput,
    skill_out: SkillAnalysisAgentOutput,
    career_out: CareerAdvisorAgentOutput,
) -> LearningPlannerAgentOutput:
    modules: list[PlannedModule] = []
    latest_score = req.recent_quiz_scores[0] if req.recent_quiz_scores else None
    rule = "Standard prerequisite gap sequencing"

    # Check repeated struggle or low score
    if latest_score is not None and latest_score < 50:
        weak_topic = req.weak_topics[0] if req.weak_topics else (skill_out.weak_skills[0] if skill_out.weak_skills else "Core Fundamentals")
        alt_format = "video" if profile_out.preferred_learning_style == "hands-on" else "hands-on"
        modules.append(
            PlannedModule(
                topic=weak_topic,
                title=f"{weak_topic} Guided Remediation & Worked Clinic",
                difficulty="beginner",
                estimated_minutes=40,
                recommended_format=alt_format,
                reason=f"Recent score ({latest_score}%) below 50% triggered remediation.",
                is_remediation=True,
            )
        )
        rule = f"Low score remediation + format adaptation ({alt_format})"

    for gap in skill_out.prioritized_gaps[:6]:
        if gap.classification == "Strong" and latest_score is not None and latest_score >= 80:
            modules.append(
                PlannedModule(
                    topic=gap.skill,
                    title=f"{gap.skill} Advanced Edge-Case Challenge",
                    difficulty="advanced",
                    estimated_minutes=50,
                    recommended_format=profile_out.preferred_learning_style,
                    reason="High score (>=80%) unlocked advanced depth challenge.",
                    is_advanced_challenge=True,
                )
            )
            rule = "High score (>=80%) unlocked advanced track"
        elif gap.classification != "Strong":
            diff = "beginner" if gap.classification in {"Missing", "Weak"} else "intermediate"
            modules.append(
                PlannedModule(
                    topic=gap.skill,
                    title=f"{gap.skill}: Core Concepts & Practice",
                    difficulty=diff,
                    estimated_minutes=60,
                    recommended_format=profile_out.preferred_learning_style,
                    reason=f"{gap.classification} gap toward {career_out.target_career} ({gap.required_score}% target).",
                )
            )

    if not modules:
        modules.append(
            PlannedModule(
                topic=career_out.target_career,
                title=f"{career_out.target_career} Portfolio Capstone",
                difficulty="advanced",
                estimated_minutes=120,
                recommended_format="hands-on",
                reason="Core requirements met — consolidate skills in a portfolio project.",
                is_advanced_challenge=True,
            )
        )

    total_mins = sum(m.estimated_minutes for m in modules)
    weeks = max(1, math.ceil((total_mins / 60) / max(1, profile_out.normalized_weekly_hours)))
    return LearningPlannerAgentOutput(
        modules=modules,
        adaptation_rule_applied=rule,
        estimated_weeks_to_complete=weeks,
    )


async def run_learning_planner_agent(
    client: GeminiStructuredClient,
    req: OrchestratorRequest,
    profile_out: ProfileAgentOutput,
    skill_out: SkillAnalysisAgentOutput,
    career_out: CareerAdvisorAgentOutput,
) -> Tuple[LearningPlannerAgentOutput, int, bool]:
    prompt = (
        f"Build an ordered modular learning plan for {req.target_career_title}.\n"
        f"Weekly hours: {profile_out.normalized_weekly_hours}, Style: {profile_out.preferred_learning_style}\n"
        f"Prioritized gaps: {[g.model_dump() for g in skill_out.prioritized_gaps]}\n"
        f"Recent quiz scores: {req.recent_quiz_scores}, Weak topics: {req.weak_topics}\n"
        f"Trigger: {req.trigger_reason}"
    )
    return await client.generate_structured(
        system_instruction=(
            "You are the Learning Planner Agent. Sequence fundamentals before advanced topics, "
            "add remediation if scores <50%, and unlock advanced challenges if scores >=80%."
        ),
        prompt=prompt,
        schema_model=LearningPlannerAgentOutput,
        fallback_fn=lambda: deterministic_learning_planner(req, profile_out, skill_out, career_out),
    )
