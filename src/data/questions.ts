import { Question, QuestionResponseRecord } from '../types';

export const SEED_QUESTIONS: Question[] = [
  // HTML (3)
  {
    id: 'html-1',
    topic: 'HTML',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Which HTML element represents the dominant, unique content of the <body> of a document?',
    options: ['<section>', '<main>', '<article>', '<div role="page">'],
    correctAnswerIndex: 1,
    explanation: '<main> identifies the primary content area of a page and helps screen readers jump directly to it.',
  },
  {
    id: 'html-2',
    topic: 'HTML',
    type: 'fill-blank',
    difficulty: 'beginner',
    prompt: 'Which HTML attribute on an <img> element provides descriptive fallback text for screen readers and failed loads?',
    acceptedAnswers: ['alt', 'alt attribute'],
    explanation: 'The alt attribute supplies accessible text descriptions when images fail to load or are read by assistive tech.',
  },
  {
    id: 'html-3',
    topic: 'HTML',
    type: 'multi-select',
    difficulty: 'intermediate',
    prompt: 'Select ALL semantic landmarks that improve keyboard and screen-reader navigation out of the box:',
    options: ['<nav>', '<header>', '<span>', '<footer>', '<b>'],
    correctAnswerIndices: [0, 1, 3],
    explanation: '<nav>, <header>, and <footer> are landmark elements, whereas <span> and <b> carry no landmark semantics.',
  },

  // CSS (3)
  {
    id: 'css-1',
    topic: 'CSS',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'In CSS Flexbox, which property aligns flex items along the cross axis (perpendicular to flex-direction)?',
    options: ['justify-content', 'align-items', 'flex-wrap', 'place-self'],
    correctAnswerIndex: 1,
    explanation: 'justify-content aligns along the main axis, while align-items aligns items along the cross axis.',
  },
  {
    id: 'css-2',
    topic: 'CSS',
    type: 'code-output',
    difficulty: 'intermediate',
    prompt: 'With box-sizing: border-box, what is the rendered total width of this box?',
    codeSnippet: `.card {\n  box-sizing: border-box;\n  width: 240px;\n  padding: 20px;\n  border: 4px solid #334155;\n}`,
    options: ['240px', '280px', '288px', '200px'],
    correctAnswerIndex: 0,
    explanation: 'With border-box, padding and border are included inside the specified width of 240px.',
  },
  {
    id: 'css-3',
    topic: 'CSS',
    type: 'fill-blank',
    difficulty: 'intermediate',
    prompt: 'Which CSS Grid unit distributes a fraction of the remaining available space inside a grid container?',
    acceptedAnswers: ['fr', '1fr'],
    explanation: 'The fr (fractional) unit allocates a portion of remaining free space in a CSS Grid track.',
  },

  // JavaScript (4)
  {
    id: 'js-1',
    topic: 'JavaScript',
    type: 'code-output',
    difficulty: 'beginner',
    prompt: 'What does this JavaScript snippet log to the console?',
    codeSnippet: `const nums = [1, 2, 3];\nconst doubled = nums.map((n) => n * 2);\nconsole.log(doubled.join('-'));`,
    options: ['1-2-3', '2-4-6', '2,4,6', 'undefined'],
    correctAnswerIndex: 1,
    explanation: 'Array.prototype.map returns [2, 4, 6], and join("-") produces the string "2-4-6".',
  },
  {
    id: 'js-2',
    topic: 'JavaScript',
    type: 'code-output',
    difficulty: 'intermediate',
    prompt: 'What is the output order of the following asynchronous JavaScript code?',
    codeSnippet: `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');`,
    options: ['A, B, C, D', 'A, D, B, C', 'A, D, C, B', 'A, C, D, B'],
    correctAnswerIndex: 2,
    explanation: 'Synchronous logs (A, D) run first, then microtasks (Promise callback C), then macrotasks (setTimeout B).',
  },
  {
    id: 'js-3',
    topic: 'JavaScript',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Which array method checks whether AT LEAST ONE element satisfies a given predicate function?',
    options: ['every()', 'some()', 'filter()', 'reduce()'],
    correctAnswerIndex: 1,
    explanation: 'some() returns true as soon as any element passes the callback test.',
  },
  {
    id: 'js-4',
    topic: 'JavaScript',
    type: 'short-explanation',
    difficulty: 'advanced',
    prompt: 'In 1–2 sentences, explain what a JavaScript closure is and give one practical use case.',
    expectedKeywords: ['function', 'scope', 'outer', 'variable', 'lexical', 'remember', 'state'],
    explanation: 'A closure occurs when an inner function retains access to variables from its outer lexical scope even after the outer function returns (e.g., private counters or event handlers).',
  },

  // React (3)
  {
    id: 'react-1',
    topic: 'React',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Why should each item in a rendered React list have a stable, unique key prop?',
    options: [
      'It automatically styles the element with CSS',
      'It helps React identify which items changed, were added, or were removed during reconciliation',
      'It prevents the browser from caching network requests',
      'It converts functional components into class components',
    ],
    correctAnswerIndex: 1,
    explanation: 'Keys give elements a stable identity across renders so React updates the minimal DOM nodes accurately.',
  },
  {
    id: 'react-2',
    topic: 'React',
    type: 'code-output',
    difficulty: 'intermediate',
    prompt: 'What happens if you pass an empty dependency array [] to useEffect(() => { ... }, [])?',
    options: [
      'The effect runs on every single re-render',
      'The effect never runs at all',
      'The effect runs once after the initial mount (and cleans up on unmount)',
      'React throws a runtime error',
    ],
    correctAnswerIndex: 2,
    explanation: 'An empty dependency array tells React the effect depends on no reactive values, so it runs once after mount.',
  },
  {
    id: 'react-3',
    topic: 'React',
    type: 'multi-select',
    difficulty: 'intermediate',
    prompt: 'Select ALL valid Rules of Hooks in React:',
    options: [
      'Only call hooks at the top level of a component or custom hook',
      'Call hooks inside an if-statement only when state is null',
      'Only call hooks from React function components or custom hooks',
      'Call hooks inside loops to match array length',
    ],
    correctAnswerIndices: [0, 2],
    explanation: 'Hooks must always be called in the same order at the top level of React components or custom hooks—never inside conditions or loops.',
  },

  // Node.js (3)
  {
    id: 'node-1',
    topic: 'Node.js',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Which global object in Node.js provides access to environment variables such as PORT?',
    options: ['window.env', 'process.env', 'global.vars', 'system.config'],
    correctAnswerIndex: 1,
    explanation: 'process.env exposes environment key-value pairs to the running Node.js process.',
  },
  {
    id: 'node-2',
    topic: 'Node.js',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'Why should you avoid synchronous fs.readFileSync inside an Express request handler?',
    options: [
      'It deletes the file after reading',
      'It blocks the single-threaded Node.js event loop for all concurrent requests',
      'It only works on Windows',
      'It automatically restarts the server',
    ],
    correctAnswerIndex: 1,
    explanation: 'Synchronous I/O stalls the event loop, preventing Node.js from handling other incoming connections while waiting on disk.',
  },
  {
    id: 'node-3',
    topic: 'Node.js',
    type: 'fill-blank',
    difficulty: 'beginner',
    prompt: 'Which Node.js built-in module is commonly imported to resolve cross-platform file and directory paths safely?',
    acceptedAnswers: ['path', 'node:path'],
    explanation: 'The path module (e.g., path.join, path.resolve) normalizes path separators across operating systems.',
  },

  // Express (3)
  {
    id: 'express-1',
    topic: 'Express',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'In an Express middleware function (req, res, next), what happens if you neither send a response nor call next()?',
    options: [
      'Express automatically returns 200 OK',
      'The client request hangs until it times out',
      'Express skips to the database layer',
      'The browser clears localStorage',
    ],
    correctAnswerIndex: 1,
    explanation: 'Every middleware must either terminate the request-response cycle (res.json/send) or pass control via next().',
  },
  {
    id: 'express-2',
    topic: 'Express',
    type: 'fill-blank',
    difficulty: 'beginner',
    prompt: 'Which built-in Express middleware parses incoming JSON request bodies onto req.body?',
    acceptedAnswers: ['express.json()', 'express.json'],
    explanation: 'app.use(express.json()) parses application/json payloads into req.body.',
  },
  {
    id: 'express-3',
    topic: 'Express',
    type: 'code-output',
    difficulty: 'intermediate',
    prompt: 'For GET /api/users/42?role=student, what are req.params.id and req.query.role?',
    codeSnippet: `app.get('/api/users/:id', (req, res) => {\n  res.json({ id: req.params.id, role: req.query.role });\n});`,
    options: [
      '{ id: "42", role: "student" }',
      '{ id: 42, role: undefined }',
      '{ id: undefined, role: "42" }',
      '{ id: "users", role: "student" }',
    ],
    correctAnswerIndex: 0,
    explanation: 'Route parameters (:id) arrive as strings in req.params, and URL query strings arrive in req.query.',
  },

  // MongoDB (3)
  {
    id: 'mongo-1',
    topic: 'MongoDB',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'In MongoDB, what is a collection most closely analogous to in a relational SQL database?',
    options: ['A row', 'A table', 'A foreign key', 'An index'],
    correctAnswerIndex: 1,
    explanation: 'A MongoDB collection groups related JSON-like documents, similar to a table holding rows in SQL.',
  },
  {
    id: 'mongo-2',
    topic: 'MongoDB',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'Which MongoDB update operator sets a specific field value without replacing the entire document?',
    options: ['$push', '$set', '$match', '$group'],
    correctAnswerIndex: 1,
    explanation: '$set modifies specified fields while leaving other fields in the document untouched.',
  },
  {
    id: 'mongo-3',
    topic: 'MongoDB',
    type: 'short-explanation',
    difficulty: 'intermediate',
    prompt: 'When should you embed a subdocument in MongoDB instead of referencing another collection?',
    expectedKeywords: ['one-to-few', 'together', 'read', 'atomic', 'owned', 'small', 'related'],
    explanation: 'Embed when data is small, owned by the parent (one-to-few), and frequently read together in a single query.',
  },

  // Python (3)
  {
    id: 'py-1',
    topic: 'Python',
    type: 'code-output',
    difficulty: 'beginner',
    prompt: 'What does this Python list comprehension evaluate to?',
    codeSnippet: `scores = [45, 82, 60, 91]\nhigh = [s for s in scores if s >= 80]\nprint(len(high))`,
    options: ['1', '2', '3', '4'],
    correctAnswerIndex: 1,
    explanation: 'Only 82 and 91 are >= 80, so high has length 2.',
  },
  {
    id: 'py-2',
    topic: 'Python',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'Which Python data structure guarantees unique elements and O(1) average-time membership checks?',
    options: ['list', 'tuple', 'set', 'deque'],
    correctAnswerIndex: 2,
    explanation: 'A Python set is hash-backed, stores unique hashable items, and supports O(1) average "in" lookups.',
  },
  {
    id: 'py-3',
    topic: 'Python',
    type: 'code-output',
    difficulty: 'advanced',
    prompt: 'What is printed when calling append_item twice with default argument []?',
    codeSnippet: `def append_item(val, target=[]):\n    target.append(val)\n    return target\n\nprint(append_item(1))\nprint(append_item(2))`,
    options: ['[1] then [2]', '[1] then [1, 2]', 'Error', '[2] then [2]'],
    correctAnswerIndex: 1,
    explanation: 'Default mutable arguments are evaluated once at function definition time, so target is shared across calls.',
  },

  // SQL (3)
  {
    id: 'sql-1',
    topic: 'SQL',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Which SQL clause filters grouped aggregate rows AFTER GROUP BY has been computed?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'],
    correctAnswerIndex: 1,
    explanation: 'WHERE filters individual rows before grouping; HAVING filters groups after aggregate functions like COUNT or AVG.',
  },
  {
    id: 'sql-2',
    topic: 'SQL',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'What does a LEFT JOIN return that an INNER JOIN might omit?',
    options: [
      'Only rows matching in both tables',
      'All rows from the left table, with NULLs where the right table has no match',
      'Only rows with duplicate primary keys',
      'A Cartesian product of every column',
    ],
    correctAnswerIndex: 1,
    explanation: 'LEFT JOIN preserves every row from the left table even when no matching row exists in the right table.',
  },
  {
    id: 'sql-3',
    topic: 'SQL',
    type: 'fill-blank',
    difficulty: 'beginner',
    prompt: 'Which SQL keyword removes duplicate rows from the SELECT result set?',
    acceptedAnswers: ['distinct', 'DISTINCT'],
    explanation: 'SELECT DISTINCT returns only unique combinations of the selected columns.',
  },

  // Git (3)
  {
    id: 'git-1',
    topic: 'Git',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Which Git command creates a new branch named feature/quiz AND switches to it immediately?',
    options: [
      'git branch feature/quiz',
      'git checkout -b feature/quiz',
      'git commit -m feature/quiz',
      'git merge feature/quiz',
    ],
    correctAnswerIndex: 1,
    explanation: 'git checkout -b <name> (or git switch -c <name>) creates the branch and checks it out.',
  },
  {
    id: 'git-2',
    topic: 'Git',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'What is the difference between git fetch and git pull?',
    options: [
      'git fetch deletes local branches; git pull creates them',
      'git fetch downloads remote updates without modifying your working branch; git pull fetches and merges/rebases',
      'They are identical aliases',
      'git pull only works for tags',
    ],
    correctAnswerIndex: 1,
    explanation: 'git fetch updates remote-tracking refs safely so you can inspect changes before merging.',
  },
  {
    id: 'git-3',
    topic: 'Git',
    type: 'fill-blank',
    difficulty: 'beginner',
    prompt: 'Which file in a repository root tells Git which untracked files or folders (like node_modules) not to commit?',
    acceptedAnswers: ['.gitignore', 'gitignore'],
    explanation: '.gitignore lists patterns of build artifacts, secrets, and dependencies that Git should ignore.',
  },

  // REST APIs (3)
  {
    id: 'rest-1',
    topic: 'REST APIs',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'Which HTTP status code is most appropriate when a POST request successfully creates a new resource?',
    options: ['200 OK', '201 Created', '304 Not Modified', '400 Bad Request'],
    correctAnswerIndex: 1,
    explanation: '201 Created indicates the request succeeded and led to the creation of a new resource.',
  },
  {
    id: 'rest-2',
    topic: 'REST APIs',
    type: 'multi-select',
    difficulty: 'intermediate',
    prompt: 'Select ALL HTTP methods that are defined as idempotent by standard HTTP semantics:',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswerIndices: [0, 2, 3],
    explanation: 'GET, PUT, and DELETE are idempotent (repeating the exact request leaves the resource state the same); POST is not.',
  },
  {
    id: 'rest-3',
    topic: 'REST APIs',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'What is the difference between HTTP 401 Unauthorized and HTTP 403 Forbidden?',
    options: [
      '401 means server crashed; 403 means URL not found',
      '401 means authentication is missing or invalid; 403 means the authenticated user lacks permission',
      '403 is only for GET requests',
      'They mean the exact same thing',
    ],
    correctAnswerIndex: 1,
    explanation: '401 asks the client to authenticate; 403 means the server knows who you are, but access is denied.',
  },

  // Data Structures and Algorithms (3)
  {
    id: 'dsa-1',
    topic: 'Data Structures and Algorithms',
    type: 'mcq',
    difficulty: 'beginner',
    prompt: 'What is the worst-case time complexity of binary search on a sorted array of N elements?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctAnswerIndex: 1,
    explanation: 'Binary search halves the remaining search interval each step, taking O(log N) comparisons.',
  },
  {
    id: 'dsa-2',
    topic: 'Data Structures and Algorithms',
    type: 'mcq',
    difficulty: 'intermediate',
    prompt: 'Which data structure follows LIFO (Last-In, First-Out) order and powers function call stacks?',
    options: ['Queue', 'Stack', 'Min-Heap', 'Hash Table'],
    correctAnswerIndex: 1,
    explanation: 'A stack pushes and pops from the same top end, matching LIFO call frame behavior.',
  },
  {
    id: 'dsa-3',
    topic: 'Data Structures and Algorithms',
    type: 'code-output',
    difficulty: 'advanced',
    prompt: 'What is the time complexity of finding if any two numbers in an unsorted array sum to target using a Hash Set in one pass?',
    options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(1)'],
    correctAnswerIndex: 2,
    explanation: 'Checking if (target - num) is already in a Hash Set does O(1) average work per element across N elements: O(N).',
  },
];

