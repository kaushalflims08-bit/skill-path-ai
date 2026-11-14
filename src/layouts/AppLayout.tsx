import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Compass,
  FolderGit2,
  Home,
  Layers,
  LogOut,
  Map as MapIcon,
  Menu,
  MessageSquareHeart,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sun,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, selectTotalXP } from '../store/useAppStore';
import { getLevelForXP } from '../lib/gamification';
import { PathyMascot } from '../components/PathyMascot';
import { PWAInstallButton, OfflineIndicator } from '../components/PWAComponents';
import { ToastViewport } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/roadmap', label: 'Roadmap', icon: MapIcon },
  { to: '/skill-gap', label: 'Skill Gaps', icon: Target },
  { to: '/careers', label: 'Careers', icon: Compass },
  { to: '/assessments', label: 'Quiz Arena', icon: Layers },
  { to: '/resources', label: 'Learn', icon: BookOpen },
  { to: '/mentor', label: 'Pathy AI', icon: MessageSquareHeart },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/achievements', label: 'Rewards', icon: Trophy },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationsRead = useAppStore((s) => s.markNotificationsRead);
  const celebrationMessage = useAppStore((s) => s.celebrationMessage);
  const clearCelebration = useAppStore((s) => s.clearCelebration);
  const resetDemoStudent = useAppStore((s) => s.resetDemoStudent);
  const logout = useAppStore((s) => s.logout);
  const totalXp = useAppStore((s) => selectTotalXP(s));

  const levelInfo = getLevelForXP(totalXp);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Desktop Left Collapsible Sidebar */}
      <aside
        aria-label="Primary navigation"
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 shrink-0 ${
          collapsed ? 'w-[76px]' : 'w-[248px]'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap overflow-hidden"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-extrabold">
              SP
            </span>
            {!collapsed && <span>SkillPath AI</span>}
          </NavLink>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2">
          {!collapsed && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span>{levelInfo.current.name}</span>
                <span className="tabular-nums font-mono text-blue-600 dark:text-blue-400">
                  {totalXp} XP
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                {profile?.streakDays ?? 1}-day streak
              </p>
            </div>
          )}

          {user?.isDemo && !collapsed && (
            <button
              type="button"
              onClick={resetDemoStudent}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Reset demo</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 backdrop-blur-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-extrabold">
              SP
            </span>
            <h1 className="truncate font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {currentNav?.label ?? 'SkillPath AI'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <PWAInstallButton compact />

            {/* Notifications popover button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  if (!notifOpen && unreadCount > 0) markNotificationsRead();
                }}
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                      You are all caught up.
                    </p>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.slice(0, 6).map((n) => (
                        <li
                          key={n.id}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 text-xs"
                        >
                          <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-300">{n.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <NavLink
              to="/profile"
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span className="truncate max-w-[120px]">{profile?.fullName ?? user?.name ?? 'Student'}</span>
            </NavLink>
          </div>
        </header>

        {/* Celebratory Banner */}
        <AnimatePresence>
          {celebrationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6"
            >
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <PathyMascot mood="celebrating" size="sm" />
                  <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                    {celebrationMessage}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={clearCelebration}>
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation: Home, Roadmap, Learn, Quiz, Mentor, More */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-1 backdrop-blur-xs md:hidden"
      >
        {[
          { to: '/dashboard', label: 'Home', icon: Home },
          { to: '/roadmap', label: 'Roadmap', icon: MapIcon },
          { to: '/resources', label: 'Learn', icon: BookOpen },
          { to: '/assessments', label: 'Quiz', icon: Layers },
          { to: '/mentor', label: 'Mentor', icon: MessageSquareHeart },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium min-w-[48px] min-h-[44px] ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More navigation options"
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 min-w-[48px] min-h-[44px] cursor-pointer"
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/50 md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                Explore SkillPath AI
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.filter((i) =>
                ['/skill-gap', '/careers', '/projects', '/achievements', '/analytics', '/profile'].includes(
                  i.to,
                ),
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              {user?.isDemo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    resetDemoStudent();
                    setMoreOpen(false);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset demo</span>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastViewport />
      <OfflineIndicator />
    </div>
  );
};
