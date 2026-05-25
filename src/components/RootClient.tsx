"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { PWAShell } from "@/app/components/PWAShell";
import { registerServiceWorker } from "@/app/data/pwa";
import { initFirestoreCollections } from "@/lib/firestore-init";
import { seedFirestoreIfEmpty } from "@/lib/seed-firestore";

export function RootClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    registerServiceWorker();
    // Ensure required Firestore collections exist (runs once, client-side only)
    initFirestoreCollections().catch(console.error);
    // Seed sample data into empty collections
    seedFirestoreIfEmpty().catch(console.error);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white" style={{ color: "#1F2937" }}>
      <Navbar />
      {children}
      <Footer />
      <PWAShell />
    </div>
  );
}
