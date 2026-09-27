import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(apiKey && projectId && !apiKey.includes("your_firebase_api_key"));
}

const FALLBACK_CONFIG = {
  apiKey: "AIzaSyDummyKeyForFallbackInitialization000",
  projectId: "dummy-project",
  appId: "1:000000000000:web:0000000000000000000000",
};

let app: FirebaseApp;
let db: Firestore;

if (isFirebaseConfigured()) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} else {
  app = getApps().some((a) => a.name === "[FALLBACK]")
    ? getApp("[FALLBACK]")
    : initializeApp(FALLBACK_CONFIG, "[FALLBACK]");
}

db = getFirestore(app);

export { app, db };
