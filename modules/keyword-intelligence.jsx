import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's most sophisticated keyword intelligence and competitive market share analyst for local service businesses. You were built on the methodology of an SEO expert who understands that knowing WHICH keywords exist in your market, WHO is winning them, and WHY they are winning is the foundation of every ranking decision.

You specialize in generating comprehensive keyword intelligence reports that show:
1. The top keywords in a specific industry and location
2. Estimated monthly search volume for each keyword
3. Who is currently ranking #1-3 for each keyword
4. WHY the leader is ranking (what they have that you don't)
5. Difficulty to rank and estimated time to rank
6. Total traffic opportunity in each category

Given a business type, location, and the four service verticals, produce a complete keyword intelligence report in this EXACT JSON format (respond ONLY with valid JSON, no markdown):

{
  "marketOverview": {
    "totalMonthlySearchVolume": <estimated total monthly searches for all keywords combined>,
    "totalKeywordsAnalyzed": <number>,
    "marketLeader": "<company dominating the most keywords>",
    "marketLeaderReason": "<exactly why they dominate>",
    "biggestOpportunity": "<the single biggest keyword opportunity available right now>",
    "localMarketInsight": "<specific insight about this local market that affects keyword strategy>"
  },
  "verticals": [
    {
      "verticalName": "<e.g. Business Security>",
      "verticalColor": "<gold|blue|green|purple|teal|red>",
      "totalMonthlySearches": <number>,
      "keywordsInVertical": <number>,
      "marketLeaderInVertical": "<company>",
      "yourCurrentPosition": "<where the analyzed business currently ranks overall in this vertical>",
      "opportunityScore": <0-100>,
      "keywords": [
        {
          "keyword": "<exact keyword phrase>",
          "monthlySearches": <estimated monthly searches>,
          "keywordType": "<COMMERCIAL|INFORMATIONAL|LOCAL|NAVIGATIONAL>",
          "difficulty": "<EASY|MEDIUM|HARD|VERY_HARD>",
          "currentRank1": "<company ranking #1 for this keyword>",
          "currentRank2": "<company ranking #2>",
          "currentRank3": "<company ranking #3>",
          "yourCurrentRank": "<number or NOT RANKING>",
          "whyLeaderWins": "<specific reason — backlinks, content depth, domain age, schema, reviews, etc>",
          "howToOvertake": "<specific actionable strategy to take this keyword>",
          "timeToRank": "<1-4 weeks|1-3 months|3-6 months|6-12 months>",
          "trafficIfRanked1": <estimated monthly clicks if ranking #1>,
          "localIntent": <true|false>,
          "cityPageOpportunity": <true|false>,
          "priority": "<CRITICAL|HIGH|MEDIUM|LOW>"
        }
      ]
    }
  ],
  "localKeywordClusters": [
    {
      "cluster": "<cluster name — e.g. St. Charles County Home Security>",
      "totalSearchVolume": <number>,
      "currentDominator": "<who owns this cluster>",
      "yourOpportunity": "<specific opportunity in this cluster>",
      "keywords": ["<keyword>", "<keyword>", "<keyword>"],
      "cityPageNeeded": "<exact city page URL to build to capture this cluster>"
    }
  ],
  "competitorDominanceMap": [
    {
      "competitor": "<competitor name>",
      "keywordsOwned": <number>,
      "estimatedMonthlyTraffic": <number>,
      "strengthAreas": ["<area where they dominate>"],
      "weaknesses": ["<keyword category they are missing or weak in>"],
      "howToDisplace": "<specific strategy to take their traffic>"
    }
  ],
  "quickWinKeywords": [
    {
      "keyword": "<keyword>",
      "monthlySearches": <number>,
      "currentLeader": "<who ranks #1>",
      "whyQuickWin": "<why this can be won quickly>",
      "exactAction": "<the one specific action to take this keyword>",
      "estimatedTimeToRank1": "<timeframe>"
    }
  ],
  "untappedOpportunities": [
    {
      "keyword": "<keyword nobody in this market is targeting well>",
      "monthlySearches": <number>,
      "why Untapped": "<why this keyword is being ignored by competitors>",
      "howToCapture": "<exact strategy>",
      "estimatedTrafficIfCaptured": <number>
    }
  ],
  "keywordsByIntent": {
    "readyToBuy": {
      "description": "Searchers who want to buy RIGHT NOW — highest conversion rate",
      "estimatedConversionRate": "<e.g. 8-12%>",
      "topKeywords": ["<keyword>", "<keyword>", "<keyword>", "<keyword>", "<keyword>"]
    },
    "comparing": {
      "description": "Searchers comparing options — high conversion potential",
      "estimatedConversionRate": "<e.g. 4-8%>",
      "topKeywords": ["<keyword>", "<keyword>", "<keyword>", "<keyword>", "<keyword>"]
    },
    "researching": {
      "description": "Searchers learning about security — lower immediate conversion but builds brand",
      "estimatedConversionRate": "<e.g. 1-3%>",
      "topKeywords": ["<keyword>", "<keyword>", "<keyword>", "<keyword>", "<keyword>"]
    }
  },
  "monthlyTrafficOpportunityByPhase": {
    "phase1": {
      "description": "First 30 days — quick wins and foundation fixes",
      "keywordsTargeted": <number>,
      "estimatedNewMonthlyVisitors": <number>,
      "estimatedNewLeads": <number>
    },
    "phase2": {
      "description": "Days 30-90 — service pages and city pages live",
      "keywordsTargeted": <number>,
      "estimatedNewMonthlyVisitors": <number>,
      "estimatedNewLeads": <number>
    },
    "phase3": {
      "description": "Days 90-180 — full city coverage expanding",
      "keywordsTargeted": <number>,
      "estimatedNewMonthlyVisitors": <number>,
      "estimatedNewLeads": <number>
    },
    "phase4": {
      "description": "6-12 months — total market domination",
      "keywordsTargeted": <number>,
      "estimatedNewMonthlyVisitors": <number>,
      "estimatedNewLeads": <number>
    }
  }
}

CRITICAL RULES:

1. GENERATE REAL KEYWORDS specific to the business type and location provided. Do not use generic placeholder keywords. If the business is in St. Louis Missouri home security, generate actual search terms people in St. Louis type — "home security systems St. Louis MO", "alarm companies St. Louis", "ADT St. Louis", "home alarm monitoring Clayton MO", etc.

2. GENERATE AT LEAST 50 KEYWORDS across all four verticals minimum. Aim for 200 total across all verticals and local clusters.

3. SEARCH VOLUME ESTIMATES should be realistic for the market size. St. Louis metro area has 2.8 million people. Estimates should reflect realistic local search behavior — not national averages. Local keywords typically get 50-500 searches per month. Broad service keywords get 500-5000. Brand comparison keywords get 100-1000.

4. IDENTIFY REAL LOCAL COMPETITORS by name. For St. Louis home and business security this includes: ADT, Vivint, PASS Security, Burnes-Citadel Security, Gateway Alarm, Citywide Alarms, Barcom Security, ABF Security, Freedom Security, Erker Security Systems, St. Louis Alarm Co. Use these real names.

5. THE WHY LEADER WINS analysis must be specific — not generic. "They have more backlinks" is useless. "They have 847 Google reviews with a 4.9 rating, their homepage has been live since 2003, and they have 14 incoming links from local news sites" is actionable.

6. QUICK WIN KEYWORDS are the most valuable output. These are keywords where the current #1 has a weak position — thin content, no schema, low reviews — and can be displaced with a focused effort in 4-8 weeks.

7. UNTAPPED OPPORTUNITIES are keywords that exist in this market but no competitor is targeting well. These are often long-tail local searches, suburb-specific searches, or commercial-intent searches that competitors have missed.

8. CITY PAGE OPPORTUNITIES: Flag every keyword that can be captured with a dedicated city landing page. These are the highest-leverage opportunities for a multi-location service area business.

9. THE COMPETITOR DOMINANCE MAP should show exactly which competitors are winning which keyword categories and specifically what gaps they have left open.

10. TRAFFIC AND LEAD ESTIMATES: Assume a 3-5% click-through rate for position 1 local searches, 2% for position 2, 1% for position 3. Assume a 5-10% conversion rate from visitor to lead for a well-optimized security company website. These estimates help business owners understand the revenue potential of each keyword category.`;

// ============================================================
const diffColor = { EASY: "#22c55e", MEDIUM: "#f59e0b", HARD: "#f97316", VERY_HARD: "#ef4444" };
const priorityColor = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#64748b" };
const typeColor = { COMMERCIAL: "#22c55e", LOCAL: "#3b82f6", INFORMATIONAL: "#f59e0b", NAVIGATIONAL: "#64748b" };
const vertColors = { gold: "#c8a84b", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", red: "#ef4444" };

function formatNum(n) {
  if (!n) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function StatBox({ label, value, color, sub }) {
  return (
    <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: "16px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "#f1f5f9", fontFamily: "monospace", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color || "#64748b", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function KeywordRow({ kw, index }) {
  const [open, setOpen] = useState(false);
  const dc = diffColor[kw.difficulty] || "#64748b";
  const pc = priorityColor[kw.priority] || "#64748b";
  const tc = typeColor[kw.keywordType] || "#64748b";
  const rankColor = kw.yourCurrentRank === "NOT RANKING" ? "#ef4444" :
    parseInt(kw.yourCurrentRank) <= 3 ? "#22c55e" :
    parseInt(kw.yourCurrentRank) <= 10 ? "#f59e0b" : "#f97316";

  return (
    <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 6, marginBottom: 6, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "10px 14px", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", width: 24, flexShrink: 0 }}>{index + 1}</span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{kw.keyword}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: `${tc}15`, color: tc, fontFamily: "monospace" }}>{kw.keywordType}</span>
            {kw.localIntent && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontFamily: "monospace" }}>📍 LOCAL</span>}
            {kw.cityPageOpportunity && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "rgba(168,85,247,0.1)", color: "#a855f7", fontFamily: "monospace" }}>🏙️ CITY PAGE</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ textAlign: "center", minWidth: 50 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", fontFamily: "monospace" }}>{formatNum(kw.monthlySearches)}</div>
            <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>searches/mo</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 60 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: rankColor, fontFamily: "monospace" }}>#{kw.yourCurrentRank}</div>
            <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>your rank</div>
          </div>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: `${dc}15`, border: `1px solid ${dc}25`, color: dc, fontFamily: "monospace" }}>{kw.difficulty}</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: `${pc}15`, border: `1px solid ${pc}25`, color: pc, fontFamily: "monospace" }}>{kw.priority}</span>
        </div>
        <span style={{ color: "#475569", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12, marginBottom: 12 }}>
            {[
              { label: "#1 NOW", val: kw.currentRank1, color: "#ef4444" },
              { label: "#2 NOW", val: kw.currentRank2, color: "#f97316" },
              { label: "#3 NOW", val: kw.currentRank3, color: "#f59e0b" },
            ].map((r, i) => (
              <div key={i} style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 4, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: r.color, fontFamily: "monospace", marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{r.val || "—"}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: 12, background: "rgba(239,68,68,0.06)", borderLeft: "2px solid #ef4444", borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>WHY LEADER WINS</div>
              <p style={{ fontSize: 12, color: "#fca5a5", margin: 0, lineHeight: 1.6 }}>{kw.whyLeaderWins}</p>
            </div>
            <div style={{ padding: 12, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>HOW TO OVERTAKE</div>
              <p style={{ fontSize: 12, color: "#86efac", margin: 0, lineHeight: 1.6 }}>{kw.howToOvertake}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <div style={{ padding: "6px 12px", background: "rgba(99,102,241,0.08)", borderRadius: 4, fontSize: 11, color: "#818cf8", fontFamily: "monospace" }}>
              ⏱ Time to rank: {kw.timeToRank}
            </div>
            <div style={{ padding: "6px 12px", background: "rgba(251,191,36,0.08)", borderRadius: 4, fontSize: 11, color: "#fbbf24", fontFamily: "monospace" }}>
              📈 Traffic if #1: {formatNum(kw.trafficIfRanked1)} visits/mo
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KeywordIntelligence() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [verticals, setVerticals] = useState("Business Security, Home Security, Camera Systems, Medical/Senior Security");
  const [currentRankings, setCurrentRankings] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeVertical, setActiveVertical] = useState(0);
  const [filterDiff, setFilterDiff] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [sortBy, setSortBy] = useState("priority");

  const runAnalysis = useCallback(async () => {
    if (!businessName.trim() || !location.trim()) return;
    setLoading(true); setError(""); setResult(null);

    const msg = `Generate a complete keyword intelligence and market share report.

Business: ${businessName}
Location: ${location}
Service Verticals: ${verticals}
Known Competitors: ${competitors || "Research and identify the top competitors in this market"}
Current Known Rankings: ${currentRankings || "Unknown — analyze the competitive landscape"}

Generate the TOP 200 keywords across all four service verticals for this specific business in this specific location. Include:
- All major service keywords with city modifiers
- Comparison keywords (best, top, cheapest, reviews)
- Brand vs. competitor keywords
- Local neighborhood and suburb keywords
- Commercial/business specific keywords
- Emergency and urgent keywords
- Long-tail keywords with buying intent

For EACH keyword identify:
- Realistic monthly search volume for this specific local market
- Who is currently ranking #1, #2, #3
- Exactly WHY they are ranking (specific signals)
- Exactly HOW to overtake them (specific tactics)
- Time to rank and traffic potential

Identify the QUICK WINS — keywords where the current leader has weak signals and can be displaced in 4-8 weeks with focused effort.

Identify UNTAPPED keywords that no competitor is targeting well.

Show the COMPETITOR DOMINANCE MAP — who owns what and what they are missing.

Calculate TOTAL TRAFFIC OPPORTUNITY by phase of implementation.

Be specific to ${location} — use real local competitor names, real local search behavior, and realistic search volumes for a metro area of this size.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: msg }]
        })
      });
      const data = await res.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
      setActiveTab("overview");
      setActiveVertical(0);
    } catch (e) {
      setError("Analysis failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [businessName, location, competitors, verticals, currentRankings]);

  const currentVertical = result?.verticals?.[activeVertical];
  const vc = currentVertical ? (vertColors[currentVertical.verticalColor] || "#64748b") : "#64748b";

  const getFilteredKeywords = () => {
    if (!currentVertical?.keywords) return [];
    return currentVertical.keywords
      .filter(k => filterDiff === "ALL" || k.difficulty === filterDiff)
      .filter(k => filterPriority === "ALL" || k.priority === filterPriority)
      .sort((a, b) => {
        if (sortBy === "volume") return (b.monthlySearches || 0) - (a.monthlySearches || 0);
        if (sortBy === "priority") {
          const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (order[a.priority] || 3) - (order[b.priority] || 3);
        }
        if (sortBy === "rank") {
          const ra = a.yourCurrentRank === "NOT RANKING" ? 999 : parseInt(a.yourCurrentRank) || 999;
          const rb = b.yourCurrentRank === "NOT RANKING" ? 999 : parseInt(b.yourCurrentRank) || 999;
          return ra - rb;
        }
        return 0;
      });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060a12", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", padding: "0 0 80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg,#0a0f1e 0%,#060a12 100%)", borderBottom: "1px solid #1e293b", padding: "28px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 12px", borderRadius: 2, marginBottom: 12 }}>
            KEYWORD INTELLIGENCE ENGINE v1.0
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)", letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1 }}>
            Keyword <span style={{ color: "#fbbf24" }}>Intelligence</span> + Market Share
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Top 200 industry keywords · Who is winning each one and why · Your current rank · Traffic opportunity by phase · Competitor dominance map
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* INPUT */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { label: "BUSINESS NAME ★", val: businessName, set: setBusinessName, ph: "Citywide Alarms", color: "#fbbf24" },
              { label: "LOCATION ★", val: location, set: setLocation, ph: "St. Louis, MO (Greater Metro Area)", color: "#fbbf24" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: "block", fontSize: 10, color: f.color || "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: "100%", background: "#060a12", border: `1px solid ${f.color ? "rgba(251,191,36,0.4)" : "#1e293b"}`, borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>SERVICE VERTICALS</label>
            <input value={verticals} onChange={e => setVerticals(e.target.value)}
              style={{ width: "100%", background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#ef4444", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>KNOWN COMPETITORS (helps generate more accurate data)</label>
              <textarea value={competitors} onChange={e => setCompetitors(e.target.value)} rows={2}
                placeholder="ADT, PASS Security, Burnes-Citadel, Gateway Alarm, Vivint, Barcom Security, ABF Security, Erker Security, St. Louis Alarm Co"
                style={{ width: "100%", background: "#060a12", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>YOUR CURRENT KNOWN RANKINGS (optional — helps personalize analysis)</label>
              <textarea value={currentRankings} onChange={e => setCurrentRankings(e.target.value)} rows={2}
                placeholder="e.g. Rank #3 for 'home security St. Louis', not ranking for 'commercial alarm systems', #1 for 'home security Wentzville'"
                style={{ width: "100%", background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
            </div>
          </div>
          <button onClick={runAnalysis} disabled={loading || !businessName.trim() || !location.trim()}
            style={{
              width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#c8a84b,#f59e0b)",
              color: loading ? "#475569" : "#1a1a1a", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit'"
            }}>
            {loading ? "🔍 Analyzing 200 Keywords Across All Verticals..." : "Generate Keyword Intelligence Report →"}
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 24, fontFamily: "monospace" }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Mapping the entire keyword landscape...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Analyzing 200 keywords · Identifying who is winning each one · Calculating traffic opportunity · Finding quick wins
            </p>
          </div>
        )}

        {result && (
          <div>
            {/* MARKET OVERVIEW */}
            <div style={{ background: "#0d1420", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#fbbf24", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 14 }}>📊 MARKET OVERVIEW</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                <StatBox label="Total Monthly Searches" value={formatNum(result.marketOverview?.totalMonthlySearchVolume)} color="#fbbf24" />
                <StatBox label="Keywords Analyzed" value={result.marketOverview?.totalKeywordsAnalyzed} color="#3b82f6" />
                <StatBox label="Market Leader" value={result.marketOverview?.marketLeader} color="#ef4444" />
                <StatBox label="Your Biggest Opportunity" value="See Below ↓" color="#22c55e" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 14, background: "rgba(239,68,68,0.06)", borderLeft: "2px solid #ef4444", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>WHY MARKET LEADER DOMINATES</div>
                  <p style={{ fontSize: 13, color: "#fca5a5", margin: 0, lineHeight: 1.6 }}>{result.marketOverview?.marketLeaderReason}</p>
                </div>
                <div style={{ padding: 14, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>BIGGEST OPPORTUNITY RIGHT NOW</div>
                  <p style={{ fontSize: 13, color: "#86efac", margin: 0, lineHeight: 1.6 }}>{result.marketOverview?.biggestOpportunity}</p>
                </div>
              </div>
              {result.marketOverview?.localMarketInsight && (
                <div style={{ marginTop: 10, padding: 14, background: "rgba(251,191,36,0.06)", borderLeft: "2px solid #fbbf24", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#fbbf24", fontFamily: "monospace", marginBottom: 4 }}>LOCAL MARKET INSIGHT</div>
                  <p style={{ fontSize: 13, color: "#fde68a", margin: 0, lineHeight: 1.6 }}>{result.marketOverview.localMarketInsight}</p>
                </div>
              )}
            </div>

            {/* TRAFFIC OPPORTUNITY BY PHASE */}
            {result.monthlyTrafficOpportunityByPhase && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                {Object.entries(result.monthlyTrafficOpportunityByPhase).map(([key, phase], i) => (
                  <div key={i} style={{
                    background: "#0d1420", border: `1px solid ${["#ef4444","#f97316","#f59e0b","#22c55e"][i]}25`,
                    borderTop: `3px solid ${["#ef4444","#f97316","#f59e0b","#22c55e"][i]}`,
                    borderRadius: 8, padding: 16
                  }}>
                    <div style={{ fontSize: 10, color: ["#ef4444","#f97316","#f59e0b","#22c55e"][i], fontFamily: "monospace", marginBottom: 8, letterSpacing: "0.08em" }}>{key.toUpperCase()}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", fontFamily: "monospace", marginBottom: 4 }}>{formatNum(phase.estimatedNewMonthlyVisitors)}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>new visitors/mo</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: ["#ef4444","#f97316","#f59e0b","#22c55e"][i], fontFamily: "monospace" }}>{formatNum(phase.estimatedNewLeads)}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>new leads/mo</div>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.4 }}>{phase.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "overview", label: "📊 Overview" },
                { id: "keywords", label: `🔑 Keywords by Vertical` },
                { id: "quickwins", label: `⚡ Quick Wins (${result.quickWinKeywords?.length || 0})` },
                { id: "untapped", label: `💎 Untapped (${result.untappedOpportunities?.length || 0})` },
                { id: "competitors", label: "⚔️ Competitor Map" },
                { id: "intent", label: "🎯 By Intent" },
                { id: "clusters", label: "📍 Local Clusters" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: activeTab === tab.id ? "#1e293b" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "#334155" : "#1e293b"}`,
                  borderRadius: 6, padding: "7px 14px",
                  color: activeTab === tab.id ? "#f1f5f9" : "#64748b",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "monospace"
                }}>{tab.label}</button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                {result.verticals?.map((v, i) => {
                  const vc2 = vertColors[v.verticalColor] || "#64748b";
                  return (
                    <div key={i} style={{ background: "#0d1420", border: `1px solid ${vc2}25`, borderLeft: `4px solid ${vc2}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ minWidth: 180 }}>
                          <div style={{ fontSize: 10, color: vc2, fontFamily: "monospace", marginBottom: 4 }}>{v.verticalName?.toUpperCase()}</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>{formatNum(v.totalMonthlySearches)}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>monthly searches</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{v.keywordsInVertical} keywords tracked</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                            <div style={{ padding: "6px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 4 }}>
                              <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace" }}>CURRENT LEADER: </span>
                              <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600 }}>{v.marketLeaderInVertical}</span>
                            </div>
                            <div style={{ padding: "6px 12px", background: "rgba(34,197,94,0.08)", borderRadius: 4 }}>
                              <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>YOUR POSITION: </span>
                              <span style={{ fontSize: 12, color: "#86efac", fontWeight: 600 }}>{v.yourCurrentPosition}</span>
                            </div>
                          </div>
                          <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${v.opportunityScore}%`, background: `linear-gradient(90deg,${vc2}80,${vc2})`, borderRadius: 4 }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>Opportunity Score</span>
                            <span style={{ fontSize: 11, color: vc2, fontFamily: "monospace", fontWeight: 700 }}>{v.opportunityScore}/100</span>
                          </div>
                        </div>
                        <button onClick={() => { setActiveTab("keywords"); setActiveVertical(i); }} style={{
                          background: `${vc2}15`, border: `1px solid ${vc2}40`, color: vc2,
                          padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                          fontFamily: "monospace", whiteSpace: "nowrap"
                        }}>View Keywords →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* KEYWORDS BY VERTICAL */}
            {activeTab === "keywords" && (
              <div>
                {/* Vertical Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {result.verticals?.map((v, i) => {
                    const vc2 = vertColors[v.verticalColor] || "#64748b";
                    return (
                      <button key={i} onClick={() => setActiveVertical(i)} style={{
                        background: activeVertical === i ? `${vc2}15` : "transparent",
                        border: `1px solid ${activeVertical === i ? vc2 : "#1e293b"}`,
                        color: activeVertical === i ? vc2 : "#64748b",
                        padding: "7px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
                      }}>{v.verticalName} ({v.keywordsInVertical})</button>
                    );
                  })}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>DIFFICULTY:</span>
                  {["ALL", "EASY", "MEDIUM", "HARD", "VERY_HARD"].map(d => (
                    <button key={d} onClick={() => setFilterDiff(d)} style={{
                      background: filterDiff === d ? `${diffColor[d] || "#334155"}20` : "transparent",
                      border: `1px solid ${filterDiff === d ? diffColor[d] || "#334155" : "#1e293b"}`,
                      color: filterDiff === d ? diffColor[d] || "#94a3b8" : "#64748b",
                      padding: "4px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontFamily: "monospace"
                    }}>{d}</button>
                  ))}
                  <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginLeft: 8 }}>SORT:</span>
                  {[["priority","Priority"],["volume","Volume"],["rank","Your Rank"]].map(([val, label]) => (
                    <button key={val} onClick={() => setSortBy(val)} style={{
                      background: sortBy === val ? "rgba(251,191,36,0.1)" : "transparent",
                      border: `1px solid ${sortBy === val ? "rgba(251,191,36,0.4)" : "#1e293b"}`,
                      color: sortBy === val ? "#fbbf24" : "#64748b",
                      padding: "4px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontFamily: "monospace"
                    }}>{label}</button>
                  ))}
                </div>

                {currentVertical && (
                  <div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                      <div style={{ padding: "8px 14px", background: `${vc}10`, border: `1px solid ${vc}25`, borderRadius: 6 }}>
                        <span style={{ fontSize: 10, color: vc, fontFamily: "monospace" }}>TOTAL SEARCHES: </span>
                        <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 700, fontFamily: "monospace" }}>{formatNum(currentVertical.totalMonthlySearches)}/mo</span>
                      </div>
                      <div style={{ padding: "8px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6 }}>
                        <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace" }}>LEADER: </span>
                        <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 700 }}>{currentVertical.marketLeaderInVertical}</span>
                      </div>
                      <div style={{ padding: "8px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6 }}>
                        <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>SHOWING: </span>
                        <span style={{ fontSize: 13, color: "#86efac", fontWeight: 700 }}>{getFilteredKeywords().length} keywords</span>
                      </div>
                    </div>
                    {getFilteredKeywords().map((kw, i) => <KeywordRow key={i} kw={kw} index={i} />)}
                  </div>
                )}
              </div>
            )}

            {/* QUICK WINS */}
            {activeTab === "quickwins" && (
              <div>
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#86efac", margin: 0, lineHeight: 1.6 }}>
                    <strong>Quick Win Definition:</strong> Keywords where the current #1 ranking has weak signals — thin content, no schema, low reviews, or a generic page — that can be displaced with focused effort in 4-8 weeks. These are your highest-leverage immediate actions.
                  </p>
                </div>
                {result.quickWinKeywords?.map((qw, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.25)", borderLeft: "4px solid #22c55e", borderRadius: 8, padding: 18, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#22c55e", fontFamily: "monospace", flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{qw.keyword}</div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#fbbf24", fontFamily: "monospace" }}>{formatNum(qw.monthlySearches)} searches/mo</span>
                          <span style={{ fontSize: 12, color: "#ef4444" }}>Current #1: {qw.currentLeader}</span>
                          <span style={{ fontSize: 12, color: "#14b8a6", fontFamily: "monospace" }}>⏱ {qw.estimatedTimeToRank1}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div style={{ padding: 10, background: "rgba(245,158,11,0.06)", borderRadius: 4 }}>
                            <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 4 }}>WHY IT'S A QUICK WIN</div>
                            <p style={{ fontSize: 12, color: "#fde68a", margin: 0, lineHeight: 1.5 }}>{qw.whyQuickWin}</p>
                          </div>
                          <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderRadius: 4 }}>
                            <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>EXACT ACTION</div>
                            <p style={{ fontSize: 12, color: "#86efac", margin: 0, lineHeight: 1.5 }}>{qw.exactAction}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* UNTAPPED */}
            {activeTab === "untapped" && (
              <div>
                <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#d8b4fe", margin: 0, lineHeight: 1.6 }}>
                    <strong>Untapped Opportunities:</strong> Keywords that exist in your market but no competitor is targeting effectively. These represent pure blue ocean — you can rank #1 with relatively little competition by being the first to build quality content around them.
                  </p>
                </div>
                {result.untappedOpportunities?.map((opp, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid rgba(168,85,247,0.25)", borderLeft: "4px solid #a855f7", borderRadius: 8, padding: 18, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#a855f7", fontFamily: "monospace", flexShrink: 0 }}>💎</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{opp.keyword}</div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#fbbf24", fontFamily: "monospace" }}>{formatNum(opp.monthlySearches)} searches/mo</span>
                          <span style={{ fontSize: 12, color: "#22c55e", fontFamily: "monospace" }}>Traffic if captured: {formatNum(opp.estimatedTrafficIfCaptured)}/mo</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div style={{ padding: 10, background: "rgba(168,85,247,0.06)", borderRadius: 4 }}>
                            <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "monospace", marginBottom: 4 }}>WHY IT'S UNTAPPED</div>
                            <p style={{ fontSize: 12, color: "#d8b4fe", margin: 0, lineHeight: 1.5 }}>{opp.whyUntapped || opp["why Untapped"]}</p>
                          </div>
                          <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderRadius: 4 }}>
                            <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>HOW TO CAPTURE</div>
                            <p style={{ fontSize: 12, color: "#86efac", margin: 0, lineHeight: 1.5 }}>{opp.howToCapture}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COMPETITOR MAP */}
            {activeTab === "competitors" && (
              <div>
                {result.competitorDominanceMap?.map((comp, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 20, marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{comp.competitor}</div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace" }}>{comp.keywordsOwned} keywords</span>
                          <span style={{ fontSize: 12, color: "#fbbf24", fontFamily: "monospace" }}>{formatNum(comp.estimatedMonthlyTraffic)} visits/mo</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <div style={{ padding: 12, background: "rgba(239,68,68,0.06)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 8 }}>WHERE THEY DOMINATE</div>
                        {comp.strengthAreas?.map((s, j) => (
                          <div key={j} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                            <span style={{ color: "#ef4444", flexShrink: 0 }}>→</span>
                            <span style={{ fontSize: 12, color: "#fca5a5" }}>{s}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: 12, background: "rgba(34,197,94,0.06)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>THEIR WEAKNESSES</div>
                        {comp.weaknesses?.map((w, j) => (
                          <div key={j} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                            <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                            <span style={{ fontSize: 12, color: "#86efac" }}>{w}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: 12, background: "rgba(99,102,241,0.06)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 6 }}>HOW TO DISPLACE THEM</div>
                        <p style={{ fontSize: 12, color: "#c7d2fe", margin: 0, lineHeight: 1.6 }}>{comp.howToDisplace}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BY INTENT */}
            {activeTab === "intent" && result.keywordsByIntent && (
              <div>
                {[
                  { key: "readyToBuy", label: "🟢 READY TO BUY NOW", color: "#22c55e", data: result.keywordsByIntent.readyToBuy },
                  { key: "comparing", label: "🟡 COMPARING OPTIONS", color: "#f59e0b", data: result.keywordsByIntent.comparing },
                  { key: "researching", label: "🔵 RESEARCHING", color: "#3b82f6", data: result.keywordsByIntent.researching },
                ].map((intent, i) => (
                  <div key={i} style={{ background: "#0d1420", border: `1px solid ${intent.color}20`, borderLeft: `4px solid ${intent.color}`, borderRadius: 8, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: intent.color, marginBottom: 4 }}>{intent.label}</div>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 6px" }}>{intent.data?.description}</p>
                        <div style={{ fontSize: 13, fontWeight: 600, color: intent.color }}>Conversion Rate: {intent.data?.estimatedConversionRate}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {intent.data?.topKeywords?.map((kw, j) => (
                        <span key={j} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 4, background: `${intent.color}10`, border: `1px solid ${intent.color}25`, color: intent.color, fontFamily: "monospace" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LOCAL CLUSTERS */}
            {activeTab === "clusters" && (
              <div>
                <div style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.25)", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#5eead4", margin: 0 }}>Local keyword clusters group related searches by geography. Each cluster represents a city page opportunity — one well-built page can capture the entire cluster.</p>
                </div>
                {result.localKeywordClusters?.map((cluster, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid rgba(20,184,166,0.2)", borderLeft: "3px solid #14b8a6", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#5eead4", marginBottom: 4 }}>{cluster.cluster}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#fbbf24", fontFamily: "monospace" }}>{formatNum(cluster.totalSearchVolume)} searches/mo</span>
                          <span style={{ fontSize: 12, color: "#ef4444" }}>Leader: {cluster.currentDominator}</span>
                        </div>
                      </div>
                      <div style={{ padding: "6px 12px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 4, fontFamily: "monospace", fontSize: 11, color: "#a855f7" }}>
                        Build: {cluster.cityPageNeeded}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {cluster.keywords?.map((kw, j) => (
                        <span key={j} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)", color: "#14b8a6", fontFamily: "monospace" }}>{kw}</span>
                      ))}
                    </div>
                    <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>YOUR OPPORTUNITY → </span>
                      <span style={{ fontSize: 12, color: "#86efac" }}>{cluster.yourOpportunity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
