import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const installListeners = new Set<() => void>();

const swState = {
  registration: null as ServiceWorkerRegistration | null,
  waiting: null as ServiceWorker | null,
  updateReady: false,
};
const swListeners = new Set<() => void>();

let installEventsAttached = false;
let swRegistrationPromise: Promise<void> | null = null;
let swEventsAttached = false;

function notifyInstall() {
  installListeners.forEach((l) => l());
}

function notifySW() {
  swListeners.forEach((l) => l());
}

function ensureInstallEvents() {
  if (process.env.NODE_ENV !== "production") return;
  if (installEventsAttached || typeof window === "undefined") return;
  installEventsAttached = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    notifyInstall();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    notifyInstall();
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
    // @ts-ignore
    window.navigator.standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
}

export function useInstallPrompt() {
  ensureInstallEvents();

  const subscribe = (cb: () => void) => {
    if (process.env.NODE_ENV !== "production") return () => {};
    installListeners.add(cb);
    return () => installListeners.delete(cb);
  };

  const state = useSyncExternalStore(
    subscribe,
    () => `${!!deferred}|${installed}`,
    () => "false|false"
  );

  const [canPrompt, isInstalled] = state.split("|");

  return {
    canPrompt: process.env.NODE_ENV === "production" && canPrompt === "true",
    isInstalled: isInstalled === "true" || isStandalone(),
    prompt: async () => {
      if (process.env.NODE_ENV !== "production" || !deferred) return "unavailable" as const;
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      notifyInstall();
      return choice.outcome;
    },
  };
}

export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}

function attachServiceWorkerEvents() {
  if (swEventsAttached || typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  swEventsAttached = true;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if ((window as any).__daansetu_reloading) return;
    (window as any).__daansetu_reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (!data) return;
    if (data.type === "FLUSH_DRAFTS") {
      window.dispatchEvent(new CustomEvent("daansetu:flush-drafts"));
    } else if (data.type === "REFRESH_IMPACT") {
      window.dispatchEvent(new CustomEvent("daansetu:refresh-impact"));
    }
  });
}

export async function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  if (process.env.NODE_ENV !== "production") {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    } catch (e) {
      console.warn("Failed to unregister development service worker:", e);
    }
    return;
  }

  try {
    if (window.self !== window.top) return;
  } catch {
    return;
  }

  attachServiceWorkerEvents();
  if (swRegistrationPromise) return swRegistrationPromise;

  swRegistrationPromise = (async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      swState.registration = reg;
      notifySW();

      if (reg.waiting) {
        swState.waiting = reg.waiting;
        swState.updateReady = true;
        notifySW();
      }

      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            swState.waiting = nw;
            swState.updateReady = true;
            notifySW();
          }
        });
      });
    } catch {
      swRegistrationPromise = null;
    }
  })();

  return swRegistrationPromise;
}

export function useServiceWorker() {
  const subscribe = (cb: () => void) => {
    if (process.env.NODE_ENV !== "production") return () => {};
    swListeners.add(cb);
    return () => swListeners.delete(cb);
  };

  const updateReady = useSyncExternalStore(
    subscribe,
    () => swState.updateReady,
    () => false
  );

  return {
    updateReady: process.env.NODE_ENV === "production" && updateReady,
    applyUpdate: () => {
      if (process.env.NODE_ENV !== "production") return;
      swState.waiting?.postMessage({ type: "SKIP_WAITING" });
    },
  };
}

export async function requestDraftSync() {
  if (typeof navigator === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    // @ts-ignore
    if (reg.sync) {
      // @ts-ignore
      await reg.sync.register("sync-drafts");
      return true;
    }
  } catch {}
  return false;
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function notificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  const result = await Notification.requestPermission();
  if (result === "granted") {
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("Notifications on ðŸŽ‰", {
        body: "We'll ping you when your donation is picked up.",
        icon: "/icons/icon.svg",
        badge: "/icons/icon.svg",
        tag: "daansetu-welcome",
      });
    } catch {
      new Notification("Notifications on ðŸŽ‰", { body: "You're all set." });
    }
  }
  return result;
}

export async function sendLocalNotification(title: string, body: string, url = "/") {
  if (notificationPermission() !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, { body, icon: "/icons/icon.svg", badge: "/icons/icon.svg", data: { url } });
  } catch {
    new Notification(title, { body });
  }
}
