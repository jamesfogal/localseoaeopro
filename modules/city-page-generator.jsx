import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's most sophisticated local SEO city page generator. You were built on a proven methodology — a security company used hyperlocal city pages with real emergency resources, local government contacts, school districts, and fire safety partners to dominate page one rankings in every city they targeted. Their Wentzville, Missouri page ranked number one almost consistently for home security searches.

The secret is not keyword stuffing. The secret is becoming the most genuinely useful local resource page that exists for that city — a page so useful that residents bookmark it even if they are not buying today.

Given a business and city, generate complete, ready-to-publish city page content in this EXACT JSON format (respond ONLY with valid JSON, no markdown):

{
  "pageMetadata": {
    "recommendedURL": "<exact URL slug — e.g. /service-areas/wentzville-mo/>",
    "titleTag": "<exact title tag — under 60 characters — primary keyword + city + brand>",
    "metaDescription": "<exact meta description — under 160 characters — compelling, keyword-rich, includes city>",
    "h1Tag": "<exact H1 — primary service + city name + state — never a marketing slogan>",
    "h2Tags": ["<supporting H2 for each major section>"]
  },
  "heroSection": {
    "headline": "<H1 — same as h1Tag>",
    "subheadline": "<One sentence that answers why choose this company in this city>",
    "openingParagraph": "<2-3 sentences that mention the city specifically, establish local credibility, and naturally use primary keywords. This is NOT generic. It references something real about this city.>"
  },
  "cityContext": {
    "cityDescription": "<2-3 sentences about this city — population, growth trends, character, why security matters here specifically>",
    "localSecurityContext": "<Why does this specific city need security services? Reference local growth, business activity, residential development — be specific to this actual city>",
    "neighboringCities": ["<city this page should mention as also served>"]
  },
  "emergencyResources": {
    "sectionIntro": "<One sentence introducing this section — position the business as a community resource>",
    "police": {
      "departmentName": "<full official name>",
      "address": "<full address>",
      "emergencyNumber": "911",
      "nonEmergencyNumber": "<non-emergency number>",
      "recordsNumber": "<records number if known>",
      "website": "<website URL>",
      "chiefName": "<chief name if known>",
      "neighborhoodWatchContact": "<if known>"
    },
    "fire": {
      "districtName": "<full official name>",
      "address": "<headquarters address>",
      "phone": "<main phone>",
      "email": "<email if known>",
      "website": "<website>",
      "numberOfStations": "<number of stations>",
      "coverageArea": "<coverage area description>",
      "commercialPermits": "<note about commercial permits if applicable>"
    },
    "ems": {
      "serviceName": "<ambulance district or EMS service name>",
      "nonEmergencyPhone": "<non-emergency number>",
      "address": "<nearest station address>",
      "website": "<website>",
      "additionalStations": ["<other nearby station addresses>"]
    },
    "hospital": {
      "name": "<nearest hospital with ER>",
      "address": "<full address>",
      "phone": "<main number>",
      "erAvailable": <true | false>,
      "website": "<website>"
    },
    "urgentCare": {
      "name": "<nearest urgent care if applicable>",
      "address": "<address>",
      "phone": "<phone>"
    }
  },
  "localGovernment": {
    "cityHall": {
      "address": "<full address>",
      "mainPhone": "<main phone>",
      "hours": "<hours of operation>",
      "website": "<website>",
      "mayor": "<mayor name if known>",
      "additionalContacts": [
        { "department": "<department name>", "phone": "<number>", "purpose": "<what this contact is for>" }
      ]
    },
    "buildingPermits": {
      "contact": "<who handles building permits>",
      "phone": "<phone>",
      "relevantNote": "<why this matters for security system installation permits>"
    }
  },
  "schoolDistrict": {
    "districtName": "<full official district name>",
    "mainPhone": "<main district phone>",
    "address": "<district headquarters address>",
    "website": "<website>",
    "studentCount": "<approximate student count>",
    "schoolsInCity": ["<school name — type>"],
    "securityNote": "<Why school district contact is relevant to security — e.g. contractors working on school properties>"
  },
  "commercialSection": {
    "businessSecurityIntro": "<Opening paragraph for commercial security in this specific city — reference real commercial activity, business corridors, industrial areas, major employers>",
    "majorEmployers": ["<major employer or business area in this city>"],
    "commercialZones": ["<major commercial or industrial zone>"],
    "fireComplianceNote": "<Note about commercial fire alarm and sprinkler permit requirements in this city specifically>"
  },
  "fireSafetyPartners": {
    "sectionIntro": "<One sentence explaining why these partners are listed — commercial compliance focus>",
    "partners": [
      {
        "companyName": "<company name>",
        "serviceType": "<Fire Sprinklers | Fire Extinguishers | Exit Lighting | Fire Alarms>",
        "phone": "<phone if known>",
        "website": "<website if known>",
        "serviceArea": "<what areas they serve>",
        "note": "<one sentence about this company>"
      }
    ]
  },
  "serviceOfferings": {
    "residentialServices": ["<specific service offered in this city>"],
    "commercialServices": ["<specific commercial service offered in this city>"],
    "whyChooseUs": "<2-3 sentences specific to this city — mention proximity, response time, local knowledge, that the business actually serves this area from their nearby office>"
  },
  "testimonialPlaceholder": {
    "instruction": "<Tell the business what type of testimonial to get for this page>",
    "idealTestimonialProfile": "<Description of the ideal customer testimonial for this city page>"
  },
  "internalLinkingStrategy": {
    "linkToFromThisPage": ["<page on the site this city page should link to>"],
    "linkToThisPageFrom": ["<page on the site that should link back to this city page>"],
    "anchorTextSuggestions": ["<suggested anchor text for links to this page>"]
  },
  "schemaMarkupRecommendation": {
    "schemaType": "LocalBusiness",
    "serviceAreaNote": "<How to configure the service area schema for this city>",
    "additionalSchemas": ["<additional schema types relevant to this page>"]
  },
  "wordCountTarget": "<recommended word count for this page>",
  "keywordDensityGuide": {
    "primaryKeyword": "<exact primary keyword phrase>",
    "targetDensity": "<e.g. 2-3 times per 500 words>",
    "secondaryKeywords": ["<secondary keyword>"],
    "locationVariations": ["<location keyword variation to include naturally>"]
  }
}

