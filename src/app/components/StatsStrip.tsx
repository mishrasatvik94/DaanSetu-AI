import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.floor(start + (value - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n.toLocaleString("en-IN")}{suffix}</span>;
}

export function StatsStrip() {
  const stats = [
    { label: "Raised", value: 240000, prefix: "₹" },
    { label: "Meals Funded", value: 1200 },
    { label: "Changemakers", value: 85 },
    { label: "QR Campaigns", value: 340 },
    { label: "WhatsApp Donations", value: 10000, suffix: "+" },
  ];
  return (
    <section className="px-6 py-12 border-y border-white/5 bg-gradient-to-b from-slate-950 to-slate-950/50">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
        {stats.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="text-white tracking-tight" style={{ fontSize: "2rem", fontWeight: 600 }}>
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <div className="text-xs text-slate-400 mt-1 tracking-wider">{s.label.toUpperCase()}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
