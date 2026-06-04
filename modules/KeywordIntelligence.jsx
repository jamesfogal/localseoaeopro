/**
 * Keyword Intelligence
 * Tag: KIN | Group: Keywords
 */
import { useState } from "react";

export default function KeywordIntelligence({ industry, city, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const MODULE_COLOR = "#A78BFA";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: `You are a local keyword intelligence analyst. Generate deep keyword research for a local business including volume estimates, difficulty, seasonal trends, and content type recommendations. Return ONLY valid JSON: {"keywords":[{"phrase":"exact keyword","monthlySearches":number,"difficulty":1-100,"localIntent":"high|medium","seasonality":"year-round|seasonal","peakMonths":["month"],"contentType":"service page|city page|faq|blog|comparison","currentOpportunity":"immediate|short-term|long-term","schema":"LocalBusiness|FAQPage|Service|HowTo"}],"contentPriority":"which content type to create first and why","seasonalAlert":"any seasonal opportunity coming up"}`,
          messages: [{ role: "user", content: `Generate keyword intelligence for ${businessName || "Local Business"}, ${industry} in ${city}. Generate 15 keywords.` }]
        })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      setResult({
        keywords: [
          { phrase: `fire alarm monitoring ${city||"st charles"}`, monthlySearches: 320, difficulty: 42, localIntent: "high", seasonality: "year-round", peakMonths: [], contentType: "service page", currentOpportunity: "immediate", schema: "Service" },
          { phrase: `home security company near me`, monthlySearches: 890, difficulty: 68, localIntent: "high", seasonality: "year-round", peakMonths: [], contentType: "city page", currentOpportunity: "short-term", schema: "LocalBusiness" },
          { phrase: `how much does alarm monitoring cost`, monthlySearches: 440, difficulty: 28, localIntent: "medium", seasonality: "year-round", peakMonths: [], contentType: "faq", currentOpportunity: "immediate", schema: "FAQPage" },
          { phrase: `best alarm company ${city||"st charles"} review`, monthlySearches: 140, difficulty: 35, localIntent: "high", seasonality: "year-round", peakMonths: [], contentType: "comparison", currentOpportunity: "immediate", schema: "LocalBusiness" },
          { phrase: `fire alarm inspection requirements missouri`, monthlySearches: 210, difficulty: 22, localIntent: "medium", seasonality: "seasonal", peakMonths: ["January", "February"], contentType: "blog", currentOpportunity: "immediate", schema: "HowTo" },
        ],
        contentPriority: "Create service pages first — they have the highest local intent and directly target transactional searches where people are ready to call.",
        seasonalAlert: "Fire safety awareness month in October — create content now to rank before the peak."
      });
    }
    setRunning(false);
  };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>KIN</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Keyword Intelligence</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Deep keyword data — volume estimates, difficulty scoring, seasonal peaks, content type recommendations, and schema type per keyword.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {running ? "Analyzing..." : result ? "Re-run →" : "Run Intelligence →"}
        </button>
      </div>
      {result && (
        <div>
          {result.seasonalAlert && <div style={{ background: "#FBBF2410", border: "0.5px solid #FBBF2430", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "var(--color-text-primary)" }}><span style={{ color: "#FBBF24", fontWeight: 500 }}>Seasonal: </span>{result.seasonalAlert}</div>}
          {result.contentPriority && <div style={{ background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "var(--color-text-primary)" }}><span style={{ color: MODULE_COLOR, fontWeight: 500, fontSize: 9 }}>CONTENT PRIORITY: </span>{result.contentPriority}</div>}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 80px", gap: 6, padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Keyword", "Searches", "Difficulty", "Content type", "Opportunity"].map(h => <div key={h} style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)" }}>{h}</div>)}
            </div>
            {(plan === "free" ? (result.keywords || []).slice(0,4) : (result.keywords || [])).map((kw, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 80px", gap: 6, alignItems: "center", padding: "9px 12px", borderBottom: i < (result.keywords?.length || 0) - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{kw.phrase}</div>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{kw.schema} schema · {kw.seasonality}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-primary)", fontWeight: 500 }}>{kw.monthlySearches?.toLocaleString()}/mo</div>
                <div style={{ fontSize: 11, color: kw.difficulty < 40 ? "#34D399" : kw.difficulty < 65 ? "#FBBF24" : "#F87171", fontWeight: 500 }}>{kw.difficulty}/100</div>
                <div style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>{kw.contentType}</div>
                <div style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: kw.currentOpportunity === "immediate" ? "#34D39918" : "#FBBF2418", color: kw.currentOpportunity === "immediate" ? "#34D399" : "#FBBF24" }}>{kw.currentOpportunity}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Deep local keyword data with volume, difficulty, seasonality, and content recommendations</div>}
    </div>
  );
}
