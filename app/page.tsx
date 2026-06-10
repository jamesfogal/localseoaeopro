"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Code-split — don't load the full chat bot until the user clicks
const AuditChatBot = dynamic(() => import("@/components/AuditChatBot"), { ssr: false });

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <main style={{
        background: "#0B0E16", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif", padding: "24px",
        position: "relative", overflow: "hidden",
      }}>

        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(#A78BFA 1px,transparent 1px),linear-gradient(90deg,#A78BFA 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

        <div style={{ maxWidth: 560, width: "100%", textAlign: "center", position: "relative" }}>

          {/* ── Billboard / H1 ───────────────────────────────────── */}
          <h1 style={{
            fontSize: "clamp(40px, 10vw, 64px)",
            fontWeight: 900, letterSpacing: "-2.5px",
            lineHeight: 1, marginBottom: 20, margin: "0 0 20px",
          }}>
            <span style={{ color: "#10D9A0" }}>LocalSEO</span>
            <span style={{ color: "#F1F5F9" }}>AEO</span>
            <span style={{ color: "#A78BFA" }}>Pro</span>
          </h1>

          {/* ── Subheading ───────────────────────────────────────── */}
          <h2 style={{
            fontSize: "clamp(20px, 3.5vw, 26px)",
            fontWeight: 800, color: "#F1F5F9",
            lineHeight: 1.3, margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}>
            Free Local SEO Audit
          </h2>

          {/* ── Value prop ───────────────────────────────────────── */}
          <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 10px", lineHeight: 1.7 }}>
            Analyzes <strong style={{ color: "#F1F5F9" }}>74 signals.</strong>{" "}
            We fix <strong style={{ color: "#10D9A0" }}>47 of them in 24 hours</strong>{" "}
            and show you results in{" "}
            <strong style={{ color: "#A78BFA" }}>days — not years.</strong>
          </p>

          <p style={{ fontSize: 16, color: "#475569", margin: "0 0 40px" }}>
            No account. No credit card. Takes 60 seconds to start.
          </p>

          {/* ── CTA ──────────────────────────────────────────────── */}
          <button
            onClick={() => setChatOpen(true)}
            style={{
              padding: "20px 48px",
              background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 18, fontWeight: 700,
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 0 40px #A78BFA30",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 60px #A78BFA50";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px #A78BFA30";
            }}
          >
            🤖 Run My Free SEO Audit →
          </button>

          {/* ── Trust signals ────────────────────────────────────── */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: 28, marginTop: 32, flexWrap: "wrap",
          }}>
            {[
              ["74", "Signals Checked"],
              ["47", "Fixed in 24 hrs"],
              ["36", "AI Modules"],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#A78BFA", letterSpacing: "-1px" }}>{num}</div>
                <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Login link ───────────────────────────────────────── */}
          <div style={{ marginTop: 36, fontSize: 14, color: "#374151" }}>
            Already a customer?{" "}
            <a href="/login" style={{ color: "#A78BFA", textDecoration: "none", fontWeight: 600 }}>
              Log in to your dashboard →
            </a>
          </div>

        </div>
      </main>

      {/* ── Chat overlay ─────────────────────────────────────────── */}
      {chatOpen && <AuditChatBot onClose={() => setChatOpen(false)} />}
    </>
  );
}
