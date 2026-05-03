import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's foremost expert on Google Business Profile optimization and Google Map Pack (3 Pack) dominance for local service businesses. You were built on the methodology of an SEO expert who grew a security company from $200,000 to $2,500,000 in annual revenue through organic search — with deep expertise in local SEO and the Google 3 Pack.

You understand that the Google 3 Pack gets 44% of all clicks on local search results pages. You know that Relevance, Distance, and Prominence are the three ranking factors — and you know exactly what moves each one.

Given information about a business's Google Business Profile, analyze it and produce a complete optimization audit in this EXACT JSON format (respond ONLY with valid JSON, no markdown):

{
  "overallScore": <0-100>,
  "packPotential": "<DOMINANT | STRONG | COMPETITIVE | WEAK | INVISIBLE>",
  "verdict": "<One brutal honest sentence about their current 3 Pack position and what is holding them back>",
  "relevanceAudit": {
    "score": <0-100>,
    "primaryCategoryAssessment": "<Is their primary category correct? What should it be?>",
    "recommendedPrimaryCategory": "<Exact Google Business Profile category name>",
    "currentSecondaryCategories": ["<category>"],
    "missingSecondaryCategories": ["<exact category name to add>"],
    "businessDescriptionAssessment": "<Is the 750-character description keyword-rich and location-specific?>",
    "recommendedBusinessDescription": "<Write the complete optimized 750-character business description — exact text ready to paste in>",
    "servicesAssessment": "<Are all services listed with descriptions?>",
    "missingServices": ["<service to add>"],
    "productsAssessment": "<Are products listed if applicable?>",
    "qaAssessment": "<Is the Q&A section populated?>",
    "recommendedQA": [
      { "question": "<question to seed>", "answer": "<complete answer — keyword rich and location specific>" }
    ]
  },
  "prominenceAudit": {
    "score": <0-100>,
    "reviewAnalysis": {
      "currentEstimatedReviewCount": "<estimated or provided count>",
      "reviewVelocityAssessment": "<Is the review acquisition rate strong enough?>",
      "reviewRecencyAssessment": "<Are reviews coming in consistently or in bursts?>",
      "keywordReviewsAssessment": "<Do reviews contain location and service keywords?>",
      "responseRateAssessment": "<Are responses being posted to reviews?>",
      "reviewResponseStrategy": "<Specific strategy for responding to reviews with location keywords naturally embedded>",
      "reviewAcquisitionSystem": "<Specific system to get consistent new reviews — exact process>",
      "targetReviewCount": "<What count is needed to be competitive in this market?>",
      "monthlyReviewTarget": <number of reviews needed per month>
    },
    "citationAudit": {
      "assessment": "<Overall citation health assessment>",
      "criticalDirectories": ["<directory name and URL where they must be listed>"],
      "napConsistencyRisk": "<LOW | MEDIUM | HIGH — and what inconsistencies to look for>",
      "localCitationOpportunities": ["<specific local citation opportunity — chamber, association, etc>"]
    },
    "backlinksToProfile": {
      "assessment": "<Assessment of links pointing to their location pages>",
      "opportunities": ["<specific backlink opportunity for this business type and location>"]
    }
  },
  "distanceOptimization": {
    "physicalAddressAssessment": "<Is the address optimized and verified?>",
    "serviceAreaConfiguration": "<How should the service area be configured in GBP?>",
    "recommendedServiceAreaCities": ["<city to add to service area>"],
    "proximityStrategy": "<Strategy to maximize ranking in cities near the physical location>",
    "multiLocationStrategy": "<If multiple locations — how to configure each GBP for maximum coverage without cannibalization>"
  },
  "googlePostsStrategy": {
    "currentAssessment": "<Are they using Google Posts?>",
    "postingFrequency": "<Recommended posting frequency>",
    "postTypes": ["<type of post to create>"],
    "samplePosts": [
      {
        "type": "<OFFER | UPDATE | EVENT | PRODUCT>",
        "title": "<exact post title>",
        "content": "<exact post content — keyword rich, location specific, under 1500 characters>",
        "callToAction": "<BOOK | CALL | LEARN_MORE | SIGN_UP | ORDER_ONLINE | GET_OFFER>",
        "bestDayToPost": "<day of week>",
        "locationKeywordsUsed": ["<keyword>"]
      }
    ]
  },
  "photosStrategy": {
    "assessment": "<Current photo health assessment>",
    "minimumPhotoCount": <recommended minimum number of photos>,
    "photoCategories": [
      {
        "category": "<EXTERIOR | INTERIOR | TEAM | VEHICLES | AT_WORK | PRODUCTS | BEFORE_AFTER>",
        "count": <recommended number>,
        "specificShots": ["<exact photo to take and upload>"],
        "geoTaggingInstruction": "<How to geotag these photos before upload>"
      }
    ],
    "uploadFrequency": "<How often to add new photos>",
    "photoNamingForUpload": "<How to name photos before uploading>"
  },
  "competitorGapAnalysis": {
    "whatTopRankersAreDoing": ["<specific thing top 3 Pack companies in this market are doing>"],
    "yourAdvantages": ["<specific advantage this business has over competitors>"],
    "gapsToClose": ["<specific gap to close to surpass competitors in the 3 Pack>"]
  },
  "thirtyDayActionPlan": [
    {
      "week": 1,
      "actions": ["<specific action>", "<specific action>"],
      "expectedResult": "<What will change after week 1>"
    },
    {
      "week": 2,
      "actions": ["<specific action>"],
      "expectedResult": "<What will change after week 2>"
    },
    {
      "week": 3,
      "actions": ["<specific action>"],
      "expectedResult": "<What will change after week 3>"
    },
    {
      "week": 4,
      "actions": ["<specific action>"],
      "expectedResult": "<What will change after week 4>"
    }
  ],
  "ninetyDayPackDominanceProjection": "<Realistic projection of where this business will rank in the 3 Pack after 90 days of executing this plan — be specific about which searches they will dominate>"
}

