import { CareerRole, GapClassification, SkillGapItem, SkillProficiency } from '../types';

export const SKILL_PREREQUISITES: Record<string, string[]> = {
  HTML: [],
  CSS: ['HTML'],
  JavaScript: ['HTML', 'CSS'],
  Git: [],
  React: ['HTML', 'CSS', 'JavaScript'],
  'Node.js': ['JavaScript'],
  Express: ['JavaScript', 'Node.js', 'REST APIs'],
  MongoDB: ['JavaScript', 'Node.js'],
  'REST APIs': ['JavaScript'],
  SQL: [],
  Python: [],
  'Data Structures and Algorithms': ['JavaScript'],
  TypeScript: ['JavaScript'],
  Docker: ['Git', 'Linux'],
  Linux: [],
  Networking: [],
  Security: ['Networking', 'Linux'],
  Figma: [],
  'UI Design': ['Figma'],
  'UX Research': [],
  Statistics: [],
  'Machine Learning': ['Python', 'Statistics'],
  'Data Visualization': ['SQL', 'Python'],
  'Cloud Fundamentals': ['Linux', 'Networking'],
  'CI/CD': ['Git', 'Docker'],
  'React Native': ['JavaScript', 'React'],
};

export function classifySkillGap(
  proficiency: SkillProficiency | undefined,
  requiredScore: number,
  referenceNowMs = Date.now(),
): GapClassification {
  if (!proficiency || proficiency.score === null) {
    return 'Missing';
  }

  if (proficiency.lastAssessedAt) {
    const daysSince = (referenceNowMs - new Date(proficiency.lastAssessedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 90) {
      return 'Needs reassessment';
    }
  }

  if (proficiency.score >= requiredScore) return 'Strong';
  if (proficiency.score >= 40) return 'Intermediate';
  return 'Weak';
}

export function analyzeSkillGaps(
  career: CareerRole,
  proficiencies: Record<string, SkillProficiency>,
  referenceNowMs = Date.now(),
): SkillGapItem[] {
  const gaps: SkillGapItem[] = career.requiredSkills.map((req) => {
    const prof = proficiencies[req.skill];
    const currentScore = prof?.score ?? null;
    const numericCurrent = currentScore ?? 0;
    const gapSize = Math.max(0, req.requiredScore - numericCurrent);
    const effort = Math.max(1, req.estimatedEffortHours);

    // Required formula: priority = (skill importance * gap size) / estimated learning effort
    const priorityScore = Number(((req.importance * gapSize) / effort).toFixed(2));
    const classification = classifySkillGap(prof, req.requiredScore, referenceNowMs);
    const prereqs = SKILL_PREREQUISITES[req.skill] ?? [];

    const beginnerReason =
      currentScore === null
        ? `You have not verified ${req.skill} with a quiz or project yet. ${career.title} roles rely on it regularly.`
        : gapSize === 0
          ? `Great news: your verified ${req.skill} score (${currentScore}%) already meets the ${req.requiredScore}% target.`
          : `Your ${req.skill} score is ${currentScore}%, and this role typically needs around ${req.requiredScore}%. Closing this ${gapSize}-point gap makes future projects much smoother.`;

    const technicalReason =
      currentScore === null
        ? `No verified assessment/project evidence logged for ${req.skill}. Target threshold: ${req.requiredScore}/100 (Importance ${req.importance}/5).`
        : `Verified score ${currentScore}/100 (${prof?.confidence ?? 'low'} confidence across ${prof?.evidenceCount ?? 0} evidence items) vs target ${req.requiredScore}/100. Priority (${priorityScore}) = (${req.importance} × ${gapSize}) ÷ ${effort}h.`;

    const recommendedAction =
      classification === 'Strong'
        ? `Keep sharp with occasional challenge problems or mentor others in ${req.skill}.`
        : classification === 'Missing'
          ? `Complete the ${req.skill} baseline quiz and start the starter lesson.`
          : classification === 'Needs reassessment'
            ? `Take a quick refresher quiz in ${req.skill} to refresh recency weight.`
            : `Practice ${req.skill} exercises and complete a mini project to build confidence.`;

    return {
      skill: req.skill,
      currentProficiency: currentScore,
      requiredProficiency: req.requiredScore,
      gapSize,
      importance: req.importance,
      estimatedEffortHours: req.estimatedEffortHours,
      priorityScore,
      classification,
      beginnerReason,
      technicalReason,
      recommendedAction,
      prerequisites: prereqs,
    };
  });

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}
