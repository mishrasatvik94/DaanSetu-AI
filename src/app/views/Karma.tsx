"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Sparkles, Flame, Gift, ArrowRight, Lock, CheckCircle2, Utensils, HeartHandshake, QrCode, Target, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHeader } from "./PageHeader";
import { BADGES, DONATION_HISTORY, IMPACT_SUMMARY, LEVELS, MILESTONES, RECENT_UNLOCK, SOURCES, TOTAL_KARMA, getCurrentLevel, getImpactSummaryText } from "../data/karma";
import { useKarmaScore } from "@/lib/use-firestore";

export function Karma() {
  const router = useRouter();
  const { score: firestoreScore } = useKarmaScore();
  const karma = firestoreScore; // real score from Firestore, falls back to mock
  const { current, next, pct, idx } = getCurrentLevel(karma);
  const [displayScore, setDisplayScore] = useState(0);
  const [showUnlock, setShowUnlock] = useState(true);
  const rank = 4;

  useEffect(() => {
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplayScore(Math.round(karma * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [karma]);

  useEffect(() => {
    if (!showUnlock) return;
    const timeout = setTimeout(() => setShowUnlock(false), 3600);
    return () => clearTimeout(timeout);
  }, [showUnlock]);

  const earnedBadges = useMemo(() => BADGES.filter((badge) => badge.earned), []);

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="KARMASCORE" title="Your impact, scored." subtitle="Every meal, referral, and pickup adds to your KarmaScore. Climb tiers, unlock badges, get recognised." />

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-6">
        {showUnlock && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              {["✨", "🏆", "🌱", "💚", "⭐", "🤝"].map((icon, index) => (
                <span
                  key={icon + index}
                  className="absolute text-lg animate-bounce"
                  style={{
                    left: `${10 + index * 15}%`,
                    top: index % 2 === 0 ? "12%" : "58%",
                    animationDelay: `${index * 0.12}s`,
                    opacity: 0.28,
                  }}
                >
                  {icon}
                </span>
              ))}
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
              <Sparkles className="w-5 h-5" style={{ color: "#0F8F5F" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>BADGE UNLOCKED</div>
              <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>{RECENT_UNLOCK.emoji} {RECENT_UNLOCK.name}</div>
              <div className="mt-1 text-sm" style={{ color: "#6B7280" }}>{RECENT_UNLOCK.description}</div>
            </div>
            <button type="button" onClick={() => setShowUnlock(false)} className="p-1 rounded-md hover:bg-slate-100">
              <X className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(900px 240px at 80% -10%, ${current.ring}, transparent 60%)` }} />
          <div className="relative grid lg:grid-cols-[1fr_360px] gap-10 p-8 md:p-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs" style={{ color: current.color }}>
                <span>{current.emoji}</span> {current.name} tier
              </div>
              <div className="mt-5 flex items-baseline gap-3">
                <span style={{ color: "#1F2937", fontSize: "clamp(2.75rem, 6vw, 4.25rem)", lineHeight: 1, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {displayScore.toLocaleString("en-IN")}
                </span>
                <span className="text-sm" style={{ color: "#6B7280" }}>karma</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm" style={{ color: "#4B5563" }}>
                <span className="inline-flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> Rank #{rank} in Mumbai</span>
                <span className="inline-flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" style={{ color: "#E5484D" }} /> 12-day streak</span>
                <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> {earnedBadges.length} badges unlocked</span>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between text-xs" style={{ color: "#6B7280" }}>
                  <span>{current.emoji} {current.name}</span>
                  {next && <span>{next.emoji} {next.name} · {next.threshold.toLocaleString("en-IN")}</span>}
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${current.color}, ${next?.color ?? current.color})` }} />
                </div>
                <div className="mt-2 text-xs" style={{ color: "#6B7280" }}>
                  {next ? <>{(next.threshold - karma).toLocaleString("en-IN")} karma to <span style={{ color: "#1F2937", fontWeight: 500 }}>{next.name}</span></> : "Max tier reached."}
                </div>
              </div>

              <div className="mt-7 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <MetricCard icon={Utensils} label="Meals donated" value={IMPACT_SUMMARY.mealsDonated.toLocaleString("en-IN")} detail="Across verified NGOs" />
                <MetricCard icon={HeartHandshake} label="Donations completed" value={IMPACT_SUMMARY.donationsCompleted.toString()} detail="Food + emergency drives" />
                <MetricCard icon={QrCode} label="Campaign contributions" value={IMPACT_SUMMARY.campaignContributions.toString()} detail="QR support actions" />
                <MetricCard icon={Target} label="Impact summary" value={`${IMPACT_SUMMARY.familiesReached}`} detail="Families reached" />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => router.push("/ai-assistant")}>Earn more karma <ArrowRight className="ml-1 w-4 h-4" /></Button>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => router.push("/leaderboard")}>See leaderboard</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>TIER LADDER</div>
              <div className="mt-3 space-y-2">
                {LEVEL_ROWS(idx).map((row) => (
                  <div key={row.key} className="flex items-center gap-3 p-2.5 rounded-xl transition hover:bg-slate-50" style={{ backgroundColor: row.isCurrent ? "#F3FBF6" : "transparent", border: row.isCurrent ? "1px solid #D4E9DD" : "1px solid transparent" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: row.reached ? row.ring : "#F5F7F6", opacity: row.reached ? 1 : 0.6 }}>{row.emoji}</div>
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: "#1F2937", fontWeight: row.isCurrent ? 600 : 500 }}>{row.name}</div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{row.threshold.toLocaleString("en-IN")} karma</div>
                    </div>
                    {row.reached ? <CheckCircle2 className="w-4 h-4" style={{ color: row.color }} /> : <Lock className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>SCORE BREAKDOWN</div>
                <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>How you earned your karma</div>
              </div>
              <span className="text-xs" style={{ color: "#6B7280" }}>Mock scoring logic</span>
            </div>
            <div className="mt-5 space-y-4">
              {SOURCES.map((source) => (
                <div key={source.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span style={{ color: "#1F2937" }}>{source.label}</span>
                    <span style={{ color: "#1F2937", fontWeight: 600 }}>+{source.points * source.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${source.weight * 100}%`, backgroundColor: "#0F8F5F" }} />
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                    {source.count} × {source.points} points · {(source.weight * 100).toFixed(0)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" style={{ color: "#D4AF37" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Impact summary</span>
              </div>
              <p className="mt-3 text-sm" style={{ color: "#4B5563", lineHeight: 1.7 }}>{getImpactSummaryText()}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <SummaryBox label="Cities helped" value={IMPACT_SUMMARY.citiesHelped.toString()} />
                <SummaryBox label="CO2 saved" value={`${IMPACT_SUMMARY.co2SavedKg} kg`} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: "#E5484D" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Recent score events</span>
              </div>
              <div className="mt-4 space-y-3">
                {DONATION_HISTORY.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition">
                    <div>
                      <div className="text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>{item.title}</div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{item.ngo} · {item.dateLabel}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>+{item.karma}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>BADGES</div>
              <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>{earnedBadges.length} of {BADGES.length} unlocked</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {BADGES.map((badge) => (
              <div key={badge.key} className="rounded-xl border border-slate-200 p-4 text-center relative transition hover:-translate-y-0.5 hover:shadow-sm" style={{ backgroundColor: badge.earned ? "#FAFAF8" : "#FFFFFF", opacity: badge.earned ? 1 : 0.55 }}>
                <div className="text-3xl">{badge.emoji}</div>
                <div className="mt-2 text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>{badge.name}</div>
                <div className="mt-1 text-xs" style={{ color: "#6B7280", lineHeight: 1.4 }}>{badge.description}</div>
                {badge.earned ? (
                  <div className="mt-2 text-[11px]" style={{ color: "#0F8F5F" }}>{badge.unlockedAt}</div>
                ) : (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#F5F7F6", color: "#6B7280" }}>
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>MILESTONES</div>
              <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>Your road to Legend</div>
            </div>
            <span className="text-xs" style={{ color: "#6B7280" }}>{IMPACT_SUMMARY.mealsDonated} meals donated</span>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1 bottom-1 w-px bg-slate-200" />
            <div className="space-y-4">
              {MILESTONES.map((milestone) => (
                <div key={milestone.meals} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: milestone.achieved ? "#0F8F5F" : "#F5F7F6", border: milestone.achieved ? "none" : "1px solid #E5E7EB" }}>
                    {milestone.achieved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Lock className="w-3 h-3" style={{ color: "#9CA3AF" }} />}
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <div className="text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>{milestone.meals.toLocaleString("en-IN")} meals · {milestone.reward}</div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{milestone.achieved ? "Unlocked" : "Locked"}</div>
                    </div>
                    {!milestone.achieved && (
                      <div className="text-xs" style={{ color: "#6B7280" }}>
                        {Math.max(0, milestone.meals - IMPACT_SUMMARY.mealsDonated)} to go
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LEVEL_ROWS(currentIdx: number) {
  return LEVELS.map((level, index) => ({
    ...level,
    reached: index <= currentIdx,
    isCurrent: index === currentIdx,
  }));
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:-translate-y-0.5 transition">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
        <Icon className="w-4 h-4" style={{ color: "#0F8F5F" }} />
      </div>
      <div className="mt-3 text-xs" style={{ color: "#6B7280" }}>{label}</div>
      <div className="mt-1" style={{ color: "#1F2937", fontSize: "1.5rem", fontWeight: 600 }}>{value}</div>
      <div className="mt-1 text-xs" style={{ color: "#6B7280" }}>{detail}</div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="text-xs" style={{ color: "#6B7280" }}>{label}</div>
      <div className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
