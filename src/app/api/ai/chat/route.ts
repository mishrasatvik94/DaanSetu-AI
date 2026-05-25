/**
 * POST /api/ai/chat
 *
 * Server-side Gemini-powered chat endpoint for the DaanSetu AI Assistant.
 * Keeps GEMINI_API_KEY server-side only.
 */

import { NextResponse } from "next/server";
import { generateAIResponse, checkRateLimit, type GeminiMessage } from "@/lib/gemini";
import { fetchCampaigns, fetchNGOs } from "@/lib/firestore-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { text: "🙏 You're sending messages too quickly. Please wait a moment.", error: true },
      { status: 429 }
    );
  }

  let body: { message: string; history?: GeminiMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ text: "Invalid request.", error: true }, { status: 400 });
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ text: "Please send a message.", error: true }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json(
      { text: "Message too long. Please keep it under 1000 characters.", error: true },
      { status: 400 }
    );
  }

  // Build live platform context from Firebase
  let context = "";
  try {
    const [campaigns, ngos] = await Promise.all([
      fetchCampaigns().catch(() => []),
      fetchNGOs().catch(() => []),
    ]);

    const activeCampaigns = campaigns.slice(0, 5).map((c) => {
      const pct = Math.min(100, Math.round(((c.raised ?? 0) / (c.goal || 1)) * 100));
      return `- "${c.title}" by ${c.creator} (${c.city}): ₹${(c.raised ?? 0).toLocaleString("en-IN")} / ₹${(c.goal ?? 0).toLocaleString("en-IN")} (${pct}% funded)`;
    });

    const activeNgos = (ngos as Array<{ name: string; city: string; category: string; urgency: string; mealsServed: number }>)
      .slice(0, 6)
      .map((n) => `- ${n.name} (${n.city}) — ${n.category}, Urgency: ${n.urgency}, ${n.mealsServed?.toLocaleString("en-IN") ?? "?"} meals served`);

    if (activeCampaigns.length > 0) {
      context += `LIVE ACTIVE CAMPAIGNS:\n${activeCampaigns.join("\n")}\n\n`;
    }
    if (activeNgos.length > 0) {
      context += `VERIFIED NGO PARTNERS:\n${activeNgos.join("\n")}\n`;
    }
  } catch (err) {
    console.warn("[AI Chat] Failed to fetch platform context:", err);
  }

  // Sanitize history (max 10 turns to control token usage)
  const sanitizedHistory = history
    .slice(-10)
    .filter((m): m is GeminiMessage =>
      (m.role === "user" || m.role === "model") &&
      Array.isArray(m.parts) &&
      m.parts.length > 0 &&
      typeof m.parts[0]?.text === "string"
    );

  try {
    const response = await generateAIResponse(message.trim(), context || undefined, sanitizedHistory);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Gemini chat route error:", error);
    return NextResponse.json({
      text: "Namaste 🙏 DaanSetu AI is temporarily busy. Please try again shortly.",
      error: true
    }, { status: 200 });
  }
}
