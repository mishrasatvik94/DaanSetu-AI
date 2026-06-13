import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";

import { serverDb } from "@/lib/firebase-server";
import { COL } from "@/lib/firestore-service";
import { NGOS } from "@/app/data/ngos";
import { DAANSETU_SYSTEM_CONTEXT, generateGeminiResponse, type GeminiMessage } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://daan-setu-mu.vercel.app").replace(/\/$/, "");
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? "mishrasatvik94@okicici";
const TWILIO_REPLY_LIMIT = 1500;

type BotState = "idle" | "awaiting_location" | "awaiting_food_details" | "awaiting_campaign_selection" | "awaiting_amount";
type Intent = "food" | "donate" | "help" | "track" | "clothes" | "education" | "medical" | "ngo" | "campaign" | "qr" | "payment" | null;
type SessionMessage = { role: "user" | "model"; text: string; ts: number };

type CampaignSummary = {
  id: string;
  title: string;
  raised: number;
  goal: number;
  slug: string;
  city?: string;
  trustScore?: number;
  verified?: boolean;
};

type NgoSummary = {
  id: string;
  name: string;
  city: string;
  category: string;
  mealsServed: number;
  responseTime: string;
  serviceAreas: string[];
  verified: boolean;
};

const INTENT_ORDER: Array<{ intent: Exclude<Intent, null>; keywords: string[] }> = [
  { intent: "food", keywords: ["food", "meal", "leftover", "surplus", "khana", "bhoj", "cooked", "extra food"] },
  { intent: "campaign", keywords: ["campaign", "show campaigns", "active campaigns", "fundraiser", "fund raising"] },
  { intent: "ngo", keywords: ["ngo", "verified ngo", "charity", "organization", "organisation"] },
  { intent: "clothes", keywords: ["clothes", "clothing", "blanket", "winter wear", "garments"] },
  { intent: "education", keywords: ["education", "school", "child", "study", "books", "siksha"] },
  { intent: "medical", keywords: ["medical", "hospital", "medicine", "health", "doctor"] },
  { intent: "qr", keywords: ["qr", "scan", "barcode"] },
  { intent: "payment", keywords: ["upi", "payment", "pay", "donation link"] },
  { intent: "track", keywords: ["track", "status", "receipt", "confirm", "pickup", "schedule", "eta"] },
  { intent: "donate", keywords: ["donate", "help", "give", "contribute", "daan"] },
  { intent: "help", keywords: ["help", "how to donate", "what can i do", "options"] },
];

