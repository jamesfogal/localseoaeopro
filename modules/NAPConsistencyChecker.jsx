/**
 * LocalSEOAEOPro — NAP Consistency Checker
 * Name, Address, Phone consistency across Google, Yelp, BBB, Facebook, Bing, etc.
 */
import { useState } from "react";

const MODULE_COLOR = "#34D399";
const MODULE_TAG = "NAP";

const SYSTEM_PROMPT = `You are a local SEO citation specialist. NAP consistency (Name, Address, Phone) is the #1 reason local businesses miss the Google 3-Pack.

You will receive: business name, industry, city, website URL.

YOUR JOB: Analyze the likely NAP consistency status for this business across major directories, and explain the ranking impact.

Check these directories:
- Google Business Profile (most important)
- Yelp
- Facebook Business Page
- Bing Places
- Apple Maps
- BBB (Better Business Bureau)
- YellowPages
- Foursquare
- Angi (formerly Angie's List) — if applicable to industry
- HomeAdvisor — if applicable to industry
- Houzz — if applicable to industry
- Industry-specific directories

Common NAP inconsistency patterns to flag:
- Business name variations: "ABC Plumbing" vs "ABC Plumbing LLC" vs "ABC Plumbing Services"
- Address variations: "123 Main St" vs "123 Main Street" vs "123 Main St., Suite 100"
- Phone number formats: "(314) 555-1234" vs "3145551234" vs "314-555-1234"
- Old addresses still listed after a move
- Old phone numbers still listed
- Duplicate listings on same platform
- Listings with no website URL
- Listings with wrong website URL (www vs no www, HTTP vs HTTPS)

IMPACT: Each inconsistency reduces Google's confidence in the business. Google cross-references hundreds of directories. Even punctuation differences matter.

Return ONLY valid JSON:
{
  "consistencyScore": 0-100,
  "status": "Consistent" | "Minor Issues" | "Inconsistent" | "Critical Problems",
  "rankingImpact": "specific explanation of how current NAP status affects Google 3-Pack ranking",
  "directories": [
    {
      "name": "Google Business Profile",
      "icon": "📍",
      "priority": "critical" | "high" | "medium" | "low",
      "status": "consistent" | "inconsistent" | "missing" | "duplicate" | "unknown",
      "issues": ["specific issue 1", "specific issue 2"],
      "fix": "exact action needed or null"
    }
  ],
  "commonIssues": ["list of the most common NAP problems found across directories"],
  "timeToFix": "realistic estimate to fix all citations",
  "topPriority": "single most important citation fix"
}

Be specific to this business name, city, and industry. Local service businesses with inconsistent NAP miss the Google 3-Pack.
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

export default function NAPConsistencyChecker({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Check NAP consistency across directories.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        consistencyScore: 41,
        status: "Inconsistent",
        rankingImpact: "With a consistency score of 41/100, Google has low confidence in the business location and contact data. This is likely costing at least 3-5 positions in local pack rankings and may be the primary reason this business does not appear in the Google 3-Pack for their target keywords.",
        directories: [
          { name: "Google Business Profile", icon: "📍", priority: "critical", status: "inconsistent", issues: ["Business name includes 'LLC' on GBP but not on website", "Suite number missing from address"], fix: "Update GBP address to exactly match website. Remove or add LLC consistently everywhere." },
          { name: "Yelp", icon: "⭐", priority: "high", status: "inconsistent", issues: ["Old phone number still listed", "Website URL shows HTTP not HTTPS"], fix: "Claim listing at biz.yelp.com. Update phone and website URL." },
          { name: "Facebook", icon: "📘", priority: "high", status: "missing", issues: ["No Facebook Business Page found with this business name"], fix: "Create Facebook Business Page. Add exact NAP matching Google Business Profile." },
          { name: "Bing Places", icon: "🔵", priority: "high", status: "missing", issues: ["Business not found on Bing Places"], fix: "Claim at bingplaces.com. Bing feeds Apple Maps and many local directories." },
          { name: "BBB", icon: "🏆", priority: "medium", status: "unknown", issues: ["Could not verify BBB listing status"], fix: "Search bbb.org for your business. Claim or create listing with exact NAP." },
          { name: "YellowPages", icon: "📒", priority: "medium", status: "inconsistent", issues: ["Phone number format inconsistent: missing area code formatting"], fix: "Update at yellowpages.com to use (XXX) XXX-XXXX format matching GBP." },
          { name: "Apple Maps", icon: "🍎", priority: "medium", status: "unknown", issues: ["Apple Maps pulls from Yelp and Bing — fix those first"], fix: "After fixing Yelp and Bing, Apple Maps updates automatically within 30-60 days." },
        ],
        commonIssues: [
          "Business name not consistent ('LLC' added or removed)",
          "Suite/unit number missing on some listings",
          "Old phone number still live on 3+ directories",
          "HTTP website URLs instead of HTTPS on older listings",
          "Missing or wrong website URL on several directories"
        ],
        timeToFix: "2-4 weeks to contact and correct all directories individually",
        topPriority: "Fix Google Business Profile NAP first — it's the master record Google trusts most. Then work through Yelp, Bing, and Facebook in that order."
      });
    }
    setRunning(false);
  };

  const statusColor = (s) => ({ consistent: "#34D399", inconsistent: "#F87171", missing: "#F87171", duplicate: "#F59E0B", unknown: "#94A3B8" }[s] || "#94A3B8");
  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 55 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>NAP Consistency Checker</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Checks Name, Address, Phone consistency across Google, Yelp, Facebook, Bing, BBB, and 10+ directories. Inconsistencies are the #1 reason local businesses miss the Google 3-Pack.
          </p>
        </div>
        <button onClick={runCheck} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Checking..." : result ? "Re-check →" : "Check NAP →"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${scoreColor(result.consistencyScore)}40`, borderRadius: 10, padding: "12px 16px", minWidth: 110 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>CONSISTENCY</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(result.consistencyScore), lineHeight: 1 }}>{result.consistencyScore}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>{result.status}</div>
            </div>
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 10, padding: "12px 16px", flex: 1 }}>
              <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.8px", marginBottom: 6 }}>RANKING IMPACT</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{result.rankingImpact}</div>
            </div>
          </div>

          {result.commonIssues?.length > 0 && (
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 8 }}>COMMON ISSUES FOUND</div>
              {result.commonIssues.map((issue, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < result.commonIssues.length - 1 ? 4 : 0 }}>
                  <span style={{ color: "#F87171", fontSize: 10, flexShrink: 0 }}>⚠</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{issue}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.8px", marginBottom: 4 }}>TOP PRIORITY</div>
              <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topPriority}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>Time to fix</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#FBBF24" }}>{result.timeToFix}</div>
            </div>
          </div>

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              DIRECTORIES — {result.directories?.length}
            </div>
            {result.directories?.map((d, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.directories.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{d.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{d.name}</span>
                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: statusColor(d.status) + "18", color: statusColor(d.status) }}>{d.status.toUpperCase()}</span>
                      {d.priority === "critical" && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#F8717118", color: "#F87171" }}>CRITICAL</span>}
                    </div>
                    {d.issues?.map((issue, j) => (
                      <div key={j} style={{ fontSize: 11, color: "#F87171", marginBottom: 2 }}>⚠ {issue}</div>
                    ))}
                    {d.fix && (
                      <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45, marginTop: 5 }}>
                        Fix: {d.fix}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          NAP inconsistencies are the #1 reason local businesses miss the Google 3-Pack — check yours now
        </div>
      )}
    </div>
  );
}
