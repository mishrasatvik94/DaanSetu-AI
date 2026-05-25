"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, MapPin, Package, Phone, User, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { FOOD_TYPES, type NGO } from "../../data/ngos";
import { createDonation } from "@/lib/firestore-service";
import { getUser } from "@/app/data/auth";

type DonationForm = {
  donorName: string;
  phone: string;
  foodType: string;
  quantity: string;
  pickupAddress: string;
  pickupDate: string;
  pickupTime: string;
  notes: string;
};

const INITIAL_FORM: DonationForm = {
  donorName: "",
  phone: "",
  foodType: FOOD_TYPES[0],
  quantity: "",
  pickupAddress: "",
  pickupDate: "",
  pickupTime: "",
  notes: "",
};

export function DonationFlowModal({
  ngo,
  onClose,
}: {
  ngo: NGO;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DonationForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const pickupWindow = useMemo(() => {
    if (!form.pickupDate || !form.pickupTime) return "Pickup team will confirm shortly.";
    return `${form.pickupDate} at ${form.pickupTime}`;
  }, [form.pickupDate, form.pickupTime]);

  function update<K extends keyof DonationForm>(key: K, value: DonationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.donorName || !form.phone || !form.foodType || !form.quantity || !form.pickupAddress || !form.pickupDate || !form.pickupTime) {
      return;
    }

    // Write to Firestore (async, non-blocking)
    const user = getUser();
    createDonation({
      donorId: user?.id,
      donorName: form.donorName,
      donorPhone: form.phone,
      ngoId: ngo.id,
      ngoName: ngo.name,
      foodType: form.foodType,
      quantity: form.quantity,
      pickupAddress: form.pickupAddress,
      pickupTime: `${form.pickupDate} ${form.pickupTime}`,
      notes: form.notes,
      status: "pending",
    }).catch(console.error);

    // Also persist locally as backup
    persistDonation(ngo.id, form);
    setSubmitted(true);
  }

  function resetAndClose() {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6 py-10" style={{ backgroundColor: "rgba(31,41,55,0.45)" }}>
      <div className="absolute inset-0" onClick={resetAndClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <button type="button" onClick={resetAndClose} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <form onSubmit={submit}>
            <div className="px-7 pt-7 pb-5 border-b border-slate-100" style={{ backgroundColor: "#FAFAF8" }}>
              <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>DONATION INTAKE</div>
              <h3 className="mt-1 tracking-tight" style={{ color: "#1F2937", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 600 }}>
                Donate to {ngo.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
                Share your pickup details and the NGO team will confirm routing on the same theme you already see across DaanSetu.
              </p>
            </div>

            <div className="px-7 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Donor name" icon={User}>
                  <input value={form.donorName} onChange={(e) => update("donorName", e.target.value)} required placeholder="Your full name" className="input" />
                </Field>
                <Field label="Phone" icon={Phone}>
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required placeholder="+91 98..." className="input" />
                </Field>
              </div>

              <div className="grid md:grid-cols-[1fr_180px] gap-4">
                <Field label="Food type" icon={Package}>
                  <select value={form.foodType} onChange={(e) => update("foodType", e.target.value)} className="input bg-white">
                    {FOOD_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantity">
                  <input value={form.quantity} onChange={(e) => update("quantity", e.target.value)} required placeholder="Eg. 80 meals" className="input" />
                </Field>
              </div>

              <Field label="Pickup address" icon={MapPin}>
                <textarea value={form.pickupAddress} onChange={(e) => update("pickupAddress", e.target.value)} required rows={3} placeholder="Full pickup address with landmark" className="input resize-none" />
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Pickup date" icon={CalendarDays}>
                  <input type="date" value={form.pickupDate} onChange={(e) => update("pickupDate", e.target.value)} required className="input" />
                </Field>
                <Field label="Pickup time">
                  <input type="time" value={form.pickupTime} onChange={(e) => update("pickupTime", e.target.value)} required className="input" />
                </Field>
              </div>

              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} placeholder="Packaging notes, gate access, shelf life, or coordinator details" className="input resize-none" />
              </Field>

              <div className="rounded-2xl border border-slate-200 p-5" style={{ backgroundColor: "#FAFAF8" }}>
                <div className="text-xs tracking-wider" style={{ color: "#0F8F5F" }}>CONFIRMATION PREVIEW</div>
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <Info label="NGO" value={ngo.name} />
                  <Info label="Pickup window" value={pickupWindow} />
                  <Info label="Service area" value={ngo.serviceAreas.slice(0, 2).join(", ")} />
                  <Info label="Response time" value={ngo.responseTime} />
                </div>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button type="submit" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }}>
                Submit donation
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-7 py-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
              <CheckCircle2 className="w-6 h-6" style={{ color: "#0F8F5F" }} />
            </div>
            <div className="mt-4 text-xs tracking-wider" style={{ color: "#0F8F5F" }}>REQUEST RECEIVED</div>
            <h3 className="mt-1 tracking-tight" style={{ color: "#1F2937", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 600 }}>
              Pickup request shared successfully
            </h3>
            <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
              {ngo.name} has your donation request. A coordinator will call {form.phone} to confirm the pickup plan.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Info label="Donor" value={form.donorName} />
                <Info label="Food type" value={form.foodType} />
                <Info label="Quantity" value={form.quantity} />
                <Info label="Pickup slot" value={pickupWindow} />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm" style={{ color: "#4B5563" }}>
                Pickup address: {form.pickupAddress}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }}>
                Submit another
              </Button>
              <Button type="button" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={resetAndClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs inline-flex items-center gap-1.5" style={{ color: "#4B5563" }}>
        {Icon ? <Icon className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} /> : null}
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: "#6B7280" }}>{label}</div>
      <div className="mt-1" style={{ color: "#1F2937", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function persistDonation(ngoId: string, form: DonationForm) {
  if (typeof window === "undefined") return;
  const key = "daansetu.ngo-donations";
  const payload = {
    id: `ngo_${Date.now()}`,
    ngoId,
    submittedAt: Date.now(),
    ...form,
  };

  try {
    const raw = localStorage.getItem(key);
    const current = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    localStorage.setItem(key, JSON.stringify([payload, ...current].slice(0, 20)));
  } catch {}
}
