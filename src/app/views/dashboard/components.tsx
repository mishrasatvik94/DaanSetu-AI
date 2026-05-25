import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { MessageSquare, Utensils, Users, Truck, Leaf, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { COLORS, PIE_COLORS, tooltipStyle } from "./constants";
import { randomEvent, seedFeed, timeAgo, VOLUNTEER_TREND, type FeedItem } from "./mock";
import type { LiveActivityItem, LiveDashboardStats } from "@/lib/use-firestore";

export function LivePill() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white">
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: COLORS.primary, opacity: 0.6 }} />
        <span className="relative w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
      </span>
      <span className="text-xs" style={{ color: COLORS.muted }}>Live · updated {timeAgo(now)}</span>
    </div>
  );
}

export function LiveStats({ stats }: { stats?: LiveDashboardStats | null }) {
  if (stats) {
    const liveCards = [
      { icon: MessageSquare, label: "Total WhatsApp conversations", value: stats.conversations.toLocaleString("en-IN"), trend: "live" },
      { icon: Truck, label: "Total pickup requests", value: stats.pickupRequests.toLocaleString("en-IN"), trend: "live" },
      { icon: Utensils, label: "Total donations", value: stats.donations.toLocaleString("en-IN"), trend: "live" },
      { icon: Users, label: "NGOs onboarded", value: stats.ngos.toLocaleString("en-IN"), trend: "live" },
      { icon: Leaf, label: "QR campaigns", value: stats.qrCampaigns.toLocaleString("en-IN"), trend: `${stats.qrScans.toLocaleString("en-IN")} scans` },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {liveCards.map((card, index) => (
          <Stat key={card.label} icon={card.icon} label={card.label} value={card.value} trend={card.trend} pulse={index === 1} />
        ))}
      </div>
    );
  }

  const [meals, setMeals] = useState(1284932);
  const [kgs, setKgs] = useState(321820);
  const [volunteers, setVolunteers] = useState(2812);
  useEffect(() => {
    const t = setInterval(() => {
      setMeals((m) => m + 2 + Math.floor(Math.random() * 4));
      setKgs((k) => k + 1 + Math.floor(Math.random() * 3));
      if (Math.random() > 0.6) setVolunteers((v) => v + (Math.random() > 0.5 ? 1 : 0));
    }, 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon={Utensils} label="Meals served"     value={meals.toLocaleString("en-IN")} trend="+18% w/w" />
      <Stat icon={Leaf}     label="Food saved (kg)"  value={kgs.toLocaleString("en-IN")} trend="−312 t CO₂" />
      <Stat icon={Users}    label="Active NGOs"      value="124" trend="+6 this month" />
      <Stat icon={Truck}    label="Volunteers online" value={volunteers.toLocaleString("en-IN")} trend="live" pulse />
    </div>
  );
}

export function LiveFeed({ items }: { items?: LiveActivityItem[] }) {
  if (items) {
    return (
      <div className="max-h-[340px] overflow-y-auto -mx-6 px-6 divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-start gap-3 text-sm">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
              <Utensils className="w-4 h-4" style={{ color: COLORS.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate" style={{ color: COLORS.ink }}>
                <span style={{ fontWeight: 500 }}>{item.headline}</span>
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: COLORS.muted }}>{item.detail}</div>
              <div className="text-xs flex items-center gap-2 mt-1" style={{ color: COLORS.muted }}>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.city}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timeAgo}</span>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: COLORS.primary, fontWeight: 500 }}>+{item.karma} karma</span>
          </div>
        ))}
      </div>
    );
  }

  const [feed, setFeed] = useState<FeedItem[]>(() => seedFeed());
  useEffect(() => {
    const t = setInterval(() => setFeed((f) => [randomEvent(), ...f].slice(0, 12)), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="max-h-[340px] overflow-y-auto -mx-6 px-6 divide-y divide-slate-100">
      {feed.map((f) => (
        <div key={f.id} className="py-3 flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
            <Utensils className="w-4 h-4" style={{ color: COLORS.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ color: COLORS.ink }}>
              <span style={{ fontWeight: 500 }}>{f.donor}</span> donated <span style={{ fontWeight: 500 }}>{f.meals} meals</span> to {f.ngo}
            </div>
            <div className="text-xs flex items-center gap-2" style={{ color: COLORS.muted }}>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.city}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {f.timeAgo}</span>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: COLORS.primary, fontWeight: 500 }}>+{f.karma} karma</span>
        </div>
      ))}
    </div>
  );
}

export function CityDistribution({ cities }: { cities: { name: string; value: number }[] }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
      <div className="h-44">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={cities} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={3} stroke="none" isAnimationActive={false}>
              {cities.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 min-w-0">
        {cities.map((c, i) => (
          <div key={c.name} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="truncate" style={{ color: COLORS.ink }}>{c.name}</span>
            <span className="ml-auto text-xs" style={{ color: COLORS.muted }}>{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VolunteerActivity() {
  return (
    <>
      <div className="h-44">
        <ResponsiveContainer>
          <LineChart data={VOLUNTEER_TREND} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="hours" stroke={COLORS.gold} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.gold }} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Avg pickup", value: "18 min" },
          { label: "On-time", value: "98%" },
          { label: "Repeat", value: "73%" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-200 py-3">
            <div style={{ color: COLORS.ink, fontWeight: 600 }}>{m.value}</div>
            <div className="text-xs" style={{ color: COLORS.muted }}>{m.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Stat({ icon: Icon, label, value, trend, pulse }: { icon: any; label: string; value: string; trend?: string; pulse?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 relative overflow-hidden">
      {pulse && <span className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.primary }} />}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
          <Icon className="w-4 h-4" style={{ color: COLORS.primary }} />
        </div>
        {trend && !pulse && (
          <span className="text-[11px] inline-flex items-center gap-0.5" style={{ color: COLORS.primary }}>
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-4 tabular-nums" style={{ color: COLORS.ink, fontSize: "1.75rem", lineHeight: 1, fontWeight: 600 }}>{value}</div>
      <div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{label}</div>
    </div>
  );
}

export function Card({ title, subtitle, accent, children }: { title: string; subtitle?: string; accent?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm" style={{ color: COLORS.ink, fontWeight: 600 }}>{title}</div>
          {subtitle && <div className="text-xs" style={{ color: COLORS.muted }}>{subtitle}</div>}
        </div>
        {accent && <div>{accent}</div>}
      </div>
      {children}
    </div>
  );
}
