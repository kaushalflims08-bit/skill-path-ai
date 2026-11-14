import {
  AdaptationEvent,
  AgentStepLog,
  AppNotification,
  AssessmentAttempt,
  AuthUser,
  DailyMission,
  Flashcard,
  LearnerProfile,
  MentorMessage,
  RoadmapVersion,
  SkillEvidence,
  UnlockedBadge,
  UserProjectSubmission,
  XPTransaction,
} from '../types';
import { buildDemoFullStackRoadmap } from '../lib/roadmapEngine';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_AUTH_USER: AuthUser = {
  id: 'demo-student-alex',
  name: 'Alex',
  email: 'alex.demo@skillpath.edu',
  provider: 'local',
  isDemo: true,
  createdAt: daysAgo(12),
};

export const DEMO_PROFILE: LearnerProfile = {
  fullName: 'Alex',
  email: 'alex.demo@skillpath.edu',
  college: 'State Institute of Engineering & Technology',
  department: 'Computer Science',
  academicYear: 'Third year',
  educationLevel: 'B.E. / B.Tech',
  selfReportedSkills: [
    { skill: 'Python', rating: 85, verified: false },
    { skill: 'SQL', rating: 75, verified: false },
    { skill: 'HTML', rating: 65, verified: false },
    { skill: 'JavaScript', rating: 30, verified: false },
  ],
  softSkills: ['Team collaboration', 'Technical documentation', 'Problem decomposition'],
  certifications: ['Intro to Programming with Python (Course Certificate)'],
  existingProjects: [
    {
      id: 'existing-proj-1',
      title: 'Campus SQL Gradebook CLI',
      description: 'Python CLI storing student attendance and calculating GPA with SQLite.',
      technologies: ['Python', 'SQL'],
      link: '',
    },
  ],
  learningInterests: ['Full Stack Web Apps', 'APIs & Databases', 'Interactive UI'],
  preferredLanguage: 'English',
  preferredLearningStyle: 'hands-on',
  targetCareerId: 'full-stack-developer',
  weeklyStudyHours: 12,
  preferredStudyTime: 'Evening',
  onboardingCompleted: true,
  publicPortfolioEnabled: true,
  leaderboardOptIn: true,
  lastActiveAt: daysAgo(0),
  streakDays: 5,
  streakFreezeAvailable: 1,
  restDayActive: false,
  isDemoData: true,
};

export const DEMO_EVIDENCE: SkillEvidence[] = [
  {
    id: 'demo-ev-py-1',
    skill: 'Python',
    sourceType: 'assessment',
    sourceId: 'demo-attempt-1',
    score: 85,
    weight: 1.2,
    timestamp: daysAgo(5),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-ev-py-2',
    skill: 'Python',
    sourceType: 'project',
    sourceId: 'demo-proj-1',
    score: 85,
    weight: 1.3,
    timestamp: daysAgo(4),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-ev-sql-1',
    skill: 'SQL',
    sourceType: 'assessment',
    sourceId: 'demo-attempt-1',
    score: 75,
    weight: 1.2,
    timestamp: daysAgo(5),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-ev-sql-2',
    skill: 'SQL',
    sourceType: 'project',
    sourceId: 'demo-proj-1',
    score: 75,
    weight: 1.2,
    timestamp: daysAgo(4),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-ev-html-1',
    skill: 'HTML',
    sourceType: 'quiz',
    sourceId: 'demo-attempt-2',
    score: 60,
    weight: 1.0,
    timestamp: daysAgo(3),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-ev-js-1',
    skill: 'JavaScript',
    sourceType: 'quiz',
    sourceId: 'demo-attempt-2',
    score: 20,
    weight: 1.0,
    timestamp: daysAgo(2),
    isIllustrativeDemo: true,
  },
];

export const DEMO_ASSESSMENTS: AssessmentAttempt[] = [
  {
    id: 'demo-attempt-1',
    title: 'Backend Foundations Baseline (Python & SQL)',
    mode: 'baseline',
    topics: ['Python', 'SQL'],
    difficulty: 'intermediate',
    scorePercentage: 80,
    correctCount: 4,
    totalQuestions: 5,
    weakTopics: [],
    responses: [
      {
        questionId: 'py-1',
        topic: 'Python',
        selectedOptionIndex: 1,
        isCorrect: true,
        explanation: 'List comprehension filters scores >= 80 cleanly.',
      },
      {
        questionId: 'sql-1',
        topic: 'SQL',
        selectedOptionIndex: 1,
        isCorrect: true,
        explanation: 'HAVING filters groups after GROUP BY.',
      },
    ],
    durationSeconds: 210,
    timestamp: daysAgo(5),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-attempt-2',
    title: 'Frontend Diagnostic (HTML & JavaScript)',
    mode: 'topic',
    topics: ['HTML', 'JavaScript'],
    difficulty: 'beginner',
    scorePercentage: 40,
    correctCount: 2,
    totalQuestions: 5,
    weakTopics: ['JavaScript'],
    responses: [
      {
        questionId: 'js-2',
        topic: 'JavaScript',
        selectedOptionIndex: 0,
        isCorrect: false,
        explanation: 'Microtasks (Promises) run before macrotasks (setTimeout).',
      },
    ],
    durationSeconds: 260,
    timestamp: daysAgo(2),
    isIllustrativeDemo: true,
  },
];

