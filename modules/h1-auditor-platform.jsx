import { useState, useCallback } from "react";

// ============================================================
// SYSTEM PROMPT — The Intelligence Engine
// ============================================================
const SYSTEM_PROMPT = `You are the world's most sophisticated SEO diagnostic engine, built on the methodology of an expert who took a security company from $200,000 to $2,500,000 in annual revenue in 2 years using SEO — 99% from organic search.

Your job is to perform a deep intelligent audit of a website's H1 tags and topical identity. You think like Google thinks — not like a checklist tool.

You will be given a list of pages from a website including their URLs, H1 tags (or lack thereof), page titles, and visible content samples.

Perform this analysis in this EXACT JSON format (respond ONLY with valid JSON, no markdown, no preamble):

{
  "businessIdentity": {
    "whatGoogleThinksSite": "<What Google currently believes this business is based on all signals combined — be specific and honest>",
    "whatBusinessActuallyIs": "<What the business actually does based on content signals>",
    "identityGap": "<The gap between these two — is this costing rankings? How severely?>",
    "primaryServiceDetermination": "<Based on all page content, what is the single most important thing this business does that should drive all H1 strategy>",
    "topicalConfusionScore": <0-100 where 100 = completely confused identity>,
    "verdict": "<One brutal honest sentence about their topical identity problem>"
  },
  "h1Analysis": {
    "sitewideProblemSummary": "<Overall assessment of H1 strategy across the entire site>",
    "duplicateGroups": [
      {
        "issue": "<Description of duplicate or near-duplicate H1 problem>",
        "affectedPages": ["<url1>", "<url2>"],
        "impact": "<How this is hurting rankings specifically>"
      }
    ],
    "cannibalizationRisks": [
      {
        "pages": ["<url1>", "<url2>"],
        "issue": "<How these pages are competing against each other>",
        "fix": "<Specific resolution>"
      }
    ],
    "pages": [
      {
        "url": "<page url>",
        "currentH1": "<current H1 or MISSING>",
        "h1Position": "<TOP_OF_PAGE | BELOW_FOLD | MISSING | IN_IMAGE_NOT_CODE>",
        "grade": "<A | B | C | D | F>",
        "problemType": "<MISSING | MARKETING_SLOGAN | NO_KEYWORD | NO_LOCATION | DUPLICATE | CANNIBALIZES | WRONG_FOCUS | GOOD>",
        "whatGoogleSees": "<Exactly what signal Google is receiving from this H1 — be specific>",
        "keywordDensityAssessment": "<Are supporting keywords on this page too many, too few, or right? What are they?>",
        "recommendedH1": "<Specific replacement H1 — not generic, not a template, exactly what it should say>",
        "recommendedH1Reasoning": "<Why this specific H1 will move rankings for this specific page>",
        "supportingKeywordsNeeded": ["<keyword1>", "<keyword2>", "<keyword3>"],
        "keywordsToRemove": ["<keyword that is diluting focus>"],
        "pageRoleInSiteArchitecture": "<What role should this page play — hub, service page, location page, etc>",
        "priorityToFix": "<CRITICAL | HIGH | MEDIUM | LOW>",
        "estimatedRankingImpact": "<What ranking movement to expect after fixing this>"
      }
    ]
  },
  "topicalAuthorityMap": {
    "currentTopics": ["<topic Google currently associates with this site>"],
    "missingTopics": ["<topic the business should rank for but isn't signaling>"],
    "confusingTopics": ["<topic that is diluting the site's primary identity>"],
    "recommendedPrimaryTopic": "<The single topic that should anchor the entire site>",
    "recommendedSupportingTopics": ["<topic1>", "<topic2>", "<topic3>"]
  },
  "immediateActionPlan": [
    {
      "priority": 1,
      "action": "<Specific action — not generic>",
      "page": "<which page>",
      "expectedImpact": "<What will change in Google rankings and when>",
      "effort": "<30 minutes | half day | full day>"
    }
  ],
  "theBiggestMistake": "<The single most damaging thing this website is doing from an H1 and topical identity standpoint — the thing that if fixed tomorrow would move rankings the most>"
}

CRITICAL RULES FOR YOUR ANALYSIS:

1. DUPLICATE H1 DETECTION: Flag any H1 that is the same OR semantically similar to another page's H1. Exception: City-specific pages where only the city name changes are acceptable duplicates — that is intentional local SEO strategy.

2. TOPICAL IDENTITY: Look at the AGGREGATE signal of ALL pages together. If a site has pages about IT services, web design, and security systems — Google is confused. Identify every page that dilutes the primary topical identity.

3. KEYWORD DENSITY: The right amount is natural — primary keyword appears 2-4 times per page naturally in context. Too many = keyword stuffing penalty. Too few = weak relevance signal. Flag both extremes.

4. H1 POSITION: An H1 at the bottom of the page sends almost no ranking signal. An H1 hidden in CSS styling or in an image rather than in actual HTML code sends zero signal. Flag these specifically.

5. MARKETING SLOGANS: Any H1 that reads like an advertising slogan rather than a keyword phrase is wasted. "Innovative Solutions Since 1976" is not an H1. "Commercial Security Systems in Seattle WA" is an H1.

6. THE HOMEPAGE H1 IS THE MOST IMPORTANT: It sets the entire topical identity of the domain. If it is wrong, every other page suffers. Give this special weight.

7. RECOMMENDED H1s: Never give a generic template. Give the exact H1 that should be on that exact page for that exact business in that exact location. Make it specific enough that the business owner can implement it today without any additional thinking.

8. BE BRUTALLY HONEST: If the site has a catastrophic topical identity problem, say so clearly. The business owner needs to know the severity to take action.`;

