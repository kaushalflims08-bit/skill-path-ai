import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
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
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const updateProfile = useAppStore((s) => s.updateProfile);
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

  if (!profile) return null;

  const handleSave = (e: React.FormEvent) => {
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
    pushToast({
      title: 'Profile updated',
      description: 'Your study preferences and weekly hours have been saved.',
      tone: 'success',
    });
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
        {user?.isDemo && <Badge tone="orange">Demo Student Mode</Badge>}
      </div>

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