CRITICAL RULES:

1. REAL DATA ONLY for emergency resources. Use your knowledge of the specific city to provide real phone numbers, real addresses, real department names. If you are not certain of a specific number, provide the best known information and flag it with a note to verify. Never fabricate numbers.

2. THE EMERGENCY RESOURCE SECTION is the secret weapon. This is what makes the page rank. A home security company page that lists the Wentzville Police non-emergency line, the Wentzville Fire Protection District phone, SCCAD ambulance stations, and SSM Health St. Joseph Hospital ER is providing genuine community value that Google rewards.

3. CITY-SPECIFIC CONTENT is mandatory. If the opening paragraph could apply to any city by swapping the name, it is wrong. Reference something real and specific about this city — growth rate, major employer, a real neighborhood, the actual county it is in, real development activity.

4. THE H1 MUST CONTAIN THE PRIMARY KEYWORD AND CITY NAME. Never a slogan. Never generic. Examples: "Home Security Systems in Wentzville, MO" or "Business Security Systems in O'Fallon, Missouri" — specific, keyword-first, location-included.

5. COMMERCIAL AND RESIDENTIAL VERSIONS: If the business serves both, the content should lean toward whichever version this page targets, with a mention of the other.

6. INTERNAL LINKING: Every city page must link up to its county hub and down from service pages. This builds the authority chain that makes the pages rank.

7. NEIGHBORING CITIES MENTIONS: Naturally mention 2-3 neighboring cities that this office also serves — this expands the geographic relevance signal without needing a separate page for each.

8. THE FIRE SAFETY PARTNERS SECTION for commercial pages is a trust signal and a community resource. These partners may even link back to the page, creating natural backlinks.

9. WORD COUNT: A thin city page (under 400 words) is a doorway page and will be penalized. Target 600-900 words of genuine, useful content.

10. SCHEMA: Every city page needs LocalBusiness schema with the service area set to this specific city.`;

export default function CityPageGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [nearestOffice, setNearestOffice] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [targetState, setTargetState] = useState("");
  const [pageType, setPageType] = useState("residential");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("metadata");
  const [copied, setCopied] = useState("");

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const runGenerator = useCallback(async () => {
    if (!targetCity.trim() || !businessName.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const userMessage = `Generate a complete, ready-to-publish local SEO city page for this business and city.

