import { NextResponse } from "next/server";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";
import { serverDb } from "@/lib/firebase-server";
import { COL } from "@/lib/firestore-service";

const MESSAGE = "I want to donate via DaanSetu";

function buildWhatsAppUrl() {
  return `https://wa.me/?text=${encodeURIComponent(MESSAGE)}`;
}

export async function GET(_request: Request, { params }: { params: { campaignId: string } }) {
  const campaignId = params.campaignId;

  try {
    const ref = doc(serverDb, COL.CAMPAIGNS, campaignId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await setDoc(ref, { scanCount: increment(1) }, { merge: true });
    }
  } catch (error) {
    console.warn(`[Campaign scan] failed for ${campaignId}:`, error);
  }

  return NextResponse.redirect(buildWhatsAppUrl(), 302);
}