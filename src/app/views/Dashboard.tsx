import { useMemo, useState } from "react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, Activity, MapPin, Truck, Users } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { COLORS, tooltipStyle } from "./dashboard/constants";
import { RANGES, type Range, buildSeries, CITY_DIST, RECENT } from "./dashboard/mock";
import { Card, CityDistribution, LiveFeed, LivePill, LiveStats, VolunteerActivity } from "./dashboard/components";
import { useLiveDashboardSummary } from "@/lib/use-firestore";

export function Dashboard() {
  const [range, setRange] = useState<Range>("7d");
  const series = useMemo(() => buildSeries(range), [range]);
  const cities = useMemo(() => CITY_DIST, []);
  const { stats, feed } = useLiveDashboardSummary();

  return (
    <main style={{ backgroundColor: COLORS.cream }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="LIVE IMPACT" title="Real-time impact dashboard" subtitle="Every meal, every pickup, every volunteer — accounted for in real time." />

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-6">
        {/* Range tabs + live pill */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className="text-sm px-3 py-1.5 rounded-lg transition" style={{ backgroundColor: range === r ? COLORS.primary : "transparent", color: range === r ? "#fff" : COLORS.muted, fontWeight: range === r ? 500 : 400 }}>
                {r}
              </button>
            ))}
          </div>
          <LivePill />
        </div>

        {/* Stat tiles */}
        <LiveStats stats={stats} />

        {/* Meals served area chart + Pickups bar */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
          <Card title="Meals served" subtitle={`Trend · ${range}`} accent={<Activity className="w-4 h-4" style={{ color: COLORS.primary }} />}>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -16 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: COLORS.primary, strokeOpacity: 0.2 }} />
                  <Area type="monotone" dataKey="meals" stroke={COLORS.primary} strokeWidth={2.2} fill={COLORS.primary} fillOpacity={0.15} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Pickups completed" subtitle={`Daily · ${range}`} accent={<Truck className="w-4 h-4" style={{ color: COLORS.primary }} />}>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -16 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(15,143,95,0.06)" }} />
                  <Bar dataKey="pickups" fill={COLORS.primary} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Live feed + city distribution */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
          <Card title="Live donation feed" subtitle="Real pickups across India" accent={<span className="inline-flex w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.primary }} />}>
            <LiveFeed items={feed} />
          </Card>

          <Card title="City distribution" subtitle="Meals served by city" accent={<MapPin className="w-4 h-4" style={{ color: COLORS.primary }} />}>
            <CityDistribution cities={cities} />
          </Card>
        </div>

        {/* Recent pickups + volunteer activity */}
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <Card title="Recent pickups" subtitle="Verified handoffs across NGO partners" accent={<TrendingUp className="w-4 h-4" style={{ color: COLORS.primary }} />}>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="px-4 py-2.5 text-xs grid grid-cols-[1fr_90px_120px_100px] gap-3" style={{ backgroundColor: COLORS.cream, color: COLORS.muted }}>
                <span>Donor</span><span>Meals</span><span>NGO</span><span className="text-right">Status</span>
              </div>
              <div className="divide-y divide-slate-100">
                {RECENT.map((r) => (
                  <div key={r.id} className="px-4 py-3 grid grid-cols-[1fr_90px_120px_100px] gap-3 items-center text-sm">
                    <div className="min-w-0">
                      <div className="truncate" style={{ color: COLORS.ink }}>{r.donor}</div>
                      <div className="text-xs" style={{ color: COLORS.muted }}>{r.area}</div>
                    </div>
                    <div style={{ color: COLORS.ink }}>{r.meals}</div>
                    <div className="text-xs truncate" style={{ color: COLORS.muted }}>{r.ngo}</div>
                    <div className="text-xs text-right">
                      <span className="px-2 py-1 rounded-full" style={{ backgroundColor: r.status === "Delivered" ? "#E8F5EE" : r.status === "On route" ? "#FBF5DE" : "#F5F7F6", color: r.status === "Delivered" ? COLORS.primary : r.status === "On route" ? "#9A7B0F" : COLORS.muted }}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Volunteer activity" subtitle="Hours logged this week" accent={<Users className="w-4 h-4" style={{ color: COLORS.primary }} />}>
            <VolunteerActivity />
          </Card>
        </div>
      </div>
    </main>
  );
}
