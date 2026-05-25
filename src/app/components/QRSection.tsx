import { QrCode, Share2, Heart, Users } from "lucide-react";
import { motion } from "motion/react";

export function QRSection() {
  return (
    <section id="qr" className="px-6 py-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative mx-auto">
          <div className="w-[320px] rounded-[2.5rem] border-8 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl shadow-purple-500/10">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 mx-auto flex items-center justify-center" style={{ fontSize: "2rem" }}>P</div>
              <div className="text-white mt-3">Priya Verma</div>
              <div className="text-xs text-emerald-400">❤️ Changemaker · 540 Karma</div>

              <div className="mt-5 mx-auto w-44 h-44 rounded-2xl bg-white p-3 flex items-center justify-center">
                <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${Math.random() > 0.45 ? "bg-slate-950" : "bg-white"}`} />
                  ))}
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-3">Scan to donate to Priya's campaign</div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-left">
                <div className="rounded-lg bg-white/5 p-2"><div className="text-[10px] text-slate-400">Raised</div><div className="text-white text-sm">₹18K</div></div>
                <div className="rounded-lg bg-white/5 p-2"><div className="text-[10px] text-slate-400">Meals</div><div className="text-white text-sm">420</div></div>
                <div className="rounded-lg bg-white/5 p-2"><div className="text-[10px] text-slate-400">Donors</div><div className="text-white text-sm">62</div></div>
              </div>

              <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 py-2.5">Donate ₹100</button>
            </div>
          </div>
        </motion.div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400/20 bg-purple-400/5 text-purple-300 text-xs mb-4">
            <QrCode className="w-3 h-3" /> QR Kindness
          </div>
          <h2 className="text-white tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, lineHeight: 1.1 }}>
            Your personal <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">fundraising identity.</span>
          </h2>
          <p className="text-slate-400 mt-5 max-w-md">Generate a viral QR campaign in one tap. Print it on your wedding card, share on Instagram, stick it on your shop — anyone can donate in 5 seconds.</p>

          <div className="mt-8 space-y-4">
            {[
              { icon: Share2, t: "Share anywhere", d: "Instagram, LinkedIn, WhatsApp status" },
              { icon: Heart, t: "Pick your cause", d: "Education, hunger, animals, climate" },
              { icon: Users, t: "Rally your tribe", d: "Friends, colleagues, family contribute together" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-white">{f.t}</div>
                    <div className="text-sm text-slate-400">{f.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
