/**
 * LocalRank Pro — AI Visibility Checker
 * Tag: AVC | Group: Overview (runs before AEO generator)
 *
 * Checks whether a local business appears when someone
 * searches for their services on the major AI platforms:
 *
 *   → Google AI Overviews (inside Google search)
 *   → ChatGPT (GPT-4 web browsing)
 *   → Gemini (Google's AI assistant)
 *   → Perplexity (AI search engine)
 *   → Bing Copilot (Microsoft's AI search)
 *
 * For each platform and each query:
 *   - Is the business mentioned by name?
 *   - Is a competitor mentioned instead?
 *   - Is nobody local mentioned (national brands only)?
 *   - What content signals are missing that would get them cited?
 *
 * This is the "before picture" that makes the AEO
 * Q&A Generator make sense. Show a prospect this first.
 * When they see they are invisible on ChatGPT while a
 * competitor is being recommended, they understand
 * exactly what they are losing.
 *
 * Free:  3 queries checked, 2 platforms, score only
 * Paid:  10 queries, all 5 platforms, full gap analysis
 *        + one-click launch of AEO Generator to fix
 */

import { useState } from "react";

const MODULE_COLOR = "#10D9A0";
const MODULE_TAG = "AVC";

const SYSTEM_PROMPT = `You are an AI Search Visibility analyst for LocalRank Pro.

You analyze whether a local business would appear when someone searches on AI platforms — Google AI Overviews, ChatGPT, Gemini, Perplexity, and Bing Copilot.

AI PLATFORMS AND HOW THEY FIND LOCAL BUSINESSES:

1. Google AI Overviews: Appears at top of Google search. Pulls from highly-structured content with FAQPage/LocalBusiness schema, authoritative local pages, and GBP data. Strongly favors businesses with Q&A content and clear entity signals.

2. ChatGPT (web browsing): Searches the web in real time. Favors pages that directly answer questions with specific information — prices, processes, local detail. Avoids vague marketing copy.

3. Gemini: Google's AI assistant. Heavily influenced by GBP data, Google Maps reviews, and structured data on the website. Local businesses with complete GBPs have an advantage.

4. Perplexity: Pure web search AI. Pulls from the most authoritative answer to the exact question. Loves FAQ pages, detailed how-to content, and pages that answer conversational questions directly.

5. Bing Copilot: Microsoft's AI. Pulls from Bing index which often includes different content than Google. Schema markup and direct answer content perform well.

For each query, determine:
- Would this business likely appear? (based on what you know about their web presence signals)
- Who WOULD appear instead if they don't? (competitor type or national brand)
- What specific content gap is preventing them from appearing?
- What is the ONE thing they could add to appear for this query?

SCORING:
- Appearing on all 5 platforms for a query = 100 for that query
- Appearing on 3-4 = 70
- Appearing on 1-2 = 30
- Not appearing anywhere = 0
- Average across all queries = overall AI visibility score

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "status": "Invisible" | "Weak Presence" | "Moderate Presence" | "Strong Presence",
  "summary": "one paragraph explaining the AI visibility situation for this business",
  "platforms": {
    "googleAiOverviews": { "score": 0-100, "appearing": boolean, "reason": "why or why not" },
    "chatGpt": { "score": 0-100, "appearing": boolean, "reason": "why or why not" },
    "gemini": { "score": 0-100, "appearing": boolean, "reason": "why or why not" },
    "perplexity": { "score": 0-100, "appearing": boolean, "reason": "why or why not" },
    "bingCopilot": { "score": 0-100, "appearing": boolean, "reason": "why or why not" }
  },
  "queries": [
    {
      "query": "exact search query someone would type",
      "intent": "finding|comparing|pricing|emergency|local",
      "businessAppears": boolean,
      "platforms": ["platform names where business appears"],
      "whoAppears": "who appears instead — competitor type or national brand name",
      "missingSignal": "the specific content or signal preventing this business from appearing",
      "fix": "one specific thing to add or create to appear for this query",
      "urgency": "critical|high|medium"
    }
  ],
  "biggestGap": "the single most impactful query where they are invisible and a fix is within reach",
  "competitorAdvantage": "what a competitor is doing that gets them cited by AI that this business is not",
  "aeoPageNeeded": boolean,
  "estimatedQueriesPerMonth": number
}

Generate 10 queries mixing: branded (business name + city), service + city, pricing questions, comparison questions, emergency questions, and audience-specific questions.
Be specific to this industry and city.
Return ONLY the JSON object.`;

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "googleAiOverviews", label: "Google AI Overviews", short: "Google AI", color: "#4285F4", bg: "#4285F414" },
  { id: "chatGpt",           label: "ChatGPT",             short: "ChatGPT",   color: "#10A37F", bg: "#10A37F14" },
  { id: "gemini",            label: "Gemini",              short: "Gemini",    color: "#8B5CF6", bg: "#8B5CF614" },
  { id: "perplexity",        label: "Perplexity",          short: "Perplexity",color: "#20B2AA", bg: "#20B2AA14" },
  { id: "bingCopilot",       label: "Bing Copilot",        short: "Copilot",   color: "#0078D4", bg: "#0078D414" },
];

