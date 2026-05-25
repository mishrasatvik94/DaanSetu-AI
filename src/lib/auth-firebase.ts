/**
 * src/lib/auth-firebase.ts
 *
 * Firebase-backed authentication layer for DaanSetu.
 * Exports the same API surface as the old localStorage-based auth.ts so all
 * existing consumers (Navbar, Profile, Login, Signup, …) work without changes.
 *
 * Session persistence: Firebase default = browserLocalPersistence (survives refresh).
 */

import { useSyncExternalStore } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordReset,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

// ── User type (kept identical to the old auth.ts shape) ──────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: "donor" | "ngo";
  karmaScore: number;
  level: string;
  badges: string[];
  createdAt: number;
};

// ── Reactive store ────────────────────────────────────────────────────────────
const listeners = new Set<() => void>();
let cachedUser: User | null = null;

function emit() {
  listeners.forEach((l) => l());
}

// Bootstrap: listen to Firebase auth state changes
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Try to load rich profile from Firestore
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          cachedUser = {
            id: firebaseUser.uid,
            name: data.name ?? firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
            email: firebaseUser.email ?? "",
            phone: data.phone,
            city: data.city,
            role: data.role ?? "donor",
            karmaScore: data.karmaScore ?? 0,
            level: data.level ?? "Seed",
            badges: data.badges ?? [],
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          };
        } else {
          // Firestore doc missing – build minimal user from Firebase Auth
          cachedUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
            email: firebaseUser.email ?? "",
            role: "donor",
            karmaScore: 0,
            level: "Seed",
            badges: [],
            createdAt: Date.now(),
          };
        }
      } catch {
        // Offline or permission error – degrade gracefully
        cachedUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
          email: firebaseUser.email ?? "",
          role: "donor",
          karmaScore: 0,
          level: "Seed",
          badges: [],
          createdAt: Date.now(),
        };
      }
    } else {
      cachedUser = null;
    }
    emit();
  });
}

// ── Internal: write Firestore user document ───────────────────────────────────
async function upsertFirestoreUser(
  uid: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    role: "donor" | "ngo";
  }
) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      city: data.city ?? "",
      role: data.role,
      karmaScore: 0,
      level: "Seed",
      badges: [],
      createdAt: serverTimestamp(),
    });
  }
}

// ── Exported auth functions ───────────────────────────────────────────────────

/**
 * Email + password sign-in. Throws a user-friendly Error on failure.
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will update cachedUser; caller can await the next emit
    return cachedUser!;
  } catch (err) {
    throw new Error(mapAuthError(err as FirebaseError));
  }
}

/**
 * Email + password sign-up. Creates Firebase Auth user + Firestore doc.
 */
export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  role: "donor" | "ngo";
}): Promise<User> {
  try {
    const { user: fbUser } = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password
    );
    // Set display name in Firebase Auth
    await updateProfile(fbUser, { displayName: input.name });
    // Create Firestore document
    await upsertFirestoreUser(fbUser.uid, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      city: input.city,
      role: input.role,
    });
    return cachedUser!;
  } catch (err) {
    throw new Error(mapAuthError(err as FirebaseError));
  }
}

/**
 * Google OAuth sign-in / sign-up (popup). Creates Firestore doc if first time.
 */
export async function signInWithGoogle(role: "donor" | "ngo" = "donor"): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const { user: fbUser } = await signInWithPopup(auth, provider);
    await upsertFirestoreUser(fbUser.uid, {
      name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
      email: fbUser.email ?? "",
      role,
    });
    return cachedUser!;
  } catch (err) {
    const fe = err as FirebaseError;
    // User closed popup – don't show error
    if (fe.code === "auth/popup-closed-by-user" || fe.code === "auth/cancelled-popup-request") {
      throw new Error("CANCELLED");
    }
    throw new Error(mapAuthError(fe));
  }
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Send a password reset email. Throws user-friendly Error on failure. */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await firebaseSendPasswordReset(auth, email);
  } catch (err) {
    throw new Error(mapAuthError(err as FirebaseError));
  }
}

/** Return cached user synchronously (may be null before auth initialises). */
export function getUser(): User | null {
  return cachedUser;
}

/** Update local cache + Firestore patch (partial). */
export async function updateUser(patch: Partial<User>): Promise<void> {
  if (!cachedUser) return;
  cachedUser = { ...cachedUser, ...patch };
  emit();
  // Persist to Firestore (exclude 'id' which is the doc path, not a field)
  const ref = doc(db, "users", cachedUser.id);
  const { id: _id, ...rest } = patch;
  void setDoc(ref, { ...rest }, { merge: true }).catch(console.error);
}

/**
 * React hook – returns live auth state. Returns null while initialising.
 * Uses useSyncExternalStore for tear-free concurrent-mode rendering.
 */
export function useAuth(): User | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cachedUser,
    () => null
  );
}

/** Compute two-letter initials from a display name. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Firebase error → friendly message ────────────────────────────────────────
function mapAuthError(err: FirebaseError): string {
  switch (err.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    default:
      return err.message ?? "Something went wrong. Please try again.";
  }
}
