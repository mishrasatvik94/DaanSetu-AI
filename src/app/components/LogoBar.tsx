export function LogoBar() {
  const names = ["Robin Hood Army", "Akshaya Patra", "Goonj", "Feeding India", "Smile Foundation", "Helpage India"];
  return (
    <section className="px-6 py-10 border-y border-slate-200" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-xs tracking-wider mb-6" style={{ color: "#6B7280" }}>
          TRUSTED BY 120+ VERIFIED NGOS
        </div>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 items-center" style={{ color: "#9CA3AF" }}>
          {names.map((n) => (
            <span key={n} style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
