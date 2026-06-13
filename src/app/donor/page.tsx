"use client";

import { useEffect, useMemo, useState } from "react";
import { HeartHandshake, IndianRupee, Siren, Sparkles } from "lucide-react";
import { getNeeds, type NeedDoc } from "@/lib/firestore-service";
import { SAMPLE_NEEDS } from "@/app/data/needs";
import { NeedCard } from "@/app/components/NeedCard";

const statCards = [
  { title: "Recommended Needs", value: "4", icon: Sparkles },
  { title: "My Donations", value: "12", icon: IndianRupee },
  { title: "Impact Score", value: "860", icon: HeartHandshake },
  { title: "Urgent Campaigns", value: "2", icon: Siren },
];

export default function DonorPage() {
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

  const urgentNeeds = useMemo(() => needs.filter((need) => need.urgency === "High"), [needs]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-14" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-xs tracking-wider" style={{ color: "#0F8F5F", fontWeight: 600 }}>DONOR DASHBOARD</div>
          <h1 className="mt-3 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, fontWeight: 600 }}>
            Give smarter. Impact faster.
          </h1>
          <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.7 }}>
            AI-ranked needs help donors find verified NGO requests that match their budget, cause, and location.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <section key={card.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#4B5563" }}>{card.title}</span>
                  <Icon className="h-5 w-5" style={{ color: "#0F8F5F" }} />
                </div>
                <div className="mt-4" style={{ color: "#1F2937", fontSize: "2rem", fontWeight: 600 }}>{card.value}</div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {(urgentNeeds.length > 0 ? urgentNeeds : needs).slice(0, 4).map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      </div>
    </main>
  );
}
