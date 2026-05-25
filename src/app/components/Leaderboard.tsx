import { motion } from "motion/react";
import { Trophy, Flame } from "lucide-react";

const top = [
  { rank: 1, name: "Satvik Sharma", score: 860, badge: "👑", raised: "₹48,200" },
  { rank: 2, name: "Rahul Mehta", score: 720, badge: "🏆", raised: "₹36,400" },
  { rank: 3, name: "Aman Iyer", score: 540, badge: "❤️", raised: "₹24,100" },
  { rank: 4, name: "Priya Verma", score: 480, badge: "❤️", raised: "₹19,800" },
  { rank: 5, name: "Neha Kapoor", score: 410, badge: "🤝", raised: "₹15,200" },
  { rank: 6, name: "Vikram Singh", score: 360, badge: "🤝", raised: "₹12,400" },
];

export function Leaderboard() {
  return (
    <section id="leaderboard" className="px-6 py-24 bg-gradient-to-b from-slate-950 to-slate-900/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 text-amber-300 text-xs mb-4">
            <Trophy className="w-3 h-3" /> Leaderboard
          </div>
          <h2 className="text-white tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, lineHeight: 1.1 }}>
            Top changemakers of <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Bharat</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950 backdrop-blur-xl overflow-hidden">
          {top.map((u, i) => (
            <motion.div key={u.rank} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 ${u.rank <= 3 ? "bg-gradient-to-r from-amber-400/5 to-transparent" : ""}`}>
              <div className={`w-10 text-center ${u.rank === 1 ? "text-amber-300" : u.rank === 2 ? "text-slate-300" : u.rank === 3 ? "text-orange-400" : "text-slate-500"}`} style={{ fontSize: "1.25rem" }}>
                #{u.rank}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950">{u.name[0]}</div>
              <div className="flex-1">
                <div className="text-white flex items-center gap-2">{u.name} <span>{u.badge}</span></div>
                <div className="text-xs text-slate-400">{u.raised} raised</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-300">{u.score}</div>
                <div className="text-[10px] text-slate-500 tracking-wider">KARMA</div>
              </div>
              {u.rank === 1 && <Flame className="w-4 h-4 text-amber-400" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
