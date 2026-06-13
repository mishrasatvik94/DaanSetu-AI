import type { NeedDoc } from "@/lib/firestore-service";

const urgencyStyles: Record<NeedDoc["urgency"], { bg: string; color: string }> = {
  Low: { bg: "#F1F5F9", color: "#475569" },
  Medium: { bg: "#FBF5DE", color: "#9A7B0F" },
  High: { bg: "#FEF2F2", color: "#B91C1C" },
};

export function NeedCard({ need }: { need: NeedDoc }) {
  const urgency = urgencyStyles[need.urgency];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs" style={{ color: "#0F8F5F", fontWeight: 600 }}>{need.category}</div>
          <h3 className="mt-1" style={{ color: "#1F2937", fontWeight: 600 }}>{need.title}</h3>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: urgency.bg, color: urgency.color }}>
          {need.urgency}
        </span>
      </div>
      <p className="mt-3 text-sm" style={{ color: "#4B5563", lineHeight: 1.6 }}>{need.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs" style={{ color: "#6B7280" }}>NGO</div>
          <div style={{ color: "#1F2937", fontWeight: 500 }}>{need.ngoName}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "#6B7280" }}>Location</div>
          <div style={{ color: "#1F2937", fontWeight: 500 }}>{need.location}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "#6B7280" }}>Quantity</div>
          <div style={{ color: "#1F2937", fontWeight: 500 }}>{need.quantity}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: "#6B7280" }}>Trust Score</div>
          <div style={{ color: "#1F2937", fontWeight: 500 }}>{need.trustScore ?? 86}/100</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {need.verified && <span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>Verified NGO</span>}
        <span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: "#F5F7F6", color: "#4B5563" }}>Firebase tracked</span>
      </div>
    </article>
  );
}
