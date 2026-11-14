import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdaptationEvent,
  AgentStepLog,
  AppNotification,
  AssessmentAttempt,
  AuthUser,
  CareerRole,
  DailyMission,
  Flashcard,
  LearnerProfile,
  LessonItem,
  MentorMessage,
  RoadmapVersion,
  SkillEvidence,
  SkillProficiency,
  UnlockedBadge,
  UserProjectSubmission,
  XPTransaction,
} from '../types';
import { CAREERS, buildCustomCareerRole } from '../data/careers';
import {
  DEMO_ADAPTATIONS,
  DEMO_AGENT_LOGS,
  DEMO_ASSESSMENTS,
  DEMO_AUTH_USER,
  DEMO_BADGES,
  DEMO_EVIDENCE,
  DEMO_FLASHCARDS,
  DEMO_MENTOR_MESSAGES,
  DEMO_MISSIONS,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILE,
  DEMO_PROJECTS,
  DEMO_ROADMAP_VERSION,
  DEMO_XP_TRANSACTIONS,
} from '../data/demoStudent';
import { buildProficiencyMap } from '../lib/proficiency';
import {
  XP_REWARDS,
  awardXPTransaction,
  calculateTotalXP,
  evaluateUnlockedBadges,
} from '../lib/gamification';
import {
  createRoadmapVersion,
  insertAdvancedChallengeLesson,
  insertRemediationLesson,
  updateFlashcardSM2,
} from '../lib/roadmapEngine';
import { runMultiAgentPipeline } from '../services/orchestrator';
import { localAuthService } from '../services/authService';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: 'info' | 'success' | 'warning' | 'error';
}

const createFreshProfile = (user: AuthUser): LearnerProfile => ({
  fullName: user.name,
  email: user.email,
  college: '',
  department: '',
  academicYear: 'Second year',
  educationLevel: 'B.E. / B.Tech',
  selfReportedSkills: [],
  softSkills: [],
  certifications: [],
  existingProjects: [],
  learningInterests: [],
  preferredLanguage: 'English',
  preferredLearningStyle: 'hands-on',
  targetCareerId: 'full-stack-developer',
  weeklyStudyHours: 10,
  preferredStudyTime: 'Evening',
  onboardingCompleted: false,
  publicPortfolioEnabled: false,
  leaderboardOptIn: false,
  lastActiveAt: new Date().toISOString(),
  streakDays: 1,
  streakFreezeAvailable: 1,
  restDayActive: false,
  isDemoData: false,
});

export interface AppState {
  theme: 'light' | 'dark';
  user: AuthUser | null;
  profile: LearnerProfile | null;
  evidence: SkillEvidence[];
  assessments: AssessmentAttempt[];
  roadmapVersions: RoadmapVersion[];
  activeRoadmapVersion: number;
  agentLogs: AgentStepLog[];
  adaptations: AdaptationEvent[];
  flashcards: Flashcard[];
  xpTransactions: XPTransaction[];
  badges: UnlockedBadge[];
  missions: DailyMission[];
  mentorMessages: MentorMessage[];
  projects: UserProjectSubmission[];
  notifications: AppNotification[];
  reportedBrokenResources: Record<string, number>;
  toasts: ToastMessage[];
  celebrationMessage: string | null;

  toggleTheme: () => void;
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearCelebration: () => void;

  // Auth & Demo
  loginDemoStudent: () => void;
  resetDemoStudent: () => void;
  setAuthenticatedUser: (user: AuthUser, isNewRegistration?: boolean) => void;
  logout: () => Promise<void>;

  // Profile & Onboarding
  updateProfile: (partial: Partial<LearnerProfile>) => void;
  completeOnboarding: (finalProfile: LearnerProfile, baselineAttempt?: AssessmentAttempt) => void;

  // Career & Roadmap
  selectTargetCareer: (careerId: string, customCareer?: { title: string; skills: CareerRole['requiredSkills'] }) => void;
  regenerateRoadmap: (reason?: string) => void;
  toggleLessonComplete: (lessonId: string) => void;
  toggleLessonOfflineCache: (lessonId: string) => void;
  testOutModule: (topic: string, scorePercentage: number) => void;
  undoAdaptation: (adaptationId: string) => void;

  // Assessments & Flashcards
  submitAssessment: (attempt: AssessmentAttempt) => void;
  addMistakesToFlashcards: (attempt: AssessmentAttempt) => number;
  reviewFlashcard: (cardId: string, quality: 1 | 3 | 4 | 5) => void;

  // Mentor
  addMentorMessage: (msg: MentorMessage) => void;
  rateMentorMessage: (msgId: string, feedback: 'up' | 'down') => void;
  clearMentorHistory: () => void;

  // Projects & Resources
  submitProject: (submission: UserProjectSubmission) => void;
  reportBrokenResource: (resourceId: string) => void;

