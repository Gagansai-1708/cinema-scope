import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// IMPORTANT: Replace the placeholder values with your actual Firebase project credentials.
const firebaseConfig = {
  apiKey: "AIzaSyDKtmC4-EzjW2HqYvgECfxAeJxtHP-VJJY",
  authDomain: "cinelight-28yxa.firebaseapp.com",
  projectId: "cinelight-28yxa",
  storageBucket: "cinelight-28yxa.firebasestorage.app",
  messagingSenderId: "634282485987",
  appId: "1:634282485987:web:2bfabb67cee7325e4f3dd6"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Add error handling for Firestore connection
if (typeof window !== 'undefined') {
  // Only run in browser environment
  db.enableNetwork().catch((error) => {
    console.warn('Firestore network connection issue:', error);
  });
}

export { app, auth, db, storage };
