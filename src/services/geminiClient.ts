import {
  AssessmentAttempt,
  LearnerProfile,
  LessonItem,
  MentorMessage,
  MentorMode,
  PreferredLanguage,
  ProjectIdea,
  SkillProficiency,
} from '../types';

export interface MentorRequestPayload {
  message: string;
  mode: MentorMode;
  language: PreferredLanguage;
  profile: LearnerProfile;
  proficiencies: Record<string, SkillProficiency>;
  recentAssessments: AssessmentAttempt[];
  lessonContext?: LessonItem | null;
  history: MentorMessage[];
}

function buildOfflineMentorReply(payload: MentorRequestPayload): string {
  const { message, mode, language, profile, proficiencies, recentAssessments, lessonContext } = payload;
  const lower = message.toLowerCase();

  const weakSkills = Object.values(proficiencies)
    .filter((p) => p.score !== null && p.score < 50)
    .map((p) => `${p.skill} (${p.score}%)`);

  const latestQuiz = recentAssessments[0];
  const topic = lessonContext?.topic || weakSkills[0]?.split(' ')[0] || 'JavaScript';

  if (language === 'Tamil') {
    return [
      `வணக்கம் **${profile.fullName}**! (${mode} mode)`,
      lessonContext ? `நாம் இப்போது **${lessonContext.title}** பாடத்தைப் பார்க்கிறோம்.` : '',
      `உங்கள் கேள்விக்கு எளிய வழிகாட்டல்:`,
      `- முதலில் **${topic}** அடிப்படைகளை சிறிய உதாரணத்துடன் பயிற்சி செய்யுங்கள்.`,
      weakSkills.length > 0 ? `- கவனம் செலுத்த வேண்டிய திறன்கள்: ${weakSkills.join(', ')}.` : '',
      `\n\`\`\`js\n// சிறிய பயிற்சி உதாரணம்\nconst weeklyHours = ${profile.weeklyStudyHours};\nconsole.log("Daily goal:", Math.round((weeklyHours / 5) * 60), "mins");\n\`\`\``,
      `\n_Offline mentor guidance._`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'Tanglish') {
    return [
      `Hey **${profile.fullName}**! (${mode} mode) Super question da/ma — step-by-step ah paakalam:`,
      lessonContext ? `Current lesson: **${lessonContext.title}** (${lessonContext.estimatedMinutes} mins).` : '',
      `1. First, **${topic}** core concept-a chinna example vechu test pannunga.\n2. Theory mattum padikkama, 20 mins hands-on code ezhuthunga.`,
      weakSkills.length > 0 ? `Focus areas right now: ${weakSkills.join(', ')}.` : '',
      `\n\`\`\`js\n// Quick practice check\nconst studyPlan = ["Concept (15m)", "Code Drill (25m)", "5-Question Quiz (10m)"];\nconsole.log(studyPlan.join(" -> "));\n\`\`\``,
      `\n_Offline mentor guidance._`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (lower.includes('mistake') || lower.includes('quiz')) {
    if (latestQuiz) {
      const missed = latestQuiz.responses.filter((r) => !r.isCorrect);
      if (missed.length > 0) {
        return [
          `Here is a breakdown of your recent **${latestQuiz.title}** (${latestQuiz.scorePercentage}%):`,
          ...missed.slice(0, 3).map(
            (m, i) => `${i + 1}. **${m.topic}**: ${m.explanation}`,
          ),
          `\nTry adding these mistakes to your spaced-repetition flashcards and retake a focused 5-question drill.`,
          `\n_Offline mentor guidance._`,
        ].join('\n\n');
      }
    }
    return `You have no missed questions logged in your latest quiz! Try taking a topic challenge in **Quiz Arena** so we can diagnose any edge-case gaps.\n\n_Offline mentor guidance._`;
  }

  if (lower.includes('five practice') || lower.includes('5 practice') || lower.includes('practice questions')) {
    return [
      `Here are 5 quick self-check prompts on **${topic}**:`,
      `1. Explain in one sentence why \`${topic}\` matters in a production app.\n2. What is the most common bug beginners hit in ${topic}?\n3. Write a 5-line code snippet demonstrating a core ${topic} pattern.\n4. How would you test that snippet for invalid inputs?\n5. What prerequisite skill connects directly into ${topic}?`,
      `Reply with your answer to #1 or #2 and we can review it together!\n\n_Offline mentor guidance._`,
    ].join('\n\n');
  }

  if (mode === 'Socratic') {
    return [
      `Great question about **${lessonContext?.title ?? topic}**! Instead of giving the answer straight away, let's reason through it:`,
      `1. What input goes into the step you're working on, and what output do you expect?\n2. If you isolate just the smallest 3 lines of logic, which line behaves differently from your expectation?`,
      `Tell me your hypothesis and we'll test it together.\n\n_Offline mentor guidance._`,
    ].join('\n\n');
  }

  if (mode === 'Debug my code') {
    return [
      `Let's debug systematically (**${topic}**):`,
      `1. **Reproduce**: Check browser console or terminal logs for the exact line number.\n2. **Inspect types**: Log the variable right before the failing expression.\n3. **Minimal fix**:`,
      `\`\`\`ts\nfunction safeParse<T>(raw: string, fallback: T): T {\n  try {\n    return JSON.parse(raw) as T;\n  } catch {\n    return fallback;\n  }\n}\n\`\`\``,
      `Paste your snippet here and tell me what output you saw vs expected!\n\n_Offline mentor guidance._`,
    ].join('\n\n');
  }

  if (mode === 'Mock interviewer') {
    return [
      `**Mock Interview Prompt (${topic})**:`,
      `> "Walk me through a tricky bug or architectural decision you faced while using ${topic}. What alternatives did you consider, and how did you verify your fix?"`,
      `Aim for a 90-second **STAR** answer (Situation, Task, Action, Result). Type your draft below and I'll give rubric feedback!\n\n_Offline mentor guidance._`,
    ].join('\n\n');
  }

  if (mode === 'Study planner') {
    const perSession = Math.max(30, Math.round((profile.weeklyStudyHours * 60) / 5));
    return [
      `Here is a realistic weekly plan for your **${profile.weeklyStudyHours} hours/week** (${profile.preferredStudyTime} preference):`,
      `- **Mon / Wed / Fri (${perSession} mins each)**: Core ${topic} lesson + practice task\n- **Tue / Thu (${Math.round(perSession * 0.75)} mins each)**: Spaced-repetition flashcards + 10-min topic quiz\n- **Weekend**: Build or polish one feature on your portfolio project`,
      `\n_Offline mentor guidance._`,
    ].join('\n\n');
  }

  if (mode === 'Motivation coach') {
    return [
      `You're on a **${profile.streakDays}-day streak**, ${profile.fullName} — consistency beats marathon cramming every time.`,
      `Even 20 focused minutes today keeps momentum alive. Remember: you can always toggle a **Rest day** in Achievements without losing your long-term progress.\n\n_Offline mentor guidance._`,
    ].join('\n\n');
  }

  return [
    `**${lessonContext ? lessonContext.title : `${topic} Concept Breakdown`}**`,
    lessonContext
      ? lessonContext.explanation
      : `Let's break **${topic}** down cleanly: focus first on the mental model (inputs -> transformation -> output), then build a tiny 15-line working example before moving to complex frameworks.`,
    weakSkills.length > 0
      ? `Right now, your highest-leverage verified gaps are: **${weakSkills.join(', ')}**.`
      : `Keep verifying skills through short quizzes and mini projects so your confidence level moves to High.`,
    `\`\`\`ts\n// Bite-sized habit loop\nconst step = { learn: "20 min", build: "25 min", quiz: "10 min" };\nconsole.log("Next focus:", "${topic}", step);\n\`\`\``,
    `_Offline mentor guidance._`,
  ].join('\n\n');
}

export async function sendMentorMessage(
  payload: MentorRequestPayload,
): Promise<{ reply: string; source: 'gemini' | 'offline'; notice: string | null }> {
  try {
    const res = await fetch('/api/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: payload.message,
        mode: payload.mode,
        language: payload.language,
        learnerContext: {
          name: payload.profile.fullName,
          targetCareer: payload.profile.targetCareerId,
          weeklyStudyHours: payload.profile.weeklyStudyHours,
          streakDays: payload.profile.streakDays,
        },
        lessonContext: payload.lessonContext
          ? {
              title: payload.lessonContext.title,
              topic: payload.lessonContext.topic,
              objectives: payload.lessonContext.learningObjectives,
            }
          : null,
        history: payload.history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.source === 'gemini' && data.reply) {
        return { reply: data.reply, source: 'gemini', notice: null };
      }
    }
  } catch {
    // Network offline or API unreachable -> fallback cleanly
  }

  return {
    reply: buildOfflineMentorReply(payload),
    source: 'offline',
    notice: 'Offline mentor guidance.',
  };
}

export async function requestProjectReview(params: {
  idea: ProjectIdea;
  description: string;
  githubUrl: string;
  liveDemoUrl: string;
}): Promise<{
  summary: string;
  strengths: string[];
  improvements: string[];
  estimatedScore: number;
  source: 'gemini' | 'sample';
  notice: string;
}> {
  try {
    const res = await fetch('/api/project-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectTitle: params.idea.title,
        description: params.description,
        githubUrl: params.githubUrl,
        liveDemoUrl: params.liveDemoUrl,
        rubricCriteria: params.idea.evaluationRubric,
        skills: params.idea.requiredSkills,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.source === 'gemini' && data.review?.summary) {
        return {
          summary: data.review.summary,
          strengths: data.review.strengths ?? [],
          improvements: data.review.improvements ?? [],
          estimatedScore: Number(data.review.estimatedScore) || 78,
          source: 'gemini',
          notice: 'AI feedback — not an official grade.',
        };
      }
    }
  } catch {
    // Fallback below
  }

  const hasRepo = Boolean(params.githubUrl.trim());
  const hasLive = Boolean(params.liveDemoUrl.trim());
  const detailScore = Math.min(20, Math.floor(params.description.trim().length / 12));
  const baseScore = 62 + (hasRepo ? 12 : 0) + (hasLive ? 8 : 0) + detailScore;

  return {
    summary: `Constructive rubric check for "${params.idea.title}": solid coverage of ${params.idea.requiredSkills.slice(0, 3).join(', ')}${hasRepo ? ' with source repository linked' : ''}.`,
    strengths: [
      `Clear scope alignment with ${params.idea.title} learning objectives`,
      hasRepo ? 'GitHub repository URL provided for code inspection' : 'Project summary clearly outlines implemented features',
    ],
    improvements: [
      hasLive ? 'Document key edge cases and test screenshots in your README' : 'Deploy a live preview or include step-by-step local run instructions',
      `Add automated checks covering ${params.idea.requiredSkills[0] ?? 'core'} edge cases`,
    ],
    estimatedScore: Math.min(96, baseScore),
    source: 'sample',
    notice: 'AI feedback — not an official grade. (Sample output — connect Gemini for live AI generation.)',
  };
}
