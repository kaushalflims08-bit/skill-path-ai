import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, Lock, Mail, User } from 'lucide-react';
import { AUTH_NOTICE, firebaseAuthService } from '../services/authService';
import { forgotPasswordSchema, loginSchema, registerSchema } from '../lib/validation';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PathyMascot } from '../components/PathyMascot';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuthenticatedUser = useAppStore((s) => s.setAuthenticatedUser);
  const hydrateFromCloud = useAppStore((s) => s.hydrateFromCloud);
  const loginDemoStudent = useAppStore((s) => s.loginDemoStudent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setInfoMessage(null);

    if (mode === 'login') {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((iss) => {
          if (iss.path[0]) errs[String(iss.path[0])] = iss.message;
        });
        setFieldErrors(errs);
        return;
      }
      setLoading(true);
      try {
        const user = await firebaseAuthService.loginWithEmail(email, password);
        setAuthenticatedUser(user, false);
        if (user.emailVerified) {
          await hydrateFromCloud(user.id);
        }
        const prof = useAppStore.getState().profile;
        navigate(prof?.onboardingCompleted ? '/dashboard' : '/onboarding');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Unable to sign in.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      const parsed = registerSchema.safeParse({ name, email, password });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((iss) => {
          if (iss.path[0]) errs[String(iss.path[0])] = iss.message;
        });
        setFieldErrors(errs);
        return;
      }
      setLoading(true);
      try {
        const user = await firebaseAuthService.registerWithEmail(name, email, password);
        setAuthenticatedUser(user, true);
        navigate('/onboarding');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      const parsed = forgotPasswordSchema.safeParse({ email });
      if (!parsed.success) {
        setFieldErrors({ email: parsed.error.issues[0]?.message || 'Invalid email.' });
        return;
      }
      setLoading(true);
      try {
        const res = await firebaseAuthService.requestPasswordReset(email);
        setInfoMessage(res.message);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Unable to send password reset email.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setFormError(null);
    setInfoMessage(null);
    try {
      const user = await firebaseAuthService.continueWithGoogle();
      setAuthenticatedUser(user, false);
      if (user.emailVerified) {
        await hydrateFromCloud(user.id);
      }
      const prof = useAppStore.getState().profile;
      navigate(prof?.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          <span className="font-display text-sm font-bold text-blue-600 dark:text-blue-400">
            SkillPath AI
          </span>
        </div>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <PathyMascot mood="happy" size="sm" />
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'login'
                  ? 'Welcome back'
                  : mode === 'register'
                    ? 'Create your student account'
                    : 'Reset password'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Learn What You Need. Become What You Want.
              </p>
            </div>
          </div>

          <div
            role="note"
            className="mb-5 flex items-start gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 px-3 py-2.5 text-xs text-blue-800 dark:text-blue-200"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{AUTH_NOTICE}</span>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-200"
            >
              {formError}
            </div>
          )}

          {infoMessage && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-200"
            >
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Karthik Subramanian"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</p>
              )}
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setFieldErrors({});
                        setFormError(null);
                      }}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars with a letter & number"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password}</p>
                )}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                  ? 'Create Account & Start Onboarding'
                  : 'Send Password Reset Email'}
            </Button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span>or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="outline"
                  loading={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full"
                >
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDemoStudent}
                  className="w-full"
                >
                  Try Demo Student (Alex)
                </Button>
              </div>
            </>
          )}

          <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                New to SkillPath AI?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFieldErrors({});
                    setFormError(null);
                  }}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFieldErrors({});
                    setFormError(null);
                  }}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
