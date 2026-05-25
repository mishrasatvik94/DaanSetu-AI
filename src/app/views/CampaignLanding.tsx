"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageCircle,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  Heart,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useCampaignBySlug } from "@/lib/use-firestore";
import { generateUpiLink, generateUpiQrUrl, generateQrUrl, getCampaignUrl, buildWhatsAppShareText } from "@/lib/generateUpiLink";
import type { CampaignDoc } from "@/lib/firestore-service";
import { incrementCampaignScan, updateCampaignDonation } from "@/lib/firestore-service";

// ── Trust score colour helper ─────────────────────────────────────────────────
function trustColor(score: number) {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
}

// ── Urgency badge ─────────────────────────────────────────────────────────────
function UrgencyPill({ urgency }: { urgency?: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    high: { label: "⚡ Urgent", bg: "#FEF2F2", color: "#DC2626" },
    medium: { label: "🕐 Active", bg: "#FFFBEB", color: "#D97706" },
    low: { label: "✅ Ongoing", bg: "#F0FDF4", color: "#16A34A" },
  };
  const u = urgency?.toLowerCase() ?? "medium";
  const cfg = map[u] ?? map.medium;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ── Amount preset button ──────────────────────────────────────────────────────
function AmountBtn({ value, selected, onSelect }: { value: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="py-2 rounded-xl border transition-all text-sm font-medium"
      style={{
        borderColor: selected ? "#0F8F5F" : "#E5E7EB",
        color: selected ? "#0F8F5F" : "#4B5563",
        backgroundColor: selected ? "#F0FDF4" : "#fff",
        boxShadow: selected ? "0 0 0 1px #0F8F5F22" : "none",
      }}
    >
      ₹{value.toLocaleString("en-IN")}
    </button>
  );
}

// ── Poster download (html-to-image via canvas fallback) ───────────────────────
async function downloadPoster(campaign: CampaignDoc, campaignLink: string, upiLink: string) {
  // Build a minimal SVG poster we can download without external deps
  const pct = Math.min(100, Math.round(((campaign.raised ?? 0) / (campaign.goal || 1)) * 100));
  const score = campaign.trustScore ?? 82;
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" font-family="Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a4f35"/>
      <stop offset="40%" stop-color="#0F8F5F"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0fdf4"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="1100" fill="url(#bg)"/>

  <!-- Top branding band -->
  <rect x="0" y="0" width="800" height="90" fill="rgba(0,0,0,0.25)"/>
  <text x="40" y="58" font-size="32" font-weight="bold" fill="white">🌿 DaanSetu</text>
  <text x="400" y="38" font-size="12" fill="rgba(255,255,255,0.7)" text-anchor="middle">VERIFIED DONATION CAMPAIGN</text>
  <text x="400" y="58" font-size="11" fill="rgba(255,255,255,0.5)" text-anchor="middle">daan-setu-mu.vercel.app</text>

  <!-- Verified badge -->
  <rect x="570" y="22" width="190" height="48" rx="24" fill="rgba(16,185,129,0.3)" stroke="rgba(16,185,129,0.8)" stroke-width="1.5"/>
  <text x="665" y="44" font-size="11" fill="#6ee7b7" text-anchor="middle" font-weight="bold">✓ VERIFIED CAMPAIGN</text>
  <text x="665" y="60" font-size="10" fill="rgba(110,231,183,0.8)" text-anchor="middle">Trust Score: ${score}/100</text>

  <!-- Main card -->
  <rect x="40" y="110" width="720" height="780" rx="24" fill="url(#card)" opacity="0.97"/>

  <!-- Campaign title -->
  <text x="400" y="165" font-size="28" font-weight="bold" fill="#1F2937" text-anchor="middle">${campaign.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 50)}</text>
  <text x="400" y="195" font-size="14" fill="#6B7280" text-anchor="middle">${campaign.city ?? "India"} · by ${campaign.creator ?? "Anonymous"}</text>

  <!-- Divider -->
  <line x1="80" y1="210" x2="720" y2="210" stroke="#E5E7EB" stroke-width="1"/>

  <!-- Stats block -->
  <rect x="60" y="225" width="200" height="100" rx="12" fill="#F0FDF4"/>
  <text x="160" y="265" font-size="12" fill="#6B7280" text-anchor="middle">RAISED</text>
  <text x="160" y="295" font-size="22" font-weight="bold" fill="#0F8F5F" text-anchor="middle">₹${(campaign.raised ?? 0).toLocaleString("en-IN")}</text>

  <rect x="300" y="225" width="200" height="100" rx="12" fill="#F9FAFB"/>
  <text x="400" y="265" font-size="12" fill="#6B7280" text-anchor="middle">GOAL</text>
  <text x="400" y="295" font-size="22" font-weight="bold" fill="#1F2937" text-anchor="middle">₹${(campaign.goal ?? 0).toLocaleString("en-IN")}</text>

  <rect x="540" y="225" width="200" height="100" rx="12" fill="#FEF3C7"/>
  <text x="640" y="265" font-size="12" fill="#6B7280" text-anchor="middle">FUNDED</text>
  <text x="640" y="295" font-size="22" font-weight="bold" fill="#D97706" text-anchor="middle">${pct}%</text>

  <!-- Progress bar -->
  <rect x="60" y="345" width="680" height="16" rx="8" fill="#E5E7EB"/>
  <rect x="60" y="345" width="${Math.round(680 * pct / 100)}" height="16" rx="8" fill="#0F8F5F"/>
  <text x="60" y="380" font-size="11" fill="#6B7280">${pct}% of goal reached · ${campaign.supporters ?? 0} donors</text>

  <!-- Story -->
  <text x="60" y="415" font-size="14" font-weight="bold" fill="#1F2937">About this campaign</text>
  <foreignObject x="60" y="428" width="680" height="120">
    <body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0">
      <p style="font-size:13px;color:#4B5563;line-height:1.6;font-family:Arial">${(campaign.story ?? campaign.description ?? "Support this verified DaanSetu campaign.").slice(0, 280).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}...</p>
    </body>
  </foreignObject>

  <!-- QR codes label -->
  <text x="400" y="580" font-size="15" font-weight="bold" fill="#1F2937" text-anchor="middle">📲 Scan to Donate Instantly</text>

  <!-- Campaign QR placeholder area -->
  <rect x="80" y="595" width="270" height="240" rx="16" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1.5"/>
  <text x="215" y="645" font-size="11" fill="#6B7280" text-anchor="middle">CAMPAIGN PAGE QR</text>
  <text x="215" y="785" font-size="10" fill="#9CA3AF" text-anchor="middle">${campaignLink.slice(0, 40)}</text>
  <text x="215" y="800" font-size="10" fill="#9CA3AF" text-anchor="middle">Scan to visit campaign</text>

  <!-- UPI QR placeholder area -->
  <rect x="450" y="595" width="270" height="240" rx="16" fill="#F0FDF4" stroke="#0F8F5F" stroke-width="1.5"/>
  <text x="585" y="645" font-size="11" fill="#0F8F5F" text-anchor="middle">DIRECT UPI PAYMENT QR</text>
  <text x="585" y="785" font-size="10" fill="#9CA3AF" text-anchor="middle">mishrasatvik94@okicici</text>
  <text x="585" y="800" font-size="10" fill="#9CA3AF" text-anchor="middle">Google Pay · PhonePe · Paytm</text>

  <!-- Trust badges -->
  <rect x="60" y="860" width="680" height="1" fill="#E5E7EB"/>
  <text x="60" y="890" font-size="12" fill="#6B7280">✓ 80G Tax Exemption</text>
  <text x="260" y="890" font-size="12" fill="#6B7280">✓ UPI Verified</text>
  <text x="420" y="890" font-size="12" fill="#6B7280">✓ NGO Audited</text>
  <text x="580" y="890" font-size="12" fill="#6B7280">✓ FCRA Aligned</text>

  <!-- Footer -->
  <rect x="0" y="930" width="800" height="170" fill="rgba(0,0,0,0.3)"/>
  <text x="400" y="985" font-size="20" font-weight="bold" fill="white" text-anchor="middle">🌿 DaanSetu — India's Trust Layer for Giving</text>
  <text x="400" y="1010" font-size="13" fill="rgba(255,255,255,0.75)" text-anchor="middle">${campaignLink}</text>
  <text x="400" y="1040" font-size="11" fill="rgba(255,255,255,0.5)" text-anchor="middle">Powered by DaanSetu · Verified Campaigns · Transparent Impact</text>
</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daansetu-campaign-${campaign.id ?? "poster"}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Campaign AI Helper widget ─────────────────────────────────────────────────
function CampaignAIHelper({ slug, campaignTitle }: { slug: string; campaignTitle: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Array<{ from: "ai" | "you"; text: string }>>([{
    from: "ai",
    text: `Hi! I'm Setu AI 🌿 Ask me anything about this campaign — where your donation goes, how trust is verified, or what impact it creates.`,
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const askAI = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, slug }),
      });
      const data = await res.json() as { text: string };
      setMsgs((m) => [...m, { from: "ai", text: data.text ?? "Let me check that for you!" }]);
    } catch {
      setMsgs((m) => [...m, { from: "ai", text: "I'm temporarily unavailable. Please try again shortly." }]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, slug]);

  const QUICK_QS = ["Where does my donation go?", "How is this campaign verified?", "What's the impact of ₹500?"];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition shadow-sm"
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="text-left flex-1">
          <div className="text-sm font-semibold" style={{ color: "#1F2937" }}>Ask Setu AI about this campaign</div>
          <div className="text-xs" style={{ color: "#6B7280" }}>Powered by Google Gemini · answers in seconds</div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>GEMINI</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold flex-1" style={{ color: "#1F2937" }}>Setu AI — Campaign Helper</span>
        <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded-lg hover:bg-slate-100" style={{ color: "#6B7280" }}>Close</button>
      </div>

      <div className="px-4 py-4 space-y-3 max-h-72 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === "you" ? "justify-end" : ""}`}>
            {m.from === "ai" && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
            <div
              className="max-w-[82%] text-xs rounded-xl px-3 py-2 leading-relaxed"
              style={m.from === "you"
                ? { backgroundColor: "#0F8F5F", color: "white" }
                : { backgroundColor: "#F1F5F9", color: "#1F2937" }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="bg-slate-100 rounded-xl px-3 py-2 flex gap-1">
              {[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#0F8F5F", animationDelay: `${i * 0.12}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {QUICK_QS.map((q) => (
          <button key={q} onClick={() => askAI(q)} className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:bg-emerald-50 transition" style={{ color: "#4B5563" }}>{q}</button>
        ))}
      </div>

      <div className="border-t border-slate-100 p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
          placeholder="Ask about this campaign…"
          className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-400"
        />
        <button
          onClick={() => askAI()}
          disabled={typing || !input.trim()}
          className="px-3 py-2 rounded-xl text-white disabled:opacity-50 transition"
          style={{ backgroundColor: "#0F8F5F" }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


export function CampaignLanding({ slug }: { slug: string }) {
  const { campaign, loading, notFound } = useCampaignBySlug(slug);
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);
  const scanTracked = useRef(false);

  const campaignLink = useMemo(() => getCampaignUrl(slug), [slug]);
  const upiLink = useMemo(() => generateUpiLink({ amount }), [amount]);
  const upiQrUrl = useMemo(() => generateUpiQrUrl({ amount }, 220), [amount]);
  const campaignQrUrl = useMemo(() => generateQrUrl(campaignLink, 220), [campaignLink]);

  const effectiveAmount = customAmount ? Math.max(10, Number(customAmount) || 0) : amount;

  // Track campaign scan
  useEffect(() => {
    if (!slug || scanTracked.current || typeof window === "undefined") return;
    const key = `daansetu.scan.${slug}`;
    if (sessionStorage.getItem(key)) { scanTracked.current = true; return; }
    sessionStorage.setItem(key, "1");
    scanTracked.current = true;
    incrementCampaignScan(slug).catch(console.warn);
  }, [slug]);

  const pct = campaign ? Math.min(100, Math.round(((campaign.raised ?? 0) / (campaign.goal || 1)) * 100)) : 0;
  const score = campaign?.trustScore ?? 82;

  async function handleCopy() {
    try { await navigator.clipboard.writeText(campaignLink); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }

  function handleWhatsApp() {
    if (!campaign) return;
    const text = buildWhatsAppShareText({
      title: campaign.title,
      raised: campaign.raised ?? 0,
      goal: campaign.goal ?? 0,
      trustScore: score,
      campaignUrl: campaignLink,
      upiLink: generateUpiLink({ amount: 500 }),
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function handleDonate() {
    if (donating || !campaign) return;
    setDonating(true);
    try {
      await updateCampaignDonation(slug, effectiveAmount);
      setDonated(true);
      setTimeout(() => setDonated(false), 3000);
    } catch { /* fire-and-forget */ }
    // Open UPI deep link
    window.open(generateUpiLink({ amount: effectiveAmount, note: campaign.title }), "_blank");
    setDonating(false);
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)]" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 animate-pulse">
          <div className="h-6 w-32 rounded-lg bg-slate-100 mb-8" />
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-5">
              <div className="h-10 w-3/4 rounded-xl bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-40 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
            </div>
            <div className="h-[520px] rounded-2xl bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (notFound || !campaign) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="text-center px-6 py-20">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: "#F3F4F6" }}>
            <Heart className="w-9 h-9" style={{ color: "#D1D5DB" }} />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1F2937" }}>Campaign not found</h1>
          <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>This campaign may have ended or the link might be incorrect.</p>
          <Link href="/qr-campaign" className="mt-6 inline-flex items-center gap-1 text-sm" style={{ color: "#0F8F5F" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Browse all campaigns
          </Link>
        </div>
      </main>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      {/* Hero gradient band */}
      <div style={{ background: "linear-gradient(135deg, #0a4f35 0%, #0F8F5F 50%, #10b981 100%)" }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="max-w-6xl mx-auto px-6 py-10 relative">
          <Link href="/qr-campaign" className="inline-flex items-center gap-1.5 text-sm mb-6 text-white/80 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" /> All campaigns
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {campaign.verified !== false && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Campaign
              </span>
            )}
            <UrgencyPill urgency={campaign.urgency} />
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Trust Score: {score}/100
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl" style={{ letterSpacing: "-0.02em" }}>
            {campaign.title}
          </h1>
          <p className="mt-3 text-white/70 text-sm max-w-xl">
            {campaign.city} · by {campaign.creator} · {campaign.ngoName ?? "DaanSetu Verified NGO"}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Beneficiary image */}
            {campaign.beneficiaryImage && (
              <div className="rounded-3xl overflow-hidden aspect-video w-full">
                <img src={campaign.beneficiaryImage} alt={campaign.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Progress card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl font-bold" style={{ color: "#0F8F5F" }}>₹{(campaign.raised ?? 0).toLocaleString("en-IN")}</span>
                <span className="text-sm" style={{ color: "#6B7280" }}>of ₹{(campaign.goal ?? 0).toLocaleString("en-IN")} goal</span>
              </div>

              {/* Animated progress bar */}
              <div className="mt-4 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0F8F5F, #10b981, #34d399)" }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "#6B7280" }}>
                <span className="font-semibold" style={{ color: "#0F8F5F" }}>{pct}% funded</span>
                <span>{campaign.donorCount ?? campaign.supporters ?? 0} donors</span>
              </div>

              {/* Stats grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Users className="w-4 h-4" />, label: "Donors", value: (campaign.donorCount ?? campaign.supporters ?? 0).toLocaleString("en-IN") },
                  { icon: <Zap className="w-4 h-4" />, label: "Scans", value: (campaign.scanCount ?? 0).toLocaleString("en-IN") },
                  { icon: <Star className="w-4 h-4" />, label: "Trust", value: `${score}/100` },
                  { icon: <Heart className="w-4 h-4" />, label: "Status", value: pct >= 100 ? "Funded!" : "Active" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1" style={{ color: "#0F8F5F" }}>{item.icon}<span className="text-xs" style={{ color: "#6B7280" }}>{item.label}</span></div>
                    <div className="font-semibold text-sm" style={{ color: "#1F2937" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Story */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                <span className="font-semibold" style={{ color: "#1F2937" }}>Campaign Story</span>
              </div>
              <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "#4B5563" }}>
                {campaign.story ?? campaign.description ?? "Support this verified DaanSetu campaign and help us reach the goal."}
              </p>
            </div>

            {/* Trust score visual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4" style={{ color: trustColor(score) }} />
                <span className="font-semibold" style={{ color: "#1F2937" }}>Trust & Transparency</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={trustColor(score)} strokeWidth="3"
                      strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: trustColor(score) }}>{score}</span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>/100</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["80G Tax Exemption", "FCRA Aligned", "UPI Verified", "NGO Audited", "Instant Receipt", "WhatsApp Support"].map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "#D1FAE5", backgroundColor: "#F0FDF4", color: "#059669" }}>
                      <CheckCircle2 className="w-3 h-3" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline updates */}
            {campaign.updates && campaign.updates.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                  <span className="font-semibold" style={{ color: "#1F2937" }}>Campaign Updates</span>
                </div>
                <ol className="relative border-l border-slate-200 space-y-4 ml-2">
                  {campaign.updates.map((upd, i) => (
                    <li key={i} className="pl-5 relative">
                      <div className="absolute -left-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: "#0F8F5F", top: "2px" }} />
                      <div className="text-xs" style={{ color: "#6B7280" }}>{upd.date}</div>
                      <div className="text-sm mt-0.5" style={{ color: "#374151" }}>{upd.text}</div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* AI Campaign Helper */}
            <CampaignAIHelper slug={slug} campaignTitle={campaign.title} />

            {/* Share card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                <span className="font-semibold" style={{ color: "#1F2937" }}>Share this campaign</span>
              </div>
              <p className="text-xs mb-4" style={{ color: "#6B7280" }}>Every share brings ₹420 in average donations. Go viral!</p>
              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-whatsapp-share"
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition hover:opacity-90"
                  style={{ backgroundColor: "#25D366", borderColor: "#25D366", color: "white" }}
                >
                  <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                </button>
                <button
                  id="btn-copy-link"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  style={{ color: "#1F2937" }}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button
                  id="btn-download-poster"
                  onClick={() => downloadPoster(campaign, campaignLink, upiLink)}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  style={{ color: "#1F2937" }}
                >
                  <Download className="w-4 h-4" /> Download Poster
                </button>
              </div>
              <div className="mt-3 text-xs px-3 py-2 rounded-lg break-all" style={{ backgroundColor: "#F5F7F6", color: "#4B5563" }}>
                {campaignLink}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <aside>
            <div className="sticky top-24 space-y-5">

              {/* Donation widget */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold tracking-wider mb-4" style={{ color: "#0F8F5F" }}>DONATE NOW</div>

                {/* Amount presets */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[100, 500, 1000].map((v) => (
                    <AmountBtn key={v} value={v} selected={amount === v && !customAmount} onSelect={() => { setAmount(v); setCustomAmount(""); }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm" style={{ color: "#6B7280" }}>₹</span>
                  <input
                    type="number"
                    min={10}
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                    id="input-custom-amount"
                  />
                </div>

                {/* Donate button */}
                <Button
                  id="btn-donate-upi"
                  className="w-full text-white hover:opacity-90 text-base py-3 h-auto"
                  style={{ background: "linear-gradient(135deg, #0F8F5F, #10b981)", boxShadow: "0 4px 20px rgba(15,143,95,0.35)" }}
                  onClick={handleDonate}
                  disabled={donating}
                >
                  {donated ? (
                    <><Check className="w-4 h-4 mr-2" /> Thank you! 🙏</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" /> Donate ₹{effectiveAmount.toLocaleString("en-IN")} via UPI</>
                  )}
                </Button>

                {/* WhatsApp donate CTA */}
                <button
                  id="btn-donate-whatsapp"
                  onClick={handleWhatsApp}
                  className="mt-2 w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border transition"
                  style={{ backgroundColor: "#F0FDF4", borderColor: "#A7F3D0", color: "#059669" }}
                >
                  <MessageCircle className="w-4 h-4" /> Donate via WhatsApp
                </button>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1.5" style={{ color: "#6B7280" }}>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> 80G tax exemption available</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> 100% routed via verified NGOs</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Instant UPI payment</div>
                </div>
              </div>

              {/* Campaign QR */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-wider mb-3" style={{ color: "#0F8F5F" }}>SCAN TO VISIT CAMPAIGN</div>
                <div className="rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                  {campaignQrUrl && (
                    <img src={campaignQrUrl} alt="Campaign QR Code" className="w-full max-w-[200px] mx-auto" />
                  )}
                </div>
                <p className="mt-2 text-center text-xs" style={{ color: "#9CA3AF" }}>Scan to open campaign page</p>
              </div>

              {/* UPI QR */}
              <div className="rounded-2xl border shadow-sm p-5" style={{ borderColor: "#A7F3D0", backgroundColor: "#F0FDF4" }}>
                <div className="text-xs font-semibold tracking-wider mb-3" style={{ color: "#0F8F5F" }}>SCAN TO PAY DIRECTLY</div>
                <div className="rounded-xl overflow-hidden bg-white flex items-center justify-center p-2 border border-emerald-100">
                  {upiQrUrl && (
                    <img src={upiQrUrl} alt="UPI Payment QR" className="w-full max-w-[200px] mx-auto" />
                  )}
                </div>
                <p className="mt-2 text-center text-xs" style={{ color: "#059669" }}>Opens Google Pay · PhonePe · Paytm</p>
                <div className="mt-2 text-center">
                  <a
                    id="link-upi-deeplink"
                    href={upiLink}
                    className="inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: "#0F8F5F" }}
                  >
                    <ExternalLink className="w-3 h-3" /> Open UPI App
                  </a>
                </div>
              </div>

              {/* DaanSetu branding */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#0F8F5F" }}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 7v10l8 5 8-5V7z" /><path d="M12 22V12" /><path d="M4 7l8 5 8-5" /></svg>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "#1F2937" }}>DaanSetu</span>
                </div>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>India's Trust Layer for Giving</p>
                <Link href="/" className="text-xs mt-1 inline-block" style={{ color: "#0F8F5F" }}>daan-setu-mu.vercel.app</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
