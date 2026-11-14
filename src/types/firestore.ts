import { FieldValue, Timestamp } from 'firebase/firestore';
import {
  AdaptationEvent,
  AgentWorkflowStatus,
  ConfidenceLevel,
  DifficultyLevel,
  Flashcard,
  LearningStyle,
  PreferredLanguage,
  XPActivityType,
} from './index';

export type FirestoreTimestampValue = Timestamp | FieldValue;

export interface UserDoc {
  uid: string;
  fullName: string;
  email: string;
  college?: string;
  department?: string;
  academicYear?: string;
  educationLevel?: string;
  preferredLanguage?: PreferredLanguage;
  preferredLearningStyle?: LearningStyle;
  targetCareerId: string;
  customCareerTitle?: string;
  weeklyStudyHours: number;
  preferredStudyTime?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  onboardingCompleted: boolean;
  publicPortfolioEnabled?: boolean;
  leaderboardOptIn?: boolean;
  streakDays?: number;
  streakFreezeAvailable?: number;
  restDayActive?: boolean;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface SkillDoc {
  userId: string;
  skill: string;
  verifiedScore: number | null;
  confidence: ConfidenceLevel;
  evidenceCount: number;
  selfReportedRating: number | null;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface AssessmentDoc {
  userId: string;
  title: string;
  mode: 'topic' | 'daily' | 'challenge' | 'timed' | 'weekly' | 'baseline' | 'test-out';
  difficulty: DifficultyLevel | 'mixed';
  topics: string[];
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface AssessmentAttemptDoc {
  userId: string;
  title: string;
  mode: 'topic' | 'daily' | 'challenge' | 'timed' | 'weekly' | 'baseline' | 'test-out';
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  topics: string[];
  weakTopics: string[];
  durationSeconds?: number;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface RoadmapDoc {
  userId: string;
  version: number;
  careerId: string;
  careerTitle: string;
  reason: string;
  lessons: Record<string, unknown>[];
  diffSummary?: {
    added: string[];
    removed: string[];
    retained: string[];
  };
  isActive: boolean;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface ProgressDoc {
  userId: string;
  completedLessonsCount: number;
  totalMinutesLogged?: number;
  activeRoadmapVersion: number;
  adaptations?: AdaptationEvent[];
  flashcards?: Flashcard[];
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface ProjectDoc {
  userId: string;
  projectIdeaId: string;
  title: string;
  level: DifficultyLevel;
  requiredSkills?: string[];
  description: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  aiReview?: Record<string, unknown>;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface AchievementDoc {
  userId: string;
  badgeId: string;
  evidenceNote: string;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface XPTransactionDoc {
  userId: string;
  activityId: string;
  type: XPActivityType;
  amount: number;
  description: string;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface AIConversationDoc {
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  mode: string;
  language: PreferredLanguage;
  lessonTitle?: string;
  source: 'gemini' | 'offline';
  feedback?: 'up' | 'down' | 'none';
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}

export interface AgentWorkflowDoc {
  userId: string;
  agentName: string;
  status: AgentWorkflowStatus;
  summary: string;
  retriesUsed: number;
  usedFallback: boolean;
  createdAt: FirestoreTimestampValue;
  updatedAt: FirestoreTimestampValue;
}
