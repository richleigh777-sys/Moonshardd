import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForFirebaseAuth1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:1234567890abcdef",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Suppress internal Firestore connection warnings in dev
setLogLevel('silent');

// Connectivity Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
  } catch (error: any) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("[Firebase] Network offline or unreachable. Operating in local cache mode.");
    } else if (error?.code === 'unavailable') {
      console.warn("[Firebase] Network offline or unreachable. Operating in local cache mode.");
    }
  }
}
testConnection();