const CITY_HINTS: Array<{ city: string; keywords: string[] }> = [
  { city: "Mumbai", keywords: ["bandra", "andheri", "powai", "mumbai", "navi mumbai", "santacruz", "chembur", "parel"] },
  { city: "Bengaluru", keywords: ["bengaluru", "bangalore", "whitefield", "electronic city", "kr puram", "hsr", "bellandur", "koramangala"] },
  { city: "Delhi NCR", keywords: ["noida", "ghaziabad", "gurugram", "gurgaon", "faridabad", "delhi", "dwarka", "saket"] },
  { city: "Pune", keywords: ["pune", "hadapsar", "pimpri", "kothrud", "yerwada", "wagholi"] },
  { city: "Chennai", keywords: ["chennai", "adyar", "t nagar", "annanagar", "anna nagar", "velachery"] },
  { city: "Hyderabad", keywords: ["hyderabad", "hitech city", "jubilee hills", "gachibowli", "secunderabad"] },
];

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

  if (process.env.NODE_ENV !== "production") {
    console.log("[Webhook] Incoming WhatsApp message:", {
      phone: maskPhone(phone),
      profileName,
      messageSid,
      bodyLength: message.length,
    });
  }

  try {

  const sessionSnap = await getDoc(sessionRef).catch(() => null);
  const sessionData = sessionSnap?.exists() ? (sessionSnap.data() as Record<string, unknown>) : null;
  const state = normalizeState(sessionData?.state);
  const pendingCampaigns = normalizeCampaigns(sessionData?.pendingCampaigns);
  const selectedCampaign = normalizeCampaign(sessionData?.selectedCampaign);
  const storedHistory = normalizeHistory(sessionData?.messages);
  const userHistory = toGeminiHistory(storedHistory);
  let intent = detectIntent(normalized);

  // Dynamic numeric and menu routing in idle state
  if (state === "idle" || !state) {
    if (normalized === "1" || normalized === "donate" || normalized === "donate now") {
      intent = "donate";
    } else if (normalized === "2" || normalized === "ngo" || normalized === "ngos") {
      intent = "ngo";
    } else if (normalized === "3" || normalized === "impact" || normalized === "community plate") {
      intent = "campaign";
    } else if (normalized === "4" || normalized === "track" || normalized === "pickup") {
      intent = "track";
    } else if (normalized === "5" || normalized === "help" || normalized === "ai help") {
      intent = "help";
    }
  }

  const persistSession = async (aiResponse: string, nextState: BotState, extras: Record<string, unknown> = {}) => {
    const nextHistory = [
      ...storedHistory,
      { role: "user", text: message, ts: Date.now() },
      { role: "model", text: aiResponse, ts: Date.now() },
    ].slice(-12);

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
          aiResponse,
          state: nextState,
          messages: nextHistory,
          lastIntent: intent,
          ...extras,
        },
        { merge: true }
      );
    } catch (error) {
      console.warn("[Webhook] Failed to persist chat session:", error);
    }
  };

  const respond = async (aiResponse: string, nextState: BotState, extras: Record<string, unknown> = {}) => {
    let slug = "aanya-1000-meals";
    if (extras.selectedCampaign && typeof extras.selectedCampaign === "object") {
      slug = (extras.selectedCampaign as { slug?: string }).slug ?? slug;
    } else if (extras.pendingCampaigns && Array.isArray(extras.pendingCampaigns) && extras.pendingCampaigns.length > 0) {
      slug = (extras.pendingCampaigns[0] as { slug?: string }).slug ?? slug;
    } else if (pendingCampaigns.length > 0) {
      slug = pendingCampaigns[0].slug;
    }

    const formattedResponse = formatWhatsAppResponse(aiResponse, nextState, slug);
    const text = sanitizeReply(formattedResponse);
    await persistSession(text, nextState, extras);
    return twimlResponse(text);
  };

  if (state === "awaiting_campaign_selection" && pendingCampaigns.length > 0) {
    const choice = parseInt(normalized, 10);
    if (!Number.isNaN(choice) && choice >= 1 && choice <= pendingCampaigns.length) {
      const selected = pendingCampaigns[choice - 1];
      const amountMatch = normalized.match(/\d+/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[0], 10);
        return respond(buildDonationMessage(selected, amount), "idle", { selectedCampaign: selected });
      }
      return respond(await generateCampaignAmountPrompt(selected, userHistory), "awaiting_amount", { selectedCampaign: selected });
    }

    const numericAmount = parseInt(normalized.replace(/[^0-9]/g, ""), 10);
    if (!Number.isNaN(numericAmount) && numericAmount >= 10) {
      const selected = pendingCampaigns[0];
      return respond(buildDonationMessage(selected, numericAmount), "idle", { selectedCampaign: selected });
    }
  }

  if (state === "awaiting_amount") {
    const numericAmount = parseInt(normalized.replace(/[^0-9]/g, ""), 10);
    if (!Number.isNaN(numericAmount) && numericAmount >= 10 && selectedCampaign) {
      return respond(buildDonationMessage(selectedCampaign, numericAmount), "idle");
    }
    return respond("Please reply with a valid amount like 500 or 1000.", "awaiting_amount", { selectedCampaign });
  }

  if ((state === "awaiting_location" || state === "awaiting_food_details") && intent === "food") {
    const locationInfo = extractLocationInfo(message);
    const pickupRequestId = await createPickupRequest({
      phone,
      profileName,
      message,
      messageSid,
      location: locationInfo.locationLabel,
      ngo: locationInfo.matchedNgo,
      status: "pending",
      note: sessionData?.pickupNote ? String(sessionData.pickupNote) : undefined,
    });

    const aiResponse = await generateGeminiResponse(
      message,
      buildFoodContext({
        intent: "food",
        locationInfo,
        campaignSummaries: [],
        ngoSummaries: [locationInfo.matchedNgo].filter(Boolean) as NgoSummary[],
        impactSummary: [],
        pickupRequestId,
      }),
      userHistory
    );

    return respond(aiResponse.text, locationInfo.locationLabel ? "awaiting_food_details" : "awaiting_location", {
      pickupRequestId,
      pickupLocation: locationInfo.locationLabel,
      suggestedNgo: locationInfo.matchedNgo ?? null,
    });
  }

  if (intent === "food") {
    const locationInfo = extractLocationInfo(message);
    if (!locationInfo.locationLabel) {
      const aiResponse = await generateGeminiResponse(
        message,
        buildFoodContext({
          intent: "food",
          locationInfo,
          campaignSummaries: [],
          ngoSummaries: [],
          impactSummary: [],
        }),
        userHistory
      );

      return respond(aiResponse.text, "awaiting_location", { lastIntent: "food" });
    }

    const pickupRequestId = await createPickupRequest({
      phone,
      profileName,
      message,
      messageSid,
      location: locationInfo.locationLabel,
      ngo: locationInfo.matchedNgo,
      status: "pending",
    });

    const aiResponse = await generateGeminiResponse(
      message,
      buildFoodContext({
        intent: "food",
        locationInfo,
        campaignSummaries: [],
        ngoSummaries: [locationInfo.matchedNgo].filter(Boolean) as NgoSummary[],
        impactSummary: [],
        pickupRequestId,
      }),
      userHistory
    );

    return respond(aiResponse.text, "awaiting_food_details", {
      pickupRequestId,
      pickupLocation: locationInfo.locationLabel,
      suggestedNgo: locationInfo.matchedNgo ?? null,
    });
  }

  if (intent === "donate" || intent === "campaign" || intent === "help" || intent === "track" || intent === "ngo" || intent === "education" || intent === "medical" || intent === "qr" || intent === "payment" || intent === "clothes") {
    const context = await buildPlatformContext({
      message,
      intent,
      phone,
      profileName,
    });

    if (intent === "campaign" || intent === "donate") {
      const campaignResponse = await generateGeminiResponse(message, context.text, userHistory);
      const campaignState = context.campaignSummaries.length > 0 ? "awaiting_campaign_selection" : "idle";
      return respond(campaignResponse.text, campaignState, {
        pendingCampaigns: context.campaignSummaries,
        contextMode: context.contextMode,
      });
    }

    const aiResponse = await generateGeminiResponse(message, context.text, userHistory);
    return respond(aiResponse.text, "idle", {
      contextMode: context.contextMode,
      suggestedNgo: context.matchedNgo ?? null,
    });
  }

  const generalContext = await buildPlatformContext({
    message,
    intent,
    phone,
    profileName,
  });

  const aiResponse = await generateGeminiResponse(message, generalContext.text, userHistory);
  return respond(aiResponse.text, "idle", {
    contextMode: generalContext.contextMode,
  });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Webhook] Gemini failed — returning TwiML fallback:", errMsg);
    return twimlResponse(
      "Namaste 🙏 DaanSetu AI is temporarily busy. Please try again shortly."
    );
  }
}

