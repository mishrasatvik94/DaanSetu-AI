import { MessageSquare, Sparkles, Truck } from "lucide-react";

const steps = [
  { n: "01", icon: MessageSquare, title: "Share on WhatsApp", desc: "Send a message with what you have, how much, and where. No app to install." },
  { n: "02", icon: Sparkles, title: "AI matches an NGO", desc: "We find the nearest verified NGO that can use your donation in under 60 seconds." },
  { n: "03", icon: Truck, title: "Verified pickup", desc: "A vetted volunteer arrives within the hour. You receive proof of delivery and an 80G receipt." },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>HOW IT WORKS</div>
          <h2 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15, fontWeight: 600 }}>
            Three steps. About six minutes.
          </h2>
          <p className="mt-4" style={{ color: "#4B5563" }}>From a forgotten tray of biryani to a child's lunch — DaanSetu is the bridge.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-7 hover:border-slate-300 transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
                    <Icon className="w-5 h-5" style={{ color: "#0F8F5F" }} />
                  </div>
                  <span className="text-xs tracking-wider" style={{ color: "#9CA3AF" }}>{s.n}</span>
                </div>
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>{s.title}</h3>
                <p className="mt-2 text-sm" style={{ color: "#4B5563", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
