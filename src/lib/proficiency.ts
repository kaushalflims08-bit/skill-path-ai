import {
  ConfidenceLevel,
  ProficiencyLabel,
  SelfReportedSkill,
  SkillEvidence,
  SkillProficiency,
} from '../types';

export function getProficiencyLabel(score: number | null): ProficiencyLabel {
  if (score === null) return 'Not yet assessed';
  if (score < 40) return 'Beginner';
  if (score < 75) return 'Intermediate';
  return 'Advanced';
}

export function calculateRecencyWeight(timestampIso: string, referenceNowMs = Date.now()): number {
  const ageDays = Math.max(0, (referenceNowMs - new Date(timestampIso).getTime()) / (1000 * 60 * 60 * 24));
  // Exponential decay with 60-day half-life, floored at 0.35 so older verified work still counts
  const decay = Math.pow(0.5, ageDays / 60);
  return Math.max(0.35, Number(decay.toFixed(4)));
}

export function determineConfidence(evidenceList: SkillEvidence[]): ConfidenceLevel {
  if (evidenceList.length === 0) return 'low';
  const highQualitySources = evidenceList.filter(
    (e) => e.sourceType === 'assessment' || e.sourceType === 'project',
  ).length;

  if (evidenceList.length >= 3 && highQualitySources >= 1) return 'high';
  if (evidenceList.length >= 2 || highQualitySources >= 1) return 'medium';
  return 'low';
}

export function calculateSkillProficiency(
  skill: string,
  evidenceList: SkillEvidence[],
  selfReported?: SelfReportedSkill,
  referenceNowMs = Date.now(),
): SkillProficiency {
  const matchingEvidence = evidenceList
    .filter((e) => e.skill.toLowerCase() === skill.toLowerCase())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (matchingEvidence.length === 0) {
    return {
      skill,
      score: null,
      label: 'Not yet assessed',
      confidence: 'low',
      evidenceCount: 0,
      lastAssessedAt: null,
      evidenceList: [],
      selfReportedRating: selfReported ? selfReported.rating : null,
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const ev of matchingEvidence) {
    const recency = calculateRecencyWeight(ev.timestamp, referenceNowMs);
    const effectiveWeight = ev.weight * recency;
    weightedSum += ev.score * effectiveWeight;
    totalWeight += effectiveWeight;
  }

  const score = totalWeight > 0 ? Math.round(Math.min(100, Math.max(0, weightedSum / totalWeight))) : null;
  const confidence = determineConfidence(matchingEvidence);
  const isIllustrativeDemo = matchingEvidence.every((e) => e.isIllustrativeDemo);

  return {
    skill,
    score,
    label: getProficiencyLabel(score),
    confidence,
    evidenceCount: matchingEvidence.length,
    lastAssessedAt: matchingEvidence[0]?.timestamp ?? null,
    evidenceList: matchingEvidence,
    selfReportedRating: selfReported ? selfReported.rating : null,
    isIllustrativeDemo,
  };
}

export function buildProficiencyMap(
  skills: string[],
  evidenceList: SkillEvidence[],
  selfReportedSkills: SelfReportedSkill[],
  referenceNowMs = Date.now(),
): Record<string, SkillProficiency> {
  const allSkillNames = new Set<string>(skills);
  for (const ev of evidenceList) allSkillNames.add(ev.skill);
  for (const sr of selfReportedSkills) allSkillNames.add(sr.skill);

  const map: Record<string, SkillProficiency> = {};
  for (const skill of allSkillNames) {
    const selfReported = selfReportedSkills.find((s) => s.skill.toLowerCase() === skill.toLowerCase());
    map[skill] = calculateSkillProficiency(skill, evidenceList, selfReported, referenceNowMs);
  }
  return map;
}
