"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const INDUSTRIES = [
  "Security Systems", "HVAC", "Plumbing", "Electrical", "Legal Services",
  "Medical / Healthcare", "Dental", "Restaurant / Food Service", "Retail",
  "Home Services", "Real Estate", "Auto Services", "Other",
];

export default function Home() {
  const [businessName, setBusinessName]   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirm]     = useState("");
  const [phone, setPhone]                 = useState("");
  const [website, setWebsite]             = useState("");
  const [city, setCity]                   = useState("");
  const [country, setCountry]             = useState("");
  const [industry, setIndustry]           = useState("");
  const [errors, setErrors]               = useState<Record<string, string>>({});
  const [submitting, setSubmitting]       = useState(false);
  const [serverError, setServerError]     = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!businessName.trim()) e.businessName = "Required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
    if (!password || password.length < 8) e.password = "Minimum 8 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!phone.trim()) e.phone = "Required";
    if (!website.trim()) e.website = "Required";
    if (!city.trim()) e.city = "Required";
    if (!industry) e.industry = "Please select an industry";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);

    const url = /^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          business_name: businessName.trim(),
          city: city.trim(),
          website: url,
          phone: phone.trim(),
          country: country.trim(),
          industry,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setSubmitting(false);
      return;
    }

    window.location.href = "/verify-email";
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 13px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 7, color: "#F1F5F9", fontSize: 14, boxSizing: "border-box", outline: "none" };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "1px" };
  const err: React.CSSProperties = { fontSize: 11, color: "#F87171", marginTop: 3 };
  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#10D9A0", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>AI Local SEO &amp; AEO Platform</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", lineHeight: 1.2, margin: "0 0 10px", letterSpacing: "-0.02em" }}>The Most Powerful AI Local SEO &amp; AEO Platform</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>Analyzes 74 signals. 47 get fixed automatically. Access all 32 modules.</p>
        </div>

        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 12, padding: 28 }}>

          {/* Section: Account */}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#10D9A0", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1E293B" }}>
            Your Account
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email Address *</label>
              <input style={inp} type="email" placeholder="you@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} />
              {errors.email && <div style={err}>{errors.email}</div>}
            </div>

            <div style={{ ...row, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Password *</label>
                <input style={inp} type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                {errors.password && <div style={err}>{errors.password}</div>}
              </div>
              <div>
                <label style={lbl}>Confirm Password *</label>
                <input style={inp} type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirm(e.target.value)} />
                {errors.confirmPassword && <div style={err}>{errors.confirmPassword}</div>}
              </div>
            </div>

            {/* Section: Business */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "#10D9A0", letterSpacing: "1.5px", textTransform: "uppercase", margin: "20px 0 14px", paddingBottom: 8, borderBottom: "1px solid #1E293B" }}>
              Your Business
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Business Name *</label>
              <input style={inp} type="text" placeholder="Citywide Alarms" value={businessName} onChange={e => setBusinessName(e.target.value)} />
              {errors.businessName && <div style={err}>{errors.businessName}</div>}
            </div>

            <div style={{ ...row, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Phone *</label>
                <input style={inp} type="tel" placeholder="(555) 555-5555" value={phone} onChange={e => setPhone(e.target.value)} />
                {errors.phone && <div style={err}>{errors.phone}</div>}
              </div>
              <div>
                <label style={lbl}>Website URL *</label>
                <input style={inp} type="text" placeholder="citywidealarms.com" value={website} onChange={e => setWebsite(e.target.value)} />
                {errors.website && <div style={err}>{errors.website}</div>}
              </div>
            </div>

            <div style={{ ...row, marginBottom: 14 }}>
              <div>
                <label style={lbl}>City *</label>
                <input style={inp} type="text" placeholder="St. Charles" value={city} onChange={e => setCity(e.target.value)} />
                {errors.city && <div style={err}>{errors.city}</div>}
              </div>
              <div>
                <label style={lbl}>Country</label>
                <input style={inp} type="text" placeholder="United States" value={country} onChange={e => setCountry(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Industry *</label>
              <select style={{ ...inp, appearance: "none" }} value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <div style={err}>{errors.industry}</div>}
            </div>

            {serverError && (
              <div style={{ padding: "10px 14px", background: "#F8717110", border: "1px solid #F8717130", borderRadius: 7, color: "#F87171", fontSize: 13, marginBottom: 16 }}>
                {serverError}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ width: "100%", padding: 14, background: submitting ? "#0B3D2E" : "#10D9A0", border: "none", borderRadius: 8, color: submitting ? "#10D9A0" : "#0B0E16", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Creating your account…" : "Run My Free SEO Audit →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748B" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#10D9A0", textDecoration: "none" }}>Log in →</a>
        </div>
      </div>
    </main>
  );
}
