import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Msg } from "./types";

export function Bubble({ msg }: { msg: Msg }) {
  const isYou = msg.from === "you";
  return (
    <div className={`flex gap-3 items-start ${isYou ? "justify-end" : ""}`}>
      {!isYou && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%]`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${isYou ? "text-white rounded-tr-sm" : "bg-slate-100 rounded-tl-sm"}`} style={isYou ? { backgroundColor: "#0F8F5F" } : { color: "#1F2937" }}>
          {msg.text}
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.actions.map((a) => (
              <Link key={a.to + a.label} href={a.to} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50" style={{ color: "#0F8F5F" }}>
                {a.label} <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "radial-gradient(circle at 30% 30%, #8FEAC4, #0F8F5F)" }}>
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#0F8F5F", animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}
