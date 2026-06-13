"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getNeeds, type NeedDoc } from "@/lib/firestore-service";
import { SAMPLE_NEEDS } from "@/app/data/needs";
import { NeedCard } from "@/app/components/NeedCard";
import { Button } from "@/app/components/ui/button";

const defaultPrompt = "I want to donate Rs 1000 for education near Delhi";

type AIMatchResult = {
  bestMatchId: string;
  ngoName: string;
  needTitle: string;
  reason: string;
  estimatedImpact: string;
  confidence: number;
  source?: "fallback" | "gemini";
};

export default function AIMatchPage() {
  const [query, setQuery] = useState(defaultPrompt);
  const [needs, setNeeds] = useState<NeedDoc[]>(SAMPLE_NEEDS);
  const [match, setMatch] = useState<AIMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getNeeds().then((docs) => {
      if (!cancelled && docs.length > 0) setNeeds(docs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitMatch(intent: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent,
          needs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "AI match failed");
      }
      setMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI match failed");
    } finally {
      setLoading(false);
    }
  }

  const matchedNeed = match
    ? needs.find((need) => need.id === match.bestMatchId) ??
      needs.find((need) => need.title === match.needTitle) ??
      needs[0]
    : null;

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-14" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <div className="text-xs tracking-wider" style={{ color: "#0F8F5F", fontWeight: 600 }}>AI DONATION MATCHING</div>
          <h1 className="mt-3 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, fontWeight: 600 }}>
            Match donor intent to urgent NGO needs.
          </h1>
          <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.7 }}>
            Demo AI logic matches cause keywords, location, and urgency so the most relevant request appears first.
          </p>
        </div>

        <form
          className="mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            submitMatch(query);
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
            aria-label="Donation matching request"
          />
          <Button type="submit" disabled={loading} className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F", opacity: loading ? 0.7 : undefined }}>
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Matching..." : "Match"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
            {error}
          </div>
        )}

        {match && matchedNeed && (
          <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F", fontWeight: 600 }}>BEST MATCH</div>
              <h2 className="mt-3 text-2xl" style={{ color: "#1F2937", fontWeight: 600 }}>{match.ngoName}</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <Row label="Need" value={match.needTitle} />
                <Row label="Reason" value={match.reason} />
                <Row label="Estimated Impact" value={match.estimatedImpact} />
                <Row label="Confidence" value={`${Math.round(match.confidence * 100)}% (${match.source ?? "api"})`} />
              </dl>
            </div>
            <NeedCard need={matchedNeed} />
          </section>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: "#6B7280" }}>{label}</dt>
      <dd className="mt-1" style={{ color: "#1F2937" }}>{value}</dd>
    </div>
  );
}
