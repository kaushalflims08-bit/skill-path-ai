from typing import List, Literal, Optional
from pydantic import BaseModel, Field


PreferredLanguage = Literal["English", "Tamil", "Tanglish"]
LearningStyle = Literal["video", "reading", "hands-on"]
ConfidenceLevel = Literal["low", "medium", "high"]
MentorMode = Literal[
    "Explain",
    "Socratic",
    "Debug my code",
    "Mock interviewer",
    "Study planner",
    "Motivation coach",
]


class SelfSkillInput(BaseModel):
    skill: str = Field(..., min_length=1, max_length=80)
    rating: int = Field(..., ge=0, le=100)


class VerifiedSkillInput(BaseModel):
    skill: str = Field(..., min_length=1, max_length=80)
    score: Optional[float] = Field(default=None, ge=0, le=100)
    confidence: ConfidenceLevel = "low"
    evidence_count: int = Field(default=0, ge=0, le=1000)


class CareerRequirementInput(BaseModel):
    skill: str = Field(..., min_length=1, max_length=80)
    required_score: int = Field(default=70, ge=10, le=100)
    importance: int = Field(default=3, ge=1, le=5)
    estimated_effort_hours: int = Field(default=10, ge=1, le=200)


class OrchestratorRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    target_career_id: str = Field(..., min_length=1, max_length=80)
    target_career_title: str = Field(..., min_length=1, max_length=120)
    weekly_study_hours: int = Field(default=10, ge=1, le=80)
    preferred_language: PreferredLanguage = "English"
    preferred_learning_style: LearningStyle = "hands-on"
    preferred_study_time: Literal["Morning", "Afternoon", "Evening", "Night"] = "Evening"
    streak_days: int = Field(default=1, ge=0, le=10000)
    trigger_reason: str = Field(default="Adaptive roadmap orchestration", max_length=300)
    self_reported_skills: List[SelfSkillInput] = Field(default_factory=list, max_length=30)
    verified_skills: List[VerifiedSkillInput] = Field(default_factory=list, max_length=30)
    career_requirements: List[CareerRequirementInput] = Field(default_factory=list, max_length=25)
    recent_quiz_scores: List[float] = Field(default_factory=list, max_length=20)
    weak_topics: List[str] = Field(default_factory=list, max_length=20)


# Structured Pydantic Outputs for the 6 Agents
class ProfileAgentOutput(BaseModel):
    normalized_weekly_hours: int = Field(..., ge=1, le=80)
    daily_study_minutes: int = Field(..., ge=15, le=480)
    recommended_pace: Literal["steady", "balanced", "intensive"]
    preferred_language: PreferredLanguage
    preferred_learning_style: LearningStyle
    constraints_summary: str = Field(..., min_length=5, max_length=400)


class SkillGapSummary(BaseModel):
    skill: str
    classification: Literal["Strong", "Intermediate", "Weak", "Missing", "Needs reassessment"]
    verified_score: Optional[float] = None
    required_score: int
    priority_score: float


class SkillAnalysisAgentOutput(BaseModel):
    strong_skills: List[str] = Field(default_factory=list)
    weak_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    unverified_claims: List[str] = Field(default_factory=list)
    prioritized_gaps: List[SkillGapSummary] = Field(default_factory=list)
    evidence_summary: str = Field(..., min_length=5, max_length=500)


class CareerAdvisorAgentOutput(BaseModel):
    target_career: str
    readiness_percentage: float = Field(..., ge=0, le=100)
    recommended_focus_skills: List[str] = Field(default_factory=list, max_length=8)
    advisory_summary: str = Field(..., min_length=5, max_length=500)
    disclaimer: str = "SkillPath AI never guarantees jobs, placements, or salaries."


class PlannedModule(BaseModel):
    topic: str
    title: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    estimated_minutes: int = Field(..., ge=15, le=300)
    recommended_format: LearningStyle
    reason: str
    is_remediation: bool = False
    is_advanced_challenge: bool = False


class LearningPlannerAgentOutput(BaseModel):
    modules: List[PlannedModule] = Field(default_factory=list, max_length=20)
    adaptation_rule_applied: str = Field(..., max_length=200)
    estimated_weeks_to_complete: int = Field(..., ge=1, le=104)


class AssessmentAgentOutput(BaseModel):
    recommended_quiz_topics: List[str] = Field(default_factory=list, max_length=10)
    recommended_difficulty: Literal["beginner", "intermediate", "advanced", "mixed"]
    remediation_needed: bool
    advanced_unlock_eligible: bool
    diagnostic_summary: str = Field(..., min_length=5, max_length=500)


class MentorAgentOutput(BaseModel):
    encouragement_note: str = Field(..., min_length=5, max_length=600)
    next_action_prompt: str = Field(..., min_length=5, max_length=300)
    language: PreferredLanguage


class AgentStepTrace(BaseModel):
    agent_name: str
    status: Literal["completed", "validated", "failed"]
    summary: str
    retries_used: int = 0
    used_fallback: bool = False


class OrchestratorResponse(BaseModel):
    user_id: str
    profile_output: ProfileAgentOutput
    skill_analysis: SkillAnalysisAgentOutput
    career_advisor: CareerAdvisorAgentOutput
    learning_planner: LearningPlannerAgentOutput
    assessment_plan: AssessmentAgentOutput
    mentor_kickoff: MentorAgentOutput
    steps: List[AgentStepTrace]


# Endpoint Schemas
class HistoryTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class MentorChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    mode: MentorMode = "Explain"
    language: PreferredLanguage = "English"
    learnerContext: Optional[dict] = None
    lessonContext: Optional[dict] = None
    history: List[HistoryTurn] = Field(default_factory=list, max_length=20)


class MentorChatResponse(BaseModel):
    source: Literal["gemini", "offline"]
    notice: Optional[str] = None
    reply: str


class AssessmentAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=160)
    score_percentage: float = Field(..., ge=0, le=100)
    topics: List[str] = Field(..., min_length=1, max_length=20)
    weak_topics: List[str] = Field(default_factory=list, max_length=20)
    prior_fail_counts: dict[str, int] = Field(default_factory=dict)
    current_learning_style: LearningStyle = "hands-on"


class AdaptiveRecommendationResponse(BaseModel):
    action: Literal["remediation", "switch_format_remediation", "unlock_advanced", "steady_progress"]
    target_topic: str
    recommended_format: LearningStyle
    explanation: str
    source: Literal["gemini", "deterministic"]


class ProjectReviewRequest(BaseModel):
    projectTitle: str = Field(..., min_length=1, max_length=160)
    description: str = Field(..., min_length=1, max_length=3000)
    githubUrl: Optional[str] = Field(default="", max_length=300)
    liveUrl: Optional[str] = Field(default="", max_length=300)
    rubricCriteria: List[dict] = Field(default_factory=list, max_length=15)
    skills: List[str] = Field(default_factory=list, max_length=15)


class ProjectReviewSchema(BaseModel):
    summary: str
    strengths: List[str] = Field(default_factory=list, max_length=6)
    improvements: List[str] = Field(default_factory=list, max_length=6)
    estimatedScore: int = Field(..., ge=0, le=100)


class ProjectReviewResponse(BaseModel):
    source: Literal["gemini", "offline"]
    notice: str
    review: ProjectReviewSchema
