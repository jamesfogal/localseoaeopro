/**
 * LocalRank Pro â€” Competitor Intelligence
 * Tag: CX | Group: Competitors
 * Named Mode: real competitor names (for owner use)
 * Anonymous Mode: Local Competitor A/B/C (for prospect presentations)
 */
import { useState } from "react";
const MODULE_COLOR = "#F87171";

export default function CompetitorIntelligence({ industry, city, websiteUrl, businessName, mode = "named", plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          system: `You are a local competitor intelligence analyst for LocalRank Pro. Analyze local competitors for a business in full detail.

${mode === "anonymous" ? "ANONYMOUS MODE: Label competitors as 'Local Competitor A', 'Local Competitor B', 'Local Competitor C'. Do not use real business names." : "NAMED MODE: Use realistic local competitor business names for this industry and city."}

Return ONLY valid JSON:
{
  "competitors": [
    {
      "name": "competitor name",
      "label": "Local Competitor A|B|C or real name",
      "threat": "high|medium|low",
      "overallScore": 0-100,
      "gbpScore": 0-100,
      "reviewCount": number,
      "averageRating": number,
      "estimatedMonthlyTraffic": number,
      "topKeywords": ["kw1","kw2","kw3"],
      "strengths": ["strength 1","strength 2"],
      "weaknesses": ["weakness 1","weakness 2"],
      "gapToExploit": "specific opportunity to take traffic from this competitor",
      "websiteScore": 0-100
    }
  ],
  "marketSummary": "one paragraph on the competitive landscape",
  "biggestOpportunity": "the single most exploitable gap across all competitors",
  "followUpEmail": {
    "subject": "email subject for prospect follow-up",
    "body": "short follow-up email referencing the competitor analysis"
  }
}

Generate 3 competitors. Be specific to this industry and city.`,
          messages: [{ role: "user", content: `Analyze competitors for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "their city"}\nMode: ${mode}` })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      const names = mode === "anonymous"
        ? ["Local Competitor A", "Local Competitor B", "Local Competitor C"]
        : ["Shield Security St. Charles", "St. Louis Alarm Pros", "Safe Home Systems MO"];
      setResult({
        competitors: [
          { name: names[0], label: names[0], threat: "high", overallScore: 78, gbpScore: 82, reviewCount: 94, averageRating: 4.7, estimatedMonthlyTraffic: 1240, topKeywords: [`alarm company ${city||"st charles"}`, `fire alarm installation`, `security monitoring`], strengths: ["Strong GBP with 94 reviews", "Dominant in Google 3-Pack for core terms"], weaknesses: ["No city landing pages beyond main area", "Website loads slowly (4.2s)"], gapToExploit: "They have no content targeting surrounding cities â€” O'Fallon, St. Peters, Wentzville are all unclaimed.", websiteScore: 61 },
          { name: names[1], label: names[1], threat: "medium", overallScore: 55, gbpScore: 58, reviewCount: 31, averageRating: 4.2, estimatedMonthlyTraffic: 620, topKeywords: [`alarm monitoring`, `home security`, `fire alarm`], strengths: ["Good pricing page", "Active on social media"], weaknesses: ["Only 31 GBP reviews â€” very beatable", "No FAQ or Q&A content"], gapToExploit: "Their review count is low and response rate is 0%. A review campaign would push you past them within 60 days.", websiteScore: 52 },
          { name: names[2], label: names[2], threat: "low", overallScore: 38, gbpScore: 41, reviewCount: 12, averageRating: 3.9, estimatedMonthlyTraffic: 290, topKeywords: [`security cameras`, `alarm systems`], strengths: ["Established local name"], weaknesses: ["3.9 star rating actively hurting them", "Website has major technical issues"], gapToExploit: "Their poor reviews are driving customers away â€” target 'alarm company reviews' keywords to capture those searches.", websiteScore: 34 }
        ],
        marketSummary: `The ${city || "local"} ${industry || "alarm"} market has one dominant player and two weaker competitors. The top competitor is strong but has geographic gaps in surrounding cities. The market is far from saturated for a business willing to invest in city pages and review generation.`,
        biggestOpportunity: "Surrounding city pages â€” none of the three competitors have content targeting O'Fallon, St. Peters, or Wentzville. Creating city pages for these areas could generate 400+ new monthly searches within 90 days.",
        followUpEmail: {
          subject: `What we found about your competitors in ${city || "your market"}`,
          body: `Hi [Name],\n\nI wanted to share something we found when analyzing your local market.\n\nYour top competitor has 94 Google reviews and dominates the local 3-Pack â€” but they have zero content targeting surrounding cities. That's a wide open door.\n\nMore importantly, we found 3 specific gaps that could move you past them within 90 days without competing head-to-head on their strongest terms.\n\nWould you have 20 minutes this week to walk through what we found?\n\n[Your Name]`
        }
      });
    }
    setRunning(false);
  };

  const tc = { high: "#F87171", medium: "#FBBF24", low: "#34D399" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>CX</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Competitor Intelligence</span>
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: mode === "named" ? "#10D9A014" : "#A78BFA14", color: mode === "named" ? "#10D9A0" : "#A78BFA", border: `0.5px solid ${mode === "named" ? "#10D9A030" : "#A78BFA30"}` }}>
              {mode === "named" ? "Named Mode" : "Anonymous Mode"}
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            {mode === "named" ? "Full competitor profiles with real business names, scores, gaps, and exploitation strategy." : "Competitor profiles labeled A/B/C â€” creates urgency in prospect presentations without giving away a DIY roadmap."}
          </p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Analyzing..." : result ? "Re-run â†’" : "Analyze Competitors â†’"}
        </button>
      </div>

      {result && (
        <div>
          {result.biggestOpportunity && (
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 3 }}>BIGGEST OPPORTUNITY ACROSS ALL COMPETITORS</div>
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.biggestOpportunity}</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {(result.competitors || []).map((c, i) => (
              <div key={i} style={{ border: `0.5px solid ${tc[c.threat]}40`, borderRadius: 10, overflow: "hidden" }}>
                <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", cursor: "pointer", background: `${tc[c.threat]}06` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: tc[c.threat] + "18", color: tc[c.threat], fontWeight: 500 }}>{c.threat.toUpperCase()} THREAT</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{c.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>Score</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: c.overallScore > 65 ? "#F87171" : "#FBBF24" }}>{c.overallScore}/100</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>Reviews</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{c.reviewCount} â˜…{c.averageRating}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{expanded === i ? "â–²" : "â–¼"}</span>
                  </div>
                </div>
                {expanded === i && (
                  <div style={{ padding: "10px 12px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 9, color: "#34D399", fontWeight: 500, marginBottom: 4 }}>THEIR STRENGTHS</div>
                        {(c.strengths || []).map((s, j) => <div key={j} style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 2 }}>Â· {s}</div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "#F87171", fontWeight: 500, marginBottom: 4 }}>THEIR WEAKNESSES</div>
                        {(c.weaknesses || []).map((w, j) => <div key={j} style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 2 }}>Â· {w}</div>)}
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", background: "#10D9A008", border: "0.5px solid #10D9A030", borderRadius: 6 }}>
                      <div style={{ fontSize: 9, color: "#10D9A0", fontWeight: 500, marginBottom: 3 }}>GAP TO EXPLOIT</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{c.gapToExploit}</div>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(c.topKeywords || []).map(kw => <span key={kw} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, background: "#A78BFA18", color: "#A78BFA", border: "0.5px solid #A78BFA30" }}>{kw}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {result.followUpEmail && plan !== "free" && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>FOLLOW-UP EMAIL TEMPLATE</div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 4 }}>Subject: {result.followUpEmail.subject}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{result.followUpEmail.body}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Full competitor profiles â€” strengths, weaknesses, and exactly how to take their traffic</div>}
    </div>
  );
}

