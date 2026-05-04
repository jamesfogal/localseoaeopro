"use client";
import { useState } from "react";

export default function Home() {
  const [website, setWebsite] = useState("");

  const handleWebsite = (val: string) => {
    if (val && !val.startsWith("http")) {
      setWebsite("https://" + val);
    } else {
      setWebsite(val);
    }
  };

  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 600, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#10D9A0", letterSpacing: "2px", marginBottom: 16 }}>AI LOCAL SEO & AEO PLATFORM</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.2, marginBottom: 16 }}>The Most Powerful AI Local SEO & AEO Platform Ever Created</h1>
        <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 40 }}>We analyze 74 signals that determine where your business shows up in Google. 47 get fixed automatically. On your live website. While you sleep.</p>
        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 12, padding: 32, textAlign: "left" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>BUSINESS NAME</label>
            <input type="text" placeholder="Your Business Name" style={{ width: "100%", padding: "12px 16px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="you@yourbusiness.com" style={{ width: "100%", padding: "12px 16px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>WEBSITE URL</label>
            <input type="url" placeholder="https://yourbusiness.com" value={website} onChange={e => handleWebsite(e.target.value)} style={{ width: "100%", padding: "12px 16px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>PHONE NUMBER</label>
            <input type="tel" placeholder="(555) 555-5555" style={{ width: "100%", padding: "12px 16px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <button style={{ width: "100%", padding: "14px", background: "#10D9A0", border: "none", borderRadius: 8, color: "#0B0E16", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Run My Free SEO Audit →
          </button>
        </div>
      </div>
    </main>
  );
}