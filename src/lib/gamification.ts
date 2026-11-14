import {
  BadgeDefinition,
  SkillProficiency,
  UnlockedBadge,
  UserProjectSubmission,
  XPActivityType,
  XPTransaction,
} from '../types';

export const XP_REWARDS: Record<Exclude<XPActivityType, 'mission'>, number> = {
  lesson: 20,
  quiz: 50,
  mini_project: 100,
  skill_mastery: 200,
  streak_bonus: 100,
};

export interface LevelThreshold {
  name: 'Beginner' | 'Explorer' | 'Achiever' | 'Expert' | 'Master';
  minXp: number;
  maxXp: number | null;
  color: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { name: 'Beginner', minXp: 0, maxXp: 249, color: '#3B82F6' },
  { name: 'Explorer', minXp: 250, maxXp: 699, color: '#8B5CF6' },
  { name: 'Achiever', minXp: 700, maxXp: 1499, color: '#F59E0B' },
  { name: 'Expert', minXp: 1500, maxXp: 2999, color: '#22C55E' },
  { name: 'Master', minXp: 3000, maxXp: null, color: '#EC4899' },
];

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'first-lesson',
    name: 'First Lesson',
    description: 'Completed your very first roadmap lesson.',
    criteria: 'Complete 1 lesson',
    color: 'blue',
  },
  {
    id: 'quiz-champion',
    name: 'Quiz Champion',
    description: 'Scored 80% or higher on a SkillPath quiz.',
    criteria: 'Score 80%+ on any quiz attempt',
    color: 'purple',
  },
  {
    id: 'coding-explorer',
    name: 'Coding Explorer',
    description: 'Completed 5 lessons across your learning roadmap.',
    criteria: 'Complete 5 lessons',
    color: 'orange',
  },
  {
    id: 'project-builder',
    name: 'Project Builder',
    description: 'Submitted a portfolio project with rubric evaluation.',
    criteria: 'Submit 1 evaluated project',
    color: 'green',
  },
  {
    id: 'seven-day-streak',
    name: 'Seven-Day Streak',
    description: 'Maintained 7 consecutive days of steady practice.',
    criteria: 'Reach a 7-day learning streak',
    color: 'orange',
  },
  {
    id: 'skill-master',
    name: 'Skill Master',
    description: 'Reached Advanced (75+) verified proficiency backed by assessment or project evidence.',
    criteria: 'Verified score 75+ with assessment/project evidence (lessons alone do not count)',
    color: 'pink',
  },
];

export function calculateTotalXP(transactions: XPTransaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export function getLevelForXP(totalXp: number): {
  current: LevelThreshold;
  next: LevelThreshold | null;
  progressPercent: number;
} {
  let current = LEVEL_THRESHOLDS[0];
  let idx = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i].minXp) {
      current = LEVEL_THRESHOLDS[i];
      idx = i;
    }
  }

  const next = LEVEL_THRESHOLDS[idx + 1] ?? null;
  if (!next) {
    return { current, next: null, progressPercent: 100 };
  }

  const span = next.minXp - current.minXp;
  const gained = totalXp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));
  return { current, next, progressPercent };
}

export function awardXPTransaction(
  existing: XPTransaction[],
  params: {
    activityId: string;
    type: XPActivityType;
    amount: number;
    description: string;
    timestamp?: string;
    isIllustrativeDemo?: boolean;
  },
): { transactions: XPTransaction[]; awarded: boolean; transaction?: XPTransaction } {
  const duplicate = existing.some((tx) => tx.activityId === params.activityId);
  if (duplicate) {
    return { transactions: existing, awarded: false };
  }

  const tx: XPTransaction = {
    id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    activityId: params.activityId,
    type: params.type,
    amount: params.amount,
    description: params.description,
    timestamp: params.timestamp ?? new Date().toISOString(),
    isIllustrativeDemo: params.isIllustrativeDemo,
  };

  return {
    transactions: [tx, ...existing],
    awarded: true,
    transaction: tx,
  };
}

export function evaluateUnlockedBadges(params: {
  existingBadges: UnlockedBadge[];
  completedLessonsCount: number;
  bestQuizScore: number;
  projects: UserProjectSubmission[];
  streakDays: number;
  proficiencies: Record<string, SkillProficiency>;
}): { badges: UnlockedBadge[]; newlyUnlocked: BadgeDefinition[] } {
  const existingIds = new Set(params.existingBadges.map((b) => b.badgeId));
  const nextBadges = [...params.existingBadges];
  const newlyUnlocked: BadgeDefinition[] = [];
  const now = new Date().toISOString();

  const tryUnlock = (badgeId: string, evidenceNote: string) => {
    if (existingIds.has(badgeId)) return;
    const def = BADGE_CATALOG.find((b) => b.id === badgeId);
    if (!def) return;
    existingIds.add(badgeId);
    nextBadges.push({ badgeId, unlockedAt: now, evidenceNote });
    newlyUnlocked.push(def);
  };

  if (params.completedLessonsCount >= 1) {
    tryUnlock('first-lesson', `Completed ${params.completedLessonsCount} roadmap lesson(s).`);
  }
  if (params.bestQuizScore >= 80) {
    tryUnlock('quiz-champion', `Achieved ${params.bestQuizScore}% on a quiz assessment.`);
  }
  if (params.completedLessonsCount >= 5) {
    tryUnlock('coding-explorer', `Completed ${params.completedLessonsCount} lessons.`);
  }
  if (params.projects.length >= 1) {
    tryUnlock('project-builder', `Submitted project "${params.projects[0].title}".`);
  }
  if (params.streakDays >= 7) {
    tryUnlock('seven-day-streak', `Maintained a ${params.streakDays}-day learning streak.`);
  }

  // Rule: Skill Master requires verified assessment or evaluated project evidence >= 75, NOT lesson completion alone
  const masteredSkill = Object.values(params.proficiencies).find(
    (p) =>
      p.score !== null &&
      p.score >= 75 &&
      p.evidenceList.some((e) => e.sourceType === 'assessment' || e.sourceType === 'project' || e.sourceType === 'quiz'),
  );
  if (masteredSkill) {
    tryUnlock(
      'skill-master',
      `Verified ${masteredSkill.skill} proficiency at ${masteredSkill.score}% via assessment/project evidence.`,
    );
  }

  return { badges: nextBadges, newlyUnlocked };
}
