"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, HeartHandshake, ListChecks, Siren } from "lucide-react";
import { getNeeds, type NeedDoc } from "@/lib/firestore-service";
import { SAMPLE_NEEDS } from "@/app/data/needs";

export function Dashboard() {
  const [needs, setNeeds] = useState<NeedDoc[]>(SAMPLE_NEEDS);

  useEffect(() => {
    let cancelled = false;
    getNeeds().then((docs) => {
      if (!cancelled && docs.length > 0) setNeeds(docs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const urgent = needs.filter((need) => need.urgency === "High").length;
    const fulfilled = needs.filter((need) => need.fulfilled).length;
    return [
      { title: "Total Donations", value: "128", icon: HeartHandshake },
      { title: "Active NGO Requests", value: String(needs.filter((need) => !need.fulfilled).length), icon: ListChecks },
      { title: "Fulfilled Requests", value: String(fulfilled), icon: CheckCircle2 },
      { title: "Urgent Needs", value: String(urgent), icon: Siren },
    ];
  }, [needs]);

  const chartData = useMemo(() => {
    const categories = ["Food", "Clothes", "Education", "Medical", "Emergency"] as const;
    return categories.map((category) => ({
      category,
      active: needs.filter((need) => need.category === category && !need.fulfilled).length,
      urgent: needs.filter((need) => need.category === category && need.urgency === "High").length,
    }));
  }, [needs]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-14" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-xs tracking-wider" style={{ color: "#0F8F5F", fontWeight: 600 }}>REAL-TIME IMPACT DASHBOARD</div>
          <h1 className="mt-3 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, fontWeight: 600 }}>
            Firebase-powered tracking for every need.
          </h1>
          <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.7 }}>
            Demo metrics combine Firestore requests with fallback sample data, so judges can see the impact flow even offline.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <section key={stat.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#4B5563" }}>{stat.title}</span>
                  <Icon className="h-5 w-5" style={{ color: "#0F8F5F" }} />
                </div>
                <div className="mt-4" style={{ color: "#1F2937", fontSize: "2rem", fontWeight: 600 }}>{stat.value}</div>
              </section>
            );
          })}
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 style={{ color: "#1F2937", fontWeight: 600 }}>Need categories</h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>Active and urgent requests by donation type.</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>Live-ready</span>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} cursor={{ fill: "rgba(15,143,95,0.06)" }} />
                <Bar dataKey="active" fill="#0F8F5F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="urgent" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </main>
  );
}
