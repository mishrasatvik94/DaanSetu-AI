import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, HelpCircle, Truck, HeartHandshake, ArrowRight, Utensils } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHeader } from "./PageHeader";
import type { Msg } from "../features/aiAssistant/types";
import { respond } from "../features/aiAssistant/engine";
import { Bubble, TypingBubble } from "../features/aiAssistant/ChatBubbles";

const SEED: Msg[] = [
  {
    from: "ai",
    text: "Namaste — main Setu AI hoon 🌿. Tell me what you have (meals, surplus, leftovers) and where you are, and I'll find the right NGO in seconds.",
  },
];

const SUGGESTIONS = [
  "I have 20 meals in Noida",
  "30 meals from a wedding in Bandra",
  "How does pickup work?",
  "Is my donation 80G eligible?",
  "I want to volunteer this weekend",
];

const CAPABILITIES = [
  { icon: HeartHandshake, label: "NGO matching", desc: "Best partner by city + capacity" },
  { icon: Utensils, label: "Food guidance", desc: "What's safe to donate, how to pack" },
  { icon: Truck, label: "Pickup support", desc: "Volunteer ETA & tracking" },
  { icon: HelpCircle, label: "FAQ", desc: "80G, FCRA, refunds, hygiene" },
];

export function AIAssistant() {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = respond(text);
      setMsgs((m) => [...m, reply]);
      setTyping(false);
    }, 650);
  }

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="SETU AI" title="Chat your donation in." subtitle="Describe what you have. Setu matches the right NGO, pickup window, and volunteer — instantly." />

      <div className="max-w-5xl mx-auto px-6 pb-20 grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Chat panel */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3" style={{ backgroundColor: "#FAFAF8" }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: "#22C55E" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: "#1F2937", fontWeight: 600 }}>Setu AI</div>
              <div className="text-xs" style={{ color: "#0F8F5F" }}>Online · usually replies instantly</div>
            </div>
            <span className="text-[10px] tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>BETA</span>
          </div>

          <div className="px-5 py-6 space-y-4 max-h-[520px] overflow-y-auto flex-1">
            {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
            {typing && <TypingBubble />}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50" style={{ color: "#4B5563" }}>
                {s}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Tell Setu what you have…"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-300"
            />
            <Button className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => send()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Capability sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>SETU CAN HELP WITH</div>
            <div className="mt-3 space-y-3">
              {CAPABILITIES.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
                      <Icon className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>{c.label}</div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{c.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div style={{ color: "#1F2937", fontWeight: 600 }}>Prefer WhatsApp?</div>
            <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>Setu also lives on WhatsApp — no app install needed.</p>
            <a href="https://wa.me/?text=Hi%20Setu" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm" style={{ color: "#0F8F5F" }}>
              Chat on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
