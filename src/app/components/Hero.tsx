import { Button } from "./ui/button";
import { ArrowRight, MessageCircle, MapPin, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { AIAvatar } from "./AIAvatar";

export function Hero() {
  const router = useRouter();
  return (
    <section className="px-6 pt-20 pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs" style={{ color: "#0F8F5F" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0F8F5F" }} />
            Now live in 14 cities across India
          </div>
          <h1 className="mt-6 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)", lineHeight: 1.1, fontWeight: 600 }}>
            आपका बचा खाना,<br />किसी की अगली मुस्कान।
          </h1>
          <p className="mt-5 max-w-md" style={{ color: "#4B5563", fontSize: "1.0625rem", lineHeight: 1.6 }}>
            DaanSetu WhatsApp aur AI ke through extra food ko verified NGOs tak minutes mein pahunchata hai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => router.push("/signup")}>
              Donate Now <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => router.push("/ai-assistant")}>
              Try AI Assistant
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: "#6B7280" }}>
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> 80G tax-exempt receipts</div>
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> Verified NGO network</div>
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> Free for donors</div>
          </div>
        </div>

        <div className="relative">
          <AIAvatar />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_20px_60px_-20px_rgba(15,143,95,0.18)] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-300" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-slate-400">daansetu.in/donate</span>
            </div>

            <div className="pt-5 space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
                  <MessageCircle className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm inline-block" style={{ color: "#1F2937" }}>
                    Hi, I have 30 meals from a wedding in Bandra.
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start justify-end">
                <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white inline-block max-w-[80%]" style={{ backgroundColor: "#0F8F5F" }}>
                  Found <strong>Robin Hood Army</strong> 1.2 km away. Pickup in 18 min?
                </div>
              </div>

              <div className="flex gap-3 items-start justify-end">
                <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white inline-block" style={{ backgroundColor: "#0F8F5F" }}>
                  ✓ Confirmed. Volunteer Rahul is on the way.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 p-4" style={{ backgroundColor: "#F5F7F6" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: "#4B5563" }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} />
                  Pickup confirmed
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#0F8F5F" }}>Live</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span style={{ color: "#1F2937", fontSize: "1.5rem", fontWeight: 600 }}>30 meals</span>
                <span className="text-xs" style={{ color: "#6B7280" }}>ETA 18 min</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 bg-white rounded-xl border border-slate-200 shadow-lg px-4 py-3 hidden md:flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FBF5DE" }}>
              <svg className="w-4 h-4" style={{ color: "#D4AF37" }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" /></svg>
            </div>
            <div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Karma earned</div>
              <div style={{ color: "#1F2937", fontWeight: 600 }}>+120 pts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
