"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { sendPasswordResetEmail } from "../data/auth";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ backgroundColor: "#FAFAF8" }} className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
      <div className="max-w-md mx-auto w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          {!sent ? (
            <>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
                <Mail className="w-5 h-5" style={{ color: "#0F8F5F" }} />
              </div>
              <h1 className="mt-4 tracking-tight" style={{ color: "#1F2937", fontSize: "1.75rem", lineHeight: 1.15, fontWeight: 600 }}>Reset your password</h1>
              <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>We'll email you a secure link to set a new password.</p>

              <form className="mt-7 space-y-4" onSubmit={submit}>
                <div>
                  <label className="text-xs" style={{ color: "#4B5563" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-300" placeholder="you@example.com" />
                </div>
                {error && <div className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>{error}</div>}
                <Button type="submit" disabled={loading} className="w-full text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F", opacity: loading ? 0.7 : undefined }}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs" style={{ color: "#6B7280" }}>
                Remembered it? <Link href="/login" style={{ color: "#0F8F5F" }}>Back to sign in</Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: "#0F8F5F" }} />
              </div>
              <h1 className="mt-4 tracking-tight" style={{ color: "#1F2937", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 600 }}>Check your inbox</h1>
              <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>If <span style={{ color: "#1F2937", fontWeight: 500 }}>{email}</span> is registered, a reset link is on its way. The link expires in 30 minutes.</p>
              <Link href="/login" className="mt-6 inline-block text-sm" style={{ color: "#0F8F5F" }}>← Back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
