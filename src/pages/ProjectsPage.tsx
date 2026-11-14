import React, { useState } from 'react';
import { ExternalLink, Eye, FolderGit2, Globe, Sparkles, Upload } from 'lucide-react';
import { PROJECT_IDEAS } from '../data/projects';
import { projectSubmissionSchema } from '../lib/validation';
import { requestProjectReview } from '../services/geminiClient';
import { useAppStore } from '../store/useAppStore';
import { DifficultyLevel, ProjectIdea, UserProjectSubmission } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const ProjectsPage: React.FC = () => {
  const profile = useAppStore((s) => s.profile);
  const projects = useAppStore((s) => s.projects);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const submitProject = useAppStore((s) => s.submitProject);

  const [levelFilter, setLevelFilter] = useState<DifficultyLevel | 'all'>('all');
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false);

  // Submission form state
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!profile) return null;

  const filteredIdeas = PROJECT_IDEAS.filter(
    (p) => levelFilter === 'all' || p.level === levelFilter,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdea) return;
    setFormError(null);

    const parsed = projectSubmissionSchema.safeParse({
      description,
      githubUrl,
      liveDemoUrl,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Check submission fields.');
      return;
    }

    setSubmitting(true);
    try {
      const review = await requestProjectReview({
        idea: selectedIdea,
        description: parsed.data.description,
        githubUrl: parsed.data.githubUrl,
        liveDemoUrl: parsed.data.liveDemoUrl,
      });

      const submission: UserProjectSubmission = {
        id: `sub_${Date.now()}`,
        projectIdeaId: selectedIdea.id,
        title: selectedIdea.title,
        level: selectedIdea.level,
        requiredSkills: selectedIdea.requiredSkills,
        description: parsed.data.description,
        githubUrl: parsed.data.githubUrl,
        liveDemoUrl: parsed.data.liveDemoUrl,
        screenshotName: screenshotName || undefined,
        submittedAt: new Date().toISOString(),
        aiReview: review,
      };

      submitProject(submission);
      setSelectedIdea(null);
      setDescription('');
      setGithubUrl('');
      setLiveDemoUrl('');
      setScreenshotName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Public Portfolio Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Project Builder & Portfolio
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Build real artifacts with step-by-step guidance and rubric evaluation (+100 XP per project).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={profile.publicPortfolioEnabled}
              onChange={(e) => updateProfile({ publicPortfolioEnabled: e.target.checked })}
              className="accent-blue-600"
            />
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span>Public portfolio: {profile.publicPortfolioEnabled ? 'Enabled' : 'Disabled'}</span>
          </label>

          <Button size="sm" variant="outline" onClick={() => setShowPortfolioPreview(true)}>
            <Eye className="h-3.5 w-3.5" />
            <span>Preview Portfolio</span>
          </Button>
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setLevelFilter(lvl)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer ${
              levelFilter === lvl
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Project Ideas Catalog */}
      <div className="grid gap-5 md:grid-cols-2">
        {filteredIdeas.map((idea) => (
          <Card key={idea.id} className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold capitalize text-purple-600 dark:text-purple-400">
                  {idea.level} Project · {idea.requiredSkills.join(' · ')}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {idea.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {idea.description}
              </p>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">Step-by-step guidance:</p>
                {idea.stepByStepGuidance.map((step, i) => (
                  <p key={i} className="text-slate-600 dark:text-slate-300">
                    {i + 1}. {step}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {idea.evaluationRubric.length} rubric criteria
              </span>
              <Button size="sm" onClick={() => setSelectedIdea(idea)}>
                <FolderGit2 className="h-3.5 w-3.5" />
                <span>Submit & Get AI Review</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Submitted Portfolio Projects */}
      <Card className="space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Your Submitted Projects ({projects.length})
        </h3>

        {projects.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No project submissions yet. Pick a beginner or intermediate idea above to start building your verified portfolio!
          </p>
        ) : (
          <div className="space-y-4">
            {projects.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.requiredSkills.join(' · ')} · Submitted{' '}
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {sub.aiReview && (
                    <Badge tone="purple">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-mono">{sub.aiReview.estimatedScore}/100</span>
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300">{sub.description}</p>

                {sub.aiReview && (
                  <div className="rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 p-3.5 text-xs space-y-2">
                    <p className="font-bold text-purple-900 dark:text-purple-200">
                      {sub.aiReview.notice}
                    </p>
                    <p className="text-slate-700 dark:text-slate-200">{sub.aiReview.summary}</p>
                    <div className="grid gap-2 sm:grid-cols-2 pt-1">
                      <div>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-300">Strengths</p>
                        <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300">
                          {sub.aiReview.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-amber-700 dark:text-amber-300">Next Improvements</p>
                        <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300">
                          {sub.aiReview.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit Project Modal */}
      <Modal
        open={Boolean(selectedIdea)}
        onClose={() => setSelectedIdea(null)}
        title={`Submit: ${selectedIdea?.title ?? ''}`}
        subtitle="Evaluated against the project rubric (AI feedback — not an official grade)"
      >
        {selectedIdea && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-700 dark:text-rose-200">
                {formError}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1">
              <p className="font-bold">Evaluation Rubric:</p>
              {selectedIdea.evaluationRubric.map((r) => (
                <p key={r.criterion}>
                  • <strong>{r.criterion}</strong> ({r.maxPoints} pts): {r.description}
                </p>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Project Description & Verification</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what you built, edge cases handled, and how you tested it..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://my-app.example.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Screenshot Attachment (Optional)</label>
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <Upload className="h-4 w-4" />
                <span>{screenshotName || 'Choose screenshot PNG/JPG placeholder'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setScreenshotName(e.target.files?.[0]?.name || '')}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedIdea(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit for Rubric Feedback
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Public Portfolio Preview Modal */}
      <Modal
        open={showPortfolioPreview}
        onClose={() => setShowPortfolioPreview(false)}
        title={`${profile.fullName} — Student Portfolio Preview`}
        subtitle={
          profile.publicPortfolioEnabled
            ? 'Public portfolio visibility is currently ENABLED'
            : 'Public portfolio visibility is DISABLED (private preview only)'
        }
      >
        <div className="space-y-4 text-sm">
          {!profile.publicPortfolioEnabled ? (
            <p className="text-slate-600 dark:text-slate-300">
              Enable the <strong>Public portfolio</strong> toggle on the Projects page to share this view publicly.
            </p>
          ) : projects.length === 0 ? (
            <p className="text-slate-500">Submit at least one project to populate your public portfolio.</p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">{p.title}</h4>
                  <span className="text-xs capitalize text-slate-500">{p.level}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{p.description}</p>
                {(p.githubUrl || p.liveDemoUrl) && (
                  <div className="flex gap-3 text-xs text-blue-600">
                    {p.githubUrl && (
                      <span className="inline-flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Repo linked
                      </span>
                    )}
                    {p.liveDemoUrl && (
                      <span className="inline-flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Demo linked
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