export async function GET() {
  return new NextResponse("DaanSetu WhatsApp webhook is alive ✅", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function normalizeState(value: unknown): BotState {
  if (value === "awaiting_location" || value === "awaiting_food_details" || value === "awaiting_campaign_selection" || value === "awaiting_amount") {
    return value;
  }
  return "idle";
}

function normalizeCampaign(value: unknown): { title: string; slug: string } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title : typeof record.campaignName === "string" ? record.campaignName : "Campaign";
  const slug = typeof record.slug === "string" ? record.slug : typeof record.campaignId === "string" ? record.campaignId : "";
  if (!slug) return null;
  return { title, slug };
}

function normalizeCampaigns(value: unknown): Array<{ title: string; slug: string; raised?: number; goal?: number }> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeCampaign(item)).filter((item): item is { title: string; slug: string } => Boolean(item)).slice(0, 3);
}

function normalizeHistory(value: unknown): SessionMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const role = record.role === "model" ? "model" : "user";
      const text = typeof record.text === "string" ? record.text : "";
      const ts = typeof record.ts === "number" ? record.ts : Date.now();
      if (!text.trim()) return null;
      return { role, text, ts };
    })
    .filter((item): item is SessionMessage => Boolean(item));
}

function toGeminiHistory(messages: SessionMessage[]): GeminiMessage[] {
  return messages.slice(-8).map((message) => ({
    role: message.role,
    parts: [{ text: message.text.slice(0, 1200) }],
  }));
}

