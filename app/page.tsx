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
  const [website,      setWebsite]      = useState("");
  const [city,         setCity]         = useState("");
  const [industry,     setIndustry]     = useState("");
  const [phone,        setPhone]        = useState("");
  const [email,        setEmail]        = useState("");
  const [smsChecked,   setSmsChecked]   = useState(true);
  const [emailChecked, setEmailChecked] = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");

  function validate() {
    if (!website.trim())  { setError("Please enter your website URL.");        return false; }
    if (!city.trim())     { setError("Please enter your city.");               return false; }
    if (!industry)        { setError("Please select your industry.");          return false; }
    if (!phone.trim())    { setError("Please enter your mobile number.");      return false; }
    if (emailChecked && !email.trim()) { setError("Enter your email or uncheck the email option."); return false; }
    return true;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (!validate()) return;
    setSubmitting(true);
    const url = /^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`;
    const params = new URLSearchParams({ url, city, industry, phone });
    if (email) params.set("email", email);
    if (smsChecked)   params.set("sms",  "1");
    if (emailChecked) params.set("mail", "1");
    router.push(`/audit?${params.toString()}`);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    background: "#0B0E16", border: "1px solid #1E293B",
    borderRadius: 8, color: "#F1F5F9", fontSize: 16,
    boxSizing: "border-box", outline: "none",
  };

  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#10D9A0", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            AI Local SEO &amp; AEO Platform
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9", lineHeight: 1.2, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Free Local SEO Audit
          </h1>
          <p style={{ fontSize: 17, color: "#94A3B8", margin: 0, lineHeight: 1.7 }}>
            We scan 74 signals and show you exactly what&apos;s costing you calls and customers.
          </p>
        </div>

        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 12, padding: 28 }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* Website */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Website URL
              </label>
              <input style={inp} type="text" placeholder="yourwebsite.com" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>

            {/* City + Industry */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>City</label>
                <input style={inp} type="text" placeholder="St. Louis" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>Industry</label>
                <select style={{ ...inp, appearance: "none" }} value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Mobile Number
              </label>
              <input style={inp} type="tel" placeholder="(314) 555-5555" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            {/* Delivery options */}
            <div style={{ background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                How to receive your report
              </div>

              {/* SMS */}
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 10 }}>
                <div
                  onClick={() => setSmsChecked(v => !v)}
                  style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: smsChecked ? "#10D9A0" : "transparent", border: `2px solid ${smsChecked ? "#10D9A0" : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", cursor: "pointer" }}
                >
                  {smsChecked && <span style={{ color: "#0B0E16", fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 16, color: "#F1F5F9", fontWeight: 600 }}>
                    📱 Text me the link <span style={{ fontSize: 13, color: "#10D9A0", fontWeight: 700 }}>— Recommended</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>98% open rate — you'll have it in seconds</div>
                </div>
              </label>

              {/* Email */}
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div
                  onClick={() => setEmailChecked(v => !v)}
                  style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: emailChecked ? "#10D9A0" : "transparent", border: `2px solid ${emailChecked ? "#10D9A0" : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", cursor: "pointer" }}
                >
                  {emailChecked && <span style={{ color: "#0B0E16", fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 16, color: "#F1F5F9", fontWeight: 600 }}>✉️ Email me the link</div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>Permanent link — easy to share or revisit</div>
                </div>
              </label>

              {/* Email input — shown when checked */}
              {emailChecked && (
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ ...inp, marginTop: 12, background: "#161B2E", border: "1px solid #1E293B" }}
                />
              )}
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
