/**
 * GET /api/ai/debug
 * Live Gemini runtime diagnostic — returns exact success or error.
 * REMOVE THIS ROUTE after production is confirmed working.
 */

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keyExists = !!process.env.GEMINI_API_KEY;
  const keyPrefix = process.env.GEMINI_API_KEY?.slice(0, 8) ?? "(none)";

  if (!keyExists) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY is not set in Vercel env", keyPrefix },
      { status: 500 }
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply only with: working",
    });
    const text = result.text;

    return NextResponse.json({
      success: true,
      text,
      keyPrefix,
      model: "gemini-2.5-flash",
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack?.slice(0, 500) : undefined;

    return NextResponse.json(
      {
        success: false,
        error,
        stack,
        keyPrefix,
        model: "gemini-2.5-flash",
      },
      { status: 500 }
    );
  }
}
