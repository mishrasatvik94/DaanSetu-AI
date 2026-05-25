import { motion } from "motion/react";
import { Sprout, Handshake, Heart, Trophy, Crown, Sparkles } from "lucide-react";

const levels = [
  { name: "Seed of Kindness", icon: Sprout, range: "0–100", color: "from-lime-400 to-emerald-400" },
  { name: "Helper", icon: Handshake, range: "100–300", color: "from-emerald-400 to-teal-400" },
  { name: "Changemaker", icon: Heart, range: "300–600", color: "from-teal-400 to-cyan-400" },
  { name: "Hero", icon: Trophy, range: "600–850", color: "from-cyan-400 to-blue-400" },
  { name: "Legend", icon: Crown, range: "850+", color: "from-purple-400 to-pink-400" },
];

const breakdown = [
  { label: "Donations made", value: 420 },
  { label: "Causes supported", value: 180 },
  { label: "QR campaigns raised", value: 140 },
  { label: "Friend referrals", value: 60 },
  { label: "Volunteer actions", value: 40 },
  { label: "Badge milestones", value: 20 },
];

export function KarmaScore() {
  return (
    <section id="karma" className="relative px-6 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 text-xs mb-4">
            <Sparkles className="w-3 h-3" /> Flagship feature
          </div>
          <h2 className="text-white tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, lineHeight: 1.1 }}>
            Your kindness, <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">scored.</span>
          </h2>
          <p className="text-slate-400 mt-4">KarmaScore™ turns every act of generosity into a public, on-chain reputation. The more you give, the higher you rise.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-8 backdrop-blur-xl">
            <div className="text-xs text-emerald-300 tracking-widest">YOUR SCORE</div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-white tracking-tight" style={{ fontSize: "5rem", fontWeight: 600, lineHeight: 1 }}>860</span>
              <span className="text-emerald-400">/ 1000</span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-slate-800 overflow-hidden relative">
              <motion.div initial={{ width: 0 }} whileInView={{ width: "86%" }} viewport={{ once: true }} transition={{ duration: 1.6 }} className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {breakdown.map((b) => (
                <div key={b.label} className="rounded-xl bg-white/5 border border-white/5 p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{b.label}</span>
                  <span className="text-emerald-300 text-sm">+{b.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {levels.map((l, i) => {
              const Icon = l.icon;
              const active = i === 3;
              return (
                <motion.div key={l.name} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`rounded-2xl border p-5 flex items-center gap-4 ${active ? "border-emerald-400/40 bg-emerald-400/5 shadow-lg shadow-emerald-500/10" : "border-white/5 bg-white/[0.02]"}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.range} KarmaScore</div>
                  </div>
                  {active && <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-300">You're here</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