  // Gamification & Streaks
  toggleRestDay: () => void;
  useStreakFreeze: () => void;
  simulateInactivityCheck: (daysInactive: number) => void;
  markNotificationsRead: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      user: null,
      profile: null,
      evidence: [],
      assessments: [],
      roadmapVersions: [],
      activeRoadmapVersion: 1,
      agentLogs: [],
      adaptations: [],
      flashcards: [],
      xpTransactions: [],
      badges: [],
      missions: DEMO_MISSIONS.map((m) => ({ ...m, currentCount: 0, completed: false })),
      mentorMessages: [],
      projects: [],
      notifications: [],
      reportedBrokenResources: {},
      toasts: [],
      celebrationMessage: null,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      pushToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 4800);
      },

      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      clearCelebration: () => set({ celebrationMessage: null }),

      loginDemoStudent: () => {
        localAuthService.setSession(DEMO_AUTH_USER);
        set({
          user: DEMO_AUTH_USER,
          profile: { ...DEMO_PROFILE, lastActiveAt: new Date().toISOString() },
          evidence: [...DEMO_EVIDENCE],
          assessments: [...DEMO_ASSESSMENTS],
          roadmapVersions: [DEMO_ROADMAP_VERSION],
          activeRoadmapVersion: 1,
          agentLogs: [...DEMO_AGENT_LOGS],
          adaptations: [...DEMO_ADAPTATIONS],
          flashcards: [...DEMO_FLASHCARDS],
          xpTransactions: [...DEMO_XP_TRANSACTIONS],
          badges: [...DEMO_BADGES],
          missions: DEMO_MISSIONS.map((m) => ({ ...m })),
          mentorMessages: [...DEMO_MENTOR_MESSAGES],
          projects: [...DEMO_PROJECTS],
          notifications: [...DEMO_NOTIFICATIONS],
          celebrationMessage: null,
        });
        get().pushToast({
          title: 'Welcome, Alex (Demo Student)',
          description: 'Illustrative demo data loaded. Explore the full platform end-to-end!',
          tone: 'info',
        });
      },

      resetDemoStudent: () => {
        get().loginDemoStudent();
        get().pushToast({
          title: 'Demo reset complete',
          description: 'Alex’s profile, roadmap, and assessments have been restored to initial demo state.',
          tone: 'success',
        });
      },

      setAuthenticatedUser: (user, isNewRegistration = false) => {
        const currentProfile = get().profile;
        const shouldInitFresh = isNewRegistration || !currentProfile || currentProfile.isDemoData;
        if (shouldInitFresh) {
          set({
            user,
            profile: createFreshProfile(user),
            evidence: [],
            assessments: [],
            roadmapVersions: [],
            activeRoadmapVersion: 1,
            agentLogs: [],
            adaptations: [],
            flashcards: [],
            xpTransactions: [],
            badges: [],
            missions: DEMO_MISSIONS.map((m) => ({ ...m, currentCount: 0, completed: false })),
            mentorMessages: [
              {
                id: `welcome_${Date.now()}`,
                role: 'assistant',
                content: `Hi **${user.name}**! I'm **Pathy**. Once you finish onboarding, I'll tailor explanations, quizzes, and study plans to your verified skills and career goal.`,
                mode: 'Explain',
                language: 'English',
                source: 'offline',
                timestamp: new Date().toISOString(),
              },
            ],
            projects: [],
            notifications: [],
          });
        } else {
          set({ user });
        }
      },

      logout: async () => {
        await localAuthService.logout();
        set({ user: null });
      },

      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...partial, lastActiveAt: new Date().toISOString() }
            : null,
        })),

      completeOnboarding: (finalProfile, baselineAttempt) => {
        const state = get();
        let nextEvidence = [...state.evidence];
        let nextAssessments = [...state.assessments];
        let nextXp = [...state.xpTransactions];

        if (baselineAttempt) {
          nextAssessments = [baselineAttempt, ...nextAssessments];
          for (const topic of baselineAttempt.topics) {
            const topicResponses = baselineAttempt.responses.filter((r) => r.topic === topic);
            const topicScore =
              topicResponses.length > 0
                ? Math.round((topicResponses.filter((r) => r.isCorrect).length / topicResponses.length) * 100)
                : baselineAttempt.scorePercentage;
            nextEvidence.push({
              id: `ev_base_${topic}_${Date.now()}`,
              skill: topic,
              sourceType: 'assessment',
              sourceId: baselineAttempt.id,
              score: topicScore,
              weight: 1.2,
              timestamp: baselineAttempt.timestamp,
            });
          }
          nextXp = awardXPTransaction(nextXp, {
            activityId: `quiz:${baselineAttempt.id}`,
            type: 'quiz',
            amount: XP_REWARDS.quiz,
            description: `Completed Onboarding Baseline Assessment (${baselineAttempt.scorePercentage}%)`,
          }).transactions;
        }

        const career =
          finalProfile.targetCareerId === 'custom-career' && finalProfile.customCareerSkills
            ? buildCustomCareerRole(finalProfile.customCareerTitle || 'Custom Goal', finalProfile.customCareerSkills)
            : CAREERS.find((c) => c.id === finalProfile.targetCareerId) ?? CAREERS[0];

        const proficiencies = buildProficiencyMap(
          career.requiredSkills.map((r) => r.skill),
          nextEvidence,
          finalProfile.selfReportedSkills,
        );

        const orchestration = runMultiAgentPipeline({
          profile: { ...finalProfile, onboardingCompleted: true },
          career,
          proficiencies,
          assessments: nextAssessments,
          previousLessons: [],
          triggerReason: 'Initial onboarding completion',
        });

        const v1 = createRoadmapVersion({
          previousVersion: null,
          careerId: career.id,
          careerTitle: career.title,
          reason: 'Personalized initial roadmap created from onboarding and baseline diagnostic.',
          newLessons: orchestration.roadmapLessons,
        });

        const badgeEval = evaluateUnlockedBadges({
          existingBadges: state.badges,
          completedLessonsCount: 0,
          bestQuizScore: baselineAttempt?.scorePercentage ?? 0,
          projects: state.projects,
          streakDays: finalProfile.streakDays,
          proficiencies,
        });

        set({
          profile: { ...finalProfile, onboardingCompleted: true, lastActiveAt: new Date().toISOString() },
          evidence: nextEvidence,
          assessments: nextAssessments,
          xpTransactions: nextXp,
          badges: badgeEval.badges,
          roadmapVersions: [v1],
          activeRoadmapVersion: v1.version,
          agentLogs: [...orchestration.steps, ...state.agentLogs].slice(0, 30),
          celebrationMessage: 'Onboarding complete! Your personalized roadmap is ready.',
        });
      },

      selectTargetCareer: (careerId, customCareer) => {
        const state = get();
        if (!state.profile) return;

        const updatedProfile: LearnerProfile = {
          ...state.profile,
          targetCareerId: careerId,
          customCareerTitle: customCareer?.title ?? state.profile.customCareerTitle,
          customCareerSkills: customCareer?.skills ?? state.profile.customCareerSkills,
          lastActiveAt: new Date().toISOString(),
        };

        const career =
          careerId === 'custom-career' && updatedProfile.customCareerSkills
            ? buildCustomCareerRole(updatedProfile.customCareerTitle || 'Custom Career', updatedProfile.customCareerSkills)
            : CAREERS.find((c) => c.id === careerId) ?? CAREERS[0];

        const currentVer =
          state.roadmapVersions.find((v) => v.version === state.activeRoadmapVersion) ??
          state.roadmapVersions[state.roadmapVersions.length - 1] ??
          null;

        const proficiencies = buildProficiencyMap(
          career.requiredSkills.map((r) => r.skill),
          state.evidence,
          updatedProfile.selfReportedSkills,
        );

        const orchestration = runMultiAgentPipeline({
          profile: updatedProfile,
          career,
          proficiencies,
          assessments: state.assessments,
          previousLessons: currentVer?.lessons ?? [],
          triggerReason: `Career goal changed to ${career.title}`,
        });

        const nextVersion = createRoadmapVersion({
          previousVersion: currentVer,
          careerId: career.id,
          careerTitle: career.title,
          reason: `Career goal switched to ${career.title}. Prior roadmap archived and completed lessons preserved.`,
          newLessons: orchestration.roadmapLessons,
        });

        const adaptation: AdaptationEvent = {
          id: `adapt_${Date.now()}`,
          trigger: 'Career goal change',
          whatChanged: `Generated Roadmap v${nextVersion.version} for ${career.title} (+${nextVersion.diffSummary?.added.length ?? 0} added, ${nextVersion.diffSummary?.retained.length ?? 0} retained).`,
          whyChanged: 'Recomputed skill gaps against new career requirements while preserving all completed lessons and XP.',
          timestamp: new Date().toISOString(),
          previousRoadmapVersion: currentVer?.version,
          newRoadmapVersion: nextVersion.version,
          undone: false,
        };

        set({
          profile: updatedProfile,
          roadmapVersions: [...state.roadmapVersions, nextVersion],
          activeRoadmapVersion: nextVersion.version,
          agentLogs: [...orchestration.steps, ...state.agentLogs].slice(0, 30),
          adaptations: [adaptation, ...state.adaptations],
          notifications: [
            {
              id: `notif_${Date.now()}`,
              title: `Roadmap updated for ${career.title}`,
              message: 'Old roadmap archived safely. All completed lessons and XP were preserved.',
              type: 'info',
              read: false,
              timestamp: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        });

        get().pushToast({
          title: `Switched target to ${career.title}`,
          description: `Roadmap v${nextVersion.version} generated with your completed progress intact.`,
          tone: 'success',
        });
      },

      regenerateRoadmap: (reason = 'Manual roadmap refresh') => {
        const state = get();
        const profile = state.profile;
        if (!profile) return;
        const career =
          profile.targetCareerId === 'custom-career' && profile.customCareerSkills
            ? buildCustomCareerRole(profile.customCareerTitle || 'Custom Career', profile.customCareerSkills)
            : CAREERS.find((c) => c.id === profile.targetCareerId) ?? CAREERS[0];

        const currentVer =
          state.roadmapVersions.find((v) => v.version === state.activeRoadmapVersion) ?? null;
        const proficiencies = buildProficiencyMap(
          career.requiredSkills.map((r) => r.skill),
          state.evidence,
          profile.selfReportedSkills,
        );

        const orchestration = runMultiAgentPipeline({
          profile,
          career,
          proficiencies,
          assessments: state.assessments,
          previousLessons: currentVer?.lessons ?? [],
          triggerReason: reason,
        });

        const nextVer = createRoadmapVersion({
          previousVersion: currentVer,
          careerId: career.id,
          careerTitle: career.title,
          reason,
          newLessons: orchestration.roadmapLessons,
        });

        set({
          roadmapVersions: [...state.roadmapVersions, nextVer],
          activeRoadmapVersion: nextVer.version,
          agentLogs: [...orchestration.steps, ...state.agentLogs].slice(0, 30),
        });

        get().pushToast({
          title: `Roadmap v${nextVer.version} generated`,
          description: 'Previous versions remain saved in Version History.',
          tone: 'success',
        });
      },

      toggleLessonComplete: (lessonId) => {
        const state = get();
        if (!state.profile) return;
        const currentVer = state.roadmapVersions.find((v) => v.version === state.activeRoadmapVersion);
        if (!currentVer) return;

        let lessonCompletedNow: LessonItem | null = null;
        const updatedLessons = currentVer.lessons.map((l) => {
          if (l.id !== lessonId) return l;
          const nextCompleted = !l.completed;
          if (nextCompleted) lessonCompletedNow = l;
          return {
            ...l,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        });

        // Unlock next sequential lesson if prerequisite completed
        const unlockedLessons = updatedLessons.map((lesson, idx) => {
          if (lesson.completed || idx === 0) return { ...lesson, unlocked: true };
          const prereqMet =
            lesson.prerequisites.length === 0 ||
            lesson.prerequisites.every((pid) => updatedLessons.find((u) => u.id === pid)?.completed);
          return { ...lesson, unlocked: lesson.unlocked || prereqMet };
        });

        const nextVersions = state.roadmapVersions.map((v) =>
          v.version === currentVer.version ? { ...v, lessons: unlockedLessons } : v,
        );

        let nextXp = [...state.xpTransactions];
        let nextMissions = [...state.missions];
        let celebration: string | null = null;

        if (lessonCompletedNow) {
          const lessonObj = lessonCompletedNow as LessonItem;
          const xpRes = awardXPTransaction(nextXp, {
            activityId: `lesson:${lessonObj.id}`,
            type: 'lesson',
            amount: XP_REWARDS.lesson,
            description: `Completed lesson: ${lessonObj.title}`,
          });
          nextXp = xpRes.transactions;

          // Update daily lesson mission
          nextMissions = nextMissions.map((m) => {
            if (m.id !== 'mission-lesson' || m.completed) return m;
            const nextCount = m.currentCount + 1;
            const done = nextCount >= m.targetCount;
            if (done) {
              nextXp = awardXPTransaction(nextXp, {
                activityId: `mission:lesson:${new Date().toISOString().slice(0, 10)}`,
                type: 'mission',
                amount: m.xpReward,
                description: `Daily mission complete: ${m.title}`,
              }).transactions;
            }
            return { ...m, currentCount: nextCount, completed: done };
          });

          if (xpRes.awarded) {
            celebration = `+${XP_REWARDS.lesson} XP earned for completing "${lessonObj.title}"!`;
          }
        }

        const completedCount = unlockedLessons.filter((l) => l.completed).length;
        const proficiencies = buildProficiencyMap([], state.evidence, state.profile?.selfReportedSkills ?? []);
        const bestQuiz = state.assessments.reduce((max, a) => Math.max(max, a.scorePercentage), 0);
        const badgeEval = evaluateUnlockedBadges({
          existingBadges: state.badges,
          completedLessonsCount: completedCount,
          bestQuizScore: bestQuiz,
          projects: state.projects,
          streakDays: state.profile?.streakDays ?? 1,
          proficiencies,
        });

        if (badgeEval.newlyUnlocked.length > 0) {
          celebration = `Badge unlocked: ${badgeEval.newlyUnlocked.map((b) => b.name).join(', ')}!`;
        }

        set({
          roadmapVersions: nextVersions,
          xpTransactions: nextXp,
          missions: nextMissions,
          badges: badgeEval.badges,
          celebrationMessage: celebration,
        });
      },

      toggleLessonOfflineCache: (lessonId) => {
        const state = get();
        const nextVersions = state.roadmapVersions.map((v) =>
          v.version === state.activeRoadmapVersion
            ? {
                ...v,
                lessons: v.lessons.map((l) =>
                  l.id === lessonId ? { ...l, cachedOffline: !l.cachedOffline } : l,
                ),
              }
            : v,
        );
        set({ roadmapVersions: nextVersions });
      },

      testOutModule: (topic, scorePercentage) => {
        const state = get();
        if (!state.profile) return;
        const currentVer = state.roadmapVersions.find((v) => v.version === state.activeRoadmapVersion);
        if (!currentVer) return;

        if (scorePercentage < 80) {
          get().pushToast({
            title: 'Test-out requires 80%+',
            description: `You scored ${scorePercentage}%. Keep practicing ${topic} before skipping this module.`,
            tone: 'warning',
          });
          return;
        }

        const updatedLessons = currentVer.lessons.map((l) =>
          l.topic.toLowerCase() === topic.toLowerCase()
            ? { ...l, completed: true, unlocked: true, completedAt: new Date().toISOString() }
            : l,
        );
        // Unlock next lesson after skipped ones
        updatedLessons.forEach((l, idx) => {
          if (idx === 0 || updatedLessons[idx - 1]?.completed) l.unlocked = true;
        });

        const nextVer = createRoadmapVersion({
          previousVersion: currentVer,
          careerId: currentVer.careerId,
          careerTitle: currentVer.careerTitle,
          reason: `Tested out of ${topic} module with ${scorePercentage}% score.`,
          newLessons: updatedLessons,
        });

        const adapt: AdaptationEvent = {
          id: `adapt_testout_${Date.now()}`,
          trigger: 'Module test-out',
          whatChanged: `Marked ${topic} lessons complete and unlocked subsequent modules (Roadmap v${nextVer.version}).`,
          whyChanged: `Passed ${topic} test-out verification with ${scorePercentage}%.`,
          timestamp: new Date().toISOString(),
          previousRoadmapVersion: currentVer.version,
          newRoadmapVersion: nextVer.version,
          undone: false,
        };

        set({
          roadmapVersions: [...state.roadmapVersions, nextVer],
          activeRoadmapVersion: nextVer.version,
          adaptations: [adapt, ...state.adaptations],
          celebrationMessage: `Tested out of ${topic}! Next roadmap module unlocked.`,
        });
      },

      undoAdaptation: (adaptationId) => {
        const state = get();
        const target = state.adaptations.find((a) => a.id === adaptationId);
        if (!target || target.undone) return;

        const restoredVersion = target.previousRoadmapVersion ?? state.activeRoadmapVersion;
        set({
          activeRoadmapVersion: restoredVersion,
          adaptations: state.adaptations.map((a) =>
            a.id === adaptationId ? { ...a, undone: true } : a,
          ),
        });

        get().pushToast({
          title: 'Adaptation overridden',
          description: `Restored Roadmap v${restoredVersion}.`,
          tone: 'info',
        });
      },

      submitAssessment: (attempt) => {
        const state = get();
        if (!state.profile) return;

        // 1. Add evidence per topic in attempt
        const newEvidence: SkillEvidence[] = attempt.topics.map((topic) => {
          const topicRes = attempt.responses.filter((r) => r.topic === topic);
          const topicScore =
            topicRes.length > 0
              ? Math.round((topicRes.filter((r) => r.isCorrect).length / topicRes.length) * 100)
              : attempt.scorePercentage;
          return {
            id: `ev_${attempt.id}_${topic}`,
            skill: topic,
            sourceType: attempt.mode === 'baseline' || attempt.mode === 'timed' ? 'assessment' : 'quiz',
            sourceId: attempt.id,
            score: topicScore,
            weight: attempt.mode === 'timed' || attempt.mode === 'baseline' ? 1.2 : 1.0,
            timestamp: attempt.timestamp,
          };
        });

        const nextEvidence = [...newEvidence, ...state.evidence];
        const nextAssessments = [attempt, ...state.assessments];

        // 2. XP & Mastery checks (unique activity ID prevents duplicate XP)
        let nextXp = awardXPTransaction(state.xpTransactions, {
          activityId: `quiz:${attempt.id}`,
          type: 'quiz',
          amount: XP_REWARDS.quiz,
          description: `Completed ${attempt.title} (${attempt.scorePercentage}%)`,
        }).transactions;

        const proficiencies = buildProficiencyMap(
          attempt.topics,
          nextEvidence,
          state.profile.selfReportedSkills,
        );

        for (const topic of attempt.topics) {
          const prof = proficiencies[topic];
          if (prof && prof.score !== null && prof.score >= 75) {
            nextXp = awardXPTransaction(nextXp, {
              activityId: `mastery:${topic.toLowerCase()}`,
              type: 'skill_mastery',
              amount: XP_REWARDS.skill_mastery,
              description: `Reached Skill Mastery (75%+) in ${topic} via verified assessment`,
            }).transactions;
          }
        }

        // Daily quiz mission
        const nextMissions = state.missions.map((m) => {
          if (m.id !== 'mission-quiz' || m.completed) return m;
          const nextCount = m.currentCount + 1;
          const done = nextCount >= m.targetCount;
          if (done) {
            nextXp = awardXPTransaction(nextXp, {
              activityId: `mission:quiz:${new Date().toISOString().slice(0, 10)}`,
              type: 'mission',
              amount: m.xpReward,
              description: `Daily mission complete: ${m.title}`,
            }).transactions;
          }
          return { ...m, currentCount: nextCount, completed: done };
        });

        // 3. Adaptive Engine Scenarios A, B, and E
        const currentVer =
          state.roadmapVersions.find((v) => v.version === state.activeRoadmapVersion) ?? null;
        let nextVersions = [...state.roadmapVersions];
        let nextActiveVersion = state.activeRoadmapVersion;
        let nextAdaptations = [...state.adaptations];
        let nextNotifications = [...state.notifications];
        let celebration: string | null = null;

        // Check Scenario E: Repeated struggle (same weak topic failed < 50% twice)
        const priorFailsByTopic = new Map<string, number>();
        for (const past of state.assessments) {
          if (past.scorePercentage < 50) {
            for (const wt of past.weakTopics) {
              priorFailsByTopic.set(wt, (priorFailsByTopic.get(wt) ?? 0) + 1);
            }
          }
        }

        if (attempt.scorePercentage < 50 && currentVer) {
          const primaryWeak = attempt.weakTopics[0] ?? attempt.topics[0];
          const isRepeated = (priorFailsByTopic.get(primaryWeak) ?? 0) >= 1;
          const { updatedLessons, insertedLesson } = insertRemediationLesson(
            currentVer.lessons,
            primaryWeak,
          );
          const newVer = createRoadmapVersion({
            previousVersion: currentVer,
            careerId: currentVer.careerId,
            careerTitle: currentVer.careerTitle,
            reason: `Score ${attempt.scorePercentage}% (<50%) on ${attempt.title}. Inserted beginner remediation for ${primaryWeak}.`,
            newLessons: updatedLessons,
          });
          nextVersions = [...nextVersions, newVer];
          nextActiveVersion = newVer.version;

          nextAdaptations = [
            {
              id: `adapt_low_${Date.now()}`,
              trigger: isRepeated ? 'Repeated struggle (2+ fails)' : 'Low quiz score (<50%)',
              whatChanged: `Added "${insertedLesson.title}" to Roadmap v${newVer.version}${
                isRepeated ? ' and switched recommendation to video/interactive practice.' : '.'
              }`,
              whyChanged: `${attempt.title} scored ${attempt.scorePercentage}% with weak performance in ${attempt.weakTopics.join(', ') || primaryWeak}.`,
              timestamp: new Date().toISOString(),
              previousRoadmapVersion: currentVer.version,
              newRoadmapVersion: newVer.version,
              undone: false,
            },
            ...nextAdaptations,
          ];

          nextNotifications = [
            {
              id: `notif_remed_${Date.now()}`,
              title: 'We added review lessons. Here’s why.',
              message: isRepeated
                ? `You've struggled twice with ${primaryWeak}. We added a beginner clinic and suggest switching to a hands-on or video walkthrough with Pathy.`
                : `Your ${primaryWeak} score was ${attempt.scorePercentage}%. We added "${insertedLesson.title}" right at the top of your active path.`,
              type: 'warning',
              read: false,
              timestamp: new Date().toISOString(),
            },
            ...nextNotifications,
          ];

          get().pushToast({
            title: 'We added review lessons. Here’s why.',
            description: `Inserted beginner remediation for ${primaryWeak} in Roadmap v${newVer.version}.`,
            tone: 'warning',
          });
        } else if (attempt.scorePercentage >= 80 && currentVer) {
          const strongTopic = attempt.topics[0];
          const { updatedLessons, insertedLesson } = insertAdvancedChallengeLesson(
            currentVer.lessons,
            strongTopic,
          );
          const newVer = createRoadmapVersion({
            previousVersion: currentVer,
            careerId: currentVer.careerId,
            careerTitle: currentVer.careerTitle,
            reason: `Score ${attempt.scorePercentage}% (>=80%) unlocked advanced challenge in ${strongTopic}.`,
            newLessons: updatedLessons,
          });
          nextVersions = [...nextVersions, newVer];
          nextActiveVersion = newVer.version;

          nextAdaptations = [
            {
              id: `adapt_high_${Date.now()}`,
              trigger: 'High quiz score (>=80%)',
              whatChanged: `Unlocked "${insertedLesson.title}" and enabled ${strongTopic} module test-out.`,
              whyChanged: `Scored ${attempt.scorePercentage}% on ${attempt.title}.`,
              timestamp: new Date().toISOString(),
              previousRoadmapVersion: currentVer.version,
              newRoadmapVersion: newVer.version,
              undone: false,
            },
            ...nextAdaptations,
          ];

          celebration = `Strong score (${attempt.scorePercentage}%)! Advanced ${strongTopic} challenge unlocked.`;
        }

        const completedLessonsCount =
          nextVersions.find((v) => v.version === nextActiveVersion)?.lessons.filter((l) => l.completed)
            .length ?? 0;
        const bestQuizScore = nextAssessments.reduce((max, a) => Math.max(max, a.scorePercentage), 0);

        const badgeEval = evaluateUnlockedBadges({
          existingBadges: state.badges,
          completedLessonsCount,
          bestQuizScore,
          projects: state.projects,
          streakDays: state.profile.streakDays,
          proficiencies,
        });

        if (badgeEval.newlyUnlocked.length > 0) {
          celebration = `Badge unlocked: ${badgeEval.newlyUnlocked.map((b) => b.name).join(', ')}!`;
        }

        const newAgentLog: AgentStepLog = {
          id: `ag_quiz_${Date.now()}`,
          agentName: 'Assessment Agent',
          status: 'completed',
          summary: `Assessment Agent: ${attempt.title} graded (${attempt.scorePercentage}%)`,
          timestamp: new Date().toISOString(),
          retriesUsed: 0,
          usedFallback: true,
        };

        set({
          evidence: nextEvidence,
          assessments: nextAssessments,
          xpTransactions: nextXp,
          missions: nextMissions,
          badges: badgeEval.badges,
          roadmapVersions: nextVersions,
          activeRoadmapVersion: nextActiveVersion,
          adaptations: nextAdaptations,
          notifications: nextNotifications,
          agentLogs: [newAgentLog, ...state.agentLogs].slice(0, 30),
          celebrationMessage: celebration,
        });
      },

      addMistakesToFlashcards: (attempt) => {
        const state = get();
        const missed = attempt.responses.filter((r) => !r.isCorrect);
        if (missed.length === 0) return 0;

        const existingFronts = new Set(state.flashcards.map((f) => f.front));
        const newCards: Flashcard[] = [];
        const now = new Date().toISOString();

        for (const m of missed) {
          const front = `Review (${m.topic}): Question ${m.questionId.toUpperCase()} — why was your earlier answer incorrect?`;
          if (!existingFronts.has(front)) {
            newCards.push({
              id: `fc_${Date.now()}_${m.questionId}`,
              topic: m.topic,
              front,
              back: m.explanation,
              intervalDays: 1,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewAt: now,
              createdAt: now,
            });
          }
        }

        set({ flashcards: [...newCards, ...state.flashcards] });
        get().pushToast({
          title: `Added ${newCards.length} flashcard(s)`,
          description: 'Scheduled in your spaced-repetition deck under Achievements.',
          tone: 'success',
        });
        return newCards.length;
      },

      reviewFlashcard: (cardId, quality) => {
        const state = get();
        const nextCards = state.flashcards.map((c) =>
          c.id === cardId ? updateFlashcardSM2(c, quality) : c,
        );

        let nextXp = [...state.xpTransactions];
        const nextMissions = state.missions.map((m) => {
          if (m.id !== 'mission-flashcard' || m.completed) return m;
          const nextCount = m.currentCount + 1;
          const done = nextCount >= m.targetCount;
          if (done) {
            nextXp = awardXPTransaction(nextXp, {
              activityId: `mission:flashcard:${new Date().toISOString().slice(0, 10)}`,
              type: 'mission',
              amount: m.xpReward,
              description: `Daily mission complete: ${m.title}`,
            }).transactions;
          }
          return { ...m, currentCount: nextCount, completed: done };
        });

        set({ flashcards: nextCards, xpTransactions: nextXp, missions: nextMissions });
      },

      addMentorMessage: (msg) =>
        set((state) => ({
          mentorMessages: [...state.mentorMessages, msg],
        })),

      rateMentorMessage: (msgId, feedback) =>
        set((state) => ({
          mentorMessages: state.mentorMessages.map((m) =>
            m.id === msgId ? { ...m, feedback } : m,
          ),
        })),

      clearMentorHistory: () =>
        set((state) => ({
          mentorMessages: [
            {
              id: `clear_${Date.now()}`,
              role: 'assistant',
              content: `Fresh conversation started! Ask me anything about your roadmap, ${
                state.profile?.fullName ?? 'friend'
              }.`,
              mode: 'Explain',
              language: state.profile?.preferredLanguage ?? 'English',
              source: 'offline',
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      submitProject: (submission) => {
        const state = get();
        if (!state.profile) return;

        const nextProjects = [submission, ...state.projects];
        const projScore = submission.aiReview?.estimatedScore ?? 78;

        const projectEvidence: SkillEvidence[] = submission.requiredSkills.slice(0, 3).map((skill) => ({
          id: `ev_proj_${submission.id}_${skill}`,
          skill,
          sourceType: 'project',
          sourceId: submission.id,
          score: projScore,
          weight: 1.3,
          timestamp: submission.submittedAt,
        }));

        const nextEvidence = [...projectEvidence, ...state.evidence];
        let nextXp = awardXPTransaction(state.xpTransactions, {
          activityId: `project:${submission.projectIdeaId}:${submission.id}`,
          type: 'mini_project',
          amount: XP_REWARDS.mini_project,
          description: `Submitted portfolio project: ${submission.title}`,
        }).transactions;

        const proficiencies = buildProficiencyMap(
          submission.requiredSkills,
          nextEvidence,
          state.profile.selfReportedSkills,
        );

        const completedCount =
          state.roadmapVersions.find((v) => v.version === state.activeRoadmapVersion)?.lessons.filter((l) => l.completed)
            .length ?? 0;
        const bestQuiz = state.assessments.reduce((max, a) => Math.max(max, a.scorePercentage), 0);

        const badgeEval = evaluateUnlockedBadges({
          existingBadges: state.badges,
          completedLessonsCount: completedCount,
          bestQuizScore: bestQuiz,
          projects: nextProjects,
          streakDays: state.profile.streakDays,
          proficiencies,
        });

        set({
          projects: nextProjects,
          evidence: nextEvidence,
          xpTransactions: nextXp,
          badges: badgeEval.badges,
          celebrationMessage: `Project "${submission.title}" saved (+100 XP)!`,
        });
      },

      reportBrokenResource: (resourceId) => {
        set((state) => ({
          reportedBrokenResources: {
            ...state.reportedBrokenResources,
            [resourceId]: (state.reportedBrokenResources[resourceId] ?? 0) + 1,
          },
        }));
        get().pushToast({
          title: 'Broken link report logged',
          description: 'Thank you for helping keep curated resource hints accurate.',
          tone: 'info',
        });
      },

      toggleRestDay: () => {
        const state = get();
        if (!state.profile) return;
        const nextRest = !state.profile.restDayActive;
        set({
          profile: { ...state.profile, restDayActive: nextRest },
        });
        get().pushToast({
          title: nextRest ? 'Rest day enabled' : 'Rest day ended',
          description: nextRest
            ? 'Your streak is safely paused today. Take care of yourself!'
            : 'Welcome back — ready whenever you are.',
          tone: 'info',
        });
      },

      useStreakFreeze: () => {
        const state = get();
        if (!state.profile || state.profile.streakFreezeAvailable <= 0) return;
        set({
          profile: {
            ...state.profile,
            streakFreezeAvailable: state.profile.streakFreezeAvailable - 1,
            restDayActive: true,
          },
        });
        get().pushToast({
          title: 'Streak freeze activated',
          description: 'Your learning streak is protected.',
          tone: 'success',
        });
      },

      simulateInactivityCheck: (daysInactive) => {
        const state = get();
        if (!state.profile || daysInactive < 3) return;
        const reducedHours = Math.max(4, Math.round(state.profile.weeklyStudyHours * 0.6));
        const adapt: AdaptationEvent = {
          id: `adapt_inact_${Date.now()}`,
          trigger: 'Inactivity (3+ days)',
          whatChanged: `Temporarily eased weekly target from ${state.profile.weeklyStudyHours}h to ${reducedHours}h and offered a Streak Freeze.`,
          whyChanged: `Detected ${daysInactive} days without activity — easing workload prevents burnout.`,
          timestamp: new Date().toISOString(),
          undone: false,
        };
        set({
          profile: { ...state.profile, weeklyStudyHours: reducedHours },
          adaptations: [adapt, ...state.adaptations],
          notifications: [
            {
              id: `notif_inact_${Date.now()}`,
              title: 'Welcome back! Gentle re-engagement plan ready',
              message: `We noticed ${daysInactive} quiet days. No guilt — your daily target was eased to ${reducedHours}h/week and a Streak Freeze is available.`,
              type: 'info',
              read: false,
              timestamp: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        });
      },

      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'skillpath_ai_store_v1',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        profile: state.profile,
        evidence: state.evidence,
        assessments: state.assessments,
        roadmapVersions: state.roadmapVersions,
        activeRoadmapVersion: state.activeRoadmapVersion,
        agentLogs: state.agentLogs,
        adaptations: state.adaptations,
        flashcards: state.flashcards,
        xpTransactions: state.xpTransactions,
        badges: state.badges,
        missions: state.missions,
        mentorMessages: state.mentorMessages,
        projects: state.projects,
        notifications: state.notifications,
        reportedBrokenResources: state.reportedBrokenResources,
      }),
    },
  ),
);

export function selectActiveCareer(profile: LearnerProfile | null): CareerRole {
  if (!profile) return CAREERS[0];
  if (profile.targetCareerId === 'custom-career' && profile.customCareerSkills) {
    return buildCustomCareerRole(profile.customCareerTitle || 'Custom Career', profile.customCareerSkills);
  }
  return CAREERS.find((c) => c.id === profile.targetCareerId) ?? CAREERS[0];
}

export function selectTotalXP(state: Pick<AppState, 'xpTransactions'>): number {
  return calculateTotalXP(state.xpTransactions);
}