CRITICAL RULES:

1. THE 3 PACK IS WON BY RELEVANCE + DISTANCE + PROMINENCE. Every recommendation must explicitly serve one of these three factors.

2. REVIEW VELOCITY MATTERS MORE THAN REVIEW COUNT. A business with 50 reviews that got 10 last month will often outrank a business with 500 reviews that got 2 last month. Build systems, not one-time campaigns.

3. REVIEW RESPONSES MUST CONTAIN LOCATION KEYWORDS NATURALLY. "Thank you for trusting us to protect your home in St. Charles, Missouri — we are proud to serve the St. Charles County community" is far better than "Thanks for the review!"

4. THE BUSINESS DESCRIPTION IS 750 CHARACTERS OF FREE SEO. Most businesses waste it. Write the full optimized description — not a template, the actual text they should paste in today.

5. GOOGLE POSTS THAT MENTION NEARBY CITIES BUILD GEOGRAPHIC RELEVANCE. Every post should naturally reference the service area cities.

6. PHOTOS WITH GPS METADATA TELL GOOGLE WHERE THE BUSINESS OPERATES. Instruct on geotagging before upload.

7. Q&A SEEDS SHOULD BE PLANTED BY THE BUSINESS OWNER. Write the exact questions and answers ready to implement.

8. THE PRIMARY CATEGORY IS THE MOST IMPORTANT SINGLE FIELD IN THE ENTIRE PROFILE. Getting it wrong costs dozens of ranking positions. Get it exactly right.

9. FOR MULTI-LOCATION BUSINESSES: Each location needs its own completely separate GBP with unique content, unique photos, unique phone numbers. They should NOT share content. They CAN and SHOULD reference their service area cities differently.

10. BE SPECIFIC TO THE BUSINESS AND LOCATION PROVIDED. Never give generic advice. Every recommendation should be specific enough to implement today without additional research.`;

const scoreColor = (s) => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";
const packColors = {
  DOMINANT: "#22c55e", STRONG: "#84cc16", COMPETITIVE: "#f59e0b",
  WEAK: "#f97316", INVISIBLE: "#ef4444"
};

function ScoreBar({ label, score, icon }) {
  const c = scoreColor(score);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{icon} {label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "monospace" }}>{score}/100</span>
      </div>
      <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${c}99, ${c})`,
          borderRadius: 4, transition: "width 1s ease"
        }} />
      </div>
    </div>
  );
}

