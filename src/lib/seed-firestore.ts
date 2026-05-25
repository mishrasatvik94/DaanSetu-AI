/**
 * src/lib/seed-firestore.ts
 *
 * Seeds Firestore collections with realistic Bharat-first sample data.
 * Only runs on the client-side, and only when a collection is empty.
 * Called once from RootClient on mount.
 */

"use client";

import { serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { COL, isCollectionEmpty, upsertDocument, addDocument } from "./firestore-service";
import { NGOS, QR_CAMPAIGNS } from "@/app/data/ngos";
import { campaignUrl } from "@/app/data/campaigns";

// ── Seed NGOs from existing rich mock data ────────────────────────────────────
async function seedNGOs() {
  if (!(await isCollectionEmpty(COL.NGOS))) return;
  for (const ngo of NGOS) {
    await upsertDocument(COL.NGOS, ngo.id, {
      ...ngo,
      acceptsFood: true,
      mealsDistributed: ngo.mealsServed,
      volunteers: Math.floor(80 + Math.random() * 200),
      impactScore: Math.floor(70 + Math.random() * 30),
      imageUrl: ngo.gallery[0]?.src ?? "",
      categories: [ngo.category],
    });
  }
}

// ── Seed leaderboard ──────────────────────────────────────────────────────────
async function seedLeaderboard() {
  if (!(await isCollectionEmpty(COL.LEADERBOARD))) return;
  const entries = [
    { userId: "u_aanya", name: "Aanya Kapoor", avatar: "AK", city: "Mumbai", score: 5460, rank: 1 },
    { userId: "u_rohan", name: "Rohan Verma", avatar: "RV", city: "Bengaluru", score: 4812, rank: 2 },
    { userId: "u_priya", name: "Priya Iyer", avatar: "PI", city: "Chennai", score: 4266, rank: 3 },
    { userId: "u_satvik", name: "Satvik Mishra", avatar: "SM", city: "Mumbai", score: 2350, rank: 4 },
    { userId: "u_kabir", name: "Kabir Singh", avatar: "KS", city: "Delhi NCR", score: 1164, rank: 5 },
    { userId: "u_meera", name: "Meera Joshi", avatar: "MJ", city: "Pune", score: 966, rank: 6 },
    { userId: "u_aditya", name: "Aditya Rao", avatar: "AR", city: "Hyderabad", score: 840, rank: 7 },
  ];
  for (const entry of entries) {
    await upsertDocument(COL.LEADERBOARD, entry.userId, entry);
  }
}

// ── Seed karma for demo user ──────────────────────────────────────────────────
async function seedKarma() {
  if (!(await isCollectionEmpty(COL.KARMA))) return;
  await upsertDocument(COL.KARMA, "u_satvik", {
    userId: "u_satvik",
    score: 2350,
    level: "Helper",
    badges: ["first-donation", "hundred-meals", "community-hero", "qr-fundraiser-creator", "ai-helper"],
    streak: 12,
  });
}

// ── Seed campaigns from existing mock data ────────────────────────────────────
async function seedCampaigns() {
  if (!(await isCollectionEmpty(COL.CAMPAIGNS))) return;
  // Seed from the existing QR_CAMPAIGNS array (featured drives)
  for (const c of QR_CAMPAIGNS) {
    await upsertDocument(COL.CAMPAIGNS, c.slug, {
      id: c.slug,
      title: c.title,
      story: `Support this campaign and help us reach our goal of ₹${c.goal.toLocaleString("en-IN")} for ${c.city}.`,
      city: c.city,
      goal: c.goal,
      raised: c.raised,
      creator: "DaanSetu Team",
      supporters: Math.floor(c.raised / 500),
      campaignName: c.title,
      campaignId: c.slug,
      qrUrl: campaignUrl(c.slug),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(campaignUrl(c.slug))}`,
      scanCount: 0,
      createdAt: serverTimestamp(),
    });
  }
  // Also seed 2 personal campaigns
  const personal = [
    {
      id: "aanya-1000-meals",
      title: "Aanya's 1,000 Meals Pledge",
      story: "For my 25th birthday, I'm skipping the party and pledging 1,000 meals to families in Dharavi. Every ₹50 = one full meal. Help me hit the goal in 14 days.",
      goal: 50000,
      raised: 34200,
      creator: "Aanya Kapoor",
      city: "Mumbai",
      supporters: 184,
      campaignName: "Aanya's 1,000 Meals Pledge",
      campaignId: "aanya-1000-meals",
      qrUrl: campaignUrl("aanya-1000-meals"),
      scanCount: 0,
      createdAt: serverTimestamp(),
    },
    {
      id: "rohan-monsoon-relief",
      title: "Rohan's Monsoon Kitchen",
      story: "Bengaluru's rains hit hardest where it hurts most. I'm raising for hot meals to displaced families across HSR and Bellandur shelters.",
      goal: 80000,
      raised: 41600,
      creator: "Rohan Verma",
      city: "Bengaluru",
      supporters: 122,
      campaignName: "Rohan's Monsoon Kitchen",
      campaignId: "rohan-monsoon-relief",
      qrUrl: campaignUrl("rohan-monsoon-relief"),
      scanCount: 0,
      createdAt: serverTimestamp(),
    },
  ];
  for (const c of personal) {
    await upsertDocument(COL.CAMPAIGNS, c.id, c);
  }
}

// ── Main seed entry point ─────────────────────────────────────────────────────
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await Promise.allSettled([
      seedNGOs(),
      seedLeaderboard(),
      seedKarma(),
      seedCampaigns(),
    ]);
  } catch (err) {
    console.warn("[Firestore seed] Error during seeding:", err);
  }
}
