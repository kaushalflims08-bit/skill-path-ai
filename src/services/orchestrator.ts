import { z } from 'zod';
import {
  AgentStepLog,
  AssessmentAttempt,
  CareerMatchResult,
  CareerRole,
  LearnerProfile,
  LessonItem,
  SkillGapItem,
  SkillProficiency,
} from '../types';
import { calculateCareerMatch } from '../lib/careerMatching';
import { analyzeSkillGaps } from '../lib/gapAnalyzer';
import { generatePersonalizedRoadmap } from '../lib/roadmapEngine';

const LearnerContextSchema = z.object({
  fullName: z.string().min(1),
  targetCareerId: z.string().min(1),
  weeklyStudyHours: z.number().min(1),
  preferredLanguage: z.string().min(1),
  preferredLearningStyle: z.string().min(1),
});

const SkillGapReportSchema = z.object({
  totalGaps: z.number().min(0),
  topPrioritySkill: z.string().nullable(),
});

const CareerAdviceSchema = z.object({
  compatibilityPercentage: z.number().min(0).max(100),
  summary: z.string().min(5),
});

const RoadmapOutputSchema = z.object({
  lessonCount: z.number().min(1),
});

const AssessmentSummarySchema = z.object({
  recentScore: z.number().min(0).max(100).nullable(),
  weakTopics: z.array(z.string()),
});

const MentorGuidanceSchema = z.object({
  suggestion: z.string().min(5),
});

function validateWithRetry<T>(
  schema: z.ZodType<T>,
  produce: (attempt: number) => unknown,
  fallback: () => T,
): { data: T; retriesUsed: number; usedFallback: boolean } {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const candidate = produce(attempt);
      const parsed = schema.safeParse(candidate);
      if (parsed.success) {
        return { data: parsed.data, retriesUsed: attempt, usedFallback: false };
      }
    } catch {
      // retry up to 2 times
    }
  }
  return { data: fallback(), retriesUsed: 2, usedFallback: true };
}

export interface OrchestrationResult {
  steps: AgentStepLog[];
  careerMatch: CareerMatchResult;
  gaps: SkillGapItem[];
  roadmapLessons: LessonItem[];
  mentorSuggestion: string;
}

