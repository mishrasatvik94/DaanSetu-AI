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

  const params = new URLSearchParams({
    pa,
    pn: payeeName,
    cu: "INR",
  });

  if (amount != null && Number.isFinite(amount) && amount > 0) {
    params.set("am", String(Math.round(amount)));
  }

  if (note) {
    params.set("tn", note.slice(0, 100));
  }

  return `upi://pay?${params.toString()}`;
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

/**
 * Returns the full campaign URL for a given slug.
 * Always uses the production domain — never localhost.
 */
export function getCampaignUrl(slug: string): string {
  const base =
    (typeof window !== "undefined" && window.location?.origin) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) ||
    "https://daan-setu-mu.vercel.app";
  return `${base}/campaign/${encodeURIComponent(slug)}`;
}

/**
 * Formats a WhatsApp share message for a campaign.
 */
export function buildWhatsAppShareText(params: {
  title: string;
  raised: number;
  goal: number;
  trustScore: number;
  campaignUrl: string;
  upiLink: string;
}): string {
  const { title, raised, goal, trustScore, campaignUrl, upiLink } = params;
  return (
    `🙏 Support this verified DaanSetu campaign\n\n` +
    `Campaign: ${title}\n` +
    `Raised: ₹${raised.toLocaleString("en-IN")} / ₹${goal.toLocaleString("en-IN")}\n` +
    `Trust Score: ${trustScore}/100\n\n` +
    `Donate here:\n${campaignUrl}\n\n` +
    `UPI:\n${upiLink}\n\n` +
    `✅ Verified by DaanSetu`
  );
}
