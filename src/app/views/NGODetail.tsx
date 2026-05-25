"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, CalendarClock, CheckCircle2, HeartHandshake, Mail, MapPin, Phone, ShieldCheck, Utensils, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DonationFlowModal } from "../features/ngo/DonationFlowModal";
import { useNGOById } from "@/lib/use-firestore";

export function NGODetail({ id }: { id: string }) {
  const { ngo, loading } = useNGOById(id);
  const [donationOpen, setDonationOpen] = useState(false);

  if (!ngo && loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-24 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
        <span className="text-sm" style={{ color: "#6B7280" }}>Loading NGO details…</span>
      </main>
    );
  }

  if (!ngo) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-24">
        <p style={{ color: "#4B5563" }}>NGO not found.</p>
        <Link href="/ngos" className="text-sm mt-3 inline-block" style={{ color: "#0F8F5F" }}>
          {"<- Back to directory"}
        </Link>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <Link href="/ngos" className="inline-flex items-center gap-1 text-sm mb-8" style={{ color: "#0F8F5F" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> All NGOs
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_360px] gap-0">
            <div className="p-7 md:p-9">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-slate-200 bg-white" style={{ color: "#0F8F5F" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified NGO
                </span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#F5F7F6", color: "#4B5563" }}>
                  {ngo.category}
                </span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: ngo.urgency === "High" ? "#FEF2F2" : ngo.urgency === "Medium" ? "#FBF5DE" : "#E8F5EE", color: ngo.urgency === "High" ? "#B91C1C" : ngo.urgency === "Medium" ? "#9A7B0F" : "#0F8F5F" }}>
                  {ngo.urgency} urgency
                </span>
              </div>

              <h1 className="mt-5 tracking-tight" style={{ color: "#1F2937", fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.05, fontWeight: 600 }}>
                {ngo.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" style={{ color: "#6B7280" }}>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ngo.city}</span>
                <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> {ngo.responseTime}</span>
                <span className="inline-flex items-center gap-1"><HeartHandshake className="w-3.5 h-3.5" /> {ngo.focus}</span>
              </div>

              <p className="mt-6 max-w-2xl" style={{ color: "#4B5563", lineHeight: 1.75 }}>
                {ngo.hero}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button id="donate" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => setDonationOpen(true)}>
                  Donate food
                </Button>
                <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <a href={`tel:${ngo.contact.phone.replace(/\s+/g, "")}`}>Call coordinator</a>
                </Button>
              </div>
            </div>

            <aside className="border-t lg:border-t-0 lg:border-l border-slate-200 p-7 md:p-8" style={{ backgroundColor: "#FAFAF8" }}>
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>TRUST SNAPSHOT</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {ngo.impactMetrics.slice(0, 4).map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs" style={{ color: "#6B7280" }}>{metric.label}</div>
                    <div className="mt-2" style={{ color: "#1F2937", fontSize: "1.4rem", fontWeight: 600 }}>{metric.value}</div>
                    <div className="mt-1 text-xs" style={{ color: "#6B7280" }}>{metric.detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div style={{ color: "#1F2937", fontWeight: 600 }}>Verified badges</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ngo.trustBadges.map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F" }}>
                      <BadgeCheck className="w-3 h-3" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>NGO PROFILE</div>
              <h2 className="mt-2" style={{ color: "#1F2937", fontSize: "1.4rem", fontWeight: 600 }}>Mission and field profile</h2>
              <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.75 }}>{ngo.mission}</p>
              <p className="mt-4" style={{ color: "#4B5563", lineHeight: 1.75 }}>{ngo.profile}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {ngo.serviceAreas.map((area) => (
                  <span key={area} className="text-xs px-2.5 py-1 rounded-full border border-slate-200" style={{ color: "#4B5563" }}>
                    {area}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>IMPACT METRICS</div>
                  <h2 className="mt-2" style={{ color: "#1F2937", fontSize: "1.4rem", fontWeight: 600 }}>What your donation supports</h2>
                </div>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => setDonationOpen(true)}>
                  Start donation
                </Button>
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4">
                {ngo.impactMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-xs" style={{ color: "#6B7280" }}>{metric.label}</div>
                    <div className="mt-2" style={{ color: "#1F2937", fontSize: "1.75rem", fontWeight: 600 }}>{metric.value}</div>
                    <div className="mt-2 text-sm" style={{ color: "#4B5563" }}>{metric.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>GALLERY</div>
              <h2 className="mt-2" style={{ color: "#1F2937", fontSize: "1.4rem", fontWeight: 600 }}>Inside the distribution network</h2>
              <div className="mt-5 grid md:grid-cols-3 gap-4">
                {ngo.gallery.map((item) => (
                  <figure key={item.caption} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <ImageWithFallback src={item.src} alt={item.caption} className="w-full h-48 object-cover" />
                    <figcaption className="p-4 text-sm" style={{ color: "#4B5563" }}>{item.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>CURRENT NEEDS</div>
              <h2 className="mt-2" style={{ color: "#1F2937", fontSize: "1.4rem", fontWeight: 600 }}>Most urgent requests right now</h2>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                {ngo.needs.map((need) => (
                  <div key={need.title} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div style={{ color: "#1F2937", fontWeight: 600 }}>{need.title}</div>
                        <div className="mt-1 text-sm" style={{ color: "#4B5563" }}>{need.detail}</div>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: need.priority === "Immediate" ? "#FEF2F2" : need.priority === "This week" ? "#FBF5DE" : "#E8F5EE", color: need.priority === "Immediate" ? "#B91C1C" : need.priority === "This week" ? "#9A7B0F" : "#0F8F5F" }}>
                        {need.priority}
                      </span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm" style={{ color: "#0F8F5F" }}>
                      <Utensils className="w-4 h-4" /> {need.quantity}
                    </div>
                    <div className="mt-4">
                      <Button className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => setDonationOpen(true)}>
                        Donate for this need
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sticky top-24">
              <div style={{ color: "#1F2937", fontWeight: 600 }}>Donation CTA</div>
              <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
                Share cooked meals, groceries, or fresh produce. The team will confirm the best pickup route from your location.
              </p>
              <Button className="mt-5 w-full text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => setDonationOpen(true)}>
                Open donation form
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                <a href={ngo.contact.website} target="_blank" rel="noreferrer">Visit website</a>
              </Button>

              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-sm">
                <ContactRow icon={Phone} label="Phone" value={ngo.contact.phone} href={`tel:${ngo.contact.phone.replace(/\s+/g, "")}`} />
                <ContactRow icon={Mail} label="Email" value={ngo.contact.email} href={`mailto:${ngo.contact.email}`} />
                <ContactRow icon={MapPin} label="Address" value={ngo.contact.address} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Trust badges</span>
              </div>
              <div className="mt-4 space-y-3">
                {ngo.verifiedTags.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#4B5563" }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#0F8F5F" }} /> {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Why donors trust this NGO</span>
              </div>
              <ul className="mt-4 space-y-3 text-sm" style={{ color: "#4B5563" }}>
                <li>Pickup routing is documented and shared with donors.</li>
                <li>Impact receipts are backed by verified NGO and volunteer logs.</li>
                <li>Best matched for {ngo.focus.toLowerCase()} across {ngo.city}.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {donationOpen ? <DonationFlowModal ngo={ngo} onClose={() => setDonationOpen(false)} /> : null}
    </main>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
        <Icon className="w-4 h-4" style={{ color: "#0F8F5F" }} />
      </div>
      <div>
        <div className="text-xs" style={{ color: "#6B7280" }}>{label}</div>
        <div className="mt-0.5" style={{ color: "#1F2937", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block hover:opacity-90">{content}</a>;
  }

  return content;
}
