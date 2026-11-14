import { AuthUser } from '../types';

export const AUTH_NOTICE = 'Demo authentication — replace with Firebase Auth in production.';

const USERS_KEY = 'skillpath_demo_users_v1';
const SESSION_KEY = 'skillpath_demo_session_v1';

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  provider: 'local' | 'google-demo';
  createdAt: string;
}

export interface AuthAdapter {
  loginWithEmail(email: string, password: string): Promise<AuthUser>;
  registerWithEmail(name: string, email: string, password: string): Promise<AuthUser>;
  continueWithGoogleDemo(): Promise<AuthUser>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  getCurrentSession(): AuthUser | null;
  setSession(user: AuthUser | null): void;
  logout(): Promise<void>;
}

function readAccounts(): StoredAccount[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

// Simple deterministic local hash for demo storage (never use in production without real auth)
function hashDemoPassword(pw: string): string {
  return btoa(unescape(encodeURIComponent(`sp_demo_${pw}`)));
}

export const localAuthService: AuthAdapter = {
  async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 250));
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    const match = accounts.find((a) => a.email.toLowerCase() === normalized);
    if (!match) {
      throw new Error('No account found for this email. Create an account or try the Demo Student.');
    }
    if (match.passwordHash !== hashDemoPassword(password)) {
      throw new Error('Incorrect password. Please double-check and try again.');
    }
    const user: AuthUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      provider: match.provider,
      isDemo: false,
      createdAt: match.createdAt,
    };
    this.setSession(user);
    return user;
  },

  async registerWithEmail(name: string, email: string, password: string): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 280));
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    const newAccount: StoredAccount = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalized,
      passwordHash: hashDemoPassword(password),
      provider: 'local',
      createdAt: new Date().toISOString(),
    };
    writeAccounts([...accounts, newAccount]);
    const user: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      provider: 'local',
      isDemo: false,
      createdAt: newAccount.createdAt,
    };
    this.setSession(user);
    return user;
  },

  async continueWithGoogleDemo(): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 220));
    const user: AuthUser = {
      id: `google_demo_${Date.now()}`,
      name: 'Priya Nair',
      email: 'priya.student@campus.edu',
      provider: 'google-demo',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    this.setSession(user);
    return user;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    await new Promise((r) => setTimeout(r, 220));
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    const exists = accounts.some((a) => a.email.toLowerCase() === normalized);
    return {
      message: exists
        ? `Demo password reset instructions prepared for ${normalized}. (In production, Firebase Auth sends a reset email.)`
        : `If an account exists for ${normalized}, reset instructions would be sent via Firebase Auth.`,
    };
  },

  getCurrentSession(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  setSession(user: AuthUser | null) {
    if (typeof localStorage === 'undefined') return;
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  },

  async logout(): Promise<void> {
    this.setSession(null);
  },
};
