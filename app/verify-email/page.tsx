"use client";

export default function VerifyEmail() {
  const s: React.CSSProperties = { fontFamily: "system-ui, sans-serif" };
  return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, ...s }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10D9A020", border: "1px solid #10D9A040", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
          ✉️
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9", margin: "0 0 12px" }}>Check your email</h1>
        <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 24px" }}>
          We sent a confirmation link to your email address. Click it to verify your account and access your dashboard.
        </p>
        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Didn&apos;t get it?</div>
          <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
            Check your spam folder. The email comes from <span style={{ color: "#10D9A0" }}>noreply@supabase.io</span>
          </div>
        </div>
        <a href="/login" style={{ display: "inline-block", padding: "10px 24px", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>
          Back to login
        </a>
      </div>
    </main>
  );
}
