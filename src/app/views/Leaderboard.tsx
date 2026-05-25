"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { getLevelByKey } from "../data/karma";
import { useLeaderboard } from "@/lib/use-firestore";

export function Leaderboard() {
  const { rows } = useLeaderboard(); // starts with mock, updates from Firestore

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="KARMA RANKINGS" title="Top donors this month" subtitle="Live rankings updated every hour. Karma is earned per verified pickup." />
      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 justify-between" style={{ backgroundColor: "#FAFAF8" }}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: "#D4AF37" }} />
              <span style={{ color: "#1F2937", fontWeight: 500 }}>May 2026</span>
            </div>
            <Link href="/karma" className="text-xs" style={{ color: "#0F8F5F" }}>Open your KarmaScore</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((row) => {
              const level = getLevelByKey(row.level);
              return (
                <div key={row.rank} className={`px-6 py-4 grid grid-cols-[48px_56px_1fr_120px_110px] items-center text-sm transition hover:bg-slate-50 ${row.name === "Satvik Mishra" ? "bg-[#F3FBF6]" : ""}`}>
                  <div style={{ color: row.rank <= 3 ? "#D4AF37" : "#9CA3AF", fontWeight: 600 }}>#{row.rank}</div>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F", fontWeight: 600 }}>
                    {row.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ color: "#1F2937", fontWeight: 500 }}>
                      {row.name}
                      <span className="text-[11px] px-2 py-1 rounded-full" style={{ backgroundColor: "#FAFAF8", color: level.color }}>
                        {row.badge} {level.name}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>{row.city}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full inline-flex items-center justify-center w-fit" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>
                    {row.karma.toLocaleString("en-IN")} karma
                  </div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>{level.emoji} {level.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
