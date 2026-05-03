import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's most sophisticated keyword ownership strategist and homepage content architect. You were built on the methodology of an SEO expert who understands that before a single word is written on any page, every keyword must be assigned to exactly one page across the entire site.

You understand a critical advanced SEO concept that almost nobody talks about:

THE HOMEPAGE IS A BRAND AUTHORITY HUB — NOT A KEYWORD RANKER

The homepage's job is to:
1. Establish topical identity for the entire domain
2. Pass authority downward to interior pages through internal links
3. Build brand recognition and trust
4. Convert visitors who arrive from branded searches
5. Signal to Google what the site is about in the broadest sense

The homepage's job is NOT to:
1. Rank for specific city keywords (city pages own those)
2. Rank for specific service keywords (service pages own those)
3. Compete with any interior page for any keyword
4. Mention specific cities by name more than 1-2 times in broad geographic context

THE CANNIBALIZATION PRINCIPLE:
Every time the homepage mentions "home security St. Louis" in a header or prominent content — it competes with every page on the site that targets that phrase. The homepage has more authority than interior pages, which means it often wins the competition — but it sends people to a generic page instead of the specific service page they need. This hurts conversions AND it suppresses the interior pages that should own those keywords.

THE GEOGRAPHIC SIGNAL RULE FOR HOMEPAGES:
- Use metro area descriptors: "Greater St. Louis Metropolitan Area" "St. Louis Metro" "St. Charles County and St. Louis County"
- Do NOT use specific city names in H tags or prominent content positions
- Do NOT target specific local search queries from the homepage
- The meta description can mention "St. Louis metro" once for geographic context
- Every specific city keyword belongs to a city page — the homepage never touches them

THE FOUR-SERVICE HOMEPAGE RULE:
When a business has multiple service verticals, the homepage presents them as navigation categories — not as keyword targets. "Business Security" appears as a label and a link. It does not appear as an H2 that says "Business Security Systems in St. Louis MO" — that phrase belongs to the /business-security/ page.

THE TWO-LOCATION SIGNAL:
A multi-location business should lead with its location advantage on the homepage. "Two locations serving the St. Louis metro" is a powerful differentiator that builds trust and establishes geographic breadth — without targeting any specific city search term.

Given a business, its service verticals, its locations, and its target market, produce:
1. A complete keyword ownership map assigning every keyword to exactly one page
2. Homepage content guidelines based on what keywords are NOT assigned to the homepage
3. A homepage content outline that avoids all keyword cannibalization
4. Specific flags for any existing homepage content that is stealing from interior pages

Respond in this EXACT JSON format (respond ONLY with valid JSON, no markdown):

