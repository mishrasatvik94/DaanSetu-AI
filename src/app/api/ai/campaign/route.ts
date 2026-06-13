/**
 * POST /api/ai/campaign
 *
 * Gemini-powered campaign-specific AI helper.
 * Answers donor questions about a specific campaign.
 */

import { NextResponse } from "next/server";
import { generateAIResponse, checkRateLimit } from "@/lib/gemini";
import { fetchCampaignBySlug } from "@/lib/firestore-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (ip !== "unknown" && !checkRateLimit(`campaign:${ip}`)) {
    return NextResponse.json(
      { text: "Please slow down. Try again in a moment.", error: true },
      { status: 429 }
    );
  }

  let body: { message: string; slug: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ text: "Invalid request.", error: true }, { status: 400 });
  }

  const { message, slug } = body;
  if (!message || !slug) {
    return NextResponse.json({ text: "Message and slug required.", error: true }, { status: 400 });
  }

  // Fetch campaign data to inject as context
  let context = "";
  try {
    const campaign = await fetchCampaignBySlug(slug);
    if (campaign) {
      const pct = Math.min(100, Math.round(((campaign.raised ?? 0) / (campaign.goal || 1)) * 100));
      context = [
        `CAMPAIGN DETAILS:`,
        `Title: ${campaign.title}`,
        `Story: ${campaign.story ?? campaign.description ?? ""}`,
        `Creator: ${campaign.creator} (${campaign.city})`,
        `NGO: ${campaign.ngoName ?? "DaanSetu Verified NGO"}`,
        `Goal: ₹${(campaign.goal ?? 0).toLocaleString("en-IN")}`,
        `Raised: ₹${(campaign.raised ?? 0).toLocaleString("en-IN")} (${pct}% funded)`,
        `Donors: ${campaign.donorCount ?? campaign.supporters ?? 0}`,
        `Trust Score: ${campaign.trustScore ?? 82}/100`,
        `Verified: ${campaign.verified !== false ? "Yes" : "No"}`,
        `Urgency: ${campaign.urgency ?? "medium"}`,
        campaign.updates?.length
          ? `Recent Update: ${campaign.updates[0]?.text ?? ""}`
          : "",
        "",
        `ANSWER MODE: You are helping a potential donor understand this specific campaign.`,
        `Be warm, reassuring, and specific. Explain where money goes, how trust is verified,`,
        `and what the donor's impact will be. Keep it under 150 words.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
  } catch (err) {
    console.warn("[Campaign AI] Failed to fetch campaign:", err);
  }
  try {
    const response = await generateAIResponse(message, context || undefined);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[Campaign AI] Gemini failed:", errMsg);
    const payload: { text: string; error: true; debug?: string } = {
      text: "Namaste 🙏 DaanSetu AI is temporarily busy. Please try again shortly.",
      error: true,
    };
    if (process.env.NODE_ENV !== "production") payload.debug = errMsg;
    return NextResponse.json(payload, { status: 502 });
  }
}
