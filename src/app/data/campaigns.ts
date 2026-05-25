export type PersonalCampaign = {
  slug: string;
  campaignId?: string;
  campaignName?: string;
  ngoName?: string;
  qrUrl?: string;
  scanCount?: number;
  title: string;
  story: string;
  goal: number;
  raised: number;
  creator: string;
  city: string;
  karma: number;
  createdAt: number;
  supporters: number;
};

const KEY = "daansetu.campaigns.v1";

function getBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://daan-setu-mu.vercel.app";
}

function createCampaignId(title: string) {
  const base = slugify(title);
  const suffix = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export function campaignUrl(campaignId: string) {
  return `${getBaseUrl()}/campaign/${encodeURIComponent(campaignId)}`;
}

export function buildUpiDeepLink(amount: number) {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID?.trim() || "mishrasatvik94@okicici";
  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 1;
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("DaanSetu")}&tn=${encodeURIComponent("Donation")}&am=${encodeURIComponent(String(safeAmount))}&cu=INR`;
}

export function buildUpiQrUrl(amount: number, size = 240) {
  const deeplink = buildUpiDeepLink(amount);
  if (!deeplink) return "";
  return qrImageUrl(deeplink, size);
}

function normalizeCampaign(campaign: PersonalCampaign): PersonalCampaign {
  const campaignId = campaign.campaignId ?? campaign.slug;
  return {
    ...campaign,
    campaignId,
    campaignName: campaign.campaignName ?? campaign.title,
    qrUrl: campaign.qrUrl ?? campaignUrl(campaignId),
    scanCount: typeof campaign.scanCount === "number" && Number.isFinite(campaign.scanCount) ? campaign.scanCount : 0,
  };
}

const SEED: PersonalCampaign[] = [
  {
    slug: "aanya-1000-meals",
    campaignId: "aanya-1000-meals",
    campaignName: "Aanya's 1,000 Meals Pledge",
    ngoName: "DaanSetu Verified NGO",
    qrUrl: campaignUrl("aanya-1000-meals"),
    scanCount: 0,
    title: "Aanya's 1,000 Meals Pledge",
    story: "For my 25th birthday, I'm skipping the party and pledging 1,000 meals to families in Dharavi. Every ₹50 = one full meal. Help me hit the goal in 14 days.",
    goal: 50000,
    raised: 34200,
    creator: "Aanya Kapoor",
    city: "Mumbai",
    karma: 5460,
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    supporters: 184,
  },
  {
    slug: "rohan-monsoon-relief",
    campaignId: "rohan-monsoon-relief",
    campaignName: "Rohan's Monsoon Kitchen",
    ngoName: "DaanSetu Verified NGO",
    qrUrl: campaignUrl("rohan-monsoon-relief"),
    scanCount: 0,
    title: "Rohan's Monsoon Kitchen",
    story: "Bengaluru's rains hit hardest where it hurts most. I'm raising for hot meals to displaced families across HSR and Bellandur shelters.",
    goal: 80000,
    raised: 41600,
    creator: "Rohan Verma",
    city: "Bengaluru",
    karma: 4812,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    supporters: 122,
  },
];

function read(): PersonalCampaign[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const normalizedSeed = SEED.map(normalizeCampaign);
      localStorage.setItem(KEY, JSON.stringify(normalizedSeed));
      return normalizedSeed;
    }
    return (JSON.parse(raw) as PersonalCampaign[]).map(normalizeCampaign);
  } catch {
    return SEED.map(normalizeCampaign);
  }
}

function write(list: PersonalCampaign[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function listPersonalCampaigns(): PersonalCampaign[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getPersonalCampaign(slug: string): PersonalCampaign | undefined {
  return read().find((c) => c.slug === slug);
}

export function createPersonalCampaign(input: { title: string; story: string; goal: number; creator: string; city: string }): PersonalCampaign {
  const campaignId = createCampaignId(input.title);
  const next: PersonalCampaign = normalizeCampaign({
    slug: campaignId,
    campaignId,
    campaignName: input.title,
    ngoName: "DaanSetu Verified NGO",
    qrUrl: campaignUrl(campaignId),
    scanCount: 0,
    title: input.title,
    story: input.story,
    goal: input.goal,
    raised: 0,
    creator: input.creator || "Anonymous donor",
    city: input.city || "India",
    karma: 1240,
    createdAt: Date.now(),
    supporters: 0,
  });
  const list = read();
  write([next, ...list]);
  return next;
}

export function donateToCampaign(slug: string, amount: number): PersonalCampaign | undefined {
  const list = read();
  const idx = list.findIndex((c) => c.slug === slug);
  if (idx === -1) return undefined;
  list[idx] = normalizeCampaign({ ...list[idx], raised: list[idx].raised + amount, supporters: list[idx].supporters + 1 });
  write(list);
  return list[idx];
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "campaign";
}

export function qrImageUrl(data: string, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`;
}
