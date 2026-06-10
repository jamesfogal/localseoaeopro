"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 16, boxSizing: "border-box", outline: "none" };
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.8px" };

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err, data } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Could not create a session. Try again.");
      setLoading(false);
    }
  }

  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#10D9A0", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Local SEO &amp; AEO Pro</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#F1F5F9", margin: "0 0 10px" }}>Welcome back</h1>
          <p style={{ fontSize: 17, color: "#94A3B8", margin: 0 }}>Log in to your dashboard</p>
        </div>

        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 12, padding: 28 }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" placeholder="you@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#F8717110", border: "1px solid #F8717130", borderRadius: 7, color: "#F87171", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: 15, background: loading ? "#0B3D2E" : "#10D9A0", border: "none", borderRadius: 8, color: loading ? "#10D9A0" : "#0B0E16", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "#64748B" }}>
          New client?{" "}
          <Link href="/" style={{ color: "#10D9A0", textDecoration: "none" }}>Start your free audit →</Link>
        </div>
      </div>
    </main>
  );
}
