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
    { userId: "u_divya", name: "Divya Sharma", avatar: "DS", city: "Delhi NCR", score: 720, rank: 8 },
    { userId: "u_rahul", name: "Rahul Nair", avatar: "RN", city: "Chennai", score: 620, rank: 9 },
    { userId: "u_pooja", name: "Pooja Gupta", avatar: "PG", city: "Bengaluru", score: 540, rank: 10 },
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

  // Seed all QR campaigns (12 campaigns)
  for (const c of QR_CAMPAIGNS) {
    const slug = c.slug;
    const campaignLink = campaignUrl(slug);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(campaignLink)}`;

    await upsertDocument(COL.CAMPAIGNS, slug, {
      id: slug,
      slug,
      title: c.title,
      story: (c as { story?: string }).story ?? `Support this campaign and help us reach our goal of ₹${c.goal.toLocaleString("en-IN")} for ${c.city}.`,
      city: c.city,
      goal: c.goal,
      raised: c.raised,
      creator: getCampaignCreator(slug),
      ngoName: getCampaignNGO(slug),
      supporters: Math.floor(c.raised / 450),
      campaignName: c.title,
      campaignId: slug,
      qrUrl: campaignLink,
      qrCodeUrl,
      scanCount: Math.floor(c.raised / 800),
      trustScore: Math.floor(78 + Math.random() * 18),
      verified: true,
      urgency: getCampaignUrgency(c.raised, c.goal),
      beneficiaryCount: Math.floor(c.goal / 75),
      daysRemaining: c.days,
      createdAt: serverTimestamp(),
    });
  }
}

function getCampaignCreator(slug: string): string {
  const map: Record<string, string> = {
    "aanya-1000-meals": "Aanya Kapoor",
    "rohan-monsoon-relief": "Rohan Verma",
    "republic-day": "DaanSetu Team",
    "migrant-workers-noida": "Priya Iyer",
    "school-kits-delhi-slums": "Teach For India",
    "medical-aid-jaipur": "CARE India Volunteers",
    "emergency-rations-gurgaon": "Goonj Delhi NCR",
    "mumbai-daily-wage-kitchen": "Robin Hood Army",
    "elderly-meals-lucknow": "HelpAge India",
    "menstrual-hygiene-kits": "Smile Foundation",
    "flood-relief-assam": "Give India Foundation",
    "street-animal-feeding": "Mumbai Pet Welfare",
    "campus-feeds": "Bhumi",
  };
  return map[slug] ?? "DaanSetu Community";
}

function getCampaignNGO(slug: string): string {
  const map: Record<string, string> = {
    "aanya-1000-meals": "DaanSetu Verified NGO",
    "rohan-monsoon-relief": "Feeding India",
    "republic-day": "Pan-India NGO Network",
    "migrant-workers-noida": "Goonj",
    "school-kits-delhi-slums": "Deepalaya",
    "medical-aid-jaipur": "CARE India",
    "emergency-rations-gurgaon": "Goonj NCR",
    "mumbai-daily-wage-kitchen": "Robin Hood Army",
    "elderly-meals-lucknow": "HelpAge India",
    "menstrual-hygiene-kits": "Smile Foundation",
    "flood-relief-assam": "GiveIndia Foundation",
    "street-animal-feeding": "DaanSetu Community",
    "campus-feeds": "Akshaya Patra",
  };
  return map[slug] ?? "DaanSetu Verified NGO";
}

function getCampaignUrgency(raised: number, goal: number): string {
  const pct = raised / goal;
  if (pct < 0.4) return "high";
  if (pct < 0.7) return "medium";
  return "low";
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
