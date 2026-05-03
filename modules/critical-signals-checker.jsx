import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's most specialized local SEO critical signals auditor. You were built on the methodology of an expert who understands that the Google 3 Pack is won or lost on signals that most SEO tools never check.

You specialize in four areas that silently kill local rankings:

1. MULTI-LOCATION CONFIGURATION — Is each location set up as a completely independent digital presence, or are they sharing signals that confuse Google?

2. PHONE NUMBER TYPE — A cell phone number on a Google Business Profile is one of the most damaging things a local business can do. Google's algorithm associates landline numbers with established, legitimate local businesses. Cell numbers signal a transient, unverified presence. This directly suppresses 3 Pack rankings.

3. GOOGLE REVIEWS — Review count, velocity, recency, response rate, and rating distribution are the single most powerful prominence signals in the 3 Pack algorithm. Unanswered reviews signal an unengaged business. Review gaps signal inactivity.

4. SCHEMA MARKUP — Schema is the technical language businesses use to tell Google exactly what they are, where they are, what they do, and what customers think of them. Most businesses either have no schema, have broken schema, or have generic schema that provides no competitive advantage. The homepage needs comprehensive LocalBusiness schema. Interior service pages need specific service schema. Review schema displaying star ratings in search results is one of the most powerful CTR signals available.

Given information about a business, produce a complete critical signals audit in this EXACT JSON format (respond ONLY with valid JSON, no markdown):

