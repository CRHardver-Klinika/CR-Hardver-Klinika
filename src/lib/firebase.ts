import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress verbose/warning Firestore logs such as clock skew warnings
setLogLevel('error');

const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust settings:
// 1. experimentalForceLongPolling: true - forces HTTP long-polling instead of WebSockets/gRPC,
//    which resolves connection hangs/blocks inside sandboxed iframe previews.
// 2. persistentLocalCache - keeps data available even if offline or loading.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase is in offline/cache mode. Operations will sync automatically once online. Details:", error.message);
    } else {
      console.warn("Initial connection test result (expected if collection 'test' is empty):", error);
    }
  }
}

testConnection();
