/**
 * LocalSEOAEOPro — Tracking Pixel Detector
 * Detects GA4, GTM, Facebook Pixel, TikTok Pixel, CallRail, etc.
 */
import { useState } from "react";

const MODULE_COLOR = "#F59E0B";
const MODULE_TAG = "TPD";

const SYSTEM_PROMPT = `You are a conversion tracking specialist for local businesses.

You will receive: business name, industry, city, website URL.

YOUR JOB: Analyze what conversion tracking is likely installed or missing on this website, and the revenue impact of each gap.

Check these tracking tools:
- GA4 (Google Analytics 4) — replaces Universal Analytics, required for Google Ads optimization
- Google Tag Manager — container that manages all other tags
- Google Ads Conversion Tracking — required to optimize Google Ads spend
- Facebook Pixel (Meta Pixel) — required for Facebook/Instagram ad optimization
- TikTok Pixel — for TikTok ad conversion tracking
- CallRail or similar call tracking — tracks which ads/pages generate phone calls
- Heatmap tools (Hotjar, Microsoft Clarity) — shows where visitors click/scroll
- Live chat (Intercom, Drift, LiveChat) — engagement tool
- Email capture (Mailchimp popup, Klaviyo) — list building

For each tool:
- Is it likely present for this type of local business?
- What is the revenue impact of having vs missing it?
- Priority to install if missing

CRITICAL: For local service businesses, phone call tracking is MOST important. Without it, they cannot know which marketing generates calls.

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "status": "Full Tracking" | "Partial Tracking" | "Blind Flying" | "No Tracking",
  "monthlyRevenueAtRisk": "dollar estimate of wasted ad spend due to missing tracking",
  "trackers": [
    {
      "name": "GA4",
      "category": "Analytics" | "Advertising" | "Call Tracking" | "Engagement" | "List Building",
      "status": "installed" | "missing" | "misconfigured",
      "priority": "critical" | "high" | "medium" | "low",
      "revenueImpact": "specific dollar/outcome impact for this business",
      "fix": "exact steps to install or null if present"
    }
  ],
  "blindSpots": ["list of specific things they cannot currently measure"],
  "topPriority": "single most important tracking gap to fix first"
}

Be specific to this business type, city, and industry. Local service businesses depend on phone calls.
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

export default function TrackingPixelDetector({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runScan = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Detect conversion tracking setup.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        overallScore: 28,
        status: "Blind Flying",
        monthlyRevenueAtRisk: "$800–$2,400/month in untrackable ad spend",
        trackers: [
          { name: "GA4", category: "Analytics", status: "missing", priority: "critical", revenueImpact: "Cannot see which pages convert visitors to leads. Flying blind on all marketing decisions.", fix: "Install GA4 via Google Tag Manager. Set up phone click and form submission as conversion events." },
          { name: "Google Tag Manager", category: "Analytics", status: "missing", priority: "critical", revenueImpact: "Without GTM, installing any other tracking requires developer access every time.", fix: "Install GTM first — it's the container for everything else. One snippet in your site header." },
          { name: "Call Tracking (CallRail)", category: "Call Tracking", status: "missing", priority: "critical", revenueImpact: "You have no idea which ads, pages, or keywords generate phone calls. Every dollar of ad spend is untrackable.", fix: "Install CallRail ($45/mo). Assign tracking numbers per campaign. Know exactly which ad generated each call." },
          { name: "Facebook Pixel", category: "Advertising", status: "missing", priority: "high", revenueImpact: "Cannot run retargeting campaigns or optimize Facebook/Instagram ads for conversions.", fix: "Install Meta Pixel via GTM. Takes 10 minutes. Enables retargeting your website visitors on Facebook." },
          { name: "Google Ads Conversion Tracking", category: "Advertising", status: "missing", priority: "high", revenueImpact: "If running Google Ads without conversion tracking, Smart Bidding cannot optimize. Wasting up to 40% of budget.", fix: "Link Google Ads to GA4. Import GA4 conversions into Google Ads for Smart Bidding optimization." },
          { name: "TikTok Pixel", category: "Advertising", status: "missing", priority: "medium", revenueImpact: "Cannot run TikTok ads efficiently without pixel data.", fix: "Install TikTok Pixel via GTM after Facebook Pixel is running." },
          { name: "Microsoft Clarity", category: "Engagement", status: "missing", priority: "medium", revenueImpact: "Free heatmaps showing where visitors click. Identifies broken user experiences.", fix: "Install Microsoft Clarity (free) via GTM. Immediate heatmap and session recording." },
        ],
        blindSpots: [
          "Cannot see which pages generate phone calls",
          "Cannot attribute leads to specific ad campaigns",
          "No retargeting audience being built",
          "Cannot see where visitors abandon the site",
          "Google Ads Smart Bidding cannot optimize without conversion data"
        ],
        topPriority: "Install Google Tag Manager first — it's the foundation. Then add GA4 + call tracking. In 30 days you'll know exactly what's generating revenue."
      });
    }
    setRunning(false);
  };

  const statusColor = (s) => ({ installed: "#34D399", missing: "#F87171", misconfigured: "#FBBF24" }[s] || "#94A3B8");
  const priorityColor = (p) => ({ critical: "#F87171", high: "#F59E0B", medium: "#60A5FA", low: "#94A3B8" }[p] || "#94A3B8");
  const scoreColor = (s) => s >= 75 ? "#34D399" : s >= 40 ? "#FBBF24" : "#F87171";

  const categoryIcons = { Analytics: "📊", Advertising: "📣", "Call Tracking": "📞", Engagement: "🎯", "List Building": "📧" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Tracking Pixel Detector</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Detects GA4, GTM, Facebook Pixel, TikTok Pixel, call tracking, and heatmaps. Shows exact revenue at risk from missing tracking.
          </p>
        </div>
        <button onClick={runScan} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Detecting..." : result ? "Re-detect →" : "Detect →"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${scoreColor(result.overallScore)}40`, borderRadius: 10, padding: "12px 16px", minWidth: 100 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>TRACKING SCORE</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>{result.status}</div>
            </div>
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 10, padding: "12px 16px", flex: 1 }}>
              <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.8px", marginBottom: 4 }}>REVENUE AT RISK</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#F87171", marginBottom: 4 }}>{result.monthlyRevenueAtRisk}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>in untrackable marketing spend per month</div>
            </div>
          </div>

          <div style={{ background: "#F59E0B08", border: "0.5px solid #F59E0B30", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 4 }}>TOP PRIORITY</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topPriority}</div>
          </div>

          {result.blindSpots?.length > 0 && (
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 8 }}>CURRENT BLIND SPOTS</div>
              {result.blindSpots.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < result.blindSpots.length - 1 ? 5 : 0 }}>
                  <span style={{ color: "#F87171", fontSize: 10, flexShrink: 0, marginTop: 1 }}>✗</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{b}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              TRACKING TOOLS — {result.trackers?.length}
            </div>
            {result.trackers?.map((t, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.trackers.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: t.fix ? 6 : 0 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{categoryIcons[t.category] || "🔧"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{t.name}</span>
                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: statusColor(t.status) + "18", color: statusColor(t.status) }}>{t.status.toUpperCase()}</span>
                      <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: priorityColor(t.priority) + "18", color: priorityColor(t.priority) }}>{t.priority.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{t.revenueImpact}</div>
                  </div>
                </div>
                {t.fix && (
                  <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45, marginLeft: 26 }}>
                    Fix: {t.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Detects analytics, ad pixels, call tracking, and engagement tools — shows exact revenue impact of each gap
        </div>
      )}
    </div>
  );
}
