import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  Play,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { SEED_QUESTIONS, scoreQuestion } from '../data/questions';
import { useAppStore } from '../store/useAppStore';
import { AssessmentAttempt, DifficultyLevel, Question, QuestionResponseRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';

const TOPICS = Array.from(new Set(SEED_QUESTIONS.map((q) => q.topic)));

export const AssessmentsPage: React.FC = () => {
  const assessments = useAppStore((s) => s.assessments);
  const submitAssessment = useAppStore((s) => s.submitAssessment);
  const addMistakesToFlashcards = useAppStore((s) => s.addMistakesToFlashcards);

  const [tab, setTab] = useState<'arena' | 'history' | 'review'>('arena');
  const [mode, setMode] = useState<AssessmentAttempt['mode']>('topic');
  const [selectedTopic, setSelectedTopic] = useState<string>('JavaScript');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'mixed'>('mixed');
  const [timedMode, setTimedMode] = useState(false);

  // Active quiz state
  const [activeQuestions, setActiveQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptionIndex?: number; selectedOptionIndices?: number[]; textAnswer?: string }>
  >({});
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());
  const [reviewedAttempt, setReviewedAttempt] = useState<AssessmentAttempt | null>(null);

  useEffect(() => {
    if (!activeQuestions || !timedMode) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuestions, timedMode]);

  const startQuiz = (overrideMode?: AssessmentAttempt['mode'], topicOverride?: string) => {
    const effectiveMode = overrideMode ?? mode;
    const topicFilter = topicOverride ?? selectedTopic;

    let pool = [...SEED_QUESTIONS];
    if (effectiveMode === 'topic') {
      pool = pool.filter((q) => q.topic === topicFilter);
    }
    if (difficulty !== 'mixed' && effectiveMode !== 'daily' && effectiveMode !== 'weekly') {
      const diffMatches = pool.filter((q) => q.difficulty === difficulty);
      if (diffMatches.length > 0) pool = diffMatches;
    }

    // Shuffle for fresh question order on retake
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, effectiveMode === 'topic' ? 4 : 5);

    setMode(effectiveMode);
    setActiveQuestions(chosen);
    setAnswers({});
    setReviewedAttempt(null);
    setSecondsLeft(chosen.length * 60);
    setStartTimeMs(Date.now());
  };

  const handleSubmitQuiz = () => {
    if (!activeQuestions) return;
    const responses: QuestionResponseRecord[] = activeQuestions.map((q) =>
      scoreQuestion(q, answers[q.id] ?? {}),
    );
    const correctCount = responses.filter((r) => r.isCorrect).length;
    const scorePercentage = Math.round((correctCount / activeQuestions.length) * 100);
    const weakTopics = Array.from(
      new Set(responses.filter((r) => !r.isCorrect).map((r) => r.topic)),
    );
    const topics = Array.from(new Set(activeQuestions.map((q) => q.topic)));
    const durationSeconds = Math.max(10, Math.round((Date.now() - startTimeMs) / 1000));

    const attempt: AssessmentAttempt = {
      id: `attempt_${Date.now()}`,
      title:
        mode === 'daily'
          ? 'Daily Mixed Quiz'
          : mode === 'weekly'
            ? 'Weekly Skill Competition'
            : mode === 'timed'
              ? 'Timed Multi-Topic Assessment'
              : `${selectedTopic} Topic Quiz`,
      mode: timedMode ? 'timed' : mode,
      topics,
      difficulty,
      scorePercentage,
      correctCount,
      totalQuestions: activeQuestions.length,
      weakTopics,
      responses,
      durationSeconds,
      timestamp: new Date().toISOString(),
    };

    submitAssessment(attempt);
    setActiveQuestions(null);
    setReviewedAttempt(attempt);
    setTab('review');
  };

  const toggleMultiSelect = (qId: string, optIdx: number) => {
    const current = answers[qId]?.selectedOptionIndices ?? [];
    const next = current.includes(optIdx)
      ? current.filter((i) => i !== optIdx)
      : [...current, optIdx];
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], selectedOptionIndices: next } }));
  };

  const attemptToShow = useMemo(
    () => reviewedAttempt ?? assessments[0] ?? null,
    [reviewedAttempt, assessments],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Quiz Arena & Skill Assessment Engine
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Deterministic scoring across 12 topics. Score under 50% triggers remediation; 80%+ unlocks advanced challenges.
          </p>
        </div>

        <Tabs
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: 'arena', label: 'Quiz Arena' },
            { id: 'review', label: 'Results & Review' },
            { id: 'history', label: 'Attempt History', count: assessments.length },
          ]}
        />
      </div>

      {/* Active Quiz Runner */}
      {activeQuestions ? (
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {mode === 'topic' ? `${selectedTopic} Assessment` : 'Mixed Skill Assessment'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Answers and explanations remain hidden until submission.
              </p>
            </div>
            {timedMode && (
              <Badge tone={secondsLeft < 60 ? 'red' : 'orange'}>
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">
                  {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                </span>
              </Badge>
            )}
          </div>

          <div className="space-y-5">
            {activeQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Question {idx + 1} of {activeQuestions.length} · {q.topic} · {q.difficulty}
                  </span>
                  <span className="capitalize">{q.type.replace('-', ' ')}</span>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.prompt}</p>

                {q.codeSnippet && (
                  <pre className="rounded-xl bg-slate-900 p-3.5 text-xs text-slate-100 overflow-x-auto">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                {(q.type === 'mcq' || q.type === 'code-output') && q.options && (
                  <div className="grid gap-2">
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer ${
                          answers[q.id]?.selectedOptionIndex === optIdx
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz_${q.id}`}
                          checked={answers[q.id]?.selectedOptionIndex === optIdx}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: { ...prev[q.id], selectedOptionIndex: optIdx },
                            }))
                          }
                          className="accent-blue-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'multi-select' && q.options && (
                  <div className="grid gap-2">
                    {q.options.map((opt, optIdx) => {
                      const checked = (answers[q.id]?.selectedOptionIndices ?? []).includes(optIdx);
                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer ${
                            checked
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMultiSelect(q.id, optIdx)}
                            className="accent-purple-600"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === 'fill-blank' && (
                  <input
                    type="text"
                    value={answers[q.id]?.textAnswer ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { ...prev[q.id], textAnswer: e.target.value },
                      }))
                    }
                    placeholder="Type your concise answer..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                )}

                {q.type === 'short-explanation' && (
                  <textarea
                    rows={3}
                    value={answers[q.id]?.textAnswer ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { ...prev[q.id], textAnswer: e.target.value },
                      }))
                    }
                    placeholder="Write a 1–2 sentence explanation..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setActiveQuestions(null)}>
              Cancel Quiz
            </Button>
            <Button onClick={handleSubmitQuiz}>Submit & Grade Assessment</Button>
          </div>
        </Card>
      ) : (
        <>
          {tab === 'arena' && (
            <div className="space-y-6">
              {/* Quick Launch Modes */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card padding="sm" className="flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold">Daily Quiz</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      5 mixed questions across core dev & CS topics.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => startQuiz('daily')}>
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Daily Quiz</span>
                  </Button>
                </Card>

                <Card padding="sm" className="flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold">Timed Challenge</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Beat the countdown clock with higher assessment weight.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTimedMode(true);
                      startQuiz('timed');
                    }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Start Timed Test</span>
                  </Button>
                </Card>

                <Card padding="sm" className="flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold">Weekly Competition</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Mixed-difficulty sprint contributing to weekly XP.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startQuiz('weekly')}>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Enter Sprint</span>
                  </Button>
                </Card>

                <Card padding="sm" className="flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold">JavaScript Booster</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Focused diagnostic on closures, arrays, and async loop.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTopic('JavaScript');
                      startQuiz('topic', 'JavaScript');
                    }}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Test JavaScript</span>
                  </Button>
                </Card>
              </div>

              {/* Custom Topic & Difficulty Configurator */}
              <Card>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">
                  Topic-Specific Practice Builder
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Topic (12 available)</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as DifficultyLevel | 'mixed')}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={timedMode}
                        onChange={(e) => setTimedMode(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span>Enable countdown timer</span>
                    </label>
                  </div>
                </div>

                <div className="mt-5">
                  <Button onClick={() => startQuiz('topic')}>Start {selectedTopic} Quiz</Button>
                </div>
              </Card>
            </div>
          )}

          {tab === 'review' && (
            <div className="space-y-4">
              {!attemptToShow ? (
                <Card>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Complete a quiz in the Arena to see explanations and mistake flashcards.
                  </p>
                </Card>
              ) : (
                <Card className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        {attemptToShow.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {attemptToShow.correctCount} correct ·{' '}
                        {attemptToShow.totalQuestions - attemptToShow.correctCount} incorrect ·{' '}
                        {attemptToShow.durationSeconds}s
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          attemptToShow.scorePercentage >= 80
                            ? 'green'
                            : attemptToShow.scorePercentage < 50
                              ? 'red'
                              : 'orange'
                        }
                      >
                        <span className="font-mono tabular-nums text-sm">
                          {attemptToShow.scorePercentage}%
                        </span>
                      </Badge>

                      {attemptToShow.responses.some((r) => !r.isCorrect) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addMistakesToFlashcards(attemptToShow)}
                        >
                          Add mistakes to flashcards
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => startQuiz('topic', attemptToShow.topics[0] ?? 'JavaScript')}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retake Fresh Questions</span>
                      </Button>
                    </div>
                  </div>

                  {attemptToShow.weakTopics.length > 0 && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                      Weak topics detected: <strong>{attemptToShow.weakTopics.join(', ')}</strong>. Recommended next step: review the explanations below and open your updated Roadmap.
                    </div>
                  )}

                  <div className="space-y-3">
                    {attemptToShow.responses.map((res, i) => (
                      <div
                        key={`${res.questionId}_${i}`}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>
                            {res.topic} · Question {res.questionId.toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 ${
                              res.isCorrect
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {res.isCorrect ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" /> Needs Review
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {res.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {tab === 'history' && (
            <Card>
              <h3 className="font-display text-base font-bold mb-4">Assessment Attempt History</h3>
              {assessments.length === 0 ? (
                <p className="text-sm text-slate-500">No attempts logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        <th className="py-2 pr-3">Assessment</th>
                        <th className="py-2 pr-3">Topics</th>
                        <th className="py-2 pr-3 text-right">Score</th>
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {assessments.map((att) => (
                        <tr key={att.id}>
                          <td className="py-3 pr-3 font-medium">{att.title}</td>
                          <td className="py-3 pr-3 text-xs text-slate-500">{att.topics.join(', ')}</td>
                          <td className="py-3 pr-3 text-right font-mono tabular-nums font-semibold">
                            {att.scorePercentage}%
                          </td>
                          <td className="py-3 pr-3 text-xs text-slate-500">
                            {new Date(att.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewedAttempt(att);
                                setTab('review');
                              }}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};
