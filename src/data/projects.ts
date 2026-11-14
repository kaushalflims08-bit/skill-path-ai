import { ProjectIdea } from '../types';

export const PROJECT_IDEAS: ProjectIdea[] = [
  {
    id: 'proj-beginner-portfolio',
    title: 'Responsive Personal Developer Portfolio',
    level: 'beginner',
    description:
      'Build an accessible single-page portfolio showcasing your college projects, skills, and contact links using semantic HTML, responsive CSS Grid/Flexbox, and light interactive DOM toggles.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript'],
    objectives: [
      'Use semantic landmarks (<header>, <main>, <section>, <footer>)',
      'Achieve clean responsive stacking at 360px, 768px, and 1280px',
      'Pass keyboard tab navigation with visible focus rings',
    ],
    stepByStepGuidance: [
      'Draft your wireframe sections: Hero, Projects Grid, Skills Matrix, Contact.',
      'Write semantic HTML with proper heading hierarchy (h1 -> h2 -> h3).',
      'Style with CSS Grid for project cards and Flexbox for navigation.',
      'Add a JavaScript filter for project categories and verify mobile layout.',
    ],
    evaluationRubric: [
      { criterion: 'Semantic HTML & Accessibility', maxPoints: 30, description: 'Landmarks, alt text, contrast >= 4.5:1, keyboard focus.' },
      { criterion: 'Responsive CSS Layout', maxPoints: 30, description: 'Zero horizontal overflow across mobile, tablet, desktop.' },
      { criterion: 'Interactive DOM Behavior', maxPoints: 20, description: 'Working category filter or theme toggle without console errors.' },
      { criterion: 'Documentation & Clean Code', maxPoints: 20, description: 'Clear README explaining setup and architecture choices.' },
    ],
  },
  {
    id: 'proj-intermediate-task-api',
    title: 'Student Study Sprint Tracker (Full Stack)',
    level: 'intermediate',
    description:
      'Create a full-stack study planner where students manage courses, log study sessions, and filter pending assignments backed by an Express REST API and MongoDB/SQL database.',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
    objectives: [
      'Design clean CRUD REST endpoints with input validation and proper HTTP status codes',
      'Persist tasks in MongoDB or SQL with user-scoped queries',
      'Connect a React UI with optimistic loading and error states',
    ],
    stepByStepGuidance: [
      'Define your data schema (task title, course, due date, completed boolean).',
      'Build Express routes: GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id.',
      'Validate payloads and return 400 on invalid inputs, 201 on creation.',
      'Build the React dashboard with filter tabs and form validation.',
    ],
    evaluationRubric: [
      { criterion: 'REST API Design & Status Codes', maxPoints: 30, description: 'Consistent routes, validation, 201/400/404 handling.' },
      { criterion: 'Database Modeling & Persistence', maxPoints: 25, description: 'Reliable schema and query operations.' },
      { criterion: 'React State & Error Handling', maxPoints: 25, description: 'Loading spinners, empty states, clean component boundaries.' },
      { criterion: 'Git History & README', maxPoints: 20, description: 'Meaningful commits, .env.example, API docs.' },
    ],
  },
  {
    id: 'proj-advanced-capstone',
    title: 'Full Stack Peer Code Review & Mentorship Portal',
    level: 'advanced',
    description:
      'Build a multi-user platform where students submit project snippets, request peer rubric feedback, track revision diffs, and view analytics on skills practiced.',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git', 'REST APIs'],
    objectives: [
      'Implement role-based route protection and ownership checks',
      'Handle paginated feeds, search queries, and server-side validation',
      'Write unit & integration tests covering core API and scoring logic',
    ],
    stepByStepGuidance: [
      'Architect entities: Users, Submissions, RubricReviews, SkillTags.',
      'Implement Express API with middleware authentication and structured error handling.',
      'Build React frontend with accessible modals, code block rendering, and status transitions.',
      'Add automated tests and deployment configuration.',
    ],
    evaluationRubric: [
      { criterion: 'Architecture & Security Hygiene', maxPoints: 30, description: 'No leaked secrets, input sanitization, ownership checks.' },
      { criterion: 'Full-Stack Reliability & Testing', maxPoints: 30, description: 'Unit tests, edge-case validation, resilient UI states.' },
      { criterion: 'UX Craft & Accessibility', maxPoints: 20, description: 'WCAG AA compliance, responsive views, clear feedback.' },
      { criterion: 'Code Quality & Deployment Readiness', maxPoints: 20, description: 'Modular files, TypeScript types, clear README.' },
    ],
  },
  {
    id: 'proj-data-analytics-campus',
    title: 'Campus Placement & Course Trend Explorer (Python + SQL)',
    level: 'intermediate',
    description:
      'Analyze anonymized course enrollment and study-hour datasets using SQL queries and Python scripts, presenting clean interactive charts and actionable insights.',
    requiredSkills: ['Python', 'SQL', 'Data Visualization', 'Statistics'],
    objectives: [
      'Write multi-table SQL JOIN and aggregation queries',
      'Clean missing values and outliers reproducibly in Python',
      'Communicate findings with labeled charts and caveats',
    ],
    stepByStepGuidance: [
      'Load dataset into SQLite/PostgreSQL and verify row counts.',
      'Compute cohort completion rates and weekly study distributions.',
      'Export summary JSON/CSV and visualize trends cleanly.',
    ],
    evaluationRubric: [
      { criterion: 'SQL Query Accuracy', maxPoints: 30, description: 'Proper JOINs, GROUP BY, HAVING, and window functions.' },
      { criterion: 'Data Cleaning & Reproducibility', maxPoints: 30, description: 'Clear Python script handling nulls and duplicates.' },
      { criterion: 'Visual Clarity & Honesty', maxPoints: 20, description: 'Proper axis units, no misleading scales, explicit limitations.' },
      { criterion: 'Documentation', maxPoints: 20, description: 'Readable notebook/README with reproducible steps.' },
    ],
  },
];
