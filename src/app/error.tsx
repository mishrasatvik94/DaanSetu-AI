"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="max-w-lg text-center rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>SOMETHING WENT WRONG</div>
        <h1 className="tracking-tight" style={{ color: "#1F2937", fontSize: "2rem", fontWeight: 600 }}>We hit a temporary issue</h1>
        <p className="mt-2" style={{ color: "#6B7280" }}>
          The page couldn&apos;t finish loading. You can try again without losing the current design or navigation flow.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-white text-sm"
            style={{ backgroundColor: "#0F8F5F" }}
          >
            Try again
          </button>
          <Link href="/" className="px-5 py-2.5 rounded-xl text-sm border border-slate-300" style={{ color: "#4B5563" }}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
