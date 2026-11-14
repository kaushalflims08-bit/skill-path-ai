import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Compass,
  HelpCircle,
  Plus,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CAREERS, buildCustomCareerRole } from '../data/careers';
import { buildProficiencyMap } from '../lib/proficiency';
import { calculateCareerMatch } from '../lib/careerMatching';
import { customCareerSchema } from '../lib/validation';
import { selectActiveCareer, useAppStore } from '../store/useAppStore';
import { CareerRole, RequiredSkillTarget } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ChartWrapper } from '../components/ui/ChartWrapper';

const AVAILABLE_SKILLS = [
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
  'Docker',
  'Linux',
  'Machine Learning',
  'Figma',
];

export const CareerExplorerPage: React.FC = () => {
  const profile = useAppStore((s) => s.profile);
  const evidence = useAppStore((s) => s.evidence);
  const selectTargetCareer = useAppStore((s) => s.selectTargetCareer);

  const [selectedCareerId, setSelectedCareerId] = useState<string>(
    profile?.targetCareerId || 'full-stack-developer',
  );
  const [compareIds, setCompareIds] = useState<string[]>([
    'full-stack-developer',
    'software-development',
  ]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // What-if simulator skill overrides
  const [whatIfSkills, setWhatIfSkills] = useState<Record<string, number>>({});

  // Custom career builder state
  const [customTitle, setCustomTitle] = useState('');
  const [customSkills, setCustomSkills] = useState<RequiredSkillTarget[]>([
    { skill: 'Python', requiredScore: 80, importance: 5, estimatedEffortHours: 20 },
    { skill: 'SQL', requiredScore: 75, importance: 4, estimatedEffortHours: 14 },
  ]);
  const [customError, setCustomError] = useState<string | null>(null);

  const activeGoal = selectActiveCareer(profile);

  const allCareers = useMemo(() => {
    if (profile?.targetCareerId === 'custom-career' && profile.customCareerSkills) {
      return [
        ...CAREERS,
        buildCustomCareerRole(profile.customCareerTitle || 'Custom Career', profile.customCareerSkills),
      ];
    }
    return CAREERS;
  }, [profile]);

  const proficiencies = useMemo(
    () =>
      buildProficiencyMap(
        AVAILABLE_SKILLS,
        evidence,
        profile?.selfReportedSkills ?? [],
      ),
    [evidence, profile?.selfReportedSkills],
  );

  const inspectedCareer: CareerRole =
    allCareers.find((c) => c.id === selectedCareerId) ?? activeGoal;

  const baseMatch = useMemo(
    () =>
      calculateCareerMatch(
        inspectedCareer,
        proficiencies,
        profile?.weeklyStudyHours ?? 10,
      ),
    [inspectedCareer, proficiencies, profile?.weeklyStudyHours],
  );

  const simulatedMatch = useMemo(
    () =>
      calculateCareerMatch(
        inspectedCareer,
        proficiencies,
        profile?.weeklyStudyHours ?? 10,
        whatIfSkills,
      ),
    [inspectedCareer, proficiencies, profile?.weeklyStudyHours, whatIfSkills],
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const comparedCareers = compareIds
    .map((id) => allCareers.find((c) => c.id === id))
    .filter((c): c is CareerRole => Boolean(c));

  const comparisonRadarData = useMemo(() => {
    const skillUnion = new Set<string>();
    comparedCareers.forEach((c) => c.requiredSkills.forEach((s) => skillUnion.add(s.skill)));
    return Array.from(skillUnion)
      .slice(0, 7)
      .map((skill) => {
        const row: Record<string, string | number> = {
          skill,
          You: proficiencies[skill]?.score ?? 0,
        };
        comparedCareers.forEach((c) => {
          const req = c.requiredSkills.find((r) => r.skill === skill);
          row[c.title] = req?.requiredScore ?? 0;
        });
        return row;
      });
  }, [comparedCareers, proficiencies]);

  const comparisonTableRows = comparedCareers.map((c) => {
    const m = calculateCareerMatch(c, proficiencies, profile?.weeklyStudyHours ?? 10);
    return {
      career: c.title,
      match: `${m.compatibilityPercentage}%`,
      difficulty: c.difficulty,
      effort: `${m.estimatedEffortHours}h (${m.estimatedEffortWeeks}w)`,
      missing: m.missingSkills.length,
    };
  });

  const handleSaveCustomCareer = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const parsed = customCareerSchema.safeParse({ title: customTitle, skills: customSkills });
    if (!parsed.success) {
      setCustomError(parsed.error.issues[0]?.message || 'Check custom career inputs.');
      return;
    }
    selectTargetCareer('custom-career', {
      title: parsed.data.title,
      skills: parsed.data.skills,
    });
    setSelectedCareerId('custom-career');
    setShowCustomModal(false);
  };

  const hasWhatIfChanges = Object.keys(whatIfSkills).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Career Explorer & Match Simulator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Compare roles transparently using your verified skill evidence—never unverified self-ratings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowFormulaModal(true)}>
            <HelpCircle className="h-4 w-4" />
            <span>How is this calculated?</span>
          </Button>
          <Button size="sm" onClick={() => setShowCustomModal(true)}>
            <Plus className="h-4 w-4" />
            <span>Custom Career Goal</span>
          </Button>
        </div>
      </div>

      {/* Career Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allCareers.map((career) => {
          const match = calculateCareerMatch(
            career,
            proficiencies,
            profile?.weeklyStudyHours ?? 10,
          );
          const isTarget = activeGoal.id === career.id;
          const isInspected = inspectedCareer.id === career.id;
          const isCompared = compareIds.includes(career.id);

          return (
            <Card
              key={career.id}
              className={`flex flex-col justify-between transition-colors ${
                isInspected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {career.difficulty} · ~{career.estimatedDurationWeeks} weeks
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-bold text-slate-900 dark:text-white">
                      {career.title}
                    </h3>
                  </div>
                  <span className="tabular-nums font-mono text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    {match.compatibilityPercentage}%
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {career.description}
                </p>

                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Tools: {career.tools.slice(0, 4).join(' · ')}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isInspected ? 'primary' : 'outline'}
                    onClick={() => {
                      setSelectedCareerId(career.id);
                      setWhatIfSkills({});
                    }}
                  >
                    Inspect
                  </Button>
                  <button
                    type="button"
                    onClick={() => toggleCompare(career.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                      isCompared
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isCompared ? 'Comparing' : '+ Compare'}
                  </button>
                </div>

                {isTarget ? (
                  <Badge tone="green">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Active Goal</span>
                  </Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => selectTargetCareer(career.id)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Set as goal
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Career Deep Dive + What-If Simulator */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Career Match Breakdown
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {inspectedCareer.title}
              </h3>
            </div>
            {activeGoal.id !== inspectedCareer.id && (
              <Button size="sm" onClick={() => selectTargetCareer(inspectedCareer.id)}>
                Switch Goal to {inspectedCareer.title}
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified Match</p>
              <p className="mt-1 font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {baseMatch.compatibilityPercentage}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Remaining Effort</p>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {baseMatch.estimatedEffortHours}h
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ~{baseMatch.estimatedEffortWeeks} weeks at {profile?.weeklyStudyHours ?? 10}h/wk
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Skill Status</p>
              <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {baseMatch.matchingSkills.length} strong · {baseMatch.partialSkills.length} partial ·{' '}
                {baseMatch.missingSkills.length} missing
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Required Skills & Proficiency Targets
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {inspectedCareer.requiredSkills.map((req) => {
                const detail = [
                  ...baseMatch.matchingSkills,
                  ...baseMatch.partialSkills,
                  ...baseMatch.missingSkills,
                ].find((d) => d.skill === req.skill);
                return (
                  <div key={req.skill} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">{req.skill}</span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        Importance {req.importance}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                        {detail?.verifiedScore !== null && detail?.verifiedScore !== undefined
                          ? `${detail.verifiedScore}%`
                          : 'Not yet assessed'}{' '}
                        / {req.requiredScore}%
                      </span>
                      <Badge
                        tone={
                          detail?.status === 'matching'
                            ? 'green'
                            : detail?.status === 'partial'
                              ? 'orange'
                              : 'red'
                        }
                      >
                        {detail?.status ?? 'missing'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                Roadmap Preview
              </h4>
              <ol className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {inspectedCareer.roadmapPreview.map((item, i) => (
                  <li key={i}>
                    {i + 1}. {item}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                Recommended Projects
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {inspectedCareer.recommendedProjects.map((p) => (
                  <li key={p.title}>
                    <span className="font-semibold capitalize text-slate-800 dark:text-slate-100">
                      {p.level}:
                    </span>{' '}
                    {p.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* What-If Simulator */}
        <Card className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                “What-If” Skill Simulator
              </h3>
            </div>
            {hasWhatIfChanges && (
              <button
                type="button"
                onClick={() => setWhatIfSkills({})}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Simulate reaching target proficiencies to see how your {inspectedCareer.title} compatibility changes.
          </p>

          <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-4">
            <p className="text-xs font-medium text-purple-800 dark:text-purple-200">
              {hasWhatIfChanges
                ? `If you reach the simulated levels below, your ${inspectedCareer.title} match improves from ${baseMatch.compatibilityPercentage}% to ${simulatedMatch.compatibilityPercentage}%.`
                : `Adjust any skill slider below to preview your projected ${inspectedCareer.title} match.`}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-extrabold text-purple-700 dark:text-purple-300 tabular-nums">
                {simulatedMatch.compatibilityPercentage}%
              </span>
              {simulatedMatch.compatibilityPercentage > baseMatch.compatibilityPercentage && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{simulatedMatch.compatibilityPercentage - baseMatch.compatibilityPercentage}% gain
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {inspectedCareer.requiredSkills.map((req) => {
              const current = proficiencies[req.skill]?.score ?? 0;
              const simValue = whatIfSkills[req.skill] ?? current;
              return (
                <div key={req.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {req.skill}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {simValue}% (target {req.requiredScore}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={simValue}
                    onChange={(e) =>
                      setWhatIfSkills((prev) => ({
                        ...prev,
                        [req.skill]: Number(e.target.value),
                      }))
                    }
                    aria-label={`Simulate ${req.skill} proficiency`}
                    className="w-full accent-purple-600"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Career Comparison Radar & Table (Up to 3 Careers) */}
      {comparedCareers.length >= 2 && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <ChartWrapper
              title={`Career Comparison Radar (${comparedCareers.length} selected)`}
              subtitle="Your verified skills compared against target proficiency levels"
              columns={[
                { key: 'skill', label: 'Skill' },
                { key: 'You', label: 'You (%)', numeric: true },
                ...comparedCareers.map((c) => ({
                  key: c.title,
                  label: `${c.title} (%)`,
                  numeric: true,
                })),
              ]}
              rows={comparisonRadarData}
              heightClass="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={comparisonRadarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="You" dataKey="You" stroke="#22C55E" fill="#22C55E" fillOpacity={0.25} />
                  {comparedCareers.map((c, idx) => {
                    const colors = ['#3B82F6', '#8B5CF6', '#F59E0B'];
                    return (
                      <Radar
                        key={c.id}
                        name={c.title}
                        dataKey={c.title}
                        stroke={colors[idx % colors.length]}
                        fill={colors[idx % colors.length]}
                        fillOpacity={0.12}
                      />
                    );
                  })}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          <Card className="lg:col-span-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Side-by-Side Comparison Matrix
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    <th className="py-2 pr-3">Career</th>
                    <th className="py-2 pr-3 text-right">Match</th>
                    <th className="py-2 pr-3">Difficulty</th>
                    <th className="py-2 pr-3 text-right">Est. Effort</th>
                    <th className="py-2 text-right">Missing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonTableRows.map((r) => (
                    <tr key={r.career}>
                      <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white">
                        {r.career}
                      </td>
                      <td className="py-3 pr-3 text-right font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold">
                        {r.match}
                      </td>
                      <td className="py-3 pr-3 capitalize text-slate-600 dark:text-slate-300">
                        {r.difficulty}
                      </td>
                      <td className="py-3 pr-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                        {r.effort}
                      </td>
                      <td className="py-3 text-right font-mono tabular-nums">{r.missing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* How is this calculated modal */}
      <Modal
        open={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="How Career Compatibility is Calculated"
        subtitle="Deterministic weighted formula — zero black-box guesswork"
      >
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
            compatibility = (weighted matched skill score / total required skill weight) × 100
          </div>
          <p>
            For each required skill in <strong>{inspectedCareer.title}</strong>, we take your{' '}
            <strong>verified proficiency</strong> (from quizzes, assessments, and projects — self-reported ratings never count), divide by the required target (capped at 1.0), and multiply by both the skill’s <strong>importance (1–5)</strong> and <strong>evidence confidence</strong> (Low 0.75, Medium 0.90, High 1.00).
          </p>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-1 font-mono tabular-nums">
            <p>Weighted Matched Score: {baseMatch.formulaInputs.weightedMatchedScore}</p>
            <p>Total Required Weight: {baseMatch.formulaInputs.totalRequiredWeight}</p>
            <p>Resulting Match: {baseMatch.compatibilityPercentage}%</p>
          </div>
        </div>
      </Modal>

      {/* Custom Career Goal Modal */}
      <Modal
        open={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Create Custom Career Goal"
        subtitle="Define your own role and target skill thresholds"
      >
        <form onSubmit={handleSaveCustomCareer} className="space-y-4">
          {customError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-700 dark:text-rose-200">
              {customError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1">Career Title</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. FinTech Backend Engineer"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">Toggle Required Skills (select at least 2)</p>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_SKILLS.map((sk) => {
                const exists = customSkills.some((c) => c.skill === sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() =>
                      setCustomSkills((prev) =>
                        exists
                          ? prev.filter((c) => c.skill !== sk)
                          : [
                              ...prev,
                              { skill: sk, requiredScore: 75, importance: 4, estimatedEffortHours: 15 },
                            ],
                      )
                    }
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      exists
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCustomModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Custom Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