export function scoreQuestion(
  question: Question,
  answer: {
    selectedOptionIndex?: number;
    selectedOptionIndices?: number[];
    textAnswer?: string;
  },
): QuestionResponseRecord {
  let isCorrect = false;

  if (question.type === 'mcq' || question.type === 'code-output') {
    isCorrect = answer.selectedOptionIndex === question.correctAnswerIndex;
  } else if (question.type === 'multi-select') {
    const expected = [...(question.correctAnswerIndices ?? [])].sort((a, b) => a - b);
    const chosen = [...(answer.selectedOptionIndices ?? [])].sort((a, b) => a - b);
    isCorrect =
      expected.length === chosen.length && expected.every((val, i) => val === chosen[i]);
  } else if (question.type === 'fill-blank') {
    const normalized = (answer.textAnswer ?? '').trim().toLowerCase();
    isCorrect = (question.acceptedAnswers ?? []).some((acc) => acc.toLowerCase() === normalized);
  } else if (question.type === 'short-explanation') {
    const normalized = (answer.textAnswer ?? '').trim().toLowerCase();
    const keywords = question.expectedKeywords ?? [];
    const hits = keywords.filter((kw) => normalized.includes(kw.toLowerCase())).length;
    isCorrect = normalized.length >= 15 && hits >= Math.min(2, keywords.length);
  }

  return {
    questionId: question.id,
    topic: question.topic,
    selectedOptionIndex: answer.selectedOptionIndex,
    selectedOptionIndices: answer.selectedOptionIndices,
    textAnswer: answer.textAnswer,
    isCorrect,
    explanation: question.explanation,
  };
}
