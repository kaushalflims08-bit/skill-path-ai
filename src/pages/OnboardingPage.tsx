import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, SkipForward, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CAREERS } from '../data/careers';
import { SEED_QUESTIONS, scoreQuestion } from '../data/questions';
import { onboardingStep1Schema, onboardingStep10Schema } from '../lib/validation';
import {
  AssessmentAttempt,
  LearnerProfile,
  LearningStyle,
  PreferredLanguage,
  QuestionResponseRecord,
} from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { PathyMascot } from '../components/PathyMascot';

const TECH_SKILL_OPTIONS = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'Python',
  'SQL',
  'Git',
  'REST APIs',
  'Data Structures and Algorithms',
  'Linux',
  'Docker',
  'Figma',
];

const SOFT_SKILL_OPTIONS = [
  'Team collaboration',
  'Technical documentation',
  'Problem decomposition',
  'Presentation skills',
  'Time management',
  'Peer code review',
];

const INTEREST_OPTIONS = [
  'Full Stack Web Apps',
  'APIs & Databases',
  'Applied AI / ML',
  'Data Visualization',
  'Cloud & DevOps',
  'UI/UX Prototyping',
  'Mobile Apps',
  'Security & Networking',
];

const BASELINE_QUESTIONS = SEED_QUESTIONS.filter((q) =>
  ['html-1', 'css-1', 'js-1', 'py-1', 'sql-1'].includes(q.id),
);

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const user = useAppStore((s) => s.user);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<LearnerProfile>(() => ({
    fullName: profile?.fullName || user?.name || '',
    email: profile?.email || user?.email || '',
    college: profile?.college || '',
    department: profile?.department || '',
    academicYear: profile?.academicYear || 'Second year',
    educationLevel: profile?.educationLevel || 'B.E. / B.Tech',
    selfReportedSkills: profile?.selfReportedSkills || [],
    softSkills: profile?.softSkills || [],
    certifications: profile?.certifications || [],
    existingProjects: profile?.existingProjects || [],
    learningInterests: profile?.learningInterests || [],
    preferredLanguage: profile?.preferredLanguage || 'English',
    preferredLearningStyle: profile?.preferredLearningStyle || 'hands-on',
    targetCareerId: profile?.targetCareerId || 'full-stack-developer',
    weeklyStudyHours: profile?.weeklyStudyHours || 10,
    preferredStudyTime: profile?.preferredStudyTime || 'Evening',
    onboardingCompleted: false,
    publicPortfolioEnabled: profile?.publicPortfolioEnabled ?? false,
    leaderboardOptIn: profile?.leaderboardOptIn ?? false,
    lastActiveAt: new Date().toISOString(),
    streakDays: profile?.streakDays ?? 1,
    streakFreezeAvailable: profile?.streakFreezeAvailable ?? 1,
    restDayActive: false,
    isDemoData: false,
  }));

  // Step 4 certification input
  const [certInput, setCertInput] = useState('');
  // Step 5 project inputs
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projLink, setProjLink] = useState('');

  // Step 11 baseline assessment answers
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, number>>({});

  // Autosave draft to store whenever step or draft changes
  useEffect(() => {
    updateProfile(draft);
  }, [draft, updateProfile]);

  const totalSteps = 11;
  const optionalSteps = new Set([3, 4, 5, 6]);

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (step === 1) {
      const parsed = onboardingStep1Schema.safeParse({
        fullName: draft.fullName,
        email: draft.email,
        college: draft.college,
        department: draft.department,
        academicYear: draft.academicYear,
        educationLevel: draft.educationLevel,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Please complete your academic details.');
        return false;
      }
    }
    if (step === 10) {
      const parsed = onboardingStep10Schema.safeParse({
        weeklyStudyHours: draft.weeklyStudyHours,
        preferredStudyTime: draft.preferredStudyTime,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Check your study schedule hours.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const handleSkip = () => {
    setError(null);
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const handleFinish = () => {
    const responses: QuestionResponseRecord[] = BASELINE_QUESTIONS.map((q) =>
      scoreQuestion(q, { selectedOptionIndex: baselineAnswers[q.id] }),
    );
    const correctCount = responses.filter((r) => r.isCorrect).length;
    const scorePercentage = Math.round((correctCount / BASELINE_QUESTIONS.length) * 100);
    const weakTopics = Array.from(
      new Set(responses.filter((r) => !r.isCorrect).map((r) => r.topic)),
    );

    const baselineAttempt: AssessmentAttempt = {
      id: `baseline_${Date.now()}`,
      title: 'Onboarding Baseline Diagnostic',
      mode: 'baseline',
      topics: Array.from(new Set(BASELINE_QUESTIONS.map((q) => q.topic))),
      difficulty: 'beginner',
      scorePercentage,
      correctCount,
      totalQuestions: BASELINE_QUESTIONS.length,
      weakTopics,
      responses,
      durationSeconds: 180,
      timestamp: new Date().toISOString(),
    };

    completeOnboarding(draft, baselineAttempt);
    navigate('/dashboard');
  };

  const toggleSelfSkill = (skill: string) => {
    const exists = draft.selfReportedSkills.find((s) => s.skill === skill);
    if (exists) {
      setDraft({
        ...draft,
        selfReportedSkills: draft.selfReportedSkills.filter((s) => s.skill !== skill),
      });
    } else {
      setDraft({
        ...draft,
        selfReportedSkills: [...draft.selfReportedSkills, { skill, rating: 50, verified: false }],
      });
    }
  };

  const updateSelfSkillRating = (skill: string, rating: number) => {
    setDraft({
      ...draft,
      selfReportedSkills: draft.selfReportedSkills.map((s) =>
        s.skill === skill ? { ...s, rating } : s,
      ),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PathyMascot mood="happy" size="sm" />
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Student Onboarding
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {step} of {totalSteps} · Autosaved automatically
              </p>
            </div>
          </div>
          <span className="tabular-nums font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>

        <ProgressBar value={step} max={totalSteps} showValue={false} color="blue" />

        <Card padding="lg">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-200"
            >
              {error}
            </div>
          )}

          {/* Step 1: Academic details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                1. Academic Profile
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={draft.fullName}
                    onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={draft.college}
                    onChange={(e) => setDraft({ ...draft, college: e.target.value })}
                    placeholder="e.g. Anna University / NIT"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={draft.department}
                    onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={draft.academicYear}
                    onChange={(e) => setDraft({ ...draft, academicYear: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option>First year</option>
                    <option>Second year</option>
                    <option>Third year</option>
                    <option>Final year</option>
                    <option>Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Education Level
                  </label>
                  <select
                    value={draft.educationLevel}
                    onChange={(e) => setDraft({ ...draft, educationLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option>B.E. / B.Tech</option>
                    <option>B.Sc. / BCA</option>
                    <option>M.E. / M.Tech / MCA</option>
                    <option>Diploma</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Technical skills & self-rated proficiency */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  2. Technical Skills & Self-Rating
                </h2>
                <Badge tone="orange">Self-reported — unverified</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Select any tools you have tried before and rate your comfort level. These are kept strictly separate from verified assessment scores.
              </p>

              <div className="flex flex-wrap gap-2">
                {TECH_SKILL_OPTIONS.map((skill) => {
                  const selected = draft.selfReportedSkills.some((s) => s.skill === skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSelfSkill(skill)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        selected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {draft.selfReportedSkills.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {draft.selfReportedSkills.map((item) => (
                    <div key={item.skill} className="flex items-center gap-4">
                      <span className="w-36 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.skill}
                      </span>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={item.rating}
                        onChange={(e) => updateSelfSkillRating(item.skill, Number(e.target.value))}
                        aria-label={`Self-reported ${item.skill} proficiency`}
                        className="flex-1 accent-blue-600"
                      />
                      <span className="w-24 text-right text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {item.rating}% (unverified)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Soft skills */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                3. Soft Skills (Optional)
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {SOFT_SKILL_OPTIONS.map((soft) => {
                  const checked = draft.softSkills.includes(soft);
                  return (
                    <button
                      key={soft}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          softSkills: checked
                            ? draft.softSkills.filter((s) => s !== soft)
                            : [...draft.softSkills, soft],
                        })
                      }
                      className={`flex items-center justify-between rounded-xl border p-3 text-sm font-medium cursor-pointer ${
                        checked
                          ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{soft}</span>
                      {checked && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Certifications */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                4. Certifications (Optional)
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  placeholder="e.g. freeCodeCamp Responsive Web Design"
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (!certInput.trim()) return;
                    setDraft({
                      ...draft,
                      certifications: [...draft.certifications, certInput.trim()],
                    });
                    setCertInput('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
              <ul className="space-y-2">
                {draft.certifications.map((c, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          certifications: draft.certifications.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      aria-label="Remove certification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 5: Existing projects */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                5. Past Projects (Optional)
              </h2>
              <div className="grid gap-3">
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="Project title"
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Short description of what you built"
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    placeholder="Technologies (comma separated)"
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                  <input
                    type="url"
                    value={projLink}
                    onChange={(e) => setProjLink(e.target.value)}
                    placeholder="GitHub / Live link (optional)"
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!projTitle.trim()) return;
                    setDraft({
                      ...draft,
                      existingProjects: [
                        ...draft.existingProjects,
                        {
                          id: `p_${Date.now()}`,
                          title: projTitle.trim(),
                          description: projDesc.trim(),
                          technologies: projTech
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                          link: projLink.trim(),
                        },
                      ],
                    });
                    setProjTitle('');
                    setProjDesc('');
                    setProjTech('');
                    setProjLink('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Save project to profile</span>
                </Button>
              </div>
              {draft.existingProjects.length > 0 && (
                <ul className="space-y-2 pt-2">
                  {draft.existingProjects.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.technologies.join(' · ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            existingProjects: draft.existingProjects.filter((x) => x.id !== p.id),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 6: Learning interests */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                6. Learning Interests (Optional)
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = draft.learningInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          learningInterests: active
                            ? draft.learningInterests.filter((i) => i !== interest)
                            : [...draft.learningInterests, interest],
                        })
                      }
                      className={`rounded-xl border p-3 text-left text-sm font-medium cursor-pointer ${
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 7: Preferred language */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                7. Preferred Mentor & Study Language
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['English', 'Tamil', 'Tanglish'] as PreferredLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setDraft({ ...draft, preferredLanguage: lang })}
                    className={`rounded-2xl border p-4 text-left cursor-pointer ${
                      draft.preferredLanguage === lang
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{lang}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'English'
                        ? 'Standard technical English'
                        : lang === 'Tamil'
                          ? 'தமிழ் விளக்கங்கள் + English terms'
                          : 'Friendly conversational Tamil + English'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Learning style */}
          {step === 8 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                8. Preferred Learning Style
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { id: 'hands-on', label: 'Hands-on Building', desc: 'Interactive coding drills & mini-projects first.' },
                    { id: 'video', label: 'Video Walkthroughs', desc: 'Guided visual demos & lectures before coding.' },
                    { id: 'reading', label: 'Docs & Reading', desc: 'Official guides, concise notes & examples.' },
                  ] as { id: LearningStyle; label: string; desc: string }[]
                ).map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, preferredLearningStyle: style.id })}
                    className={`rounded-2xl border p-4 text-left cursor-pointer ${
                      draft.preferredLearningStyle === style.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{style.label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Career goal */}
          {step === 9 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                9. Select Target Career Goal
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {CAREERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, targetCareerId: c.id })}
                    className={`rounded-2xl border p-4 text-left cursor-pointer ${
                      draft.targetCareerId === c.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {c.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 10: Study hours & preferred time */}
          {step === 10 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                10. Weekly Study Availability
              </h2>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Available hours per week
                  </label>
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {draft.weeklyStudyHours} hours/week
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={draft.weeklyStudyHours}
                  onChange={(e) => setDraft({ ...draft, weeklyStudyHours: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Preferred study time
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Morning', 'Afternoon', 'Evening', 'Night'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDraft({ ...draft, preferredStudyTime: t })}
                      className={`rounded-xl border py-2.5 text-sm font-medium cursor-pointer ${
                        draft.preferredStudyTime === t
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 11: Short baseline diagnostic assessment */}
          {step === 11 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  11. Quick Baseline Diagnostic (5 Questions)
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Answers establish your initial verified evidence—correct answers are revealed after finishing.
                </p>
              </div>
              <div className="space-y-5">
                {BASELINE_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5"
                  >
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Question {idx + 1} · {q.topic}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.prompt}</p>
                    {q.codeSnippet && (
                      <pre className="rounded-lg bg-slate-900 p-3 text-xs text-slate-100 overflow-x-auto">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    )}
                    <div className="grid gap-2">
                      {q.options?.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm cursor-pointer ${
                            baselineAnswers[q.id] === optIdx
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            checked={baselineAnswers[q.id] === optIdx}
                            onChange={() =>
                              setBaselineAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className="accent-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1}
              onClick={() => {
                setError(null);
                setStep((s) => Math.max(1, s - 1));
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center gap-2">
              {optionalSteps.has(step) && (
                <Button type="button" variant="ghost" onClick={handleSkip}>
                  <SkipForward className="h-4 w-4" />
                  <span>Skip</span>
                </Button>
              )}

              {step < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleFinish}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Generate My Roadmap</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
