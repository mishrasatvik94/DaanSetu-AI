import { MessageCircle, Cpu, QrCode, ShieldCheck, Route, Award } from "lucide-react";

const features = [
  { icon: MessageCircle, title: "WhatsApp-first", desc: "Donate in your existing chat app. No downloads, no logins." },
  { icon: Cpu, title: "AI smart matching", desc: "Routes each donation to the NGO that needs it most, nearest first." },
  { icon: QrCode, title: "QR transparency", desc: "Scan to see exactly where your food went, who received it, and when." },
  { icon: ShieldCheck, title: "Verified NGOs", desc: "Every partner is FCRA-compliant and background-checked annually." },
  { icon: Route, title: "Fast pickup routing", desc: "Live logistics keep median pickup time under 28 minutes." },
  { icon: Award, title: "KarmaScore trust layer", desc: "Build a public reputation for generosity that travels with you." },
];

export function Features() {
  return (
    <section id="about" className="px-6 py-24" style={{ backgroundColor: "#F5F7F6" }}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>WHY DAANSETU</div>
          <h2 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15, fontWeight: 600 }}>
            Built for the way India already gives.
          </h2>
          <p className="mt-4" style={{ color: "#4B5563" }}>Familiar tools, serious infrastructure, real accountability.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white p-7">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#E8F5EE" }}>
                  <Icon className="w-5 h-5" style={{ color: "#0F8F5F" }} />
                </div>
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>{f.title}</h3>
                <p className="mt-1.5 text-sm" style={{ color: "#4B5563", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
