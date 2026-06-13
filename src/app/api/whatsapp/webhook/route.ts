import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIVE_URL = "https://daan-setu-ai.vercel.app";
const WEBHOOK_PATH = "/api/whatsapp/webhook";
const TWILIO_REPLY_LIMIT = 1500;

const MENU_TEXT = [
  "Namaste from DaanSetu AI",
  "1. donate - matching verified NGO needs",
  "2. impact - impact snapshot",
  "3. ngo / need - NGO need posting instructions",
  "4. urgent - urgent needs",
  "5. status - platform status",
  "Reply with hi, help, donate, impact, ngo, urgent, or status.",
  `Website: ${LIVE_URL}`,
].join("\n");

const DONATE_TEXT = [
  "Verified NGO needs:",
  "1. Food rescue support for verified city partners",
  "2. Child nutrition kits for school-linked programs",
  `Open matching assistant: ${LIVE_URL}/ai-match`,
  `Website: ${LIVE_URL}`,
].join("\n");

const IMPACT_TEXT = [
  "Impact snapshot:",
  "- Live donations and campaign activity",
  "- Verified NGO discovery and matching",
  "- WhatsApp support for donors and volunteers",
  `Open dashboard: ${LIVE_URL}/dashboard`,
].join("\n");

const NGO_TEXT = [
  "Post an NGO need:",
  "- Open the NGO page and submit the need details",
  "- Include title, urgency, location, and verification info",
  `Open NGO page: ${LIVE_URL}/ngo`,
].join("\n");

const URGENT_TEXT = [
  "Urgent needs:",
  "- Food rescue and immediate meal support",
  "- Child nutrition and medical support",
  `See donor view: ${LIVE_URL}/donor`,
].join("\n");

const STATUS_TEXT = [
  "Platform status:",
  "- Website live",
  "- AI match active",
  "- WhatsApp bot connected",
  `Website: ${LIVE_URL}`,
].join("\n");

const IMPACT_REPLY = [
  "Impact snapshot:",
  "- Verified donors can route support to active causes",
  "- Campaigns and NGOs stay visible through the dashboard",
  `Dashboard: ${LIVE_URL}/dashboard`,
].join("\n");

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildTwiml(message: string): NextResponse {
  const safeMessage = escapeXml(message.trim().slice(0, TWILIO_REPLY_LIMIT));
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safeMessage}</Message></Response>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function pickReply(bodyText: string): string {
  const normalized = normalizeText(bodyText);

  if (!normalized || ["hi", "hello", "help", "namaste"].includes(normalized)) {
    return MENU_TEXT;
  }

  if (normalized === "donate" || normalized === "1") {
    return DONATE_TEXT;
  }

  if (normalized === "impact" || normalized === "2") {
    return IMPACT_REPLY;
  }

  if (normalized === "ngo" || normalized === "need" || normalized === "3") {
    return NGO_TEXT;
  }

  if (normalized === "urgent" || normalized === "4") {
    return URGENT_TEXT;
  }

  if (normalized === "status" || normalized === "5") {
    return STATUS_TEXT;
  }

  return [
    "Namaste from DaanSetu AI",
    "Reply with hi, donate, impact, ngo, urgent, or status.",
    `Website: ${LIVE_URL}`,
    `Webhook: ${LIVE_URL}${WEBHOOK_PATH}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const bodyText = formData.get("Body") ?? "";
    const from = formData.get("From") ?? "";
    const to = formData.get("To") ?? "";
    const profileName = formData.get("ProfileName") ?? "";

    const reply = pickReply(String(bodyText));

    if (process.env.NODE_ENV !== "production") {
      console.log("[WhatsApp webhook] received", {
        from: String(from),
        to: String(to),
        profileName: String(profileName),
        body: String(bodyText),
      });
    }

    return buildTwiml(reply);
  } catch (error) {
    console.warn("[WhatsApp webhook] fallback response used:", error);
    return buildTwiml([
      "Namaste from DaanSetu AI",
      "We received your message and the bot is available.",
      `Website: ${LIVE_URL}`,
      `Webhook: ${LIVE_URL}${WEBHOOK_PATH}`,
    ].join("\n"));
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "DaanSetu AI WhatsApp webhook",
      endpoint: WEBHOOK_PATH,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
