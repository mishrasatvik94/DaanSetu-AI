"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Filter, MapPin, Search, ShieldCheck, TimerReset } from "lucide-react";
import { Button } from "../components/ui/button";
import { NGO_CATEGORIES, NGO_CITIES, NGOS, type NGOCategory, type NGOUrgency } from "../data/ngos";
import { PageHeader } from "./PageHeader";
import { useNGOs } from "@/lib/use-firestore";

// Derive city list from both mock and live data — rebuilt each render
const MOCK_CATEGORIES = ["All", ...NGO_CATEGORIES] as const;

export function NGOs() {
  const { ngos: liveNgos } = useNGOs(); // starts with mock, updates from Firestore
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [city, setCity] = useState<string>("All cities");

  // Derive city list dynamically from live data
  const allCities = useMemo(() => {
    const cities = Array.from(new Set(liveNgos.map((n) => n.city)));
    return ["All cities", ...cities];
  }, [liveNgos]);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    return liveNgos.filter((ngo) => {
      const matchesQuery =
        term.length === 0 ||
        ngo.name?.toLowerCase().includes(term) ||
        ngo.city?.toLowerCase().includes(term) ||
        ngo.focus?.toLowerCase().includes(term) ||
        ngo.description?.toLowerCase().includes(term);
      const matchesCategory = category === "All" || ngo.category === category;
      const matchesCity = city === "All cities" || ngo.city === city;
      return matchesQuery && matchesCategory && matchesCity;
    });
  }, [category, city, query, liveNgos]);

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="DIRECTORY" title="Verified NGO partners" subtitle="Every partner is verified, FCRA/80G compliant, and accountable for every meal." />

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7">
          <div className="grid xl:grid-cols-[minmax(0,1fr)_220px] gap-4">
            <div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by NGO, city, or food need"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-300"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {MOCK_CATEGORIES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
                    className="px-3 py-1.5 rounded-full border text-xs transition"
                    style={{
                      borderColor: category === option ? "#0F8F5F" : "#E5E7EB",
                      backgroundColor: category === option ? "#E8F5EE" : "#FFFFFF",
                      color: category === option ? "#0F8F5F" : "#4B5563",
                      fontWeight: category === option ? 600 : 500,
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4" style={{ backgroundColor: "#FAFAF8" }}>
              <div className="text-xs tracking-wider inline-flex items-center gap-1.5" style={{ color: "#0F8F5F" }}>
                <Filter className="w-3.5 h-3.5" /> City filter
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-3 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-300"
              >
                {allCities.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="mt-4 text-xs" style={{ color: "#6B7280" }}>
                {list.length} NGO{list.length === 1 ? "" : "s"} ready for donations right now.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((ngo) => (
            <article key={ngo.id} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-[0_12px_32px_-16px_rgba(15,143,95,0.25)] transition flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-slate-200 bg-white" style={{ color: "#0F8F5F" }}>
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                  <UrgencyBadge urgency={ngo.urgency} />
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F5F7F6", color: "#4B5563" }}>
                  {ngo.category}
                </span>
              </div>

              <div className="mt-4">
                <h2 style={{ color: "#1F2937", fontWeight: 600, fontSize: "1.125rem" }}>{ngo.name ?? "Unnamed NGO"}</h2>
                <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ngo.city ?? "City unavailable"}</span>
                  <span>·</span>
                  <span>{ngo.responseTime ?? "Response timing unavailable"}</span>
                </div>
                <p className="mt-3 text-sm" style={{ color: "#4B5563", lineHeight: 1.7 }}>{ngo.description ?? "Details coming soon."}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat label="Meals served" value={(ngo.mealsServed ?? 0).toLocaleString("en-IN")} />
                <Stat label="Top need" value={ngo.needs?.[0]?.quantity ?? "—"} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 p-4" style={{ backgroundColor: "#FAFAF8" }}>
                <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>ACTIVE NEEDS</div>
                <div className="mt-3 space-y-2">
                  {(ngo.needs ?? []).slice(0, 2).map((need) => (
                    <div key={need.title} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <div style={{ color: "#1F2937", fontWeight: 500 }}>{need.title}</div>
                        <div className="text-xs" style={{ color: "#6B7280" }}>{need.detail}</div>
                      </div>
                      <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded-full" style={{ backgroundColor: "#FFFFFF", color: "#0F8F5F" }}>
                        {need.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }}>
                  <Link href={`/ngos/${ngo.id}`}>
                    View profile <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <Link href={`/ngos/${ngo.id}#donate`}>Donate food</Link>
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs" style={{ color: "#6B7280" }}>
                <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> {ngo.verifiedTags?.[0] ?? "Verified NGO"}</span>
                <span className="inline-flex items-center gap-1"><TimerReset className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> {ngo.responseTime ?? "Response timing unavailable"}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs" style={{ color: "#6B7280" }}>{label}</div>
      <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: NGOUrgency }) {
  const tone = {
    High: { bg: "#FEF2F2", fg: "#B91C1C" },
    Medium: { bg: "#FBF5DE", fg: "#9A7B0F" },
    Low: { bg: "#E8F5EE", fg: "#0F8F5F" },
  }[urgency] ?? { bg: "#E8F5EE", fg: "#0F8F5F" };

  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: tone.bg, color: tone.fg }}>
      {urgency} urgency
    </span>
  );
}
