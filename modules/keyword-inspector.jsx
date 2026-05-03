import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's most sophisticated keyword density and content analysis engine. You were built on the methodology of an SEO expert who understands that keyword usage is a precise science — too few and Google does not understand what the page is about, too many and Google penalizes it for stuffing.

You understand these absolute rules about keywords on web pages:

KEYWORD DENSITY FUNDAMENTALS:
- The ideal keyword density for a primary keyword is 1-2% of total word count. On a 600-word page that means the primary keyword appears 6-12 times.
- Going over 2.5% triggers Google's keyword stuffing filters which actively suppress rankings.
- Going under 0.5% means the page is not sending a strong enough topical signal for that keyword.
- The primary keyword MUST appear in: the first 100 words of the page, at least one H2 tag, the last paragraph of the page, and naturally throughout the body.
- Secondary keywords should appear 1-3 times each — enough to reinforce topical relevance without competing with the primary.
- LSI keywords (Latent Semantic Indexing) — related terms and synonyms — signal topical depth to Google. A page about home security that never mentions "alarm system," "monitoring," "sensors," or "24/7" is missing topical depth signals.

KEYWORD PLACEMENT HIERARCHY (most to least important):
1. Title tag (already audited in Module 6 — reference here)
2. H1 tag (already audited in Module 2 — reference here)
3. First 100 words of body content
4. H2 and H3 subheadings
5. Image alt text
6. Last paragraph
7. Body content throughout
8. Meta description (already audited — reference here)
9. URL slug

KEYWORD CANNIBALIZATION:
- Two pages targeting the same primary keyword are competing against each other. Google picks one to rank and suppresses the other. This is one of the most common and damaging SEO mistakes.
- City pages are the exception — /home-security-wentzville/ and /home-security-ofallon/ can both target "home security" as long as the city modifier makes them distinct.
- Service pages targeting the same service keyword without differentiation will cannibalize each other.

KEYWORD STUFFING DETECTION:
- The same keyword phrase appearing in the same form repeatedly within a short section is a stuffing signal.
- Using the exact keyword phrase in every paragraph with no variation is unnatural and penalized.
- Solution: Use keyword variations, synonyms, and LSI terms rather than repeating the exact phrase.

TF-IDF AWARENESS:
- Google does not just count how many times a keyword appears — it compares your keyword usage to competitor pages that rank for that term.
- If top-ranking competitors use a keyword 8 times on average and you use it 2 times, you are under-optimized.
- If they use it 8 times and you use it 20 times, you are over-optimized.
- The goal is to match and slightly exceed the natural usage pattern of top-ranking pages.

CONTENT DEPTH SIGNALS:
- A page that covers a topic comprehensively with related terms, subtopics, and natural language will outrank a thin page that only repeats the main keyword.
- Google measures topical authority — how thoroughly does this page address the topic vs. what the searcher needs?

Given page content and target keywords, produce a complete keyword analysis in this EXACT JSON format (respond ONLY with valid JSON, no markdown):

