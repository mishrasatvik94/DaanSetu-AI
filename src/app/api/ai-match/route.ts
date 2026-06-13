import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type MatchNeed = {
  id?: string;
  ngoName?: string;
  title?: string;
  category?: string;
  location?: string;
  urgency?: string;
  verified?: boolean;
};

type MatchResponse = {
  bestMatchId: string;
  ngoName: string;
  needTitle: string;
  reason: string;
  estimatedImpact: string;
  confidence: number;
  source: "fallback" | "gemini";
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallbackMatch(intent: string, needs: MatchNeed[]): MatchResponse {
  const text = intent.toLowerCase();

  const scored = needs.map((need) => {
    let score = 0;

    if (text.includes(String(need.category || "").toLowerCase())) score += 3;
    if (text.includes(String(need.location || "").toLowerCase())) score += 3;
    if (String(need.urgency || "").toLowerCase() === "high") score += 2;
    if (need.verified) score += 1;

    return { need, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]?.need || needs[0];

  return {
    bestMatchId: best?.id || "",
    ngoName: best?.ngoName || "Verified NGO",
    needTitle: best?.title || "Urgent community need",
    reason: "Matched using category, location, urgency and verification signals.",
    estimatedImpact: "Your donation can directly support this active verified need.",
    confidence: 0.72,
    source: "fallback",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { intent, needs } = await req.json();

    if (!intent || typeof intent !== "string" || !Array.isArray(needs) || needs.length === 0) {
      return NextResponse.json(
        { error: "intent and needs are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(fallbackMatch(intent, needs));
    }

    const prompt = `
You are DaanSetu AI, a donation matching assistant.

Donor intent:
${intent}

Available NGO needs:
${JSON.stringify(needs, null, 2)}

Choose the best matching need based on:
- category match
- location match
- urgency
- NGO verification
- likely impact

Return only valid JSON in this exact shape:
{
  "bestMatchId": "string",
  "ngoName": "string",
  "needTitle": "string",
  "reason": "string",
  "estimatedImpact": "string",
  "confidence": 0.9
}
`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned) as Omit<MatchResponse, "source">;
      return NextResponse.json({
        ...parsed,
        source: "gemini",
      });
    } catch {
      return NextResponse.json(fallbackMatch(intent, needs));
    }
  } catch (error) {
    console.error("[AI Match] failed:", error);
    return NextResponse.json(
      { error: "AI match failed" },
      { status: 500 }
    );
  }
}
