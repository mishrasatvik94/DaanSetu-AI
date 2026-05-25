"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QrCode, Plus, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { QR_CAMPAIGNS } from "../data/ngos";
import { PageHeader } from "./PageHeader";
import { PersonalCard } from "../features/qrCampaign/PersonalCard";
import { CreateCampaignModal } from "../features/qrCampaign/CreateCampaignModal";
import { useCampaigns } from "@/lib/use-firestore";

export function QRCampaign() {
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "featured">("personal");
  const [open, setOpen] = useState(false);
  const { campaigns: fsCampaigns, loading } = useCampaigns();

  // Personal campaigns = those with individual creators (not "DaanSetu Team")
  const personal = fsCampaigns.filter((c) => c.creator !== "DaanSetu Team");
  // Featured = QR_CAMPAIGNS from mock (supplemented by Firestore featured drives)
  const featuredFromFS = fsCampaigns.filter((c) => c.creator === "DaanSetu Team");
  const featured = featuredFromFS.length > 0 ? featuredFromFS : QR_CAMPAIGNS.map((c) => ({ ...c, story: "", supporters: 0, karma: 0, createdAt: Date.now() }));

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="QR KINDNESS" title="Start a campaign. Scan to give." subtitle="Launch your own fundraiser in 60 seconds. Share a personal QR code. Watch meals fly off the goal." />

      <div className="max-w-6xl mx-auto px-6">
        {/* Creator hero */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden relative">
          <div className="relative grid lg:grid-cols-[1fr_320px] gap-8 p-8 md:p-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs" style={{ color: "#0F8F5F" }}>
                <Sparkles className="w-3 h-3" /> New · Personal fundraising
              </div>
              <h2 className="mt-4 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.1, fontWeight: 600 }}>
                Your QR. Your story. Bharat's plate.
              </h2>
              <p className="mt-3 max-w-lg" style={{ color: "#4B5563" }}>
                Birthdays, weddings, milestones — turn any moment into meals. We mint a personal QR you can share anywhere.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => setOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Start your campaign
                </Button>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => router.push("/karma")}>
                  Boost your KarmaScore
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-48 h-48 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-[0_20px_60px_-30px_rgba(15,143,95,0.4)]">
                <QrCode className="w-28 h-28" style={{ color: "#0F8F5F" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex items-center gap-2 border-b border-slate-200">
          {(["personal", "featured"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-3 text-sm border-b-2 -mb-px transition" style={{ color: tab === t ? "#0F8F5F" : "#6B7280", borderColor: tab === t ? "#0F8F5F" : "transparent", fontWeight: tab === t ? 500 : 400 }}>
              {t === "personal" ? "Personal campaigns" : "Featured drives"}
            </button>
          ))}
        </div>

        <div className="mt-6 pb-20 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tab === "personal" ? (
            <>
              <button onClick={() => setOpen(true)} className="rounded-2xl border border-dashed border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
                  <Plus className="w-5 h-5" style={{ color: "#0F8F5F" }} />
                </div>
                <div className="mt-4" style={{ color: "#1F2937", fontWeight: 600 }}>Start your campaign</div>
                <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>60 seconds. Your QR is ready instantly.</p>
              </button>
              {personal.map((c) => <PersonalCard key={c.slug} c={c} />)}
            </>
          ) : (
            <>
              {featured.map((c) => {
                const slug = "slug" in c ? c.slug : (c as { slug?: string }).slug ?? "";
                const goal = c.goal;
                const raised = c.raised;
                const city = c.city;
                const title = c.title;
                const days = "days" in c ? (c as { days?: number }).days : undefined;
                const pct = Math.min(100, Math.round((raised / goal) * 100));
                return (
                  <Link
                    key={slug}
                    href={`/qr-campaign/${slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-[0_12px_32px_-16px_rgba(15,143,95,0.25)] transition flex flex-col"
                  >
                    <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>FEATURED DRIVE</div>
                    <div className="mt-2" style={{ color: "#1F2937", fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
                    <div className="mt-1 text-xs" style={{ color: "#6B7280" }}>{city}{days ? ` · ${days} days remaining` : ""}</div>
                    <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0F8F5F, #19A06E)" }} />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between text-xs" style={{ color: "#6B7280" }}>
                      <span><span style={{ color: "#1F2937", fontWeight: 600 }}>₹{raised.toLocaleString("en-IN")}</span> of ₹{goal.toLocaleString("en-IN")}</span>
                      <span>{pct}%</span>
                    </div>
                    <span className="mt-4 text-xs inline-flex items-center gap-1" style={{ color: "#0F8F5F" }}>
                      Open campaign
                    </span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>

      {open && (
        <CreateCampaignModal
          onClose={() => setOpen(false)}
          onCreated={(c) => {
            setOpen(false);
            router.push(`/qr-campaign/${c.slug}`);
          }}
        />
      )}
    </main>
  );
}
