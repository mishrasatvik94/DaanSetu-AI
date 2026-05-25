import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Award, Utensils, Sparkles, ArrowRight, Flame, Trophy, MapPin, Mail, Phone, Settings, LogOut, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHeader } from "./PageHeader";
import { BADGES, DONATION_HISTORY, IMPACT_SUMMARY, LEADERBOARD_ROWS, TOTAL_KARMA, getCurrentLevel, getImpactSummaryText } from "../data/karma";
import { listPersonalCampaigns } from "../data/campaigns";
import { useAuth, signOut, initials } from "../data/auth";

const LEADERBOARD_TOTAL = 12842;

export function Profile() {
  const router = useRouter();
  const user = useAuth();
  const campaigns = useMemo(() => listPersonalCampaigns().slice(0, 3), []);
  const leaderboardMe = LEADERBOARD_ROWS.find((row) => row.name === "Satvik Mishra") ?? LEADERBOARD_ROWS[3];

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) return null;

  const { current, next, pct } = getCurrentLevel(TOTAL_KARMA);
  const earned = BADGES.filter((badge) => badge.earned);

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="YOUR ACCOUNT" title="Profile" subtitle="Your impact at a glance." />

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(800px 200px at 90% -20%, ${current.ring}, transparent 60%)` }} />
          <div className="relative p-6 md:p-8 flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F", fontWeight: 600 }}>
              {initials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="tracking-tight" style={{ color: "#1F2937", fontSize: "1.5rem", lineHeight: 1.15, fontWeight: 600 }}>{user.name}</h2>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-white" style={{ color: current.color }}>
                  <span>{current.emoji}</span> {current.name} tier
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FBF5DE", color: "#9A7B0F" }}>
                  <Trophy className="w-3 h-3" /> Rank #{leaderboardMe.rank}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 flex-wrap text-xs" style={{ color: "#6B7280" }}>
                <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                {user.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>}
                {user.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user.city}</span>}
                <span>Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => router.push("/karma")}>
                <Award className="w-4 h-4 mr-1.5" /> KarmaScore
              </Button>
              <Button variant="ghost" className="text-slate-600 hover:bg-slate-100" onClick={() => { signOut().then(() => router.push("/")).catch(console.error); }}>
                <LogOut className="w-4 h-4 mr-1.5" /> Sign out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Utensils} value={IMPACT_SUMMARY.mealsDonated.toString()} label="Meals donated" trend="+18 this week" />
          <Stat icon={Award} value={TOTAL_KARMA.toLocaleString("en-IN")} label="KarmaScore" trend={`${pct}% to ${next?.name ?? "max"}`} />
          <Stat icon={Flame} value={`${IMPACT_SUMMARY.donationsCompleted}`} label="Donations completed" trend="verified pickup count" />
          <Stat icon={Sparkles} value={`${IMPACT_SUMMARY.campaignContributions}`} label="Campaign contributions" trend="QR and fundraiser support" />
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <Link href="/karma" className="block rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-[0_12px_32px_-16px_rgba(15,143,95,0.25)] transition relative overflow-hidden">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>KARMASCORE</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span style={{ color: "#1F2937", fontSize: "2rem", lineHeight: 1, fontWeight: 600 }}>{TOTAL_KARMA.toLocaleString("en-IN")}</span>
                    <span className="text-xs" style={{ color: "#6B7280" }}>karma</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden max-w-md">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${current.color}, ${next?.color ?? current.color})` }} />
                  </div>
                  <div className="mt-2 text-xs" style={{ color: "#6B7280" }}>
                    {next ? <>{(next.threshold - TOTAL_KARMA).toLocaleString("en-IN")} to {next.emoji} {next.name}</> : "Max tier reached"}
                  </div>
                </div>
                <span className="text-xs inline-flex items-center gap-1" style={{ color: "#0F8F5F" }}>
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="text-xs mb-3" style={{ color: "#6B7280" }}>Recent badges · {earned.length} of {BADGES.length}</div>
                <div className="flex flex-wrap gap-2">
                  {earned.slice(0, 5).map((badge) => (
                    <span key={badge.key} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-slate-200" style={{ backgroundColor: "#FAFAF8", color: "#1F2937" }}>
                      <span>{badge.emoji}</span> {badge.name}
                    </span>
                  ))}
                  {BADGES.length - earned.length > 0 && (
                    <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>
                      +{BADGES.length - earned.length} more
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div style={{ color: "#1F2937", fontWeight: 600 }}>Donation history</div>
                <span className="text-xs" style={{ color: "#6B7280" }}>Last 30 days</span>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {DONATION_HISTORY.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div style={{ color: "#1F2937" }}>{item.title}</div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>to {item.ngo} · {item.dateLabel}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>+{item.karma} karma</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ color: "#1F2937", fontWeight: 600 }}>Your campaigns</div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>Personal fundraisers you've supported or launched</div>
                </div>
                <Link href="/qr-campaign" className="text-xs inline-flex items-center gap-1" style={{ color: "#0F8F5F" }}>
                  All campaigns <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {campaigns.length === 0 ? (
                  <div className="col-span-2 text-sm text-center py-8 rounded-xl border border-dashed border-slate-200" style={{ color: "#6B7280" }}>
                    No campaigns yet. <Link href="/qr-campaign" style={{ color: "#0F8F5F" }}>Start one →</Link>
                  </div>
                ) : campaigns.map((campaign) => {
                  const cpct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
                  return (
                    <Link key={campaign.slug} href={`/qr-campaign/${campaign.slug}`} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#0F8F5F" }}>
                        <QrCode className="w-3.5 h-3.5" /> Campaign
                      </div>
                      <div className="mt-2 text-sm truncate" style={{ color: "#1F2937", fontWeight: 500 }}>{campaign.title}</div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ backgroundColor: "#0F8F5F", width: `${cpct}%` }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-xs" style={{ color: "#6B7280" }}>
                        <span>₹{campaign.raised.toLocaleString("en-IN")}</span>
                        <span>{cpct}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: "#D4AF37" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Leaderboard rank</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span style={{ color: "#1F2937", fontSize: "2.25rem", lineHeight: 1, fontWeight: 600 }}>#{leaderboardMe.rank}</span>
                <span className="text-xs" style={{ color: "#6B7280" }}>of {LEADERBOARD_TOTAL.toLocaleString("en-IN")} this month</span>
              </div>
              <div className="mt-3 text-xs" style={{ color: "#0F8F5F" }}>Up 2 spots this week</div>
              <Button variant="outline" className="mt-5 w-full border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => router.push("/leaderboard")}>See leaderboard</Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div style={{ color: "#1F2937", fontWeight: 600 }}>Reputation summary</div>
              <p className="mt-2 text-sm" style={{ color: "#4B5563", lineHeight: 1.7 }}>{getImpactSummaryText()}</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2" style={{ color: "#4B5563" }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: "#0F8F5F" }} /> {earned.length} achievements unlocked
                </div>
                <div className="flex items-center gap-2" style={{ color: "#4B5563" }}>
                  <Sparkles className="w-4 h-4" style={{ color: "#0F8F5F" }} /> {IMPACT_SUMMARY.citiesHelped} cities supported
                </div>
              </div>
              <Button className="mt-5 w-full text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => router.push("/ai-assistant")}>Donate again</Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" style={{ color: "#6B7280" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Achievements</span>
              </div>
              <div className="mt-4 space-y-2">
                {earned.map((badge) => (
                  <div key={badge.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition">
                    <span className="text-sm" style={{ color: "#1F2937" }}>{badge.emoji} {badge.name}</span>
                    <span className="text-[11px]" style={{ color: "#0F8F5F" }}>{badge.unlockedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, value, label, trend }: { icon: any; value: string; label: string; trend?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
        <Icon className="w-4 h-4" style={{ color: "#0F8F5F" }} />
      </div>
      <div className="mt-4 tabular-nums" style={{ color: "#1F2937", fontSize: "1.5rem", lineHeight: 1, fontWeight: 600 }}>{value}</div>
      <div className="mt-1 text-xs" style={{ color: "#6B7280" }}>{label}</div>
      {trend && <div className="mt-2 text-[11px]" style={{ color: "#0F8F5F" }}>{trend}</div>}
    </div>
  );
}
