// firebase/firebaseConfig.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDOtG1_tkj8QxwcUmKi6twRfz0lhIa3euo",
  authDomain: "callapp-e73e5.firebaseapp.com",
  projectId: "callapp-e73e5",
  storageBucket: "callapp-e73e5.firebasestorage.app",
  messagingSenderId: "76884156975",
  appId: "1:76884156975:web:7b322a890d1c935cf49cda"
};

// Initialize Firebase only once
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with proper error handling
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  // If getAuth fails, try initializeAuth
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);
export default app;