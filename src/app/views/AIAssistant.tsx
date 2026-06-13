"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, HelpCircle, Truck, HeartHandshake, ArrowRight, Utensils, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHeader } from "./PageHeader";
import type { Msg } from "../features/aiAssistant/types";
import { Bubble, TypingBubble } from "../features/aiAssistant/ChatBubbles";
import type { GeminiMessage } from "@/lib/gemini";

const SEED: Msg[] = [
  {
    from: "ai",
    text: "Namaste — main Setu AI hoon 🌿\n\nI'm powered by Google Gemini and I know DaanSetu inside out. Tell me what you want to donate, which NGO to support, or ask me anything about campaigns, UPI donations, or KarmaScore!",
    actions: [],
  },
];

const SUGGESTIONS = [
  "I want to donate food in Delhi",
  "Show verified NGOs in Mumbai",
  "Start a birthday fundraiser",
  "Track my donation impact",
  "Is my donation 80G eligible?",
  "I have surplus food to donate",
  "What is KarmaScore?",
  "How do I donate via UPI?",
];

const CAPABILITIES = [
  { icon: HeartHandshake, label: "NGO matching", desc: "Best partner by city + capacity" },
  { icon: Utensils, label: "Food guidance", desc: "What's safe to donate, how to pack" },
  { icon: Truck, label: "Pickup support", desc: "Volunteer ETA & tracking" },
  { icon: HelpCircle, label: "FAQ", desc: "80G, FCRA, UPI, campaigns, karma" },
];

export function AIAssistant() {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Conversation history for Gemini multi-turn
  const historyRef = useRef<GeminiMessage[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;

    setMsgs((m) => [...m, { from: "you", text }]);
    setInput("");
    setTyping(true);
    setError(false);

    // Add user message to history
    historyRef.current = [
      ...historyRef.current,
      { role: "user", parts: [{ text }] },
    ];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyRef.current.slice(-8), // last 4 turns (8 messages)
        }),
      });

      const data = await res.json() as { text: string; actions?: Array<{ label: string; to: string }>; error?: boolean };

      const aiMsg: Msg = {
        from: "ai",
        text: data.text ?? "I'm having trouble right now. Please try again.",
        actions: data.actions ?? [],
      };

      // Add model response to history
      historyRef.current = [
        ...historyRef.current,
        { role: "model", parts: [{ text: aiMsg.text }] },
      ];

      setMsgs((m) => [...m, aiMsg]);
      if (data.error) setError(true);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          from: "ai",
          text: "🙏 Setu AI is temporarily busy. Please try again in a moment.",
          actions: [
            { label: "Browse NGOs", to: "/ngos" },
            { label: "QR Campaigns", to: "/qr-campaign" },
          ],
        },
      ]);
      setError(true);
    } finally {
      setTyping(false);
    }
  }, [input, typing]);

  function resetChat() {
    setMsgs(SEED);
    setInput("");
    setTyping(false);
    setError(false);
    historyRef.current = [];
  }

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader
        eyebrow="SETU AI · GEMINI POWERED"
        title="Chat your donation in."
        subtitle="Describe what you have. Setu matches the right NGO, pickup window, and volunteer — instantly."
      />

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
              <div className="text-sm flex items-center gap-2" style={{ color: "#1F2937", fontWeight: 600 }}>
                Setu AI
                <span className="text-[9px] tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>GEMINI</span>
              </div>
              <div className="text-xs" style={{ color: "#0F8F5F" }}>Online · powered by Google Gemini</div>
            </div>
            <button
              onClick={resetChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg hover:bg-slate-100 transition"
              style={{ color: "#6B7280" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-5 py-6 space-y-4 max-h-[520px] overflow-y-auto flex-1">
            {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
            {typing && <TypingBubble />}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={typing}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition disabled:opacity-50"
                style={{ color: "#4B5563" }}
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div className="mx-4 mb-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
              AI temporarily unavailable — responses are using smart fallbacks.
            </div>
          )}

          <div className="border-t border-slate-100 p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Tell Setu what you have…"
              disabled={typing}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 disabled:opacity-60"
            />
            <Button
              className="text-white hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#0F8F5F" }}
              onClick={() => send()}
              disabled={typing || !input.trim()}
            >
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

          <div className="rounded-2xl border border-emerald-100 p-4" style={{ backgroundColor: "#F0FDF4" }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} />
              <span className="text-xs font-semibold" style={{ color: "#0F8F5F" }}>Gemini Powered</span>
            </div>
            <p className="text-xs" style={{ color: "#4B5563" }}>
              Setu AI uses Google Gemini with live DaanSetu campaign + NGO data for accurate, context-aware answers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div style={{ color: "#1F2937", fontWeight: 600 }}>Prefer WhatsApp?</div>
            <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>Setu also lives on WhatsApp — no app install needed.</p>
            <a
              href="https://wa.me/?text=Hi%20Setu"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm"
              style={{ color: "#0F8F5F" }}
            >
              Chat on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
