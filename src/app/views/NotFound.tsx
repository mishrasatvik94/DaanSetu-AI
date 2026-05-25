import Link from "next/link";

export function NotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-xs tracking-wider mb-3" style={{ color: "#0F8F5F" }}>404</div>
        <h1 className="tracking-tight" style={{ color: "#1F2937", fontSize: "2rem", fontWeight: 600 }}>Page not found</h1>
        <p className="mt-2" style={{ color: "#6B7280" }}>The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl text-white text-sm" style={{ backgroundColor: "#0F8F5F" }}>Back home</Link>
      </div>
    </main>
  );
}