// ============================================================
// COMPONENT
// ============================================================

const gradeColor = {
  A: "#22c55e", B: "#84cc16", C: "#f59e0b", D: "#f97316", F: "#ef4444"
};
const priorityColor = {
  CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#64748b"
};
const problemLabels = {
  MISSING: "🚨 H1 MISSING",
  MARKETING_SLOGAN: "📢 Marketing Slogan",
  NO_KEYWORD: "🔍 No Keywords",
  NO_LOCATION: "📍 No Location",
  DUPLICATE: "♊ Duplicate",
  CANNIBALIZES: "⚔️ Cannibalizes",
  WRONG_FOCUS: "🎯 Wrong Focus",
  GOOD: "✅ Good"
};

function ScoreGauge({ score, label, color }) {
  const r = 40, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color}
          strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ marginTop: -60, marginBottom: 40 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "monospace" }}>{score}</div>
        <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>{label}</div>
      </div>
    </div>
  );
}

function PageCard({ page, index }) {
  const [open, setOpen] = useState(false);
  const gc = gradeColor[page.grade] || "#64748b";
  const pc = priorityColor[page.priorityToFix] || "#64748b";

  return (
    <div style={{
      background: "#0d1420", border: `1px solid ${open ? gc : "#1e293b"}`,
      borderLeft: `4px solid ${gc}`, borderRadius: 8, marginBottom: 10,
      transition: "all 0.2s", overflow: "hidden"
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "14px 18px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 6,
          background: `${gc}20`, border: `1px solid ${gc}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: gc, flexShrink: 0,
          fontFamily: "monospace"
        }}>{page.grade}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", marginBottom: 2 }}>
            {page.url}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
            {page.currentH1 === "MISSING" ?
              <span style={{ color: "#ef4444" }}>⚠ NO H1 TAG FOUND</span> :
              `"${page.currentH1}"`
            }
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 3, fontFamily: "monospace",
            background: `${pc}15`, border: `1px solid ${pc}30`, color: pc
          }}>{page.priorityToFix}</span>
          <span style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 3, fontFamily: "monospace",
            background: "rgba(100,116,139,0.1)", border: "1px solid #1e293b", color: "#94a3b8"
          }}>{problemLabels[page.problemType] || page.problemType}</span>
        </div>
        <span style={{ color: "#475569", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #1e293b" }}>

          {/* What Google Sees */}
          <div style={{ marginTop: 14, padding: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>WHAT GOOGLE CURRENTLY SEES</div>
            <p style={{ fontSize: 13, color: "#fca5a5", margin: 0, lineHeight: 1.6 }}>{page.whatGoogleSees}</p>
          </div>

          {/* Recommended H1 */}
          <div style={{ marginTop: 10, padding: 14, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>RECOMMENDED H1 — USE THIS EXACTLY</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#86efac", marginBottom: 8, fontFamily: "monospace" }}>
              "{page.recommendedH1}"
            </div>
            <p style={{ fontSize: 12, color: "#4ade80", margin: 0, lineHeight: 1.6 }}>{page.recommendedH1Reasoning}</p>
          </div>

          {/* Keyword Density */}
          <div style={{ marginTop: 10, padding: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>KEYWORD DENSITY ASSESSMENT</div>
            <p style={{ fontSize: 13, color: "#c7d2fe", margin: "0 0 10px", lineHeight: 1.6 }}>{page.keywordDensityAssessment}</p>
            {page.supportingKeywordsNeeded?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 4 }}>ADD THESE KEYWORDS TO PAGE CONTENT:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {page.supportingKeywordsNeeded.map((kw, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontFamily: "monospace" }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {page.keywordsToRemove?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>REMOVE OR REDUCE THESE (diluting focus):</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {page.keywordsToRemove.map((kw, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontFamily: "monospace" }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* H1 Position + Page Role + Impact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ padding: 12, background: "#060a12", border: "1px solid #1e293b", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>H1 POSITION</div>
              <div style={{ fontSize: 12, color: page.h1Position === "TOP_OF_PAGE" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{page.h1Position?.replace(/_/g, " ")}</div>
            </div>
            <div style={{ padding: 12, background: "#060a12", border: "1px solid #1e293b", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>PAGE ROLE</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{page.pageRoleInSiteArchitecture}</div>
            </div>
            <div style={{ padding: 12, background: "#060a12", border: "1px solid #1e293b", borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>EXPECTED IMPACT</div>
              <div style={{ fontSize: 11, color: "#fbbf24" }}>{page.estimatedRankingImpact}</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function H1AuditorPlatform() {
  const [domain, setDomain] = useState("");
  const [pages, setPages] = useState([{ url: "", h1: "", title: "", content: "" }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("identity");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const addPage = () => setPages([...pages, { url: "", h1: "", title: "", content: "" }]);
  const removePage = (i) => setPages(pages.filter((_, idx) => idx !== i));
  const updatePage = (i, field, val) => {
    const updated = [...pages];
    updated[i][field] = val;
    setPages(updated);
  };

  const runAudit = useCallback(async () => {
    const validPages = pages.filter(p => p.url.trim());
    if (!domain.trim() || validPages.length === 0) return;

    setLoading(true);
    setError("");
    setResult(null);

    const pageData = validPages.map(p => ({
      url: p.url,
      h1: p.h1 || "MISSING",
      title: p.title || "Not provided",
      contentSample: p.content || "Not provided"
    }));

    const userMessage = `Perform a complete intelligent H1 and topical identity audit for this website.

Domain: ${domain}

Pages found on this site:
${JSON.stringify(pageData, null, 2)}

Analyze ALL pages together as a system. Determine what Google thinks this site is about vs what it should be about. Find every H1 problem — missing, duplicate, marketing slogans, wrong focus, cannibalization. Provide specific replacement H1s for every page. Determine the correct keyword density for each page. Be brutally honest about the topical identity.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      const data = await response.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
      setActiveTab("identity");
    } catch (e) {
      setError("Audit failed. Check your page data and try again. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [domain, pages]);

  const filteredPages = result?.h1Analysis?.pages?.filter(p =>
    filterPriority === "ALL" || p.priorityToFix === filterPriority
  ) || [];

  const confusionScore = result?.businessIdentity?.topicalConfusionScore || 0;
  const confusionColor = confusionScore > 70 ? "#ef4444" : confusionScore > 40 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{
      minHeight: "100vh", background: "#060a12", color: "#e2e8f0",
      fontFamily: "'Outfit', sans-serif", padding: "0 0 80px"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(180deg,#0a0f1e 0%,#060a12 100%)",
        borderBottom: "1px solid #1e293b", padding: "28px 32px"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
            fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em",
            padding: "4px 12px", borderRadius: 2, marginBottom: 12
          }}>INTELLIGENT H1 AUDIT ENGINE v1.0</div>
          <h1 style={{
            fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)",
            letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1
          }}>H1 <span style={{ color: "#ef4444" }}>Auditor</span> + Topical Identity</h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Finds what Google thinks your site is — vs what it should be · Flags every H1 problem · Writes exact replacement tags
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* INPUT SECTION */}
        <div style={{
          background: "#0d1420", border: "1px solid #1e293b",
          borderRadius: 10, padding: 24, marginBottom: 28
        }}>
          <label style={{ display: "block", fontSize: 11, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
            WEBSITE DOMAIN
          </label>
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="e.g. guardiansecurity.com"
            style={{
              width: "100%", background: "#060a12", border: "1px solid #1e293b",
              borderRadius: 6, padding: "10px 14px", color: "#f1f5f9",
              fontSize: 15, outline: "none", boxSizing: "border-box",
              fontFamily: "monospace", marginBottom: 20
            }}
          />

          {/* PAGE INPUTS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              PAGES TO AUDIT ({pages.length} pages)
            </label>
            <button onClick={addPage} style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8", fontSize: 12, padding: "5px 14px", borderRadius: 4,
              cursor: "pointer", fontFamily: "monospace"
            }}>+ Add Page</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pages.map((page, i) => (
              <div key={i} style={{
                background: "#060a12", border: "1px solid #1e293b",
                borderRadius: 8, padding: 14
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", flexShrink: 0 }}>PAGE {i + 1}</span>
                  {pages.length > 1 && (
                    <button onClick={() => removePage(i)} style={{
                      marginLeft: "auto", background: "none", border: "none",
                      color: "#475569", cursor: "pointer", fontSize: 16
                    }}>×</button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input
                    value={page.url}
                    onChange={e => updatePage(i, "url", e.target.value)}
                    placeholder="Page URL (e.g. /commercial-security/)"
                    style={{
                      background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                      padding: "8px 12px", color: "#f1f5f9", fontSize: 12, outline: "none",
                      fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                    }}
                  />
                  <input
                    value={page.h1}
                    onChange={e => updatePage(i, "h1", e.target.value)}
                    placeholder="Current H1 tag (leave blank if missing)"
                    style={{
                      background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                      padding: "8px 12px", color: "#f1f5f9", fontSize: 12, outline: "none",
                      fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    value={page.title}
                    onChange={e => updatePage(i, "title", e.target.value)}
                    placeholder="Page title tag"
                    style={{
                      background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                      padding: "8px 12px", color: "#f1f5f9", fontSize: 12, outline: "none",
                      fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                    }}
                  />
                  <input
                    value={page.content}
                    onChange={e => updatePage(i, "content", e.target.value)}
                    placeholder="Key content / services mentioned on this page"
                    style={{
                      background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                      padding: "8px 12px", color: "#f1f5f9", fontSize: 12, outline: "none",
                      fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={runAudit}
            disabled={loading || !domain.trim()}
            style={{
              marginTop: 20, width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#ef4444,#dc2626)",
              color: loading ? "#475569" : "#fff", border: "none", borderRadius: 8,
              padding: "14px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Outfit'", letterSpacing: "0.02em", transition: "all 0.2s"
            }}
          >
            {loading ? "🧠 Analyzing H1 Tags and Topical Identity..." : "Run Intelligent H1 Audit →"}
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "14px 18px", color: "#fca5a5",
            fontSize: 13, marginBottom: 24, fontFamily: "monospace"
          }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
            <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              Reading every H1 signal across all pages...
            </p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Identifying duplicates · Detecting topical confusion · Writing replacement tags
            </p>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div>

            {/* THE BIG MISTAKE */}
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "2px solid rgba(239,68,68,0.4)",
              borderRadius: 10, padding: 20, marginBottom: 20
            }}>
              <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 8 }}>
                🚨 THE SINGLE BIGGEST MISTAKE ON THIS SITE
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fca5a5", margin: 0, lineHeight: 1.6 }}>
                {result.theBiggestMistake}
              </p>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "identity", label: "🏢 Topical Identity" },
                { id: "pages", label: `📄 Page H1s (${result.h1Analysis?.pages?.length || 0})` },
                { id: "duplicates", label: `♊ Duplicates & Cannibalization` },
                { id: "actions", label: "⚡ Action Plan" }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: activeTab === tab.id ? "#1e293b" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "#334155" : "#1e293b"}`,
                  borderRadius: 6, padding: "8px 16px", color: activeTab === tab.id ? "#f1f5f9" : "#64748b",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "monospace", transition: "all 0.2s"
                }}>{tab.label}</button>
              ))}
            </div>

            {/* IDENTITY TAB */}
            {activeTab === "identity" && result.businessIdentity && (
              <div>
                <div style={{
                  background: "#0d1420", border: "1px solid #1e293b",
                  borderRadius: 10, padding: 24, marginBottom: 16
                }}>
                  <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <ScoreGauge
                      score={result.businessIdentity.topicalConfusionScore}
                      label="CONFUSION SCORE"
                      color={confusionColor}
                    />
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>VERDICT</div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px", lineHeight: 1.5 }}>
                        {result.businessIdentity.verdict}
                      </p>
                      <div style={{ display: "grid", gap: 10 }}>
                        {[
                          { label: "WHAT GOOGLE THINKS THIS SITE IS", value: result.businessIdentity.whatGoogleThinksSite, color: "#ef4444" },
                          { label: "WHAT THE BUSINESS ACTUALLY IS", value: result.businessIdentity.whatBusinessActuallyIs, color: "#22c55e" },
                          { label: "THE IDENTITY GAP", value: result.businessIdentity.identityGap, color: "#f59e0b" },
                          { label: "PRIMARY SERVICE — SHOULD DRIVE ALL H1s", value: result.businessIdentity.primaryServiceDetermination, color: "#818cf8" },
                        ].map((item, i) => (
                          <div key={i} style={{ padding: 12, background: "#060a12", border: `1px solid ${item.color}20`, borderLeft: `3px solid ${item.color}`, borderRadius: 6 }}>
                            <div style={{ fontSize: 10, color: item.color, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 4 }}>{item.label}</div>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topical Authority Map */}
                {result.topicalAuthorityMap && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[
                      { label: "TOPICS GOOGLE SEES NOW", items: result.topicalAuthorityMap.currentTopics, color: "#64748b" },
                      { label: "MISSING TOPICS (not signaling)", items: result.topicalAuthorityMap.missingTopics, color: "#f59e0b" },
                      { label: "CONFUSING TOPICS (diluting)", items: result.topicalAuthorityMap.confusingTopics, color: "#ef4444" },
                    ].map((section, i) => (
                      <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                        <div style={{ fontSize: 10, color: section.color, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>{section.label}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {section.items?.map((item, j) => (
                            <div key={j} style={{
                              fontSize: 12, padding: "4px 8px", borderRadius: 4,
                              background: `${section.color}10`, border: `1px solid ${section.color}25`,
                              color: "#94a3b8", fontFamily: "monospace"
                            }}>{item}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAGES TAB */}
            {activeTab === "pages" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
                    <button key={p} onClick={() => setFilterPriority(p)} style={{
                      background: filterPriority === p ? (priorityColor[p] || "#334155") + "20" : "transparent",
                      border: `1px solid ${filterPriority === p ? (priorityColor[p] || "#334155") : "#1e293b"}`,
                      color: filterPriority === p ? (priorityColor[p] || "#94a3b8") : "#64748b",
                      padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                      fontFamily: "monospace"
                    }}>{p}</button>
                  ))}
                </div>
                {filteredPages.map((page, i) => <PageCard key={i} page={page} index={i} />)}
              </div>
            )}

            {/* DUPLICATES TAB */}
            {activeTab === "duplicates" && (
              <div>
                {result.h1Analysis?.duplicateGroups?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: "#f59e0b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>♊ DUPLICATE & NEAR-DUPLICATE H1s</div>
                    {result.h1Analysis.duplicateGroups.map((group, i) => (
                      <div key={i} style={{ background: "#0d1420", border: "1px solid rgba(245,158,11,0.3)", borderLeft: "3px solid #f59e0b", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fde68a", margin: "0 0 8px" }}>{group.issue}</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                          {group.affectedPages?.map((url, j) => (
                            <span key={j} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24", fontFamily: "monospace" }}>{url}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{group.impact}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.h1Analysis?.cannibalizationRisks?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>⚔️ KEYWORD CANNIBALIZATION RISKS</div>
                    {result.h1Analysis.cannibalizationRisks.map((risk, i) => (
                      <div key={i} style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.3)", borderLeft: "3px solid #ef4444", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                          {risk.pages?.map((url, j) => (
                            <span key={j} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontFamily: "monospace" }}>{url}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 13, color: "#fca5a5", margin: "0 0 8px", lineHeight: 1.5 }}>{risk.issue}</p>
                        <div style={{ padding: 10, background: "rgba(34,197,94,0.08)", borderRadius: 4, borderLeft: "2px solid #22c55e" }}>
                          <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>FIX → </span>
                          <span style={{ fontSize: 12, color: "#86efac" }}>{risk.fix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {(!result.h1Analysis?.duplicateGroups?.length && !result.h1Analysis?.cannibalizationRisks?.length) && (
                  <div style={{ textAlign: "center", padding: 40, color: "#22c55e" }}>✅ No duplicate or cannibalization issues detected</div>
                )}
              </div>
            )}

            {/* ACTION PLAN TAB */}
            {activeTab === "actions" && (
              <div>
                {result.immediateActionPlan?.map((action, i) => (
                  <div key={i} style={{
                    background: "#0d1420", border: "1px solid #1e293b",
                    borderRadius: 8, padding: 18, marginBottom: 10,
                    display: "flex", gap: 16, alignItems: "flex-start"
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: i === 0 ? "rgba(239,68,68,0.15)" : i === 1 ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.1)",
                      border: `1px solid ${i === 0 ? "rgba(239,68,68,0.4)" : i === 1 ? "rgba(245,158,11,0.4)" : "rgba(99,102,241,0.3)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 800,
                      color: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#818cf8",
                      fontFamily: "monospace"
                    }}>{action.priority}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{action.page}</span>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
                          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8"
                        }}>{action.effort}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", margin: "0 0 6px" }}>{action.action}</p>
                      <p style={{ fontSize: 12, color: "#fbbf24", margin: 0, lineHeight: 1.5 }}>→ {action.expectedImpact}</p>
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
