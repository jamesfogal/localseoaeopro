"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 14, boxSizing: "border-box", outline: "none" };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px" };

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#10D9A0", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>Local SEO &amp; AEO Pro</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9", margin: "0 0 8px" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Log in to your dashboard</p>
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

            <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#0B3D2E" : "#10D9A0", border: "none", borderRadius: 8, color: loading ? "#10D9A0" : "#0B0E16", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748B" }}>
          New client?{" "}
          <Link href="/" style={{ color: "#10D9A0", textDecoration: "none" }}>Start your free audit →</Link>
        </div>
      </div>
    </main>
  );
}
