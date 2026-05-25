import { motion } from "motion/react";
import { Check, CheckCheck } from "lucide-react";

const messages = [
  { from: "me", text: "Hi" },
  { from: "bot", text: "👋 Welcome to DaanSetu! Reply with:\n• DONATE FOOD <amount>\n• RECEIPT\n• IMPACT" },
  { from: "me", text: "DONATE FOOD 500" },
  { from: "bot", text: "✅ Donation of ₹500 initiated. Pay via UPI: daansetu@upi" },
  { from: "me", text: "RECEIPT" },
  { from: "bot", text: "🧾 80G receipt generated. Sent to your email." },
  { from: "me", text: "IMPACT" },
  { from: "bot", text: "🍱 You funded 10 meals today.\n+24 KarmaScore unlocked!" },
];

export function WhatsappShowcase() {
  return (
    <section id="whatsapp" className="px-6 py-24 bg-gradient-to-b from-slate-950 to-slate-900/30">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 text-xs mb-4">💬 Chat-native donations</div>
          <h2 className="text-white tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, lineHeight: 1.1 }}>
            Donate in 3 messages.<br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">No app. No friction.</span>
          </h2>
          <p className="text-slate-400 mt-5 max-w-md">Bharat is on WhatsApp. So is generosity. DaanSetu turns every chat into a chance to fund meals, vaccinate animals, or educate a child.</p>
          <div className="mt-8 space-y-3">
            {["Works on any phone, even feature phones via SMS fallback", "Instant 80G receipt over chat", "KarmaScore auto-updates after every donation"].map((t) => (
              <div key={t} className="flex items-start gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center mt-0.5 flex-shrink-0"><Check className="w-3 h-3 text-emerald-300" /></div>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto">
          <div className="w-[340px] rounded-[2.5rem] border-8 border-slate-800 bg-slate-900 shadow-2xl shadow-emerald-500/10 overflow-hidden">
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950">D</div>
              <div>
                <div className="text-white text-sm">DaanSetu</div>
                <div className="text-emerald-100/70 text-xs">online</div>
              </div>
            </div>
            <div className="bg-[#0b141a] p-4 h-[480px] overflow-hidden space-y-2 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><circle cx=%221%22 cy=%221%22 r=%221%22 fill=%22%23ffffff08%22/></svg>')]">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.18 }} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${m.from === "me" ? "bg-[#005C4B] text-white" : "bg-[#202c33] text-slate-100"}`}>
                    {m.text}
                    {m.from === "me" && <CheckCheck className="inline w-3 h-3 ml-1 text-sky-300" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
