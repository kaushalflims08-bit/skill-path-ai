import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Download,
  History,
  Lock,
  MessageSquareHeart,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { selectActiveCareer, useAppStore } from '../store/useAppStore';
import { CURATED_RESOURCES } from '../data/resources';
import { SEED_QUESTIONS, scoreQuestion } from '../data/questions';
import { LessonItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const roadmapVersions = useAppStore((s) => s.roadmapVersions);
  const activeVersionNumber = useAppStore((s) => s.activeRoadmapVersion);
  const adaptations = useAppStore((s) => s.adaptations);
  const regenerateRoadmap = useAppStore((s) => s.regenerateRoadmap);
  const toggleLessonComplete = useAppStore((s) => s.toggleLessonComplete);
  const toggleLessonOfflineCache = useAppStore((s) => s.toggleLessonOfflineCache);
  const testOutModule = useAppStore((s) => s.testOutModule);
  const undoAdaptation = useAppStore((s) => s.undoAdaptation);

  const [view, setView] = useState<'journey' | 'kanban' | 'calendar' | 'versions'>('journey');
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [testOutTopic, setTestOutTopic] = useState<string | null>(null);
  const [testOutAnswers, setTestOutAnswers] = useState<Record<string, number>>({});

  const career = selectActiveCareer(profile);
  const currentVersion =
    roadmapVersions.find((v) => v.version === activeVersionNumber) ??
    roadmapVersions[roadmapVersions.length - 1];

  const lessons = currentVersion?.lessons ?? [];
  const completedCount = lessons.filter((l) => l.completed).length;
  const totalMinutesRemaining = lessons
    .filter((l) => !l.completed)
    .reduce((sum, l) => sum + l.estimatedMinutes, 0);
  const weeklyHours = Math.max(2, profile?.weeklyStudyHours ?? 10);
  const weeksToFinish = Math.max(1, Math.ceil(totalMinutesRemaining / 60 / weeklyHours));
  const estimatedCompletionDate = new Date(
    Date.now() + weeksToFinish * 7 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const testOutQuestions = useMemo(() => {
    if (!testOutTopic) return [];
    const matching = SEED_QUESTIONS.filter(
      (q) => q.topic.toLowerCase() === testOutTopic.toLowerCase() && (q.type === 'mcq' || q.type === 'code-output'),
    );
    return matching.length > 0 ? matching : SEED_QUESTIONS.filter((q) => q.type === 'mcq').slice(0, 3);
  }, [testOutTopic]);

  const handleRunTestOut = () => {
    if (!testOutTopic || testOutQuestions.length === 0) return;
    const res = testOutQuestions.map((q) =>
      scoreQuestion(q, { selectedOptionIndex: testOutAnswers[q.id] }),
    );
    const pct = Math.round((res.filter((r) => r.isCorrect).length / res.length) * 100);
    testOutModule(testOutTopic, pct);
    setTestOutTopic(null);
    setTestOutAnswers({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Personalized Roadmap — {currentVersion?.careerTitle ?? career.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Version {currentVersion?.version ?? 1} · {completedCount}/{lessons.length} lessons · Est. finish{' '}
            <strong>{estimatedCompletionDate}</strong> ({weeklyHours}h/week)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => regenerateRoadmap('User requested adaptive refresh')}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Regenerate (New Version)</span>
          </Button>
        </div>
      </div>

      <Card padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[200px]">
            <ProgressBar
              value={completedCount}
              max={Math.max(1, lessons.length)}
              label="Course Completion (kept separate from Verified Skill Proficiency)"
              color="blue"
            />
          </div>
          <Tabs
            activeTab={view}
            onChange={setView}
            tabs={[
              { id: 'journey', label: 'Journey Map' },
              { id: 'kanban', label: 'Kanban' },
              { id: 'calendar', label: 'Schedule & Goals' },
              { id: 'versions', label: 'Versions & Diff', count: roadmapVersions.length },
            ]}
          />
        </div>
      </Card>

      {/* Journey Map View */}
      {view === 'journey' && (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const locked = !lesson.unlocked && !lesson.completed;
            return (
              <Card
                key={lesson.id}
                padding="sm"
                className={`transition-colors ${
                  lesson.completed
                    ? 'border-emerald-200 dark:border-emerald-900/60'
                    : lesson.isRemediation
                      ? 'border-amber-300 dark:border-amber-800'
                      : ''
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                        lesson.completed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : locked
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {lesson.completed ? <CheckCircle2 className="h-4 w-4" /> : locked ? <Lock className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lesson.stageTitle} · {lesson.moduleTitle} · {lesson.estimatedMinutes} mins
                      </p>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {lesson.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                        {lesson.reasonForInclusion}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lesson.isRemediation && <Badge tone="orange">Remediation</Badge>}
                        {lesson.isAdvancedChallenge && <Badge tone="purple">Advanced Challenge</Badge>}
                        {lesson.cachedOffline && <Badge tone="blue">Cached offline</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!lesson.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTestOutTopic(lesson.topic);
                          setTestOutAnswers({});
                        }}
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Test out</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={lesson.completed ? 'outline' : 'primary'}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      {lesson.completed ? 'Review Lesson' : 'Open Lesson'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Kanban Board View */}
      {view === 'kanban' && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Up Next (Unlocked)',
              items: lessons.filter((l) => !l.completed && l.unlocked),
            },
            {
              title: 'Locked (Prerequisites)',
              items: lessons.filter((l) => !l.completed && !l.unlocked),
            },
            {
              title: 'Completed',
              items: lessons.filter((l) => l.completed),
            },
          ].map((col) => (
            <Card key={col.title} padding="sm" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {col.title}
                </h3>
                <span className="font-mono text-xs text-slate-500">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No lessons in this column</p>
                ) : (
                  col.items.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedLesson(l)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-left hover:border-blue-400 cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{l.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {l.topic} · {l.estimatedMinutes} mins
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Calendar / Daily / Weekly / Monthly Targets */}
      {view === 'calendar' && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="font-display text-base font-bold">Daily Goal</h3>
            </div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {Math.round((weeklyHours * 60) / 5)} mins / study day
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Preferred time: {profile?.preferredStudyTime} · 5 active days + 2 flexible rest/review days.
            </p>
          </Card>

          <Card>
            <h3 className="font-display text-base font-bold mb-3">Weekly Target</h3>
            <p className="font-mono text-2xl font-bold tabular-nums text-purple-600 dark:text-purple-400">
              {weeklyHours} hrs / week
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Aim for 2 roadmap lessons + 1 topic quiz + 10 mins of flashcards.
            </p>
          </Card>

          <Card>
            <h3 className="font-display text-base font-bold mb-3">Monthly Milestone</h3>
            <p className="font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              Est. {estimatedCompletionDate}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {Math.round(totalMinutesRemaining / 60)} hours remaining across {lessons.length - completedCount} pending modules.
            </p>
          </Card>
        </div>
      )}

      {/* Versions & Adaptation History */}
      {view === 'versions' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              <h3 className="font-display text-base font-bold">Roadmap Versions & “What Changed”</h3>
            </div>
            <div className="space-y-3">
              {[...roadmapVersions].reverse().map((ver) => (
                <div
                  key={ver.version}
                  className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                    ver.version === activeVersionNumber
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Version {ver.version} — {ver.careerTitle}
                    </span>
                    {ver.version === activeVersionNumber && <Badge tone="blue">Active</Badge>}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{ver.reason}</p>
                  {ver.diffSummary && (
                    <p className="text-slate-500 dark:text-slate-400 font-mono">
                      +{ver.diffSummary.added.length} added · -{ver.diffSummary.removed.length} removed ·{' '}
                      {ver.diffSummary.retained.length} retained
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-base font-bold">Adaptation History Timeline</h3>
            {adaptations.length === 0 ? (
              <p className="text-sm text-slate-500">No adaptive changes recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {adaptations.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="purple">{ev.trigger}</Badge>
                      <span className="text-slate-400">{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">{ev.whatChanged}</p>
                    <p className="text-slate-600 dark:text-slate-300">{ev.whyChanged}</p>
                    {!ev.undone && ev.previousRoadmapVersion && (
                      <Button size="sm" variant="ghost" onClick={() => undoAdaptation(ev.id)}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Undo / Override</span>
                      </Button>
                    )}
                    {ev.undone && <span className="text-slate-400 italic">Overridden by learner</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Lesson Detail Modal */}
      <Modal
        open={Boolean(selectedLesson)}
        onClose={() => setSelectedLesson(null)}
        title={selectedLesson?.title ?? ''}
        subtitle={
          selectedLesson
            ? `${selectedLesson.stageTitle} · ${selectedLesson.difficulty} · ${selectedLesson.estimatedMinutes} mins`
            : ''
        }
        maxWidth="xl"
      >
        {selectedLesson && (
          <div className="space-y-5 text-sm">
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
              {selectedLesson.explanation}
            </p>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
              <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Why this lesson is in your roadmap
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Linked gap: <strong>{selectedLesson.linkedSkillGap}</strong> — {selectedLesson.reasonForInclusion}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Learning Objectives</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                {selectedLesson.learningObjectives.map((obj) => (
                  <li key={obj}>{obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Practice Task</h4>
              <p className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-300">
                {selectedLesson.practiceTask}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                Recommended Resources
              </h4>
              <div className="space-y-2">
                {CURATED_RESOURCES.filter((r) => selectedLesson.resourceIds.includes(r.id)).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {r.title} ({r.platform})
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">{r.searchHint}</p>
                    </div>
                    <Badge tone="orange">{r.verifiedStatus}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleLessonOfflineCache(selectedLesson.id);
                    setSelectedLesson({
                      ...selectedLesson,
                      cachedOffline: !selectedLesson.cachedOffline,
                    });
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{selectedLesson.cachedOffline ? 'Cached Offline' : 'Save Offline'}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const title = selectedLesson.title;
                    setSelectedLesson(null);
                    navigate(`/mentor?lesson=${encodeURIComponent(title)}`);
                  }}
                >
                  <MessageSquareHeart className="h-3.5 w-3.5" />
                  <span>Ask Pathy about this lesson</span>
                </Button>
              </div>

              <Button
                onClick={() => {
                  toggleLessonComplete(selectedLesson.id);
                  setSelectedLesson(null);
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedLesson.completed ? 'Mark Incomplete' : 'Complete Lesson (+20 XP)'}</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Test-Out Module Modal */}
      <Modal
        open={Boolean(testOutTopic)}
        onClose={() => setTestOutTopic(null)}
        title={`Test Out of ${testOutTopic ?? ''}`}
        subtitle="Score 80% or higher to skip this module and unlock the next stage"
      >
        <div className="space-y-4">
          {testOutQuestions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Question {i + 1} · {q.topic}
              </p>
              <p className="text-sm font-semibold">{q.prompt}</p>
              {q.options?.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name={`to_${q.id}`}
                    checked={testOutAnswers[q.id] === idx}
                    onChange={() => setTestOutAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTestOutTopic(null)}>
              Cancel
            </Button>
            <Button onClick={handleRunTestOut}>
              <ShieldCheck className="h-4 w-4" />
              <span>Verify Test-Out</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
