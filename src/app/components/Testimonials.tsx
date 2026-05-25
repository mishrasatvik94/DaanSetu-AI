const quotes = [
  {
    quote: "DaanSetu cut our coordination time in half. What used to take three phone calls now takes one WhatsApp message.",
    name: "Neel Ghose",
    role: "Co-founder, Robin Hood Army",
  },
  {
    quote: "The transparency is unlike anything we've seen in the sector. Every donor knows exactly where their food went.",
    name: "Aarti Bhandari",
    role: "Programs Lead, Feeding India",
  },
  {
    quote: "I scanned the QR after a wedding and got proof that 80 people ate that night. That's powerful.",
    name: "Vikram Mehta",
    role: "Donor, Mumbai",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>VOICES</div>
          <h2 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15, fontWeight: 600 }}>
            From the partners and donors who use it.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <figure key={q.name} className="rounded-2xl border border-slate-200 bg-white p-7">
              <svg className="w-6 h-6 mb-4" style={{ color: "#D4AF37" }} fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h4v4H7c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm8 0h4v4h-4c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z" /></svg>
              <blockquote style={{ color: "#1F2937", lineHeight: 1.6 }}>{q.quote}</blockquote>
              <figcaption className="mt-5 pt-5 border-t border-slate-100">
                <div style={{ color: "#1F2937", fontWeight: 500 }}>{q.name}</div>
                <div className="text-sm" style={{ color: "#6B7280" }}>{q.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
