import { describe, it, expect, beforeEach } from 'vitest';
import { calculateSkillProficiency, getProficiencyLabel } from '../lib/proficiency';
import { calculateCareerMatch } from '../lib/careerMatching';
import { analyzeSkillGaps } from '../lib/gapAnalyzer';
import { awardXPTransaction, calculateTotalXP, evaluateUnlockedBadges } from '../lib/gamification';
import { createRoadmapVersion, insertRemediationLesson } from '../lib/roadmapEngine';
import { CAREERS } from '../data/careers';
import { SEED_QUESTIONS, scoreQuestion } from '../data/questions';
import { useAppStore } from '../store/useAppStore';

describe('SkillPath AI Core Deterministic Engines', () => {
  it('marks unassessed skills as "Not yet assessed" and separates self-reported ratings', () => {
    const prof = calculateSkillProficiency('React', [], {
      skill: 'React',
      rating: 90,
      verified: false,
    });
    expect(prof.score).toBeNull();
    expect(prof.label).toBe('Not yet assessed');
    expect(prof.selfReportedRating).toBe(90);
    expect(getProficiencyLabel(null)).toBe('Not yet assessed');
    expect(getProficiencyLabel(35)).toBe('Beginner');
    expect(getProficiencyLabel(60)).toBe('Intermediate');
    expect(getProficiencyLabel(80)).toBe('Advanced');
  });

  it('weights newer evidence higher than older evidence', () => {
    const now = Date.now();
    const oldTs = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();
    const newTs = new Date(now).toISOString();
    const prof = calculateSkillProficiency(
      'JavaScript',
      [
        {
          id: 'ev1',
          skill: 'JavaScript',
          sourceType: 'quiz',
          sourceId: 'q1',
          score: 20,
          weight: 1.0,
          timestamp: oldTs,
        },
        {
          id: 'ev2',
          skill: 'JavaScript',
          sourceType: 'assessment',
          sourceId: 'q2',
          score: 90,
          weight: 1.2,
          timestamp: newTs,
        },
      ],
      undefined,
      now,
    );
    expect(prof.score).not.toBeNull();
    expect(prof.score!).toBeGreaterThan(60);
    expect(prof.confidence).toBe('medium');
  });

  it('calculates deterministic career matching and what-if simulations', () => {
    const fullStack = CAREERS.find((c) => c.id === 'full-stack-developer')!;
    const profs = {
      HTML: calculateSkillProficiency('HTML', [
        {
          id: 'e1',
          skill: 'HTML',
          sourceType: 'quiz',
          sourceId: 'q1',
          score: 75,
          weight: 1,
          timestamp: new Date().toISOString(),
        },
      ]),
    };

    const base = calculateCareerMatch(fullStack, profs, 10);
    const whatIf = calculateCareerMatch(fullStack, profs, 10, {
      React: 75,
      'Node.js': 70,
    });
    expect(whatIf.compatibilityPercentage).toBeGreaterThan(base.compatibilityPercentage);
  });

  it('computes skill gap priority formula accurately', () => {
    const fullStack = CAREERS.find((c) => c.id === 'full-stack-developer')!;
    const gaps = analyzeSkillGaps(fullStack, {});
    const jsGap = gaps.find((g) => g.skill === 'JavaScript')!;
    // priority = (importance 5 * gapSize 80) / effort 24 = 16.67
    expect(jsGap.priorityScore).toBeCloseTo(16.67, 1);
    expect(jsGap.classification).toBe('Missing');
  });

  it('prevents duplicate XP for the same activityId and blocks Skill Master without assessment/project evidence', () => {
    const first = awardXPTransaction([], {
      activityId: 'lesson:css-1',
      type: 'lesson',
      amount: 20,
      description: 'CSS Lesson',
    });
    expect(first.awarded).toBe(true);

    const dup = awardXPTransaction(first.transactions, {
      activityId: 'lesson:css-1',
      type: 'lesson',
      amount: 20,
      description: 'CSS Lesson duplicate',
    });
    expect(dup.awarded).toBe(false);
    expect(calculateTotalXP(dup.transactions)).toBe(20);

    const badgeRes = evaluateUnlockedBadges({
      existingBadges: [],
      completedLessonsCount: 5,
      bestQuizScore: 0,
      projects: [],
      streakDays: 1,
      proficiencies: {},
    });
    expect(badgeRes.badges.some((b) => b.badgeId === 'skill-master')).toBe(false);
  });

  it('creates new roadmap versions and preserves history during remediation', () => {
    const v1 = createRoadmapVersion({
      previousVersion: null,
      careerId: 'full-stack-developer',
      careerTitle: 'Full Stack Developer',
      reason: 'Initial',
      newLessons: [
        {
          id: 'l1',
          stageTitle: 'S1',
          moduleTitle: 'M1',
          topic: 'CSS',
          title: 'CSS Basics',
          explanation: 'Learn CSS',
          difficulty: 'beginner',
          estimatedMinutes: 45,
          learningObjectives: [],
          resourceIds: [],
          practiceTask: 'Task',
          quizTopic: 'CSS',
          completed: true,
          unlocked: true,
          prerequisites: [],
          linkedSkillGap: 'CSS',
          reasonForInclusion: 'Gap',
        },
      ],
    });
    const { updatedLessons, insertedLesson } = insertRemediationLesson(v1.lessons, 'JavaScript');
    const v2 = createRoadmapVersion({
      previousVersion: v1,
      careerId: 'full-stack-developer',
      careerTitle: 'Full Stack Developer',
      reason: 'Remediation',
      newLessons: updatedLessons,
    });
    expect(v2.version).toBe(2);
    expect(v2.diffSummary?.added).toContain(insertedLesson.title);
    expect(v2.diffSummary?.retained).toContain('CSS Basics');
  });

  it('end-to-end user journey: demo login -> complete lesson -> fail quiz -> adaptive roadmap update', () => {
    const store = useAppStore.getState();
    store.loginDemoStudent();

    let state = useAppStore.getState();
    expect(state.profile?.fullName).toBe('Alex');
    const initialVersion = state.activeRoadmapVersion;
    const firstLesson = state.roadmapVersions[0].lessons[0];

    // Complete first lesson (+20 XP) + auto-completes daily lesson mission (+25 XP)
    const xpBefore = calculateTotalXP(state.xpTransactions);
    state.toggleLessonComplete(firstLesson.id);
    state = useAppStore.getState();
    expect(calculateTotalXP(state.xpTransactions)).toBe(xpBefore + 20 + 25);

    // Fail a JavaScript quiz (< 50%) to trigger adaptive remediation
    const jsQuestions = SEED_QUESTIONS.filter((q) => q.topic === 'JavaScript').slice(0, 2);
    const wrongResponses = jsQuestions.map((q) =>
      scoreQuestion(q, { selectedOptionIndex: 99, textAnswer: '' }),
    );
    state.submitAssessment({
      id: 'e2e_quiz_fail',
      title: 'JavaScript E2E Check',
      mode: 'topic',
      topics: ['JavaScript'],
      difficulty: 'beginner',
      scorePercentage: 0,
      correctCount: 0,
      totalQuestions: jsQuestions.length,
      weakTopics: ['JavaScript'],
      responses: wrongResponses,
      durationSeconds: 45,
      timestamp: new Date().toISOString(),
    });

    state = useAppStore.getState();
    expect(state.activeRoadmapVersion).toBeGreaterThan(initialVersion);
    expect(state.adaptations[0].trigger).toBe('Repeated struggle (2+ fails)');
    expect(state.notifications[0].title).toContain('We added review lessons');
    const latestRoadmap = state.roadmapVersions.find(
      (v) => v.version === state.activeRoadmapVersion,
    );
    const remedLesson = latestRoadmap?.lessons.find((l) => l.isRemediation);
    expect(remedLesson?.recommendedFormatOverride).toBeDefined();
  });
});
