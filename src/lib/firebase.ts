/**
 * src/lib/firebase.ts
 *
 * Firebase SDK initialisation for DaanSetu.
 * - Firebase App, Firestore, and Auth are exported for use anywhere in the project.
 * - Analytics is initialised lazily on the client-side only to avoid SSR crashes.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import type { Analytics } from "firebase/analytics";

// ── Firebase config from environment variables ────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ── Singleton Firebase app (safe for Next.js hot-reload) ─────────────────────
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ── Firestore database ────────────────────────────────────────────────────────
const db: Firestore = getFirestore(app);

// ── Firebase Authentication ───────────────────────────────────────────────────
const auth: Auth = getAuth(app);

// ── Analytics (client-side only, safe for SSR) ────────────────────────────────
/**
 * Returns the Firebase Analytics instance, but ONLY in the browser.
 * Call this inside useEffect or event handlers — never at module-top-level
 * on the server, because the analytics package relies on browser APIs.
 *
 * @example
 *   useEffect(() => {
 *     getAnalytics().then((a) => logEvent(a, "page_view"));
 *   }, []);
 */
async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    if (!supported) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
}

// Eagerly resolve analytics on the client so consumers can await the export.
const analytics: Promise<Analytics | null> =
  typeof window !== "undefined" ? getAnalyticsInstance() : Promise.resolve(null);

export { app, db, auth, analytics };
export type { FirebaseApp, Firestore, Auth, Analytics };
