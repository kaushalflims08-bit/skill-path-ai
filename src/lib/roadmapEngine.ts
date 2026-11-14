import {
  CareerRole,
  Flashcard,
  LearningStyle,
  LessonItem,
  PreferredLanguage,
  RoadmapVersion,
  SkillGapItem,
} from '../types';

interface ModuleTemplate {
  stageTitle: string;
  moduleTitle: string;
  topic: string;
  title: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  learningObjectives: string[];
  resourceIds: string[];
  practiceTask: string;
  miniProjectPrompt?: string;
}

const TOPIC_LESSON_TEMPLATES: Record<string, ModuleTemplate> = {
  HTML: {
    stageTitle: 'Stage 1 · Web Foundations',
    moduleTitle: 'Module 1 · Semantic Structure',
    topic: 'HTML',
    title: 'HTML Semantic Structure & Accessibility',
    explanation:
      'Build clean document hierarchies using landmarks (<main>, <nav>, <section>), accessible forms, and descriptive alt text so assistive technologies and search engines understand your page.',
    difficulty: 'beginner',
    estimatedMinutes: 45,
    learningObjectives: [
      'Structure pages with semantic HTML5 landmarks',
      'Pair every form input with an explicit <label>',
      'Write meaningful alt attributes for visual assets',
    ],
    resourceIds: ['res-html-mdn'],
    practiceTask: 'Refactor a <div>-heavy landing page into semantic landmarks and verify tab order.',
  },
  CSS: {
    stageTitle: 'Stage 1 · Web Foundations',
    moduleTitle: 'Module 1 · CSS Fundamentals',
    topic: 'CSS',
    title: 'CSS Fundamentals: Box Model, Flexbox & Grid',
    explanation:
      'Master border-box sizing, Flexbox alignment axes, CSS Grid responsive tracks, and mobile-first media queries so layouts remain balanced at 360px, 768px, and 1280px.',
    difficulty: 'beginner',
    estimatedMinutes: 60,
    learningObjectives: [
      'Understand margin, padding, border, and box-sizing: border-box',
      'Align navigation and card rows with Flexbox',
      'Create fluid multi-column grids using CSS Grid auto-fit and fr units',
    ],
    resourceIds: ['res-css-odin', 'res-css-mdn'],
    practiceTask: 'Build a 3-card responsive feature grid that collapses cleanly to 1 column on mobile.',
  },
  JavaScript: {
    stageTitle: 'Stage 2 · Core Programming & Interactivity',
    moduleTitle: 'Module 2 · JavaScript Fundamentals',
    topic: 'JavaScript',
    title: 'JavaScript Fundamentals: Types, Scope & Array Methods',
    explanation:
      'Solidify variables (const/let), closures, lexical scope, pure functions, and immutable array transforms (map, filter, reduce) used across both frontend and Node.js backends.',
    difficulty: 'beginner',
    estimatedMinutes: 75,
    learningObjectives: [
      'Apply map, filter, some, and reduce without mutating source arrays',
      'Explain lexical scope and closures with practical examples',
      'Handle nullish values and destructuring cleanly',
    ],
    resourceIds: ['res-js-fcc'],
    practiceTask: 'Write a pure function that groups student quiz scores by topic and computes averages.',
  },
  'DOM & Async JS': {
    stageTitle: 'Stage 2 · Core Programming & Interactivity',
    moduleTitle: 'Module 3 · DOM & Asynchronous JavaScript',
    topic: 'JavaScript',
    title: 'DOM Events, Promises, Async/Await & Fetch',
    explanation:
      'Understand the JavaScript event loop (call stack, microtask queue, macrotask queue), event delegation, and resilient async/await fetch error handling.',
    difficulty: 'intermediate',
    estimatedMinutes: 75,
    learningObjectives: [
      'Trace execution order across synchronous code, Promises, and setTimeout',
      'Attach delegated event listeners cleanly',
      'Wrap fetch calls in try/catch with HTTP status checks',
    ],
    resourceIds: ['res-js-async'],
    practiceTask: 'Build a debounced search filter that fetches JSON and shows loading + error states.',
  },
  React: {
    stageTitle: 'Stage 3 · Modern Frontend Engineering',
    moduleTitle: 'Module 4 · React.js Architecture',
    topic: 'React',
    title: 'React.js: Components, State, Effects & Custom Hooks',
    explanation:
      'Think in declarative UI: lift state appropriately, avoid infinite useEffect loops, assign stable list keys, and compose reusable accessible components.',
    difficulty: 'intermediate',
    estimatedMinutes: 90,
    learningObjectives: [
      'Follow the Rules of Hooks and manage derived state cleanly',
      'Use useEffect dependencies properly with cleanup functions',
      'Structure modular components with TypeScript props',
    ],
    resourceIds: ['res-react-docs'],
    practiceTask: 'Build a multi-filter interactive task board with persistent localStorage state.',
  },
  'Node.js': {
    stageTitle: 'Stage 4 · Backend & APIs',
    moduleTitle: 'Module 5 · Node.js Runtime',
    topic: 'Node.js',
    title: 'Node.js: Event Loop, Modules & Non-Blocking I/O',
    explanation:
      'Learn how Node.js executes asynchronous file and network operations without blocking concurrent users, manage environment config safely, and structure server modules.',
    difficulty: 'intermediate',
    estimatedMinutes: 70,
    learningObjectives: [
      'Use process.env safely and keep secrets out of client bundles',
      'Prefer async fs/promises over blocking sync calls',
      'Organize ES module exports and path resolution',
    ],
    resourceIds: ['res-node-docs'],
    practiceTask: 'Create a Node script that reads a JSON log asynchronously and summarizes error counts.',
  },
  Express: {
    stageTitle: 'Stage 4 · Backend & APIs',
    moduleTitle: 'Module 6 · Express.js & REST APIs',
    topic: 'Express',
    title: 'Express.js: Routing, Middleware & REST Contracts',
    explanation:
      'Build predictable REST APIs using Express routers, JSON parsing middleware, Zod payload validation, centralized error handlers, and accurate HTTP status codes.',
    difficulty: 'intermediate',
    estimatedMinutes: 75,
    learningObjectives: [
      'Write middleware pipelines calling next() or sending responses reliably',
      'Differentiate req.params, req.query, and req.body',
      'Return proper status codes (200, 201, 400, 401, 403, 404)',
    ],
    resourceIds: ['res-express-odin'],
    practiceTask: 'Implement a validated /api/notes CRUD router with 400 validation errors.',
  },
  MongoDB: {
    stageTitle: 'Stage 5 · Data Persistence',
    moduleTitle: 'Module 7 · MongoDB & Document Modeling',
    topic: 'MongoDB',
    title: 'MongoDB: Collections, Queries, Updates & Schema Design',
    explanation:
      'Model documents thoughtfully by deciding when to embed subdocuments vs reference collections, and perform targeted updates using $set and indexes.',
    difficulty: 'intermediate',
    estimatedMinutes: 65,
    learningObjectives: [
      'Choose between embedding and referencing based on read patterns',
      'Use $set, $push, and indexed filters accurately',
      'Connect an Express service safely to MongoDB',
    ],
    resourceIds: ['res-mongo-fcc'],
    practiceTask: 'Design a document schema for student roadmaps and write 3 query examples.',
  },
  SQL: {
    stageTitle: 'Stage 5 · Data Persistence',
    moduleTitle: 'Module 7 · Relational SQL',
    topic: 'SQL',
    title: 'SQL: Joins, Aggregations & Relational Integrity',
    explanation:
      'Query normalized tables with INNER/LEFT JOINs, aggregate metrics with GROUP BY and HAVING, and design foreign-key constraints.',
    difficulty: 'beginner',
    estimatedMinutes: 65,
    learningObjectives: [
      'Write accurate INNER JOIN and LEFT JOIN queries',
      'Filter aggregated groups using HAVING vs WHERE',
      'Deduplicate results with DISTINCT and optimize with indexes',
    ],
    resourceIds: ['res-sql-khan', 'res-sql-w3'],
    practiceTask: 'Write a SQL query joining students and quiz_attempts to find average scores per topic.',
  },
  Python: {
    stageTitle: 'Stage 2 · Core Programming & Data',
    moduleTitle: 'Module 2 · Python Foundations',
    topic: 'Python',
    title: 'Python: Data Structures, Comprehensions & Clean Functions',
    explanation:
      'Master lists, dicts, sets, list comprehensions, and common pitfalls like mutable default arguments.',
    difficulty: 'beginner',
    estimatedMinutes: 70,
    learningObjectives: [
      'Use sets and dicts for O(1) average lookup patterns',
      'Write readable list and dictionary comprehensions',
      'Avoid mutable default argument bugs',
    ],
    resourceIds: ['res-cs50-python', 'res-hr-sql-py'],
    practiceTask: 'Write a Python script computing top-3 weak topics from an exported CSV quiz log.',
  },
  Git: {
    stageTitle: 'Stage 1 · Developer Workflow',
    moduleTitle: 'Module 1 · Git & Collaboration',
    topic: 'Git',
    title: 'Git: Branching, Fetch vs Pull & Pull Request Hygiene',
    explanation:
      'Work confidently on feature branches, keep secrets/artifacts out with .gitignore, inspect remote updates with git fetch, and resolve merge conflicts calmly.',
    difficulty: 'beginner',
    estimatedMinutes: 45,
    learningObjectives: [
      'Create and merge clean feature branches',
      'Use .gitignore properly before first commit',
      'Explain git fetch vs git pull clearly',
    ],
    resourceIds: ['res-git-odin'],
    practiceTask: 'Practice creating a feature branch, staging selective hunks, and opening a clean PR summary.',
  },
  'REST APIs': {
    stageTitle: 'Stage 4 · Backend & APIs',
    moduleTitle: 'Module 5 · HTTP & REST Design',
    topic: 'REST APIs',
    title: 'REST APIs: Methods, Idempotency & Status Semantics',
    explanation:
      'Design intuitive resource-oriented APIs with clear contracts, idempotent PUT/DELETE operations, and unambiguous 401 vs 403 auth responses.',
    difficulty: 'intermediate',
    estimatedMinutes: 55,
    learningObjectives: [
      'Apply HTTP methods and idempotency rules correctly',
      'Distinguish 401 Unauthorized from 403 Forbidden',
      'Document request and response JSON schemas',
    ],
    resourceIds: ['res-express-odin'],
    practiceTask: 'Write an OpenAPI-style endpoint specification for a student quiz submission service.',
  },
  'Data Structures and Algorithms': {
    stageTitle: 'Stage 3 · Problem Solving',
    moduleTitle: 'Module 4 · Core Algorithms',
    topic: 'Data Structures and Algorithms',
    title: 'DSA: Complexity, Hash Maps, Stacks & Binary Search',
    explanation:
      'Analyze Big-O time/space tradeoffs and solve classic interview patterns using Hash Sets, Stacks, Queues, and Binary Search.',
    difficulty: 'intermediate',
    estimatedMinutes: 85,
    learningObjectives: [
      'Evaluate O(1), O(log N), O(N), and O(N log N) tradeoffs',
      'Replace nested O(N^2) loops with O(N) hash-map lookups',
      'Implement iterative binary search without off-by-one bugs',
    ],
    resourceIds: ['res-dsa-leetcode', 'res-js-fcc'],
    practiceTask: 'Solve Two-Sum and Valid Parentheses and explain their time/space complexity.',
  },
};

