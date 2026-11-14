import React, { useMemo, useState } from 'react';
import { Copy, Flag, Search } from 'lucide-react';
import { CURATED_RESOURCES } from '../data/resources';
import { useAppStore } from '../store/useAppStore';
import { DifficultyLevel, ResourceType } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export const ResourcesPage: React.FC = () => {
  const reportedBrokenResources = useAppStore((s) => s.reportedBrokenResources);
  const reportBrokenResource = useAppStore((s) => s.reportBrokenResource);
  const pushToast = useAppStore((s) => s.pushToast);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [costFilter, setCostFilter] = useState<'all' | 'Free' | 'Freemium'>('all');

  const filtered = useMemo(() => {
    return CURATED_RESOURCES.filter((res) => {
      const matchesQ =
        query.trim() === '' ||
        res.title.toLowerCase().includes(query.toLowerCase()) ||
        res.platform.toLowerCase().includes(query.toLowerCase()) ||
        res.skillTags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchesType = typeFilter === 'all' || res.type === typeFilter;
      const matchesDiff = difficultyFilter === 'all' || res.difficulty === difficultyFilter;
      const matchesCost = costFilter === 'all' || res.cost === costFilter;
      return matchesQ && matchesType && matchesDiff && matchesCost;
    });
  }, [query, typeFilter, difficultyFilter, costFilter]);

  const copySearchHint = async (hint: string) => {
    const clean = hint.replace(/^Search:\s*/i, '');
    try {
      await navigator.clipboard.writeText(clean);
      pushToast({
        title: 'Search query copied',
        description: `Paste "${clean}" into your browser search.`,
        tone: 'success',
      });
    } catch {
      pushToast({ title: 'Search hint', description: clean, tone: 'info' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Curated Learning Resources
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Trusted official docs and free learning platforms. We provide exact search hints instead of unverified direct URLs.
        </p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skill, platform, title..."
              aria-label="Search resources"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ResourceType | 'all')}
            aria-label="Filter by resource type"
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="all">All types</option>
            <option value="documentation">Documentation</option>
            <option value="course">Course</option>
            <option value="interactive exercise">Interactive exercise</option>
            <option value="video">Video</option>
            <option value="practice">Practice</option>
            <option value="article">Article</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'all')}
            aria-label="Filter by difficulty"
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="all">All difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value as 'all' | 'Free' | 'Freemium')}
            aria-label="Filter by cost"
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="all">Free & Freemium</option>
            <option value="Free">Free only</option>
            <option value="Freemium">Freemium</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching resources found"
          description="Try clearing one of your filters or searching by skill name like React, SQL, or Python."
          actionLabel="Reset filters"
          onAction={() => {
            setQuery('');
            setTypeFilter('all');
            setDifficultyFilter('all');
            setCostFilter('all');
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((res) => {
            const reportCount = reportedBrokenResources[res.id] ?? 0;
            return (
              <Card key={res.id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {res.platform} · {res.type} · {res.cost}
                    </span>
                    <Badge tone="orange">{res.verifiedStatus}</Badge>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {res.skillTags.join(' · ')} · {res.difficulty} · {res.language} · {res.duration}
                  </p>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">
                    {res.searchHint}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button size="sm" variant="outline" onClick={() => copySearchHint(res.searchHint)}>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy search hint</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => reportBrokenResource(res.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Report broken link{reportCount > 0 ? ` (${reportCount})` : ''}</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
