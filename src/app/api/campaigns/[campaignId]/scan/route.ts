import { NextResponse } from "next/server";

const MESSAGE = "I want to donate via DaanSetu";

function buildWhatsAppUrl() {
  return `https://wa.me/?text=${encodeURIComponent(MESSAGE)}`;
}

export async function GET(_request: Request, { params }: { params: { campaignId: string } }) {
  return NextResponse.redirect(buildWhatsAppUrl(), 302);
}