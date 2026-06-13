/**
 * src/lib/generateUpiLink.ts
 *
 * Reusable UPI payment link and QR code generator for DaanSetu.
 * Generates UPI deep-links that open Google Pay, PhonePe, Paytm, and all
 * UPI-compliant apps directly. QR codes are rendered via the free
 * qrserver.com API — no API key required.
 */

const DEFAULT_UPI_ID = "mishrasatvik94@okicici";
const DEFAULT_PAYEE_NAME = "DaanSetu";

/** Returns the configured UPI ID — always falls back to the production ID. */
export function getUpiId(): string {
  return (
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_UPI_ID?.trim()) ||
    DEFAULT_UPI_ID
  );
}

export interface UpiLinkOptions {
  /** Amount in INR (optional — omit for open-amount QRs) */
  amount?: number;
  /** Displayed payee name (default: "DaanSetu") */
  payeeName?: string;
  /** Arbitrary transaction note */
  note?: string;
  /** Override UPI ID */
  upiId?: string;
}

/**
 * Builds a `upi://pay` deep-link.
 * Scanning from mobile opens Google Pay / PhonePe / Paytm / any UPI app.
 *
 * @example
 *   generateUpiLink({ amount: 500 })
 *   // => "upi://pay?pa=mishrasatvik94%40okicici&pn=DaanSetu&am=500&cu=INR"
 */
export function generateUpiLink(options: UpiLinkOptions = {}): string {
  const { amount, payeeName = DEFAULT_PAYEE_NAME, note, upiId } = options;
  const pa = upiId ?? getUpiId();

  const parts = [
    `pa=${encodeURIComponent(pa)}`,
    `pn=${encodeURIComponent(payeeName)}`,
    `tn=${encodeURIComponent(note ?? "Donation")}`,
  ];

  if (amount != null && Number.isFinite(amount) && amount > 0) {
    parts.push(`am=${encodeURIComponent(String(Math.round(amount)))}`);
  }

  parts.push(`cu=INR`);

  return `upi://pay?${parts.join("&")}`;
}

/**
 * Returns the URL of a QR code image that encodes the UPI deep-link.
 * The QR image is generated on-the-fly using the free qrserver.com API.
 *
 * @param options - Same as `generateUpiLink`
 * @param size    - Pixel dimensions of the square QR image (default: 260)
 */
export function generateUpiQrUrl(options: UpiLinkOptions = {}, size = 260): string {
  const deepLink = generateUpiLink(options);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(deepLink)}`;
}

/**
 * Returns the URL of a QR code image that encodes any arbitrary `data` string.
 * Used for campaign landing-page QRs (the QR points to the campaign URL).
 */
export function generateQrUrl(data: string, size = 260): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`;
}

function getPublicAppUrl(): string {
  const envUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL?.trim()) || "";
  if (envUrl) return envUrl.replace(/\/$/, "");
  const origin = typeof window !== "undefined" ? window.location?.origin ?? "" : "";
  if (origin && !/localhost|127\.0\.0\.1|\[::1\]/i.test(origin)) return origin;
  return "https://daan-setu-mu.vercel.app";
}

/**
 * Returns the full campaign URL for a given slug.
 * Always uses the production domain — never localhost.
 */
export function getCampaignUrl(slug: string): string {
  const base = getPublicAppUrl();
  return `${base}/campaign/${encodeURIComponent(slug)}`;
}

/**
 * Formats a WhatsApp share message for a campaign.
 */
export function buildWhatsAppShareText(params: {
  title: string;
  raised: number;
  goal: number;
  ngoName?: string;
  campaignUrl: string;
}): string {
  const { title, raised, goal, ngoName = "DaanSetu Verified NGO", campaignUrl } = params;
  return [
    "🙏 Join me in supporting this verified DaanSetu campaign",
    "",
    "Every contribution creates real impact ❤️",
    "",
    `📍 Campaign: ${title}`,
    `🏛 NGO: ${ngoName}`,
    `🎯 Goal: ₹${goal.toLocaleString("en-IN")}`,
    `💚 Raised: ₹${raised.toLocaleString("en-IN")}`,
    "",
    "🔗 Donate now:",
    campaignUrl,
  ].join("\n");
}