function makeFallbackTemplate(skill: string, reason: string): ModuleTemplate {
  return {
    stageTitle: 'Stage 3 · Specialized Career Track',
    moduleTitle: `Module · ${skill}`,
    topic: skill,
    title: `${skill}: Core Principles & Applied Practice`,
    explanation: `Focused study module for ${skill}. ${reason}`,
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    learningObjectives: [
      `Understand core terminology and mental models in ${skill}`,
      `Apply ${skill} in a concrete mini-exercise`,
      `Verify readiness with a topic checkpoint quiz`,
    ],
    resourceIds: ['res-js-fcc'],
    practiceTask: `Complete a guided mini-exercise applying ${skill} to your target career.`,
  };
}

export function buildDemoFullStackRoadmap(existingLessons: LessonItem[] = []): LessonItem[] {
  const completedMap = new Map(existingLessons.map((l) => [l.id, l]));
  const orderedSpecs: { id: string; key: string; linkedGap: string; reason: string; miniProject?: string }[] = [
    {
      id: 'lesson-css-fundamentals',
      key: 'CSS',
      linkedGap: 'CSS',
      reason: 'CSS has not been verified yet and is required before building responsive React UIs.',
    },
    {
      id: 'lesson-js-fundamentals',
      key: 'JavaScript',
      linkedGap: 'JavaScript',
      reason: 'Your verified JavaScript score is 20% against an 80% Full Stack target (highest priority gap).',
    },
    {
      id: 'lesson-dom-async-js',
      key: 'DOM & Async JS',
      linkedGap: 'JavaScript',
      reason: 'Builds directly on JavaScript fundamentals for API calls, promises, and browser interactivity.',
    },
    {
      id: 'lesson-react-js',
      key: 'React',
      linkedGap: 'React',
      reason: 'Primary frontend framework for Full Stack Developer roles (currently Not yet assessed).',
    },
    {
      id: 'lesson-node-js',
      key: 'Node.js',
      linkedGap: 'Node.js',
      reason: 'Server runtime bridging your JavaScript skills into backend services.',
    },
    {
      id: 'lesson-express-js',
      key: 'Express',
      linkedGap: 'Express',
      reason: 'Essential web framework for building REST APIs in the Node ecosystem.',
    },
    {
      id: 'lesson-mongodb',
      key: 'MongoDB',
      linkedGap: 'MongoDB',
      reason: 'Complements your existing SQL (75%) strength with flexible document storage.',
    },
    {
      id: 'lesson-fullstack-final',
      key: 'FULLSTACK_FINAL',
      linkedGap: 'Full Stack Capstone',
      reason: 'Combines React, Node.js, Express, and MongoDB into a verified portfolio capstone.',
      miniProject: 'Build and document a Full Stack Student Study Planner with CRUD APIs and rubric check.',
    },
  ];

  const built: LessonItem[] = orderedSpecs.map((spec, index) => {
    const prevId = index > 0 ? orderedSpecs[index - 1].id : null;
    const prevCompleted = prevId ? completedMap.get(prevId)?.completed ?? false : true;
    const existing = completedMap.get(spec.id);

    if (spec.key === 'FULLSTACK_FINAL') {
      return {
        id: spec.id,
        stageTitle: 'Stage 6 · Capstone Integration',
        moduleTitle: 'Module 8 · Full Stack Final Project',
        topic: 'REST APIs',
        title: 'Full Stack Final Project: End-to-End Web App',
        explanation:
          'Integrate your React frontend, Express REST API, Node.js runtime, and MongoDB/SQL persistence into a clean, accessible, portfolio-ready project.',
        difficulty: 'advanced',
        estimatedMinutes: 180,
        learningObjectives: [
          'Connect a React client to validated Express REST endpoints',
          'Persist data reliably and handle network/validation errors gracefully',
          'Submit repository and live notes for rubric feedback',
        ],
        resourceIds: ['res-react-docs', 'res-express-odin', 'res-mongo-fcc'],
        practiceTask: 'Complete the Student Study Sprint Tracker project and request AI rubric feedback.',
        quizTopic: 'REST APIs',
        miniProjectPrompt: spec.miniProject,
        completed: existing?.completed ?? false,
        completedAt: existing?.completedAt,
        unlocked: index === 0 || prevCompleted || (existing?.completed ?? false),
        prerequisites: prevId ? [prevId] : [],
        linkedSkillGap: spec.linkedGap,
        reasonForInclusion: spec.reason,
        cachedOffline: existing?.cachedOffline ?? true,
      };
    }

    const tpl = TOPIC_LESSON_TEMPLATES[spec.key];
    return {
      id: spec.id,
      stageTitle: tpl.stageTitle,
      moduleTitle: tpl.moduleTitle,
      topic: tpl.topic,
      title: tpl.title,
      explanation: tpl.explanation,
      difficulty: tpl.difficulty,
      estimatedMinutes: tpl.estimatedMinutes,
      learningObjectives: tpl.learningObjectives,
      resourceIds: tpl.resourceIds,
      practiceTask: tpl.practiceTask,
      quizTopic: tpl.topic,
      completed: existing?.completed ?? false,
      completedAt: existing?.completedAt,
      unlocked: index === 0 || prevCompleted || (existing?.completed ?? false),
      prerequisites: prevId ? [prevId] : [],
      linkedSkillGap: spec.linkedGap,
      reasonForInclusion: spec.reason,
      cachedOffline: existing?.cachedOffline ?? index < 3,
    };
  });

  return built;
}