function detectIntent(message: string): Intent {
  const normalized = message.toLowerCase();
  for (const entry of INTENT_ORDER) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.intent;
    }
  }
  return null;
}

function extractLocationInfo(message: string): { locationLabel: string; city?: string; matchedNgo: NgoSummary | null } {
  const normalized = message.toLowerCase();
  const matchedCity = CITY_HINTS.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));

  const matchedNgo = findNgoByLocation(normalized, matchedCity?.city);
  const locationLabel = matchedCity?.city ?? inferLocationLabel(message);

  return {
    locationLabel,
    city: matchedCity?.city,
    matchedNgo,
  };
}

function inferLocationLabel(message: string): string {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  if (/\b(in|at|near|from)\b/.test(lower)) {
    return trimmed;
  }

  if (trimmed.length > 3) {
    return trimmed;
  }

  return "";
}

function findNgoByLocation(normalizedLocation: string, city?: string): NgoSummary | null {
  const cityMatch = city ? NGOS.find((ngo) => ngo.city.toLowerCase() === city.toLowerCase()) : undefined;
  if (cityMatch) {
    return normalizeNgo(cityMatch);
  }

  const areaMatch = NGOS.find((ngo) => ngo.serviceAreas.some((area) => normalizedLocation.includes(area.toLowerCase())));
  return areaMatch ? normalizeNgo(areaMatch) : null;
}

function normalizeNgo(ngo: (typeof NGOS)[number]): NgoSummary {
  return {
    id: ngo.id,
    name: ngo.name,
    city: ngo.city,
    category: ngo.category,
    mealsServed: ngo.mealsServed,
    responseTime: ngo.responseTime,
    serviceAreas: ngo.serviceAreas,
    verified: ngo.verified,
  };
}

