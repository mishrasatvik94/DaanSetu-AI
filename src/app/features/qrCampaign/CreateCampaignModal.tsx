"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { campaignUrl, createPersonalCampaign, type PersonalCampaign } from "../../data/campaigns";
import { createCampaignDoc } from "@/lib/firestore-service";
import { getUser } from "@/app/data/auth";

export function CreateCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: PersonalCampaign) => void;
}) {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [goal, setGoal] = useState(25000);
  const [creator, setCreator] = useState("");
  const [city, setCity] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !story || !goal) return;
    const c = createPersonalCampaign({ title, story, goal: Number(goal), creator, city });
    // Also write to Firestore
    const user = getUser();
    createCampaignDoc(c.campaignId ?? c.slug, {
      campaignName: c.campaignName ?? c.title,
      campaignId: c.campaignId ?? c.slug,
      slug: c.campaignId ?? c.slug,
      qrUrl: c.qrUrl ?? campaignUrl(c.campaignId ?? c.slug),
      scanCount: c.scanCount ?? 0,
      title: c.title,
      story: c.story,
      goal: c.goal,
      raised: 0,
      creator: creator || user?.name || "Anonymous donor",
      city: city || "India",
      supporters: 0,
      donorCount: 0,
      trustScore: 82,
      verified: true,
      urgency: "medium",
      createdAt: c.createdAt,
    }).catch(console.error);
    onCreated(c);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6 py-10" style={{ backgroundColor: "rgba(31,41,55,0.45)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-7 shadow-xl">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>
        <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>NEW CAMPAIGN</div>
        <h3 className="mt-1 tracking-tight" style={{ color: "#1F2937", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 600 }}>Launch your fundraiser</h3>
        <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>Your personal QR code will be generated instantly.</p>

        <div className="mt-6 space-y-4">
          <Field label="Campaign title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="My 1,000 meals pledge" className="input" />
          </Field>
          <Field label="Your story">
            <textarea value={story} onChange={(e) => setStory(e.target.value)} required rows={3} placeholder="Why are you raising? Who will it help?" className="input resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Goal (₹)">
              <input type="number" min={1000} step={500} value={goal} onChange={(e) => setGoal(Number(e.target.value))} required className="input" />
            </Field>
            <Field label="City">
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className="input" />
            </Field>
          </div>
          <Field label="Your name (shown publicly)">
            <input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="Satvik Mishra" className="input" />
          </Field>
        </div>

        <div className="mt-7 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }}>Generate QR & launch</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs" style={{ color: "#4B5563" }}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