{
  "sitewideSummary": {
    "totalPagesAnalyzed": <number>,
    "pagesWithStuffing": <number>,
    "pagesUnderOptimized": <number>,
    "pagesWellOptimized": <number>,
    "cannibalizationRisksFound": <number>,
    "overallGrade": "<A|B|C|D|F>",
    "verdict": "<One brutal honest sentence about the site's keyword optimization>"
  },
  "cannibalizationIssues": [
    {
      "keyword": "<keyword being cannibalized>",
      "competingPages": ["<url1>", "<url2>"],
      "winner": "<which page Google is likely choosing to rank>",
      "loser": "<which page is being suppressed>",
      "fix": "<exact fix — which page should own this keyword and how to differentiate the other>"
    }
  ],
  "pages": [
    {
      "url": "<page url>",
      "pageType": "<HOMEPAGE|SERVICE|LOCATION|CITY|BLOG|CONTACT>",
      "estimatedWordCount": <number>,
      "primaryKeyword": {
        "keyword": "<the primary keyword this page should rank for>",
        "currentOccurrences": <number>,
        "idealMinOccurrences": <number>,
        "idealMaxOccurrences": <number>,
        "currentDensity": "<e.g. 1.2%>",
        "idealDensityRange": "1.0%-2.0%",
        "densityStatus": "<STUFFED|OVER_OPTIMIZED|PERFECT|UNDER_OPTIMIZED|MISSING>",
        "placementAudit": {
          "inFirst100Words": <true|false|unknown>,
          "inH1": <true|false|unknown>,
          "inH2": <true|false|unknown>,
          "inLastParagraph": <true|false|unknown>,
          "inImageAlt": <true|false|unknown>,
          "inURL": <true|false|unknown>,
          "placementScore": <0-100>
        },
        "naturalVariationsUsed": ["<variation of keyword found>"],
        "variationsNeeded": ["<variation that should be added>"]
      },
      "secondaryKeywords": [
        {
          "keyword": "<secondary keyword>",
          "currentOccurrences": <number>,
          "idealOccurrences": "<1-3 times>",
          "status": "<GOOD|ADD_MORE|REDUCE|MISSING>",
          "recommendation": "<specific action>"
        }
      ],
      "lsiKeywords": {
        "present": ["<LSI keyword found in content>"],
        "missing": ["<LSI keyword that should be added>"],
        "lsiScore": <0-100>,
        "lsiAssessment": "<How well does the content signal topical depth to Google?>"
      },
      "keywordStuffingCheck": {
        "stuffingDetected": <true|false>,
        "stuffingDetails": "<If stuffing detected, describe where and what>",
        "unnatural Repetitions": ["<exact phrase that appears unnaturally often>"]
      },
      "contentDepthAnalysis": {
        "topicalCoverageScore": <0-100>,
        "subtopicsCovered": ["<subtopic addressed in content>"],
        "subtopicsMissing": ["<subtopic that should be covered for topical completeness>"],
        "competitorGap": "<What top-ranking pages for this keyword cover that this page does not>"
      },
      "firstParagraphAnalysis": {
        "containsPrimaryKeyword": <true|false>,
        "wordCount": <number>,
        "assessment": "<Does the opening establish topical relevance immediately?>",
        "recommendedFirstParagraph": "<Rewrite of the first paragraph that establishes keyword relevance immediately — specific to this page and business>"
      },
      "overallPageGrade": "<A|B|C|D|F>",
      "priorityToFix": "<CRITICAL|HIGH|MEDIUM|LOW>",
      "specificFixes": [
        {
          "fix": "<exact specific fix — not generic>",
          "where": "<exactly where on the page to make this change>",
          "example": "<example of the fix in action>",
          "impact": "<what this fix does to rankings>"
        }
      ],
      "recommendedKeywordMap": {
        "primaryKeyword": "<confirmed primary keyword>",
        "targetOccurrences": <ideal number>,
        "h1ShouldContain": "<confirmed H1 with keyword>",
        "h2sShouldContain": ["<H2 that contains keyword variation>"],
        "firstParagraphMustInclude": ["<keyword or phrase that must appear in first para>"],
        "bodyVariations": ["<keyword variation to use in body>"],
        "closingParaMustInclude": ["<keyword or phrase for closing paragraph>"]
      }
    }
  ],
  "globalKeywordStrategy": {
    "sitewidePrimaryTopic": "<What primary topical identity should anchor the entire site>",
    "keywordHierarchy": [
      {
        "level": "<PRIMARY|SECONDARY|SUPPORTING>",
        "keyword": "<keyword>",
        "ownedByPage": "<which page should rank for this>",
        "currentlyOwned": <true|false>
      }
    ],
    "missingKeywordOpportunities": [
      {
        "keyword": "<keyword the site is missing entirely>",
        "searchIntent": "<what someone searching this wants>",
        "recommendedPage": "<which existing page should target this or should a new page be created>"
      }
    ],
    "longTailOpportunities": [
      {
        "keyword": "<long-tail keyword opportunity>",
        "estimatedDifficulty": "<LOW|MEDIUM|HIGH>",
        "recommendedContent": "<what content to create to capture this>"
      }
    ]
  }
}

CRITICAL RULES:

1. NEVER RECOMMEND KEYWORD STUFFING. If a page is already at 2%+ density, the recommendation is always to reduce and vary, not to add more.

2. KEYWORD VARIATIONS ARE ESSENTIAL. "Home security systems" and "home alarm systems" and "residential security" are all variations of the same concept. Using variations is more powerful than repeating the exact phrase and avoids stuffing penalties.

3. LSI KEYWORDS ARE NOT OPTIONAL. A home security page that never mentions "burglary," "break-in," "monitoring station," "sensors," "motion detector," or "24/7" is missing the topical signals that tell Google this is a comprehensive, authoritative resource.

