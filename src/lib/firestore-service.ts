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
  NEEDS: "needs",
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

// Need service

export type NeedCategory = "Food" | "Clothes" | "Education" | "Medical" | "Emergency";
export type NeedUrgency = "Low" | "Medium" | "High";

export interface NeedDoc {
  id: string;
  title: string;
  category: NeedCategory;
  location: string;
  quantity: string;
  urgency: NeedUrgency;
  description: string;
  ngoName: string;
  verified?: boolean;
  trustScore?: number;
  fulfilled?: boolean;
  createdAt?: unknown;
}

export type NeedInput = Omit<NeedDoc, "id" | "createdAt">;

export async function addNeed(payload: NeedInput): Promise<string | null> {
  return addDocument(COL.NEEDS, {
    ...payload,
    verified: payload.verified ?? true,
    trustScore: payload.trustScore ?? 86,
    fulfilled: payload.fulfilled ?? false,
  });
}

export async function getNeeds(): Promise<NeedDoc[]> {
  return fetchCollection<NeedDoc>(COL.NEEDS, [orderBy("createdAt", "desc"), limit(50)]);
}

export async function getUrgentNeeds(): Promise<NeedDoc[]> {
  const needs = await getNeeds();
  return needs.filter((need) => need.urgency === "High");
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

export interface CampaignUpdate {
  date: string;
  text: string;
}

export interface CampaignDoc {
  id: string;
  /** URL-safe campaign slug (equals doc ID) */
  slug?: string;
  campaignName: string;
  campaignId: string;
  ngoName?: string;
  qrUrl: string;
  qrCodeUrl?: string;
  scanCount: number;
  title: string;
  /** Alias for title used in older documents */
  description?: string;
  story: string;
  city: string;
  goal: number;
  raised: number;
  creator: string;
  supporters: number;
  donorCount?: number;
  /** 0–100 trust score shown in UI */
  trustScore?: number;
  /** Whether campaign has been manually verified */
  verified?: boolean;
  /** Urgency level: high | medium | low */
  urgency?: "high" | "medium" | "low";
  /** Image URL of the beneficiary or campaign */
  beneficiaryImage?: string;
  /** Timeline updates for the campaign */
  updates?: CampaignUpdate[];
  createdAt?: number;
}

/** Safe accessor — fills every optional field with sane defaults. */
export function normalizeCampaignDoc(raw: Partial<CampaignDoc> & { id: string }): CampaignDoc {
  return {
    id: raw.id,
    slug: raw.slug ?? raw.id,
    campaignName: raw.campaignName ?? raw.title ?? "Untitled Campaign",
    campaignId: raw.campaignId ?? raw.id,
    ngoName: raw.ngoName ?? "DaanSetu Verified NGO",
    qrUrl: raw.qrUrl ?? "",
    qrCodeUrl: raw.qrCodeUrl,
    scanCount: raw.scanCount ?? 0,
    title: raw.title ?? raw.campaignName ?? "Untitled Campaign",
    description: raw.description ?? raw.story ?? "",
    story: raw.story ?? raw.description ?? "Support this verified campaign.",
    city: raw.city ?? "India",
    goal: raw.goal ?? 0,
    raised: raw.raised ?? 0,
    creator: raw.creator ?? "Anonymous",
    supporters: raw.supporters ?? raw.donorCount ?? 0,
    donorCount: raw.donorCount ?? raw.supporters ?? 0,
    trustScore: raw.trustScore ?? 82,
    verified: raw.verified ?? true,
    urgency: raw.urgency ?? "medium",
    beneficiaryImage: raw.beneficiaryImage,
    updates: raw.updates ?? [],
    createdAt: raw.createdAt ?? Date.now(),
  };
}

export async function fetchCampaigns(): Promise<CampaignDoc[]> {
  const docs = await fetchCollection<CampaignDoc>(COL.CAMPAIGNS, [orderBy("createdAt", "desc"), limit(50)]);
  return docs.map((d) => normalizeCampaignDoc(d));
}

export async function fetchCampaignBySlug(slug: string): Promise<CampaignDoc | null> {
  const doc = await fetchDoc<CampaignDoc>(COL.CAMPAIGNS, slug);
  if (!doc) return null;
  return normalizeCampaignDoc(doc);
}

export async function createCampaignDoc(
  slug: string,
  data: Omit<CampaignDoc, "id">
): Promise<void> {
  return upsertDocument(COL.CAMPAIGNS, slug, { ...data, id: slug, slug });
}

export async function updateCampaignRaised(slug: string, raised: number, supporters: number): Promise<void> {
  return upsertDocument(COL.CAMPAIGNS, slug, { raised, supporters, donorCount: supporters });
}

export async function updateCampaignDonation(slug: string, amount: number): Promise<void> {
  return upsertDocument(COL.CAMPAIGNS, slug, {
    raised: increment(amount),
    supporters: increment(1),
    donorCount: increment(1),
  });
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
    const snap = await getDocs(query(collection(db, colName), limit(2)));
    if (snap.empty) return true;
    return !snap.docs.some((d) => d.id !== "_meta");
  } catch {
    return true;
  }
}
