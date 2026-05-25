import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { serverDb } from "@/lib/firebase-server";
import { COL } from "@/lib/firestore-service";
import { NGOS } from "@/app/data/ngos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WELCOME_MESSAGE = "Namaste 🙏 Welcome to DaanSetu. How can I help you donate food today?";
const FOOD_PROMPT = "Thank you for donating ❤️\nPlease share your pickup location.";
const REQUEST_CREATED = "Your donation request is created. Nearby NGO will contact you soon.";
const FOOD_KEYWORDS = ["food", "donate", "extra food", "meal", "leftover"];
const AWAITING_LOCATION = "awaiting_location";

export async function POST(request: Request) {
  const formData = await request.formData();
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
  const normalizedMessage = message.trim().toLowerCase();

  const sessionId = phone || messageSid;
  const sessionRef = doc(serverDb, COL.CHAT_SESSIONS, sessionId);
  const sessionSnap = await getDoc(sessionRef);
  const sessionData = sessionSnap.exists() ? sessionSnap.data() : null;
  const sessionState = typeof sessionData?.state === "string" ? sessionData.state : "idle";

  if (sessionState === AWAITING_LOCATION) {
    const location = message.trim();
    const matchedNgo = matchNgoByLocation(location);

    await addDoc(collection(serverDb, COL.PICKUP_REQUESTS), {
      phone,
      location,
      status: "pending",
      timestamp: serverTimestamp(),
      source: "whatsapp",
      ngoName: matchedNgo?.name ?? null,
      ngoId: matchedNgo?.id ?? null,
    });

    await setDoc(
      sessionRef,
      {
        phone,
        profileName,
        message,
        messageSid,
        timestamp: serverTimestamp(),
        source: "whatsapp",
        state: "idle",
        location,
        ngoName: matchedNgo?.name ?? null,
        ngoId: matchedNgo?.id ?? null,
      },
      { merge: true }
    );

    const confirmation = matchedNgo
      ? `Your donation request is created. Nearby NGO ${matchedNgo.name} will contact you soon.`
      : REQUEST_CREATED;

    return new NextResponse(buildTwiML(confirmation), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  if (looksLikeFoodDonationIntent(normalizedMessage)) {
    await setDoc(
      sessionRef,
      {
        phone,
        profileName,
        message,
        messageSid,
        timestamp: serverTimestamp(),
        source: "whatsapp",
        state: AWAITING_LOCATION,
      },
      { merge: true }
    );

    return new NextResponse(buildTwiML(FOOD_PROMPT), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  await setDoc(
    sessionRef,
    {
      phone,
      profileName,
      message,
      messageSid,
      timestamp: serverTimestamp(),
      source: "whatsapp",
      state: sessionState,
    },
    { merge: true }
  );

  return new NextResponse(buildTwiML(WELCOME_MESSAGE), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return new NextResponse("Webhook alive", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function isValidTwilioRequest(request: Request, params: URLSearchParams): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true;

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha1", authToken)
    .update(buildTwilioSignaturePayload(request.url, params))
    .digest("base64");

  return timingSafeEqual(signature, expected);
}

function looksLikeFoodDonationIntent(message: string): boolean {
  return FOOD_KEYWORDS.some((keyword) => message.includes(keyword));
}

function matchNgoByLocation(location: string) {
  const normalized = location.toLowerCase();
  const cityHints: Array<{ keywords: string[]; city: string }> = [
    { keywords: ["bandra", "andheri", "powai", "mumbai", "navi mumbai", "santacruz"], city: "Mumbai" },
    { keywords: ["bengaluru", "bangalore", "whitefield", "electronic city", "kr puram", "mysuru road"], city: "Bengaluru" },
    { keywords: ["noida", "ghaziabad", "gurugram", "gurgaon", "faridabad", "delhi", "east delhi", "south delhi", "dwarka"], city: "Delhi NCR" },
    { keywords: ["pune", "hadapsar", "pimpri", "kothrud", "yerwada", "wagholi"], city: "Pune" },
    { keywords: ["chennai", "adyar", "t nagar", "annanagar", "anna nagar"], city: "Chennai" },
  ];

  const matchedCity = cityHints.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));
  if (matchedCity) {
    const ngo = NGOS.find((entry) => entry.city.toLowerCase() === matchedCity.city.toLowerCase());
    if (ngo) return ngo;
  }

  const bestServiceAreaMatch = NGOS.find((ngo) =>
    ngo.serviceAreas.some((area) => normalized.includes(area.toLowerCase()))
  );

  return bestServiceAreaMatch ?? NGOS.find((ngo) => ngo.city.toLowerCase() === "mumbai") ?? NGOS[0];
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
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
