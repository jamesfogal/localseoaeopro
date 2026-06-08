/**
 * LocalSEOAEOPro — Reddit Visibility Scanner
 * Finds subreddits, competitor mentions, opportunities, and AI citation potential
 */
import { useState } from "react";

const MODULE_COLOR = "#FF4500";
const MODULE_TAG = "RVS";

const SYSTEM_PROMPT = `You are a Reddit SEO specialist for local businesses.

Reddit is now one of the most powerful SEO and AI citation sources available:
- Google actively surfaces Reddit threads in top search results
- ChatGPT, Perplexity, and Gemini all pull from Reddit as a trusted source
- A single well-placed Reddit comment recommending a local business can generate leads for years
- Reddit ranks #1-3 on Google for thousands of "best [service] in [city]" searches

You will receive: business name, industry, city, website URL.

YOUR JOB: Analyze Reddit visibility for this local business and identify every opportunity.

ANALYZE THESE AREAS:

1. RELEVANT SUBREDDITS
Which subreddits do this business's potential customers use?
- City/regional subreddits (r/StLouis, r/stcharlesmo, etc.)
- Industry subreddits (r/homesecurity, r/DIYsecurity, etc.)
- Homeowner subreddits (r/homeowners, r/FirstTimeHomeBuyer, etc.)
- Problem-specific subreddits (r/homeimprovement, r/insurance, etc.)

2. HIGH-VALUE THREAD TYPES
What questions do people ask on Reddit that this business could answer?
- "Best [service] in [city]?" threads
- "Anyone have experience with [competitor]?" threads
- "Is [service] worth it?" threads
- "How much does [service] cost?" threads
- "[Problem they solve] happened to me" threads

3. COMPETITOR REDDIT PRESENCE
Are competitors being recommended on Reddit?
Which competitors likely have Reddit mentions?
What are they saying that wins recommendations?

4. AI CITATION OPPORTUNITY
Which Reddit threads, if this business were mentioned in them, would get cited by ChatGPT/Perplexity/Gemini?
Reddit threads that rank on Google = threads that feed AI answers.

5. REDDIT STRATEGY
What should this business do on Reddit?
- Which subreddits to join
- What to post (not spam — genuine value)
- How to get mentioned without being banned
- What a helpful comment looks like vs a spam comment

6. SEARCH URLS
Generate exact Reddit search URLs to find real threads.
Format: https://www.reddit.com/search/?q=[encoded query]&sort=top

SCORING:
- Business mentioned positively on Reddit = +20 per mention
- Competitor mentioned instead = -10 per mention
- Active in relevant subreddits = +15
- No Reddit presence at all = starts at 10

Return ONLY valid JSON:
{
  "visibilityScore": 0-100,
  "status": "Strong Presence" | "Weak Presence" | "Not Found" | "Competitor Dominates",
  "summary": "2-3 sentence honest assessment of Reddit visibility for this business",
  "subreddits": [
    {
      "name": "r/StLouis",
      "url": "https://reddit.com/r/StLouis",
      "members": "estimated members",
      "relevance": "critical" | "high" | "medium" | "low",
      "why": "why this subreddit matters for this business",
      "opportunity": "specific opportunity in this subreddit"
    }
  ],
  "threadOpportunities": [
    {
      "type": "recommendation" | "complaint" | "question" | "comparison",
      "exampleTitle": "exact example of a thread title someone would post",
      "searchUrl": "https://www.reddit.com/search/?q=alarm+company+st+louis&sort=top",
      "competitorMentioned": "which competitor likely appears in this thread",
      "howToWin": "exactly what to post to get cited instead of the competitor"
    }
  ],
  "aiCitationOpportunities": [
    {
      "query": "what someone asks ChatGPT or Perplexity",
      "redditConnection": "which subreddit or thread type feeds this AI answer",
      "action": "exactly what Reddit content to create to get cited for this query"
    }
  ],
  "redditStrategy": {
    "doThis": ["specific actions to take on Reddit"],
    "neverDoThis": ["things that will get the account banned or flagged as spam"],
    "firstPost": "exact first post to make — topic, subreddit, and approach",
    "timeToResults": "realistic estimate of when Reddit mentions start affecting AI citations"
  },
  "competitorAnalysis": {
    "dominantCompetitor": "which competitor likely owns Reddit for this market",
    "theirAdvantage": "what they are doing that gets them Reddit mentions",
    "howToOvertake": "specific strategy to get more Reddit mentions than them"
  },
  "quickWins": ["3-5 things to do this week that will show results fastest"]
}

Be specific to this business name, industry, and city. Local businesses have very specific Reddit opportunities.
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

export default function RedditVisibilityScanner({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("subreddits");

  const runScan = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Scan Reddit visibility.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "St. Louis"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        visibilityScore: 12,
        status: "Not Found",
        summary: `${businessName || "This business"} has virtually no Reddit presence. When potential customers in ${city || "St. Louis"} ask Reddit for security company recommendations, competitors are being named — not CityWide. This is a wide open opportunity because most local alarm companies ignore Reddit entirely, yet Reddit threads rank #1-3 on Google for exactly the searches that generate leads.`,
        subreddits: [
          { name: "r/StLouis", url: "https://reddit.com/r/StLouis", members: "~180,000", relevance: "critical", why: "Largest St. Louis community. 'Best alarm company in St. Louis' threads appear here regularly and rank on Google page 1.", opportunity: "Threads asking for security company recommendations get 20-50 responses. Being the first helpful answer with local credentials wins the thread." },
          { name: "r/HomeImprovement", url: "https://reddit.com/r/HomeImprovement", members: "~4.2M", relevance: "high", why: "Homeowners asking about security systems, alarm monitoring costs, and whether professional monitoring is worth it.", opportunity: "Answer pricing and takeover questions here. These threads get cited by ChatGPT for exactly those questions." },
          { name: "r/homeowners", url: "https://reddit.com/r/homeowners", members: "~800K", relevance: "high", why: "First-time homeowners asking about security systems constantly. High purchase intent.", opportunity: "'Just bought a house, do I need an alarm system?' threads — answer with local St. Louis context." },
          { name: "r/homesecurity", url: "https://reddit.com/r/homesecurity", members: "~220K", relevance: "high", why: "Pure security discussion. ADT vs local, monitoring costs, equipment questions.", opportunity: "Answer ADT takeover questions with specific panel knowledge. Position CityWide as the local expert." },
          { name: "r/StCharles", url: "https://reddit.com/r/StCharles", members: "~12,000", relevance: "high", why: "CityWide's strongest market. Local recommendations carry enormous weight in smaller city subreddits.", opportunity: "Smaller community = easier to be the known local expert. One helpful post gets remembered." },
          { name: "r/Insurance", url: "https://reddit.com/r/Insurance", members: "~350K", relevance: "medium", why: "People asking which alarm system gives the best insurance discount.", opportunity: "Answer with specific insurance company names and discount percentages for Missouri." },
        ],
        threadOpportunities: [
          { type: "recommendation", exampleTitle: "Best alarm company in St. Louis that isn't ADT?", searchUrl: "https://www.reddit.com/search/?q=alarm+company+st+louis&sort=top", competitorMentioned: "Barcom Security and ACF Alarm are typically mentioned", howToWin: "Reply with: years in business, St. Charles County focus, no-contract monitoring price, and offer to answer any questions. Never sound like an ad — sound like a neighbor." },
          { type: "question", exampleTitle: "Can I keep my ADT equipment if I switch companies?", searchUrl: "https://www.reddit.com/search/?q=switch+from+ADT+keep+equipment&sort=top", competitorMentioned: "National Reddit users answer generically — no local company is mentioned", howToWin: "Answer with specific panel models that work (Honeywell, DSC, 2GIG) and mention you do this in St. Louis for $99-149. This thread type gets cited by ChatGPT constantly." },
          { type: "comparison", exampleTitle: "ADT vs local alarm company — worth the price difference?", searchUrl: "https://www.reddit.com/search/?q=ADT+vs+local+alarm+company&sort=top", competitorMentioned: "ADT defends itself, national voices dominate", howToWin: "Post a detailed comparison: ADT contract terms vs local flexibility, national call center vs local response, price comparison. Factual and honest wins Reddit." },
          { type: "question", exampleTitle: "How much does alarm monitoring cost per month in 2026?", searchUrl: "https://www.reddit.com/search/?q=alarm+monitoring+cost+per+month&sort=top", competitorMentioned: "SimpliSafe and Ring are mentioned for DIY, no local companies", howToWin: "Answer with exact prices: $28.99 basic, $38.99 interactive, $44.99 with cameras. Add Missouri-specific context. Perplexity cites specific price answers." },
          { type: "complaint", exampleTitle: "ADT raised my monitoring rate again — what are my options?", searchUrl: "https://www.reddit.com/search/?q=ADT+raised+rate+switch+options&sort=top", competitorMentioned: "SimpliSafe DIY is usually the top recommendation", howToWin: "Offer the takeover option — keep your equipment, switch to local monitoring for less. Include your actual price. These threads generate direct leads." },
        ],
        aiCitationOpportunities: [
          { query: "best alarm company in St. Louis Missouri", redditConnection: "r/StLouis recommendation threads rank #1-3 on Google for this search — ChatGPT pulls from those rankings", action: "Get mentioned in 3+ r/StLouis threads over 90 days. AI citation follows Google ranking." },
          { query: "can I switch from ADT and keep my equipment", redditConnection: "r/homesecurity and r/HomeImprovement threads on this topic feed ChatGPT and Perplexity answers directly", action: "Answer this question on both subreddits with specific panel model knowledge. Be the definitive answer." },
          { query: "how much does alarm monitoring cost in St. Louis", redditConnection: "Perplexity pulls pricing answers from Reddit threads that have specific numbers", action: "Post a detailed pricing breakdown on r/StLouis and r/homesecurity with exact St. Louis prices." },
        ],
        redditStrategy: {
          doThis: [
            "Create a Reddit account with a neutral name — not the business name",
            "Spend 2 weeks karma-building: comment helpfully on non-business topics in r/StLouis",
            "Answer security questions on r/homesecurity and r/HomeImprovement with no promotion for the first month",
            "After 30 days of genuine participation, mention CityWide naturally when directly relevant",
            "Post a 'St. Louis Alarm Company Pricing Guide 2026' on r/StLouis — pure value, no sales pitch"
          ],
          neverDoThis: [
            "Create an account and immediately promote the business — instant ban",
            "Post the same comment in multiple subreddits — flagged as spam",
            "Ask family/friends to upvote posts — vote manipulation, account banned",
            "Respond to every security thread with a business mention — looks like advertising",
            "Use the business name as the Reddit username"
          ],
          firstPost: "Post on r/StLouis: 'St. Louis Alarm Company Pricing Guide — What You Should Actually Pay in 2026' — include real monitoring prices, what to avoid, questions to ask any company. Pure value. No CTA. Gets bookmarked and cited.",
          timeToResults: "30-60 days for Reddit karma and credibility. 60-90 days for Google to index threads. 90-120 days for AI citation pickup."
        },
        competitorAnalysis: {
          dominantCompetitor: "No single local competitor dominates Reddit — this is the opportunity",
          theirAdvantage: "National brands (ADT, SimpliSafe, Ring) dominate Reddit by default because local companies ignore it",
          howToOvertake: "Be the first St. Louis alarm company with genuine Reddit presence. The bar is extremely low — one helpful post per week for 90 days makes you the local Reddit authority."
        },
        quickWins: [
          "Create Reddit account today — start karma building on r/StLouis with non-business comments",
          "Search Reddit for 'alarm company St. Louis' — find every existing thread and read what people want",
          "Answer ONE equipment takeover question on r/homesecurity this week — no promotion, just expertise",
          "Draft the St. Louis Pricing Guide post — pure value content, ready to post after 2 weeks of karma",
          "Set up Google Alert for 'alarm company St. Louis reddit' to monitor new threads daily"
        ]
      });
    }
    setRunning(false);
  };

  const relevanceColor = (r) => ({ critical: "#FF4500", high: "#F59E0B", medium: "#60A5FA", low: "#94A3B8" }[r] || "#94A3B8");
  const scoreColor = (s) => s >= 60 ? "#34D399" : s >= 30 ? "#FBBF24" : "#F87171";
  const statusColor = { "Strong Presence": "#34D399", "Weak Presence": "#FBBF24", "Not Found": "#F87171", "Competitor Dominates": "#F87171" };
  const typeIcon = { recommendation: "⭐", complaint: "😤", question: "❓", comparison: "⚖️" };

  const TABS = [
    { id: "subreddits", label: "Subreddits" },
    { id: "threads", label: "Thread Opportunities" },
    { id: "ai", label: "AI Citation" },
    { id: "strategy", label: "Strategy" },
  ];

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Reddit Visibility Scanner</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Finds subreddits, competitor mentions, and thread opportunities. Reddit threads rank #1-3 on Google for local searches — and feed ChatGPT, Perplexity, and Gemini answers directly.
          </p>
        </div>
        <button onClick={runScan} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Scanning..." : result ? "Re-scan →" : "Scan Reddit →"}
        </button>
      </div>

      {result && (
        <div>
          {/* Score + summary */}
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${scoreColor(result.visibilityScore)}40`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>REDDIT SCORE</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor(result.visibilityScore), lineHeight: 1 }}>{result.visibilityScore}</div>
              <div style={{ fontSize: 9, color: statusColor[result.status] || "#F87171", marginTop: 4, fontWeight: 500 }}>{result.status}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.8px" }}>SITUATION</div>
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{result.summary}</div>
            </div>
          </div>

          {/* Quick wins */}
          {result.quickWins?.length > 0 && (
            <div style={{ background: "#FF450008", border: "0.5px solid #FF450030", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 8 }}>DO THIS WEEK</div>
              {result.quickWins.map((win, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < result.quickWins.length - 1 ? 5 : 0 }}>
                  <span style={{ color: MODULE_COLOR, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{win}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, border: "0.5px solid var(--color-border-secondary)", background: activeTab === t.id ? MODULE_COLOR : "transparent", color: activeTab === t.id ? "#fff" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: activeTab === t.id ? 500 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Subreddits Tab */}
          {activeTab === "subreddits" && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
                RELEVANT SUBREDDITS — {result.subreddits?.length}
              </div>
              {result.subreddits?.map((sub, i) => (
                <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.subreddits.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <a href={sub.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: MODULE_COLOR, textDecoration: "none" }}>{sub.name}</a>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: relevanceColor(sub.relevance) + "18", color: relevanceColor(sub.relevance) }}>{sub.relevance.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{sub.members} members</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4, marginBottom: 4 }}>{sub.why}</div>
                  <div style={{ fontSize: 11, color: "#34D399", padding: "4px 8px", background: "#34D39910", borderRadius: 4, borderLeft: "2px solid #34D399" }}>
                    Opportunity: {sub.opportunity}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Thread Opportunities Tab */}
          {activeTab === "threads" && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
                THREAD OPPORTUNITIES — {result.threadOpportunities?.length}
              </div>
              {result.threadOpportunities?.map((t, i) => (
                <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.threadOpportunities.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 14 }}>{typeIcon[t.type]}</span>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#FF450018", color: MODULE_COLOR }}>{t.type.toUpperCase()}</span>
                    <a href={t.searchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: "#60A5FA", textDecoration: "none", padding: "1px 6px", borderRadius: 3, background: "#60A5FA18", border: "0.5px solid #60A5FA30" }}>Search Reddit →</a>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", fontStyle: "italic", marginBottom: 4 }}>"{t.exampleTitle}"</div>
                  <div style={{ fontSize: 11, color: "#F87171", marginBottom: 5 }}>Currently appearing: {t.competitorMentioned}</div>
                  <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45 }}>
                    How to win: {t.howToWin}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Citation Tab */}
          {activeTab === "ai" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "#FF450008", border: "0.5px solid #FF450030", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 4 }}>WHY REDDIT FEEDS AI SEARCH</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>Reddit threads that rank on Google get indexed by AI engines. When ChatGPT or Perplexity answers "best alarm company in St. Louis" — they pull from Google's top results. Reddit is often #1. Getting mentioned in those threads = getting cited by AI.</div>
              </div>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>AI CITATION OPPORTUNITIES</div>
                {result.aiCitationOpportunities?.map((opp, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.aiCitationOpportunities.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", fontStyle: "italic", marginBottom: 4 }}>"{opp.query}"</div>
                    <div style={{ fontSize: 11, color: "#A78BFA", marginBottom: 5 }}>Reddit connection: {opp.redditConnection}</div>
                    <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45 }}>
                      Action: {opp.action}
                    </div>
                  </div>
                ))}
              </div>
              {result.competitorAnalysis && (
                <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 8 }}>COMPETITOR REDDIT ANALYSIS</div>
                  <div style={{ fontSize: 11, color: "#F87171", marginBottom: 4 }}><strong>Dominant competitor:</strong> {result.competitorAnalysis.dominantCompetitor}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}><strong>Their advantage:</strong> {result.competitorAnalysis.theirAdvantage}</div>
                  <div style={{ fontSize: 11, color: "#34D399" }}><strong>How to overtake:</strong> {result.competitorAnalysis.howToOvertake}</div>
                </div>
              )}
            </div>
          )}

          {/* Strategy Tab */}
          {activeTab === "strategy" && result.redditStrategy && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.8px", marginBottom: 8 }}>FIRST POST TO MAKE</div>
                <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5, fontStyle: "italic" }}>"{result.redditStrategy.firstPost}"</div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 6 }}>Time to results: {result.redditStrategy.timeToResults}</div>
              </div>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "#34D399", letterSpacing: "0.8px", fontWeight: 500 }}>DO THIS</div>
                {result.redditStrategy.doThis?.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: i < result.redditStrategy.doThis.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ color: "#34D399", fontSize: 10, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "#F87171", letterSpacing: "0.8px", fontWeight: 500 }}>NEVER DO THIS</div>
                {result.redditStrategy.neverDoThis?.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: i < result.redditStrategy.neverDoThis.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ color: "#F87171", fontSize: 10, flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Are competitors being recommended on Reddit instead of you?</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            Reddit threads rank #1-3 on Google for "best alarm company in St. Louis" — and those same threads feed ChatGPT, Perplexity, and Gemini answers. One mention in the right thread generates leads for years.
          </div>
        </div>
      )}
    </div>
  );
}
