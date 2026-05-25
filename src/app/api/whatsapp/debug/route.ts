/**
 * GET /api/whatsapp/debug
 * Safe diagnostic endpoint — never exposes secrets, only boolean presence checks.
 * Remove this route once production is verified working.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    env: {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
      NEXT_PUBLIC_UPI_ID: process.env.NEXT_PUBLIC_UPI_ID ?? "(not set)",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "(not set)",
    },
    runtime: "nodejs",
    status: "ok",
  };

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