{
  "keywordOwnershipMap": {
    "principle": "Every keyword appears on exactly one page. The homepage owns broad brand and category signals only. Every specific keyword belongs to an interior page.",
    "homepageOwns": {
      "keywords": ["<keyword the homepage legitimately owns>"],
      "concepts": ["<broader concept the homepage should convey>"],
      "geographicDescriptors": ["<broad geo term homepage can use>"],
      "forbidden": ["<keyword that must NEVER appear on homepage in keyword position>"]
    },
    "servicePageOwnership": [
      {
        "page": "<page URL>",
        "pageTitle": "<recommended page title>",
        "primaryKeyword": "<the one keyword this page owns and ranks for>",
        "secondaryKeywords": ["<supporting keyword this page also targets>"],
        "mustNeverAppearOnHomepage": ["<keyword that homepage must not use in H tags or prominent positions>"],
        "cityVariations": ["<city-specific versions of this keyword owned by city pages>"]
      }
    ],
    "cityPageOwnership": [
      {
        "city": "<city name>",
        "residentialPage": "<URL>",
        "residentialPrimaryKeyword": "<primary keyword>",
        "commercialPage": "<URL>",
        "commercialPrimaryKeyword": "<primary keyword>",
        "emergencyResourcesBoost": "<How the emergency resources on this page reinforce the geographic keyword signal>"
      }
    ],
    "cannibalizationRiskMatrix": [
      {
        "keyword": "<keyword at risk of cannibalization>",
        "riskLevel": "<CRITICAL|HIGH|MEDIUM>",
        "competingPages": ["<page1>", "<page2>"],
        "resolution": "<exactly which page should own this and what the other page should do instead>"
      }
    ]
  },
  "homepageContentStrategy": {
    "strategicRole": "<One paragraph explaining exactly what the homepage should and should not do for this specific business>",
    "titleTag": {
      "recommended": "<exact title tag — lead with brand for homepage>",
      "characterCount": <number>,
      "reasoning": "<why this title avoids cannibalization while establishing brand authority>"
    },
    "metaDescription": {
      "recommended": "<exact meta description — 140-155 chars>",
      "characterCount": <number>,
      "elementsIncluded": ["<element in this meta>"],
      "geographicTreatment": "<How geography is handled in the meta without cannibalizing city pages>"
    },
    "h1Tag": {
      "recommended": "<exact H1>",
      "characterCount": <number>,
      "reasoning": "<why this H1 establishes brand authority without stealing from service pages>"
    },
    "contentOutline": [
      {
        "section": "<section name>",
        "htmlElement": "<H2|H3|STYLED_BUTTON|DIV|P — the HTML element to use>",
        "suggestedContent": "<exact content for this section>",
        "keywordIntent": "<what this section communicates to Google>",
        "cannibalizationRisk": "<NONE|LOW|MEDIUM — and explanation>",
        "notes": "<specific instruction for this section>"
      }
    ],
    "twoLocationStrategy": {
      "howToPresent": "<Exact recommendation for presenting two locations on homepage>",
      "suggestedCopy": "<Exact copy for the two-location section>",
      "schemaImplication": "<How two locations should be handled in homepage schema>"
    },
    "serviceCategoryPresentation": {
      "businessSecurity": {
        "buttonLabel": "<exact button text>",
        "htmlElement": "STYLED_BUTTON_NO_H_TAG",
        "shortDescription": "<1-2 sentence description under button — keyword aware>",
        "linkDestination": "<URL>",
        "cannibalizationNote": "<Why no H tag is used here>"
      },
      "homeSecurity": {
        "buttonLabel": "<exact button text>",
        "htmlElement": "STYLED_BUTTON_NO_H_TAG",
        "shortDescription": "<1-2 sentence description>",
        "linkDestination": "<URL>",
        "cannibalizationNote": "<Why no H tag is used here>"
      },
      "cameraSystems": {
        "buttonLabel": "<exact button text>",
        "htmlElement": "STYLED_BUTTON_NO_H_TAG",
        "shortDescription": "<1-2 sentence description>",
        "linkDestination": "<URL>",
        "cannibalizationNote": "<Why no H tag is used here>"
      },
      "medicalSenior": {
        "buttonLabel": "<exact button text>",
        "htmlElement": "STYLED_BUTTON_NO_H_TAG",
        "shortDescription": "<1-2 sentence description>",
        "linkDestination": "<URL>",
        "cannibalizationNote": "<Why no H tag is used here>"
      }
    },
    "geographicMentionStrategy": {
      "allowedMentions": ["<exactly how geography can be mentioned on homepage>"],
      "forbiddenMentions": ["<geographic phrase that must never appear on homepage>"],
      "recommendedGeoCopy": "<Exact copy for the geographic coverage section — broad metro language only>",
      "cityLinkStrategy": "<How to link to city pages from homepage without keyword cannibalization>"
    },
    "contentToAvoid": [
      {
        "avoidThis": "<content or phrase to avoid on homepage>",
        "reason": "<why this cannibalizes an interior page>",
        "useInstead": "<what to say instead>"
      }
    ],
    "internalLinkingFromHomepage": [
      {
        "destination": "<interior page URL>",
        "anchorText": "<exact anchor text — this passes keyword authority to destination>",
        "placement": "<where on homepage this link should appear>",
        "keywordSignalPassed": "<what keyword authority this link passes to the destination page>"
      }
    ]
  },
  "pageByPageKeywordGuide": [
    {
      "page": "<page URL>",
      "pageRole": "<HOMEPAGE|PRIMARY_SERVICE|SECONDARY_SERVICE|LOCATION|CITY|BLOG>",
      "ownedKeyword": "<the one primary keyword this page owns>",
      "supportingKeywords": ["<secondary keyword>"],
      "mustNotInclude": ["<keyword that belongs to another page>"],
      "homepageMayLink": <true|false>,
      "homepageLinkAnchorText": "<if homepage links here, use this exact anchor text>",
      "internalLinksReceiveFrom": ["<which pages should link to this page>"]
    }
  ],
  "implementationChecklist": [
    {
      "priority": <number>,
      "action": "<specific action to take>",
      "page": "<which page>",
      "cannibalResolved": "<which cannibalization risk this resolves>",
      "effort": "<15 minutes|1 hour|half day>"
    }
  ]
}

