import { NGOS } from "../../data/ngos";
import type { Msg } from "./types";

const CITY_LIST = [
  "mumbai", "bandra", "andheri", "powai", "bengaluru", "bangalore", "delhi", "noida", "gurgaon", "gurugram",
  "chennai", "hyderabad", "pune", "kolkata", "ahmedabad", "jaipur", "lucknow",
];

export function respond(text: string): Msg {
  const lower = text.toLowerCase();

  // FAQ intents
  if (/80\s*g|tax|exempt|receipt/.test(lower)) {
    return {
      from: "ai",
      text: "Every DaanSetu donation routed via a verified NGO comes with an 80G receipt — auto-emailed within 24 hours. FCRA-eligible NGOs also issue compliant foreign-donor receipts.",
      actions: [{ label: "See verified NGOs", to: "/ngos" }],
    };
  }
  if (/volunteer|join|help out/.test(lower)) {
    return {
      from: "ai",
      text: "Lovely. You can volunteer for pickups, kitchen ops, or last-mile delivery. Tell me your city and free hours — or sign up and I'll route you to the closest NGO.",
      actions: [{ label: "Sign up to volunteer", to: "/signup" }, { label: "Browse NGOs", to: "/ngos" }],
    };
  }
  if (/karma|score|rank|level/.test(lower)) {
    return {
      from: "ai",
      text: "Your KarmaScore tracks every meal, referral, QR donation, and volunteer hour. Climb tiers from 🌱 Seed → 👑 Legend and unlock badges along the way.",
      actions: [{ label: "Open KarmaScore", to: "/karma" }],
    };
  }
  if (/qr|campaign|fundraiser/.test(lower)) {
    return {
      from: "ai",
      text: "You can start a personal QR fundraiser in 60 seconds — birthday, wedding, milestone, anything. I'll mint a QR you can share anywhere.",
      actions: [{ label: "Start a campaign", to: "/qr-campaign" }],
    };
  }
  if (/pickup|how.*work|process/.test(lower) && !mealsCount(lower)) {
    return {
      from: "ai",
      text: "Here's how pickup works:\n1. You tell me what you have + your location.\n2. I match the nearest verified NGO with capacity.\n3. A volunteer reaches you in 15–30 minutes.\n4. You get a live ETA, a thank-you receipt, and an 80G certificate.",
      actions: [{ label: "Try it — sign up", to: "/signup" }],
    };
  }
  if (/safe|hygiene|leftover|stale/.test(lower)) {
    return {
      from: "ai",
      text: "Quick safety rules: donate within 2 hours of cooking, keep hot food hot (>60°C) or chilled (<5°C), pack in clean covered containers, and avoid anything with raw seafood or unpasteurised dairy left out. Setu's volunteers run a quick check on arrival.",
    };
  }

  // Food + city matching
  const meals = mealsCount(lower);
  const city = detectCity(lower);

  if (meals || city) {
    const ngo = pickNGO(city);
    const cityLabel = titleCase(city ?? ngo.city);
    const ngoLink = `/ngos/${ngo.id}`;
    const mealsLabel = meals ? `${meals} meals` : "your donation";
    const eta = 12 + Math.floor(Math.random() * 14);
    return {
      from: "ai",
      text: `Best match: ${ngo.name} (${ngo.city}) — they cover ${cityLabel} and have capacity right now.\n\nPickup ETA: ~${eta} min for ${mealsLabel}. Volunteer Rahul can be dispatched on confirmation.`,
      actions: [
        { label: `Confirm with ${ngo.name}`, to: ngoLink },
        { label: "Need a different NGO?", to: "/ngos" },
      ],
    };
  }

  // Donation intent without specifics
  if (/donate|give|surplus|food|meal|extra/.test(lower)) {
    return {
      from: "ai",
      text: "Got it. To match the right NGO, tell me two things:\n• How much food (e.g. 20 meals, 5 kg rice)\n• Your area or city (e.g. Noida, Bandra)",
    };
  }

  // Greetings
  if (/^(hi|hello|hey|namaste|namaskar)\b/.test(lower)) {
    return {
      from: "ai",
      text: "Namaste! 🌿 I'm Setu — your donation co-pilot. You can tell me what surplus food you have, or ask me about NGOs, pickup, KarmaScore, or 80G receipts.",
    };
  }

  // Fallback
  return {
    from: "ai",
    text: "I can help with NGO matching, donation pickup, food safety, KarmaScore, QR campaigns, and 80G receipts. Tell me what you have and where you are — e.g. \"I have 20 meals in Noida\".",
    actions: [
      { label: "Browse NGOs", to: "/ngos" },
      { label: "Start a QR campaign", to: "/qr-campaign" },
    ],
  };
}

function mealsCount(s: string): number | null {
  const m = s.match(/(\d{1,4})\s*(meal|meals|plate|plates|thali|thalis|portion|portions)/);
  if (m) return Number(m[1]);
  const kg = s.match(/(\d{1,3})\s*(kg|kilo|kilos)/);
  if (kg) return Number(kg[1]) * 4;
  return null;
}

function detectCity(s: string): string | null {
  for (const c of CITY_LIST) if (s.includes(c)) return c;
  return null;
}

function pickNGO(city: string | null) {
  if (city) {
    const aliases: Record<string, string> = {
      bandra: "mumbai", andheri: "mumbai", powai: "mumbai",
      bangalore: "bengaluru", gurgaon: "delhi", gurugram: "delhi", noida: "delhi",
    };
    const target = aliases[city] ?? city;
    const match = NGOS.find((n) => n.city.toLowerCase() === target);
    if (match) return match;
  }
  return NGOS[0];
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
