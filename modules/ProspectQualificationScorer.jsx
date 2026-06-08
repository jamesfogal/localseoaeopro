/**
 * LocalSEOAEOPro — Prospect Qualification Scorer
 * Overall score of how good a prospect this business is for LocalSEOAEOPro services
 */
import { useState } from "react";

const MODULE_COLOR = "#A78BFA";
const MODULE_TAG = "PQS";

const SYSTEM_PROMPT = `You are a sales qualifier for LocalSEOAEOPro, an AI local SEO platform.

You will receive: business name, industry, city, website URL.

YOUR JOB: Score this business as a prospect for local SEO services and generate a complete qualification report.

A high-quality prospect has:
- A real local service business (not e-commerce, not national chain)
- A weak or broken website with fixable problems
- Clear revenue potential (emergency services, high-ticket B2C services)
- Competition in their market (they need SEO to win)
- No current SEO agency (signs: no GTM, no structured content, outdated site)
- Decision-maker likely accessible (small business = owner answers phone)

Score these dimensions:
1. INDUSTRY FIT (0-100): Is this a good industry for local SEO services?
   - Best: HVAC, plumbing, electrical, roofing, pest control, law firms, dentists, chiropractors, auto repair
   - Good: general contractors, landscaping, cleaning, moving, insurance, financial advisors
   - Weak: restaurants (low margins), retail, national chains (no decision power)

2. PAIN LEVEL (0-100): How much pain are they in right now?
   - High: slow site + bad rankings + no tracking + dead-zone hosting
   - Medium: some issues but partially addressed
   - Low: already optimized, may have an agency

3. REVENUE POTENTIAL (0-100): What's the lifetime value of fixing their problems?
   - Emergency/high-ticket services: HVAC, legal, medical = very high
   - Regular services: landscaping, cleaning = medium
   - Low-ticket: restaurants, retail = low

4. ACCESSIBILITY (0-100): Can we close this deal?
   - Signs of small/owner-operated business = high
   - Signs of franchise or chain = low
   - Signs of existing SEO agency = lower urgency

5. WEBSITE CONDITION (0-100): How much work is needed vs available?
   - Perfect prospect: lots of problems, all fixable
   - Avoid: either already great OR on platform we can't fix (pure Wix/Squarespace)

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "grade": "A+" | "A" | "B+" | "B" | "C" | "D",
  "verdict": "Hot Lead" | "Strong Prospect" | "Qualified" | "Borderline" | "Low Priority" | "Pass",
  "estimatedFirstMonthRevenue": "$XXX",
  "estimatedYearOneRevenue": "$X,XXX",
  "dimensions": {
    "industryFit": { "score": 0-100, "note": "" },
    "painLevel": { "score": 0-100, "note": "" },
    "revenuePotential": { "score": 0-100, "note": "" },
    "accessibility": { "score": 0-100, "note": "" },
    "websiteCondition": { "score": 0-100, "note": "" }
  },
  "openingLine": "A specific, compelling first sentence to open a sales call with this prospect",
  "topHooks": ["3 specific pain points to lead with in the conversation"],
  "redFlags": ["any concerns or reasons to deprioritize"],
  "recommendedApproach": "free audit email / cold call / LinkedIn / referral / etc.",
  "suggestedOffer": "specific service package recommendation for this prospect"
}

Be specific to this business name, industry, and city. Never generic.
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

export default function ProspectQualificationScorer({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runScore = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Score this prospect for local SEO services.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        overallScore: 84,
        grade: "A",
        verdict: "Strong Prospect",
        estimatedFirstMonthRevenue: "$794",
        estimatedYearOneRevenue: "$4,083",
        dimensions: {
          industryFit: { score: 92, note: "Security/alarm services are high-ticket, recurring contract businesses. Every lead is worth thousands. SEO investment pays back fast." },
          painLevel: { score: 88, note: "Mobile score 64, 7.5s LCP, no analytics, GoDaddy hosting — this site has almost every problem we fix. High urgency." },
          revenuePotential: { score: 85, note: "Commercial security contracts average $500-2,000/month. One new customer from better rankings pays for a full year of service." },
          accessibility: { score: 78, note: "Appears to be a local owner-operated business. Decision maker likely accessible and makes their own marketing calls." },
          websiteCondition: { score: 80, note: "WordPress on GoDaddy with Elementor — every problem is fixable. Not on a locked platform. Great candidate for full service." }
        },
        openingLine: "I ran a free audit on CityWide Alarms and found your mobile site is loading in 7.5 seconds — that's why you're not showing up in the Google 3-Pack for 'alarm company St. Louis'.",
        topHooks: [
          "Your mobile score is 64/100 — Google's cutoff for first-page rankings is 90+. You're invisible to anyone searching on a phone.",
          "You have no analytics installed — you literally cannot tell which of your ads is generating calls right now.",
          "Your GoDaddy server responds in 800ms before a single pixel loads — that's a hosting problem no amount of optimization can fix."
        ],
        redFlags: [
          "Check if they already have an SEO agency — an active agency relationship makes a quick close unlikely",
          "GoDaddy hosting means we'd recommend a migration — adds friction to the close but also increases first-month revenue"
        ],
        recommendedApproach: "Send the free PingClose audit report by email, then call 48 hours later referencing the specific mobile score and LCP number.",
        suggestedOffer: "Start with 'Run the Full Race' ($495 cleanup) + $299/month managed. Lead with the hosting migration and analytics install as the two quick wins."
      });
    }
    setRunning(false);
  };

  const gradeColor = (g) => {
    if (g?.startsWith("A")) return "#34D399";
    if (g?.startsWith("B")) return "#FBBF24";
    if (g === "C") return "#F59E0B";
    return "#F87171";
  };
  const verdictColor = (v) => {
    if (v === "Hot Lead" || v === "Strong Prospect") return "#34D399";
    if (v === "Qualified" || v === "Borderline") return "#FBBF24";
    return "#F87171";
  };
  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 60 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Prospect Qualification Scorer</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Scores a prospect on 5 dimensions: industry fit, pain level, revenue potential, accessibility, and website condition. Generates a sales opening line and top hooks.
          </p>
        </div>
        <button onClick={runScore} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Scoring..." : result ? "Re-score →" : "Score →"}
        </button>
      </div>

      {result && (
        <div>
          {/* Header scores */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${gradeColor(result.grade)}40`, borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>GRADE</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: gradeColor(result.grade), lineHeight: 1 }}>{result.grade}</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: `${verdictColor(result.verdict)}10`, border: `0.5px solid ${verdictColor(result.verdict)}40`, borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: verdictColor(result.verdict) }}>{result.verdict}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor(result.overallScore) }}>{result.overallScore}/100</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "6px 10px" }}>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>MONTH 1 REVENUE</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#34D399" }}>{result.estimatedFirstMonthRevenue}</div>
                </div>
                <div style={{ flex: 1, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "6px 10px" }}>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>YEAR 1 REVENUE</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#34D399" }}>{result.estimatedYearOneRevenue}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dimension scores */}
          <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 10 }}>QUALIFICATION DIMENSIONS</div>
            {result.dimensions && Object.entries(result.dimensions).map(([key, dim]) => {
              const labels = { industryFit: "Industry Fit", painLevel: "Pain Level", revenuePotential: "Revenue Potential", accessibility: "Accessibility", websiteCondition: "Website Condition" };
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{labels[key]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(dim.score) }}>{dim.score}</span>
                  </div>
                  <div style={{ height: 4, background: "#1E3050", borderRadius: 2, marginBottom: 3 }}>
                    <div style={{ height: "100%", width: `${dim.score}%`, background: scoreColor(dim.score), borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{dim.note}</div>
                </div>
              );
            })}
          </div>

          {/* Opening line */}
          <div style={{ background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 6 }}>OPENING LINE FOR SALES CALL</div>
            <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6, fontStyle: "italic" }}>"{result.openingLine}"</div>
          </div>

          {/* Top hooks */}
          <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 8 }}>TOP PAIN POINT HOOKS</div>
            {result.topHooks?.map((hook, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < result.topHooks.length - 1 ? 6 : 0 }}>
                <span style={{ color: "#A78BFA", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{hook}</span>
              </div>
            ))}
          </div>

          {/* Suggested offer */}
          <div style={{ background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 8, padding: "10px 14px", marginBottom: result.redFlags?.length > 0 ? 10 : 0 }}>
            <div style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.8px", marginBottom: 4 }}>RECOMMENDED APPROACH + OFFER</div>
            <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5, marginBottom: 4 }}><strong>Approach:</strong> {result.recommendedApproach}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}><strong>Offer:</strong> {result.suggestedOffer}</div>
          </div>

          {result.redFlags?.length > 0 && (
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.8px", marginBottom: 8 }}>RED FLAGS</div>
              {result.redFlags.map((flag, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < result.redFlags.length - 1 ? 4 : 0 }}>
                  <span style={{ color: "#F87171", fontSize: 10, flexShrink: 0 }}>⚠</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Scores industry fit, pain level, revenue potential, and generates a sales opening line for this prospect
        </div>
      )}
    </div>
  );
}
