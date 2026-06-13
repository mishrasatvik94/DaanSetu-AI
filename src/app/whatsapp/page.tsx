import { MessageCircle } from "lucide-react";

const commands = [
  "donate food 500 delhi",
  "need blankets 100 noida high",
  "status",
  "urgent",
  "help",
];

const replies = [
  {
    role: "Donor",
    input: "donate food 500 delhi",
    reply: "Matched: Robin Hood Army needs 250 meals in Delhi NCR. Reply YES to confirm pickup or MATCH for another option.",
  },
  {
    role: "NGO",
    input: "need blankets 100 noida high",
    reply: "Need posted: 100 blankets, Noida, High urgency. Trust Score 86/100 shown to donors.",
  },
  {
    role: "Status",
    input: "status",
    reply: "You have 2 active donations, 1 fulfilled request, and 860 impact points.",
  },
];

export default function WhatsAppPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-14" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-xs tracking-wider" style={{ color: "#0F8F5F", fontWeight: 600 }}>WHATSAPP ACCESS</div>
          <h1 className="mt-3 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, fontWeight: 600 }}>
            Twilio bot commands for donors and NGOs.
          </h1>
          <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.7 }}>
            DaanSetu AI can work from WhatsApp so donors and NGO operators do not need a new app during urgent community response.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: "#0F8F5F" }} />
              <h2 style={{ color: "#1F2937", fontWeight: 600 }}>Commands</h2>
            </div>
            <div className="mt-5 space-y-3">
              {commands.map((command) => (
                <code key={command} className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" style={{ color: "#1F2937" }}>
                  {command}
                </code>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            {replies.map((item) => (
              <article key={item.role} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 style={{ color: "#1F2937", fontWeight: 600 }}>{item.role} flow</h3>
                  <span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>Twilio-ready</span>
                </div>
                <div className="mt-4 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm inline-block" style={{ color: "#1F2937" }}>{item.input}</div>
                <div className="mt-3 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white" style={{ backgroundColor: "#0F8F5F" }}>{item.reply}</div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
