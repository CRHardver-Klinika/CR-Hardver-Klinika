import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Check your configuration or network.");
    } else {
      console.warn("Initial connection test result (expected if collection 'test' is empty):", error);
    }
  }
}

testConnection();

export const loginWithGoogle = async () => {
  try {
    // Adding a hint to ensure the user knows to look for a popup
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('A bejelentkezési ablak be lett zárva. Kérlek próbáld újra és várd meg amíg a folyamat befejeződik.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('A böngésződ letiltotta a felugró ablakot. Kérlek engedélyezd a felugró ablakokat ehhez az oldalhoz.');
    }
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