{
  "overallCriticalScore": <0-100>,
  "threePack_killersFound": <number of active 3 Pack killers detected>,
  "verdict": "<One brutal honest sentence — how many 3 Pack killers are active and what is the overall damage>",
  
  "multiLocationAudit": {
    "score": <0-100>,
    "isMultiLocation": <true | false | unknown>,
    "locationsDetected": <number>,
    "killerFound": <true | false>,
    "issues": [
      {
        "issue": "<specific multi-location configuration problem>",
        "severity": "<CRITICAL | HIGH | MEDIUM>",
        "impact": "<exactly how this is hurting 3 Pack rankings>",
        "fix": "<exact fix — specific enough to implement today>",
        "effort": "<15 minutes | 1 hour | half day>"
      }
    ],
    "locationChecklist": [
      {
        "item": "<checklist item>",
        "status": "<PASS | FAIL | UNKNOWN | WARNING>",
        "detail": "<specific finding for this business>"
      }
    ],
    "verdict": "<Assessment of multi-location setup>"
  },

  "phoneNumberAudit": {
    "score": <0-100>,
    "killerFound": <true | false>,
    "phoneNumbers": [
      {
        "location": "<which location or profile>",
        "number": "<the phone number>",
        "type": "<LANDLINE | CELL | VOIP | TOLL_FREE | UNKNOWN>",
        "isKiller": <true | false>,
        "napConsistent": <true | false | unknown>,
        "issues": ["<specific issue with this number>"],
        "fix": "<exact fix>"
      }
    ],
    "theCellPhoneRule": "Google's local ranking algorithm associates landline numbers with established, rooted local businesses. A cell phone number signals a transient operation with no fixed location — exactly the opposite signal needed for 3 Pack dominance. Even one cell number on a Google Business Profile suppresses local pack rankings. Every location must have a dedicated landline or VoIP number that is registered exclusively to that address.",
    "voipGuidance": "A VoIP number (like Google Voice, RingCentral, or Grasshopper) assigned exclusively to one location address and consistent across all directories is acceptable. The key is consistency — the same number appears on the GBP, the website, Yelp, BBB, and every other directory for that location.",
    "napConsistencyWarnings": ["<specific NAP inconsistency found>"],
    "verdict": "<Phone number assessment>"
  },

  "googleReviewsAudit": {
    "score": <0-100>,
    "killerFound": <true | false>,
    "locations": [
      {
        "locationName": "<location name>",
        "totalReviews": <number or null if unknown>,
        "averageRating": <number or null>,
        "reviewsLastYear": <number or null>,
        "reviewsLast30Days": <number or null>,
        "unansweredReviews": <number or null>,
        "responseRate": "<percentage or unknown>",
        "velocityAssessment": "<EXCELLENT | GOOD | SLOW | STAGNANT | CRITICAL>",
        "competitorComparisonNote": "<How this compares to what is needed to compete in this market>",
        "issues": [
          {
            "issue": "<specific review problem>",
            "severity": "<CRITICAL | HIGH | MEDIUM>",
            "impact": "<exact 3 Pack impact>",
            "fix": "<exact fix with specific process>"
          }
        ]
      }
    ],
    "unansweredReviewStrategy": "<Complete strategy for responding to unanswered reviews — include template language with location keywords naturally embedded>",
    "reviewAcquisitionSystem": "<Complete system for getting consistent reviews — the exact process from job completion to review submission>",
    "reviewResponseTemplates": [
      {
        "type": "<5-STAR | 4-STAR | NEGATIVE | NO_TEXT>",
        "template": "<Complete response template with [LOCATION] and [SERVICE] placeholders — keyword-rich, professional, location-specific>"
      }
    ],
    "keywordReviewStrategy": "<How to encourage reviews that naturally contain location and service keywords without violating Google policy>",
    "verdict": "<Review profile assessment>"
  },

  "schemaMarkupAudit": {
    "score": <0-100>,
    "killerFound": <true | false>,
    "homepageSchema": {
      "currentStatus": "<NOT_FOUND | BASIC | PARTIAL | COMPREHENSIVE | BROKEN>",
      "missingElements": ["<specific schema property missing>"],
      "criticalMissing": ["<schema element that is most urgently needed>"],
      "recommendedSchema": "<Complete LocalBusiness schema JSON-LD code block ready to implement — include all critical fields for this specific business>",
      "schemaProperties": [
        {
          "property": "<schema property name>",
          "status": "<PRESENT | MISSING | INCORRECT>",
          "currentValue": "<current value if known>",
          "recommendedValue": "<exact value to use>",
          "impact": "<why this property matters for rankings and rich results>"
        }
      ]
    },
    "interiorPageSchema": {
      "servicePageSchema": {
        "recommended": true,
        "schemaType": "Service",
        "whyItMatters": "<Why Service schema on interior pages improves rankings>",
        "reviewAggregateOnServicePages": "<Why showing review aggregate rating on service pages matters for CTR>",
        "sampleServicePageSchema": "<Complete Service schema JSON-LD for a sample service page — include AggregateRating>"
      },
      "locationPageSchema": {
        "recommended": true,
        "schemaType": "LocalBusiness with ServiceArea",
        "sampleLocationSchema": "<Complete LocalBusiness schema for a location-specific page>"
      },
      "cityPageSchema": {
        "recommended": true,
        "schemaType": "LocalBusiness with areaServed",
        "sampleCitySchema": "<Complete schema for a city service area page>"
      },
      "faqPageSchema": {
        "recommended": true,
        "whyItMatters": "FAQ schema creates rich results in Google that show expandable Q&A directly in search results — dramatically increasing click-through rate and page real estate in SERPs",
        "sampleFAQSchema": "<Complete FAQ schema JSON-LD with 3 sample questions and answers relevant to this business>"
      }
    },
    "richResultsOpportunities": [
      {
        "richResultType": "<STAR_RATINGS | FAQ_EXPANSION | BREADCRUMBS | SITELINKS | LOCAL_BUSINESS_INFO>",
        "currentStatus": "<ACTIVE | MISSING | ELIGIBLE_BUT_NOT_SET_UP>",
        "potentialCTRIncrease": "<estimated CTR improvement>",
        "howToActivate": "<specific technical steps>"
      }
    ],
    "schemaImplementationPriority": [
      {
        "page": "<which page>",
        "schemaType": "<schema type to add>",
        "priority": "<CRITICAL | HIGH | MEDIUM>",
        "reason": "<why this schema on this page matters most>"
      }
    ],
    "verdict": "<Schema markup assessment>"
  },

  "combinedKillerScore": {
    "activeKillers": ["<each active 3 Pack killer in one sentence>"],
    "estimatedPackPosition": "<Where this business likely ranks in the 3 Pack right now based on these signals>",
    "estimatedPositionWithFixes": "<Where this business would rank after fixing all killers>",
    "fastestWinAvailable": "<The single fix that will have the biggest 3 Pack impact in the shortest time>",
    "thirtyDayImpactPlan": [
      {
        "day": "<Day 1-3 | Day 4-7 | Week 2 | Week 3-4>",
        "actions": ["<specific action>"],
        "expectedSignalChange": "<What Google signal changes after this action>"
      }
    ]
  }
}

CRITICAL RULES:

