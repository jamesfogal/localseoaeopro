"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const AuditChatBot = dynamic(() => import("@/components/AuditChatBot"), { ssr: false });

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <main style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        position: "relative", overflow: "hidden",
        background: "#060D1C",
      }}>

        {/* ── St. Louis Arch — bottom of page, corner to corner ── */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url('/arch.jpg')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }} />

        {/* Dark overlay — heavy at top, lighter at bottom so arch shows */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(6,13,28,0.55) 0%, rgba(6,13,28,0.35) 40%, rgba(6,13,28,0.15) 100%)",
        }} />

        {/* Subtle grid on top */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.02,
          backgroundImage: "linear-gradient(#A78BFA 1px,transparent 1px),linear-gradient(90deg,#A78BFA 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

        {/* ── Content — floats between the arch legs ── */}
        <div style={{
          maxWidth: 420, width: "100%", textAlign: "center",
          position: "relative", zIndex: 10,
          padding: "24px 24px 24px",
        }}>

          {/* ── Billboard / H1 ── */}
          <h1 style={{
            fontSize: "clamp(40px, 10vw, 64px)",
            fontWeight: 900, letterSpacing: "-2.5px",
            lineHeight: 1, margin: "0 0 20px",
          }}>
            <span style={{ color: "#10D9A0" }}>LocalSEO</span>
            <span style={{ color: "#F1F5F9" }}>AEO</span>
            <span style={{ color: "#A78BFA" }}>Pro</span>
          </h1>

          {/* ── Subheading ── */}
          <h2 style={{
            fontSize: "clamp(20px, 3.5vw, 26px)",
            fontWeight: 800, color: "#F1F5F9",
            lineHeight: 1.3, margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}>
            Free Local SEO Audit
          </h2>

          {/* ── Value prop ── */}
          <p style={{ fontSize: 18, color: "#CBD5E1", margin: "0 0 10px", lineHeight: 1.7 }}>
            Analyzes <strong style={{ color: "#F1F5F9" }}>74 signals.</strong>{" "}
            We can fix <strong style={{ color: "#10D9A0" }}>47 of those signals in 24 hours</strong>{" "}
            and we will let you know the process it takes to complete the rest.{" "}
            <strong style={{ color: "#A78BFA" }}>Clicks on your site in Days not Years.</strong>
          </p>

          <p style={{ fontSize: 16, color: "#64748B", margin: "0 0 40px" }}>
            No account. No credit card. Takes 60 seconds to start.
          </p>

          {/* ── CTA ── */}
          <button
            onClick={() => setChatOpen(true)}
            style={{
              padding: "20px 48px",
              background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 18, fontWeight: 700,
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 0 40px #A78BFA40",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 60px #A78BFA60";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px #A78BFA40";
            }}
          >
            🤖 Run My Free SEO Audit →
          </button>

          {/* ── Trust signals ── */}
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
                <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Login link ── */}
          <div style={{ marginTop: 36, fontSize: 16, color: "#475569" }}>
            Already a customer?{" "}
            <a href="/login" style={{ color: "#A78BFA", textDecoration: "none", fontWeight: 600 }}>
              Log in to your dashboard →
            </a>
          </div>

        </div>
      </main>

      {chatOpen && <AuditChatBot onClose={() => setChatOpen(false)} />}
    </>
  );
}
