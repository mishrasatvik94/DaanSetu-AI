import { motion } from "motion/react";
import { Sparkles, Send } from "lucide-react";

const chat = [
  { from: "user", text: "I care about street animals 🐾" },
  { from: "ai", text: "Beautiful. I found 3 vetted campaigns near you:" },
  { from: "ai-cards", cards: [
    { name: "Stray Vaccination Drive — Bengaluru", urgency: "URGENT", raised: 72 },
    { name: "Friendicoes Animal Shelter", urgency: "VERIFIED", raised: 48 },
    { name: "Mumbai Mutts Feeding Program", urgency: "TRENDING", raised: 91 },
  ]},
  { from: "user", text: "Donate ₹500 to the first one" },
  { from: "ai", text: "Done ✨ +12 KarmaScore. You're 88 away from Legend." },
];

export function AICauseMatch() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs mb-4">
            <Sparkles className="w-3 h-3" /> AI cause matching
          </div>
          <h2 className="text-white tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, lineHeight: 1.1 }}>
            Tell us what you care about.<br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">We'll find the cause.</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 backdrop-blur-xl p-6 max-w-2xl mx-auto">
          <div className="space-y-3">
            {chat.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "ai-cards" ? (
                  <div className="space-y-2 w-full">
                    {m.cards!.map((c) => (
                      <div key={c.name} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600" />
                        <div className="flex-1">
                          <div className="text-white text-sm">{c.name}</div>
                          <div className="h-1.5 mt-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300" style={{ width: `${c.raised}%` }} />
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-amber-400/20 text-amber-300">{c.urgency}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "user" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950" : "bg-white/5 text-slate-100 border border-white/5"}`}>
                    {m.text}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950 px-4 py-2">
            <input className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500" placeholder="What cause moves you?" />
            <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"><Send className="w-4 h-4 text-slate-950" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
