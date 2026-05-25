/**
 * src/lib/use-firestore.ts
 *
 * Custom React hooks for reading Firestore data with mock-data fallbacks.
 * All hooks:
 *  - Start with mock data (instant render, no flash)
 *  - Replace with Firestore data when it loads
 *  - Fall back to mock data if Firestore returns nothing
 *  - Never throw — errors are logged and suppressed
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  fetchNGOs,
  fetchNGOById,
  fetchLeaderboard,
  fetchKarmaForUser,
  type KarmaDoc,
  type LeaderboardEntry,
  type CampaignDoc,
} from "./firestore-service";
import { db } from "./firebase";
import { COL } from "./firestore-service";
import { NGOS, type NGO } from "@/app/data/ngos";
import { LEADERBOARD_ROWS, TOTAL_KARMA, type LeaderboardRow } from "@/app/data/karma";
import { type PersonalCampaign } from "@/app/data/campaigns";
import { getUser } from "@/app/data/auth";

export type LiveDashboardStats = {
  conversations: number;
  pickupRequests: number;
  donations: number;
  ngos: number;
  karmaPoints: number;
  qrCampaigns: number;
  qrScans: number;
};

export type LiveActivityItem = {
  id: string;
  headline: string;
  detail: string;
  city: string;
  timeAgo: string;
  karma: number;
  timestampMs: number;
};

type FirestoreDoc = Record<string, unknown> & {
  timestamp?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  phone?: unknown;
  profileName?: unknown;
  message?: unknown;
  messageSid?: unknown;
  location?: unknown;
  city?: unknown;
  status?: unknown;
  state?: unknown;
  ngoName?: unknown;
  donorName?: unknown;
  donorPhone?: unknown;
  score?: unknown;
  karmaScore?: unknown;
  raised?: unknown;
  meals?: unknown;
};

const CITY_HINTS = [
  { city: "Mumbai", keywords: ["bandra", "andheri", "powai", "santacruz", "mumbai", "navi mumbai", "chembur", "parel"] },
  { city: "Bengaluru", keywords: ["bengaluru", "bangalore", "whitefield", "electronic city", "kr puram", "mysuru road", "hsr", "bellandur"] },
  { city: "Delhi NCR", keywords: ["noida", "ghaziabad", "gurgaon", "gurugram", "faridabad", "delhi", "dwarka", "saket", "east delhi", "south delhi"] },
  { city: "Pune", keywords: ["pune", "hadapsar", "pimpri", "kothrud", "yerwada", "wagholi"] },
  { city: "Chennai", keywords: ["chennai", "adyar", "t nagar", "annanagar", "anna nagar"] },
  { city: "Hyderabad", keywords: ["hyderabad", "hitech city", "jubilee hills", "gachibowli"] },
];

export function useLiveDashboardSummary() {
  const [chatSessions, setChatSessions] = useState<FirestoreDoc[]>([]);
  const [pickupRequests, setPickupRequests] = useState<FirestoreDoc[]>([]);
  const [donations, setDonations] = useState<FirestoreDoc[]>([]);
  const [ngos, setNgos] = useState<FirestoreDoc[]>([]);
  const [karmaDocs, setKarmaDocs] = useState<FirestoreDoc[]>([]);
  const [campaigns, setCampaigns] = useState<FirestoreDoc[]>([]);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(collection(db, COL.CHAT_SESSIONS), (snap) => setChatSessions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreDoc[])),
      onSnapshot(collection(db, COL.PICKUP_REQUESTS), (snap) => setPickupRequests(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreDoc[])),
      onSnapshot(collection(db, COL.DONATIONS), (snap) => setDonations(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreDoc[])),
      onSnapshot(collection(db, COL.NGOS), (snap) => setNgos(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreDoc[])),
      onSnapshot(collection(db, COL.KARMA), (snap) => setKarmaDocs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreDoc[])),
      onSnapshot(collection(db, COL.CAMPAIGNS), (snap) => setCampaigns(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreDoc[])),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const stats = useMemo<LiveDashboardStats>(() => ({
    conversations: chatSessions.length,
    pickupRequests: pickupRequests.length,
    donations: donations.length,
    ngos: ngos.length,
    karmaPoints: karmaDocs.reduce((sum, doc) => sum + toNumber(doc.score) + toNumber(doc.karmaScore), 0),
    qrCampaigns: campaigns.length,
    qrScans: campaigns.reduce((sum, doc) => sum + toNumber(doc.scanCount), 0),
  }), [chatSessions, pickupRequests, donations, ngos, karmaDocs, campaigns]);

  const feed = useMemo<LiveActivityItem[]>(() => buildActivityFeed(chatSessions, pickupRequests, donations), [chatSessions, pickupRequests, donations]);

  return { stats, feed };
}

// ── NGO list ──────────────────────────────────────────────────────────────────

export function useNGOs() {
  const [ngos, setNgos] = useState<NGO[]>(NGOS); // instant mock fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNGOs().then((docs) => {
      if (cancelled) return;
      if (docs.length > 0) {
        // Map Firestore docs to NGO shape — Firestore docs mirror mock shape
        setNgos(docs as NGO[]);
      }
      // If empty, keep mock data
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { ngos, loading };
}

// ── Single NGO ────────────────────────────────────────────────────────────────

export function useNGOById(id: string) {
  const mockNgo = NGOS.find((n) => n.id === id) ?? null;
  const [ngo, setNgo] = useState<NGO | null>(mockNgo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNGOById(id).then((doc) => {
      if (cancelled) return;
      if (doc) setNgo(doc as NGO);
      // else keep mock
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  return { ngo, loading };
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/**
 * Maps a Firestore LeaderboardEntry to the LeaderboardRow shape used by the UI.
 * The UI uses 'karma', 'badge', 'level' — we derive them from score.
 */