async function buildPlatformContext(input: { message: string; intent: Intent; phone: string; profileName: string }) {
  const [campaigns, ngos, pickupRequests, donations, chats] = await Promise.all([
    readCampaignSummaries(),
    readNgoSummaries(),
    getDocs(collection(serverDb, COL.PICKUP_REQUESTS)).catch(() => null),
    getDocs(collection(serverDb, COL.DONATIONS)).catch(() => null),
    getDocs(collection(serverDb, COL.CHAT_SESSIONS)).catch(() => null),
  ]);

  const campaignSummaries = filterCampaignsByIntent(campaigns, input.message, input.intent);
  const locationInfo = extractLocationInfo(input.message);
  const matchedNgo = locationInfo.matchedNgo ?? (input.intent === "ngo" ? locationInfo.matchedNgo : null);
  const ngoSummaries = filterNgosByIntent(ngos, input.message, input.intent, matchedNgo);
  const impactSummary = buildImpactSummary({ campaigns, ngos, pickupRequests, donations, chats });
  const contextMode = determineContextMode(input.intent, input.message);

  const lines = [
    DAANSETU_SYSTEM_CONTEXT,
    "",
    `CONTEXT MODE: ${contextMode}`,
    `DETECTED INTENT: ${input.intent ?? "general"}`,
    `USER: ${input.profileName || "Unknown"} | ${maskPhone(input.phone)}`,
    locationInfo.locationLabel ? `DETECTED LOCATION: ${locationInfo.locationLabel}` : "",
    input.intent === "food"
      ? "FOOD FLOW: If the user mentions food donation, ask for pickup details if any detail is missing. If location exists, acknowledge it and suggest the closest verified NGO."
      : "",
    input.intent === "campaign" || input.intent === "donate" || input.intent === "help"
      ? "CAMPAIGN FLOW: Surface top verified campaigns and guide the user toward donation steps and UPI payment guidance."
      : "",
    input.intent === "track"
      ? "TRACKING FLOW: If the user asks to track a donation or pickup, summarise any recent pickups/donations from the IMPACT SNAPSHOT and guide the next step in one message."
      : "",
    input.intent === "ngo"
      ? "NGO FLOW: Use the verified NGO list below and answer with a concise recommendation based on city or service area."
      : "",
    "",
    "TOP CAMPAIGNS:",
    ...campaignSummaries.map((campaign) => `- ${campaign.title} (${campaign.city ?? "India"}) | ₹${campaign.raised.toLocaleString("en-IN")}/₹${campaign.goal.toLocaleString("en-IN")} | trust ${campaign.trustScore ?? 82}/100 | ${campaign.verified === false ? "unverified" : "verified"}`),
    "",
    "VERIFIED NGOS:",
    ...ngoSummaries.map((ngo) => `- ${ngo.name} (${ngo.city}) | ${ngo.category} | ${ngo.mealsServed.toLocaleString("en-IN")} meals served | ${ngo.responseTime} | areas: ${ngo.serviceAreas.slice(0, 4).join(", ")}`),
    "",
    "IMPACT SNAPSHOT:",
    ...impactSummary,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return {
    text: lines,
    campaignSummaries,
    ngoSummaries,
    matchedNgo,
    contextMode,
    impactSummary,
  };
}

function buildFoodContext(input: {
  intent: "food";
  locationInfo: { locationLabel: string; city?: string; matchedNgo: NgoSummary | null };
  campaignSummaries: CampaignSummary[];
  ngoSummaries: NgoSummary[];
  impactSummary: string[];
  pickupRequestId?: string | null;
}) {
  return [
    DAANSETU_SYSTEM_CONTEXT,
    "",
    "FOOD DONATION MODE:",
    input.locationInfo.locationLabel ? `Detected location: ${input.locationInfo.locationLabel}` : "Location is missing.",
    input.locationInfo.matchedNgo ? `Matched NGO: ${input.locationInfo.matchedNgo.name} (${input.locationInfo.matchedNgo.city})` : "No NGO match yet.",
    input.pickupRequestId ? `Pickup request id: ${input.pickupRequestId}` : "",
    "Behavior:",
    "- Ask for pickup details if the message is incomplete.",
    "- If a location is available, acknowledge it and ask for quantity, food type, and pickup time.",
    "- Suggest the closest verified NGO using the context above.",
    "- Keep the reply warm, concise, and action oriented.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function createPickupRequest(input: {
  phone: string;
  profileName: string;
  message: string;
  messageSid: string;
  location: string;
  ngo: NgoSummary | null;
  status: string;
  note?: string;
}): Promise<string | null> {
  try {
    const ref = await addDoc(collection(serverDb, COL.PICKUP_REQUESTS), {
      phone: input.phone,
      profileName: input.profileName,
      location: input.location,
      status: input.status,
      timestamp: serverTimestamp(),
      source: "whatsapp",
      message: input.message,
      messageSid: input.messageSid,
      ngoName: input.ngo?.name ?? null,
      ngoId: input.ngo?.id ?? null,
      note: input.note ?? null,
    });
    return ref.id;
  } catch (error) {
    console.warn("[Webhook] Failed to create pickup request:", error);
    return null;
  }
}

async function readCampaignSummaries(): Promise<CampaignSummary[]> {
  try {
    const snap = await getDocs(query(collection(serverDb, COL.CAMPAIGNS), orderBy("createdAt", "desc")));
    const campaigns = snap.docs.map((record) => ({ id: record.id, ...(record.data() as Record<string, unknown>) })) as Array<Record<string, unknown> & { id: string }>;
    return campaigns
      .map((campaign) => ({
        id: String(campaign.id ?? ""),
        title: String(campaign.title ?? campaign.campaignName ?? "Campaign"),
        raised: Number(campaign.raised ?? 0),
        goal: Number(campaign.goal ?? 0),
        slug: String(campaign.slug ?? campaign.campaignId ?? campaign.id ?? ""),
        city: typeof campaign.city === "string" ? campaign.city : undefined,
        trustScore: typeof campaign.trustScore === "number" ? campaign.trustScore : undefined,
        verified: typeof campaign.verified === "boolean" ? campaign.verified : true,
      }))
      .filter((campaign) => Boolean(campaign.slug))
      .slice(0, 5);
  } catch {
    return [
      { id: "aanya-1000-meals", title: "Aanya's 1,000 Meals Pledge", raised: 34200, goal: 50000, slug: "aanya-1000-meals", city: "Mumbai", trustScore: 88, verified: true },
      { id: "rohan-monsoon-relief", title: "Rohan's Monsoon Kitchen", raised: 41600, goal: 80000, slug: "rohan-monsoon-relief", city: "Bengaluru", trustScore: 84, verified: true },
      { id: "republic-day", title: "Republic Day Daan Drive", raised: 188400, goal: 250000, slug: "republic-day", city: "Pan-India", trustScore: 91, verified: true },
    ];
  }
}

async function readNgoSummaries(): Promise<NgoSummary[]> {
  try {
    const snap = await getDocs(query(collection(serverDb, COL.NGOS), orderBy("mealsServed", "desc")));
    const ngos = snap.docs.map((record) => ({ id: record.id, ...(record.data() as Record<string, unknown>) })) as Array<Record<string, unknown> & { id: string }>;
    if (ngos.length === 0) {
      return NGOS.map(normalizeNgo).slice(0, 6);
    }

    return ngos
      .map((ngo) => ({
        id: String(ngo.id ?? ""),
        name: String(ngo.name ?? "NGO"),
        city: String(ngo.city ?? "India"),
        category: String(ngo.category ?? "Community Kitchen"),
        mealsServed: Number(ngo.mealsServed ?? ngo.mealsDistributed ?? 0),
        responseTime: String(ngo.responseTime ?? "24 hour scheduling"),
        serviceAreas: Array.isArray(ngo.serviceAreas) ? ngo.serviceAreas.filter((entry): entry is string => typeof entry === "string") : [],
        verified: typeof ngo.verified === "boolean" ? ngo.verified : true,
      }))
      .slice(0, 6);
  } catch {
    return NGOS.map(normalizeNgo).slice(0, 6);
  }
}

function filterCampaignsByIntent(campaigns: CampaignSummary[], message: string, intent: Intent): CampaignSummary[] {
  const normalized = message.toLowerCase();
  const list = campaigns.filter((campaign) => {
    if (intent === "education") return /education|school|child|study/.test(`${campaign.title} ${campaign.city} ${normalized}`);
    if (intent === "medical") return /medical|health|hospital|medicine/.test(`${campaign.title} ${campaign.city} ${normalized}`);
    return true;
  });

  return list.length > 0 ? list.slice(0, 3) : campaigns.slice(0, 3);
}

function filterNgosByIntent(ngos: NgoSummary[], message: string, intent: Intent, matchedNgo: NgoSummary | null): NgoSummary[] {
  if (matchedNgo) {
    return [matchedNgo, ...ngos.filter((ngo) => ngo.id !== matchedNgo.id)].slice(0, 3);
  }

  const normalized = message.toLowerCase();
  if (intent === "ngo") {
    const city = CITY_HINTS.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))?.city;
    const filtered = city ? ngos.filter((ngo) => ngo.city.toLowerCase() === city.toLowerCase()) : ngos;
    return filtered.slice(0, 3);
  }

  return ngos.slice(0, 3);
}