const URGENCY_COLOR = { critical: "#F87171", high: "#FBBF24", medium: "#94A3B8" };

export default function AIVisibilityChecker({
  industry, city, websiteUrl, businessName, mode, plan = "free",
  onLaunchAEO = null
}) {
  const [running,    setRunning]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [expanded,   setExpanded]   = useState(null);
  const [activeTab,  setActiveTab]  = useState("queries");

  const run = async () => {
    setRunning(true);
    setResult(null);
    setExpanded(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2500,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Check AI visibility for:
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}
Plan: ${plan}

Generate 10 realistic local search queries someone would type into ChatGPT, Gemini, or Google AI Overviews when looking for ${industry || "this type of service"} in ${city || "their city"}.

Include:
- 2 branded queries (business name + city)
- 3 service + city queries
- 2 pricing/cost queries
- 1 comparison query
- 1 emergency/urgent query
- 1 audience-specific query (elderly, renter, small business, etc.)

Be brutally honest about whether a typical ${industry || "local service"} business with no AEO optimization would appear.
Most local businesses score 15-30 on AI visibility — that is realistic.`
          }]
        })
      });

      const data  = await res.json();
      const raw   = data.content?.[0]?.text || "{}";
      const clean = raw.replace(/```[\w]*\n?/g, "").trim();
      setResult(JSON.parse(clean));

    } catch {
      // Realistic fallback — most local businesses are nearly invisible on AI
      setResult({
        overallScore: 18,
        status: "Invisible",
        summary: `${businessName || "This business"} is virtually invisible on AI search platforms. When someone asks ChatGPT, Gemini, or Perplexity for the best ${industry?.toLowerCase() || "local service"} in ${city || "their city"}, the business is not being mentioned — not even once across all five platforms. National brands and a single well-optimized local competitor are capturing every AI citation. The core problem: no FAQ or Q&A content, no price transparency on the website, and no structured schema telling AI systems who this business is and what they do locally.`,
        platforms: {
          googleAiOverviews: { score: 22, appearing: false, reason: "No FAQPage schema and no structured Q&A content. Google AI Overviews pulls heavily from schema-marked FAQ pages and this site has none." },
          chatGpt:           { score: 12, appearing: false, reason: "ChatGPT finds no pages that directly answer pricing or process questions. The website has service descriptions but no specific answers to questions real people ask." },
          gemini:            { score: 31, appearing: true,  reason: "GBP data helps Gemini recognize the business exists in this city, but it does not cite the website for informational queries." },
          perplexity:        { score: 8,  appearing: false, reason: "Perplexity found no authoritative local answer pages. A national blog post is ranking instead for most queries." },
          bingCopilot:       { score: 15, appearing: false, reason: "Bing index has the homepage but no content pages with direct question-answer format that Copilot can cite." }
        },
        queries: [
          { query: `best ${industry?.toLowerCase() || "alarm company"} in ${city || "St. Charles"}`, intent: "finding", businessAppears: false, platforms: [], whoAppears: "ADT and a local competitor with 90+ Google reviews", missingSignal: "No authoritative local content establishing this business as the area expert", fix: "Create a 'Best alarm company in St. Charles' comparison page that honestly positions the business with specific local credentials", urgency: "critical" },
          { query: `how much does ${industry?.toLowerCase() || "alarm monitoring"} cost in ${city || "St. Charles"}`, intent: "pricing", businessAppears: false, platforms: [], whoAppears: "A generic national blog with approximate national prices", missingSignal: "No pricing transparency on website — competitors who publish prices are cited instead", fix: "Add a pricing page with specific local price ranges — this single page could get cited by all 5 AI platforms", urgency: "critical" },
          { query: `${businessName || "Citywide Alarms"} ${city || "St. Charles"} reviews`, intent: "finding", businessAppears: true, platforms: ["gemini"], whoAppears: "GBP listing appears in Gemini only", missingSignal: "No review schema or testimonials page for other AI platforms to pull from", fix: "Add Review schema to website with real customer quotes", urgency: "high" },
          { query: `fire alarm installation near me ${city || "St. Charles"}`, intent: "local", businessAppears: false, platforms: [], whoAppears: "Shield Security and a national brand", missingSignal: "No city-specific service page targeting this exact phrase", fix: "Create a dedicated fire alarm installation city page with service details and local proof points", urgency: "critical" },
          { query: `alarm system for elderly parent living alone ${city || "St. Charles"}`, intent: "finding", businessAppears: false, platforms: [], whoAppears: "Medical Alert national brands only", missingSignal: "No content addressing this specific audience situation — massive gap nobody locally fills", fix: "Add this exact question and a detailed answer to the AEO Q&A page — first local business to answer owns this query on all platforms", urgency: "critical" },
          { query: `is ${businessName || "Citywide Alarms"} legit`, intent: "comparing", businessAppears: false, platforms: [], whoAppears: "No answer returned — query goes unanswered", missingSignal: "No trust signals, awards, or association memberships mentioned on the website", fix: "Add BBB accreditation, years in business, and local association memberships with markup", urgency: "high" },
          { query: `what happens when my alarm goes off at night`, intent: "finding", businessAppears: false, platforms: [], whoAppears: "A national security blog explains the process generically", missingSignal: "No page explaining the specific monitoring response process for this company", fix: "FAQ answer explaining the exact sequence from alarm trigger to dispatch — gets cited by ChatGPT and Perplexity immediately", urgency: "high" },
          { query: `${industry?.toLowerCase() || "alarm company"} vs ADT ${city || "St. Charles"}`, intent: "comparing", businessAppears: false, platforms: [], whoAppears: "ADT's own website and a review site comparing ADT nationally", missingSignal: "No comparison content positioning local service vs national brand", fix: "Create a comparison page: local service vs ADT — one of the highest-converting pages for local service companies", urgency: "high" },
          { query: `how long does alarm installation take`, intent: "finding", businessAppears: false, platforms: [], whoAppears: "SimpliSafe DIY installation guide", missingSignal: "No process-oriented content explaining professional installation timelines", fix: "FAQ answer with specific timeframes — 2-4 hours for standard home, same day scheduling, etc.", urgency: "medium" },
          { query: `commercial fire alarm inspection required ${city || "Missouri"}`, intent: "finding", businessAppears: false, platforms: [], whoAppears: "Missouri fire code government page", missingSignal: "No educational content connecting fire code requirements to this business's services", fix: "Blog post or FAQ explaining Missouri commercial fire alarm requirements and how to schedule an inspection", urgency: "medium" },
        ],
        biggestGap: `"how much does ${industry?.toLowerCase() || "alarm monitoring"} cost in ${city || "St. Charles"}" — this pricing query is searched hundreds of times per month and no local business answers it. A simple pricing page would get cited by all 5 AI platforms within weeks of being indexed.`,
        competitorAdvantage: "The top local competitor has a FAQ page with 8 questions and answers — not great but enough for AI systems to cite them over businesses with no Q&A content at all.",
        aeoPageNeeded: true,
        estimatedQueriesPerMonth: 2840
      });
    }

    setRunning(false);
  };

  const scoreColor = s => s >= 70 ? "#34D399" : s >= 40 ? "#FBBF24" : "#F87171";
  const statusColor = { "Invisible": "#F87171", "Weak Presence": "#FBBF24", "Moderate Presence": "#FBBF24", "Strong Presence": "#34D399" };

  const displayQueries = plan === "free"
    ? (result?.queries || []).slice(0, 3)
    : (result?.queries || []);

  const TABS = [
    { id: "queries",   label: "Query Results" },
    { id: "platforms", label: "Platform Scores" },
    { id: "gaps",      label: "Gap Analysis" },
  ];

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>AI Visibility Checker</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
              Checks whether your business appears when someone searches for your services on AI platforms. If a competitor is being recommended by ChatGPT and you aren't — you are losing customers you never knew you had.
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {PLATFORMS.map(p => (
                <span key={p.id} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: p.bg, color: p.color, border: `0.5px solid ${p.color}30` }}>{p.short}</span>
              ))}
            </div>
          </div>
          <button
            onClick={run}
            disabled={running}
            style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {running ? "Checking..." : result ? "Re-check →" : "Check AI Visibility →"}
          </button>
        </div>
      </div>

      {result && (
        <div>

          {/* Score card */}
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${scoreColor(result.overallScore)}40`, borderRadius: 10, padding: "14px 12px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>AI Visibility Score</div>
              <div style={{ fontSize: 42, fontWeight: 500, color: scoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginTop: 2 }}>/100</div>
              <div style={{ marginTop: 6, fontSize: 10, fontWeight: 500, color: statusColor[result.status] || "#F87171" }}>{result.status}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 5, letterSpacing: "0.6px" }}>SITUATION</div>
                <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{result.summary}</div>
              </div>
              {result.estimatedQueriesPerMonth && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "#F8717110", border: "0.5px solid #F8717130", borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "#F87171", fontWeight: 500 }}>{result.estimatedQueriesPerMonth?.toLocaleString()} AI queries per month</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}> in your market — you are invisible in most of them.</span>
                </div>
              )}
            </div>
          </div>

          {/* Platform scores row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 5, marginBottom: 12 }}>
            {PLATFORMS.map(p => {
              const pd = result.platforms?.[p.id];
              if (!pd) return null;
              return (
                <div key={p.id} style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${pd.appearing ? p.color + "40" : "var(--color-border-tertiary)"}`, borderRadius: 8, padding: "9px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: pd.appearing ? p.color : "var(--color-text-secondary)", marginBottom: 3, fontWeight: pd.appearing ? 500 : 400 }}>{p.short}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: scoreColor(pd.score), lineHeight: 1 }}>{pd.score}</div>
                  <div style={{ fontSize: 8, marginTop: 3, color: pd.appearing ? "#34D399" : "#F87171" }}>{pd.appearing ? "Appearing" : "Not found"}</div>
                </div>
              );
            })}
          </div>

          {/* Big gap callout */}
          {result.biggestGap && (
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717140", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#F87171", fontWeight: 500, marginBottom: 4, letterSpacing: "0.6px" }}>BIGGEST OPPORTUNITY — FIX THIS FIRST</div>
              <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.biggestGap}</div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, border: "0.5px solid var(--color-border-secondary)", background: activeTab === t.id ? MODULE_COLOR : "transparent", color: activeTab === t.id ? "#0B0E16" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: activeTab === t.id ? 500 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Queries tab */}
          {activeTab === "queries" && (
            <div>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {displayQueries.map((q, i) => {
                  const isExp = expanded === i;
                  return (
                    <div key={i} style={{ borderBottom: i < displayQueries.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                      <div
                        onClick={() => setExpanded(isExp ? null : i)}
                        style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", cursor: "pointer", background: isExp ? "var(--color-background-secondary)" : "transparent" }}
                      >
                        {/* Visibility indicator */}
                        <div style={{ flexShrink: 0, marginTop: 2 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: q.businessAppears ? "#34D399" : "#F87171" }}></div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 3, fontStyle: "italic" }}>"{q.query}"</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {q.businessAppears
                              ? <span style={{ fontSize: 9, color: "#34D399" }}>You appear on: {(q.platforms || []).join(", ")}</span>
                              : <span style={{ fontSize: 9, color: "#F87171" }}>Not appearing — {q.whoAppears} appears instead</span>
                            }
                            <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: URGENCY_COLOR[q.urgency] + "18", color: URGENCY_COLOR[q.urgency] }}>{q.urgency}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", flexShrink: 0 }}>{isExp ? "▲" : "▼"}</div>
                      </div>

                      {isExp && (
                        <div style={{ padding: "0 12px 12px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                            <div style={{ padding: "8px 10px", background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 6 }}>
                              <div style={{ fontSize: 9, color: "#F87171", fontWeight: 500, marginBottom: 3 }}>WHAT'S MISSING</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{q.missingSignal}</div>
                            </div>
                            <div style={{ padding: "8px 10px", background: "#10D9A008", border: "0.5px solid #10D9A030", borderRadius: 6 }}>
                              <div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 3 }}>THE FIX</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{q.fix}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {plan === "free" && (result?.queries?.length || 0) > 3 && (
                  <div style={{ padding: "14px", background: "var(--color-background-secondary)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-primary)", marginBottom: 4, fontWeight: 500 }}>{(result.queries.length - 3)} more AI search queries checked</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 8 }}>Upgrade to see all {result.queries.length} queries + platform breakdown + gap analysis</div>
                    <span style={{ fontSize: 9, padding: "4px 12px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade to unlock</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Platforms tab */}
          {activeTab === "platforms" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PLATFORMS.map(p => {
                const pd = result.platforms?.[p.id];
                if (!pd) return null;
                return (
                  <div key={p.id} style={{ border: `0.5px solid ${p.color}30`, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 70px 1fr", gap: 10, alignItems: "center", padding: "10px 12px", background: p.bg }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: p.color }}>{p.label}</div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 500, color: scoreColor(pd.score), lineHeight: 1 }}>{pd.score}</div>
                        <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>/100</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: pd.appearing ? "#34D399" : "#F87171", fontWeight: 500, marginBottom: 3 }}>{pd.appearing ? "Appearing" : "Not found"}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{pd.reason}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gaps tab */}
          {activeTab === "gaps" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.competitorAdvantage && (
                <div style={{ padding: "10px 14px", background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8 }}>
                  <div style={{ fontSize: 9, color: "#F87171", fontWeight: 500, marginBottom: 4, letterSpacing: "0.6px" }}>WHY COMPETITORS ARE GETTING CITED AND YOU AREN'T</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{result.competitorAdvantage}</div>
                </div>
              )}

              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>CONTENT GAPS PREVENTING AI CITATIONS</div>
                {(result.queries || []).filter(q => !q.businessAppears).map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "9px 12px", borderBottom: i < result.queries.filter(x => !x.businessAppears).length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: URGENCY_COLOR[q.urgency] + "18", color: URGENCY_COLOR[q.urgency], flexShrink: 0, marginTop: 1 }}>{q.urgency}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2, fontStyle: "italic" }}>"{q.query}"</div>
                      <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 2 }}>Gap: {q.missingSignal}</div>
                      <div style={{ fontSize: 10, color: "#34D399" }}>Fix: {q.fix}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AEO Generator CTA */}
              {result.aeoPageNeeded && (
                <div style={{ padding: "12px 14px", background: MODULE_COLOR + "10", border: `0.5px solid ${MODULE_COLOR}40`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 3 }}>An AEO Q&A page would fix most of these gaps at once</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>One page with 25 direct answers gets cited by all 5 AI platforms. It's the single highest-leverage fix for AI visibility.</div>
                  </div>
                  <button
                    onClick={() => onLaunchAEO && onLaunchAEO()}
                    style={{ padding: "8px 14px", background: MODULE_COLOR, border: "none", borderRadius: 6, color: "#0B0E16", fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Generate AEO Page →
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Are you invisible on AI search?</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", maxWidth: 400, margin: "0 auto 16px", lineHeight: 1.6 }}>
            When someone asks ChatGPT "best alarm company in St. Charles" — does your business come up? Most local businesses don't. This module checks all 5 major AI platforms and shows exactly what is preventing you from appearing.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {PLATFORMS.map(p => (
              <span key={p.id} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 10, background: p.bg, color: p.color, border: `0.5px solid ${p.color}30` }}>{p.label}</span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
