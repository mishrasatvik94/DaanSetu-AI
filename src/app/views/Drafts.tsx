import { useState } from "react";
import Link from "next/link";
import { Inbox, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Loader2, WifiOff, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHeader } from "./PageHeader";
import { useDrafts, saveDraft, removeDraft, clearSynced, flushDrafts } from "../data/drafts";
import { useOnline } from "../data/pwa";

const CITIES = ["Mumbai", "Delhi NCR", "Bengaluru", "Chennai", "Pune", "Hyderabad", "Kolkata"];

export function Drafts() {
  const drafts = useDrafts();
  const online = useOnline();
  const [open, setOpen] = useState(false);

  const queued = drafts.filter((d) => d.status !== "synced");
  const synced = drafts.filter((d) => d.status === "synced");

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)]">
      <PageHeader eyebrow="OFFLINE-FIRST" title="Donation drafts" subtitle="Save donations even without signal. We'll sync them the moment you're back online." />

      <div className="max-w-3xl mx-auto px-6 pb-20 space-y-6">
        {/* Status strip */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: online ? "#E8F5EE" : "#FEF2F2" }}>
            {online ? <CheckCircle2 className="w-5 h-5" style={{ color: "#0F8F5F" }} /> : <WifiOff className="w-5 h-5" style={{ color: "#B91C1C" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: "#1F2937", fontWeight: 600 }}>{online ? "Connected" : "Offline"}</div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              {queued.length} pending · {synced.length} synced
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => flushDrafts()}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Sync now
            </Button>
            <Button className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> New draft
            </Button>
          </div>
        </div>

        {/* Queued list */}
        {queued.length === 0 && synced.length === 0 ? (
          <Empty onCreate={() => setOpen(true)} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4" style={{ color: "#0F8F5F" }} />
                <span style={{ color: "#1F2937", fontWeight: 600 }}>Queue</span>
              </div>
              {synced.length > 0 && (
                <button onClick={clearSynced} className="text-xs" style={{ color: "#6B7280" }}>Clear synced</button>
              )}
            </div>
            <ul className="divide-y divide-slate-100">
              {queued.map((d) => (
                <DraftRow key={d.id} draft={d} />
              ))}
              {synced.map((d) => (
                <DraftRow key={d.id} draft={d} muted />
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-center" style={{ color: "#6B7280" }}>
          <Sparkles className="inline w-3 h-3 mr-1" /> Drafts stay on your device. Synced donations show up on your <Link href="/profile" style={{ color: "#0F8F5F" }}>profile</Link>.
        </div>
      </div>

      {open && <NewDraftModal onClose={() => setOpen(false)} />}
    </main>
  );
}

function DraftRow({ draft, muted }: { draft: ReturnType<typeof useDrafts>[number]; muted?: boolean }) {
  return (
    <li className="px-5 py-4 flex items-center gap-3" style={{ opacity: muted ? 0.7 : 1 }}>
      <StatusPill status={draft.status} />
      <div className="flex-1 min-w-0">
        <div style={{ color: "#1F2937", fontWeight: 500 }} className="truncate">
          {draft.meals} meals · {draft.city}{draft.area ? ` · ${draft.area}` : ""}
        </div>
        <div className="text-xs" style={{ color: "#6B7280" }}>
          {draft.ngo ? `→ ${draft.ngo}` : "NGO: auto-match"} · saved {new Date(draft.updatedAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
        </div>
      </div>
      <button onClick={() => removeDraft(draft.id)} className="p-2 rounded-lg hover:bg-slate-50" aria-label="Delete draft">
        <Trash2 className="w-4 h-4" style={{ color: "#6B7280" }} />
      </button>
    </li>
  );
}

function StatusPill({ status }: { status: "queued" | "syncing" | "synced" | "failed" }) {
  const map = {
    queued:  { bg: "#FBF5DE", fg: "#9A7B0F", label: "Queued",  Icon: Inbox },
    syncing: { bg: "#E0F2FE", fg: "#0369A1", label: "Syncing", Icon: Loader2 },
    synced:  { bg: "#E8F5EE", fg: "#0F8F5F", label: "Synced",  Icon: CheckCircle2 },
    failed:  { bg: "#FEF2F2", fg: "#B91C1C", label: "Failed",  Icon: AlertCircle },
  }[status];
  const { Icon } = map;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: map.bg, color: map.fg }}>
      <Icon className={`w-3 h-3 ${status === "syncing" ? "animate-spin" : ""}`} /> {map.label}
    </span>
  );
}

function Empty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
        <Inbox className="w-5 h-5" style={{ color: "#0F8F5F" }} />
      </div>
      <h3 className="mt-4" style={{ color: "#1F2937", fontSize: "1.15rem", fontWeight: 600 }}>No drafts yet</h3>
      <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>Save a donation now — it'll go out the second you're online.</p>
      <Button className="mt-5 text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={onCreate}>
        <Plus className="w-4 h-4 mr-1.5" /> Create draft
      </Button>
    </div>
  );
}

function NewDraftModal({ onClose }: { onClose: () => void }) {
  const [meals, setMeals] = useState(20);
  const [city, setCity] = useState(CITIES[0]);
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (meals < 1) return;
    saveDraft({ meals, city, area, notes });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 pb-[env(safe-area-inset-bottom)]" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
        <h2 style={{ color: "#1F2937", fontSize: "1.25rem", fontWeight: 600 }}>New donation draft</h2>
        <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>Works offline. We'll auto-sync the moment you're back online.</p>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs" style={{ color: "#4B5563" }}>Meals</span>
            <input type="number" min={1} value={meals} onChange={(e) => setMeals(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-300" />
          </label>
          <label className="block">
            <span className="text-xs" style={{ color: "#4B5563" }}>City</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-300 bg-white">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs" style={{ color: "#4B5563" }}>Area (optional)</span>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Andheri West" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-300" />
          </label>
          <label className="block">
            <span className="text-xs" style={{ color: "#4B5563" }}>Notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Pickup time, contact, special instructions…" className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-300 resize-none" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} className="text-slate-600 hover:bg-slate-100">Cancel</Button>
          <Button type="submit" className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }}>Save draft</Button>
        </div>
      </form>
    </div>
  );
}
