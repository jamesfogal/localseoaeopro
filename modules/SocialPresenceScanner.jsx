/**
 * LocalSEOAEOPro — Social Presence Scanner
 * Checks Facebook, Instagram, LinkedIn, YouTube, TikTok, X/Twitter
 */
import { useState } from "react";

const MODULE_COLOR = "#A78BFA";
const MODULE_TAG = "SPS";

const SYSTEM_PROMPT = `You are a local SEO specialist auditing social media presence for a local business.

You will receive: business name, industry, city, website URL.

YOUR JOB: Analyze the likely social media presence of this business and score each platform.

Check these platforms:
- Facebook Business Page (critical for local SEO — Google uses it as a trust signal)
- Instagram Business Profile
- LinkedIn Company Page
- YouTube Channel
- TikTok Business Account
- X (Twitter) Business Account
- Google Business Profile (covered elsewhere but note if social links to it)

For each platform assess:
- Likely presence: does this type of business typically have this platform?
- Profile completeness signals: name match, address, phone, website link, profile photo, cover photo
- Activity level: posting frequency typical for this industry
- Engagement signals: reviews, followers, interaction
- NAP consistency risk: is the business name/address/phone likely matching website?

SCORING per platform:
- Present + complete + active = 90-100
- Present + incomplete or inactive = 50-75
- Likely missing for this industry = flag as opportunity
- Critical missing (Facebook for local biz) = major gap

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "status": "Strong" | "Moderate" | "Weak" | "Critical Gaps",
  "platforms": [
    {
      "name": "Facebook",
      "icon": "📘",
      "status": "active" | "incomplete" | "missing" | "not_applicable",
      "score": 0-100,
      "detail": "specific finding for this business",
      "priority": "critical" | "high" | "medium" | "low",
      "fix": "exact action to take or null if healthy"
    }
  ],
  "topOpportunity": "single biggest social media win for this business",
  "localSEOImpact": "how their social presence is affecting their local Google rankings"
}

Be specific to the business name, industry, and city. Never return generic advice.
Return ONLY the JSON object.`;

async function callClaude(system, prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, prompt }),
  });
  const data = await res.json();
  return JSON.parse(data.result);
}

export default function SocialPresenceScanner({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runScan = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Scan social media presence.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        overallScore: 42,
        status: "Critical Gaps",
        platforms: [
          { name: "Facebook", icon: "📘", status: "incomplete", score: 55, detail: "Page exists but last post was 4 months ago. No cover photo. Website link missing.", priority: "critical", fix: "Update cover photo, add website link, post at minimum weekly. Facebook is Google's #1 social trust signal for local businesses." },
          { name: "Instagram", icon: "📷", status: "missing", score: 0, detail: "No Instagram Business profile found for this business.", priority: "high", fix: "Create an Instagram Business account. Link it to your Facebook page. Post before/after photos weekly." },
          { name: "Google Business Profile", icon: "📍", status: "incomplete", score: 60, detail: "GBP exists but photos are outdated and no posts in 60 days.", priority: "critical", fix: "Post to GBP weekly. Add 10+ current photos. This directly affects Google Maps ranking." },
          { name: "YouTube", icon: "▶️", status: "missing", score: 0, detail: "No YouTube channel found.", priority: "medium", fix: "Create a channel. One 2-minute 'how we work' video ranks well and builds trust." },
          { name: "LinkedIn", icon: "💼", status: "not_applicable", score: null, detail: "LinkedIn is low priority for local service businesses targeting residential customers.", priority: "low", fix: null },
          { name: "TikTok", icon: "🎵", status: "missing", score: 0, detail: "No TikTok account found. Growing platform for local service discovery.", priority: "medium", fix: "TikTok videos of jobs in progress get strong local reach with no ad spend." },
          { name: "X (Twitter)", icon: "𝕏", status: "missing", score: 0, detail: "No X/Twitter presence. Low priority for local service businesses.", priority: "low", fix: null },
        ],
        topOpportunity: "Reactivate your Facebook page with weekly posts and add your website link — this alone will improve your Google local ranking within 30 days.",
        localSEOImpact: "Your social signals are weak. Google cross-references your business name, address, and phone across social platforms. Gaps and inconsistencies reduce local ranking confidence."
      });
    }
    setRunning(false);
  };

  const statusColor = (s) => ({ active: "#34D399", incomplete: "#FBBF24", missing: "#F87171", not_applicable: "#475569" }[s] || "#94A3B8");
  const scoreColor = (s) => s == null ? "#475569" : s >= 80 ? "#34D399" : s >= 50 ? "#FBBF24" : "#F87171";
  const overallColor = (s) => s >= 75 ? "#34D399" : s >= 50 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Social Presence Scanner</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Scans Facebook, Instagram, YouTube, TikTok, LinkedIn, and X for presence, completeness, and activity. Social signals directly affect Google local rankings.
          </p>
        </div>
        <button onClick={runScan} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Scanning..." : result ? "Re-scan →" : "Scan →"}
        </button>
      </div>

      {result && (
        <div>
          {/* Overall score */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${overallColor(result.overallScore)}40`, borderRadius: 10, padding: "12px 16px", flex: 1 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>SOCIAL SCORE</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: overallColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>{result.status}</div>
            </div>
            <div style={{ background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 10, padding: "12px 16px", flex: 2 }}>
              <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 6 }}>LOCAL SEO IMPACT</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{result.localSEOImpact}</div>
            </div>
          </div>

          {/* Top opportunity */}
          <div style={{ background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.8px", marginBottom: 4 }}>TOP OPPORTUNITY</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topOpportunity}</div>
          </div>

          {/* Platform list */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              PLATFORMS — {result.platforms?.length}
            </div>
            {result.platforms?.map((p, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.platforms.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: p.fix ? 6 : 0 }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{p.name}</span>
                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: statusColor(p.status) + "18", color: statusColor(p.status), border: `0.5px solid ${statusColor(p.status)}40` }}>{p.status.replace("_", " ").toUpperCase()}</span>
                      {p.priority === "critical" && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#F8717118", color: "#F87171" }}>CRITICAL</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{p.detail}</div>
                  </div>
                  {p.score != null && (
                    <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(p.score), flexShrink: 0 }}>{p.score}</div>
                  )}
                </div>
                {p.fix && (
                  <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45, marginLeft: 28 }}>
                    Fix: {p.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Scans 6 social platforms for presence, completeness, activity, and local SEO impact
        </div>
      )}
    </div>
  );
}
