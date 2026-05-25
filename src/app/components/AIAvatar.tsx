import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { MessageCircle, Sparkles } from "lucide-react";

export function AIAvatar() {
  const { scrollYProgress } = useScroll();

  const rawX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ["0vw", "-70vw", "0vw", "-70vw", "0vw", "-70vw"]
  );
  const rawY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["0vh", "10vh", "-20vh", "15vh", "-10vh"]
  );
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  const x = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.6 });

  return (
    <motion.div
      style={{ x, y, rotate }}
      className="fixed bottom-8 right-8 w-28 h-32 pointer-events-none select-none z-[60]"
    >
      <div className="absolute inset-0 -m-4 rounded-full blur-2xl opacity-70" style={{ background: "radial-gradient(circle, rgba(15,143,95,0.32), transparent 65%)" }} />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full"
      >
        <motion.div
          animate={{ scaleX: [1, 0.82, 1], opacity: [0.3, 0.18, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-full bg-slate-900/35 blur-md"
        />

        <svg viewBox="0 0 200 240" className="relative w-full h-full drop-shadow-[0_14px_28px_rgba(15,143,95,0.35)]">
          <defs>
            <radialGradient id="bodyGrad" cx="38%" cy="32%" r="78%">
              <stop offset="0%" stopColor="#8FEAC4" />
              <stop offset="55%" stopColor="#19A06E" />
              <stop offset="100%" stopColor="#0A6342" />
            </radialGradient>
            <radialGradient id="bellyGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FAFAF8" />
              <stop offset="100%" stopColor="#E5EDEA" />
            </radialGradient>
            <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#0B1220" />
            </linearGradient>
            <radialGradient id="bodyHL" cx="30%" cy="20%" r="42%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bulbGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFE07A" />
              <stop offset="100%" stopColor="#D4AF37" />
            </radialGradient>
          </defs>

          <motion.g
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "100px 56px" }}
          >
            <line x1="100" y1="56" x2="100" y2="28" stroke="#0A6342" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="100" cy="22" r="8" fill="url(#bulbGrad)" />
            <circle cx="97" cy="20" r="2.2" fill="#fff" opacity="0.85" />
          </motion.g>

          <motion.g
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "100px 130px" }}
          >
            <path
              d="M38,90 C38,54 64,40 100,40 C136,40 162,54 162,90 L162,172 C162,202 136,216 100,216 C64,216 38,202 38,172 Z"
              fill="url(#bodyGrad)"
            />
            <path
              d="M46,80 C50,56 76,48 100,48 C124,48 150,56 154,80 C142,68 122,62 100,62 C78,62 58,68 46,80 Z"
              fill="url(#bodyHL)"
            />
            <ellipse cx="100" cy="156" rx="44" ry="50" fill="url(#bellyGrad)" />
            <path
              d="M60,94 C60,80 78,73 100,73 C122,73 140,80 140,94 L140,122 C140,131 122,137 100,137 C78,137 60,131 60,122 Z"
              fill="url(#visorGrad)"
            />
            <path d="M66,92 C70,84 86,80 100,80 L100,89 C88,89 76,93 72,99 Z" fill="#ffffff" opacity="0.16" />

            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
              style={{ transformOrigin: "100px 108px" }}
            >
              <circle cx="84" cy="108" r="6" fill="#8FEAC4" />
              <circle cx="84" cy="106" r="2" fill="#ffffff" />
              <circle cx="116" cy="108" r="6" fill="#8FEAC4" />
              <circle cx="116" cy="106" r="2" fill="#ffffff" />
            </motion.g>

            <path d="M90,125 Q100,131 110,125" stroke="#8FEAC4" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.75" />

            <circle cx="100" cy="162" r="16" fill="#0F8F5F" />
            <path
              d="M100 152.5 C94.7 152.5 90.5 156.7 90.5 162 C90.5 163.8 91 165.4 91.9 166.9 L90.6 171.3 L95.2 170.1 C96.6 170.8 98.3 171.2 100 171.2 C105.3 171.2 109.5 167 109.5 161.7 C109.5 156.5 105.3 152.5 100 152.5 Z"
              fill="#ffffff"
            />

            <ellipse cx="40" cy="148" rx="11" ry="16" fill="url(#bodyGrad)" />
            <ellipse cx="160" cy="148" rx="11" ry="16" fill="url(#bodyGrad)" />
            <ellipse cx="38" cy="141" rx="4.5" ry="6" fill="#ffffff" opacity="0.28" />
            <ellipse cx="158" cy="141" rx="4.5" ry="6" fill="#ffffff" opacity="0.28" />
          </motion.g>
        </svg>

        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -left-2 flex items-center gap-1 bg-white rounded-full pl-1 pr-1.5 py-0.5 border border-slate-200 shadow-md"
        >
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            <span className="relative rounded-full w-1.5 h-1.5 bg-emerald-500" />
          </span>
          <span className="text-[8px] whitespace-nowrap" style={{ color: "#1F2937", fontWeight: 500 }}>AI online</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: [6, 1, 6] }}
          transition={{ delay: 0.4, duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-7 top-14 bg-white rounded-xl rounded-br-sm border border-slate-200 shadow-md px-2 py-1.5 flex items-center gap-1"
        >
          <MessageCircle className="w-2.5 h-2.5" style={{ color: "#0F8F5F" }} />
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -2, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "#0F8F5F" }}
              />
            ))}
          </span>
        </motion.div>

        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
          className="absolute -right-3 -bottom-1 bg-white rounded-lg border border-slate-200 shadow-md px-1.5 py-1 flex items-center gap-1"
        >
          <Sparkles className="w-2.5 h-2.5" style={{ color: "#D4AF37" }} />
          <span className="text-[9px]" style={{ color: "#1F2937", fontWeight: 600 }}>+50</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