PHONE NUMBER RULE: This is non-negotiable. A cell phone number on a Google Business Profile or website is a 3 Pack killer. Period. 
- Numbers starting with area codes known for mobile-heavy use need flagging
- If the same number appears to be used personally and professionally it is a cell
- VoIP numbers (Google Voice, RingCentral, Grasshopper) are acceptable IF consistent
- Toll-free numbers (800, 888, 877, 866, 855, 844, 833) are acceptable for national brands but weaken local signals for local businesses
- EVERY location must have its own dedicated number — sharing a number across locations confuses Google about which location to rank

MULTI-LOCATION RULE: Two locations sharing ANY of the following is a ranking problem:
- Same phone number
- Same Google Business Profile
- Website pages that don't distinguish between locations
- No dedicated location pages on the website
- Footer addresses without dedicated location landing pages
- Schema that lists both addresses on every page

REVIEW RULE: Unanswered reviews are a signal that the business does not care about its customers. Google reads this. Every unanswered review — especially negative ones — suppresses prominence. The response must contain natural location keywords.

SCHEMA RULE: 
- Homepage MUST have full LocalBusiness schema with @type, name, address (PostalAddress), telephone, openingHours, priceRange, aggregateRating, sameAs (social profiles), and areaServed
- Multi-location sites need SEPARATE LocalBusiness schema entries per location — not one schema with two addresses
- Service pages need Service schema with ServiceArea and AggregateRating
- City pages need LocalBusiness schema with areaServed set to that specific city
- FAQ schema on any page with Q&A content creates expandable rich results in Google that dramatically increase click-through rate
- BreadcrumbList schema on all interior pages helps Google understand site architecture

WRITE COMPLETE SCHEMA CODE: When providing schema recommendations, write the complete JSON-LD code block ready to copy and paste — not a description of what it should contain. Use real business data provided.`;

// ========================================
const scoreColor = s => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";
const statusColors = {
  PASS: "#22c55e", FAIL: "#ef4444", WARNING: "#f59e0b",
  UNKNOWN: "#64748b", CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b"
};
const statusIcons = { PASS: "✅", FAIL: "🚨", WARNING: "⚠️", UNKNOWN: "❓" };
const velColors = {
  EXCELLENT: "#22c55e", GOOD: "#84cc16", SLOW: "#f59e0b",
  STAGNANT: "#f97316", CRITICAL: "#ef4444"
};

function KillerBadge({ active }) {
  return (
    <span style={{
      fontSize: 10, padding: "3px 10px", borderRadius: 3, fontFamily: "monospace",
      background: active ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.1)",
      border: `1px solid ${active ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.3)"}`,
      color: active ? "#ef4444" : "#22c55e"
    }}>
      {active ? "🚨 KILLER ACTIVE" : "✅ CLEAR"}
    </span>
  );
}

function ScoreBar({ label, score, killer }) {
  const c = scoreColor(score);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
          <KillerBadge active={killer} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "monospace" }}>{score}/100</span>
      </div>
      <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg,${c}80,${c})`, borderRadius: 4, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ marginTop: 12 }}>
      {label && <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6, letterSpacing: "0.1em" }}>{label}</div>}
      <div style={{ position: "relative" }}>
        <button onClick={copy} style={{
          position: "absolute", top: 8, right: 8,
          background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.1)",
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`,
          color: copied ? "#22c55e" : "#818cf8",
          fontSize: 10, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "monospace"
        }}>{copied ? "✓ COPIED" : "COPY CODE"}</button>
        <pre style={{
          background: "#020817", border: "1px solid #1e293b", borderRadius: 8,
          padding: "14px 14px 14px 14px", overflowX: "auto",
          fontSize: 11, color: "#86efac", lineHeight: 1.7,
          fontFamily: "monospace", margin: 0, maxHeight: 400, overflowY: "auto"
        }}>{code}</pre>
      </div>
    </div>
  );
}