function buildImpactSummary(input: {
  campaigns: CampaignSummary[];
  ngos: NgoSummary[];
  pickupRequests: { size: number } | null;
  donations: { size: number } | null;
  chats: { size: number } | null;
}): string[] {
  const totalRaised = input.campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalGoal = input.campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const totalMealsServed = input.ngos.reduce((sum, ngo) => sum + ngo.mealsServed, 0);
  const pickupCount = input.pickupRequests?.size ?? 0;
  const donationCount = input.donations?.size ?? 0;
  const chatCount = input.chats?.size ?? 0;

  return [
    `Campaigns tracked: ${input.campaigns.length}`,
    `Verified NGOs tracked: ${input.ngos.length}`,
    `Pickup requests recorded: ${pickupCount}`,
    `Donation records: ${donationCount}`,
    `Chat sessions: ${chatCount}`,
    `Campaign funds surfaced: ₹${totalRaised.toLocaleString("en-IN")} / ₹${totalGoal.toLocaleString("en-IN")}`,
    `NGO meals served surfaced: ${totalMealsServed.toLocaleString("en-IN")}`,
  ];
}

function determineContextMode(intent: Intent, message: string): string {
  if (intent === "food") return "food_donation";
  if (intent === "ngo") return "ngo_discovery";
  if (intent === "campaign" || intent === "donate" || intent === "help") return "campaign_support";
  if (intent === "track") return "tracking";
  if (intent === "medical") return "medical_support";
  if (intent === "education") return "education_support";
  if (intent === "qr") return "qr_campaigns";
  if (intent === "payment") return "payment_help";
  if (intent === "clothes") return "clothes_donation";
  if (/show active campaigns|active campaigns|campaigns/i.test(message)) return "campaign_support";
  if (/verified ngo|ngo/i.test(message)) return "ngo_discovery";
  return "general";
}