export const DEMO_XP_TRANSACTIONS: XPTransaction[] = [
  {
    id: 'demo-xp-1',
    activityId: 'demo:lesson:html-semantics',
    type: 'lesson',
    amount: 20,
    description: 'Completed HTML Semantic Foundations warm-up',
    timestamp: daysAgo(5),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-xp-2',
    activityId: 'demo:quiz:baseline-1',
    type: 'quiz',
    amount: 50,
    description: 'Completed Backend Foundations Baseline (80%)',
    timestamp: daysAgo(5),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-xp-3',
    activityId: 'demo:project:sql-gradebook',
    type: 'mini_project',
    amount: 100,
    description: 'Submitted Mini Project: Campus SQL Gradebook CLI',
    timestamp: daysAgo(4),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-xp-4',
    activityId: 'demo:mastery:python',
    type: 'skill_mastery',
    amount: 200,
    description: 'Reached Advanced (85%) verified proficiency in Python',
    timestamp: daysAgo(4),
    isIllustrativeDemo: true,
  },
  {
    id: 'demo-xp-5',
    activityId: 'demo:quiz:frontend-diag',
    type: 'quiz',
    amount: 50,
    description: 'Completed Frontend Diagnostic (40%)',
    timestamp: daysAgo(2),
    isIllustrativeDemo: true,
  },
];

export const DEMO_BADGES: UnlockedBadge[] = [
  {
    badgeId: 'first-lesson',
    unlockedAt: daysAgo(5),
    evidenceNote: 'Completed HTML Semantic Foundations warm-up (Illustrative demo).',
  },
  {
    badgeId: 'quiz-champion',
    unlockedAt: daysAgo(5),
    evidenceNote: 'Scored 80% on Backend Foundations Baseline (Illustrative demo).',
  },
  {
    badgeId: 'project-builder',
    unlockedAt: daysAgo(4),
    evidenceNote: 'Submitted Campus SQL Gradebook CLI mini project (Illustrative demo).',
  },
  {
    badgeId: 'skill-master',
    unlockedAt: daysAgo(4),
    evidenceNote: 'Verified Python proficiency at 85% via assessment and project evidence.',
  },
];

export const DEMO_PROJECTS: UserProjectSubmission[] = [
  {
    id: 'demo-proj-1',
    projectIdeaId: 'proj-data-analytics-campus',
    title: 'Campus SQL Gradebook CLI',
    level: 'beginner',
    requiredSkills: ['Python', 'SQL'],
    description:
      'Built a command-line utility in Python backed by SQLite to store semester course grades, run JOIN queries by department, and export GPA summaries.',
    githubUrl: '',
    liveDemoUrl: '',
    submittedAt: daysAgo(4),
    aiReview: {
      summary:
        'Strong foundational schema and clear Python separation between query logic and CLI formatting.',
      strengths: [
        'Clean parameterized SQL queries preventing injection',
        'Good use of GROUP BY aggregations for semester GPA',
      ],
      improvements: [
        'Add unit tests for edge cases like zero-credit courses',
        'Include a sample CSV import script in the README',
      ],
      estimatedScore: 84,
      source: 'sample',
      notice: 'AI feedback — not an official grade. (Sample output — connect Gemini for live AI generation.)',
    },
    isIllustrativeDemo: true,
  },
];

export const DEMO_ROADMAP_VERSION: RoadmapVersion = {
  version: 1,
  createdAt: daysAgo(2),
  careerId: 'full-stack-developer',
  careerTitle: 'Full Stack Developer',
  reason: 'Generated 8-module Full Stack roadmap prioritized around your JavaScript (20%) and frontend skill gaps.',
  lessons: buildDemoFullStackRoadmap(),
  diffSummary: {
    added: [
      'CSS Fundamentals: Box Model, Flexbox & Grid',
      'JavaScript Fundamentals: Types, Scope & Array Methods',
      'DOM Events, Promises, Async/Await & Fetch',
      'React.js: Components, State, Effects & Custom Hooks',
      'Node.js: Event Loop, Modules & Non-Blocking I/O',
      'Express.js: Routing, Middleware & REST Contracts',
      'MongoDB: Collections, Queries, Updates & Schema Design',
      'Full Stack Final Project: End-to-End Web App',
    ],
    removed: [],
    retained: [],
  },
};

