"use client";

import { useLiveDashboardSummary } from "@/lib/use-firestore";

export function Impact() {
  const { stats } = useLiveDashboardSummary();

  const impactStats = [
    { value: stats.conversations.toLocaleString("en-IN"), label: "WhatsApp conversations" },
    { value: stats.pickupRequests.toLocaleString("en-IN"), label: "Pickup requests" },
    { value: stats.donations.toLocaleString("en-IN"), label: "Donations" },
    { value: stats.ngos.toLocaleString("en-IN"), label: "NGOs onboarded" },
  ];

  return (
    <section id="impact" className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>IMPACT TO DATE</div>
          <h2 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15, fontWeight: 600 }}>
            Every meal, accounted for.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
          {impactStats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-10 text-center">
              <div style={{ color: "#0F8F5F", fontSize: "2.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div className="mt-2 text-sm" style={{ color: "#4B5563" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
