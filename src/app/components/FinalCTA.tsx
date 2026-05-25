import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function FinalCTA() {
  const router = useRouter();
  return (
    <section className="px-6 py-24" style={{ backgroundColor: "#F5F7F6" }}>
      <div className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center border border-slate-200 bg-white">
        <h2 className="tracking-tight max-w-2xl mx-auto" style={{ color: "#1F2937", fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.1, fontWeight: 600 }}>
          Your next meal could be someone's first today.
        </h2>
        <p className="mt-5 max-w-lg mx-auto" style={{ color: "#4B5563" }}>
          Start with a single WhatsApp message. We'll handle the rest.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => router.push("/signup")}>
            Donate Now <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => router.push("/ngos")}>
            Partner as an NGO
          </Button>
        </div>
      </div>
    </section>
  );
}