export const DEMO_AGENT_LOGS: AgentStepLog[] = [
  {
    id: 'demo-ag-1',
    agentName: 'Profile Agent',
    status: 'completed',
    summary: 'Profile Agent: Learner context created for Alex (CS, 3rd Year, 12h/week)',
    timestamp: daysAgo(2),
    retriesUsed: 0,
    usedFallback: true,
  },
  {
    id: 'demo-ag-2',
    agentName: 'Skill Analysis Agent',
    status: 'completed',
    summary: 'Skill Analysis Agent: Verified Python (85%), SQL (75%), HTML (60%), JS (20%); 6 gaps flagged',
    timestamp: daysAgo(2),
    retriesUsed: 0,
    usedFallback: true,
  },
  {
    id: 'demo-ag-3',
    agentName: 'Career Advisor Agent',
    status: 'completed',
    summary: 'Career Advisor Agent: Full Stack Developer match calculated',
    timestamp: daysAgo(2),
    retriesUsed: 0,
    usedFallback: true,
  },
  {
    id: 'demo-ag-4',
    agentName: 'Learning Planner Agent',
    status: 'completed',
    summary: 'Learning Planner Agent: 8-module Full Stack roadmap generated',
    timestamp: daysAgo(2),
    retriesUsed: 0,
    usedFallback: true,
  },
  {
    id: 'demo-ag-5',
    agentName: 'Assessment Agent',
    status: 'completed',
    summary: 'Assessment Agent: Frontend diagnostic graded (JavaScript identified as top priority)',
    timestamp: daysAgo(2),
    retriesUsed: 0,
    usedFallback: true,
  },
  {
    id: 'demo-ag-6',
    agentName: 'AI Mentor Agent',
    status: 'completed',
    summary: 'AI Mentor Agent: Personalized guidance updated for Pathy',
    timestamp: daysAgo(2),
    retriesUsed: 0,
    usedFallback: true,
  },
];

export const DEMO_FLASHCARDS: Flashcard[] = [
  {
    id: 'demo-fc-1',
    topic: 'JavaScript',
    front: 'In JavaScript, what runs first after synchronous code: Promise .then() callbacks or setTimeout(..., 0)?',
    back: 'Promise .then() callbacks run first because microtasks drain completely before the next macrotask (setTimeout).',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewAt: daysAgo(0),
    createdAt: daysAgo(2),
  },
  {
    id: 'demo-fc-2',
    topic: 'CSS',
    front: 'What does box-sizing: border-box change about an element’s width?',
    back: 'It includes padding and border inside the declared width instead of adding them on top.',
    intervalDays: 3,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewAt: daysAgo(0),
    createdAt: daysAgo(3),
  },
];

export const DEMO_ADAPTATIONS: AdaptationEvent[] = [
  {
    id: 'demo-adapt-1',
    trigger: 'Low quiz score (<50%)',
    whatChanged: 'Prioritized CSS & JavaScript Fundamentals ahead of React and Node.js in Roadmap v1.',
    whyChanged: 'Frontend Diagnostic scored 40% with JavaScript at 20% verified proficiency.',
    timestamp: daysAgo(2),
    newRoadmapVersion: 1,
    undone: false,
  },
];

export const DEMO_MISSIONS: DailyMission[] = [
  {
    id: 'mission-lesson',
    title: 'Complete 1 Roadmap Lesson',
    description: 'Open CSS Fundamentals or your next unlocked lesson and mark it complete.',
    xpReward: 25,
    targetCount: 1,
    currentCount: 0,
    completed: false,
    actionRoute: '/roadmap',
  },
  {
    id: 'mission-quiz',
    title: 'Take a Topic Quiz',
    description: 'Test your JavaScript or CSS skills in the Quiz Arena.',
    xpReward: 30,
    targetCount: 1,
    currentCount: 0,
    completed: false,
    actionRoute: '/assessments',
  },
  {
    id: 'mission-flashcard',
    title: 'Review 2 Flashcards',
    description: 'Refresh spaced-repetition cards from past quiz mistakes.',
    xpReward: 20,
    targetCount: 2,
    currentCount: 0,
    completed: false,
    actionRoute: '/achievements',
  },
];

export const DEMO_MENTOR_MESSAGES: MentorMessage[] = [
  {
    id: 'demo-msg-1',
    role: 'assistant',
    content:
      "Hi Alex! I'm **Pathy**, your study companion. Based on your verified evidence, your **Python (85%)** and **SQL (75%)** foundations are already strong.\n\nTo boost your **Full Stack Developer** match, let's focus first on **CSS Fundamentals** and **JavaScript (currently 20%)**. Ask me to explain a concept, review your quiz mistakes, or plan this week's 12 study hours!",
    mode: 'Explain',
    language: 'English',
    source: 'offline',
    timestamp: daysAgo(1),
  },
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'demo-notif-1',
    title: 'Illustrative demo mode active',
    message: 'Illustrative demo data — not verified real results. Take a quiz or complete lessons to test live adaptations!',
    type: 'info',
    read: false,
    timestamp: daysAgo(0),
  },
];
