export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
      {eyebrow && <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>{eyebrow}</div>}
      <h1 className="tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: 1.15, fontWeight: 600 }}>{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl" style={{ color: "#4B5563" }}>{subtitle}</p>}
    </div>
  );
}
