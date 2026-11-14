import {
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthUser } from '../types';

export const AUTH_NOTICE =
  'Connected to Firebase Authentication. Demo Student mode remains available without sign-up.';

const DEMO_SESSION_KEY = 'skillpath_demo_session_v1';
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function mapFirebaseUser(fbUser: FirebaseUser): AuthUser {
  const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
  return {
    id: fbUser.uid,
    name: fbUser.displayName?.trim() || fbUser.email?.split('@')[0] || 'SkillPath Student',
    email: fbUser.email || '',
    provider: isGoogle ? 'firebase-google' : 'firebase-email',
    isDemo: false,
    emailVerified: fbUser.emailVerified,
    photoURL: fbUser.photoURL ?? undefined,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

function mapFirebaseAuthError(err: unknown): Error {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return new Error(
        'Email/Password sign-in is not enabled yet in Firebase Console. Enable it under Authentication > Sign-in method > Email/Password, or use Continue with Google / Demo Student.',
      );
    case 'auth/email-already-in-use':
      return new Error('An account with this email already exists. Please sign in instead.');
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new Error('Invalid email or password. Please check your credentials and try again.');
    case 'auth/weak-password':
      return new Error('Password is too weak. Use at least 6 characters with letters and numbers.');
    case 'auth/invalid-email':
      return new Error('Please enter a valid email address.');
    case 'auth/popup-closed-by-user':
      return new Error('Google sign-in popup was closed before finishing. Please try again.');
    case 'auth/popup-blocked':
      return new Error(
        'Browser blocked the Google sign-in popup. Please allow popups for this site and try again.',
      );
    case 'auth/too-many-requests':
      return new Error('Too many attempts. Please wait a moment before trying again.');
    case 'auth/network-request-failed':
      return new Error('Network error reaching Firebase Auth. Check your connection or try Demo Student.');
    default:
      return err instanceof Error ? err : new Error('Authentication failed. Please try again.');
  }
}

export const firebaseAuthService = {
  async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      this.setDemoSession(null);
      return mapFirebaseUser(cred.user);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  },

  async registerWithEmail(name: string, email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      // Send verification email so Zero-Trust email_verified Firestore rules can succeed
      await sendEmailVerification(cred.user).catch(() => undefined);
      this.setDemoSession(null);
      return mapFirebaseUser(cred.user);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  },

  async continueWithGoogle(): Promise<AuthUser> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      this.setDemoSession(null);
      return mapFirebaseUser(cred.user);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const normalized = email.trim();
      await sendPasswordResetEmail(auth, normalized);
      return {
        message: `Password reset email sent to ${normalized}. Check your inbox (and spam folder).`,
      };
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  },

  async resendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No active Firebase user found.');
    }
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      throw mapFirebaseAuthError(err);
    }
  },

  async refreshCurrentUser(): Promise<AuthUser | null> {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    return mapFirebaseUser(auth.currentUser);
  },

  async updateDisplayName(fullName: string): Promise<void> {
    if (!auth.currentUser || !fullName.trim()) return;
    await updateProfile(auth.currentUser, { displayName: fullName.trim() });
  },

  async getIdToken(): Promise<string | null> {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  },

  subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        this.setDemoSession(null);
        callback(mapFirebaseUser(fbUser));
      } else {
        callback(this.getDemoSession());
      }
    });
  },

  getDemoSession(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(DEMO_SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  setDemoSession(user: AuthUser | null) {
    if (typeof localStorage === 'undefined') return;
    if (!user) {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } else {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    }
  },

  async logout(): Promise<void> {
    this.setDemoSession(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  },
};

// Backwards-compatible alias for existing imports/tests
export const localAuthService = {
  ...firebaseAuthService,
  continueWithGoogleDemo: firebaseAuthService.continueWithGoogle,
  getCurrentSession: firebaseAuthService.getDemoSession,
  setSession: firebaseAuthService.setDemoSession,
};
