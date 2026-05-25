import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, WifiOff, RefreshCw, Bell, X, CheckCircle2, Share, Plus, Inbox } from "lucide-react";
import {
  useInstallPrompt,
  useOnline,
  useServiceWorker,
  isIOS,
  isStandalone,
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
} from "../data/pwa";
import { useDrafts, flushDrafts } from "../data/drafts";

const DISMISS_KEY = "daansetu:install-dismissed-at";
const NOTIF_KEY = "daansetu:notif-dismissed-at";
const COOLDOWN = 1000 * 60 * 60 * 24 * 3; // 3 days

export function PWAShell() {
  const [mounted, setMounted] = useState(false);
  const online = useOnline();
  const { canPrompt, isInstalled, prompt } = useInstallPrompt();
  const { updateReady, applyUpdate } = useServiceWorker();
  const drafts = useDrafts();
  const queued = drafts.filter((d) => d.status === "queued" || d.status === "syncing" || d.status === "failed").length;

  const [installDismissed, setInstallDismissed] = useState(true);
  const [notifDismissed, setNotifDismissed] = useState(true);
  const [iosTip, setIosTip] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(!online);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
    setInstallDismissed(Date.now() - t < COOLDOWN);
    const n = Number(localStorage.getItem(NOTIF_KEY) || 0);
    setNotifDismissed(Date.now() - n < COOLDOWN);
  }, [mounted]);

  // Reconnected toast
  useEffect(() => {
    if (!mounted) return;
    if (!online) { setWasOffline(true); return; }
    if (wasOffline) {
      setReconnected(true);
      flushDrafts();
      const t = setTimeout(() => setReconnected(false), 3500);
      setWasOffline(false);
      return () => clearTimeout(t);
    }
  }, [mounted, online, wasOffline]);

  // iOS install hint (no beforeinstallprompt on iOS)
  useEffect(() => {
    if (!mounted) return;
    if (!isInstalled && isIOS() && !isStandalone()) {
      const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - t > COOLDOWN) {
        const id = setTimeout(() => setIosTip(true), 6000);
        return () => clearTimeout(id);
      }
    }
  }, [mounted, isInstalled]);

  if (!mounted) {
    return null;
  }

  const dismissInstall = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setInstallDismissed(true);
    setIosTip(false);
  };

  const dismissNotif = () => {
    localStorage.setItem(NOTIF_KEY, String(Date.now()));
    setNotifDismissed(true);
  };

  const showInstall = canPrompt && !isInstalled && !installDismissed;
  const showNotifPrompt =
    !notifDismissed &&
    isInstalled &&
    notificationsSupported() &&
    notificationPermission() === "default";

  return (
    <>
      {/* Offline banner — fixed top */}
      {!online && (
        <div className="fixed top-0 inset-x-0 z-[60] px-3 pt-[max(env(safe-area-inset-top),0.5rem)]">
          <div className="max-w-md mx-auto flex items-center gap-2 px-3 py-2 rounded-full shadow-lg" style={{ backgroundColor: "#1F2937", color: "#fff" }}>
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">You're offline · drafts are saved locally</span>
          </div>
        </div>
      )}

      {/* Reconnected toast */}
      {online && reconnected && (
        <div className="fixed top-0 inset-x-0 z-[60] px-3 pt-[max(env(safe-area-inset-top),0.5rem)] pointer-events-none">
          <div className="max-w-md mx-auto flex items-center gap-2 px-3 py-2 rounded-full shadow-lg" style={{ backgroundColor: "#0F8F5F", color: "#fff" }}>
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs">Back online · syncing your drafts</span>
          </div>
        </div>
      )}

      {/* Update available toast */}
      {updateReady && (
        <div className="fixed bottom-4 inset-x-0 z-[60] px-3 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-white border border-slate-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
              <RefreshCw className="w-4 h-4" style={{ color: "#0F8F5F" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm" style={{ color: "#1F2937", fontWeight: 600 }}>New version available</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Reload to get the latest improvements.</div>
            </div>
            <button onClick={applyUpdate} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#0F8F5F" }}>Reload</button>
          </div>
        </div>
      )}

      {/* Install prompt (Android/desktop Chrome) */}
      {showInstall && !iosTip && (
        <InstallCard
          title="Install DaanSetu"
          body="Add to your home screen — donate in one tap, even offline."
          actionLabel="Install"
          onAction={async () => {
            const outcome = await prompt();
            if (outcome !== "accepted") dismissInstall();
          }}
          onDismiss={dismissInstall}
          icon={<Download className="w-4 h-4" style={{ color: "#0F8F5F" }} />}
        />
      )}

      {/* iOS Safari "Add to Home Screen" hint */}
      {iosTip && !showInstall && (
        <div className="fixed bottom-4 inset-x-0 z-[55] px-3 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto rounded-2xl shadow-xl bg-white border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
                <Share className="w-4 h-4" style={{ color: "#0F8F5F" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm" style={{ color: "#1F2937", fontWeight: 600 }}>Add DaanSetu to Home Screen</div>
                <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  Tap <Share className="inline w-3 h-3 mx-0.5" /> Share, then <Plus className="inline w-3 h-3 mx-0.5" /> Add to Home Screen.
                </div>
              </div>
              <button onClick={dismissInstall} className="p-1 -m-1 rounded-md hover:bg-slate-100" aria-label="Dismiss">
                <X className="w-4 h-4" style={{ color: "#6B7280" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification permission (only after install, to avoid begging) */}
      {showNotifPrompt && !showInstall && !iosTip && (
        <InstallCard
          title="Get pickup updates"
          body="One ping when your donation is picked up. No spam — ever."
          actionLabel="Allow"
          onAction={async () => {
            await requestNotificationPermission();
            dismissNotif();
          }}
          onDismiss={dismissNotif}
          icon={<Bell className="w-4 h-4" style={{ color: "#0F8F5F" }} />}
        />
      )}

      {/* Drafts queue pill (only when items pending) */}
      {queued > 0 && (
        <Link
          href="/drafts"
          className="fixed bottom-4 right-4 z-[55] inline-flex items-center gap-2 px-3 py-2 rounded-full shadow-lg bg-white border border-slate-200 text-xs"
          style={{ color: "#1F2937", marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: "#0F8F5F", opacity: 0.6 }} />
            <span className="relative w-2 h-2 rounded-full" style={{ backgroundColor: "#0F8F5F" }} />
          </span>
          <Inbox className="w-3.5 h-3.5" style={{ color: "#0F8F5F" }} />
          {queued} draft{queued > 1 ? "s" : ""} pending
        </Link>
      )}
    </>
  );
}

function InstallCard({
  title, body, actionLabel, onAction, onDismiss, icon,
}: {
  title: string; body: string; actionLabel: string;
  onAction: () => void; onDismiss: () => void; icon: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-4 inset-x-0 z-[55] px-3 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto rounded-2xl shadow-xl bg-white border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm" style={{ color: "#1F2937", fontWeight: 600 }}>{title}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{body}</div>
          </div>
          <button onClick={onDismiss} className="p-1 -m-1 rounded-md hover:bg-slate-100" aria-label="Dismiss">
            <X className="w-4 h-4" style={{ color: "#6B7280" }} />
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={onAction} className="text-sm px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#0F8F5F" }}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
