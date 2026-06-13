"use client";

import { useState } from "react";
import { addNeed, type NeedCategory, type NeedDoc, type NeedUrgency } from "@/lib/firestore-service";
import { NeedCard } from "@/app/components/NeedCard";
import { SAMPLE_NEEDS } from "@/app/data/needs";
import { Button } from "@/app/components/ui/button";

const categories: NeedCategory[] = ["Food", "Clothes", "Education", "Medical", "Emergency"];
const urgencies: NeedUrgency[] = ["Low", "Medium", "High"];

const emptyForm = {
  title: "",
  category: "Food" as NeedCategory,
  location: "",
  quantity: "",
  urgency: "Medium" as NeedUrgency,
  description: "",
  ngoName: "",
};

export default function NGOPage() {
  const [form, setForm] = useState(emptyForm);
  const [postedNeeds, setPostedNeeds] = useState<NeedDoc[]>(SAMPLE_NEEDS.slice(0, 2));
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const need: NeedDoc = {
      id: `demo-${Date.now()}`,
      ...form,
      verified: true,
      trustScore: 86,
      fulfilled: false,
    };
    setPostedNeeds((current) => [need, ...current]);
    setForm(emptyForm);
    const id = await addNeed(need);
    setStatus(id ? "Need posted to Firebase." : "Need added to demo mode. Firebase was not available.");
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-14" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-xs tracking-wider" style={{ color: "#0F8F5F", fontWeight: 600 }}>NGO DASHBOARD</div>
          <h1 className="mt-3 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, fontWeight: 600 }}>
            Post verified needs for donors to match.
          </h1>
          <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.7 }}>
            Create urgent requests with category, location, quantity, and trust metadata for the DaanSetu AI matching layer.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => update("title", value)} required />
              <Field label="NGO Name" value={form.ngoName} onChange={(value) => update("ngoName", value)} required />
              <Select label="Category" value={form.category} options={categories} onChange={(value) => update("category", value as NeedCategory)} />
              <Select label="Urgency" value={form.urgency} options={urgencies} onChange={(value) => update("urgency", value as NeedUrgency)} />
              <Field label="Location" value={form.location} onChange={(value) => update("location", value)} required />
              <Field label="Quantity" value={form.quantity} onChange={(value) => update("quantity", value)} required />
            </div>
            <label className="mt-4 block text-xs" style={{ color: "#4B5563" }}>
              Description
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                rows={5}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
              />
            </label>
            {status && <div className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>{status}</div>}
            <Button type="submit" className="mt-5 text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }}>
              Post Need
            </Button>
          </form>

          <div className="space-y-4">
            {postedNeeds.slice(0, 3).map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block text-xs" style={{ color: "#4B5563" }}>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs" style={{ color: "#4B5563" }}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
