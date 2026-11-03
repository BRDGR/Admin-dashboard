import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Server-only Firebase Admin access. Bypasses Firestore rules, so it must
 * never be imported from client code.
 *
 * Credentials: set FIREBASE_SERVICE_ACCOUNT_KEY to the service-account JSON
 * (raw or base64). Otherwise Application Default Credentials are used.
 */
function readServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  const text = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(text);
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();
  const account = readServiceAccount();
  return initializeApp(
    account
      ? { credential: cert(account as Parameters<typeof cert>[0]) }
      : { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }
  );
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
