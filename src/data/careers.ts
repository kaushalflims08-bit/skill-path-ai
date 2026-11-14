import { CareerRole, RequiredSkillTarget } from '../types';

export const CAREERS: CareerRole[] = [
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    description:
      'Design, build, and maintain complete web applications spanning accessible frontend interfaces, RESTful backend services, and relational or document databases.',
    difficulty: 'intermediate',
    estimatedDurationWeeks: 14,
    requiredSkills: [
      { skill: 'HTML', requiredScore: 75, importance: 4, estimatedEffortHours: 10 },
      { skill: 'CSS', requiredScore: 75, importance: 4, estimatedEffortHours: 14 },
      { skill: 'JavaScript', requiredScore: 80, importance: 5, estimatedEffortHours: 24 },
      { skill: 'React', requiredScore: 75, importance: 5, estimatedEffortHours: 22 },
      { skill: 'Node.js', requiredScore: 70, importance: 4, estimatedEffortHours: 18 },
      { skill: 'Express', requiredScore: 70, importance: 4, estimatedEffortHours: 12 },
      { skill: 'MongoDB', requiredScore: 65, importance: 3, estimatedEffortHours: 12 },
      { skill: 'SQL', requiredScore: 65, importance: 3, estimatedEffortHours: 12 },
      { skill: 'REST APIs', requiredScore: 75, importance: 4, estimatedEffortHours: 12 },
      { skill: 'Git', requiredScore: 70, importance: 4, estimatedEffortHours: 8 },
    ],
    tools: ['VS Code', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Git & GitHub'],
    roadmapPreview: [
      'CSS fundamentals & responsive layouts',
      'JavaScript & asynchronous DOM patterns',
      'React component state & routing',
      'Node.js, Express & REST APIs',
      'MongoDB & SQL data modeling',
      'Full Stack capstone deployment',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Responsive Campus Event Hub',
        description: 'Multi-section event listing page with semantic HTML, Flexbox/Grid, and interactive JS filters.',
      },
      {
        level: 'intermediate',
        title: 'Student Study Planner API & React UI',
        description: 'Task tracker backed by Express REST endpoints and persistent MongoDB or SQL storage.',
      },
      {
        level: 'advanced',
        title: 'Full Stack Peer Code Review Board',
        description: 'Authenticated platform with role checks, real-time comments, pagination, and automated tests.',
      },
    ],
  },
  {
    id: 'software-development',
    title: 'Software Development',
    description:
      'Build reliable, maintainable software systems with strong foundations in algorithms, data structures, clean architecture, testing, and collaborative version control.',
    difficulty: 'intermediate',
    estimatedDurationWeeks: 14,
    requiredSkills: [
      { skill: 'Data Structures and Algorithms', requiredScore: 80, importance: 5, estimatedEffortHours: 32 },
      { skill: 'Python', requiredScore: 75, importance: 4, estimatedEffortHours: 20 },
      { skill: 'JavaScript', requiredScore: 70, importance: 4, estimatedEffortHours: 20 },
      { skill: 'SQL', requiredScore: 70, importance: 3, estimatedEffortHours: 14 },
      { skill: 'Git', requiredScore: 75, importance: 4, estimatedEffortHours: 8 },
      { skill: 'REST APIs', requiredScore: 70, importance: 3, estimatedEffortHours: 12 },
    ],
    tools: ['Python', 'TypeScript', 'Git', 'SQLite/PostgreSQL', 'Vitest/Pytest'],
    roadmapPreview: [
      'Clean programming & modular design',
      'Arrays, hash maps, trees & graph traversal',
      'SQL querying & data integrity',
      'API contracts & unit testing',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'CLI Expense & Budget Analyzer',
        description: 'Command-line tool parsing CSV transactions with summary metrics and unit tests.',
      },
      {
        level: 'intermediate',
        title: 'Library Catalog Search Engine',
        description: 'Indexed search service using tries, inverted indexes, and SQL persistence.',
      },
      {
        level: 'advanced',
        title: 'Distributed Task Queue Simulator',
        description: 'Priority scheduler handling retries, dead-letter queues, and concurrency limits.',
      },
    ],
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    description:
      'Train, evaluate, and serve machine learning and applied AI workflows using Python, statistical modeling, structured evaluation metrics, and clean API endpoints.',
    difficulty: 'advanced',
    estimatedDurationWeeks: 16,
    requiredSkills: [
      { skill: 'Python', requiredScore: 85, importance: 5, estimatedEffortHours: 24 },
      { skill: 'Machine Learning', requiredScore: 80, importance: 5, estimatedEffortHours: 36 },
      { skill: 'Statistics', requiredScore: 75, importance: 4, estimatedEffortHours: 24 },
      { skill: 'Data Structures and Algorithms', requiredScore: 70, importance: 3, estimatedEffortHours: 20 },
      { skill: 'SQL', requiredScore: 65, importance: 3, estimatedEffortHours: 12 },
      { skill: 'REST APIs', requiredScore: 70, importance: 3, estimatedEffortHours: 12 },
      { skill: 'Git', requiredScore: 70, importance: 3, estimatedEffortHours: 8 },
    ],
    tools: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'PyTorch', 'FastAPI', 'Jupyter'],
    roadmapPreview: [
      'Python numerical computing',
      'Probability, linear algebra & evaluation metrics',
      'Supervised & unsupervised ML pipelines',
      'Model serving via REST APIs',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Student Grade Predictor & Feature Explorer',
        description: 'Regression pipeline with train/test split, cross-validation, and error analysis.',
      },
      {
        level: 'intermediate',
        title: 'Course Review Sentiment Classifier',
        description: 'NLP text classification with TF-IDF baseline vs transformer embeddings.',
      },
      {
        level: 'advanced',
        title: 'Campus Q&A Retrieval Assistant',
        description: 'Semantic retrieval pipeline with grounded citations and evaluation benchmark.',
      },
    ],
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description:
      'Turn messy real-world datasets into reproducible experiments, predictive models, and compelling statistical insights for decision makers.',
    difficulty: 'intermediate',
    estimatedDurationWeeks: 14,
    requiredSkills: [
      { skill: 'Python', requiredScore: 80, importance: 5, estimatedEffortHours: 22 },
      { skill: 'Statistics', requiredScore: 80, importance: 5, estimatedEffortHours: 26 },
      { skill: 'SQL', requiredScore: 80, importance: 4, estimatedEffortHours: 16 },
      { skill: 'Data Visualization', requiredScore: 75, importance: 4, estimatedEffortHours: 14 },
      { skill: 'Machine Learning', requiredScore: 70, importance: 4, estimatedEffortHours: 28 },
      { skill: 'Git', requiredScore: 65, importance: 2, estimatedEffortHours: 8 },
    ],
    tools: ['Python', 'Pandas', 'SQL', 'Matplotlib/Seaborn', 'Scikit-learn'],
    roadmapPreview: [
      'SQL joins, window functions & aggregation',
      'Exploratory data analysis in Python',
      'Hypothesis testing & A/B experimentation',
      'Predictive modeling & storytelling',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'University Transit Punctuality Study',
        description: 'Clean and visualize bus arrival datasets to spot peak delay bottlenecks.',
      },
      {
        level: 'intermediate',
        title: 'E-Commerce Funnel A/B Experiment Report',
        description: 'Statistical power analysis, p-values, confidence intervals, and executive summary.',
      },
      {
        level: 'advanced',
        title: 'Customer Retention Churn Forecasting',
        description: 'End-to-end feature engineering, gradient boosting, and SHAP interpretability.',
      },
    ],
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    description:
      'Query operational databases, clean metrics, design KPI dashboards, and surface actionable trends for product and business teams.',
    difficulty: 'beginner',
    estimatedDurationWeeks: 10,
    requiredSkills: [
      { skill: 'SQL', requiredScore: 85, importance: 5, estimatedEffortHours: 18 },
      { skill: 'Data Visualization', requiredScore: 80, importance: 5, estimatedEffortHours: 16 },
      { skill: 'Statistics', requiredScore: 70, importance: 4, estimatedEffortHours: 16 },
      { skill: 'Python', requiredScore: 65, importance: 3, estimatedEffortHours: 18 },
    ],
    tools: ['PostgreSQL', 'Excel/Sheets', 'Tableau / Power BI', 'Python Pandas'],
    roadmapPreview: [
      'SQL querying & data cleaning',
      'Descriptive statistics & KPI design',
      'Interactive dashboard storytelling',
      'Automated reporting scripts',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Campus Cafeteria Sales Dashboard',
        description: 'Analyze daily item volume, peak hours, and seasonal inventory waste.',
      },
      {
        level: 'intermediate',
        title: 'SaaS Cohort Retention Workbook',
        description: 'SQL cohort tables paired with interactive retention heatmaps.',
      },
      {
        level: 'advanced',
        title: 'Automated Weekly Operations Pipeline',
        description: 'Python + SQL report generator flagging metric anomalies.',
      },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description:
      'Protect applications, networks, and cloud infrastructure through threat modeling, defensive hardening, vulnerability analysis, and incident response.',
    difficulty: 'advanced',
    estimatedDurationWeeks: 15,
    requiredSkills: [
      { skill: 'Networking', requiredScore: 80, importance: 5, estimatedEffortHours: 22 },
      { skill: 'Linux', requiredScore: 80, importance: 5, estimatedEffortHours: 20 },
      { skill: 'Security', requiredScore: 85, importance: 5, estimatedEffortHours: 28 },
      { skill: 'Python', requiredScore: 65, importance: 3, estimatedEffortHours: 16 },
      { skill: 'SQL', requiredScore: 65, importance: 3, estimatedEffortHours: 12 },
      { skill: 'REST APIs', requiredScore: 65, importance: 3, estimatedEffortHours: 10 },
    ],
    tools: ['Linux CLI', 'Wireshark', 'Nmap', 'OWASP ZAP', 'Python'],
    roadmapPreview: [
      'TCP/IP networking & DNS internals',
      'Linux permissions & shell scripting',
      'OWASP Top 10 web security & defenses',
      'Log analysis & incident triage',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Linux Server Hardening Checklist & Script',
        description: 'Audit SSH settings, firewall rules, and file permissions on a local VM.',
      },
      {
        level: 'intermediate',
        title: 'OWASP Vulnerable App Remediation Lab',
        description: 'Identify and patch SQLi, XSS, and CSRF flaws in a local test app.',
      },
      {
        level: 'advanced',
        title: 'Auth Log Anomaly Detector',
        description: 'Python parser detecting brute-force bursts and generating triage alerts.',
      },
    ],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud/DevOps',
    description:
      'Automate build pipelines, containerize applications, manage infrastructure as code, and keep production services observable and resilient.',
    difficulty: 'intermediate',
    estimatedDurationWeeks: 13,
    requiredSkills: [
      { skill: 'Linux', requiredScore: 80, importance: 5, estimatedEffortHours: 18 },
      { skill: 'Git', requiredScore: 80, importance: 5, estimatedEffortHours: 10 },
      { skill: 'Docker', requiredScore: 80, importance: 5, estimatedEffortHours: 18 },
      { skill: 'CI/CD', requiredScore: 75, importance: 4, estimatedEffortHours: 16 },
      { skill: 'Cloud Fundamentals', requiredScore: 75, importance: 4, estimatedEffortHours: 20 },
      { skill: 'Networking', requiredScore: 70, importance: 3, estimatedEffortHours: 14 },
      { skill: 'Node.js', requiredScore: 60, importance: 2, estimatedEffortHours: 12 },
    ],
    tools: ['Docker', 'GitHub Actions', 'Linux', 'Terraform', 'Cloud Run / AWS'],
    roadmapPreview: [
      'Linux processes, systemd & networking',
      'Git branching workflows & release tags',
      'Dockerfiles & multi-container compose',
      'CI/CD automated testing & cloud deploy',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Containerized Node + Postgres Stack',
        description: 'Multi-service Docker Compose setup with health checks and env templates.',
      },
      {
        level: 'intermediate',
        title: 'Zero-Downtime CI/CD Pipeline',
        description: 'GitHub Actions workflow running lint, unit tests, and container builds.',
      },
      {
        level: 'advanced',
        title: 'Observability & Alerting Sandbox',
        description: 'Structured logging, latency histograms, and automated rollback triggers.',
      },
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    description:
      'Craft intuitive, accessible digital experiences grounded in user research, clear information architecture, interactive prototypes, and design systems.',
    difficulty: 'beginner',
    estimatedDurationWeeks: 11,
    requiredSkills: [
      { skill: 'Figma', requiredScore: 85, importance: 5, estimatedEffortHours: 20 },
      { skill: 'UI Design', requiredScore: 80, importance: 5, estimatedEffortHours: 22 },
      { skill: 'UX Research', requiredScore: 75, importance: 4, estimatedEffortHours: 18 },
      { skill: 'HTML', requiredScore: 65, importance: 3, estimatedEffortHours: 10 },
      { skill: 'CSS', requiredScore: 70, importance: 3, estimatedEffortHours: 14 },
    ],
    tools: ['Figma', 'FigJam', 'WCAG Contrast Checker', 'HTML/CSS'],
    roadmapPreview: [
      'User interviews & journey mapping',
      'Wireframing & information architecture',
      'Typography, color contrast & design tokens',
      'Interactive prototyping & usability tests',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Accessible Campus Library Redesign',
        description: 'Audit contrast and navigation flows, then redesign key booking screens.',
      },
      {
        level: 'intermediate',
        title: 'Component Design System in Figma',
        description: 'Variables, auto-layout components, and responsive documentation.',
      },
      {
        level: 'advanced',
        title: 'End-to-End Usability Case Study',
        description: 'Moderated user testing with 5 participants, iterations, and HTML/CSS handoff.',
      },
    ],
  },
  {
    id: 'mobile-app-development',
    title: 'Mobile App Development',
    description:
      'Build smooth, offline-resilient mobile applications for iOS and Android with responsive gestures, local storage, and clean API integration.',
    difficulty: 'intermediate',
    estimatedDurationWeeks: 13,
    requiredSkills: [
      { skill: 'JavaScript', requiredScore: 80, importance: 5, estimatedEffortHours: 22 },
      { skill: 'React', requiredScore: 75, importance: 4, estimatedEffortHours: 20 },
      { skill: 'React Native', requiredScore: 80, importance: 5, estimatedEffortHours: 24 },
      { skill: 'REST APIs', requiredScore: 70, importance: 4, estimatedEffortHours: 12 },
      { skill: 'Git', requiredScore: 70, importance: 3, estimatedEffortHours: 8 },
    ],
    tools: ['React Native', 'Expo', 'TypeScript', 'AsyncStorage', 'Git'],
    roadmapPreview: [
      'JavaScript & TypeScript essentials',
      'React hooks & component composition',
      'React Native layouts, navigation & gestures',
      'Offline caching & REST API sync',
    ],
    recommendedProjects: [
      {
        level: 'beginner',
        title: 'Daily Habit & Pomodoro Timer App',
        description: 'Clean mobile UI with local persistence and accessible touch targets.',
      },
      {
        level: 'intermediate',
        title: 'Campus Marketplace Feed App',
        description: 'Tabbed navigation, search filtering, and REST API data fetching.',
      },
      {
        level: 'advanced',
        title: 'Offline-First Flashcard Companion',
        description: 'Spaced repetition mobile app syncing local changes when online.',
      },
    ],
  },
];

export function buildCustomCareerRole(
  title: string,
  requiredSkills: RequiredSkillTarget[],
): CareerRole {
  const totalHours = requiredSkills.reduce((sum, s) => sum + s.estimatedEffortHours, 0);
  return {
    id: 'custom-career',
    title: title || 'Custom Career Goal',
    description: 'Personalized target role defined by your selected skills and target proficiency levels.',
    difficulty: 'intermediate',
    estimatedDurationWeeks: Math.max(4, Math.ceil(totalHours / 10)),
    requiredSkills,
    tools: requiredSkills.map((s) => s.skill),
    roadmapPreview: requiredSkills.map((s) => `${s.skill} (Target ${s.requiredScore}%)`),
    recommendedProjects: [
      {
        level: 'beginner',
        title: `${title || 'Custom'} Foundation Mini-Project`,
        description: `Apply ${requiredSkills.slice(0, 2).map((s) => s.skill).join(' and ')} in a focused starter app.`,
      },
      {
        level: 'intermediate',
        title: `${title || 'Custom'} Integration Project`,
        description: `Combine multiple target skills into a documented portfolio piece.`,
      },
    ],
  };
}
