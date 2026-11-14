import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Compass,
  Flame,
  Layers,
  Map as MapIcon,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { selectActiveCareer, selectTotalXP, useAppStore } from '../store/useAppStore';
import { buildProficiencyMap } from '../lib/proficiency';
import { calculateCareerMatch } from '../lib/careerMatching';
import { getLevelForXP, BADGE_CATALOG } from '../lib/gamification';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { PathyMascot } from '../components/PathyMascot';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const profile = useAppStore((s) => s.profile);
  const evidence = useAppStore((s) => s.evidence);
  const assessments = useAppStore((s) => s.assessments);
  const roadmapVersions = useAppStore((s) => s.roadmapVersions);
  const activeVersion = useAppStore((s) => s.activeRoadmapVersion);
  const missions = useAppStore((s) => s.missions);
  const badges = useAppStore((s) => s.badges);
  const agentLogs = useAppStore((s) => s.agentLogs);
  const totalXp = useAppStore((s) => selectTotalXP(s));

  if (!profile) return null;

  const career = selectActiveCareer(profile);
  const proficiencies = buildProficiencyMap(
    career.requiredSkills.map((r) => r.skill),
    evidence,
    profile.selfReportedSkills,
  );
  const match = calculateCareerMatch(career, proficiencies, profile.weeklyStudyHours);
  const levelInfo = getLevelForXP(totalXp);

  const currentRoadmap =
    roadmapVersions.find((v) => v.version === activeVersion) ??
    roadmapVersions[roadmapVersions.length - 1];
  const lessons = currentRoadmap?.lessons ?? [];
  const completedLessons = lessons.filter((l) => l.completed).length;
  const roadmapPct = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((l) => !l.completed && l.unlocked) ?? lessons[0];

  const verifiedSkills = Object.values(proficiencies).filter((p) => p.score !== null);

  return (
    <div className="space-y-6">
      {/* Demo Data Disclosure Banner */}
      {profile.isDemoData && (
        <div
          role="note"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs sm:text-sm text-amber-900 dark:text-amber-100"
        >
          <span>
            <strong>Illustrative demo data — not verified real results.</strong> Explore Alex’s roadmap, take quizzes, or reset anytime.
          </span>
          <Button size="sm" variant="outline" onClick={() => navigate('/assessments')}>
            Take a Real Quiz
          </Button>
        </div>
      )}

      {/* Personalized Welcome + Continue Learning */}
      <Card>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <PathyMascot mood="happy" size="md" />
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {profile.department || 'College'} · {profile.academicYear}
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back, {profile.fullName}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Target Career: <strong className="text-slate-900 dark:text-white">{career.title}</strong> ·{' '}
                <span className="tabular-nums font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {match.compatibilityPercentage}% verified match
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {nextLesson ? (
              <Button onClick={() => navigate('/roadmap')}>
                <span>Continue: {nextLesson.topic}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate('/assessments')}>
                <span>Start Skill Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/mentor')}>
              Ask Pathy
            </Button>
          </div>
        </div>
      </Card>

      {/* Top 4 KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Current Level</span>
            <Trophy className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
            {levelInfo.current.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums font-mono">
            {totalXp} XP {levelInfo.next ? `· Next at ${levelInfo.next.minXp} XP` : '· Top tier'}
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Learning Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {profile.streakDays} Days
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {profile.restDayActive ? 'Rest day active' : `${profile.weeklyStudyHours}h/week goal`}
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Roadmap Progress</span>
            <MapIcon className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {roadmapPct}%
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {completedLessons} of {lessons.length} lessons · v{activeVersion}
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Verified Skills</span>
            <Compass className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {verifiedSkills.length} / {career.requiredSkills.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {badges.length} / {BADGE_CATALOG.length} badges earned
          </p>
        </Card>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Verified Skill Summary */}
          <Card>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Skill Readiness for {career.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified assessment & project scores vs target proficiency
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/skill-gap')}>
                Gap Analyzer
              </Button>
            </div>
            <div className="space-y-3.5">
              {career.requiredSkills.slice(0, 6).map((req) => {
                const prof = proficiencies[req.skill];
                const isAssessed = prof && prof.score !== null;
                return (
                  <div key={req.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {req.skill}
                      </span>
                      <span className="tabular-nums font-mono text-slate-500 dark:text-slate-400">
                        {isAssessed ? `${prof.score}% / ${req.requiredScore}%` : 'Not yet assessed'}
                      </span>
                    </div>
                    <ProgressBar
                      value={isAssessed ? (prof.score ?? 0) : 0}
                      showValue={false}
                      size="sm"
                      color={
                        !isAssessed
                          ? 'orange'
                          : (prof.score ?? 0) >= req.requiredScore
                            ? 'green'
                            : 'blue'
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Daily Missions */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Daily Missions
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Earn bonus XP cleanly
              </span>
            </div>
            <div className="space-y-3">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        m.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.description} · <span className="font-mono text-amber-600 dark:text-amber-400">+{m.xpReward} XP</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={m.completed ? 'ghost' : 'outline'}
                    onClick={() => navigate(m.actionRoute)}
                  >
                    {m.completed ? 'Completed' : 'Go'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-5">
          {/* Pathy Mentor Suggestions */}
          <Card>
            <div className="flex items-start gap-3">
              <PathyMascot mood="thinking" size="sm" />
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Pathy’s Next Recommendation
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {nextLesson
                    ? `Focus on "${nextLesson.title}" (${nextLesson.estimatedMinutes} mins). ${nextLesson.reasonForInclusion}`
                    : 'Great progress! Try an intermediate portfolio project or topic challenge in Quiz Arena.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/roadmap')}>
                    Open Lesson
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/mentor')}>
                    Chat with Pathy
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Assessments */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Recent Assessments
              </h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/assessments')}>
                Quiz Arena
              </Button>
            </div>
            {assessments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No assessments completed yet. Take a quick topic quiz to verify your skills.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {assessments.slice(0, 4).map((att) => (
                  <li key={att.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {att.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {att.topics.join(', ')} · {att.correctCount}/{att.totalQuestions} correct
                      </p>
                    </div>
                    <Badge tone={att.scorePercentage >= 75 ? 'green' : att.scorePercentage < 50 ? 'red' : 'orange'}>
                      <span className="tabular-nums font-mono">{att.scorePercentage}%</span>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Multi-Agent Activity Feed */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Agent Activity Feed
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Live workflow</span>
            </div>
            {agentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Agent logs appear as you update your career goal, take quizzes, or regenerate roadmaps.
              </p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {agentLogs.slice(0, 6).map((log) => (
                  <li
                    key={log.id}
                    className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <p className="font-medium">{log.summary}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {log.status} · {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