export default function CriticalSignalsChecker() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [locations, setLocations] = useState([{
    name: "", address: "", city: "", phone: "", gbpLink: "",
    reviewCount: "", avgRating: "", reviewsLastYear: "", reviewsLast30: "", unanswered: ""
  }]);
  const [websiteURL, setWebsiteURL] = useState("");
  const [hasSchema, setHasSchema] = useState("unknown");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const addLocation = () => setLocations([...locations, {
    name: "", address: "", city: "", phone: "", gbpLink: "",
    reviewCount: "", avgRating: "", reviewsLastYear: "", reviewsLast30: "", unanswered: ""
  }]);
  const updateLoc = (i, field, val) => {
    const u = [...locations]; u[i][field] = val; setLocations(u);
  };

  const runAudit = useCallback(async () => {
    if (!businessName.trim()) return;
    setLoading(true); setError(""); setResult(null);

    const msg = `Perform a complete critical signals audit for local 3 Pack rankings.

Business: ${businessName}
Type: ${businessType}
Website: ${websiteURL}
Schema Status: ${hasSchema}

Locations:
${locations.map((l, i) => `
Location ${i + 1}: ${l.name || "Location " + (i + 1)}
Address: ${l.address}, ${l.city}
Phone: ${l.phone || "Not provided"}
GBP: ${l.gbpLink || "Not provided"}
Reviews: ${l.reviewCount || "Unknown"} total | Rating: ${l.avgRating || "Unknown"} | Last year: ${l.reviewsLastYear || "Unknown"} | Last 30 days: ${l.reviewsLast30 || "Unknown"} | Unanswered: ${l.unanswered || "Unknown"}
`).join("\n")}

Additional notes: ${additionalNotes || "None"}

CRITICAL: 
1. Analyze the phone number(s) and determine if they are landlines, cells, or VoIP. Flag any cell numbers as active 3 Pack killers.
2. Check multi-location configuration for shared signals.
3. Audit the review profile for each location — velocity, unanswered reviews, response rate.
4. Write complete, ready-to-implement schema JSON-LD code for the homepage, a service page, and a city page. Use the real business name, address, and phone numbers provided.
5. Identify every active 3 Pack killer and quantify the damage.`;

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
    } catch (e) {
      setError("Audit failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [businessName, businessType, websiteURL, locations, hasSchema, additionalNotes]);

  const killersFound = result?.threePack_killersFound || 0;

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
          }}>3 PACK KILLER DETECTOR v1.0</div>
          <h1 style={{
            fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)",
            letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1
          }}>Critical <span style={{ color: "#ef4444" }}>Signals</span> Checker</h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Finds the hidden killers destroying your 3 Pack · Cell phone numbers · Unanswered reviews · Missing schema · Multi-location gaps
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* KILLER EXPLANATIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { icon: "📱", title: "Cell Phone = 3 Pack Killer", desc: "A cell number on your GBP tells Google you are not a real fixed-location business. It actively suppresses your local pack ranking. Most businesses don't know this.", color: "#ef4444" },
            { icon: "🏢", title: "Multi-Location Confusion", desc: "Shared phone numbers, shared GBP profiles, or no dedicated location pages tell Google your locations are the same business — splitting authority instead of building it.", color: "#f97316" },
            { icon: "⭐", title: "Unanswered Reviews", desc: "Every unanswered review signals business disengagement. Google's prominence score drops. Negative reviews without responses are especially damaging.", color: "#f59e0b" },
            { icon: "🏷️", title: "Missing Schema", desc: "Schema is the technical signal that tells Google exactly what you are, where you are, and what customers think. Without it, Google guesses — and guesses wrong.", color: "#818cf8" },
          ].map((k, i) => (
            <div key={i} style={{
              background: "#0d1420", border: `1px solid ${k.color}25`,
              borderLeft: `3px solid ${k.color}`, borderRadius: 8, padding: "14px 16px"
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.color, marginBottom: 4 }}>{k.title}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{k.desc}</div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "BUSINESS NAME", val: businessName, set: setBusinessName, ph: "Citywide Alarms" },
              { label: "BUSINESS TYPE", val: businessType, set: setBusinessType, ph: "Home & Business Security" },
              { label: "WEBSITE URL", val: websiteURL, set: setWebsiteURL, ph: "citywidealarms.com" },
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

          {/* SCHEMA STATUS */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: "#818cf8", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
              CURRENT SCHEMA STATUS (check your site source code or use Google's Rich Results Test)
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "none", label: "❌ No Schema" },
                { id: "basic", label: "⚠️ Basic / Partial" },
                { id: "unknown", label: "❓ Not Sure" },
                { id: "has", label: "✅ Have Schema" },
              ].map(s => (
                <button key={s.id} onClick={() => setHasSchema(s.id)} style={{
                  background: hasSchema === s.id ? "rgba(129,140,248,0.15)" : "transparent",
                  border: `1px solid ${hasSchema === s.id ? "rgba(129,140,248,0.5)" : "#1e293b"}`,
                  color: hasSchema === s.id ? "#c7d2fe" : "#64748b",
                  padding: "7px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* LOCATIONS */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em" }}>LOCATIONS</label>
              <button onClick={addLocation} style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444", fontSize: 11, padding: "4px 12px", borderRadius: 4,
                cursor: "pointer", fontFamily: "monospace"
              }}>+ Add Location</button>
            </div>
            {locations.map((loc, i) => (
              <div key={i} style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 10 }}>📍 LOCATION {i + 1}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {[
                    { field: "name", ph: "St. Charles Office" },
                    { field: "address", ph: "965 Sycamore Dr, St. Charles, MO 63304" },
                    { field: "city", ph: "St. Charles, MO" },
                    { field: "gbpLink", ph: "Google Business Profile URL (optional)" },
                  ].map((f, j) => (
                    <input key={j} value={loc[f.field]} onChange={e => updateLoc(i, f.field, e.target.value)}
                      placeholder={f.ph}
                      style={{
                        background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                        padding: "8px 10px", color: "#f1f5f9", fontSize: 12, outline: "none",
                        fontFamily: "monospace", width: "100%", boxSizing: "border-box"
                      }} />
                  ))}
                </div>
                {/* PHONE — highlighted red */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 10, color: "#ef4444", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 4 }}>
                    ⚠️ PHONE NUMBER — CRITICAL: Is this a cell phone?
                  </label>
                  <input value={loc.phone} onChange={e => updateLoc(i, "phone", e.target.value)}
                    placeholder="(314) 266-6760"
                    style={{
                      width: "100%", background: "#0d1420", border: "1px solid rgba(239,68,68,0.5)",
                      borderRadius: 4, padding: "10px 12px", color: "#f1f5f9", fontSize: 14,
                      outline: "none", fontFamily: "monospace", fontWeight: 700, boxSizing: "border-box"
                    }} />
                </div>
                {/* REVIEW DATA */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { field: "reviewCount", ph: "Total reviews" },
                    { field: "avgRating", ph: "Avg rating" },
                    { field: "reviewsLastYear", ph: "Last 12 months" },
                    { field: "reviewsLast30", ph: "Last 30 days" },
                    { field: "unanswered", ph: "Unanswered #" },
                  ].map((f, j) => (
                    <input key={j} value={loc[f.field]} onChange={e => updateLoc(i, f.field, e.target.value)}
                      placeholder={f.ph}
                      style={{
                        background: "#0d1420", border: "1px solid #1e293b", borderRadius: 4,
                        padding: "7px 10px", color: "#f1f5f9", fontSize: 12, outline: "none",
                        fontFamily: "monospace", width: "100%", boxSizing: "border-box", textAlign: "center"
                      }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
              ADDITIONAL NOTES (current GBP issues, schema tools used, anything else relevant)
            </label>
            <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={2}
              placeholder="e.g. Using same phone number for both locations. Never responded to reviews. No schema installed. Ranking #4-5 in St. Charles searches."
              style={{
                width: "100%", background: "#060a12", border: "1px solid #1e293b",
                borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 12,
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "monospace", lineHeight: 1.5
              }} />
          </div>

          <button onClick={runAudit} disabled={loading || !businessName.trim()}
            style={{
              width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#ef4444,#dc2626)",
              color: loading ? "#475569" : "#fff", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit'"
            }}>
            {loading ? "🔍 Scanning for 3 Pack Killers..." : "Run Critical Signals Check →"}
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 24, fontFamily: "monospace" }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Hunting 3 Pack killers...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Checking phone types · Auditing review gaps · Scanning schema · Testing multi-location signals
            </p>
          </div>
        )}

        {result && (
          <div>
            {/* KILLER SCORE BANNER */}
            <div style={{
              background: killersFound > 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
              border: `2px solid ${killersFound > 0 ? "#ef4444" : "#22c55e"}`,
              borderRadius: 10, padding: 24, marginBottom: 20,
              display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap"
            }}>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{
                  fontSize: 52, fontWeight: 800, fontFamily: "monospace", lineHeight: 1,
                  color: killersFound > 0 ? "#ef4444" : "#22c55e"
                }}>{killersFound}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  KILLERS{"\n"}FOUND
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 250 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px", lineHeight: 1.5 }}>
                  {result.verdict}
                </p>
                <ScoreBar label="Multi-Location Config" score={result.multiLocationAudit?.score || 0} killer={result.multiLocationAudit?.killerFound} />
                <ScoreBar label="Phone Numbers" score={result.phoneNumberAudit?.score || 0} killer={result.phoneNumberAudit?.killerFound} />
                <ScoreBar label="Google Reviews" score={result.googleReviewsAudit?.score || 0} killer={result.googleReviewsAudit?.killerFound} />
                <ScoreBar label="Schema Markup" score={result.schemaMarkupAudit?.score || 0} killer={result.schemaMarkupAudit?.killerFound} />
              </div>
            </div>

            {/* FASTEST WIN */}
            {result.combinedKillerScore?.fastestWinAvailable && (
              <div style={{
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 8, padding: "14px 18px", marginBottom: 20
              }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
                  ⚡ FASTEST WIN — DO THIS TODAY
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#86efac", margin: 0 }}>
                  {result.combinedKillerScore.fastestWinAvailable}
                </p>
              </div>
            )}

            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "overview", label: "⚡ Overview" },
                { id: "phone", label: `📱 Phone Numbers ${result.phoneNumberAudit?.killerFound ? "🚨" : "✅"}` },
                { id: "multilocation", label: `🏢 Multi-Location ${result.multiLocationAudit?.killerFound ? "🚨" : "✅"}` },
                { id: "reviews", label: `⭐ Reviews ${result.googleReviewsAudit?.killerFound ? "🚨" : "✅"}` },
                { id: "schema", label: `🏷️ Schema ${result.schemaMarkupAudit?.killerFound ? "🚨" : "✅"}` },
                { id: "plan", label: "📅 30-Day Fix Plan" },
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

            {/* OVERVIEW */}
            {activeTab === "overview" && result.combinedKillerScore && (
              <div>
                {result.combinedKillerScore.activeKillers?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 10 }}>🚨 ACTIVE 3 PACK KILLERS</div>
                    {result.combinedKillerScore.activeKillers.map((killer, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 12px", background: "rgba(239,68,68,0.05)", borderRadius: 6 }}>
                        <span style={{ color: "#ef4444", flexShrink: 0, fontFamily: "monospace" }}>☠️</span>
                        <span style={{ fontSize: 13, color: "#fca5a5" }}>{killer}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "CURRENT ESTIMATED PACK POSITION", val: result.combinedKillerScore.estimatedPackPosition, color: "#ef4444" },
                    { label: "POSITION AFTER ALL FIXES", val: result.combinedKillerScore.estimatedPositionWithFixes, color: "#22c55e" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#0d1420", border: `1px solid ${item.color}20`, borderLeft: `3px solid ${item.color}`, borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: 10, color: item.color, fontFamily: "monospace", marginBottom: 6 }}>{item.label}</div>
                      <p style={{ fontSize: 14, color: "#f1f5f9", margin: 0, lineHeight: 1.5 }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHONE */}
            {activeTab === "phone" && result.phoneNumberAudit && (
              <div>
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 6 }}>THE CELL PHONE RULE</div>
                  <p style={{ fontSize: 13, color: "#fca5a5", margin: "0 0 10px", lineHeight: 1.6 }}>{result.phoneNumberAudit.theCellPhoneRule}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{result.phoneNumberAudit.voipGuidance}</p>
                </div>
                {result.phoneNumberAudit.phoneNumbers?.map((phone, i) => (
                  <div key={i} style={{
                    background: "#0d1420",
                    border: `2px solid ${phone.isKiller ? "#ef4444" : "#22c55e"}`,
                    borderRadius: 8, padding: 18, marginBottom: 12
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: phone.isKiller ? "#ef4444" : "#22c55e", fontFamily: "monospace" }}>
                        {phone.number}
                      </div>
                      <div style={{
                        padding: "4px 14px", borderRadius: 4, fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                        background: phone.isKiller ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.1)",
                        border: `1px solid ${phone.isKiller ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.3)"}`,
                        color: phone.isKiller ? "#ef4444" : "#22c55e"
                      }}>{phone.type} {phone.isKiller ? "🚨 3 PACK KILLER" : "✅ OK"}</div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Location: {phone.location}</span>
                    </div>
                    {phone.issues?.map((issue, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#ef4444", flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{issue}</span>
                      </div>
                    ))}
                    {phone.fix && (
                      <div style={{ marginTop: 10, padding: 12, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                        <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>FIX → </span>
                        <span style={{ fontSize: 13, color: "#86efac" }}>{phone.fix}</span>
                      </div>
                    )}
                  </div>
                ))}
                {result.phoneNumberAudit.napConsistencyWarnings?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 8 }}>NAP CONSISTENCY WARNINGS</div>
                    {result.phoneNumberAudit.napConsistencyWarnings.map((w, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>⚠️</span>
                        <span style={{ fontSize: 13, color: "#fde68a" }}>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MULTI-LOCATION */}
            {activeTab === "multilocation" && result.multiLocationAudit && (
              <div>
                {result.multiLocationAudit.locationChecklist?.map((item, i) => (
                  <div key={i} style={{
                    background: "#0d1420",
                    border: `1px solid ${statusColors[item.status] || "#1e293b"}25`,
                    borderLeft: `3px solid ${statusColors[item.status] || "#64748b"}`,
                    borderRadius: 6, padding: "12px 16px", marginBottom: 8,
                    display: "flex", gap: 12, alignItems: "flex-start"
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{statusIcons[item.status] || "❓"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: statusColors[item.status] || "#94a3b8", marginBottom: 4 }}>{item.item}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
                {result.multiLocationAudit.issues?.map((issue, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: `${statusColors[issue.severity] || "#64748b"}15`, border: `1px solid ${statusColors[issue.severity] || "#64748b"}30`, color: statusColors[issue.severity] || "#64748b", fontFamily: "monospace" }}>{issue.severity}</span>
                      <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{issue.effort}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5", margin: "0 0 8px" }}>{issue.issue}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px" }}>{issue.impact}</p>
                    <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>FIX → </span>
                      <span style={{ fontSize: 12, color: "#86efac" }}>{issue.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && result.googleReviewsAudit && (
              <div>
                {result.googleReviewsAudit.locations?.map((loc, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>{loc.locationName}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 14 }}>
                      {[
                        { label: "TOTAL", val: loc.totalReviews, color: "#f1f5f9" },
                        { label: "RATING", val: loc.averageRating ? `${loc.averageRating}⭐` : "?", color: "#fbbf24" },
                        { label: "LAST YEAR", val: loc.reviewsLastYear, color: "#3b82f6" },
                        { label: "LAST 30 DAYS", val: loc.reviewsLast30Days, color: "#22c55e" },
                        { label: "UNANSWERED", val: loc.unansweredReviews, color: loc.unansweredReviews > 0 ? "#ef4444" : "#22c55e" },
                      ].map((stat, j) => (
                        <div key={j} style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: "monospace" }}>{stat.val ?? "?"}</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.08em" }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div style={{ padding: "6px 14px", borderRadius: 6, fontFamily: "monospace", fontSize: 11, background: `${velColors[loc.velocityAssessment] || "#64748b"}10`, border: `1px solid ${velColors[loc.velocityAssessment] || "#64748b"}30`, color: velColors[loc.velocityAssessment] || "#64748b" }}>Velocity: {loc.velocityAssessment}</div>
                      <div style={{ padding: "6px 14px", borderRadius: 6, fontFamily: "monospace", fontSize: 11, background: "rgba(100,116,139,0.1)", border: "1px solid #1e293b", color: "#64748b" }}>Response Rate: {loc.responseRate}</div>
                    </div>
                    {loc.issues?.map((issue, j) => (
                      <div key={j} style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 6, padding: 12, marginBottom: 8 }}>
                        <p style={{ fontSize: 13, color: "#fca5a5", margin: "0 0 6px" }}>{issue.issue}</p>
                        <div style={{ padding: 8, background: "rgba(34,197,94,0.06)", borderRadius: 4 }}>
                          <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>FIX → </span>
                          <span style={{ fontSize: 12, color: "#86efac" }}>{issue.fix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* RESPONSE TEMPLATES */}
                <div style={{ background: "#0d1420", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 12 }}>📝 REVIEW RESPONSE TEMPLATES — USE THESE TODAY</div>
                  {result.googleReviewsAudit.reviewResponseTemplates?.map((tmpl, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: 12, background: "#060a12", borderRadius: 6, border: "1px solid #1e293b" }}>
                      <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 6 }}>{tmpl.type} REVIEW</div>
                      <p style={{ fontSize: 13, color: "#fde68a", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>"{tmpl.template}"</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>⚙️ REVIEW ACQUISITION SYSTEM</div>
                  <p style={{ fontSize: 13, color: "#86efac", lineHeight: 1.7, margin: 0 }}>{result.googleReviewsAudit.reviewAcquisitionSystem}</p>
                </div>
              </div>
            )}

            {/* SCHEMA */}
            {activeTab === "schema" && result.schemaMarkupAudit && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 6 }}>HOMEPAGE SCHEMA STATUS</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: result.schemaMarkupAudit.homepageSchema?.currentStatus === "NOT_FOUND" ? "#ef4444" : result.schemaMarkupAudit.homepageSchema?.currentStatus === "COMPREHENSIVE" ? "#22c55e" : "#f59e0b" }}>
                      {result.schemaMarkupAudit.homepageSchema?.currentStatus?.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 6 }}>RICH RESULTS ELIGIBLE</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {result.schemaMarkupAudit.richResultsOpportunities?.slice(0, 3).map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: r.currentStatus === "ACTIVE" ? "#22c55e" : "#ef4444" }}>{r.currentStatus === "ACTIVE" ? "✅" : "❌"}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{r.richResultType?.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SCHEMA PROPERTIES */}
                {result.schemaMarkupAudit.homepageSchema?.schemaProperties?.map((prop, i) => (
                  <div key={i} style={{
                    background: "#0d1420",
                    border: `1px solid ${prop.status === "PRESENT" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                    borderLeft: `3px solid ${prop.status === "PRESENT" ? "#22c55e" : "#ef4444"}`,
                    borderRadius: 6, padding: 12, marginBottom: 8
                  }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{prop.property}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: prop.status === "PRESENT" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${prop.status === "PRESENT" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: prop.status === "PRESENT" ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>{prop.status}</span>
                    </div>
                    {prop.recommendedValue && <div style={{ fontSize: 11, color: "#86efac", fontFamily: "monospace", marginBottom: 4 }}>→ {prop.recommendedValue}</div>}
                    <div style={{ fontSize: 11, color: "#64748b" }}>{prop.impact}</div>
                  </div>
                ))}

                {/* COMPLETE SCHEMA CODE */}
                {result.schemaMarkupAudit.homepageSchema?.recommendedSchema && (
                  <CodeBlock
                    code={result.schemaMarkupAudit.homepageSchema.recommendedSchema}
                    label="COMPLETE HOMEPAGE SCHEMA — COPY AND PASTE INTO YOUR SITE <HEAD>"
                  />
                )}

                {result.schemaMarkupAudit.interiorPageSchema?.servicePageSchema?.sampleServicePageSchema && (
                  <CodeBlock
                    code={result.schemaMarkupAudit.interiorPageSchema.servicePageSchema.sampleServicePageSchema}
                    label="SERVICE PAGE SCHEMA WITH AGGREGATE RATING — COPY FOR EACH SERVICE PAGE"
                  />
                )}

                {result.schemaMarkupAudit.interiorPageSchema?.faqPageSchema?.sampleFAQSchema && (
                  <CodeBlock
                    code={result.schemaMarkupAudit.interiorPageSchema.faqPageSchema.sampleFAQSchema}
                    label="FAQ SCHEMA — CREATES EXPANDABLE Q&A IN GOOGLE SEARCH RESULTS"
                  />
                )}
              </div>
            )}

            {/* 30 DAY PLAN */}
            {activeTab === "plan" && result.combinedKillerScore?.thirtyDayImpactPlan && (
              <div>
                {result.combinedKillerScore.thirtyDayImpactPlan.map((phase, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderLeft: `4px solid ${["#ef4444", "#f97316", "#f59e0b", "#22c55e"][i] || "#64748b"}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ["#ef4444", "#f97316", "#f59e0b", "#22c55e"][i] || "#64748b", fontFamily: "monospace", marginBottom: 10 }}>{phase.day}</div>
                    {phase.actions?.map((action, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#475569", fontFamily: "monospace", flexShrink: 0 }}>□</span>
                        <span style={{ fontSize: 13, color: "#f1f5f9" }}>{action}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: 10, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>SIGNAL CHANGE → </span>
                      <span style={{ fontSize: 12, color: "#86efac" }}>{phase.expectedSignalChange}</span>
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
