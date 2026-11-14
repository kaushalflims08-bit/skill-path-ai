import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GitBranch, Info } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { selectActiveCareer, useAppStore } from '../store/useAppStore';
import { buildProficiencyMap } from '../lib/proficiency';
import { analyzeSkillGaps } from '../lib/gapAnalyzer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChartWrapper } from '../components/ui/ChartWrapper';

const PREREQ_CHAIN = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'];

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const evidence = useAppStore((s) => s.evidence);

  const [beginnerMode, setBeginnerMode] = useState(true);
  const [selectedChainSkill, setSelectedChainSkill] = useState<string>('JavaScript');

  const career = selectActiveCareer(profile);

  const proficiencies = useMemo(
    () =>
      buildProficiencyMap(
        career.requiredSkills.map((r) => r.skill),
        evidence,
        profile?.selfReportedSkills ?? [],
      ),
    [career.requiredSkills, evidence, profile?.selfReportedSkills],
  );

  const gaps = useMemo(() => analyzeSkillGaps(career, proficiencies), [career, proficiencies]);

  const radarData = gaps.map((g) => ({
    skill: g.skill,
    Verified: g.currentProficiency ?? 0,
    Required: g.requiredProficiency,
    Gap: g.gapSize,
  }));

  const classificationTone = (cls: string) => {
    if (cls === 'Strong') return 'green';
    if (cls === 'Intermediate') return 'blue';
    if (cls === 'Weak') return 'orange';
    if (cls === 'Needs reassessment') return 'purple';
    return 'red';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Skill Gap Analyzer — {career.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Priority = (Skill Importance × Gap Size) ÷ Estimated Learning Effort. Unassessed skills never display 0% falsely.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBeginnerMode((b) => !b)}
          aria-pressed={beginnerMode}
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors ${
            beginnerMode
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>{beginnerMode ? 'Explain like I’m a beginner: ON' : 'Technical evidence mode'}</span>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartWrapper
          title="Current Verified vs Required Proficiency"
          subtitle="Radar comparison across target career requirements"
          columns={[
            { key: 'skill', label: 'Skill' },
            { key: 'Verified', label: 'Verified (%)', numeric: true },
            { key: 'Required', label: 'Required (%)', numeric: true },
          ]}
          rows={radarData}
          heightClass="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Verified" dataKey="Verified" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Required" dataKey="Required" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.12} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper
          title="Skill Gap Size by Topic"
          subtitle="Points needed to reach target career readiness"
          columns={[
            { key: 'skill', label: 'Skill' },
            { key: 'Gap', label: 'Gap Points', numeric: true },
            { key: 'Required', label: 'Target (%)', numeric: true },
          ]}
          rows={radarData}
          heightClass="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={radarData} layout="vertical" margin={{ left: 20, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="skill" width={95} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Gap" name="Gap Points" fill="#F59E0B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Interactive Prerequisite Skill Graph */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Interactive Prerequisite Skill Graph
          </h3>
        </div>
        <p className="mb-4 text-xs text-slate-600 dark:text-slate-300">
          Click any node to inspect prerequisite dependencies and verified evidence.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {PREREQ_CHAIN.map((node, idx) => {
            const prof = proficiencies[node];
            const isSelected = selectedChainSkill === node;
            const scoreLabel = prof?.score !== null && prof?.score !== undefined ? `${prof.score}%` : 'Unassessed';
            return (
              <React.Fragment key={node}>
                <button
                  type="button"
                  onClick={() => setSelectedChainSkill(node)}
                  className={`rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{node}</p>
                  <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {scoreLabel}
                  </p>
                </button>
                {idx < PREREQ_CHAIN.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {selectedChainSkill && (
          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs space-y-1.5">
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {selectedChainSkill} — {proficiencies[selectedChainSkill]?.label ?? 'Not yet assessed'}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Evidence count:{' '}
              <span className="font-mono">{proficiencies[selectedChainSkill]?.evidenceCount ?? 0}</span> ·
              Confidence:{' '}
              <span className="capitalize">{proficiencies[selectedChainSkill]?.confidence ?? 'low'}</span>
              {proficiencies[selectedChainSkill]?.selfReportedRating !== null &&
                proficiencies[selectedChainSkill]?.selfReportedRating !== undefined && (
                  <>
                    {' '}
                    · Self-reported (unverified):{' '}
                    <span className="font-mono">{proficiencies[selectedChainSkill]?.selfReportedRating}%</span>
                  </>
                )}
            </p>
          </div>
        )}
      </Card>

      {/* Skill Gap Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {gaps.map((gap) => {
          const prof = proficiencies[gap.skill];
          return (
            <Card key={gap.skill} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {gap.skill}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Priority <span className="font-mono font-semibold">{gap.priorityScore}</span> · Effort ~
                    {gap.estimatedEffortHours}h
                  </p>
                </div>
                <Badge tone={classificationTone(gap.classification)}>{gap.classification}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                <span>
                  Current:{' '}
                  <strong>
                    {gap.currentProficiency !== null ? `${gap.currentProficiency}% (${prof?.label})` : 'Not yet assessed'}
                  </strong>
                </span>
                <span>
                  Target: <strong>{gap.requiredProficiency}%</strong>
                </span>
                <span>
                  Gap: <strong>{gap.gapSize} pts</strong>
                </span>
              </div>

              {prof?.selfReportedRating !== null && prof?.selfReportedRating !== undefined && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Self-reported rating: {prof.selfReportedRating}% (unverified — separated from verified evidence)
                </p>
              )}

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {beginnerMode ? gap.beginnerReason : gap.technicalReason}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">{gap.recommendedAction}</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/assessments')}>
                  Verify Skill
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