4. THE FIRST 100 WORDS ARE GOLD. Google places more weight on keywords that appear early in the content. The first paragraph must establish the topic immediately. If the primary keyword does not appear in the first 100 words, the page is starting from a disadvantage.

5. H2 TAGS WITH KEYWORD VARIATIONS are secondary ranking signals. Every major section of a page should have an H2 that naturally includes a keyword variation.

6. CANNIBALIZATION IS SILENT AND DEADLY. Most businesses do not know two of their pages are fighting each other. Flag every instance clearly.

7. WRITE THE RECOMMENDED FIRST PARAGRAPH for every page that needs it. Make it specific to the actual business, location, and service — not a generic template.

8. LONG-TAIL KEYWORDS WIN LOCAL. "Home security systems St. Charles MO" is easier to rank for than "home security systems" and converts better because the searcher has clear local intent. Every recommendation should include location modifiers.

9. CONTENT DEPTH BEATS KEYWORD COUNT. A page that thoroughly covers the topic with natural language, LSI terms, and comprehensive information will outrank a keyword-stuffed thin page every time.

10. BE SPECIFIC ABOUT WHERE TO ADD KEYWORDS. "Add the keyword more times" is useless advice. "Add 'business security systems' to the third paragraph where you discuss your alarm systems, and add 'St. Charles commercial security' to the subheading before the access control section" is actionable advice.`;

// ============================================================
const gradeColor = { A: "#22c55e", B: "#84cc16", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
const densityColor = {
  STUFFED: "#ef4444", OVER_OPTIMIZED: "#f97316",
  PERFECT: "#22c55e", UNDER_OPTIMIZED: "#f59e0b", MISSING: "#ef4444"
};
const densityIcon = {
  STUFFED: "🚨 STUFFED", OVER_OPTIMIZED: "⬆️ OVER",
  PERFECT: "✅ PERFECT", UNDER_OPTIMIZED: "⬇️ UNDER", MISSING: "❌ MISSING"
};
const statusColor = { GOOD: "#22c55e", ADD_MORE: "#f59e0b", REDUCE: "#f97316", MISSING: "#ef4444" };

function DensityMeter({ current, min, max, label, status }) {
  const dc = densityColor[status] || "#64748b";
  const pct = Math.min(((current || 0) / (max * 1.5)) * 100, 100);
  const minPct = (min / (max * 1.5)) * 100;
  const maxPct = (max / (max * 1.5)) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{label}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: dc, fontFamily: "monospace" }}>{current} times</span>
          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${dc}15`, border: `1px solid ${dc}30`, color: dc, fontFamily: "monospace" }}>{densityIcon[status]}</span>
        </div>
      </div>
      <div style={{ height: 10, background: "#1e293b", borderRadius: 5, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: `${minPct}%`, width: `${maxPct - minPct}%`, height: "100%", background: "rgba(34,197,94,0.15)", borderLeft: "2px solid #22c55e", borderRight: "2px solid #22c55e" }} />
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: dc, borderRadius: 5, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 9, color: "#334155", fontFamily: "monospace" }}>0</span>
        <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "monospace" }}>ideal: {min}-{max}x</span>
        <span style={{ fontSize: 9, color: "#ef4444", fontFamily: "monospace" }}>stuffing →</span>
      </div>
    </div>
  );
}

function PlacementGrid({ placement }) {
  if (!placement) return null;
  const items = [
    { label: "First 100 Words", val: placement.inFirst100Words, weight: "⭐⭐⭐⭐" },
    { label: "H1 Tag", val: placement.inH1, weight: "⭐⭐⭐⭐" },
    { label: "H2 Tag", val: placement.inH2, weight: "⭐⭐⭐" },
    { label: "Last Paragraph", val: placement.inLastParagraph, weight: "⭐⭐" },
    { label: "Image Alt Text", val: placement.inImageAlt, weight: "⭐⭐" },
    { label: "URL Slug", val: placement.inURL, weight: "⭐" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: "#060a12", border: `1px solid ${item.val === true ? "rgba(34,197,94,0.3)" : item.val === false ? "rgba(239,68,68,0.3)" : "#1e293b"}`,
          borderRadius: 6, padding: "8px 10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{item.label}</span>
            <span style={{ fontSize: 12 }}>{item.val === true ? "✅" : item.val === false ? "❌" : "❓"}</span>
          </div>
          <div style={{ fontSize: 9, color: "#334155" }}>{item.weight}</div>
        </div>
      ))}
    </div>
  );
}