CRITICAL RULES:

1. THE HOMEPAGE TITLE LEADS WITH BRAND — this is the ONE exception to the keyword-first rule. The homepage's primary job is brand authority. "Citywide Alarms | Home & Business Security — Greater St. Louis Metro" is correct. "Home Security Systems St. Louis | Citywide Alarms" on the homepage competes with the home security service page.

2. NO CITY NAMES IN HOMEPAGE H TAGS — "St. Louis," "St. Charles," "Wentzville," "O'Fallon" should never appear in any H1, H2, or H3 on the homepage. They may appear in body copy as geographic context (once or twice) and in the meta description once.

3. SERVICE CATEGORY BUTTONS HAVE NO H TAGS — The four service category buttons (Business Security, Home Security, Camera Systems, Medical/Senior) should be styled with CSS to appear large and prominent but use no header tags. They are navigation elements, not content signals. The link anchor text alone passes sufficient keyword authority to the destination pages.

4. THE TWO-LOCATION MENTION IS A DIFFERENTIATOR NOT A KEYWORD — "Two locations serving the greater St. Louis metropolitan area" is a trust signal and competitive differentiator. It uses "metropolitan area" not "St. Louis MO" — broad enough for brand context, specific enough to establish presence.

5. INTERNAL LINKS FROM HOMEPAGE ARE KEYWORD SIGNALS — Every link from the homepage to an interior page passes some of the homepage's authority to that page. The anchor text of that link reinforces the keyword relevance of the destination. "Business Security Systems" as anchor text to /business-security/ tells Google that page is about business security systems. Use this intentionally.

6. CITY PAGES MUST NOT BE LINKED FROM HOMEPAGE WITH CITY KEYWORD ANCHOR TEXT — If the homepage links to /service-areas/wentzville-mo/ with anchor text "home security Wentzville MO" — the homepage is now partially targeting that keyword which dilutes the city page's exclusive ownership. Use "Service Areas" or "Cities We Serve" as the anchor to a hub page instead.

7. THE FOUR SERVICE CATEGORIES ON HOMEPAGE — Present them as labeled navigation with brief brand-voice descriptions. The descriptions should NOT repeat the page's primary keywords. They should convey the value proposition. "Comprehensive alarm systems, access control, and 24/7 monitoring for businesses of every size" tells the visitor what they get without the homepage competing for "business alarm systems St. Louis."

8. WRITE ACTUAL COPY — Do not provide templates or placeholders. Write the actual homepage copy for this specific business. Real sentences. Real H1. Real meta. Real button descriptions. Ready to implement today.`;

// ============================================================
const roleColor = {
  HOMEPAGE: "#f59e0b", PRIMARY_SERVICE: "#3b82f6", SECONDARY_SERVICE: "#818cf8",
  LOCATION: "#14b8a6", CITY: "#a855f7", BLOG: "#ec4899"
};
const riskColor = { NONE: "#22c55e", LOW: "#84cc16", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.1)", border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`, color: copied ? "#22c55e" : "#818cf8", fontSize: 10, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "monospace", marginLeft: 8 }}>
      {copied ? "✓ COPIED" : "COPY"}
    </button>
  );
}