export function generatePersonalizedRoadmap(params: {
  career: CareerRole;
  gaps: SkillGapItem[];
  weeklyStudyHours: number;
  learningStyle: LearningStyle;
  language: PreferredLanguage;
  previousLessons?: LessonItem[];
}): LessonItem[] {
  const prevMap = new Map((params.previousLessons ?? []).map((l) => [l.id, l]));

  // Retain completed lessons even if they belonged to a prior career goal so history is never silently deleted
  const retainedCompleted = (params.previousLessons ?? []).filter((l) => l.completed);

  const orderedGaps = [...params.gaps]
    .filter((g) => g.classification !== 'Strong' || g.gapSize > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // Ensure prerequisite order where HTML -> CSS -> JS -> React -> Node/Express
  const prioritySkills = orderedGaps.map((g) => g.skill);
  const canonicalOrder = [
    'HTML',
    'CSS',
    'Git',
    'JavaScript',
    'Python',
    'SQL',
    'React',
    'Node.js',
    'Express',
    'REST APIs',
    'MongoDB',
    'Data Structures and Algorithms',
  ];

  const sortedSkills = [...prioritySkills].sort((a, b) => {
    const ia = canonicalOrder.indexOf(a);
    const ib = canonicalOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  if (sortedSkills.length === 0) {
    sortedSkills.push(...params.career.requiredSkills.slice(0, 4).map((s) => s.skill));
  }

  const styleNote =
    params.learningStyle === 'video'
      ? 'Prioritizes visual walkthroughs and lecture demos.'
      : params.learningStyle === 'reading'
        ? 'Prioritizes official documentation and concise notes.'
        : 'Prioritizes interactive coding exercises and mini-builds.';

  const generatedLessons: LessonItem[] = [];

  sortedSkills.forEach((skill) => {
    const gap = params.gaps.find((g) => g.skill === skill);
    const tpl =
      TOPIC_LESSON_TEMPLATES[skill] ??
      makeFallbackTemplate(skill, gap?.beginnerReason ?? `Target proficiency: ${gap?.requiredProficiency ?? 70}%.`);
    const id = `lesson-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const existing = prevMap.get(id);

    generatedLessons.push({
      id,
      stageTitle: tpl.stageTitle,
      moduleTitle: tpl.moduleTitle,
      topic: tpl.topic,
      title: tpl.title,
      explanation: `${tpl.explanation} (${styleNote} Language mode: ${params.language}.)`,
      difficulty: tpl.difficulty,
      estimatedMinutes: tpl.estimatedMinutes,
      learningObjectives: tpl.learningObjectives,
      resourceIds: tpl.resourceIds,
      practiceTask: tpl.practiceTask,
      quizTopic: tpl.topic,
      completed: existing?.completed ?? false,
      completedAt: existing?.completedAt,
      unlocked: false,
      prerequisites: [],
      linkedSkillGap: skill,
      reasonForInclusion:
        gap?.beginnerReason ?? `Recommended for ${params.career.title} readiness.`,
      cachedOffline: existing?.cachedOffline ?? false,
    });

    if (skill === 'JavaScript' && params.career.id === 'full-stack-developer') {
      const domId = 'lesson-dom-async-js';
      const domTpl = TOPIC_LESSON_TEMPLATES['DOM & Async JS'];
      const existingDom = prevMap.get(domId);
      generatedLessons.push({
        id: domId,
        stageTitle: domTpl.stageTitle,
        moduleTitle: domTpl.moduleTitle,
        topic: domTpl.topic,
        title: domTpl.title,
        explanation: domTpl.explanation,
        difficulty: domTpl.difficulty,
        estimatedMinutes: domTpl.estimatedMinutes,
        learningObjectives: domTpl.learningObjectives,
        resourceIds: domTpl.resourceIds,
        practiceTask: domTpl.practiceTask,
        quizTopic: domTpl.topic,
        completed: existingDom?.completed ?? false,
        completedAt: existingDom?.completedAt,
        unlocked: false,
        prerequisites: [id],
        linkedSkillGap: 'JavaScript',
        reasonForInclusion: 'Bridges core JavaScript syntax to browser APIs and async networking.',
        cachedOffline: existingDom?.cachedOffline ?? false,
      });
    }
  });

  // Append final capstone lesson for the career
  const capstoneId = `lesson-${params.career.id}-capstone`;
  const existingCap = prevMap.get(capstoneId);
  generatedLessons.push({
    id: capstoneId,
    stageTitle: 'Stage 6 · Capstone Integration',
    moduleTitle: `Module · ${params.career.title} Capstone`,
    topic: params.career.requiredSkills[0]?.skill ?? 'REST APIs',
    title: `${params.career.title}: Portfolio Final Project`,
    explanation:
      params.career.recommendedProjects[1]?.description ??
      `Synthesize your ${params.career.title} skills into a documented portfolio capstone.`,
    difficulty: 'advanced',
    estimatedMinutes: 180,
    learningObjectives: [
      `Combine core ${params.career.title} tools in a working deliverable`,
      'Document architecture, edge cases, and test verification',
      'Submit for rubric feedback',
    ],
    resourceIds: ['res-git-odin', 'res-react-docs'],
    practiceTask: `Build "${params.career.recommendedProjects[1]?.title ?? 'Career Capstone'}" and submit in Project Builder.`,
    quizTopic: params.career.requiredSkills[0]?.skill ?? 'REST APIs',
    miniProjectPrompt: params.career.recommendedProjects[1]?.description,
    completed: existingCap?.completed ?? false,
    completedAt: existingCap?.completedAt,
    unlocked: false,
    prerequisites: [],
    linkedSkillGap: params.career.title,
    reasonForInclusion: `Demonstrates end-to-end readiness for ${params.career.title}.`,
  });

  // Preserve any completed lessons from previous goal that aren't in new set so completion history is preserved
  const newIds = new Set(generatedLessons.map((l) => l.id));
  const preservedPriorCompleted = retainedCompleted
    .filter((old) => !newIds.has(old.id))
    .map((old) => ({
      ...old,
      stageTitle: 'Archived Prior Track · Completed',
      unlocked: true,
    }));

  const combined = [...preservedPriorCompleted, ...generatedLessons];

  // Recompute prerequisite chain & unlocked flags
  const activeLessons = combined.filter((l) => l.stageTitle !== 'Archived Prior Track · Completed');
  activeLessons.forEach((lesson, idx) => {
    const prev = idx > 0 ? activeLessons[idx - 1] : null;
    lesson.prerequisites = prev ? [prev.id] : [];
    lesson.unlocked = idx === 0 || Boolean(prev?.completed) || lesson.completed;
  });

  return combined;
}

export function createRoadmapVersion(params: {
  previousVersion: RoadmapVersion | null;
  careerId: string;
  careerTitle: string;
  reason: string;
  newLessons: LessonItem[];
}): RoadmapVersion {
  const prevLessons = params.previousVersion?.lessons ?? [];
  const prevTitles = new Set(prevLessons.map((l) => l.title));
  const newTitles = new Set(params.newLessons.map((l) => l.title));

  const added = params.newLessons.filter((l) => !prevTitles.has(l.title)).map((l) => l.title);
  const removed = prevLessons.filter((l) => !newTitles.has(l.title)).map((l) => l.title);
  const retained = params.newLessons.filter((l) => prevTitles.has(l.title)).map((l) => l.title);

  return {
    version: (params.previousVersion?.version ?? 0) + 1,
    createdAt: new Date().toISOString(),
    careerId: params.careerId,
    careerTitle: params.careerTitle,
    reason: params.reason,
    lessons: params.newLessons,
    diffSummary: params.previousVersion
      ? { added, removed, retained }
      : { added: params.newLessons.map((l) => l.title), removed: [], retained: [] },
  };
}

export function insertRemediationLesson(
  lessons: LessonItem[],
  weakTopic: string,
): { updatedLessons: LessonItem[]; insertedLesson: LessonItem } {
  const id = `lesson-remediation-${weakTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
  const insertedLesson: LessonItem = {
    id,
    stageTitle: 'Adaptive Remediation · Boost Focus',
    moduleTitle: `Review · ${weakTopic}`,
    topic: weakTopic,
    title: `${weakTopic} Guided Review & Mistake Clinic`,
    explanation: `Added automatically because your recent quiz score in ${weakTopic} was below 50%. Focuses on core mental models and step-by-step worked examples.`,
    difficulty: 'beginner',
    estimatedMinutes: 35,
    learningObjectives: [
      `Clarify foundational misconceptions in ${weakTopic}`,
      'Work through 3 annotated examples with Pathy',
      'Re-attempt a targeted confidence check',
    ],
    resourceIds: ['res-js-fcc', 'res-html-mdn'],
    practiceTask: `Review your missed ${weakTopic} flashcards and explain each rule in your own words.`,
    quizTopic: weakTopic,
    completed: false,
    unlocked: true,
    prerequisites: [],
    linkedSkillGap: weakTopic,
    reasonForInclusion: `Adaptive Scenario A: Score below 50% triggered beginner remediation in ${weakTopic}.`,
    isRemediation: true,
    cachedOffline: true,
  };

  // Insert right before the first uncompleted lesson so the learner sees it next
  const firstPendingIdx = lessons.findIndex((l) => !l.completed);
  const copy = [...lessons];
  if (firstPendingIdx === -1) {
    copy.push(insertedLesson);
  } else {
    copy.splice(firstPendingIdx, 0, insertedLesson);
  }
  return { updatedLessons: copy, insertedLesson };
}

export function insertAdvancedChallengeLesson(
  lessons: LessonItem[],
  strongTopic: string,
): { updatedLessons: LessonItem[]; insertedLesson: LessonItem } {
  const existingChallenge = lessons.find(
    (l) => l.isAdvancedChallenge && l.topic.toLowerCase() === strongTopic.toLowerCase() && !l.completed,
  );
  if (existingChallenge) {
    return { updatedLessons: lessons, insertedLesson: existingChallenge };
  }

  const id = `lesson-challenge-${strongTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
  const insertedLesson: LessonItem = {
    id,
    stageTitle: 'Adaptive Acceleration · Challenge Track',
    moduleTitle: `Challenge · ${strongTopic}`,
    topic: strongTopic,
    title: `${strongTopic} Advanced Edge-Case Challenge`,
    explanation: `Unlocked because you scored 80%+ in ${strongTopic}. Push beyond basics with production edge cases and performance tradeoffs.`,
    difficulty: 'advanced',
    estimatedMinutes: 50,
    learningObjectives: [
      `Handle subtle edge cases and debugging scenarios in ${strongTopic}`,
      'Compare time, memory, or architectural tradeoffs',
    ],
    resourceIds: ['res-dsa-leetcode', 'res-react-docs'],
    practiceTask: `Complete an intermediate/advanced ${strongTopic} problem or mini-refactor without starter hints.`,
    quizTopic: strongTopic,
    completed: false,
    unlocked: true,
    prerequisites: [],
    linkedSkillGap: strongTopic,
    reasonForInclusion: `Adaptive Scenario B: Score >= 80% unlocked an advanced challenge in ${strongTopic}.`,
    isAdvancedChallenge: true,
  };

  const firstPendingIdx = lessons.findIndex((l) => !l.completed);
  const copy = [...lessons];
  if (firstPendingIdx === -1) {
    copy.push(insertedLesson);
  } else {
    copy.splice(firstPendingIdx + 1, 0, insertedLesson);
  }
  return { updatedLessons: copy, insertedLesson };
}

export function updateFlashcardSM2(card: Flashcard, quality: 1 | 3 | 4 | 5): Flashcard {
  // SM-2 spaced repetition algorithm
  let repetitions = card.repetitions;
  let intervalDays = card.intervalDays;
  let easeFactor = card.easeFactor;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const nextDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    ...card,
    repetitions,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewAt: nextDate,
  };
}
