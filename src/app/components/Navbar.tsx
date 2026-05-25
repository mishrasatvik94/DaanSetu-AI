"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon, LayoutDashboard, Award, Inbox } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth, signOut, initials } from "../data/auth";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const linkClass = (href: string) =>
    `hover:text-slate-900 transition ${pathname === href ? "text-slate-900" : ""}`;

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0F8F5F" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 7v10l8 5 8-5V7z" /><path d="M12 22V12" /><path d="M4 7l8 5 8-5" /></svg>
          </div>
          <span style={{ color: "#1F2937", fontWeight: 600 }}>DaanSetu</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#4B5563" }}>
          <Link href="/ngos" className={linkClass("/ngos")}>NGOs</Link>
          <Link href="/impact" className={linkClass("/impact")}>Impact</Link>
          <Link href="/karma" className={linkClass("/karma")}>KarmaScore</Link>
          <Link href="/leaderboard" className={linkClass("/leaderboard")}>Leaderboard</Link>
          <Link href="/qr-campaign" className={linkClass("/qr-campaign")}>QR Campaigns</Link>
          <Link href="/ai-assistant" className={linkClass("/ai-assistant")}>AI Assistant</Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 pr-1 pl-1 py-1 rounded-full border border-slate-200 hover:bg-slate-50">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "#E8F5EE", color: "#0F8F5F", fontWeight: 600 }}>{initials(user.name)}</span>
                <span className="hidden sm:inline text-sm pr-2" style={{ color: "#1F2937" }}>{user.name.split(" ")[0]}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="px-3 py-3 border-b border-slate-100">
                    <div className="text-sm" style={{ color: "#1F2937", fontWeight: 500 }}>{user.name}</div>
                    <div className="text-xs truncate" style={{ color: "#6B7280" }}>{user.email}</div>
                  </div>
                  <button onClick={() => { setOpen(false); router.push("/profile"); }} className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-slate-50" style={{ color: "#1F2937" }}>
                    <UserIcon className="w-4 h-4" style={{ color: "#6B7280" }} /> Profile
                  </button>
                  <button onClick={() => { setOpen(false); router.push("/karma"); }} className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-slate-50" style={{ color: "#1F2937" }}>
                    <Award className="w-4 h-4" style={{ color: "#6B7280" }} /> KarmaScore
                  </button>
                  <button onClick={() => { setOpen(false); router.push("/dashboard"); }} className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-slate-50" style={{ color: "#1F2937" }}>
                    <LayoutDashboard className="w-4 h-4" style={{ color: "#6B7280" }} /> Dashboard
                  </button>
                  <button onClick={() => { setOpen(false); router.push("/drafts"); }} className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-slate-50" style={{ color: "#1F2937" }}>
                    <Inbox className="w-4 h-4" style={{ color: "#6B7280" }} /> Drafts
                  </button>
                  <button onClick={() => { setOpen(false); signOut().then(() => router.push("/")).catch(console.error); }} className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-slate-50 border-t border-slate-100" style={{ color: "#1F2937" }}>
                    <LogOut className="w-4 h-4" style={{ color: "#6B7280" }} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex text-slate-700 hover:bg-slate-100" onClick={() => router.push("/login")}>Sign in</Button>
              <Button className="text-white hover:opacity-90" style={{ backgroundColor: "#0F8F5F" }} onClick={() => router.push("/signup")}>
                Start Donating
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
