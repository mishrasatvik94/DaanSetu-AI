import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import type { PersonalCampaign } from "../../data/campaigns";

export function PersonalCard({ c }: { c: PersonalCampaign }) {
  const goal = typeof (c as any)?.goal === "number" && Number.isFinite((c as any).goal) ? (c as any).goal : 1;
  const raised = typeof (c as any)?.raised === "number" && Number.isFinite((c as any).raised) ? (c as any).raised : 0;
  const karma = typeof (c as any)?.karma === "number" && Number.isFinite((c as any).karma) ? (c as any).karma : 0;
  const supporters = typeof (c as any)?.supporters === "number" && Number.isFinite((c as any).supporters) ? (c as any).supporters : 0;

  const pct = Math.min(100, Math.round((raised / goal) * 100));

  const creator = (c as any)?.creator;
  const creatorName = typeof creator === "string" && creator.trim().length > 0 ? creator.trim() : "Donor";
  const initials = creatorName
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("") || "D";
  return (
    <Link href={`/qr-campaign/${c.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-[0_12px_32px_-16px_rgba(15,143,95,0.25)] transition flex flex-col">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F", fontWeight: 600 }}>
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>{creatorName}</div>
          <div className="text-xs" style={{ color: "#6B7280" }}>{c.city} · {karma.toLocaleString("en-IN")} karma</div>
        </div>
      </div>
      <div className="mt-4" style={{ color: "#1F2937", fontWeight: 600, lineHeight: 1.3 }}>{c.title}</div>
      <p className="mt-1 text-xs line-clamp-2" style={{ color: "#6B7280" }}>{c.story}</p>
      <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ backgroundColor: "#0F8F5F", width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-baseline justify-between text-xs" style={{ color: "#6B7280" }}>
        <span><span style={{ color: "#1F2937", fontWeight: 600 }}>₹{raised.toLocaleString("en-IN")}</span> of ₹{goal.toLocaleString("en-IN")}</span>
        <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {supporters}</span>
      </div>
      <span className="mt-4 text-xs inline-flex items-center gap-1" style={{ color: "#0F8F5F" }}>
        View campaign <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}
