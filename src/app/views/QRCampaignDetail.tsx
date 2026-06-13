"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, QrCode, Share2, Copy, Check, Users, Sparkles, MessageCircle, Twitter } from "lucide-react";
import { Button } from "../components/ui/button";
import { QR_CAMPAIGNS } from "../data/ngos";
import { getPersonalCampaign, donateToCampaign, qrImageUrl, campaignUrl, buildUpiDeepLink, buildUpiQrUrl, type PersonalCampaign } from "../data/campaigns";
import { incrementCampaignScan } from "@/lib/firestore-service";
import { buildWhatsAppShareText } from "@/lib/generateUpiLink";

type FeaturedCampaign = (typeof QR_CAMPAIGNS)[number];

export function QRCampaignDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const [_, force] = useState(0);

  const featured = QR_CAMPAIGNS.find((x) => x.slug === slug);
  const personal = !featured && slug ? getPersonalCampaign(slug) : undefined;

  const url = useMemo(() => (slug ? campaignUrl(slug) : ""), [slug]);
  const qrSrc = useMemo(() => qrImageUrl(url, 280), [url]);

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(500);
  const [scanTracked, setScanTracked] = useState(false);

  useEffect(() => {
    if (!slug || scanTracked || typeof window === "undefined") return;
    const key = `daansetu.campaign.scan.${slug}`;
    if (window.sessionStorage.getItem(key)) {
      setScanTracked(true);
      return;
    }
    window.sessionStorage.setItem(key, "1");
    setScanTracked(true);
    incrementCampaignScan(slug).catch((error) => console.warn("Failed to increment campaign scan:", error));
  }, [scanTracked, slug]);

  if (!featured && !personal) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-24">
        <p style={{ color: "#4B5563" }}>Campaign not found.</p>
        <Link href="/qr-campaign" className="text-sm mt-3 inline-block" style={{ color: "#0F8F5F" }}>
          ← All campaigns
        </Link>
      </main>
    );
  }

  function share(channel: "whatsapp" | "twitter") {
    const baseText =
      channel === "whatsapp"
        ? buildWhatsAppShareText({
            title,
            ngoName,
            goal,
            raised,
            campaignUrl: url,
          })
        : `Join me in supporting this DaanSetu campaign — ${title}. ${url}`;
    const text = encodeURIComponent(baseText);
    const target =
      channel === "whatsapp"
        ? `https://wa.me/?text=${text}`
        : `https://twitter.com/intent/tweet?text=${text}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function donate() {
    if (!personal || !slug) return;
    donateToCampaign(slug, amount);
    force((x) => x + 1);
  }

  const isPersonal = !!personal;
  const c: PersonalCampaign | FeaturedCampaign = personal ?? featured!;
  const title = c.title;
  const goal = c.goal;
  const raised = isPersonal ? (personal as PersonalCampaign).raised : (featured as FeaturedCampaign).raised;
  const city = c.city;
  const story = personal?.story ?? (featured as FeaturedCampaign & { story?: string }).story ?? "Support this verified campaign and help us reach the goal.";
  const campaignName = (personal as PersonalCampaign | undefined)?.campaignName ?? title;
  const ngoName = (personal as PersonalCampaign | undefined)?.ngoName ?? "DaanSetu Verified NGO";
  const donorCount = isPersonal ? (personal as PersonalCampaign).supporters : Math.max(42, Math.round(raised / 750));
  const scanCount = (personal as PersonalCampaign | undefined)?.scanCount ?? Math.max(12, Math.round(raised / 1200));
  const campaignLink = url;
  const upiLink = useMemo(() => buildUpiDeepLink(amount), [amount]);
  const upiQr = useMemo(() => buildUpiQrUrl(amount, 260), [amount]);
  const whatsappLink = useMemo(() => `https://wa.me/?text=${encodeURIComponent("I want to donate via DaanSetu")}`, []);
  const recentDonors = isPersonal
    ? ["Aanya Kapoor", "Rohan Verma", "Priya Iyer", "Satvik Mishra"]
    : ["Hyatt Regency", "TCS Cafeteria", "Goonj HQ", "Marriott"];
  const trustBadges = isPersonal
    ? ["80G receipts", "WhatsApp support", "UPI enabled", "Instant QR"]
    : ["Verified NGO", "Transparent receipts", "FCRA aligned", "Impact tracking"];
  const pct = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <Link href="/qr-campaign" className="inline-flex items-center gap-1 text-sm mb-8" style={{ color: "#0F8F5F" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> All campaigns
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div>
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 md:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "#0F8F5F" }}>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1"><Sparkles className="w-3 h-3" /> Live campaign</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">Verified badge</span>
              </div>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F", fontWeight: 600 }}>
                  {campaignName.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("") || "D"}
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#6B7280" }}>NGO name</div>
                  <div style={{ color: "#1F2937", fontWeight: 600 }}>{ngoName}</div>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm" style={{ color: "#4B5563", lineHeight: 1.7 }}>{story}</p>
            </div>

            {isPersonal && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F", fontWeight: 600 }}>
                  {(personal as PersonalCampaign).creator.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div style={{ color: "#1F2937", fontWeight: 500 }}>{(personal as PersonalCampaign).creator}</div>
                  <div className="text-xs flex items-center gap-2" style={{ color: "#6B7280" }}>
                    <span>{(personal as PersonalCampaign).city}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1" style={{ color: "#0F8F5F" }}>
                      <Sparkles className="w-3 h-3" /> {(personal as PersonalCampaign).karma.toLocaleString("en-IN")} KarmaScore
                    </span>
                  </div>
                </div>
              </div>
            )}

            <h1 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 3.5vw, 2.75rem)", lineHeight: 1.1, fontWeight: 600 }}>{title}</h1>
            {!isPersonal && <div className="mt-2 text-sm" style={{ color: "#6B7280" }}>{city} · {(featured as FeaturedCampaign).days} days remaining</div>}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-baseline justify-between">
                <span style={{ color: "#1F2937", fontSize: "1.75rem", fontWeight: 600 }}>₹{raised.toLocaleString("en-IN")}</span>
                <span className="text-sm" style={{ color: "#6B7280" }}>of ₹{goal.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0F8F5F, #19A06E)" }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "#6B7280" }}>
                <span>{pct}% funded</span>
                {isPersonal && (
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {(personal as PersonalCampaign).supporters} supporters</span>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Donors", value: donorCount.toLocaleString("en-IN") },
                  { label: "Scans", value: scanCount.toLocaleString("en-IN") },
                  { label: "Raised", value: `₹${raised.toLocaleString("en-IN")}` },
                  { label: "Goal", value: `₹${goal.toLocaleString("en-IN")}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-xs" style={{ color: "#6B7280" }}>{item.label}</div>
                    <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {isPersonal ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <div style={{ color: "#1F2937", fontWeight: 600 }}>The story</div>
                <p className="mt-3 text-sm whitespace-pre-line" style={{ color: "#4B5563", lineHeight: 1.7 }}>{(personal as PersonalCampaign).story}</p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <div style={{ color: "#1F2937", fontWeight: 600 }}>How it works</div>
                <ol className="mt-3 space-y-2 text-sm" style={{ color: "#4B5563" }}>
                  <li>1. Scan the campaign QR code from your phone.</li>
                  <li>2. Choose meals or funds — pay via UPI in two taps.</li>
                  <li>3. Receive a public impact receipt with the NGO and beneficiaries.</li>
                </ol>
              </div>
            )}

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div style={{ color: "#1F2937", fontWeight: 600 }}>Recent donors</div>
                <div className="mt-4 space-y-3">
                  {recentDonors.map((donor, index) => (
                    <div key={donor} className="flex items-center justify-between text-sm">
                      <span style={{ color: "#4B5563" }}>{donor}</span>
                      <span style={{ color: "#6B7280" }}>{[200, 500, 1000, 250][index % 4]} donated</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div style={{ color: "#1F2937", fontWeight: 600 }}>Trust badges</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trustBadges.map((badge) => (
                    <span key={badge} className="text-xs px-3 py-1.5 rounded-full border border-slate-200" style={{ backgroundColor: "#FAFAF8", color: "#4B5563" }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Share the campaign</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>Every share averages ₹420 in donations. Go viral.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => share("whatsapp")} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                  <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} /> WhatsApp
                </button>
                <button onClick={() => share("twitter")} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                  <Twitter className="w-4 h-4" style={{ color: "#1DA1F2" }} /> X / Twitter
                </button>
                <button onClick={copy} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                  {copied ? <Check className="w-4 h-4" style={{ color: "#0F8F5F" }} /> : <Copy className="w-4 h-4" style={{ color: "#4B5563" }} />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
              <div className="mt-3 text-xs px-3 py-2 rounded-lg break-all" style={{ backgroundColor: "#F5F7F6", color: "#4B5563" }}>{campaignLink}</div>
              <a href={campaignLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs" style={{ color: "#0F8F5F" }}>
                Open campaign page
              </a>
            </div>
          </div>

          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sticky top-24">
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#FAFAF8" }}>
                {qrSrc ? (
                  <img src={qrSrc} alt={`QR code for ${title}`} className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-24 h-24" style={{ color: "#0F8F5F" }} />
                )}
              </div>
              <div className="mt-3 text-center text-xs" style={{ color: "#6B7280" }}>Scan to open this campaign · UPI accepted</div>

              <div className="mt-5 rounded-2xl border border-slate-200 p-4" style={{ backgroundColor: "#FAFAF8" }}>
                <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>DONATE VIA UPI</div>
                <div className="mt-3 flex items-center justify-center">
                  {upiQr ? <img src={upiQr} alt="UPI payment QR" className="w-40 h-40 rounded-xl bg-white p-2 border border-slate-200" /> : <div className="w-40 h-40 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-center px-4" style={{ color: "#6B7280" }}>Set NEXT_PUBLIC_UPI_ID to enable UPI QR</div>}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["GPay", "PhonePe", "Paytm"].map((label) => (
                    <a
                      key={label}
                      href={upiLink || campaignLink}
                      className="text-xs text-center px-2 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {isPersonal ? (
                <>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[200, 500, 1000].map((v) => (
                      <button key={v} onClick={() => setAmount(v)} className="text-sm py-2 rounded-lg border transition" style={{ borderColor: amount === v ? "#0F8F5F" : "#E5E7EB", color: amount === v ? "#0F8F5F" : "#4B5563", backgroundColor: amount === v ? "#F3FBF6" : "#fff", fontWeight: amount === v ? 600 : 400 }}>
                        ₹{v}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm" style={{ color: "#6B7280" }}>₹</span>
                    <input type="number" min={50} step={50} value={amount} onChange={(e) => setAmount(Math.max(50, Number(e.target.value) || 0))} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-slate-300" />
                  </div>
                  <Button className="mt-4 w-full text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={donate}>
                    Donate ₹{amount.toLocaleString("en-IN")}
                  </Button>
                </>
              ) : (
                <div className="mt-5 space-y-2">
                  <Button className="w-full text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}>
                    Donate via WhatsApp
                  </Button>
                  <Button className="w-full border-slate-300 text-slate-700 hover:bg-slate-50" variant="outline" onClick={() => router.push("/signup")}>
                    Donate to this campaign
                  </Button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1" style={{ color: "#6B7280" }}>
                <div>80G tax exemption available</div>
                <div>100% routed via verified NGOs</div>
                <a href={campaignLink} target="_blank" rel="noreferrer" className="inline-block" style={{ color: "#0F8F5F" }}>
                  Campaign website link
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
