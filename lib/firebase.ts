import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
// export const auth = getAuth(app);

// Suppress internal Firestore connection warnings in dev
setLogLevel('error');

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
