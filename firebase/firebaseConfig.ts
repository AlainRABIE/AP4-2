import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOtG1_tkj8QxwcUmKi6twRfz0lhIa3euo",
  authDomain: "callapp-e73e5.firebaseapp.com",
  projectId: "callapp-e73e5",
  storageBucket: "callapp-e73e5.firebasestorage.app",
  messagingSenderId: "76884156975",
  appId: "1:76884156975:web:7b322a890d1c935cf49cda"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;