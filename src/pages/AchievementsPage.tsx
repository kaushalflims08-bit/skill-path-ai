import React, { useState } from 'react';
import { Award, Coffee, Flame, RefreshCw, Shield, Trophy } from 'lucide-react';
import { selectTotalXP, useAppStore } from '../store/useAppStore';
import { BADGE_CATALOG, LEVEL_THRESHOLDS, getLevelForXP } from '../lib/gamification';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

const OPT_IN_PEERS = [
  { name: 'Meera K.', xp: 940 },
  { name: 'Rohan S.', xp: 680 },
  { name: 'Divya P.', xp: 510 },
];

export const AchievementsPage: React.FC = () => {
  const profile = useAppStore((s) => s.profile);
  const badges = useAppStore((s) => s.badges);
  const xpTransactions = useAppStore((s) => s.xpTransactions);
  const flashcards = useAppStore((s) => s.flashcards);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const toggleRestDay = useAppStore((s) => s.toggleRestDay);
  const useStreakFreeze = useAppStore((s) => s.useStreakFreeze);
  const reviewFlashcard = useAppStore((s) => s.reviewFlashcard);
  const totalXp = useAppStore((s) => selectTotalXP(s));

  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  if (!profile) return null;

  const levelInfo = getLevelForXP(totalXp);
  const dueCards = flashcards.filter(
    (c) => new Date(c.nextReviewAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000,
  );

  const leaderboardEntries = [
    ...OPT_IN_PEERS,
    ...(profile.leaderboardOptIn ? [{ name: `${profile.fullName} (You)`, xp: totalXp }] : []),
  ].sort((a, b) => b.xp - a.xp);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Level & Streak Overview */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Deterministic XP & Leveling
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {levelInfo.current.name} · <span className="font-mono tabular-nums">{totalXp} XP</span>
              </h2>
            </div>
            <Badge tone="purple">Duplicate XP protection active</Badge>
          </div>

          <ProgressBar
            value={levelInfo.progressPercent}
            label={
              levelInfo.next
                ? `Progress to ${levelInfo.next.name} (${levelInfo.next.minXp} XP)`
                : 'Maximum Master tier achieved'
            }
            color="purple"
          />

          <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            {LEVEL_THRESHOLDS.map((lvl) => (
              <span
                key={lvl.name}
                className={
                  lvl.name === levelInfo.current.name
                    ? 'font-bold text-slate-900 dark:text-white'
                    : ''
                }
              >
                {lvl.name} ({lvl.minXp}+)
              </span>
            ))}
          </div>
        </Card>

        {/* Streak & Rest Day */}
        <Card className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {profile.streakDays}-Day Streak
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Freezes: {profile.streakFreezeAvailable}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weekDays.map((day, idx) => {
              const active = idx < Math.min(7, profile.streakDays);
              return (
                <div
                  key={day}
                  className={`rounded-lg py-2 text-xs font-medium ${
                    active
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={toggleRestDay}>
              <Coffee className="h-3.5 w-3.5" />
              <span>{profile.restDayActive ? 'End Rest Day' : 'Take Rest Day'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={profile.streakFreezeAvailable <= 0}
              onClick={useStreakFreeze}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Use Streak Freeze</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Spaced Repetition Flashcards */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Spaced Repetition Review Deck ({dueCards.length} due)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flashcards generated from quiz mistakes adapt intervals automatically (SM-2).
            </p>
          </div>
        </div>

        {flashcards.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No flashcards yet. After any quiz in Quiz Arena, click “Add mistakes to flashcards” to build your review deck.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {flashcards.slice(0, 4).map((card) => {
              const flipped = flippedCardId === card.id;
              return (
                <div
                  key={card.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{card.topic}</span>
                    <span className="font-mono">Interval: {card.intervalDays}d</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {flipped ? card.back : card.front}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFlippedCardId(flipped ? null : card.id)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>{flipped ? 'Show Prompt' : 'Reveal Answer'}</span>
                    </Button>
                    {flipped && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => reviewFlashcard(card.id, 1)}>
                          Again
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reviewFlashcard(card.id, 4)}>
                          Good
                        </Button>
                        <Button size="sm" onClick={() => reviewFlashcard(card.id, 5)}>
                          Easy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Badges Gallery */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-pink-500" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Badges ({badges.length} / {BADGE_CATALOG.length})
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_CATALOG.map((def) => {
            const unlocked = badges.find((b) => b.badgeId === def.id);
            return (
              <div
                key={def.id}
                className={`rounded-2xl border p-4 space-y-2 ${
                  unlocked
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {def.name}
                  </span>
                  <Badge tone={unlocked ? def.color : 'neutral'}>
                    {unlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{def.description}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Criteria: {def.criteria}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* XP Ledger + Opt-in Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 space-y-3">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            XP Transaction Ledger
          </h3>
          {xpTransactions.length === 0 ? (
            <p className="text-sm text-slate-500">Complete a lesson or quiz to earn your first XP.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {xpTransactions.map((tx) => (
                <li key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{tx.description}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {tx.type} · {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{tx.amount} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Peer Leaderboard (Opt-in)
              </h3>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={profile.leaderboardOptIn}
                onChange={(e) => updateProfile({ leaderboardOptIn: e.target.checked })}
                className="accent-blue-600"
              />
              <span>Join</span>
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Privacy-first: only display name and XP are shown.
          </p>
          <ul className="space-y-2">
            {leaderboardEntries.map((entry, idx) => (
              <li
                key={entry.name}
                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  #{idx + 1} {entry.name}
                </span>
                <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {entry.xp} XP
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
