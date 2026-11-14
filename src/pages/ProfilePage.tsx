import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  KeyRound,
  LogOut,
  MailCheck,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  Sun,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { firebaseAuthService } from '../services/authService';
import { LearningStyle, PreferredLanguage } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PWAInstallButton } from '../components/PWAComponents';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const theme = useAppStore((s) => s.theme);
  const cloudSyncing = useAppStore((s) => s.cloudSyncing);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setAuthenticatedUser = useAppStore((s) => s.setAuthenticatedUser);
  const hydrateFromCloud = useAppStore((s) => s.hydrateFromCloud);
  const resetDemoStudent = useAppStore((s) => s.resetDemoStudent);
  const simulateInactivityCheck = useAppStore((s) => s.simulateInactivityCheck);
  const pushToast = useAppStore((s) => s.pushToast);
  const logout = useAppStore((s) => s.logout);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [college, setCollege] = useState(profile?.college ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [academicYear, setAcademicYear] = useState(profile?.academicYear ?? 'Third year');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(
    profile?.preferredLanguage ?? 'English',
  );
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<LearningStyle>(
    profile?.preferredLearningStyle ?? 'hands-on',
  );
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(profile?.weeklyStudyHours ?? 10);
  const [authActionLoading, setAuthActionLoading] = useState(false);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      college,
      department,
      academicYear,
      preferredLanguage,
      preferredLearningStyle,
      weeklyStudyHours,
    });
    if (user && !user.isDemo) {
      await firebaseAuthService.updateDisplayName(fullName).catch(() => undefined);
    }
    pushToast({
      title: 'Profile updated',
      description:
        user && !user.isDemo && user.emailVerified
          ? 'Saved locally and synced to Firestore.'
          : 'Your study preferences and weekly hours have been saved.',
      tone: 'success',
    });
  };

  const handleResendVerification = async () => {
    setAuthActionLoading(true);
    try {
      await firebaseAuthService.resendVerificationEmail();
      pushToast({
        title: 'Verification email sent',
        description: `Check ${user?.email} to verify your email and enable Firestore cloud sync.`,
        tone: 'success',
      });
    } catch (err) {
      pushToast({
        title: 'Unable to send verification email',
        description: err instanceof Error ? err.message : 'Please try again later.',
        tone: 'error',
      });
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleRefreshVerification = async () => {
    setAuthActionLoading(true);
    try {
      const refreshed = await firebaseAuthService.refreshCurrentUser();
      if (refreshed) {
        setAuthenticatedUser(refreshed, false);
        if (refreshed.emailVerified) {
          await hydrateFromCloud(refreshed.id);
          pushToast({
            title: 'Email verified!',
            description: 'Cloud Firestore persistence is now active.',
            tone: 'success',
          });
        } else {
          pushToast({
            title: 'Not verified yet',
            description: 'Click the link in your inbox, then press Refresh again.',
            tone: 'warning',
          });
        }
      }
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setAuthActionLoading(true);
    try {
      const res = await firebaseAuthService.requestPasswordReset(user.email);
      pushToast({
        title: 'Password reset sent',
        description: res.message,
        tone: 'success',
      });
    } catch (err) {
      pushToast({
        title: 'Reset failed',
        description: err instanceof Error ? err.message : 'Could not send reset email.',
        tone: 'error',
      });
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Profile & Preferences
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage your study settings, language, theme, and account session.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.isDemo ? (
            <Badge tone="orange">Demo Student Mode</Badge>
          ) : user?.emailVerified ? (
            <Badge tone="green">
              {cloudSyncing ? 'Syncing Firestore...' : 'Firebase Verified'}
            </Badge>
          ) : (
            <Badge tone="orange">Email Verification Pending</Badge>
          )}
        </div>
      </div>

      {/* Firebase Account Security & Cloud Sync Status */}
      {user && !user.isDemo && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Account & Cloud Sync Status
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Provider: {user.provider === 'firebase-google' ? 'Google Sign-In' : 'Email / Password'}
            </span>
          </div>

          {user.emailVerified ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Your email is verified. Progress, assessments, roadmaps, XP transactions, and Pathy chats sync securely to your private Firestore workspace.
              </span>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-900 dark:text-amber-100">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Our Zero-Trust Firestore rules require a verified email before writing to cloud collections. Your progress is saved locally in the meantime.
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  loading={authActionLoading}
                  onClick={handleResendVerification}
                >
                  <MailCheck className="h-3.5 w-3.5" />
                  <span>Resend Verification Email</span>
                </Button>
                <Button
                  size="sm"
                  loading={authActionLoading}
                  onClick={handleRefreshVerification}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>I&apos;ve Verified — Refresh</span>
                </Button>
              </div>
            </div>
          )}

          {user.provider === 'firebase-email' && (
            <div>
              <Button
                size="sm"
                variant="outline"
                loading={authActionLoading}
                onClick={handlePasswordReset}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Send Password Reset Email</span>
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-2 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">College</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Weekly Study Hours</label>
              <input
                type="number"
                min={2}
                max={60}
                value={weeklyStudyHours}
                onChange={(e) => setWeeklyStudyHours(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Tanglish">Tanglish</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Preferred Learning Style</label>
              <select
                value={preferredLearningStyle}
                onChange={(e) => setPreferredLearningStyle(e.target.value as LearningStyle)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="hands-on">Hands-on</option>
                <option value="video">Video</option>
                <option value="reading">Reading</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          App Settings, Adaptive Controls & Session
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </Button>

          <PWAInstallButton />

          <Button
            variant="outline"
            onClick={() => {
              simulateInactivityCheck(4);
              pushToast({
                title: 'Gentle re-engagement triggered',
                description: 'Daily hours eased temporarily without guilt.',
                tone: 'info',
              });
            }}
          >
            <Clock className="h-4 w-4" />
            <span>Preview 4-Day Inactivity Adaptation</span>
          </Button>

          {user?.isDemo && (
            <Button variant="outline" onClick={resetDemoStudent}>
              <RotateCcw className="h-4 w-4" />
              <span>Reset Demo Student</span>
            </Button>
          )}

          <Button variant="danger" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
