import { TrendingUp, Users, Utensils, CheckCircle2 } from "lucide-react";

export function DashboardPreview() {
  return (
    <section id="ngos" className="px-6 py-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>FOR NGOS</div>
          <h2 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15, fontWeight: 600 }}>
            A control room for every donation.
          </h2>
          <p className="mt-4" style={{ color: "#4B5563" }}>NGOs see incoming donations, assign volunteers, and prove impact — all in one clean dashboard.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(31,41,55,0.25)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100" style={{ backgroundColor: "#FAFAF8" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-300" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="text-xs" style={{ color: "#9CA3AF" }}>Robin Hood Army · Mumbai chapter</div>
            <div className="w-12" />
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] min-h-[440px]">
            <aside className="border-r border-slate-100 p-4 hidden lg:block" style={{ backgroundColor: "#FAFAF8" }}>
              <nav className="space-y-1 text-sm">
                {[
                  { label: "Overview", active: true },
                  { label: "Incoming donations" },
                  { label: "Volunteers" },
                  { label: "Routes" },
                  { label: "Beneficiaries" },
                  { label: "Reports" },
                  { label: "Settings" },
                ].map((i) => (
                  <div key={i.label} className={`px-3 py-2 rounded-lg ${i.active ? "bg-white border border-slate-200" : ""}`} style={{ color: i.active ? "#0F8F5F" : "#4B5563", fontWeight: i.active ? 500 : 400 }}>
                    {i.label}
                  </div>
                ))}
              </nav>
            </aside>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>Today</div>
                  <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Overview</h3>
                </div>
                <button className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#0F8F5F" }}>+ New pickup</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Utensils, label: "Meals today", value: "1,248", trend: "+18%" },
                  { icon: Users, label: "Active donors", value: "62", trend: "+4" },
                  { icon: CheckCircle2, label: "Pickups done", value: "41", trend: "98% on-time" },
                  { icon: TrendingUp, label: "Karma earned", value: "₹2.1K", trend: "this week" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <Icon className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                        <span className="text-[10px]" style={{ color: "#0F8F5F" }}>{m.trend}</span>
                      </div>
                      <div className="mt-3" style={{ color: "#1F2937", fontSize: "1.5rem", fontWeight: 600 }}>{m.value}</div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{m.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>Live pickup queue</div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>5 active</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { donor: "Hyatt Regency", meals: 80, area: "Andheri W", eta: "12 min", status: "On route" },
                    { donor: "Sharma Wedding", meals: 30, area: "Bandra", eta: "18 min", status: "Confirmed" },
                    { donor: "TCS Cafeteria", meals: 120, area: "Powai", eta: "32 min", status: "Confirmed" },
                  ].map((r) => (
                    <div key={r.donor} className="px-4 py-3 grid grid-cols-[1fr_80px_120px_100px] items-center gap-3 text-sm">
                      <div>
                        <div style={{ color: "#1F2937" }}>{r.donor}</div>
                        <div className="text-xs" style={{ color: "#6B7280" }}>{r.area}</div>
                      </div>
                      <div style={{ color: "#1F2937" }}>{r.meals} meals</div>
                      <div style={{ color: "#6B7280" }}>ETA {r.eta}</div>
                      <div className="text-xs px-2 py-1 rounded-full text-center" style={{ backgroundColor: r.status === "On route" ? "#E8F5EE" : "#F5F7F6", color: r.status === "On route" ? "#0F8F5F" : "#4B5563" }}>{r.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
