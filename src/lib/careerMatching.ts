import {
  CareerMatchResult,
  CareerRole,
  ConfidenceLevel,
  SkillMatchDetail,
  SkillProficiency,
} from '../types';

export const CONFIDENCE_MULTIPLIERS: Record<ConfidenceLevel, number> = {
  low: 0.75,
  medium: 0.9,
  high: 1.0,
};

export function calculateCareerMatch(
  career: CareerRole,
  proficiencies: Record<string, SkillProficiency>,
  weeklyStudyHours: number,
  whatIfOverrides: Record<string, number> = {},
): CareerMatchResult {
  let weightedMatchedScore = 0;
  let totalRequiredWeight = 0;
  let estimatedEffortHours = 0;

  const matchingSkills: SkillMatchDetail[] = [];
  const partialSkills: SkillMatchDetail[] = [];
  const missingSkills: SkillMatchDetail[] = [];

  for (const req of career.requiredSkills) {
    const prof = proficiencies[req.skill];
    const overrideScore = whatIfOverrides[req.skill];
    const effectiveScore =
      overrideScore !== undefined ? overrideScore : prof?.score ?? null;
    const confidence: ConfidenceLevel =
      overrideScore !== undefined ? 'medium' : prof?.confidence ?? 'low';

    // When unassessed (null), verified score contributes 0 (self-reported does NOT count as verified)
    const numericScore = effectiveScore ?? 0;
    const ratio = Math.min(1, numericScore / req.requiredScore);
    const confidenceMult = effectiveScore === null ? 0 : CONFIDENCE_MULTIPLIERS[confidence];

    const maxWeightedContribution = req.importance;
    const weightedContribution = Number((req.importance * ratio * confidenceMult).toFixed(3));

    weightedMatchedScore += weightedContribution;
    totalRequiredWeight += maxWeightedContribution;

    const status: 'matching' | 'partial' | 'missing' =
      effectiveScore !== null && effectiveScore >= req.requiredScore
        ? 'matching'
        : effectiveScore !== null && effectiveScore >= req.requiredScore * 0.45
          ? 'partial'
          : 'missing';

    const detail: SkillMatchDetail = {
      skill: req.skill,
      requiredScore: req.requiredScore,
      verifiedScore: effectiveScore,
      importance: req.importance,
      confidenceMultiplier: confidenceMult,
      weightedContribution,
      maxWeightedContribution,
      status,
    };

    if (status === 'matching') {
      matchingSkills.push(detail);
    } else if (status === 'partial') {
      partialSkills.push(detail);
      const remainingRatio = Math.max(0.15, (req.requiredScore - numericScore) / req.requiredScore);
      estimatedEffortHours += Math.round(req.estimatedEffortHours * remainingRatio);
    } else {
      missingSkills.push(detail);
      const remainingRatio = Math.max(0.4, (req.requiredScore - numericScore) / req.requiredScore);
      estimatedEffortHours += Math.round(req.estimatedEffortHours * remainingRatio);
    }
  }

  const compatibilityPercentage =
    totalRequiredWeight > 0
      ? Math.round((weightedMatchedScore / totalRequiredWeight) * 100)
      : 0;

  const safeWeeklyHours = Math.max(2, weeklyStudyHours || 10);
  const estimatedEffortWeeks = Math.max(1, Math.ceil(estimatedEffortHours / safeWeeklyHours));

  const nextBestActions: string[] = [];
  const topMissing = [...missingSkills].sort((a, b) => b.importance - a.importance);
  const topPartial = [...partialSkills].sort((a, b) => b.importance - a.importance);

  if (topMissing[0]) {
    nextBestActions.push(`Take a diagnostic quiz or foundation module in ${topMissing[0].skill}.`);
  }
  if (topPartial[0]) {
    nextBestActions.push(
      `Raise ${topPartial[0].skill} from ${topPartial[0].verifiedScore ?? 0}% to ${topPartial[0].requiredScore}% with hands-on practice.`,
    );
  }
  if (career.recommendedProjects[0]) {
    nextBestActions.push(`Build the "${career.recommendedProjects[0].title}" starter project.`);
  }

  return {
    careerId: career.id,
    careerTitle: career.title,
    compatibilityPercentage,
    matchingSkills,
    partialSkills,
    missingSkills,
    estimatedEffortHours,
    estimatedEffortWeeks,
    nextBestActions,
    formulaInputs: {
      weightedMatchedScore: Number(weightedMatchedScore.toFixed(2)),
      totalRequiredWeight: Number(totalRequiredWeight.toFixed(2)),
      confidenceWeightsApplied: CONFIDENCE_MULTIPLIERS,
    },
  };
}
