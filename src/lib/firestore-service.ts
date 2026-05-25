/**
 * src/lib/firestore-service.ts
 *
 * Clean, reusable Firestore service layer for DaanSetu.
 * All reads fall back gracefully if collections are empty.
 * All writes are fire-and-forget safe (errors logged, never bubble).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  increment,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Collection names ─────────────────────────────────────────────────────────
export const COL = {
  NGOS: "ngos",
  DONATIONS: "donations",
  KARMA: "karma",
  LEADERBOARD: "leaderboard",
  CAMPAIGNS: "campaigns",
  CHAT_SESSIONS: "chat_sessions",
  PICKUP_REQUESTS: "pickup_requests",
  USERS: "users",
} as const;

// ── Generic helpers ───────────────────────────────────────────────────────────

/** Fetch all documents from a collection with optional Firestore constraints. */
export async function fetchCollection<T>(
  colName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const ref = collection(db, colName);
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  } catch (err) {
    console.warn(`[Firestore] fetchCollection(${colName}) failed:`, err);
    return [];
  }
}

/** Fetch a single document by ID. Returns null on miss or error. */
export async function fetchDoc<T>(colName: string, docId: string): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, colName, docId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (err) {
    console.warn(`[Firestore] fetchDoc(${colName}/${docId}) failed:`, err);
    return null;
  }
}

/** Add a document to a collection. Returns the new doc ID or null. */
export async function addDocument(
  colName: string,
  data: DocumentData
): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, colName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn(`[Firestore] addDocument(${colName}) failed:`, err);
    return null;
  }
}

/** Set (upsert) a document at a specific path. */
export async function upsertDocument(
  colName: string,
  docId: string,
  data: DocumentData,
  merge = true
): Promise<void> {
  try {
    await setDoc(doc(db, colName, docId), data, { merge });
  } catch (err) {
    console.warn(`[Firestore] upsertDocument(${colName}/${docId}) failed:`, err);
  }
}

// ── NGO service ───────────────────────────────────────────────────────────────

export async function fetchNGOs(): Promise<DocumentData[]> {
  return fetchCollection(COL.NGOS);
}

export async function fetchNGOById(id: string): Promise<DocumentData | null> {
  return fetchDoc(COL.NGOS, id);
}

// ── Donation service ──────────────────────────────────────────────────────────

export interface DonationPayload {
  donorId?: string;
  donorName: string;
  donorPhone: string;
  ngoId: string;
  ngoName: string;
  foodType: string;
  quantity: string;
  pickupAddress: string;
  pickupTime: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed";
}

export async function createDonation(payload: DonationPayload): Promise<string | null> {
  return addDocument(COL.DONATIONS, payload);
}

// ── Karma service ─────────────────────────────────────────────────────────────

export interface KarmaDoc {
  userId: string;
  score: number;
  level: string;
  badges: string[];
  streak: number;
}

export async function fetchKarmaForUser(userId: string): Promise<KarmaDoc | null> {
  return fetchDoc<KarmaDoc>(COL.KARMA, userId);
}

export async function upsertKarma(userId: string, data: Partial<KarmaDoc>): Promise<void> {
  return upsertDocument(COL.KARMA, userId, data);
}

// ── Leaderboard service ───────────────────────────────────────────────────────

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  city: string;
  score: number;
  rank: number;
}

export async function fetchLeaderboard(top = 20): Promise<LeaderboardEntry[]> {
  return fetchCollection<LeaderboardEntry>(COL.LEADERBOARD, [
    orderBy("score", "desc"),
    limit(top),
  ]);
}

// ── Campaign service ──────────────────────────────────────────────────────────

export interface CampaignDoc {
  id: string;
  campaignName: string;
  campaignId: string;
  ngoName?: string;
  qrUrl: string;
  qrCodeUrl?: string;
  scanCount: number;
  title: string;
  story: string;
  city: string;
  goal: number;
  raised: number;
  creator: string;
  supporters: number;
  createdAt?: number;
}

export async function fetchCampaigns(): Promise<CampaignDoc[]> {
  return fetchCollection<CampaignDoc>(COL.CAMPAIGNS, [orderBy("createdAt", "desc"), limit(50)]);
}

export async function createCampaignDoc(
  slug: string,
  data: Omit<CampaignDoc, "id">
): Promise<void> {
  return upsertDocument(COL.CAMPAIGNS, slug, { ...data, id: slug });
}

export async function updateCampaignRaised(slug: string, raised: number, supporters: number): Promise<void> {
  return upsertDocument(COL.CAMPAIGNS, slug, { raised, supporters });
}

export async function incrementCampaignScan(slug: string): Promise<void> {
  return upsertDocument(COL.CAMPAIGNS, slug, { scanCount: increment(1) });
}

// ── Chat session service ──────────────────────────────────────────────────────

export interface ChatSession {
  userId: string;
  phone: string;
  messages: Array<{ role: "user" | "bot"; text: string; ts: number }>;
  updatedAt?: unknown; // server timestamp
}

export async function upsertChatSession(userId: string, data: Partial<ChatSession>): Promise<void> {
  return upsertDocument(COL.CHAT_SESSIONS, userId, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Seed helpers ──────────────────────────────────────────────────────────────

/** Returns true if a collection is empty (has no documents). */
export async function isCollectionEmpty(colName: string): Promise<boolean> {
  try {
    const snap = await getDocs(query(collection(db, colName), limit(1)));
    return snap.empty;
  } catch {
    return true;
  }
}