function maskPhone(phone: string): string {
  if (!phone) return "unknown";
  return phone.replace(/\d(?=\d{4})/g, "*");
}

function sanitizeReply(text: string): string {
  return text.trim().slice(0, TWILIO_REPLY_LIMIT);
}

async function generateCampaignAmountPrompt(campaign: { title: string; slug: string }, history: GeminiMessage[]): Promise<string> {
  const reply = await generateGeminiResponse(
    `Ask the user for a donation amount for ${campaign.title}. Keep it short and mention the campaign name once.`,
    [
      DAANSETU_SYSTEM_CONTEXT,
      `Selected campaign: ${campaign.title} (${campaign.slug})`,
      "Ask for a specific rupee amount and keep it WhatsApp-short.",
    ].join("\n"),
    history
  );
  return reply.text;
}

function buildDonationMessage(campaign: { title: string; slug: string }, amount: number): string {
  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("DaanSetu")}&tn=${encodeURIComponent("Donation")}&am=${encodeURIComponent(String(amount))}&cu=INR`;
  return [
    `Thank you for choosing to donate ₹${amount.toLocaleString("en-IN")}.`,
    `Campaign: ${campaign.title}`,
    `UPI: ${upiLink}`,
    `Campaign page: ${APP_URL}/campaign/${campaign.slug}`,
    `You will receive an 80G receipt after the donation is confirmed.`,
  ].join("\n");
}

function twimlResponse(message: string) {
  return new NextResponse(buildTwiML(message), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function isValidTwilioRequest(request: Request, params: URLSearchParams): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.warn("[Webhook] TWILIO_AUTH_TOKEN not set — skipping signature validation (dev mode)");
    return true;
  }

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) {
    console.error("[Webhook] Missing x-twilio-signature header — rejecting request");
    return false;
  }

  // Use configured APP_URL as canonical base — must match exactly what's in Twilio console
  const webhookUrl = `${APP_URL}/api/whatsapp/webhook`;
  console.log("[Webhook] Validating signature against URL:", webhookUrl);

  try {
    const expected = crypto
      .createHmac("sha1", authToken)
      .update(buildTwilioSignaturePayload(webhookUrl, params))
      .digest("base64");
    const valid = timingSafeEqual(signature, expected);
    if (!valid) {
      console.error("[Webhook] Signature mismatch — expected:", expected.slice(0, 8) + "...", "got:", signature.slice(0, 8) + "...");
    }
    return valid;
  } catch (err) {
    console.error("[Webhook] Signature validation error:", err);
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

function buildTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${escapeXml(message)}</Message>\n</Response>`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function formatWhatsAppResponse(responseText: string, nextState: BotState, campaignSlug = "aanya-1000-meals"): string {
  const directLink = `${APP_URL}/campaign/${campaignSlug}`;

  if (nextState === "awaiting_campaign_selection") {
    return [
      responseText,
      "",
      "━━━━━━━━━━━━━━━━━━━",
      "👉 *Reply with 1, 2, or 3 to choose a campaign*",
      "Or reply *HELP* to return to the main menu.",
      "━━━━━━━━━━━━━━━━━━━"
    ].join("\n");
  }

  if (nextState === "awaiting_amount") {
    return responseText;
  }

  // General or Idle state: append the complete premium interactive menu!
  return [
    responseText,
    "",
    "━━━━━━━━━━━━━━━━━━━",
    "🙏 *Namaste from DaanSetu*",
    "",
    "How can I help? Reply with a number or keyword:",
    "1️⃣ *DONATE* — Active verified campaigns",
    "2️⃣ *NGO* — Verified community kitchens",
    "3️⃣ *IMPACT* — Live plate count & snapshot",
    "4️⃣ *TRACK* — Volunteer pickups & schedules",
    "5️⃣ *HELP* — Talk to DaanSetu AI assistant",
    "",
    "🔗 *Direct Campaign Link:*",
    directLink,
    "━━━━━━━━━━━━━━━━━━━",
    "",
    "Reply with *DONATE*, *NGO*, *IMPACT*, *TRACK*, or *HELP*."
  ].join("\n");
}