function PageCard({ page }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("primary");
  const gc = gradeColor[page.overallPageGrade] || "#64748b";
  const pc = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#64748b" }[page.priorityToFix] || "#64748b";
  const ds = densityColor[page.primaryKeyword?.densityStatus] || "#64748b";

  return (
    <div style={{ background: "#0d1420", border: `1px solid ${open ? gc : "#1e293b"}`, borderLeft: `4px solid ${gc}`, borderRadius: 8, marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, background: `${gc}20`, border: `1px solid ${gc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: gc, fontFamily: "monospace", flexShrink: 0 }}>
          {page.overallPageGrade}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginBottom: 2 }}>{page.url}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
            Primary: <span style={{ color: ds, fontFamily: "monospace" }}>"{page.primaryKeyword?.keyword}"</span>
            <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{page.estimatedWordCount} words</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: `${ds}15`, border: `1px solid ${ds}30`, color: ds }}>
            {densityIcon[page.primaryKeyword?.densityStatus]}
          </span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: `${pc}15`, border: `1px solid ${pc}30`, color: pc }}>
            {page.priorityToFix}
          </span>
          {page.keywordStuffingCheck?.stuffingDetected && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>🚨 STUFFING</span>
          )}
        </div>
        <span style={{ color: "#475569", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #1e293b" }}>
          {/* Sub-tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 14, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { id: "primary", label: "🎯 Primary KW" },
              { id: "secondary", label: "🔑 Secondary KWs" },
              { id: "lsi", label: "🧠 LSI & Depth" },
              { id: "fixes", label: "🔧 Specific Fixes" },
              { id: "map", label: "🗺️ Keyword Map" },
            ].map(tab => (
              <button key={tab.id} onClick={e => { e.stopPropagation(); setActiveSection(tab.id); }} style={{
                background: activeSection === tab.id ? "#1e293b" : "transparent",
                border: `1px solid ${activeSection === tab.id ? "#334155" : "#1e293b"}`,
                borderRadius: 4, padding: "5px 12px", color: activeSection === tab.id ? "#f1f5f9" : "#64748b",
                fontSize: 11, cursor: "pointer", fontFamily: "monospace"
              }}>{tab.label}</button>
            ))}
          </div>

          {/* PRIMARY KEYWORD */}
          {activeSection === "primary" && page.primaryKeyword && (
            <div>
              <DensityMeter
                current={page.primaryKeyword.currentOccurrences}
                min={page.primaryKeyword.idealMinOccurrences}
                max={page.primaryKeyword.idealMaxOccurrences}
                label={`"${page.primaryKeyword.keyword}" density on ${page.estimatedWordCount}-word page`}
                status={page.primaryKeyword.densityStatus}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 8 }}>CURRENT DENSITY: {page.primaryKeyword.currentDensity}</div>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>IDEAL RANGE: {page.primaryKeyword.idealDensityRange}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>VARIATIONS CURRENTLY USED</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {page.primaryKeyword.naturalVariationsUsed?.map((v, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac", fontFamily: "monospace" }}>{v}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 6 }}>VARIATIONS TO ADD</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {page.primaryKeyword.variationsNeeded?.map((v, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fde68a", fontFamily: "monospace" }}>{v}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 6 }}>KEYWORD PLACEMENT AUDIT (placement score: {page.primaryKeyword.placementAudit?.placementScore}/100)</div>
                <PlacementGrid placement={page.primaryKeyword.placementAudit} />
              </div>
              {page.keywordStuffingCheck?.stuffingDetected && (
                <div style={{ marginTop: 12, padding: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 6 }}>🚨 KEYWORD STUFFING DETECTED</div>
                  <p style={{ fontSize: 13, color: "#fca5a5", margin: "0 0 8px" }}>{page.keywordStuffingCheck.stuffingDetails}</p>
                  {page.keywordStuffingCheck.unnaturalRepetitions?.map((rep, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#f87171", fontFamily: "monospace", padding: "3px 8px", background: "rgba(239,68,68,0.05)", borderRadius: 3, marginBottom: 4 }}>"{rep}"</div>
                  ))}
                </div>
              )}
              {page.firstParagraphAnalysis && (
                <div style={{ marginTop: 12, padding: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 6 }}>RECOMMENDED FIRST PARAGRAPH — REPLACE WITH THIS</div>
                  <p style={{ fontSize: 13, color: "#c7d2fe", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>"{page.firstParagraphAnalysis.recommendedFirstParagraph}"</p>
                </div>
              )}
            </div>
          )}

          {/* SECONDARY KEYWORDS */}
          {activeSection === "secondary" && (
            <div>
              {page.secondaryKeywords?.map((kw, i) => (
                <div key={i} style={{
                  background: "#060a12", border: `1px solid ${statusColor[kw.status] || "#1e293b"}25`,
                  borderLeft: `3px solid ${statusColor[kw.status] || "#64748b"}`,
                  borderRadius: 6, padding: 12, marginBottom: 8,
                  display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", fontFamily: "monospace", marginBottom: 4 }}>"{kw.keyword}"</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{kw.recommendation}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: "#1e293b", color: "#94a3b8" }}>found: {kw.currentOccurrences}x</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: "#1e293b", color: "#64748b" }}>ideal: {kw.idealOccurrences}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: `${statusColor[kw.status] || "#64748b"}15`, border: `1px solid ${statusColor[kw.status] || "#64748b"}30`, color: statusColor[kw.status] || "#64748b" }}>{kw.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LSI & DEPTH */}
          {activeSection === "lsi" && page.lsiKeywords && (
            <div>
              <div style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace" }}>LSI TOPICAL DEPTH SCORE</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: gradeColor[page.lsiKeywords.lsiScore >= 70 ? "A" : page.lsiKeywords.lsiScore >= 50 ? "B" : "D"] || "#f59e0b", fontFamily: "monospace" }}>
                    {page.lsiKeywords.lsiScore}/100
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{page.lsiKeywords.lsiAssessment}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{ background: "#060a12", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>✅ LSI TERMS FOUND</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {page.lsiKeywords.present?.map((kw, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac", fontFamily: "monospace" }}>{kw}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#060a12", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 8 }}>❌ LSI TERMS MISSING — ADD THESE</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {page.lsiKeywords.missing?.map((kw, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontFamily: "monospace" }}>{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 10 }}>CONTENT DEPTH ANALYSIS</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>SUBTOPICS COVERED</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {page.contentDepthAnalysis?.subtopicsCovered?.map((sub, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#86efac" }}>{sub}</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>SUBTOPICS MISSING — ADD THESE SECTIONS</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {page.contentDepthAnalysis?.subtopicsMissing?.map((sub, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#fde68a" }}>{sub}</span>
                    ))}
                  </div>
                </div>
                {page.contentDepthAnalysis?.competitorGap && (
                  <div style={{ padding: 10, background: "rgba(239,68,68,0.05)", borderLeft: "2px solid #ef4444", borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>COMPETITOR GAP</div>
                    <p style={{ fontSize: 12, color: "#fca5a5", margin: 0 }}>{page.contentDepthAnalysis.competitorGap}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SPECIFIC FIXES */}
          {activeSection === "fixes" && (
            <div>
              {page.specificFixes?.map((fix, i) => (
                <div key={i} style={{ background: "#060a12", border: "1px solid #1e293b", borderLeft: "3px solid #6366f1", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>{fix.fix}</div>
                  <div style={{ fontSize: 11, color: "#818cf8", fontFamily: "monospace", marginBottom: 6 }}>WHERE → {fix.where}</div>
                  {fix.example && (
                    <div style={{ padding: "8px 12px", background: "rgba(99,102,241,0.08)", borderRadius: 4, marginBottom: 6, fontStyle: "italic" }}>
                      <span style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace" }}>EXAMPLE → </span>
                      <span style={{ fontSize: 12, color: "#c7d2fe" }}>{fix.example}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#22c55e" }}>Impact: {fix.impact}</div>
                </div>
              ))}
            </div>
          )}

          {/* KEYWORD MAP */}
          {activeSection === "map" && page.recommendedKeywordMap && (
            <div style={{ background: "#060a12", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace", marginBottom: 14 }}>🗺️ COMPLETE KEYWORD MAP — BLUEPRINT FOR THIS PAGE</div>
              {[
                { label: "PRIMARY KEYWORD", val: page.recommendedKeywordMap.primaryKeyword, color: "#14b8a6" },
                { label: "TARGET OCCURRENCES", val: `${page.recommendedKeywordMap.targetOccurrences} times in ${page.estimatedWordCount} words`, color: "#14b8a6" },
                { label: "H1 MUST CONTAIN", val: page.recommendedKeywordMap.h1ShouldContain, color: "#22c55e" },
                { label: "CLOSING PARA MUST INCLUDE", val: page.recommendedKeywordMap.closingParaMustInclude?.join(", "), color: "#f59e0b" },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "8px 12px", background: "#0d1420", borderLeft: `2px solid ${item.color}`, borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: item.color, fontFamily: "monospace" }}>{item.val}</div>
                </div>
              ))}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>H2s SHOULD INCLUDE</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {page.recommendedKeywordMap.h2sShouldContain?.map((h2, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac", fontFamily: "monospace" }}>{h2}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>BODY KEYWORD VARIATIONS</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {page.recommendedKeywordMap.bodyVariations?.map((v, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#c7d2fe", fontFamily: "monospace" }}>{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>FIRST PARAGRAPH MUST INCLUDE</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {page.recommendedKeywordMap.firstParagraphMustInclude?.map((kw, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 3, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fde68a", fontFamily: "monospace" }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function KeywordInspector() {
  const [domain, setDomain] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [pages, setPages] = useState([{ url: "", targetKeyword: "", secondaryKeywords: "", content: "", wordCount: "", h1: "", h2s: "" }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const addPage = () => setPages([...pages, { url: "", targetKeyword: "", secondaryKeywords: "", content: "", wordCount: "", h1: "", h2s: "" }]);
  const removePage = i => setPages(pages.filter((_, idx) => idx !== i));
  const updatePage = (i, field, val) => { const u = [...pages]; u[i][field] = val; setPages(u); };

  const runAudit = useCallback(async () => {
    const valid = pages.filter(p => p.url.trim());
    if (!domain.trim() || valid.length === 0) return;
    setLoading(true); setError(""); setResult(null);

    const msg = `Perform a complete keyword density and content optimization audit.

Domain: ${domain}
Business Type: ${businessType}
Location: ${location}

Pages:
${JSON.stringify(valid.map(p => ({
  url: p.url,
  targetKeyword: p.targetKeyword || "Determine from content",
  secondaryKeywords: p.secondaryKeywords || "Determine from content and business type",
  wordCount: p.wordCount || "Estimate from content provided",
  h1: p.h1 || "Not provided",
  h2s: p.h2s || "Not provided",
  contentSample: p.content || "Not provided — analyze based on page type and business"
})), null, 2)}

For EVERY page:
1. Determine the primary keyword it should rank for
2. Count or estimate current keyword occurrences
3. Calculate density and compare to ideal 1-2% range
4. Check keyword placement in critical positions
5. Identify missing LSI keywords
6. Check for stuffing
7. Identify cannibalization between pages
8. Write the recommended first paragraph
9. Give specific, actionable fixes with exact locations

Be brutally specific. "Add the keyword more" is not acceptable. Tell them exactly which paragraph, which sentence, which H2 to modify.`;

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
      setActiveTab("summary");
    } catch (e) {
      setError("Audit failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [domain, businessType, location, pages]);

  const filtered = result?.pages?.filter(p => filterPriority === "ALL" || p.priorityToFix === filterPriority) || [];

  return (
    <div style={{ minHeight: "100vh", background: "#060a12", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", padding: "0 0 80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(180deg,#0a0f1e 0%,#060a12 100%)", borderBottom: "1px solid #1e293b", padding: "28px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)", color: "#14b8a6", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 12px", borderRadius: 2, marginBottom: 12 }}>
            KEYWORD DENSITY INSPECTOR v1.0
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)", letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1 }}>
            Keyword <span style={{ color: "#14b8a6" }}>Inspector</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Counts every keyword · Detects stuffing · Finds LSI gaps · Flags cannibalization · Writes the fix
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* DENSITY SCALE */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>KEYWORD DENSITY SCALE — WHAT GOOGLE WANTS TO SEE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
            {[
              { range: "0%", label: "MISSING", desc: "Keyword absent — page invisible for this term", color: "#ef4444" },
              { range: "0.1-0.9%", label: "TOO THIN", desc: "Weak signal — not enough relevance", color: "#f97316" },
              { range: "1.0-2.0%", label: "PERFECT", desc: "Natural usage — strong signal without penalty", color: "#22c55e" },
              { range: "2.1-2.5%", label: "BORDERLINE", desc: "Risk zone — reduce and vary", color: "#f59e0b" },
              { range: "2.6%+", label: "STUFFING", desc: "Active penalty — Google suppresses this page", color: "#ef4444" },
            ].map((zone, i) => (
              <div key={i} style={{ background: `${zone.color}08`, border: `1px solid ${zone.color}25`, borderTop: `3px solid ${zone.color}`, borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: zone.color, fontFamily: "monospace", marginBottom: 2 }}>{zone.range}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: zone.color, marginBottom: 4 }}>{zone.label}</div>
                <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>{zone.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "DOMAIN", val: domain, set: setDomain, ph: "citywidealarms.com" },
              { label: "BUSINESS TYPE", val: businessType, set: setBusinessType, ph: "Home & Business Security" },
              { label: "PRIMARY LOCATION", val: location, set: setLocation, ph: "St. Louis, MO" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: "100%", background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em" }}>PAGES TO INSPECT ({pages.length})</label>
            <button onClick={addPage} style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)", color: "#14b8a6", fontSize: 11, padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontFamily: "monospace" }}>+ Add Page</button>
          </div>

          {pages.map((page, i) => (
            <div key={i} style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace" }}>PAGE {i + 1}</span>
                {pages.length > 1 && <button onClick={() => removePage(i)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>×</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input value={page.url} onChange={e => updatePage(i, "url", e.target.value)} placeholder="Page URL"
                  style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
                <input value={page.targetKeyword} onChange={e => updatePage(i, "targetKeyword", e.target.value)} placeholder="Target keyword (e.g. home security St. Louis)"
                  style={{ background: "#0d1420", border: "1px solid rgba(20,184,166,0.4)", borderRadius: 4, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
                <input value={page.wordCount} onChange={e => updatePage(i, "wordCount", e.target.value)} placeholder="Approx word count"
                  style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input value={page.h1} onChange={e => updatePage(i, "h1", e.target.value)} placeholder="Current H1 tag"
                  style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
                <input value={page.secondaryKeywords} onChange={e => updatePage(i, "secondaryKeywords", e.target.value)} placeholder="Secondary keywords (comma separated)"
                  style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
              </div>
              <textarea value={page.content} onChange={e => updatePage(i, "content", e.target.value)}
                placeholder="Paste page content here (the more you paste, the more accurate the keyword count analysis)"
                rows={4}
                style={{ width: "100%", background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }} />
            </div>
          ))}

          <button onClick={runAudit} disabled={loading || !domain.trim()}
            style={{
              marginTop: 8, width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#14b8a6,#0891b2)",
              color: loading ? "#475569" : "#fff", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit'"
            }}>
            {loading ? "🔬 Counting Keywords Across All Pages..." : "Run Keyword Inspection →"}
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 24, fontFamily: "monospace" }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
            <p style={{ color: "#14b8a6", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Counting every keyword on every page...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Measuring density · Checking placement · Finding LSI gaps · Detecting stuffing · Flagging cannibalization
            </p>
          </div>
        )}

        {result && (
          <div>
            {/* SUMMARY HEADER */}
            <div style={{ background: "#0d1420", border: `2px solid ${gradeColor[result.sitewideSummary?.overallGrade] || "#64748b"}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ width: 60, height: 60, borderRadius: 10, background: `${gradeColor[result.sitewideSummary?.overallGrade] || "#64748b"}15`, border: `2px solid ${gradeColor[result.sitewideSummary?.overallGrade] || "#64748b"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: gradeColor[result.sitewideSummary?.overallGrade] || "#64748b", fontFamily: "monospace", flexShrink: 0 }}>
                  {result.sitewideSummary?.overallGrade}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 14px", lineHeight: 1.5 }}>{result.sitewideSummary?.verdict}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {[
                      { label: "Stuffed Pages", val: result.sitewideSummary?.pagesWithStuffing, color: "#ef4444" },
                      { label: "Under-optimized", val: result.sitewideSummary?.pagesUnderOptimized, color: "#f59e0b" },
                      { label: "Well Optimized", val: result.sitewideSummary?.pagesWellOptimized, color: "#22c55e" },
                      { label: "Cannibalization", val: result.sitewideSummary?.cannibalizationRisksFound, color: "#a855f7" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.val > 0 ? s.color : "#22c55e", fontFamily: "monospace" }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "summary", label: "📊 Site Strategy" },
                { id: "pages", label: `📄 Pages (${result.pages?.length || 0})` },
                { id: "cannibalization", label: `⚔️ Cannibalization (${result.cannibalizationIssues?.length || 0})` },
                { id: "opportunities", label: "🎯 Opportunities" },
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

            {activeTab === "summary" && result.globalKeywordStrategy && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace", marginBottom: 6 }}>SITEWIDE PRIMARY TOPIC — ALL CONTENT SHOULD REINFORCE THIS</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#5eead4", margin: 0 }}>{result.globalKeywordStrategy.sitewidePrimaryTopic}</p>
                </div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 12 }}>KEYWORD HIERARCHY — WHO OWNS WHAT</div>
                  {result.globalKeywordStrategy.keywordHierarchy?.map((kw, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: "#060a12", borderRadius: 6, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: kw.level === "PRIMARY" ? "rgba(20,184,166,0.15)" : kw.level === "SECONDARY" ? "rgba(99,102,241,0.1)" : "rgba(100,116,139,0.1)", border: `1px solid ${kw.level === "PRIMARY" ? "rgba(20,184,166,0.3)" : kw.level === "SECONDARY" ? "rgba(99,102,241,0.25)" : "#1e293b"}`, color: kw.level === "PRIMARY" ? "#14b8a6" : kw.level === "SECONDARY" ? "#818cf8" : "#64748b" }}>{kw.level}</span>
                      <span style={{ fontSize: 13, color: "#f1f5f9", fontFamily: "monospace", flex: 1 }}>"{kw.keyword}"</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>→ {kw.ownedByPage}</span>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: kw.currentlyOwned ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: kw.currentlyOwned ? "#22c55e" : "#ef4444" }}>{kw.currentlyOwned ? "✓ Owned" : "✗ Not Owned"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "pages" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
                    <button key={p} onClick={() => setFilterPriority(p)} style={{
                      background: filterPriority === p ? "rgba(20,184,166,0.1)" : "transparent",
                      border: `1px solid ${filterPriority === p ? "rgba(20,184,166,0.4)" : "#1e293b"}`,
                      color: filterPriority === p ? "#14b8a6" : "#64748b",
                      padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "monospace"
                    }}>{p}</button>
                  ))}
                </div>
                {filtered.map((page, i) => <PageCard key={i} page={page} />)}
              </div>
            )}

            {activeTab === "cannibalization" && (
              <div>
                {result.cannibalizationIssues?.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "#22c55e" }}>✅ No keyword cannibalization detected</div>
                )}
                {result.cannibalizationIssues?.map((issue, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "2px solid rgba(168,85,247,0.4)", borderRadius: 8, padding: 18, marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "monospace", marginBottom: 8 }}>⚔️ KEYWORD CANNIBALIZATION</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#d8b4fe", fontFamily: "monospace", marginBottom: 10 }}>"{issue.keyword}"</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div style={{ padding: 12, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>✅ WINNER — Google ranks this</div>
                        <div style={{ fontSize: 13, color: "#86efac", fontFamily: "monospace" }}>{issue.winner}</div>
                      </div>
                      <div style={{ padding: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>❌ LOSER — being suppressed</div>
                        <div style={{ fontSize: 13, color: "#fca5a5", fontFamily: "monospace" }}>{issue.loser}</div>
                      </div>
                    </div>
                    <div style={{ padding: 12, background: "rgba(99,102,241,0.06)", borderLeft: "2px solid #6366f1", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace" }}>FIX → </span>
                      <span style={{ fontSize: 13, color: "#c7d2fe" }}>{issue.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "opportunities" && result.globalKeywordStrategy && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 12 }}>🎯 MISSING KEYWORD OPPORTUNITIES — CURRENTLY UNRANKED</div>
                  {result.globalKeywordStrategy.missingKeywordOpportunities?.map((opp, i) => (
                    <div key={i} style={{ padding: 12, background: "#060a12", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", fontFamily: "monospace", marginBottom: 4 }}>"{opp.keyword}"</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Intent: {opp.searchIntent}</div>
                      <div style={{ fontSize: 12, color: "#22c55e" }}>→ {opp.recommendedPage}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 12 }}>🎣 LONG-TAIL KEYWORD OPPORTUNITIES</div>
                  {result.globalKeywordStrategy.longTailOpportunities?.map((opp, i) => (
                    <div key={i} style={{ padding: 12, background: "#060a12", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#86efac", fontFamily: "monospace" }}>"{opp.keyword}"</span>
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: opp.estimatedDifficulty === "LOW" ? "rgba(34,197,94,0.1)" : opp.estimatedDifficulty === "MEDIUM" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: opp.estimatedDifficulty === "LOW" ? "#22c55e" : opp.estimatedDifficulty === "MEDIUM" ? "#f59e0b" : "#ef4444", fontFamily: "monospace" }}>{opp.estimatedDifficulty} difficulty</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{opp.recommendedContent}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