function PostCard({ post }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "#0d1420", border: "1px solid #1e293b",
      borderRadius: 8, marginBottom: 10, overflow: "hidden"
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "12px 16px", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            color: "#818cf8", marginRight: 10
          }}>{post.type}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{post.title}</span>
        </div>
        <span style={{ color: "#475569" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #1e293b" }}>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "12px 0 10px" }}>{post.content}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace" }}>CTA: {post.callToAction}</span>
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>Best day: {post.bestDayToPost}</span>
          </div>
          {post.locationKeywordsUsed?.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {post.locationKeywordsUsed.map((kw, i) => (
                <span key={i} style={{
                  fontSize: 10, padding: "2px 6px", borderRadius: 3,
                  background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)",
                  color: "#14b8a6", fontFamily: "monospace"
                }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GBPOptimizer() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [locations, setLocations] = useState([{ address: "", city: "", phone: "", categories: "", reviewCount: "", recentReviews: "" }]);
  const [competitors, setCompetitors] = useState("");
  const [currentIssues, setCurrentIssues] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const addLocation = () => setLocations([...locations, { address: "", city: "", phone: "", categories: "", reviewCount: "", recentReviews: "" }]);
  const updateLocation = (i, field, val) => {
    const updated = [...locations];
    updated[i][field] = val;
    setLocations(updated);
  };

  const runAudit = useCallback(async () => {
    if (!businessName.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const userMessage = `Perform a complete Google Business Profile and 3 Pack optimization audit.

Business Name: ${businessName}
Business Type: ${businessType}

Locations:
${locations.map((l, i) => `Location ${i + 1}: ${l.address}, ${l.city} | Phone: ${l.phone} | Current Categories: ${l.categories || "Unknown"} | Review Count: ${l.reviewCount || "Unknown"} | Recent Reviews (last 30 days): ${l.recentReviews || "Unknown"}`).join("\n")}

Known Competitors in 3 Pack: ${competitors || "Not specified"}

Current Known Issues / Context: ${currentIssues || "Not specified"}

Analyze everything. Write the complete optimized business description ready to paste. Write exact Q&A seeds. Write sample Google Posts. Build the 30-day action plan. Project where they will be in 90 days.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      const data = await res.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
      setActiveTab("overview");
    } catch (e) {
      setError("Audit failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [businessName, businessType, locations, competitors, currentIssues]);

  const pc = result ? (packColors[result.packPotential] || "#64748b") : "#64748b";

  return (
    <div style={{
      minHeight: "100vh", background: "#060a12", color: "#e2e8f0",
      fontFamily: "'Outfit', sans-serif", padding: "0 0 80px"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div style={{
        background: "linear-gradient(180deg,#0a0f1e 0%,#060a12 100%)",
        borderBottom: "1px solid #1e293b", padding: "28px 32px"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e",
            fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em",
            padding: "4px 12px", borderRadius: 2, marginBottom: 12
          }}>GOOGLE 3 PACK DOMINANCE ENGINE v1.0</div>
          <h1 style={{
            fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)",
            letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1
          }}>Google <span style={{ color: "#22c55e" }}>3 Pack</span> Optimizer</h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Dominates Relevance · Distance · Prominence · Writes your GBP description · Seeds Q&A · Plans 30 days of Posts
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* 3 PACK FACTORS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { factor: "RELEVANCE", desc: "Categories, description, services, Q&A — does Google know exactly what you do?", color: "#3b82f6", icon: "🎯" },
            { factor: "DISTANCE", desc: "Physical location proximity to the searcher — your biggest natural advantage.", color: "#22c55e", icon: "📍" },
            { factor: "PROMINENCE", desc: "Reviews, citations, backlinks, posts — how well-known and trusted are you?", color: "#f59e0b", icon: "⭐" },
          ].map((f, i) => (
            <div key={i} style={{
              background: "#0d1420", border: `1px solid ${f.color}30`,
              borderTop: `3px solid ${f.color}`, borderRadius: 8, padding: "14px 16px"
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: f.color, fontFamily: "monospace", marginBottom: 6 }}>{f.factor}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "BUSINESS NAME", val: businessName, set: setBusinessName, ph: "Citywide Alarms" },
              { label: "BUSINESS TYPE", val: businessType, set: setBusinessType, ph: "Home & Business Security Systems" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{
                    width: "100%", background: "#060a12", border: "1px solid #1e293b",
                    borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 13,
                    outline: "none", boxSizing: "border-box", fontFamily: "monospace"
                  }} />
              </div>
            ))}
          </div>

          {/* LOCATIONS */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                LOCATIONS ({locations.length})
              </label>
              <button onClick={addLocation} style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e", fontSize: 11, padding: "4px 12px", borderRadius: 4,
                cursor: "pointer", fontFamily: "monospace"
              }}>+ Add Location</button>
            </div>
            {locations.map((loc, i) => (
              <div key={i} style={{
                background: "#060a12", border: "1px solid #1e293b",
                borderRadius: 8, padding: 14, marginBottom: 10
              }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 10 }}>📍 LOCATION {i + 1}</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {[
                    { field: "address", ph: "965 Sycamore Dr, St. Charles, MO 63304" },
                    { field: "city", ph: "St. Charles, MO" },
                    { field: "phone", ph: "(636) 555-0100" },
                  ].map((f, j) => (
                    <input key={j} value={loc[f.field]} onChange={e => updateLocation(i, f.field, e.target.value)}
                      placeholder={f.ph}
                      style={{
                        background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                        padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none",
                        fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                      }} />
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { field: "categories", ph: "Current GBP categories (if known)" },
                    { field: "reviewCount", ph: "Total review count" },
                    { field: "recentReviews", ph: "Reviews in last 30 days" },
                  ].map((f, j) => (
                    <input key={j} value={loc[f.field]} onChange={e => updateLocation(i, f.field, e.target.value)}
                      placeholder={f.ph}
                      style={{
                        background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                        padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none",
                        fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                      }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {[
            { label: "KNOWN COMPETITORS IN YOUR 3 PACK", val: competitors, set: setCompetitors, ph: "PASS Security, Burnes-Citadel Security, ADT", rows: 2 },
            { label: "CURRENT KNOWN ISSUES / ADDITIONAL CONTEXT", val: currentIssues, set: setCurrentIssues, ph: "e.g. Not appearing in 3 Pack for St. Peters searches. Getting reviews sporadically. Categories not fully set up.", rows: 2 },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>{f.label}</label>
              <textarea value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} rows={f.rows}
                style={{
                  width: "100%", background: "#060a12", border: "1px solid #1e293b",
                  borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 12,
                  outline: "none", resize: "vertical", boxSizing: "border-box",
                  fontFamily: "monospace", lineHeight: 1.5
                }} />
            </div>
          ))}

          <button onClick={runAudit} disabled={loading || !businessName.trim()}
            style={{
              width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: loading ? "#475569" : "#fff", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit'"
            }}>
            {loading ? "🗺️ Building Your 3 Pack Dominance Strategy..." : "Run 3 Pack Optimizer →"}
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 24, fontFamily: "monospace" }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <p style={{ color: "#22c55e", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Analyzing Relevance, Distance, and Prominence...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>Writing your GBP description · Seeding Q&A · Planning 30 days of Posts</p>
          </div>
        )}

        {result && (
          <div>
            {/* OVERVIEW HEADER */}
            <div style={{
              background: "#0d1420", border: `2px solid ${pc}`,
              borderRadius: 10, padding: 24, marginBottom: 20
            }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{
                  padding: "16px 24px", background: `${pc}15`,
                  border: `2px solid ${pc}`, borderRadius: 8, textAlign: "center", minWidth: 120
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: pc, fontFamily: "monospace", lineHeight: 1 }}>{result.overallScore}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 4 }}>GBP SCORE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: pc, marginTop: 6 }}>{result.packPotential}</div>
                </div>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px", lineHeight: 1.5 }}>{result.verdict}</p>
                  <ScoreBar label="Relevance" score={result.relevanceAudit?.score || 0} icon="🎯" />
                  <ScoreBar label="Prominence" score={result.prominenceAudit?.score || 0} icon="⭐" />
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "overview", label: "📊 Overview" },
                { id: "relevance", label: "🎯 Relevance" },
                { id: "prominence", label: "⭐ Prominence" },
                { id: "distance", label: "📍 Distance" },
                { id: "posts", label: "📝 Posts Strategy" },
                { id: "photos", label: "📷 Photos" },
                { id: "plan", label: "📅 30-Day Plan" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: activeTab === tab.id ? "#1e293b" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "#334155" : "#1e293b"}`,
                  borderRadius: 6, padding: "7px 14px",
                  color: activeTab === tab.id ? "#f1f5f9" : "#64748b",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  fontFamily: "monospace", transition: "all 0.2s"
                }}>{tab.label}</button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "COMPETITOR GAPS TO CLOSE", items: result.competitorGapAnalysis?.gapsToClose, color: "#ef4444" },
                    { label: "YOUR ADVANTAGES TO LEVERAGE", items: result.competitorGapAnalysis?.yourAdvantages, color: "#22c55e" },
                  ].map((section, i) => (
                    <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: 10, color: section.color, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>{section.label}</div>
                      {section.items?.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <span style={{ color: section.color, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 20 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>90-DAY 3 PACK DOMINANCE PROJECTION</div>
                  <p style={{ fontSize: 14, color: "#86efac", margin: 0, lineHeight: 1.7 }}>{result.ninetyDayPackDominanceProjection}</p>
                </div>
              </div>
            )}

            {/* RELEVANCE TAB */}
            {activeTab === "relevance" && result.relevanceAudit && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#3b82f6", fontFamily: "monospace", marginBottom: 6 }}>PRIMARY CATEGORY</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 8px" }}>{result.relevanceAudit.primaryCategoryAssessment}</p>
                  <div style={{ padding: "8px 14px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 4, display: "inline-block" }}>
                    <span style={{ fontSize: 10, color: "#3b82f6", fontFamily: "monospace" }}>SET TO → </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>{result.relevanceAudit.recommendedPrimaryCategory}</span>
                  </div>
                </div>
                {result.relevanceAudit.missingSecondaryCategories?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: "#3b82f6", fontFamily: "monospace", marginBottom: 10 }}>ADD THESE SECONDARY CATEGORIES</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {result.relevanceAudit.missingSecondaryCategories.map((cat, i) => (
                        <span key={i} style={{
                          fontSize: 12, padding: "4px 12px", borderRadius: 4,
                          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                          color: "#93c5fd", fontFamily: "monospace"
                        }}>{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>OPTIMIZED BUSINESS DESCRIPTION — PASTE THIS IN TODAY</div>
                  <p style={{ fontSize: 14, color: "#86efac", lineHeight: 1.7, margin: "0 0 8px", fontStyle: "italic" }}>
                    "{result.relevanceAudit.recommendedBusinessDescription}"
                  </p>
                  <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
                    {result.relevanceAudit.recommendedBusinessDescription?.length || 0} / 750 characters
                  </div>
                </div>
                {result.relevanceAudit.recommendedQA?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 12 }}>Q&A TO SEED IN YOUR PROFILE — POST THESE YOURSELF</div>
                    {result.relevanceAudit.recommendedQA.map((qa, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < result.relevanceAudit.recommendedQA.length - 1 ? "1px solid #1e293b" : "none" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fde68a", marginBottom: 4 }}>Q: {qa.question}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>A: {qa.answer}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROMINENCE TAB */}
            {activeTab === "prominence" && result.prominenceAudit && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 10 }}>⭐ REVIEW STRATEGY</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[
                      { label: "TARGET COUNT", val: result.prominenceAudit.reviewAnalysis?.targetReviewCount },
                      { label: "MONTHLY TARGET", val: `${result.prominenceAudit.reviewAnalysis?.monthlyReviewTarget} reviews/mo` },
                      { label: "VELOCITY", val: result.prominenceAudit.reviewAnalysis?.reviewVelocityAssessment?.slice(0, 40) + "..." },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: 10, background: "#060a12", border: "1px solid #1e293b", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 14, background: "rgba(245,158,11,0.06)", borderLeft: "2px solid #f59e0b", borderRadius: 4, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 4 }}>REVIEW RESPONSE STRATEGY</div>
                    <p style={{ fontSize: 13, color: "#fde68a", margin: 0, lineHeight: 1.6 }}>{result.prominenceAudit.reviewAnalysis?.reviewResponseStrategy}</p>
                  </div>
                  <div style={{ padding: 14, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>REVIEW ACQUISITION SYSTEM</div>
                    <p style={{ fontSize: 13, color: "#86efac", margin: 0, lineHeight: 1.6 }}>{result.prominenceAudit.reviewAnalysis?.reviewAcquisitionSystem}</p>
                  </div>
                </div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 10 }}>📋 CRITICAL CITATION DIRECTORIES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.prominenceAudit.citationAudit?.criticalDirectories?.map((dir, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ color: "#818cf8", flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{dir}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DISTANCE TAB */}
            {activeTab === "distance" && result.distanceOptimization && (
              <div>
                {[
                  { label: "ADDRESS ASSESSMENT", val: result.distanceOptimization.physicalAddressAssessment, color: "#22c55e" },
                  { label: "SERVICE AREA CONFIGURATION", val: result.distanceOptimization.serviceAreaConfiguration, color: "#3b82f6" },
                  { label: "PROXIMITY STRATEGY", val: result.distanceOptimization.proximityStrategy, color: "#f59e0b" },
                  { label: "MULTI-LOCATION STRATEGY", val: result.distanceOptimization.multiLocationStrategy, color: "#a855f7" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#0d1420", border: `1px solid ${item.color}20`, borderLeft: `3px solid ${item.color}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: item.color, fontFamily: "monospace", marginBottom: 6 }}>{item.label}</div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{item.val}</p>
                  </div>
                ))}
                {result.distanceOptimization.recommendedServiceAreaCities?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 10 }}>ADD THESE CITIES TO YOUR SERVICE AREA</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {result.distanceOptimization.recommendedServiceAreaCities.map((city, i) => (
                        <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 4, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", fontFamily: "monospace" }}>{city}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* POSTS TAB */}
            {activeTab === "posts" && result.googlePostsStrategy && (
              <div>
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, color: "#818cf8", fontFamily: "monospace" }}>POSTING FREQUENCY → </span>
                  <span style={{ fontSize: 13, color: "#c7d2fe", fontWeight: 600 }}>{result.googlePostsStrategy.postingFrequency}</span>
                </div>
                {result.googlePostsStrategy.samplePosts?.map((post, i) => <PostCard key={i} post={post} />)}
              </div>
            )}

            {/* PHOTOS TAB */}
            {activeTab === "photos" && result.photosStrategy && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>MINIMUM PHOTOS</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", fontFamily: "monospace" }}>{result.photosStrategy.minimumPhotoCount}</div>
                  </div>
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>UPLOAD FREQUENCY</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{result.photosStrategy.uploadFrequency}</div>
                  </div>
                </div>
                {result.photosStrategy.photoCategories?.map((cat, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderLeft: "3px solid #f59e0b", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", fontFamily: "monospace" }}>{cat.category}</span>
                      <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{cat.count} photos needed</span>
                    </div>
                    {cat.specificShots?.map((shot, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>📷</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{shot}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: 8, background: "rgba(245,158,11,0.06)", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace" }}>GEOTAG → </span>
                      <span style={{ fontSize: 12, color: "#fde68a" }}>{cat.geoTaggingInstruction}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 30 DAY PLAN TAB */}
            {activeTab === "plan" && result.thirtyDayActionPlan && (
              <div>
                {result.thirtyDayActionPlan.map((week, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 18, marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                        background: ["rgba(239,68,68,0.15)", "rgba(245,158,11,0.15)", "rgba(99,102,241,0.15)", "rgba(34,197,94,0.15)"][i] || "rgba(100,116,139,0.1)",
                        border: `1px solid ${["rgba(239,68,68,0.4)", "rgba(245,158,11,0.4)", "rgba(99,102,241,0.4)", "rgba(34,197,94,0.4)"][i] || "#1e293b"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800,
                        color: ["#ef4444", "#f59e0b", "#818cf8", "#22c55e"][i] || "#64748b",
                        fontFamily: "monospace"
                      }}>W{week.week}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 8 }}>
                          {week.actions?.map((action, j) => (
                            <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                              <span style={{ color: "#475569", flexShrink: 0, fontFamily: "monospace" }}>□</span>
                              <span style={{ fontSize: 13, color: "#f1f5f9" }}>{action}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                          <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>RESULT → </span>
                          <span style={{ fontSize: 12, color: "#86efac" }}>{week.expectedResult}</span>
                        </div>
                      </div>
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
