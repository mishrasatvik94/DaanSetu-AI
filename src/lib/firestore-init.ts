/**
 * src/lib/firestore-init.ts
 *
 * Utility to ensure required Firestore collections exist.
 * Call initFirestoreCollections() once on first app start (client-side only).
 * It uses setDoc with merge:true so it never overwrites existing data.
 */

"use client";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Collection names used across DaanSetu.
 */
export const COLLECTIONS = {
  USERS: "users",
  NGOS: "ngos",
  DONATIONS: "donations",
  CAMPAIGNS: "campaigns",
  KARMA: "karma",
  LEADERBOARD: "leaderboard",
  CHAT_SESSIONS: "chat_sessions",
  PICKUP_REQUESTS: "pickup_requests",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Writes a sentinel document (_meta/init) into each required collection
 * if it doesn't already exist. This guarantees the collections are visible
 * in the Firebase Console even before real user data arrives.
 *
 * Safe to call multiple times — uses merge so it won't overwrite data.
 */
export async function initFirestoreCollections(): Promise<void> {
  if (typeof window === "undefined") return; // client only

  const collectionNames = Object.values(COLLECTIONS);

  await Promise.allSettled(
    collectionNames.map(async (collection) => {
      const metaRef = doc(db, collection, "_meta");
      const snap = await getDoc(metaRef);
      if (!snap.exists()) {
        await setDoc(
          metaRef,
          {
            initialized: true,
            collection,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    })
  );
}