Business Name: ${businessName}
Business Type: ${businessType}
Business Primary Location / Nearest Office: ${nearestOffice || primaryLocation}
Target City: ${targetCity}
State: ${targetState}
Page Type: ${pageType === "residential" ? "Residential Home Security" : pageType === "commercial" ? "Commercial Business Security" : "Both Residential and Commercial"}
Additional Context: ${additionalContext || "None provided"}

Generate ALL content including real emergency resources for ${targetCity}, ${targetState}. Use your knowledge of this specific city. Provide real phone numbers and addresses for police, fire, EMS, hospital, city hall, and school district. Flag any numbers you are not certain of with [VERIFY] so the business owner can confirm them.

Make every section specific to ${targetCity} — not generic content with the city name swapped in. Reference real things about this city.`;

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
      setActiveTab("metadata");
    } catch (e) {
      setError("Generation failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [businessName, businessType, primaryLocation, nearestOffice, targetCity, targetState, pageType, additionalContext]);

  const CopyButton = ({ text, label }) => (
    <button onClick={() => copyText(text, label)} style={{
      background: copied === label ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.1)",
      border: `1px solid ${copied === label ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`,
      color: copied === label ? "#22c55e" : "#818cf8",
      fontSize: 10, padding: "3px 10px", borderRadius: 4,
      cursor: "pointer", fontFamily: "monospace", marginLeft: 8
    }}>
      {copied === label ? "✓ COPIED" : "COPY"}
    </button>
  );

  const InfoBlock = ({ label, value, color = "#94a3b8", copyable = false }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.08em" }}>{label}</span>
        {copyable && value && <CopyButton text={value} label={label} />}
      </div>
      <div style={{
        fontSize: 13, color, lineHeight: 1.6,
        background: "#060a12", border: "1px solid #1e293b",
        borderRadius: 6, padding: "10px 14px", fontFamily: copyable ? "monospace" : "inherit"
      }}>{value || "—"}</div>
    </div>
  );

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
            display: "inline-block", background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7",
            fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em",
            padding: "4px 12px", borderRadius: 2, marginBottom: 12
          }}>CITY PAGE GENERATOR v1.0</div>
          <h1 style={{
            fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)",
            letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1
          }}>City Page <span style={{ color: "#a855f7" }}>Generator</span></h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Generates complete city pages with real emergency resources · Proven to rank #1 · Ready to publish
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* PROOF BANNER */}
        <div style={{
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 8, padding: "14px 18px", marginBottom: 24
        }}>
          <p style={{ fontSize: 13, color: "#d8b4fe", margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: "#a855f7" }}>Proven Strategy:</strong> A Wentzville, MO city page built with real emergency resources — police non-emergency line, fire district phone, SCCAD ambulance stations, SSM Health ER — ranked #1 for home security searches in Wentzville almost consistently. This generator builds that same structure for any city.
          </p>
        </div>

        {/* INPUT */}
        <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "BUSINESS NAME", val: businessName, set: setBusinessName, ph: "Citywide Alarms" },
              { label: "BUSINESS TYPE", val: businessType, set: setBusinessType, ph: "Home & Business Security Systems" },
              { label: "NEAREST OFFICE TO THIS CITY", val: nearestOffice, set: setNearestOffice, ph: "965 Sycamore Dr, St. Charles, MO 63304" },
              { label: "PRIMARY WEBSITE LOCATION", val: primaryLocation, set: setPrimaryLocation, ph: "citywidealarms.com" },
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

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#a855f7", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>TARGET CITY ★</label>
              <input value={targetCity} onChange={e => setTargetCity(e.target.value)} placeholder="Wentzville"
                style={{
                  width: "100%", background: "#060a12", border: "1px solid rgba(168,85,247,0.4)",
                  borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 14,
                  outline: "none", boxSizing: "border-box", fontFamily: "monospace", fontWeight: 600
                }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#a855f7", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>STATE ★</label>
              <input value={targetState} onChange={e => setTargetState(e.target.value)} placeholder="MO"
                style={{
                  width: "100%", background: "#060a12", border: "1px solid rgba(168,85,247,0.4)",
                  borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 14,
                  outline: "none", boxSizing: "border-box", fontFamily: "monospace", fontWeight: 600
                }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>PAGE TYPE</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "residential", label: "🏠 Residential" },
                { id: "commercial", label: "🏢 Commercial" },
                { id: "both", label: "🏠🏢 Both" },
              ].map(type => (
                <button key={type.id} onClick={() => setPageType(type.id)} style={{
                  background: pageType === type.id ? "rgba(168,85,247,0.15)" : "transparent",
                  border: `1px solid ${pageType === type.id ? "rgba(168,85,247,0.5)" : "#1e293b"}`,
                  color: pageType === type.id ? "#d8b4fe" : "#64748b",
                  padding: "8px 20px", borderRadius: 6, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                }}>{type.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
              ADDITIONAL CONTEXT (local knowledge, major employers, specific areas to mention)
            </label>
            <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} rows={3}
              placeholder="e.g. Wentzville has the GM Assembly Plant, is fastest growing city in Missouri, major commercial corridor on Highway 70, Fort Zumwalt school district"
              style={{
                width: "100%", background: "#060a12", border: "1px solid #1e293b",
                borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 12,
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "monospace", lineHeight: 1.5
              }} />
          </div>

          <button onClick={runGenerator} disabled={loading || !targetCity.trim() || !businessName.trim()}
            style={{
              width: "100%",
              background: loading ? "#1e293b" : "linear-gradient(135deg,#a855f7,#7c3aed)",
              color: loading ? "#475569" : "#fff", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit'"
            }}>
            {loading ? `🏙️ Generating ${targetCity} City Page...` : `Generate ${targetCity || "City"} Page →`}
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 24, fontFamily: "monospace" }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏙️</div>
            <p style={{ color: "#a855f7", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Generating your {targetCity} city page...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Looking up emergency resources · Writing hyperlocal content · Building internal linking strategy
            </p>
          </div>
        )}

        {result && (
          <div>
            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "metadata", label: "🏷️ Page Metadata" },
                { id: "content", label: "📝 Page Content" },
                { id: "emergency", label: "🚨 Emergency Resources" },
                { id: "government", label: "🏛️ Local Government" },
                { id: "commercial", label: "🏢 Commercial" },
                { id: "seo", label: "🔍 SEO & Linking" },
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

            {/* METADATA TAB */}
            {activeTab === "metadata" && result.pageMetadata && (
              <div>
                <InfoBlock label="RECOMMENDED URL" value={result.pageMetadata.recommendedURL} color="#a855f7" copyable />
                <InfoBlock label="TITLE TAG (under 60 chars)" value={result.pageMetadata.titleTag} color="#f1f5f9" copyable />
                <InfoBlock label="META DESCRIPTION" value={result.pageMetadata.metaDescription} color="#94a3b8" copyable />
                <InfoBlock label="H1 TAG — USE THIS EXACTLY" value={result.pageMetadata.h1Tag} color="#22c55e" copyable />
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>H2 SUPPORTING TAGS</div>
                  {result.pageMetadata.h2Tags?.map((h2, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "#060a12", border: "1px solid #1e293b", borderLeft: "3px solid #818cf8",
                      borderRadius: 6, padding: "8px 14px", marginBottom: 6
                    }}>
                      <span style={{ fontSize: 13, color: "#c7d2fe", fontFamily: "monospace" }}>{h2}</span>
                      <CopyButton text={h2} label={`h2-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "monospace", marginBottom: 10 }}>HERO SECTION</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{result.heroSection?.headline}</div>
                  <div style={{ fontSize: 14, color: "#818cf8", marginBottom: 10, fontStyle: "italic" }}>{result.heroSection?.subheadline}</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{result.heroSection?.openingParagraph}</p>
                </div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "monospace", marginBottom: 10 }}>CITY CONTEXT</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 10px" }}>{result.cityContext?.cityDescription}</p>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 10px" }}>{result.cityContext?.localSecurityContext}</p>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>NEIGHBORING CITIES TO MENTION</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {result.cityContext?.neighboringCities?.map((city, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#d8b4fe", fontFamily: "monospace" }}>{city}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 10 }}>WHY CHOOSE US IN {targetCity.toUpperCase()}</div>
                  <p style={{ fontSize: 13, color: "#86efac", lineHeight: 1.7, margin: 0 }}>{result.serviceOfferings?.whyChooseUs}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "RESIDENTIAL SERVICES", items: result.serviceOfferings?.residentialServices, color: "#3b82f6" },
                    { label: "COMMERCIAL SERVICES", items: result.serviceOfferings?.commercialServices, color: "#a855f7" },
                  ].map((section, i) => (
                    <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: 10, color: section.color, fontFamily: "monospace", marginBottom: 10 }}>{section.label}</div>
                      {section.items?.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: section.color, flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMERGENCY TAB */}
            {activeTab === "emergency" && result.emergencyResources && (
              <div>
                <div style={{
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 16
                }}>
                  <p style={{ fontSize: 13, color: "#fca5a5", margin: 0, fontStyle: "italic" }}>{result.emergencyResources.sectionIntro}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* POLICE */}
                  <div style={{ background: "#0d1420", border: "1px solid rgba(59,130,246,0.3)", borderLeft: "3px solid #3b82f6", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>🚔 POLICE</div>
                    {Object.entries(result.emergencyResources.police || {}).map(([key, val], i) => val && (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                        <span style={{ fontSize: 12, color: key.includes("Number") || key.includes("Phone") ? "#93c5fd" : "#94a3b8", fontWeight: key.includes("Number") || key.includes("Phone") ? 700 : 400, fontFamily: key.includes("Number") || key.includes("Phone") ? "monospace" : "inherit" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {/* FIRE */}
                  <div style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.3)", borderLeft: "3px solid #ef4444", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>🚒 FIRE</div>
                    {Object.entries(result.emergencyResources.fire || {}).map(([key, val], i) => val && (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                        <span style={{ fontSize: 12, color: key === "phone" || key === "email" ? "#fca5a5" : "#94a3b8", fontWeight: key === "phone" ? 700 : 400, fontFamily: key === "phone" ? "monospace" : "inherit" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {/* EMS */}
                  <div style={{ background: "#0d1420", border: "1px solid rgba(245,158,11,0.3)", borderLeft: "3px solid #f59e0b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>🚑 EMS / AMBULANCE</div>
                    {Object.entries(result.emergencyResources.ems || {}).map(([key, val], i) => val && (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                        <span style={{ fontSize: 12, color: Array.isArray(val) ? "#94a3b8" : key.includes("Phone") ? "#fde68a" : "#94a3b8", fontFamily: key.includes("Phone") ? "monospace" : "inherit", fontWeight: key.includes("Phone") ? 700 : 400 }}>
                          {Array.isArray(val) ? val.join(", ") : val}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* HOSPITAL */}
                  <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderLeft: "3px solid #22c55e", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>🏥 NEAREST HOSPITAL</div>
                    {Object.entries(result.emergencyResources.hospital || {}).map(([key, val], i) => val !== undefined && (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                        <span style={{ fontSize: 12, color: key === "phone" ? "#86efac" : "#94a3b8", fontFamily: key === "phone" ? "monospace" : "inherit", fontWeight: key === "phone" ? 700 : 400 }}>
                          {typeof val === "boolean" ? (val ? "Yes" : "No") : val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* SCHOOL DISTRICT */}
                <div style={{ background: "#0d1420", border: "1px solid rgba(168,85,247,0.3)", borderLeft: "3px solid #a855f7", borderRadius: 8, padding: 16, marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#a855f7", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>🏫 SCHOOL DISTRICT</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {Object.entries(result.schoolDistrict || {}).filter(([k]) => !Array.isArray(result.schoolDistrict[k]) && k !== "schoolsInCity" && k !== "securityNote").map(([key, val], i) => val && (
                      <div key={i}>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                        <span style={{ fontSize: 12, color: key.includes("Phone") ? "#d8b4fe" : "#94a3b8", fontFamily: key.includes("Phone") ? "monospace" : "inherit", fontWeight: key.includes("Phone") ? 700 : 400 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {result.schoolDistrict?.securityNote && (
                    <div style={{ marginTop: 10, padding: 10, background: "rgba(168,85,247,0.06)", borderRadius: 4 }}>
                      <span style={{ fontSize: 12, color: "#d8b4fe" }}>{result.schoolDistrict.securityNote}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GOVERNMENT TAB */}
            {activeTab === "government" && result.localGovernment && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(20,184,166,0.3)", borderLeft: "3px solid #14b8a6", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#14b8a6", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>🏛️ CITY HALL</div>
                  {Object.entries(result.localGovernment.cityHall || {}).filter(([k]) => k !== "additionalContacts").map(([key, val], i) => val && (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                      <span style={{ fontSize: 12, color: key.includes("Phone") ? "#5eead4" : "#94a3b8", fontFamily: key.includes("Phone") ? "monospace" : "inherit", fontWeight: key.includes("Phone") ? 700 : 400 }}>{val}</span>
                    </div>
                  ))}
                  {result.localGovernment.cityHall?.additionalContacts?.map((contact, i) => (
                    <div key={i} style={{ marginTop: 8, padding: 8, background: "#060a12", borderRadius: 4 }}>
                      <span style={{ fontSize: 11, color: "#14b8a6", fontFamily: "monospace" }}>{contact.department}: </span>
                      <span style={{ fontSize: 12, color: "#5eead4", fontFamily: "monospace", fontWeight: 700 }}>{contact.phone}</span>
                      <span style={{ fontSize: 11, color: "#475569" }}> — {contact.purpose}</span>
                    </div>
                  ))}
                </div>
                {result.localGovernment.buildingPermits && (
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 8 }}>BUILDING PERMITS (Security System Installation)</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{result.localGovernment.buildingPermits.contact}</div>
                    <div style={{ fontSize: 14, color: "#5eead4", fontFamily: "monospace", fontWeight: 700, marginBottom: 8 }}>{result.localGovernment.buildingPermits.phone}</div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontStyle: "italic" }}>{result.localGovernment.buildingPermits.relevantNote}</p>
                  </div>
                )}
              </div>
            )}

            {/* COMMERCIAL TAB */}
            {activeTab === "commercial" && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "monospace", marginBottom: 10 }}>COMMERCIAL SECTION INTRO</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{result.commercialSection?.businessSecurityIntro}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "MAJOR EMPLOYERS / BUSINESS AREAS", items: result.commercialSection?.majorEmployers, color: "#818cf8" },
                    { label: "COMMERCIAL ZONES", items: result.commercialSection?.commercialZones, color: "#14b8a6" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 10, color: s.color, fontFamily: "monospace", marginBottom: 8 }}>{s.label}</div>
                      {s.items?.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: s.color }}>→</span>
                          <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Fire Safety Partners */}
                <div style={{ background: "#0d1420", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 6 }}>🔥 FIRE SAFETY PARTNERS</div>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px", fontStyle: "italic" }}>{result.fireSafetyPartners?.sectionIntro}</p>
                  {result.fireSafetyPartners?.partners?.map((partner, i) => (
                    <div key={i} style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: 6, padding: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{partner.companyName}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontFamily: "monospace" }}>{partner.serviceType}</span>
                        {partner.phone && <span style={{ fontSize: 12, color: "#fca5a5", fontFamily: "monospace", fontWeight: 700 }}>{partner.phone}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{partner.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === "seo" && (
              <div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 10 }}>🔍 KEYWORD DENSITY GUIDE</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>PRIMARY KEYWORD</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#c7d2fe", fontFamily: "monospace" }}>{result.keywordDensityGuide?.primaryKeyword}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Target density: {result.keywordDensityGuide?.targetDensity}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {result.keywordDensityGuide?.secondaryKeywords?.map((kw, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 3, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontFamily: "monospace" }}>{kw}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>LOCATION VARIATIONS TO USE NATURALLY</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {result.keywordDensityGuide?.locationVariations?.map((loc, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 3, background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", color: "#5eead4", fontFamily: "monospace" }}>{loc}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "LINK FROM THIS PAGE TO", items: result.internalLinkingStrategy?.linkToFromThisPage, color: "#22c55e" },
                    { label: "LINK TO THIS PAGE FROM", items: result.internalLinkingStrategy?.linkToThisPageFrom, color: "#3b82f6" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 10, color: s.color, fontFamily: "monospace", marginBottom: 8 }}>{s.label}</div>
                      {s.items?.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: s.color }}>→</span>
                          <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 8 }}>ANCHOR TEXT FOR LINKS TO THIS PAGE</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {result.internalLinkingStrategy?.anchorTextSuggestions?.map((anchor, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 4, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fde68a" }}>{anchor}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#0d1420", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 8 }}>WORD COUNT TARGET</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#86efac", fontFamily: "monospace" }}>{result.wordCountTarget}</div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "8px 0 0" }}>Under 400 words = thin content penalty. 600-900 words of genuine local content is the target.</p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
