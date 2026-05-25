import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { serverDb } from "@/lib/firebase-server";
import { COL } from "@/lib/firestore-service";
import { NGOS } from "@/app/data/ngos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Constants ─────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://daan-setu-mu.vercel.app";
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? "mishrasatvik94@okicici";

const MESSAGES = {
  WELCOME: [
    "🙏 Namaste! Welcome to *DaanSetu* — India's trusted donation platform.",
    "",
    "I can help you:",
    "• *donate* — Find verified campaigns to donate to",
    "• *food* — Donate food to hungry families",
    "• *education* — Support children's education",
    "• *medical* — Fund medical emergencies",
    "• *help* — See all options",
    "",
    "What would you like to do today? Just type a keyword 👆",
  ].join("\n"),

  HELP: [
    "🌿 *DaanSetu — Verified Giving Platform*",
    "",
    "Reply with:",
    "1️⃣ *donate* — Browse verified campaigns",
    "2️⃣ *food* — Donate food / meals",
    "3️⃣ *education* — Support child education",
    "4️⃣ *medical* — Fund medical emergencies",
    "5️⃣ *location* — Donate food in your city",
    "",
    "All donations go through verified NGOs with 80G receipts ✅",
  ].join("\n"),

  FOOD_PROMPT: [
    "❤️ Thank you for wanting to donate food!",
    "",
    "Please share your *city or pickup location*",
    "(e.g., Bandra Mumbai, Koramangala Bengaluru)",
  ].join("\n"),

  AMOUNT_PROMPT: [
    "💰 Great choice! How much would you like to donate?",
    "",
    "Reply with:",
    "• *100* — ₹100 (2 meals)",
    "• *500* — ₹500 (10 meals)",
    "• *1000* — ₹1000 (20 meals)",
    "• Or type any custom amount",
  ].join("\n"),

  REQUEST_CREATED: "✅ Your food donation request is created! A nearby verified NGO will contact you within 2 hours.",
};

// Chatbot flow states
type BotState =
  | "idle"
  | "awaiting_location"
  | "awaiting_campaign_selection"
  | "awaiting_amount";

// Intent detection keywords
const INTENT_KEYWORDS: Record<string, string[]> = {
  donate: ["donate", "help", "give", "contribute", "daan"],
  food: ["food", "meal", "khana", "bhoj", "leftover", "surplus", "cooked"],
  education: ["education", "school", "child", "study", "siksha", "padhna"],
  medical: ["medical", "hospital", "medicine", "health", "doctor", "bimaar"],
  amount: ["100", "200", "500", "1000", "2000", "5000"],
};

function detectIntent(message: string): string | null {
  const lower = message.toLowerCase().trim();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return null;
}

// ── Firestore campaign fetcher ─────────────────────────────────────────────────
async function getVerifiedCampaigns(category?: string): Promise<Array<{ id: string; title: string; raised: number; goal: number; slug: string }>> {
  try {
    const { getDocs, query, orderBy, limit, collection: fsCollection, where } = await import("firebase/firestore");
    const col = fsCollection(serverDb, COL.CAMPAIGNS);
    const q = query(col, orderBy("createdAt", "desc"), limit(5));
    const snap = await getDocs(q);
    const campaigns = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
    return campaigns.map((c) => ({
      id: String(c.id ?? ""),
      title: String((c as Record<string, unknown>).title ?? (c as Record<string, unknown>).campaignName ?? "Campaign"),
      raised: Number((c as Record<string, unknown>).raised ?? 0),
      goal: Number((c as Record<string, unknown>).goal ?? 0),
      slug: String(c.id ?? ""),
    })).slice(0, 3);
  } catch {
    // Fallback static campaigns
    return [
      { id: "aanya-1000-meals", title: "Aanya's 1,000 Meals Pledge", raised: 34200, goal: 50000, slug: "aanya-1000-meals" },
      { id: "rohan-monsoon-relief", title: "Rohan's Monsoon Kitchen", raised: 41600, goal: 80000, slug: "rohan-monsoon-relief" },
      { id: "republic-day", title: "Republic Day Daan Drive", raised: 188400, goal: 250000, slug: "republic-day" },
    ];
  }
}

function buildCampaignListMessage(campaigns: Array<{ id: string; title: string; raised: number; goal: number; slug: string }>, header: string): string {
  const lines = [header, ""];
  campaigns.forEach((c, i) => {
    const pct = Math.min(100, Math.round((c.raised / (c.goal || 1)) * 100));
    lines.push(`${i + 1}️⃣ *${c.title}*`);
    lines.push(`   ₹${c.raised.toLocaleString("en-IN")} raised (${pct}% of ₹${c.goal.toLocaleString("en-IN")})`);
    lines.push(`   🔗 ${APP_URL}/campaign/${c.slug}`);
    lines.push("");
  });
  lines.push("Reply *1*, *2*, or *3* to donate — or type an amount like *500*");
  return lines.join("\n");
}