function fsToLeaderboardRow(entry: LeaderboardEntry, idx: number): LeaderboardRow {
  const score = entry.score ?? 0;
  const level = score >= 15000 ? "legend" : score >= 5000 ? "hero" : score >= 1500 ? "changemaker" : score >= 500 ? "helper" : "seed";
  const badge = level === "legend" ? "👑" : level === "hero" ? "🏆" : level === "changemaker" ? "❤️" : level === "helper" ? "🤝" : "🌱";
  return {
    rank: entry.rank ?? idx + 1,
    name: entry.name,
    city: entry.city,
    karma: score,
    badge,
    avatar: entry.avatar ?? entry.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
    level,
  };
}

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>(LEADERBOARD_ROWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(20).then((entries) => {
      if (cancelled) return;
      if (entries.length > 0) {
        setRows(entries.map(fsToLeaderboardRow));
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { rows, loading };
}

// ── Karma ─────────────────────────────────────────────────────────────────────

export function useKarmaScore() {
  const [score, setScore] = useState(TOTAL_KARMA);
  const [karmaDoc, setKarmaDoc] = useState<KarmaDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const user = getUser();
    if (!user) { setLoading(false); return; }

    fetchKarmaForUser(user.id).then((doc) => {
      if (cancelled) return;
      if (doc) {
        setKarmaDoc(doc);
        setScore(doc.score);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { score, karmaDoc, loading };
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

/** Maps a Firestore CampaignDoc to the PersonalCampaign shape used by the UI. */
function fsToCampaign(doc: CampaignDoc): PersonalCampaign {
  return {
    slug: doc.id,
    campaignId: doc.campaignId ?? doc.id,
    campaignName: doc.campaignName ?? doc.title,
    qrUrl: doc.qrUrl,
    scanCount: doc.scanCount ?? 0,
    title: doc.title,
    story: doc.story ?? "",
    goal: doc.goal,
    raised: doc.raised,
    creator: doc.creator,
    city: doc.city,
    karma: 0,
    createdAt: typeof doc.createdAt === "number" ? doc.createdAt : Date.now(),
    supporters: doc.supporters ?? 0,
  };
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<PersonalCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, COL.CAMPAIGNS), (snap) => {
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CampaignDoc));
      setCampaigns(docs.length > 0 ? docs.map(fsToCampaign).sort((a, b) => b.createdAt - a.createdAt) : []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { campaigns, loading };
}

function buildActivityFeed(
  chatSessions: FirestoreDoc[],
  pickupRequests: FirestoreDoc[],
  donations: FirestoreDoc[]
): LiveActivityItem[] {
  const items: LiveActivityItem[] = [];

  for (const session of chatSessions) {
    const phone = maskPhone(session.phone);
    const text = typeof session.message === "string" ? session.message.toLowerCase() : "";
    const state = typeof session.state === "string" ? session.state : "";
    const headline = text.includes("food") || text.includes("donate") || state === "awaiting_location"
      ? `New food donation request from ${phone}`
      : `New WhatsApp conversation from ${phone}`;

    items.push({
      id: `chat-${String(session.id)}`,
      headline,
      detail: typeof session.profileName === "string" && session.profileName.trim().length > 0 ? session.profileName : "WhatsApp conversation",
      city: inferCityFromText([session.location, session.message, session.profileName]),
      timeAgo: timeAgoFromDoc(session),
      karma: 0,
      timestampMs: toMillis(session.timestamp) ?? toMillis(session.createdAt) ?? toMillis(session.updatedAt) ?? 0,
    });
  }

  for (const request of pickupRequests) {
    const phone = maskPhone(request.phone);
    const location = typeof request.location === "string" ? request.location.trim() : "";
    const ngoName = typeof request.ngoName === "string" ? request.ngoName : "";
    const status = typeof request.status === "string" ? request.status.toLowerCase() : "";
    const city = inferCityFromText([location, ngoName]);
    const headline = status === "completed"
      ? "Pickup request completed"
      : ngoName
        ? `NGO matched in ${city}`
        : `Pickup request from ${phone}`;

    items.push({
      id: `pickup-${String(request.id)}`,
      headline,
      detail: location || ngoName || phone,
      city,
      timeAgo: timeAgoFromDoc(request),
      karma: status === "completed" ? 120 : 60,
      timestampMs: toMillis(request.timestamp) ?? toMillis(request.createdAt) ?? toMillis(request.updatedAt) ?? 0,
    });
  }

  for (const donation of donations) {
    const donor = typeof donation.donorName === "string" && donation.donorName.trim().length > 0
      ? donation.donorName.trim()
      : maskPhone(donation.donorPhone);
    const status = typeof donation.status === "string" ? donation.status.toLowerCase() : "";
    items.push({
      id: `donation-${String(donation.id)}`,
      headline: status === "completed" ? `Donation completed from ${donor}` : `Donation recorded from ${donor}`,
      detail: [donation.city, donation.ngoName].filter(Boolean).join(" · "),
      city: typeof donation.city === "string" ? donation.city : inferCityFromText([donation.ngoName, donation.donorName]),
      timeAgo: timeAgoFromDoc(donation),
      karma: toNumber(donation.raised) > 0 ? Math.max(40, Math.round(toNumber(donation.raised) / 1000)) : 80,
      timestampMs: toMillis(donation.timestamp) ?? toMillis(donation.createdAt) ?? toMillis(donation.updatedAt) ?? 0,
    });
  }

  return items
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .slice(0, 12);
}

function inferCityFromText(values: Array<unknown>): string {
  const combined = values.filter((value): value is string => typeof value === "string").join(" ").toLowerCase();
  const matched = CITY_HINTS.find((entry) => entry.keywords.some((keyword) => combined.includes(keyword)));
  return matched?.city ?? "India";
}

function maskPhone(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) return "unknown donor";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return value;
  return `+${digits.slice(0, 2)}xxxx${digits.slice(-2)}`;
}

function timeAgoFromDoc(doc: FirestoreDoc): string {
  const millis = toMillis(doc.timestamp) ?? toMillis(doc.createdAt) ?? toMillis(doc.updatedAt) ?? Date.now();
  const seconds = Math.max(0, Math.floor((Date.now() - millis) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toMillis(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "object" && value !== null && "toMillis" in value && typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return null;
}
