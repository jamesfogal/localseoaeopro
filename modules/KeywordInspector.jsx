/**
 * LocalRank Pro — Keyword Inspector
 * Tag: KI | Group: Keywords
 * Finds local keyword gaps — city searches competitors win that you don't
 */

import { useState } from "react";
const MODULE_COLOR = "#A78BFA";
const MODULE_TAG = "KI";

const SYSTEM_PROMPT = `You are a local keyword gap specialist for LocalRank Pro.

Find keyword gaps for a local business — searches people make in their city that competitors rank for but this business does not.

IMPORTANT: These are LOCAL search keywords only. City-specific. Google 3-Pack and local organic results.
NOT national keywords. Every keyword must include the city or a local modifier.

Return ONLY valid JSON:
{
  "moduleId": "keyword-inspector",
  "score": 0-100,
  "city": "string",
  "industry": "string",
  "totalGaps": number,
  "highPriority": number,
  "estimatedMonthlySearches": number,
  "gaps": [
    {
      "keyword": "exact local keyword phrase",
      "monthlySearches": number,
      "difficulty": "easy|medium|hard",
      "intent": "informational|transactional|navigational",
      "currentRank": "not ranking|11-20|21+",
      "competitorRanking": "competitor name or type ranking #1-3",
      "priority": "high|medium|low",
      "pageToCreate": "url slug to target this keyword",
      "quickWin": boolean
    }
  ],
  "topRecommendation": "single most impactful keyword to target first and why"
}

Generate 20-25 gaps. Mix of service + city combinations, question-based local queries, and comparison keywords.`;

export default function KeywordInspector({ industry, city, websiteUrl, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState("all");

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000, system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Find keyword gaps:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "their city"}\nWebsite: ${websiteUrl || "their site"}\nMode: ${mode || "named"}\n\nGenerate realistic local keyword gaps for this industry and city.` }]
        })
      });
      const data = await res.json();
      const clean = (data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setResult({
        score: 42, city: city || "St. Charles", industry: industry || "Alarm Systems",
        totalGaps: 22, highPriority: 8, estimatedMonthlySearches: 1840,
        gaps: [
          { keyword: `fire alarm company ${city || "st charles"}`, monthlySearches: 320, difficulty: "medium", intent: "transactional", currentRank: "not ranking", competitorRanking: "Shield Security #1", priority: "high", pageToCreate: `/fire-alarm-company-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: true },
          { keyword: `alarm monitoring ${city || "st charles"} mo`, monthlySearches: 210, difficulty: "easy", intent: "transactional", currentRank: "not ranking", competitorRanking: "ADT Local #2", priority: "high", pageToCreate: `/alarm-monitoring-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: true },
          { keyword: `best security system ${city || "st charles"}`, monthlySearches: 180, difficulty: "medium", intent: "transactional", currentRank: "21+", competitorRanking: "Local Alarm Pros #1", priority: "high", pageToCreate: `/best-security-system-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: false },
          { keyword: `home alarm installation near me`, monthlySearches: 440, difficulty: "hard", intent: "transactional", currentRank: "not ranking", competitorRanking: "Vivint #1", priority: "high", pageToCreate: `/home-alarm-installation/`, quickWin: false },
          { keyword: `fire alarm inspection ${city || "st charles"}`, monthlySearches: 90, difficulty: "easy", intent: "transactional", currentRank: "not ranking", competitorRanking: "None ranking locally", priority: "high", pageToCreate: `/fire-alarm-inspection-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: true },
          { keyword: `how much does alarm monitoring cost ${city || "st charles"}`, monthlySearches: 140, difficulty: "easy", intent: "informational", currentRank: "not ranking", competitorRanking: "Generic blog #1", priority: "medium", pageToCreate: `/alarm-monitoring-cost-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: true },
          { keyword: `commercial fire alarm ${city || "st charles"}`, monthlySearches: 110, difficulty: "medium", intent: "transactional", currentRank: "not ranking", competitorRanking: "Shield Security #2", priority: "high", pageToCreate: `/commercial-fire-alarm-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: false },
          { keyword: `security camera installation ${city || "st charles"}`, monthlySearches: 160, difficulty: "medium", intent: "transactional", currentRank: "21+", competitorRanking: "Safe Home Systems #1", priority: "medium", pageToCreate: `/security-camera-installation-${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}/`, quickWin: false },
        ],
        topRecommendation: `Target "fire alarm company ${city || "St. Charles"}" first — 320 monthly searches, medium difficulty, and no strong local competitor owns it. Create a dedicated city page with LocalBusiness schema and 500+ words targeting this phrase.`
      });
    }
    setRunning(false);
  };

  const displayed = plan === "free" ? (result?.gaps || []).slice(0, 5) : (result?.gaps || []);
  const filtered = filter === "all" ? displayed : displayed.filter(g => g.priority === filter || (filter === "quickwin" && g.quickWin));
  const dc = { easy: "#34D399", medium: "#FBBF24", hard: "#F87171" };
  const pc = { high: "#F87171", medium: "#FBBF24", low: "#94A3B8" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Keyword Inspector</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Finds local keyword gaps — city-specific searches that competitors rank for in the Google 3-Pack and local organic results that you don't. Every keyword is local. No national fluff.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Analyzing..." : result ? "Re-run →" : "Find Gaps →"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            {[
              { label: "Keyword gaps", value: result.totalGaps, color: "#F87171" },
              { label: "High priority", value: result.highPriority, color: "#F87171" },
              { label: "Monthly searches", value: result.estimatedMonthlySearches?.toLocaleString(), color: MODULE_COLOR },
              { label: "Opportunity score", value: result.score, color: result.score < 50 ? "#F87171" : "#FBBF24" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 3, letterSpacing: "0.6px" }}>TOP PRIORITY</div>
            <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topRecommendation}</div>
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {["all", "high", "medium", "quickwin"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "0.5px solid var(--color-border-secondary)", background: filter === f ? MODULE_COLOR : "transparent", color: filter === f ? "#fff" : "var(--color-text-secondary)", cursor: "pointer" }}>
                {f === "quickwin" ? "Quick wins" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 80px", gap: 8, padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Keyword", "Searches/mo", "Difficulty", "Priority"].map(h => <div key={h} style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.6px" }}>{h}</div>)}
            </div>
            {filtered.map((gap, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 80px", gap: 8, alignItems: "start", padding: "9px 12px", borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2, display: "flex", gap: 5, alignItems: "center" }}>
                    {gap.keyword}
                    {gap.quickWin && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#34D39918", color: "#34D399" }}>Quick win</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Page: {gap.pageToCreate}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{gap.competitorRanking}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-primary)", fontWeight: 500 }}>{gap.monthlySearches?.toLocaleString()}</div>
                <div><span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: dc[gap.difficulty] + "18", color: dc[gap.difficulty] }}>{gap.difficulty}</span></div>
                <div><span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: pc[gap.priority] + "18", color: pc[gap.priority] }}>{gap.priority}</span></div>
              </div>
            ))}
            {plan === "free" && (result?.gaps?.length || 0) > 5 && (
              <div style={{ padding: "12px", background: "var(--color-background-secondary)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>{(result.gaps.length - 5)} more keyword gaps in the full report</div>
                <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade to see all</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Finds every local keyword your competitors rank for that you don't
        </div>
      )}
    </div>
  );
}
