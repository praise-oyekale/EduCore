// Step A: Import functions from the Firebase package you installed
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Step B: Collect your project keys securely from the .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const secondaryApp =
  getApps().find((a) => a.name === "secondary") ||
  initializeApp(firebaseConfig, "secondary");

export const secondaryAuth = getAuth(secondaryApp)

// Step C: Turn on Firebase for your app
const app = initializeApp(firebaseConfig);

// Step D: Enable specific tools you need for a school system and export them
export const auth = getAuth(app);       // Handles student & teacher login
export const db = getFirestore(app);    // Stores grades, student profiles, classes
export const storage = getStorage(app);  // Stores photos or assignment PDFs