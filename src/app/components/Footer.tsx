export function Footer() {
  const cols = [
    { title: "Demo", links: ["Donor", "NGO", "AI Match", "Dashboard"] },
    { title: "Access", links: ["WhatsApp", "Firebase", "Twilio", "Vercel"] },
    { title: "Trust", links: ["Verified NGO", "Trust Score", "Urgency Badge", "Impact"] },
    { title: "Legal", links: ["Privacy", "Terms", "80G compliance", "FCRA"] },
  ];

  return (
    <footer className="px-6 pt-16 pb-10 bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0F8F5F" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 7v10l8 5 8-5V7z" /><path d="M12 22V12" /><path d="M4 7l8 5 8-5" /></svg>
              </div>
              <span style={{ color: "#1F2937", fontWeight: 600 }}>DaanSetu AI</span>
            </div>
            <p className="mt-4 text-sm max-w-xs" style={{ color: "#6B7280" }}>
              AI-powered bridge between donors, NGOs, and urgent community needs.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm mb-3" style={{ color: "#1F2937", fontWeight: 600 }}>{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-slate-900" style={{ color: "#6B7280" }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center text-xs" style={{ color: "#9CA3AF" }}>
          <div>2026 DaanSetu AI Foundation. Section 8 non-profit, India</div>
          <div>Crafted by Satvik Mishra</div>
        </div>
      </div>
    </footer>
  );
}
