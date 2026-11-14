import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  AdaptationEvent,
  AgentStepLog,
  AssessmentAttempt,
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
import {
  AIConversationDoc,
  AgentWorkflowDoc,
  AssessmentAttemptDoc,
  AssessmentDoc,
  AchievementDoc,
  ProgressDoc,
  ProjectDoc,
  RoadmapDoc,
  SkillDoc,
  UserDoc,
  XPTransactionDoc,
} from '../types/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Defensive helpers guaranteeing volumetric limits from firebase-blueprint.json & firestore.rules
function clampStr(value: string | undefined | null, maxLen: number, fallback = ''): string {
  const raw = (value ?? fallback).toString().trim();
  if (!raw && fallback) return fallback.slice(0, maxLen);
  return raw.slice(0, maxLen);
}

export function sanitizeFirestoreId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `doc_${Date.now()}`;
}

function clampInt(val: number, min: number, max: number): number {
  const n = Math.round(Number.isFinite(val) ? val : min);
  return Math.min(max, Math.max(min, n));
}

function clampNum(val: number, min: number, max: number): number {
  const n = Number.isFinite(val) ? val : min;
  return Math.min(max, Math.max(min, n));
}

function isoFromFirestore(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function canWriteToCloud(uid: string): boolean {
  const current = auth.currentUser;
  return Boolean(current && current.uid === uid && current.emailVerified);
}

// 1. Users Collection
export async function upsertUserProfile(uid: string, profile: LearnerProfile): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const safeUid = sanitizeFirestoreId(uid);
  const path = `users/${safeUid}`;
  const ref = doc(db, 'users', safeUid);

  try {
    const snap = await getDoc(ref);
    const baseFields = {
      fullName: clampStr(profile.fullName, 120, 'Student'),
      college: clampStr(profile.college, 160),
      department: clampStr(profile.department, 120),
      academicYear: clampStr(profile.academicYear, 40, 'Second year'),
      educationLevel: clampStr(profile.educationLevel, 60, 'B.E. / B.Tech'),
      preferredLanguage: profile.preferredLanguage,
      preferredLearningStyle: profile.preferredLearningStyle,
      targetCareerId: clampStr(profile.targetCareerId, 80, 'full-stack-developer'),
      ...(profile.customCareerTitle
        ? { customCareerTitle: clampStr(profile.customCareerTitle, 120) }
        : {}),
      weeklyStudyHours: clampNum(profile.weeklyStudyHours, 1, 80),
      preferredStudyTime: profile.preferredStudyTime,
      onboardingCompleted: Boolean(profile.onboardingCompleted),
      publicPortfolioEnabled: Boolean(profile.publicPortfolioEnabled),
      leaderboardOptIn: Boolean(profile.leaderboardOptIn),
      streakDays: clampInt(profile.streakDays, 0, 10000),
      streakFreezeAvailable: clampInt(profile.streakFreezeAvailable, 0, 50),
      restDayActive: Boolean(profile.restDayActive),
      updatedAt: serverTimestamp(),
    };

    if (!snap.exists()) {
      const payload: UserDoc = {
        uid: safeUid,
        email: clampStr(profile.email || auth.currentUser?.email || '', 200, 'student@example.com'),
        ...baseFields,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, baseFields);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: Partial<LearnerProfile> | null) => void,
): Unsubscribe {
  const safeUid = sanitizeFirestoreId(uid);
  const path = `users/${safeUid}`;
  return onSnapshot(
    doc(db, 'users', safeUid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data() as UserDoc;
      onData({
        fullName: d.fullName,
        email: d.email,
        college: d.college ?? '',
        department: d.department ?? '',
        academicYear: d.academicYear ?? 'Second year',
        educationLevel: d.educationLevel ?? 'B.E. / B.Tech',
        preferredLanguage: d.preferredLanguage ?? 'English',
        preferredLearningStyle: d.preferredLearningStyle ?? 'hands-on',
        targetCareerId: d.targetCareerId,
        customCareerTitle: d.customCareerTitle,
        weeklyStudyHours: d.weeklyStudyHours,
        preferredStudyTime: d.preferredStudyTime ?? 'Evening',
        onboardingCompleted: d.onboardingCompleted,
        publicPortfolioEnabled: Boolean(d.publicPortfolioEnabled),
        leaderboardOptIn: Boolean(d.leaderboardOptIn),
        streakDays: d.streakDays ?? 1,
        streakFreezeAvailable: d.streakFreezeAvailable ?? 1,
        restDayActive: Boolean(d.restDayActive),
        lastActiveAt: isoFromFirestore(d.updatedAt),
      });
    },
    (error) => handleFirestoreError(error, OperationType.GET, path),
  );
}

// 2. Skills Collection
export async function syncSkillProficiency(uid: string, prof: SkillProficiency): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${prof.skill.toLowerCase()}`);
  const path = `skills/${docId}`;
  const ref = doc(db, 'skills', docId);

  try {
    const snap = await getDoc(ref);
    const mutable = {
      verifiedScore: prof.score === null ? null : clampNum(prof.score, 0, 100),
      confidence: prof.confidence,
      evidenceCount: clampInt(prof.evidenceCount, 0, 1000),
      selfReportedRating:
        prof.selfReportedRating === null ? null : clampNum(prof.selfReportedRating, 0, 100),
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      const payload: SkillDoc = {
        userId: uid,
        skill: clampStr(prof.skill, 80, 'General'),
        ...mutable,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, mutable);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Assessments Collection
export async function saveAssessmentConfig(
  uid: string,
  config: {
    id: string;
    title: string;
    mode: AssessmentDoc['mode'];
    difficulty: AssessmentDoc['difficulty'];
    topics: string[];
  },
): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${config.id}`);
  const path = `assessments/${docId}`;
  const ref = doc(db, 'assessments', docId);

  try {
    const topics = config.topics.length > 0 ? config.topics.slice(0, 20) : ['General'];
    const payload: AssessmentDoc = {
      userId: uid,
      title: clampStr(config.title, 160, 'Skill Assessment'),
      mode: config.mode,
      difficulty: config.difficulty,
      topics,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 4. Assessment Attempts Collection (immutable)
export async function saveAssessmentAttempt(uid: string, attempt: AssessmentAttempt): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${attempt.id}`);
  const path = `assessment_attempts/${docId}`;
  const ref = doc(db, 'assessment_attempts', docId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return; // Immutable ledger
    const payload: AssessmentAttemptDoc = {
      userId: uid,
      title: clampStr(attempt.title, 160, 'Assessment'),
      mode: attempt.mode,
      scorePercentage: clampNum(attempt.scorePercentage, 0, 100),
      correctCount: clampInt(attempt.correctCount, 0, 200),
      totalQuestions: clampInt(attempt.totalQuestions, 1, 200),
      topics: attempt.topics.length > 0 ? attempt.topics.slice(0, 20) : ['General'],
      weakTopics: attempt.weakTopics.slice(0, 20),
      durationSeconds: clampInt(attempt.durationSeconds, 0, 86400),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 5. Roadmaps Collection (versioned)
function compactLessonForFirestore(lesson: LessonItem): Record<string, unknown> {
  return {
    id: lesson.id,
    stageTitle: lesson.stageTitle,
    moduleTitle: lesson.moduleTitle,
    topic: lesson.topic,
    title: lesson.title,
    explanation: clampStr(lesson.explanation, 600),
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes,
    learningObjectives: lesson.learningObjectives.slice(0, 5),
    resourceIds: lesson.resourceIds.slice(0, 5),
    practiceTask: clampStr(lesson.practiceTask, 300),
    quizTopic: lesson.quizTopic,
    completed: Boolean(lesson.completed),
    ...(lesson.completedAt ? { completedAt: lesson.completedAt } : {}),
    unlocked: Boolean(lesson.unlocked),
    prerequisites: lesson.prerequisites.slice(0, 5),
    linkedSkillGap: lesson.linkedSkillGap,
    reasonForInclusion: clampStr(lesson.reasonForInclusion, 300),
    ...(lesson.isRemediation ? { isRemediation: true } : {}),
    ...(lesson.isAdvancedChallenge ? { isAdvancedChallenge: true } : {}),
    ...(lesson.recommendedFormatOverride
      ? { recommendedFormatOverride: lesson.recommendedFormatOverride }
      : {}),
  };
}

export async function saveRoadmapVersion(
  uid: string,
  version: RoadmapVersion,
  isActive: boolean,
): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_roadmap_v${version.version}`);
  const path = `roadmaps/${docId}`;
  const ref = doc(db, 'roadmaps', docId);

  try {
    const snap = await getDoc(ref);
    const lessons = version.lessons.slice(0, 100).map(compactLessonForFirestore);
    if (!snap.exists()) {
      const payload: RoadmapDoc = {
        userId: uid,
        version: clampInt(version.version, 1, 500),
        careerId: clampStr(version.careerId, 80, 'full-stack-developer'),
        careerTitle: clampStr(version.careerTitle, 120, 'Full Stack Developer'),
        reason: clampStr(version.reason, 400, 'Personalized roadmap generated'),
        lessons,
        ...(version.diffSummary ? { diffSummary: version.diffSummary } : {}),
        isActive: Boolean(isActive),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, {
        lessons,
        isActive: Boolean(isActive),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Progress Collection
export async function upsertProgressSnapshot(
  uid: string,
  params: {
    completedLessonsCount: number;
    totalMinutesLogged: number;
    activeRoadmapVersion: number;
    adaptations: AdaptationEvent[];
    flashcards: Flashcard[];
  },
): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_progress`);
  const path = `progress/${docId}`;
  const ref = doc(db, 'progress', docId);

  try {
    const snap = await getDoc(ref);
    const mutable = {
      completedLessonsCount: clampInt(params.completedLessonsCount, 0, 5000),
      totalMinutesLogged: clampInt(params.totalMinutesLogged, 0, 1000000),
      activeRoadmapVersion: clampInt(params.activeRoadmapVersion, 1, 500),
      adaptations: params.adaptations.slice(0, 200),
      flashcards: params.flashcards.slice(0, 500),
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      const payload: ProgressDoc = {
        userId: uid,
        ...mutable,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, mutable);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 7. Projects Collection
export async function saveProjectSubmission(
  uid: string,
  sub: UserProjectSubmission,
): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${sub.id}`);
  const path = `projects/${docId}`;
  const ref = doc(db, 'projects', docId);

  try {
    const snap = await getDoc(ref);
    const mutable = {
      description: clampStr(
        sub.description.length >= 10 ? sub.description : `${sub.description} — submitted via SkillPath AI`,
        2000,
      ),
      githubUrl: clampStr(sub.githubUrl, 300),
      liveDemoUrl: clampStr(sub.liveDemoUrl, 300),
      ...(sub.aiReview ? { aiReview: sub.aiReview as unknown as Record<string, unknown> } : {}),
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      const payload: ProjectDoc = {
        userId: uid,
        projectIdeaId: clampStr(sub.projectIdeaId, 80, 'custom-project'),
        title: clampStr(sub.title, 160, 'Student Project'),
        level: sub.level,
        requiredSkills: sub.requiredSkills.slice(0, 15),
        ...mutable,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, mutable);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 8. Achievements Collection (immutable)
export async function saveUnlockedBadge(uid: string, badge: UnlockedBadge): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${badge.badgeId}`);
  const path = `achievements/${docId}`;
  const ref = doc(db, 'achievements', docId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    const payload: AchievementDoc = {
      userId: uid,
      badgeId: clampStr(badge.badgeId, 80),
      evidenceNote: clampStr(badge.evidenceNote, 300, 'Verified milestone unlocked'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 9. XP Transactions Collection (append-only)
export async function recordXPTransaction(uid: string, tx: XPTransaction): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${tx.activityId}`);
  const path = `xp_transactions/${docId}`;
  const ref = doc(db, 'xp_transactions', docId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    const payload: XPTransactionDoc = {
      userId: uid,
      activityId: clampStr(tx.activityId, 160),
      type: tx.type,
      amount: clampInt(tx.amount, 1, 500),
      description: clampStr(tx.description, 300, 'Learning XP reward'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 10. AI Conversations Collection
export async function saveAIConversationMessage(uid: string, msg: MentorMessage): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${msg.id}`);
  const path = `ai_conversations/${docId}`;
  const ref = doc(db, 'ai_conversations', docId);

  try {
    const payload: AIConversationDoc = {
      userId: uid,
      role: msg.role,
      content: clampStr(msg.content, 8000, '...'),
      mode: clampStr(msg.mode, 40, 'Explain'),
      language: msg.language,
      ...(msg.lessonTitle ? { lessonTitle: clampStr(msg.lessonTitle, 160) } : {}),
      source: msg.source,
      feedback: msg.feedback ?? 'none',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAIConversationFeedback(
  uid: string,
  messageId: string,
  feedback: 'up' | 'down',
): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${messageId}`);
  const path = `ai_conversations/${docId}`;
  try {
    await updateDoc(doc(db, 'ai_conversations', docId), {
      feedback,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 11. Agent Workflows Collection (append-only audit trail)
export async function logAgentWorkflowStep(uid: string, step: AgentStepLog): Promise<void> {
  if (!canWriteToCloud(uid)) return;
  const docId = sanitizeFirestoreId(`${uid}_${step.id}`);
  const path = `agent_workflows/${docId}`;
  const ref = doc(db, 'agent_workflows', docId);

  try {
    const payload: AgentWorkflowDoc = {
      userId: uid,
      agentName: clampStr(step.agentName, 80, 'Agent'),
      status: step.status,
      summary: clampStr(step.summary, 500, 'Step completed'),
      retriesUsed: clampInt(step.retriesUsed, 0, 5),
      usedFallback: Boolean(step.usedFallback),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export interface HydratedCloudState {
  profile: Partial<LearnerProfile> | null;
  skills: SkillEvidence[];
  assessments: AssessmentAttempt[];
  roadmapVersions: RoadmapVersion[];
  activeRoadmapVersion: number;
  adaptations: AdaptationEvent[];
  flashcards: Flashcard[];
  projects: UserProjectSubmission[];
  badges: UnlockedBadge[];
  xpTransactions: XPTransaction[];
  mentorMessages: MentorMessage[];
  agentLogs: AgentStepLog[];
}

// Load all 11 user-scoped collections safely using strict owner queries
export async function loadLearnerCloudState(uid: string): Promise<HydratedCloudState> {
  const safeUid = sanitizeFirestoreId(uid);

  const userQuery = getDoc(doc(db, 'users', safeUid)).catch((err) =>
    handleFirestoreError(err, OperationType.GET, `users/${safeUid}`),
  );
  const queryByUser = (col: string) =>
    getDocs(query(collection(db, col), where('userId', '==', uid))).catch((err) =>
      handleFirestoreError(err, OperationType.LIST, col),
    );

  const [
    userSnap,
    skillsSnap,
    attemptsSnap,
    roadmapsSnap,
    progressSnap,
    projectsSnap,
    achievementsSnap,
    xpSnap,
    chatSnap,
    workflowsSnap,
  ] = await Promise.all([
    userQuery,
    queryByUser('skills'),
    queryByUser('assessment_attempts'),
    queryByUser('roadmaps'),
    queryByUser('progress'),
    queryByUser('projects'),
    queryByUser('achievements'),
    queryByUser('xp_transactions'),
    queryByUser('ai_conversations'),
    queryByUser('agent_workflows'),
  ]);

  let profile: Partial<LearnerProfile> | null = null;
  if (userSnap.exists()) {
    const d = userSnap.data() as UserDoc;
    profile = {
      fullName: d.fullName,
      email: d.email,
      college: d.college ?? '',
      department: d.department ?? '',
      academicYear: d.academicYear ?? 'Second year',
      educationLevel: d.educationLevel ?? 'B.E. / B.Tech',
      preferredLanguage: d.preferredLanguage ?? 'English',
      preferredLearningStyle: d.preferredLearningStyle ?? 'hands-on',
      targetCareerId: d.targetCareerId,
      customCareerTitle: d.customCareerTitle,
      weeklyStudyHours: d.weeklyStudyHours,
      preferredStudyTime: d.preferredStudyTime ?? 'Evening',
      onboardingCompleted: d.onboardingCompleted,
      publicPortfolioEnabled: Boolean(d.publicPortfolioEnabled),
      leaderboardOptIn: Boolean(d.leaderboardOptIn),
      streakDays: d.streakDays ?? 1,
      streakFreezeAvailable: d.streakFreezeAvailable ?? 1,
      restDayActive: Boolean(d.restDayActive),
      lastActiveAt: isoFromFirestore(d.updatedAt),
    };
  }

  const skills: SkillEvidence[] = [];
  skillsSnap.forEach((d) => {
    const row = d.data() as SkillDoc;
    if (row.verifiedScore !== null && row.verifiedScore !== undefined) {
      skills.push({
        id: d.id,
        skill: row.skill,
        sourceType: 'assessment',
        sourceId: d.id,
        score: row.verifiedScore,
        weight: 1.0,
        timestamp: isoFromFirestore(row.updatedAt),
      });
    }
  });

  const assessments: AssessmentAttempt[] = attemptsSnap.docs
    .map((d) => {
      const row = d.data() as AssessmentAttemptDoc;
      return {
        id: d.id,
        title: row.title,
        mode: row.mode,
        topics: row.topics,
        difficulty: 'mixed' as const,
        scorePercentage: row.scorePercentage,
        correctCount: row.correctCount,
        totalQuestions: row.totalQuestions,
        weakTopics: row.weakTopics,
        responses: [],
        durationSeconds: row.durationSeconds ?? 180,
        timestamp: isoFromFirestore(row.createdAt),
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  let activeRoadmapVersion = 1;
  const roadmapVersions: RoadmapVersion[] = roadmapsSnap.docs
    .map((d) => {
      const row = d.data() as RoadmapDoc;
      if (row.isActive) activeRoadmapVersion = row.version;
      return {
        version: row.version,
        createdAt: isoFromFirestore(row.createdAt),
        careerId: row.careerId,
        careerTitle: row.careerTitle,
        reason: row.reason,
        lessons: (row.lessons ?? []) as unknown as LessonItem[],
        diffSummary: row.diffSummary,
      };
    })
    .sort((a, b) => a.version - b.version);

  let adaptations: AdaptationEvent[] = [];
  let flashcards: Flashcard[] = [];
  if (!progressSnap.empty) {
    const pData = progressSnap.docs[0].data() as ProgressDoc;
    activeRoadmapVersion = pData.activeRoadmapVersion || activeRoadmapVersion;
    adaptations = pData.adaptations ?? [];
    flashcards = pData.flashcards ?? [];
  }

  const projects: UserProjectSubmission[] = projectsSnap.docs.map((d) => {
    const row = d.data() as ProjectDoc;
    return {
      id: d.id,
      projectIdeaId: row.projectIdeaId,
      title: row.title,
      level: row.level,
      requiredSkills: row.requiredSkills ?? [],
      description: row.description,
      githubUrl: row.githubUrl ?? '',
      liveDemoUrl: row.liveDemoUrl ?? '',
      submittedAt: isoFromFirestore(row.createdAt),
      aiReview: row.aiReview as UserProjectSubmission['aiReview'],
    };
  });

  const badges: UnlockedBadge[] = achievementsSnap.docs.map((d) => {
    const row = d.data() as AchievementDoc;
    return {
      badgeId: row.badgeId,
      unlockedAt: isoFromFirestore(row.createdAt),
      evidenceNote: row.evidenceNote,
    };
  });

  const xpTransactions: XPTransaction[] = xpSnap.docs.map((d) => {
    const row = d.data() as XPTransactionDoc;
    return {
      id: d.id,
      activityId: row.activityId,
      type: row.type,
      amount: row.amount,
      description: row.description,
      timestamp: isoFromFirestore(row.createdAt),
    };
  });

  const mentorMessages: MentorMessage[] = chatSnap.docs
    .map((d) => {
      const row = d.data() as AIConversationDoc;
      return {
        id: d.id,
        role: row.role,
        content: row.content,
        mode: row.mode as MentorMessage['mode'],
        language: row.language,
        lessonTitle: row.lessonTitle,
        source: row.source,
        feedback: row.feedback === 'none' ? undefined : row.feedback,
        timestamp: isoFromFirestore(row.createdAt),
      };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const agentLogs: AgentStepLog[] = workflowsSnap.docs
    .map((d) => {
      const row = d.data() as AgentWorkflowDoc;
      return {
        id: d.id,
        agentName: row.agentName as AgentStepLog['agentName'],
        status: row.status,
        summary: row.summary,
        timestamp: isoFromFirestore(row.createdAt),
        retriesUsed: row.retriesUsed,
        usedFallback: row.usedFallback,
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    profile,
    skills,
    assessments,
    roadmapVersions,
    activeRoadmapVersion,
    adaptations,
    flashcards,
    projects,
    badges,
    xpTransactions,
    mentorMessages,
    agentLogs,
  };
}
