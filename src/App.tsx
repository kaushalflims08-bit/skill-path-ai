import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { firebaseAuthService } from './services/authService';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CareerExplorerPage } from './pages/CareerExplorerPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { MentorPage } from './pages/MentorPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppStore((s) => s.user);
  const authReady = useAppStore((s) => s.authReady);

  if (!authReady && !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verifying your SkillPath AI session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const setAuthenticatedUser = useAppStore((s) => s.setAuthenticatedUser);
  const hydrateFromCloud = useAppStore((s) => s.hydrateFromCloud);
  const setAuthReady = useAppStore((s) => s.setAuthReady);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = firebaseAuthService.subscribeToAuthChanges((fbOrDemoUser) => {
      if (fbOrDemoUser) {
        if (!fbOrDemoUser.isDemo) {
          setAuthenticatedUser(fbOrDemoUser, false);
          if (fbOrDemoUser.emailVerified) {
            void hydrateFromCloud(fbOrDemoUser.id);
          }
        }
      } else {
        const current = useAppStore.getState().user;
        if (current && !current.isDemo) {
          useAppStore.setState({ user: null });
        }
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [hydrateFromCloud, setAuthReady, setAuthenticatedUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/careers" element={<CareerExplorerPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/mentor" element={<MentorPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
