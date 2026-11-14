import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass, Layers, Map as MapIcon, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PathyMascot } from '../components/PathyMascot';
import { PWAInstallButton } from '../components/PWAComponents';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const user = useAppStore((s) => s.user);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const loginDemoStudent = useAppStore((s) => s.loginDemoStudent);

  const handleTryDemo = () => {
    loginDemoStudent();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 3-Zone Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            SkillPath AI
          </Link>

          <nav aria-label="Landing navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#agents" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
              Multi-Agent Engine
            </a>
            <a href="#pathy" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
              Meet Pathy
            </a>
            <Link to="/auth" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {user ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Open Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={handleTryDemo}>
                Try Demo Student
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6 space-y-6">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              College Learning & Career Guidance Platform
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance leading-[1.1]">
              Learn What You Need. Become What You Want.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Discover your verified skill gaps for real software, data, cloud, and design careers. Follow an adaptive roadmap that responds to your quiz scores, study schedule, and goals—guided by Pathy, your bilingual study companion.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" onClick={handleTryDemo}>
                <span>Try Demo Student (Alex)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth?mode=register')}>
                Create Student Account
              </Button>
              <PWAInstallButton />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span>Deterministic proficiency scoring</span>
              <span aria-hidden="true">·</span>
              <span>Self-reported vs verified separation</span>
              <span aria-hidden="true">·</span>
              <span>Offline-capable PWA</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
              {heroImgFailed ? (
                <div className="flex flex-1 min-h-[280px] flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 text-center">
                  <PathyMascot mood="happy" size="lg" />
                  <p className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                    Adaptive SkillPath Workspace
                  </p>
                </div>
              ) : (
                <img
                  src="/src/assets/images/hero_skillpath_campus_1794643475221.jpg"
                  alt="College student coding at a desk with floating skill nodes"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="h-full min-h-[280px] w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            01. Evidence First, Roadmap Second
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Unlike generic checklists, SkillPath AI separates what you think you know from what you have proven through assessments and projects.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <Compass className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Transparent Career Matching
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Compare up to 3 careers side-by-side and test “What-if” skill gains using a transparent weighted formula—never vague black-box claims.
            </p>
          </Card>
          <Card>
            <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Diagnostic Skill Assessments
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Test yourself across 12 technical topics with MCQ, multi-select, code-output prediction, fill-in-the-blank, and timed challenges.
            </p>
          </Card>
          <Card>
            <MapIcon className="h-6 w-6 text-amber-500" />
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Adaptive Versioned Roadmaps
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Score under 50% and remediation lessons are added automatically. Score 80%+ and advanced challenges unlock. Every version is preserved.
            </p>
          </Card>
        </div>
      </section>

      {/* Multi-Agent & Pathy */}
      <section id="agents" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          <Card className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                02. Six Coordinated Specialists
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Every onboarding, quiz result, and career pivot passes structured JSON through six specialized agents with schema validation and safe deterministic fallbacks when offline.
              </p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 text-sm text-slate-700 dark:text-slate-200">
                {[
                  'Profile Agent — normalizes constraints',
                  'Skill Analysis Agent — scores evidence',
                  'Career Advisor Agent — explains fit',
                  'Learning Planner Agent — sequences gaps',
                  'Assessment Agent — reviews mistakes',
                  'AI Mentor Agent — coaches in English & Tamil',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Honest guidance: we never guarantee jobs, placements, or salaries.</span>
            </div>
          </Card>

          <Card id="pathy" className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <PathyMascot mood="happy" size="lg" />
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Meet Pathy
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Your friendly owl mentor with 6 modes: Explain, Socratic, Debug my code, Mock interviewer, Study planner, and Motivation coach.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleTryDemo}>Try Demo Student</Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        SkillPath AI · Built for college learners · Curated resources & local demo persistence
      </footer>
    </div>
  );
};
