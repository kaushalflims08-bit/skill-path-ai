import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const firebaseProjectConfig = firebaseConfig;

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error(
        'Firebase connection check failed: the client is offline. Please verify firebase-applet-config.json and network connectivity.',
      );
      return false;
    }
    // Permission denied on /test/connection is expected under Zero-Trust rules and proves the server is reachable.
    return true;
  }
}

// Run boot-time connection verification in browser contexts
if (typeof window !== 'undefined') {
  void testFirestoreConnection();
}