export function runMultiAgentPipeline(params: {
  profile: LearnerProfile;
  career: CareerRole;
  proficiencies: Record<string, SkillProficiency>;
  assessments: AssessmentAttempt[];
  previousLessons: LessonItem[];
  triggerReason: string;
}): OrchestrationResult {
  const steps: AgentStepLog[] = [];
  const now = () => new Date().toISOString();

  // 1. Profile Agent
  const profileStep = validateWithRetry(
    LearnerContextSchema,
    () => ({
      fullName: params.profile.fullName || 'Student',
      targetCareerId: params.career.id,
      weeklyStudyHours: params.profile.weeklyStudyHours || 10,
      preferredLanguage: params.profile.preferredLanguage,
      preferredLearningStyle: params.profile.preferredLearningStyle,
    }),
    () => ({
      fullName: 'Student',
      targetCareerId: params.career.id,
      weeklyStudyHours: 10,
      preferredLanguage: 'English',
      preferredLearningStyle: 'hands-on',
    }),
  );

  steps.push({
    id: `ag_${Date.now()}_1`,
    agentName: 'Profile Agent',
    status: 'completed',
    summary: `Profile Agent: Learner context created (${profileStep.data.weeklyStudyHours}h/week · ${profileStep.data.preferredLanguage})`,
    timestamp: now(),
    retriesUsed: profileStep.retriesUsed,
    usedFallback: profileStep.usedFallback,
    payloadPreview: JSON.stringify(profileStep.data),
  });

  // 2. Skill Analysis Agent
  const gaps = analyzeSkillGaps(params.career, params.proficiencies);
  const openGaps = gaps.filter((g) => g.classification !== 'Strong');
  const analysisStep = validateWithRetry(
    SkillGapReportSchema,
    () => ({
      totalGaps: openGaps.length,
      topPrioritySkill: openGaps[0]?.skill ?? null,
    }),
    () => ({ totalGaps: gaps.length, topPrioritySkill: gaps[0]?.skill ?? null }),
  );

  steps.push({
    id: `ag_${Date.now()}_2`,
    agentName: 'Skill Analysis Agent',
    status: 'completed',
    summary: `Skill Analysis Agent: ${analysisStep.data.totalGaps} skill gaps identified${
      analysisStep.data.topPrioritySkill ? ` (Top priority: ${analysisStep.data.topPrioritySkill})` : ''
    }`,
    timestamp: now(),
    retriesUsed: analysisStep.retriesUsed,
    usedFallback: analysisStep.usedFallback,
  });

  // 3. Career Advisor Agent
  const careerMatch = calculateCareerMatch(
    params.career,
    params.proficiencies,
    params.profile.weeklyStudyHours,
  );
  const advisorStep = validateWithRetry(
    CareerAdviceSchema,
    () => ({
      compatibilityPercentage: careerMatch.compatibilityPercentage,
      summary: `${params.career.title} match is ${careerMatch.compatibilityPercentage}% with ~${careerMatch.estimatedEffortWeeks} weeks of estimated study.`,
    }),
    () => ({
      compatibilityPercentage: 0,
      summary: `${params.career.title} readiness evaluated.`,
    }),
  );

  steps.push({
    id: `ag_${Date.now()}_3`,
    agentName: 'Career Advisor Agent',
    status: 'completed',
    summary: `Career Advisor Agent: ${params.career.title} match calculated (${advisorStep.data.compatibilityPercentage}%)`,
    timestamp: now(),
    retriesUsed: advisorStep.retriesUsed,
    usedFallback: advisorStep.usedFallback,
  });

  // 4. Learning Planner Agent
  const roadmapLessons = generatePersonalizedRoadmap({
    career: params.career,
    gaps,
    weeklyStudyHours: params.profile.weeklyStudyHours,
    learningStyle: params.profile.preferredLearningStyle,
    language: params.profile.preferredLanguage,
    previousLessons: params.previousLessons,
  });
  const plannerStep = validateWithRetry(
    RoadmapOutputSchema,
    () => ({ lessonCount: roadmapLessons.length }),
    () => ({ lessonCount: roadmapLessons.length }),
  );

  steps.push({
    id: `ag_${Date.now()}_4`,
    agentName: 'Learning Planner Agent',
    status: 'completed',
    summary: `Learning Planner Agent: ${careerMatch.estimatedEffortWeeks}-week roadmap generated (${plannerStep.data.lessonCount} lessons · ${params.triggerReason})`,
    timestamp: now(),
    retriesUsed: plannerStep.retriesUsed,
    usedFallback: plannerStep.usedFallback,
  });

  // 5. Assessment Agent
  const latestAttempt = params.assessments[0] ?? null;
  const assessStep = validateWithRetry(
    AssessmentSummarySchema,
    () => ({
      recentScore: latestAttempt ? latestAttempt.scorePercentage : null,
      weakTopics: latestAttempt ? latestAttempt.weakTopics : openGaps.slice(0, 2).map((g) => g.skill),
    }),
    () => ({ recentScore: null, weakTopics: [] }),
  );

  steps.push({
    id: `ag_${Date.now()}_5`,
    agentName: 'Assessment Agent',
    status: 'completed',
    summary: latestAttempt
      ? `Assessment Agent: ${latestAttempt.topics.join(', ')} quiz graded (${latestAttempt.scorePercentage}%)`
      : 'Assessment Agent: Baseline diagnostic ready for verification',
    timestamp: now(),
    retriesUsed: assessStep.retriesUsed,
    usedFallback: assessStep.usedFallback,
  });

  // 6. AI Mentor Agent
  const nextLesson = roadmapLessons.find((l) => !l.completed && l.unlocked) ?? roadmapLessons[0];
  const mentorStep = validateWithRetry(
    MentorGuidanceSchema,
    () => ({
      suggestion: nextLesson
        ? `Start "${nextLesson.title}" (${nextLesson.estimatedMinutes} mins) to close your ${nextLesson.linkedSkillGap} gap.`
        : 'Continue practicing with a Portfolio Project!',
    }),
    () => ({ suggestion: 'Focus on your highest-priority skill gap next.' }),
  );

  steps.push({
    id: `ag_${Date.now()}_6`,
    agentName: 'AI Mentor Agent',
    status: 'completed',
    summary: 'AI Mentor Agent: Personalized guidance updated',
    timestamp: now(),
    retriesUsed: mentorStep.retriesUsed,
    usedFallback: mentorStep.usedFallback,
  });

  return {
    steps,
    careerMatch,
    gaps,
    roadmapLessons,
    mentorSuggestion: mentorStep.data.suggestion,
  };
}
