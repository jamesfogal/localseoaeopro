"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "Security Systems", "HVAC", "Plumbing", "Electrical", "Legal Services",
  "Medical / Healthcare", "Dental", "Restaurant / Food Service", "Retail",
  "Home Services", "Real Estate", "Auto Services", "Other",
];

export default function Home() {
  const router = useRouter();
  const [website,    setWebsite]    = useState("");
  const [city,       setCity]       = useState("");
  const [industry,   setIndustry]   = useState("");
  const [email,      setEmail]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  function validate() {
    if (!website.trim())  { setError("Please enter your website URL.");   return false; }
    if (!city.trim())     { setError("Please enter your city.");           return false; }
    if (!industry)        { setError("Please select your industry.");      return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                          { setError("Please enter a valid email address."); return false; }
    return true;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (!validate()) return;
    setSubmitting(true);
    const url = /^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`;
    const params = new URLSearchParams({ url, city, industry, email });
    router.push(`/audit?${params.toString()}`);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    background: "#0B0E16", border: "1px solid #1E293B",
    borderRadius: 8, color: "#F1F5F9", fontSize: 16,
    boxSizing: "border-box", outline: "none",
  };
  const lbl: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: "#64748B",
    display: "block", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.8px",
  };

  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* ── Billboard ─────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>

          <div style={{ fontSize: "clamp(38px, 9vw, 58px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: 18 }}>
            <span style={{ color: "#10D9A0" }}>LocalSEO</span><span style={{ color: "#F1F5F9" }}>AEO</span><span style={{ color: "#A78BFA" }}>Pro</span>
          </div>

          <h1 style={{ fontSize: "clamp(19px, 3.5vw, 24px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.3, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
            Free Local SEO Audit
          </h1>

          <p style={{ fontSize: 17, color: "#94A3B8", margin: 0, lineHeight: 1.75 }}>
            Analyzes <strong style={{ color: "#F1F5F9" }}>74 signals.</strong> We fix{" "}
            <strong style={{ color: "#10D9A0" }}>47 of them in 24 hours</strong>{" "}
            and show you results in <strong style={{ color: "#A78BFA" }}>days — not years.</strong>
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────────────── */}
        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 12, padding: 28 }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* Website */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Website URL</label>
              <input style={inp} type="text" placeholder="yourwebsite.com" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>

            {/* City + Industry */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>City</label>
                <input style={inp} type="text" placeholder="St. Louis" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Industry</label>
                <select style={{ ...inp, appearance: "none" }} value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Email — we&apos;ll send you the report link</label>
              <input style={inp} type="email" placeholder="you@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#F8717110", border: "1px solid #F8717130", borderRadius: 7, color: "#F87171", fontSize: 16, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", padding: 16, background: submitting ? "#0B3D2E" : "#10D9A0", border: "none", borderRadius: 8, color: submitting ? "#10D9A0" : "#0B0E16", fontSize: 17, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Starting your audit…" : "Run My Free SEO Audit →"}
            </button>

          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#374151" }}>
          Already a customer?{" "}
          <a href="/login" style={{ color: "#10D9A0", textDecoration: "none" }}>Log in to your dashboard →</a>
        </div>

      </div>
    </main>
  );
}