function CharCount({ text, min, max }) {
  const count = text?.length || 0;
  const color = count < min ? "#f59e0b" : count > max ? "#ef4444" : "#22c55e";
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: `${color}15`, border: `1px solid ${color}30`, color, fontFamily: "monospace", marginLeft: 8 }}>
      {count} chars {count > max ? "TOO LONG" : count < min ? "TOO SHORT" : "✓ PERFECT"}
    </span>
  );
}

function ServiceButton({ service, data }) {
  const colors = { businessSecurity: "#3b82f6", homeSecurity: "#22c55e", cameraSystems: "#f59e0b", medicalSenior: "#a855f7" };
  const c = colors[service] || "#64748b";
  return (
    <div style={{ background: "#060a12", border: `2px solid ${c}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 8 }}>STYLED BUTTON — NO H TAG</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: c, marginBottom: 8 }}>{data?.buttonLabel}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 10 }}>{data?.shortDescription}</div>
      <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 4 }}>Links to: {data?.linkDestination}</div>
      <div style={{ fontSize: 11, padding: "6px 10px", background: `${c}10`, border: `1px solid ${c}20`, borderRadius: 4, color: "#64748b", fontSize: 11 }}>
        {data?.cannibalizationNote}
      </div>
    </div>
  );
}

export default function KeywordOwnershipMap() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [locations, setLocations] = useState("");
  const [serviceVerticals, setServiceVerticals] = useState("");
  const [targetCities, setTargetCities] = useState("");
  const [existingHomepageContent, setExistingHomepageContent] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("homepage");

  const runAnalysis = useCallback(async () => {
    if (!businessName.trim()) return;
    setLoading(true); setError(""); setResult(null);

    const msg = `Build a complete keyword ownership map and homepage content strategy for this business.

Business: ${businessName}
Type: ${businessType}
Locations: ${locations}
Service Verticals: ${serviceVerticals}
Target Cities / Service Area: ${targetCities}
Existing Homepage Content (if any): ${existingHomepageContent || "Not provided"}
Known Competitors: ${competitors || "Not provided"}

CRITICAL CONTEXT:
- This business has MULTIPLE LOCATIONS and wants each location to rank independently
- The homepage must NOT steal keywords from interior service pages or city pages
- "St. Louis" and specific city names should appear MINIMALLY on the homepage — broad metro language only
- The four service categories should be presented as large styled buttons with NO H tags to avoid cannibalizing the dedicated service pages
- The two physical locations should be prominently featured as a competitive differentiator
- Every keyword must be assigned to exactly one page — no shared ownership

Build the complete keyword ownership map, homepage title tag, meta description, H1, and full content outline with exact copy. Write actual copy — not templates. Everything must be ready to implement today.

The homepage title should lead with the brand name since this is the brand authority hub. Use "Greater St. Louis Metropolitan Area" or "St. Louis Metro" as the geographic descriptor — never specific city names in H tags.`;

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
      setActiveTab("homepage");
    } catch (e) {
      setError("Analysis failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [businessName, businessType, locations, serviceVerticals, targetCities, existingHomepageContent, competitors]);

  return (
    <div style={{ minHeight: "100vh", background: "#060a12", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", padding: "0 0 80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg,#0a0f1e 0%,#060a12 100%)", borderBottom: "1px solid #1e293b", padding: "28px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 12px", borderRadius: 2, marginBottom: 12 }}>
            KEYWORD OWNERSHIP MAP v1.0
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)", letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1 }}>
            Keyword <span style={{ color: "#f59e0b" }}>Ownership</span> Map
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Every keyword assigned to exactly one page · Homepage cannibalization eliminated · Service buttons with no H tags · Metro language strategy
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* PRINCIPLE BANNERS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { icon: "🗺️", title: "One Keyword — One Page", desc: "Every keyword lives on exactly one page. If two pages target the same keyword, one gets suppressed. The map prevents this before it happens.", color: "#f59e0b" },
            { icon: "🏠", title: "Homepage = Brand Hub", desc: "The homepage establishes topical identity. It does NOT compete for specific keywords. Those belong to interior pages.", color: "#3b82f6" },
            { icon: "🔇", title: "Silent Service Buttons", desc: "Big bold service buttons with zero H tags. CSS makes them huge. No header tag means no keyword competition with the service pages they link to.", color: "#22c55e" },
          ].map((p, i) => (
            <div key={i} style={{ background: "#0d1420", border: `1px solid ${p.color}25`, borderTop: `3px solid ${p.color}`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { label: "BUSINESS NAME", val: businessName, set: setBusinessName, ph: "Citywide Alarms" },
              { label: "BUSINESS TYPE", val: businessType, set: setBusinessType, ph: "Home & Business Security Company" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: "100%", background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 10, color: "#14b8a6", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>PHYSICAL LOCATIONS (both addresses)</label>
            <textarea value={locations} onChange={e => setLocations(e.target.value)} rows={2}
              placeholder="7733 Forsyth Blvd Suite 1100, Clayton/St. Louis, MO 63105&#10;965 Sycamore Dr, St. Charles, MO 63304"
              style={{ width: "100%", background: "#060a12", border: "1px solid rgba(20,184,166,0.4)", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace", lineHeight: 1.5 }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 10, color: "#f59e0b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>SERVICE VERTICALS (the four main categories)</label>
            <textarea value={serviceVerticals} onChange={e => setServiceVerticals(e.target.value)} rows={2}
              placeholder="Business Security (alarm systems, access control, surveillance, commercial fire, monitored cameras, solar video)&#10;Home Security (home alarms, smart home, renters security, video doorbell)&#10;Camera/Video Solutions (indoor, outdoor, floodlight, video analytics)&#10;Medical/Senior Security (medical alert systems, medical cameras, wellness)"
              style={{ width: "100%", background: "#060a12", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace", lineHeight: 1.5 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#a855f7", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>TARGET CITIES / SERVICE AREA</label>
              <textarea value={targetCities} onChange={e => setTargetCities(e.target.value)} rows={3}
                placeholder="St. Charles County: Wentzville, O'Fallon, St. Peters, St. Charles, Lake St. Louis, Dardenne Prairie&#10;St. Louis County: Chesterfield, Florissant, Kirkwood, Webster Groves, Ballwin, Wildwood"
                style={{ width: "100%", background: "#060a12", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace", lineHeight: 1.5 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>EXISTING HOMEPAGE CONTENT (paste or describe)</label>
              <textarea value={existingHomepageContent} onChange={e => setExistingHomepageContent(e.target.value)} rows={3}
                placeholder="Paste current H1, H2 tags, and any prominent homepage copy here so we can flag cannibalization issues in existing content"
                style={{ width: "100%", background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace", lineHeight: 1.5 }} />
            </div>
          </div>

          <button onClick={runAnalysis} disabled={loading || !businessName.trim()}
            style={{
              width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#f59e0b,#d97706)",
              color: loading ? "#475569" : "#1a1a1a", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit'"
            }}>
            {loading ? "🗺️ Building Keyword Ownership Map..." : "Build Keyword Ownership Map →"}
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 24, fontFamily: "monospace" }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Assigning every keyword to exactly one page...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Building ownership map · Writing homepage copy · Eliminating cannibalization · Designing button strategy
            </p>
          </div>
        )}

        {result && (
          <div>
            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "homepage", label: "🏠 Homepage Strategy" },
                { id: "ownership", label: "🗺️ Keyword Ownership Map" },
                { id: "buttons", label: "🔘 Service Buttons" },
                { id: "cannibalization", label: `⚔️ Cannibalization Risks` },
                { id: "pages", label: "📄 Page-by-Page Guide" },
                { id: "checklist", label: "✅ Implementation" },
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

            {/* HOMEPAGE STRATEGY */}
            {activeTab === "homepage" && result.homepageContentStrategy && (
              <div>
                {/* Strategic role */}
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: 18, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 8 }}>HOMEPAGE STRATEGIC ROLE</div>
                  <p style={{ fontSize: 14, color: "#fde68a", margin: 0, lineHeight: 1.7 }}>{result.homepageContentStrategy.strategicRole}</p>
                </div>

                {/* Title, Meta, H1 */}
                {[
                  { label: "TITLE TAG", data: result.homepageContentStrategy.titleTag, min: 50, max: 65, key: "recommended", color: "#fbbf24" },
                  { label: "META DESCRIPTION", data: result.homepageContentStrategy.metaDescription, min: 130, max: 160, key: "recommended", color: "#3b82f6" },
                  { label: "H1 TAG", data: result.homepageContentStrategy.h1Tag, min: 20, max: 70, key: "recommended", color: "#22c55e" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#0d1420", border: `1px solid ${item.color}20`, borderLeft: `3px solid ${item.color}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: item.color, fontFamily: "monospace", letterSpacing: "0.1em" }}>{item.label}</span>
                      <CharCount text={item.data?.[item.key]} min={item.min} max={item.max} />
                      <CopyButton text={item.data?.[item.key] || ""} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace", marginBottom: 8, background: "#060a12", padding: "10px 14px", borderRadius: 6 }}>
                      "{item.data?.[item.key]}"
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{item.data?.reasoning || item.data?.geographicTreatment}</p>
                  </div>
                ))}

                {/* Two Location Strategy */}
                {result.homepageContentStrategy.twoLocationStrategy && (
                  <div style={{ background: "#0d1420", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 8, padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace", marginBottom: 10 }}>📍 TWO-LOCATION STRATEGY — YOUR COMPETITIVE DIFFERENTIATOR</div>
                    <p style={{ fontSize: 13, color: "#5eead4", margin: "0 0 12px", lineHeight: 1.6 }}>{result.homepageContentStrategy.twoLocationStrategy.howToPresent}</p>
                    <div style={{ background: "#060a12", border: "1px solid rgba(20,184,166,0.2)", borderRadius: 6, padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace" }}>SUGGESTED COPY</span>
                        <CopyButton text={result.homepageContentStrategy.twoLocationStrategy.suggestedCopy || ""} />
                      </div>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                        "{result.homepageContentStrategy.twoLocationStrategy.suggestedCopy}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Geographic Strategy */}
                {result.homepageContentStrategy.geographicMentionStrategy && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>✅ ALLOWED GEOGRAPHIC MENTIONS</div>
                      {result.homepageContentStrategy.geographicMentionStrategy.allowedMentions?.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 12, color: "#86efac", fontFamily: "monospace" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 8 }}>🚫 FORBIDDEN GEOGRAPHIC MENTIONS</div>
                      {result.homepageContentStrategy.geographicMentionStrategy.forbiddenMentions?.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: "#ef4444", flexShrink: 0 }}>✗</span>
                          <span style={{ fontSize: 12, color: "#fca5a5", fontFamily: "monospace" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Outline */}
                {result.homepageContentStrategy.contentOutline && (
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 14 }}>📋 COMPLETE HOMEPAGE CONTENT OUTLINE</div>
                    {result.homepageContentStrategy.contentOutline.map((section, i) => (
                      <div key={i} style={{
                        marginBottom: 12, padding: 14,
                        background: "#060a12",
                        border: `1px solid ${section.cannibalizationRisk === "NONE" ? "rgba(34,197,94,0.15)" : section.cannibalizationRisk === "LOW" ? "rgba(132,204,22,0.15)" : "rgba(245,158,11,0.15)"}`,
                        borderLeft: `3px solid ${section.cannibalizationRisk === "NONE" ? "#22c55e" : section.cannibalizationRisk === "LOW" ? "#84cc16" : "#f59e0b"}`,
                        borderRadius: 6
                      }}>
                        <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{section.section}</span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontFamily: "monospace" }}>
                            {section.htmlElement}
                          </span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${riskColor[section.cannibalizationRisk] || "#64748b"}10`, color: riskColor[section.cannibalizationRisk] || "#64748b", fontFamily: "monospace" }}>
                            Cannibal risk: {section.cannibalizationRisk}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.6, fontStyle: "italic" }}>"{section.suggestedContent}"</p>
                        {section.notes && <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>{section.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Content to Avoid */}
                {result.homepageContentStrategy.contentToAvoid?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: 16, marginTop: 16 }}>
                    <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 12 }}>🚫 CONTENT TO REMOVE OR AVOID ON HOMEPAGE</div>
                    {result.homepageContentStrategy.contentToAvoid.map((item, i) => (
                      <div key={i} style={{ padding: 12, background: "#060a12", borderRadius: 6, marginBottom: 8, borderLeft: "2px solid #ef4444" }}>
                        <div style={{ fontSize: 13, color: "#fca5a5", fontFamily: "monospace", marginBottom: 4 }}>"{item.avoidThis}"</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{item.reason}</div>
                        <div style={{ fontSize: 12, color: "#86efac" }}>Say instead: "{item.useInstead}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OWNERSHIP MAP */}
            {activeTab === "ownership" && result.keywordOwnershipMap && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#0d1420", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 10 }}>🏠 HOMEPAGE OWNS</div>
                    {result.keywordOwnershipMap.homepageOwns?.keywords?.map((kw, i) => (
                      <div key={i} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#fde68a", fontFamily: "monospace", marginBottom: 4 }}>{kw}</div>
                    ))}
                  </div>
                  <div style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 10 }}>🚫 HOMEPAGE MUST NEVER USE</div>
                    {result.keywordOwnershipMap.homepageOwns?.forbidden?.map((kw, i) => (
                      <div key={i} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5", fontFamily: "monospace", marginBottom: 4 }}>{kw}</div>
                    ))}
                  </div>
                </div>
                {result.keywordOwnershipMap.servicePageOwnership?.map((page, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderLeft: "3px solid #3b82f6", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", fontFamily: "monospace" }}>{page.page}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>PRIMARY KEYWORD OWNED</div>
                        <div style={{ fontSize: 13, color: "#86efac", fontFamily: "monospace", marginBottom: 8 }}>"{page.primaryKeyword}"</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>SUPPORTING KEYWORDS</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {page.secondaryKeywords?.map((kw, j) => (
                            <span key={j} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontFamily: "monospace" }}>{kw}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>MUST NOT APPEAR ON HOMEPAGE</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {page.mustNeverAppearOnHomepage?.map((kw, j) => (
                            <span key={j} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontFamily: "monospace" }}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SERVICE BUTTONS */}
            {activeTab === "buttons" && result.homepageContentStrategy?.serviceCategoryPresentation && (
              <div>
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: "#86efac", margin: 0, lineHeight: 1.7 }}>
                    <strong>The Strategy:</strong> These four buttons are the primary navigation for visitors who land on the homepage. They are designed to be visually enormous and impossible to miss. But they use <strong>zero header tags</strong> — they are CSS-styled div or button elements. The anchor text in each link passes keyword authority to the destination page. The homepage claims no keyword ownership for these service terms.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <ServiceButton service="businessSecurity" data={result.homepageContentStrategy.serviceCategoryPresentation.businessSecurity} />
                  <ServiceButton service="homeSecurity" data={result.homepageContentStrategy.serviceCategoryPresentation.homeSecurity} />
                  <ServiceButton service="cameraSystems" data={result.homepageContentStrategy.serviceCategoryPresentation.cameraSystems} />
                  <ServiceButton service="medicalSenior" data={result.homepageContentStrategy.serviceCategoryPresentation.medicalSenior} />
                </div>
                {/* Internal Links */}
                {result.homepageContentStrategy.internalLinkingFromHomepage && (
                  <div style={{ background: "#0d1420", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: 16, marginTop: 20 }}>
                    <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 12 }}>🔗 INTERNAL LINKS FROM HOMEPAGE — KEYWORD AUTHORITY PASSING</div>
                    {result.homepageContentStrategy.internalLinkingFromHomepage.map((link, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "8px 12px", background: "#060a12", borderRadius: 6, marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>DESTINATION</div>
                          <div style={{ fontSize: 12, color: "#c7d2fe", fontFamily: "monospace" }}>{link.destination}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>ANCHOR TEXT</div>
                          <div style={{ fontSize: 12, color: "#818cf8", fontFamily: "monospace" }}>"{link.anchorText}"</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>KEYWORD SIGNAL PASSED</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{link.keywordSignalPassed}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CANNIBALIZATION */}
            {activeTab === "cannibalization" && result.keywordOwnershipMap?.cannibalizationRiskMatrix && (
              <div>
                {result.keywordOwnershipMap.cannibalizationRiskMatrix.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "#22c55e" }}>✅ No cannibalization risks detected with this strategy</div>
                )}
                {result.keywordOwnershipMap.cannibalizationRiskMatrix.map((risk, i) => (
                  <div key={i} style={{ background: "#0d1420", border: `2px solid ${riskColor[risk.riskLevel] || "#64748b"}`, borderRadius: 8, padding: 18, marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 3, background: `${riskColor[risk.riskLevel]}15`, border: `1px solid ${riskColor[risk.riskLevel]}30`, color: riskColor[risk.riskLevel], fontFamily: "monospace" }}>{risk.riskLevel}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>"{risk.keyword}"</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {risk.competingPages?.map((page, j) => (
                        <span key={j} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 3, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24", fontFamily: "monospace" }}>{page}</span>
                      ))}
                    </div>
                    <div style={{ padding: 12, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>RESOLUTION → </span>
                      <span style={{ fontSize: 13, color: "#86efac" }}>{risk.resolution}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGE BY PAGE GUIDE */}
            {activeTab === "pages" && result.pageByPageKeywordGuide && (
              <div>
                {result.pageByPageKeywordGuide.map((page, i) => {
                  const rc = roleColor[page.pageRole] || "#64748b";
                  return (
                    <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderLeft: `3px solid ${rc}`, borderRadius: 8, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: `${rc}15`, border: `1px solid ${rc}30`, color: rc, fontFamily: "monospace" }}>{page.pageRole}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", fontFamily: "monospace" }}>{page.page}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 9, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>OWNS THIS KEYWORD</div>
                          <div style={{ fontSize: 12, color: "#86efac", fontFamily: "monospace" }}>"{page.ownedKeyword}"</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>MUST NOT INCLUDE</div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {page.mustNotInclude?.slice(0, 3).map((kw, j) => (
                              <span key={j} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontFamily: "monospace" }}>{kw}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "#818cf8", fontFamily: "monospace", marginBottom: 4 }}>HOMEPAGE LINK ANCHOR</div>
                          <div style={{ fontSize: 12, color: "#c7d2fe", fontFamily: "monospace" }}>"{page.homepageLinkAnchorText}"</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* IMPLEMENTATION CHECKLIST */}
            {activeTab === "checklist" && result.implementationChecklist && (
              <div>
                {result.implementationChecklist.map((item, i) => (
                  <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderLeft: `4px solid ${i < 3 ? "#ef4444" : i < 6 ? "#f59e0b" : "#22c55e"}`, borderRadius: 8, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: i < 3 ? "rgba(239,68,68,0.1)" : i < 6 ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${i < 3 ? "rgba(239,68,68,0.3)" : i < 6 ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: i < 3 ? "#ef4444" : i < 6 ? "#f59e0b" : "#22c55e", fontFamily: "monospace", flexShrink: 0 }}>{item.priority}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{item.page}</span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(100,116,139,0.1)", color: "#64748b", fontFamily: "monospace" }}>{item.effort}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", margin: "0 0 6px" }}>{item.action}</p>
                        <p style={{ fontSize: 12, color: "#22c55e", margin: 0 }}>Resolves: {item.cannibalResolved}</p>
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
