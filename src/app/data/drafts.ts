import { useSyncExternalStore } from "react";
import { requestDraftSync, sendLocalNotification } from "./pwa";

export type DraftStatus = "queued" | "syncing" | "synced" | "failed";

export type DonationDraft = {
  id: string;
  meals: number;
  city: string;
  area?: string;
  ngo?: string;
  pickupBy?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  status: DraftStatus;
  syncedAt?: number;
};

const KEY = "daansetu:drafts";
const EMPTY_DRAFTS: DonationDraft[] = [];
const listeners = new Set<() => void>();
let cachedDrafts: DonationDraft[] = EMPTY_DRAFTS;
let hasLoadedDrafts = false;
let browserListenersAttached = false;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach((l) => l());
}

function loadDraftsFromStorage(): DonationDraft[] {
  if (typeof window === "undefined") return EMPTY_DRAFTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DonationDraft[]) : EMPTY_DRAFTS;
  } catch {
    return EMPTY_DRAFTS;
  }
}

function read(): DonationDraft[] {
  if (!hasLoadedDrafts) {
    cachedDrafts = loadDraftsFromStorage();
    hasLoadedDrafts = true;
  }
  return cachedDrafts;
}

function write(drafts: DonationDraft[]) {
  cachedDrafts = drafts;
  hasLoadedDrafts = true;
  localStorage.setItem(KEY, JSON.stringify(drafts));
  emit();
}

function ensureBrowserListeners() {
  if (browserListenersAttached || typeof window === "undefined") return;
  browserListenersAttached = true;
  window.addEventListener("online", () => {
    flushDrafts();
  });
  window.addEventListener("daansetu:flush-drafts", () => {
    flushDrafts();
  });
}

ensureBrowserListeners();

export function useDrafts(): DonationDraft[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY_DRAFTS);
}

export function listDrafts() {
  return read();
}

export function queuedCount() {
  return read().filter((d) => d.status === "queued").length;
}

export function saveDraft(input: Omit<DonationDraft, "id" | "createdAt" | "updatedAt" | "status"> & { id?: string }) {
  const drafts = [...read()];
  const now = Date.now();
  const id = input.id ?? `drf_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const existingIdx = drafts.findIndex((d) => d.id === id);
  const draft: DonationDraft = {
    id,
    meals: input.meals,
    city: input.city,
    area: input.area,
    ngo: input.ngo,
    pickupBy: input.pickupBy,
    notes: input.notes,
    createdAt: existingIdx >= 0 ? drafts[existingIdx].createdAt : now,
    updatedAt: now,
    status: "queued",
  };
  if (existingIdx >= 0) drafts[existingIdx] = draft;
  else drafts.unshift(draft);
  write(drafts);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    requestDraftSync().catch(() => {});
  } else {
    queueMicrotask(() => {
      flushDrafts();
    });
  }
  return draft;
}

export function removeDraft(id: string) {
  write(read().filter((d) => d.id !== id));
}

export function clearSynced() {
  write(read().filter((d) => d.status !== "synced"));
}

async function fakeServerPost(draft: DonationDraft): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(true), 600 + Math.random() * 600));
}

let flushing = false;
export async function flushDrafts() {
  if (flushing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  flushing = true;
  try {
    const drafts = read();
    const pending = drafts.filter((d) => d.status === "queued" || d.status === "failed");
    if (pending.length === 0) return;

    for (const d of pending) {
      mutate(d.id, { status: "syncing" });
      try {
        const ok = await fakeServerPost(d);
        if (ok) {
          mutate(d.id, { status: "synced", syncedAt: Date.now() });
          sendLocalNotification(
            "Donation submitted ðŸŒ±",
            `${d.meals} meals queued for pickup in ${d.city}.`,
            "/dashboard"
          );
        } else {
          mutate(d.id, { status: "failed" });
        }
      } catch {
        mutate(d.id, { status: "failed" });
      }
    }
  } finally {
    flushing = false;
  }
}

function mutate(id: string, patch: Partial<DonationDraft>) {
  const drafts = [...read()];
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx < 0) return;
  drafts[idx] = { ...drafts[idx], ...patch, updatedAt: Date.now() };
  write(drafts);
}