function buildDonationMessage(campaign: { title: string; slug: string }, amount: number): string {
  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("DaanSetu")}&am=${amount}&cu=INR&tn=${encodeURIComponent(campaign.title.slice(0, 50))}`;
  return [
    `🎉 Thank you for choosing to donate ₹${amount.toLocaleString("en-IN")}!`,
    "",
    `*Campaign:* ${campaign.title}`,
    "",
    `📲 *Pay via UPI:*`,
    upiLink,
    "",
    `🌐 *Campaign Page:*`,
    `${APP_URL}/campaign/${campaign.slug}`,
    "",
    `💡 Scan the QR on the campaign page to pay instantly!`,
    "",
    `✅ You'll receive an 80G tax receipt after donation.`,
    `Thank you for your kindness! 🙏`,
  ].join("\n");
}

// ── Main webhook handler ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const params = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    params.set(key, String(value));
  }

  if (!isValidTwilioRequest(request, params)) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const phone = params.get("From") ?? "";
  const profileName = params.get("ProfileName") ?? "";
  const message = params.get("Body") ?? "";
  const messageSid = params.get("MessageSid") ?? crypto.randomUUID();
  const normalized = message.trim().toLowerCase();

  const sessionId = phone || messageSid;
  const sessionRef = doc(serverDb, COL.CHAT_SESSIONS, sessionId);
  let sessionData: Record<string, unknown> | null = null;

  try {
    const snap = await getDoc(sessionRef);
    sessionData = snap.exists() ? (snap.data() as Record<string, unknown>) : null;
  } catch {
    sessionData = null;
  }

  const state: BotState = (typeof sessionData?.state === "string" ? sessionData.state : "idle") as BotState;
  const pendingCampaigns = (sessionData?.pendingCampaigns as Array<{ id: string; title: string; raised: number; goal: number; slug: string }> | undefined) ?? [];

  async function reply(text: string, newState: BotState = "idle", extras: Record<string, unknown> = {}) {
    try {
      await setDoc(
        sessionRef,
        {
          phone,
          profileName,
          message,
          messageSid,
          timestamp: serverTimestamp(),
          source: "whatsapp",
          state: newState,
          ...extras,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("[Webhook] Failed to update session:", err);
    }
    return new NextResponse(buildTwiML(text), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  // ── State: awaiting_location (food donation flow) ─────────────────────────
  if (state === "awaiting_location") {
    const location = message.trim();
    const matchedNgo = matchNgoByLocation(location);

    try {
      await addDoc(collection(serverDb, COL.PICKUP_REQUESTS), {
        phone,
        location,
        status: "pending",
        timestamp: serverTimestamp(),
        source: "whatsapp",
        ngoName: matchedNgo?.name ?? null,
        ngoId: matchedNgo?.id ?? null,
      });
    } catch (err) {
      console.warn("[Webhook] Failed to create pickup request:", err);
    }

    const confirmation = matchedNgo
      ? [
          MESSAGES.REQUEST_CREATED,
          "",
          `🏢 *Matched NGO:* ${matchedNgo.name}`,
          `📍 *Service area:* ${matchedNgo.city}`,
          `⏱️ *Response time:* ${matchedNgo.responseTime}`,
          "",
          `You can also donate online: ${APP_URL}/qr-campaign`,
        ].join("\n")
      : MESSAGES.REQUEST_CREATED;

    return reply(confirmation, "idle");
  }

  // ── State: awaiting_campaign_selection ────────────────────────────────────
  if (state === "awaiting_campaign_selection" && pendingCampaigns.length > 0) {
    const choice = parseInt(normalized, 10);
    if (!isNaN(choice) && choice >= 1 && choice <= pendingCampaigns.length) {
      const selected = pendingCampaigns[choice - 1];
      const amountMatch = normalized.match(/\d+/);
      if (amountMatch) {
        const amt = parseInt(amountMatch[0], 10);
        return reply(buildDonationMessage(selected, amt), "idle", { selectedCampaign: selected });
      }
      return reply(MESSAGES.AMOUNT_PROMPT, "awaiting_amount", { selectedCampaign: selected });
    }

    // Check if they typed an amount directly
    const numericAmount = parseInt(normalized.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numericAmount) && numericAmount >= 10) {
      const selected = pendingCampaigns[0];
      return reply(buildDonationMessage(selected, numericAmount), "idle");
    }
  }

  // ── State: awaiting_amount ────────────────────────────────────────────────
  if (state === "awaiting_amount") {
    const selectedCampaign = sessionData?.selectedCampaign as { title: string; slug: string } | undefined;
    const numericAmount = parseInt(normalized.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numericAmount) && numericAmount >= 10 && selectedCampaign) {
      return reply(buildDonationMessage(selectedCampaign, numericAmount), "idle");
    }
    return reply("Please reply with a valid amount (e.g., *500*)", "awaiting_amount");
  }

  // ── Intent detection (any state) ──────────────────────────────────────────
  const intent = detectIntent(normalized);

  if (intent === "food") {
    return reply(MESSAGES.FOOD_PROMPT, "awaiting_location");
  }

  if (intent === "donate" || intent === "education" || intent === "medical" || normalized === "help") {
    const headerMap: Record<string, string> = {
      donate: "🎁 *Verified DaanSetu Campaigns:*",
      education: "📚 *Education Campaigns for Children:*",
      medical: "🏥 *Medical Emergency Campaigns:*",
      help: "🎁 *Active DaanSetu Campaigns:*",
    };
    const safeIntent = intent ?? "donate";
    const campaigns = await getVerifiedCampaigns(safeIntent);
    const header = headerMap[safeIntent] ?? "🎁 *Active Campaigns:*";
    const campaignMsg = buildCampaignListMessage(campaigns, header);
    return reply(campaignMsg, "awaiting_campaign_selection", { pendingCampaigns: campaigns });
  }

  // ── Numeric selection from a previous list ────────────────────────────────
  if (pendingCampaigns.length > 0) {
    const choice = parseInt(normalized, 10);
    if (!isNaN(choice) && choice >= 1 && choice <= pendingCampaigns.length) {
      const selected = pendingCampaigns[choice - 1];
      return reply(MESSAGES.AMOUNT_PROMPT, "awaiting_amount", { selectedCampaign: selected });
    }
  }

  // ── Default: welcome ──────────────────────────────────────────────────────
  return reply(MESSAGES.WELCOME, "idle");
}

export async function GET() {
  return new NextResponse("DaanSetu WhatsApp webhook is alive ✅", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// ── Twilio validation ──────────────────────────────────────────────────────────

function isValidTwilioRequest(request: Request, params: URLSearchParams): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // If no auth token configured, allow all (dev/demo mode)
  if (!authToken) return true;

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return false;

  // Use production URL for signature validation
  const webhookUrl = `${APP_URL}/api/whatsapp/webhook`;

  try {
    const expected = crypto
      .createHmac("sha1", authToken)
      .update(buildTwilioSignaturePayload(webhookUrl, params))
      .digest("base64");
    return timingSafeEqual(signature, expected);
  } catch {
    return false;
  }
}

function buildTwilioSignaturePayload(url: string, params: URLSearchParams): string {
  const keys = Array.from(params.keys()).sort();
  return keys.reduce((payload, key) => payload + key + (params.get(key) ?? ""), url);
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

// ── NGO location matcher ───────────────────────────────────────────────────────

function matchNgoByLocation(location: string) {
  const normalized = location.toLowerCase();
  const cityHints: Array<{ keywords: string[]; city: string }> = [
    { keywords: ["bandra", "andheri", "powai", "mumbai", "navi mumbai", "santacruz", "chembur", "parel"], city: "Mumbai" },
    { keywords: ["bengaluru", "bangalore", "whitefield", "electronic city", "kr puram", "mysuru road", "hsr", "bellandur", "koramangala"], city: "Bengaluru" },
    { keywords: ["noida", "ghaziabad", "gurugram", "gurgaon", "faridabad", "delhi", "east delhi", "south delhi", "dwarka", "saket"], city: "Delhi NCR" },
    { keywords: ["pune", "hadapsar", "pimpri", "kothrud", "yerwada", "wagholi"], city: "Pune" },
    { keywords: ["chennai", "adyar", "t nagar", "annanagar", "anna nagar", "velachery"], city: "Chennai" },
    { keywords: ["hyderabad", "hitech city", "jubilee hills", "gachibowli", "secunderabad"], city: "Hyderabad" },
  ];

  const matchedCity = cityHints.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matchedCity) {
    const ngo = NGOS.find((entry) => entry.city.toLowerCase() === matchedCity.city.toLowerCase());
    if (ngo) return ngo;
  }

  const serviceAreaMatch = NGOS.find((ngo) =>
    ngo.serviceAreas.some((area) => normalized.includes(area.toLowerCase()))
  );

  return serviceAreaMatch ?? NGOS.find((ngo) => ngo.city === "Mumbai") ?? NGOS[0];
}

// ── TwiML builder ──────────────────────────────────────────────────────────────

function buildTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${escapeXml(message)}</Message>\n</Response>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
