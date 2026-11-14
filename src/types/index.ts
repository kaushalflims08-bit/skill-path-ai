export type PreferredLanguage = 'English' | 'Tamil' | 'Tanglish';
export type LearningStyle = 'video' | 'reading' | 'hands-on';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ProficiencyLabel = 'Not yet assessed' | 'Beginner' | 'Intermediate' | 'Advanced';
export type EvidenceSourceType = 'assessment' | 'quiz' | 'exercise' | 'project';
export type QuestionType = 'mcq' | 'multi-select' | 'code-output' | 'fill-blank' | 'short-explanation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type GapClassification = 'Strong' | 'Intermediate' | 'Weak' | 'Missing' | 'Needs reassessment';
export type MentorMode =
  | 'Explain'
  | 'Socratic'
  | 'Debug my code'
  | 'Mock interviewer'
  | 'Study planner'
  | 'Motivation coach';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: 'local' | 'google-demo' | 'firebase-email' | 'firebase-google';
  isDemo: boolean;
  emailVerified?: boolean;
  photoURL?: string;
  createdAt: string;
}

export interface SelfReportedSkill {
  skill: string;
  rating: number; // 1-100 self-reported
  verified: false; // Explicitly separated from verified evidence
}

export interface StudentProjectLink {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface LearnerProfile {
  fullName: string;
  email: string;
  college: string;
  department: string;
  academicYear: string;
  educationLevel: string;
  selfReportedSkills: SelfReportedSkill[];
  softSkills: string[];
  certifications: string[];
  existingProjects: StudentProjectLink[];
  learningInterests: string[];
  preferredLanguage: PreferredLanguage;
  preferredLearningStyle: LearningStyle;
  targetCareerId: string;
  customCareerTitle?: string;
  customCareerSkills?: RequiredSkillTarget[];
  weeklyStudyHours: number;
  preferredStudyTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  onboardingCompleted: boolean;
  publicPortfolioEnabled: boolean;
  leaderboardOptIn: boolean;
  lastActiveAt: string;
  streakDays: number;
  streakFreezeAvailable: number;
  restDayActive: boolean;
  isDemoData: boolean;
}

export interface SkillEvidence {
  id: string;
  skill: string;
  sourceType: EvidenceSourceType;
  sourceId: string;
  score: number; // 0-100
  weight: number; // quality multiplier e.g. assessment=1.2, project=1.3, quiz=1.0, exercise=0.8
  timestamp: string;
  isIllustrativeDemo?: boolean;
}

export interface SkillProficiency {
  skill: string;
  score: number | null; // null means Not yet assessed
  label: ProficiencyLabel;
  confidence: ConfidenceLevel;
  evidenceCount: number;
  lastAssessedAt: string | null;
  evidenceList: SkillEvidence[];
  selfReportedRating: number | null;
  isIllustrativeDemo?: boolean;
}

export interface RequiredSkillTarget {
  skill: string;
  requiredScore: number; // 0-100
  importance: number; // 1-5
  estimatedEffortHours: number;
}

export interface CareerProjectIdea {
  level: DifficultyLevel;
  title: string;
  description: string;
}

export interface CareerRole {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedDurationWeeks: number;
  requiredSkills: RequiredSkillTarget[];
  tools: string[];
  roadmapPreview: string[];
  recommendedProjects: CareerProjectIdea[];
}

export interface SkillMatchDetail {
  skill: string;
  requiredScore: number;
  verifiedScore: number | null;
  importance: number;
  confidenceMultiplier: number;
  weightedContribution: number;
  maxWeightedContribution: number;
  status: 'matching' | 'partial' | 'missing';
}

export interface CareerMatchResult {
  careerId: string;
  careerTitle: string;
  compatibilityPercentage: number;
  matchingSkills: SkillMatchDetail[];
  partialSkills: SkillMatchDetail[];
  missingSkills: SkillMatchDetail[];
  estimatedEffortHours: number;
  estimatedEffortWeeks: number;
  nextBestActions: string[];
  formulaInputs: {
    weightedMatchedScore: number;
    totalRequiredWeight: number;
    confidenceWeightsApplied: Record<ConfidenceLevel, number>;
  };
}

export interface SkillGapItem {
  skill: string;
  currentProficiency: number | null;
  requiredProficiency: number;
  gapSize: number;
  importance: number;
  estimatedEffortHours: number;
  priorityScore: number;
  classification: GapClassification;
  beginnerReason: string;
  technicalReason: string;
  recommendedAction: string;
  prerequisites: string[];
}

export interface Question {
  id: string;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  prompt: string;
  codeSnippet?: string;
  options?: string[]; // For mcq and multi-select
  correctAnswerIndex?: number; // For mcq and code-output
  correctAnswerIndices?: number[]; // For multi-select
  acceptedAnswers?: string[]; // For fill-blank
  expectedKeywords?: string[]; // For short-explanation deterministic rubric
  explanation: string;
}

export interface QuestionResponseRecord {
  questionId: string;
  topic: string;
  selectedOptionIndex?: number;
  selectedOptionIndices?: number[];
  textAnswer?: string;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentAttempt {
  id: string;
  title: string;
  mode: 'topic' | 'daily' | 'challenge' | 'timed' | 'weekly' | 'baseline' | 'test-out';
  topics: string[];
  difficulty: DifficultyLevel | 'mixed';
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  weakTopics: string[];
  responses: QuestionResponseRecord[];
  durationSeconds: number;
  timestamp: string;
  isIllustrativeDemo?: boolean;
}

export type ResourceType = 'video' | 'documentation' | 'course' | 'practice' | 'article' | 'interactive exercise';

export interface CuratedResource {
  id: string;
  title: string;
  platform: string;
  type: ResourceType;
  skillTags: string[];
  difficulty: DifficultyLevel;
  language: PreferredLanguage | 'English';
  duration: string;
  cost: 'Free' | 'Freemium' | 'Paid';
  searchHint: string;
  verifiedStatus: 'Curated suggestion — verify before use';
  brokenReportCount?: number;
}

export interface LessonItem {
  id: string;
  stageTitle: string;
  moduleTitle: string;
  topic: string;
  title: string;
  explanation: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  learningObjectives: string[];
  resourceIds: string[];
  practiceTask: string;
  quizTopic: string;
  miniProjectPrompt?: string;
  completed: boolean;
  completedAt?: string;
  unlocked: boolean;
  prerequisites: string[]; // lesson IDs or skill names
  linkedSkillGap: string;
  reasonForInclusion: string;
  isRemediation?: boolean;
  isAdvancedChallenge?: boolean;
  recommendedFormatOverride?: LearningStyle;
  cachedOffline?: boolean;
}

export interface RoadmapVersion {
  version: number;
  createdAt: string;
  careerId: string;
  careerTitle: string;
  reason: string;
  lessons: LessonItem[];
  diffSummary?: {
    added: string[];
    removed: string[];
    retained: string[];
  };
}

export type AgentWorkflowStatus = 'pending' | 'running' | 'validated' | 'completed' | 'failed';

export interface AgentStepLog {
  id: string;
  agentName:
    | 'Profile Agent'
    | 'Skill Analysis Agent'
    | 'Career Advisor Agent'
    | 'Learning Planner Agent'
    | 'Assessment Agent'
    | 'AI Mentor Agent';
  status: AgentWorkflowStatus;
  summary: string;
  timestamp: string;
  retriesUsed: number;
  usedFallback: boolean;
  payloadPreview?: string;
}

export interface AdaptationEvent {
  id: string;
  trigger:
    | 'Low quiz score (<50%)'
    | 'High quiz score (>=80%)'
    | 'Career goal change'
    | 'Inactivity (3+ days)'
    | 'Repeated struggle (2+ fails)'
    | 'Module test-out';
  whatChanged: string;
  whyChanged: string;
  timestamp: string;
  previousRoadmapVersion?: number;
  newRoadmapVersion?: number;
  undone: boolean;
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  createdAt: string;
}

export type XPActivityType =
  | 'lesson'
  | 'quiz'
  | 'mini_project'
  | 'skill_mastery'
  | 'streak_bonus'
  | 'mission';

export interface XPTransaction {
  id: string;
  activityId: string; // Unique key preventing duplicate XP awards
  type: XPActivityType;
  amount: number;
  description: string;
  timestamp: string;
  isIllustrativeDemo?: boolean;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  criteria: string;
  color: 'blue' | 'purple' | 'orange' | 'green' | 'pink';
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string;
  evidenceNote: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  actionRoute: string;
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: MentorMode;
  language: PreferredLanguage;
  lessonTitle?: string;
  source: 'gemini' | 'offline';
  feedback?: 'up' | 'down';
  timestamp: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  level: DifficultyLevel;
  description: string;
  requiredSkills: string[];
  objectives: string[];
  stepByStepGuidance: string[];
  evaluationRubric: { criterion: string; maxPoints: number; description: string }[];
}

export interface UserProjectSubmission {
  id: string;
  projectIdeaId: string;
  title: string;
  level: DifficultyLevel;
  requiredSkills: string[];
  description: string;
  githubUrl: string;
  liveDemoUrl: string;
  screenshotName?: string;
  submittedAt: string;
  aiReview?: {
    summary: string;
    strengths: string[];
    improvements: string[];
    estimatedScore: number;
    source: 'gemini' | 'sample';
    notice: string;
  };
  isIllustrativeDemo?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: string;
}
