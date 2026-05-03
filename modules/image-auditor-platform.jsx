import { useState, useCallback } from "react";

const SYSTEM_PROMPT = `You are the world's most sophisticated website technical image and performance auditor. You were built on the methodology of an SEO expert who grew a company from $200,000 to $2,500,000 in annual revenue through organic search — and who knows that JPG images, slow load times, rotating carousels, stock photos, and poorly named images are silent killers of search rankings and conversions.

You think like Google's PageSpeed and Core Web Vitals team combined with a forensic SEO investigator.

Given information about a website's images, page structure, and performance indicators, produce a complete technical audit in this EXACT JSON format (respond ONLY with valid JSON, no markdown, no preamble):

{
  "overallGrade": "<A | B | C | D | F>",
  "overallVerdict": "<One brutal honest sentence about the site's technical image and performance health>",
  "loadSpeedAssessment": {
    "estimated4GLoadTime": "<estimated load time on 4G — e.g. 4.2 seconds>",
    "passesOneSecondStandard": <true | false>,
    "biggestLoadKillers": ["<specific element killing speed>", "<specific element>"],
    "coreWebVitalsRisk": "<LOW | MEDIUM | HIGH | CRITICAL>",
    "carouselDetected": <true | false>,
    "carouselImpact": "<If carousel detected, explain exactly how much load time it is adding and why it should be removed from above the fold. If not detected, say none detected.>",
    "carouselRecommendation": "<Specific fix>",
    "otherAboveFoldProblems": ["<specific problem above the fold>"]
  },
  "imageFormatAudit": {
    "summary": "<Overall assessment of image formats across the site>",
    "jpgCount": <number of jpg images found or estimated>,
    "pngCount": <number of png images>,
    "webpCount": <number of webp images>,
    "avifCount": <number of avif images>,
    "otherCount": <number of other formats>,
    "formatGrade": "<A | B | C | D | F>",
    "images": [
      {
        "imageName": "<filename or description>",
        "currentFormat": "<jpg | png | webp | avif | unknown>",
        "estimatedFileSize": "<estimated size>",
        "problem": "<specific problem with this image>",
        "recommendation": "<exact fix>",
        "priority": "<CRITICAL | HIGH | MEDIUM | LOW>",
        "convertTo": "<webp | avif | keep>",
        "estimatedSizeReduction": "<e.g. 60% smaller as WebP>"
      }
    ],
    "totalEstimatedPageWeightReduction": "<e.g. Estimated 2.4MB reduction by converting all to WebP>"
  },
  "imageNamingAudit": {
    "summary": "<Overall assessment of image naming across the site>",
    "namingGrade": "<A | B | C | D | F>",
    "genericNamesFound": <number>,
    "images": [
      {
        "currentName": "<current filename>",
        "problem": "<what is wrong with this name — generic, no keywords, no location, etc>",
        "recommendedName": "<exact new filename — specific to the business, service, and location>",
        "currentAltText": "<current alt text or MISSING>",
        "recommendedAltText": "<exact replacement alt text — specific, keyword-rich, descriptive>",
        "seoImpact": "<what ranking signal this properly named image will send>"
      }
    ]
  },
  "imageOriginalityAudit": {
    "summary": "<Assessment of whether images appear to be original or stock/manufacturer>",
    "originalityGrade": "<A | B | C | D | F>",
    "stockImageRisk": "<LOW | MEDIUM | HIGH | CRITICAL>",
    "flaggedImages": [
      {
        "imageName": "<filename or description>",
        "reason": "<Why this appears to be stock or manufacturer content>",
        "risk": "<How this hurts Google rankings specifically>",
        "replacement": "<What original photo should replace this>"
      }
    ],
    "theStockPhotoRule": "Google's image index knows when the same image appears on thousands of sites. Stock photos and manufacturer product images send a duplicate content signal that discounts the entire page. Original photography of your actual team, vehicles, installations, and office builds a unique content moat that cannot be copied.",
    "originalPhotosNeeded": ["<specific original photo to take>", "<specific photo>", "<specific photo>"]
  },
  "lazyLoadingAudit": {
    "detected": <true | false | unknown>,
    "assessment": "<Is lazy loading implemented for below-fold images?>",
    "impact": "<What this means for load speed>",
    "recommendation": "<Specific fix if needed>"
  },
  "prioritizedFixList": [
    {
      "priority": 1,
      "category": "<FORMAT | NAMING | ORIGINALITY | CAROUSEL | LAZY_LOAD | ALT_TEXT>",
      "fix": "<Exact specific action to take>",
      "effort": "<15 minutes | 1 hour | half day | full day>",
      "impact": "<Specific expected improvement in load speed or rankings>",
      "doThis": "<The exact step-by-step action — specific enough to hand to a developer today>"
    }
  ],
  "developerBriefing": "<A paragraph written to hand directly to a web developer explaining every image and performance fix needed, in technical language they will understand immediately>"
}

CRITICAL RULES:

1. JPG IS NEVER ACCEPTABLE on a modern website. WebP provides 25-35% better compression than JPG at the same quality. AVIF provides 50% better compression than WebP. Flag every JPG as a critical issue.

2. PNG IS RARELY ACCEPTABLE unless the image requires transparency. Even then WebP supports transparency. Flag every PNG that does not require transparency.

3. THE ONE SECOND RULE: A page must render its main content in under 1 second on a 4G mobile connection. This is not a preference — it is the standard. Most local searches happen on mobile. A 3-second load on 4G loses the customer before they see your name.

4. ROTATING CAROUSELS IN THE HERO SECTION are one of the most damaging elements a website can have above the fold. They require multiple large images to download simultaneously, use JavaScript that blocks rendering, and research shows users almost never see slide 2. The fix is always a single static hero image — never a carousel at the top of a page.

5. IMAGE NAMING: IMG_4892.jpg tells Google nothing. citywide-alarms-security-camera-installation-st-charles-mo.webp tells Google exactly what the image shows, what business took it, what service it depicts, and where it was taken. Every single image should be named this way.

6. ALT TEXT: Missing alt text loses accessibility scores and image search rankings. Generic alt text like "security camera" is almost as bad. Specific alt text like "Citywide Alarms technician installing outdoor security camera system at commercial property in St. Charles Missouri" sends a precise ranking signal.

7. STOCK PHOTO DETECTION: Any image that appears on thousands of other sites (manufacturer product photos, generic business stock photography, Getty/Shutterstock style images) is flagged. Google knows. Original photography is a competitive moat.

8. LAZY LOADING: Images below the fold that load immediately are wasting bandwidth and slowing the initial page render. Every below-fold image should have loading="lazy" attribute.

9. IMAGE DIMENSIONS: A 4000x3000 pixel image displayed at 400x300 pixels is downloading 10x more data than needed. Flag oversized images.

10. BE SPECIFIC: Never give generic advice. Give the exact filename to use, the exact alt text to write, the exact developer instruction to implement.`;

const gradeColor = { A: "#22c55e", B: "#84cc16", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
const priorityColor = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#64748b" };
const riskColor = { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };
const catColor = {
  FORMAT: "#ef4444", NAMING: "#818cf8", ORIGINALITY: "#f59e0b",
  CAROUSEL: "#ec4899", LAZY_LOAD: "#14b8a6", ALT_TEXT: "#3b82f6"
};

function GradeBox({ grade, label }) {
  const c = gradeColor[grade] || "#64748b";
  return (
    <div style={{
      background: `${c}10`, border: `1px solid ${c}40`,
      borderRadius: 8, padding: "12px 16px", textAlign: "center", minWidth: 80
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: c, fontFamily: "monospace", lineHeight: 1 }}>{grade}</div>
      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 4, letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

function FixCard({ fix, index }) {
  const cc = catColor[fix.category] || "#64748b";
  return (
    <div style={{
      background: "#0d1420", border: "1px solid #1e293b",
      borderLeft: `4px solid ${cc}`, borderRadius: 8, padding: 18, marginBottom: 10
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 6, flexShrink: 0,
          background: `${cc}15`, border: `1px solid ${cc}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: cc, fontFamily: "monospace"
        }}>{fix.priority}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
              background: `${cc}15`, border: `1px solid ${cc}30`, color: cc
            }}>{fix.category}</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
              background: "rgba(100,116,139,0.1)", border: "1px solid #1e293b", color: "#64748b"
            }}>{fix.effort}</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", margin: "0 0 8px" }}>{fix.fix}</p>
          <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>IMPACT → </span>
            <span style={{ fontSize: 12, color: "#86efac" }}>{fix.impact}</span>
          </div>
          <div style={{ padding: 10, background: "rgba(99,102,241,0.06)", borderLeft: "2px solid #6366f1", borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", marginBottom: 4 }}>DO THIS →</div>
            <p style={{ fontSize: 12, color: "#c7d2fe", margin: 0, lineHeight: 1.6 }}>{fix.doThis}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageAuditor() {
  const [domain, setDomain] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [imageList, setImageList] = useState("");
  const [pageNotes, setPageNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("speed");

  const runAudit = useCallback(async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const userMessage = `Perform a complete image format, naming, originality, load speed, and carousel audit for this website.

Domain: ${domain}
Business Type: ${businessType || "Not specified — infer from domain"}
Location: ${location || "Not specified — infer from domain"}

Images found on this site (filenames, formats, alt text if known):
${imageList || "Not provided — analyze based on typical patterns for this type of business website and flag likely issues"}

Additional page structure notes (carousels, hero sections, page weight indicators):
${pageNotes || "Not provided — make reasonable assumptions based on business type and flag common issues"}

Analyze everything. Be brutally specific. Write exact replacement filenames, exact alt text, exact developer instructions. Flag every JPG, every stock photo risk, every carousel, every missing lazy load. Write the prioritized fix list as if you are handing it to a developer who will implement it today.`;

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
      setActiveTab("speed");
    } catch (e) {
      setError("Audit failed. " + e.message);
    } finally {
      setLoading(false);
    }
  }, [domain, businessType, location, imageList, pageNotes]);

  const og = result?.overallGrade;
  const ogc = gradeColor[og] || "#64748b";

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
            display: "inline-block", background: "rgba(20,184,166,0.1)",
            border: "1px solid rgba(20,184,166,0.3)", color: "#14b8a6",
            fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em",
            padding: "4px 12px", borderRadius: 2, marginBottom: 12
          }}>IMAGE & PERFORMANCE AUDIT ENGINE v1.0</div>
          <h1 style={{
            fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,58px)",
            letterSpacing: "0.04em", margin: "0 0 8px", color: "#fff", lineHeight: 1
          }}>Image <span style={{ color: "#14b8a6" }}>Auditor</span> + Speed</h1>
          <p style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace", margin: 0 }}>
            Flags every JPG · Detects carousels killing load time · Catches stock photos · Writes exact image names and alt text
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* RULE BANNER */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24
        }}>
          {[
            { icon: "🖼️", rule: "JPG = Never Acceptable", sub: "WebP cuts file size 30%. AVIF cuts 50%." },
            { icon: "⚡", rule: "1 Second Rule on 4G", sub: "Local searches happen on mobile. Speed is customers." },
            { icon: "🎠", rule: "No Hero Carousels", sub: "Users never see slide 2. It kills load time." },
          ].map((r, i) => (
            <div key={i} style={{
              background: "#0d1420", border: "1px solid #1e293b",
              borderRadius: 8, padding: "12px 14px"
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>{r.rule}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{r.sub}</div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={{
          background: "#0d1420", border: "1px solid #1e293b",
          borderRadius: 10, padding: 24, marginBottom: 28
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "WEBSITE DOMAIN", val: domain, set: setDomain, ph: "guardiansecurity.com" },
              { label: "BUSINESS TYPE", val: businessType, set: setBusinessType, ph: "Home Security Company" },
              { label: "CITY / LOCATION", val: location, set: setLocation, ph: "Seattle, WA" },
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

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
              IMAGE LIST (paste filenames, formats, alt text — one per line. Leave blank to get a general audit based on business type)
            </label>
            <textarea value={imageList} onChange={e => setImageList(e.target.value)} rows={5}
              placeholder={`Examples:\nIMG_4892.jpg — hero image, no alt text\nlogo.png — header logo\nsecurity-camera.jpg — alt: "camera"\nslide1.jpg, slide2.jpg, slide3.jpg — rotating carousel hero\nproduct-photo-honeywell.jpg — manufacturer image, no alt`}
              style={{
                width: "100%", background: "#060a12", border: "1px solid #1e293b",
                borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 12,
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "monospace", lineHeight: 1.6
              }} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
              PAGE STRUCTURE NOTES (carousel? heavy hero? estimated page weight? mobile issues?)
            </label>
            <textarea value={pageNotes} onChange={e => setPageNotes(e.target.value)} rows={3}
              placeholder="e.g. Homepage has rotating carousel with 5 slides. Hero image appears to be stock photo of generic house. No lazy loading visible. Page feels slow on mobile."
              style={{
                width: "100%", background: "#060a12", border: "1px solid #1e293b",
                borderRadius: 6, padding: "10px 12px", color: "#f1f5f9", fontSize: 12,
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "monospace", lineHeight: 1.6
              }} />
          </div>

          <button onClick={runAudit} disabled={loading || !domain.trim()}
            style={{
              width: "100%", background: loading ? "#1e293b" : "linear-gradient(135deg,#14b8a6,#0891b2)",
              color: loading ? "#475569" : "#fff", border: "none", borderRadius: 8,
              padding: 14, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Outfit'", letterSpacing: "0.02em"
            }}
          >
            {loading ? "🔬 Analyzing Images, Formats, Speed, and Carousels..." : "Run Image & Performance Audit →"}
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "14px 18px", color: "#fca5a5", fontSize: 13,
            marginBottom: 24, fontFamily: "monospace"
          }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
            <p style={{ color: "#14b8a6", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Scanning every image signal...</p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
              Checking formats · Analyzing load speed · Detecting carousels · Auditing naming · Flagging stock photos
            </p>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div>
            {/* OVERALL */}
            <div style={{
              background: "#0d1420", border: `2px solid ${ogc}`,
              borderRadius: 10, padding: 24, marginBottom: 20,
              display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap"
            }}>
              <GradeBox grade={result.overallGrade} label="OVERALL" />
              <GradeBox grade={result.imageFormatAudit?.formatGrade} label="FORMATS" />
              <GradeBox grade={result.imageNamingAudit?.namingGrade} label="NAMING" />
              <GradeBox grade={result.imageOriginalityAudit?.originalityGrade} label="ORIGINALITY" />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 8 }}>OVERALL VERDICT</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 12px", lineHeight: 1.5 }}>
                  {result.overallVerdict}
                </p>
                {/* Speed indicators */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{
                    padding: "6px 14px", borderRadius: 6,
                    background: result.loadSpeedAssessment?.passesOneSecondStandard ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${result.loadSpeedAssessment?.passesOneSecondStandard ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: result.loadSpeedAssessment?.passesOneSecondStandard ? "#22c55e" : "#ef4444",
                    fontSize: 12, fontFamily: "monospace"
                  }}>
                    4G Load: {result.loadSpeedAssessment?.estimated4GLoadTime}
                  </div>
                  {result.loadSpeedAssessment?.carouselDetected && (
                    <div style={{
                      padding: "6px 14px", borderRadius: 6,
                      background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)",
                      color: "#ec4899", fontSize: 12, fontFamily: "monospace"
                    }}>🎠 CAROUSEL DETECTED</div>
                  )}
                  <div style={{
                    padding: "6px 14px", borderRadius: 6,
                    background: `${riskColor[result.loadSpeedAssessment?.coreWebVitalsRisk] || "#64748b"}10`,
                    border: `1px solid ${riskColor[result.loadSpeedAssessment?.coreWebVitalsRisk] || "#64748b"}30`,
                    color: riskColor[result.loadSpeedAssessment?.coreWebVitalsRisk] || "#64748b",
                    fontSize: 12, fontFamily: "monospace"
                  }}>
                    Core Web Vitals: {result.loadSpeedAssessment?.coreWebVitalsRisk}
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "speed", label: "⚡ Speed & Carousel" },
                { id: "formats", label: `🖼️ Image Formats (${result.imageFormatAudit?.images?.length || 0})` },
                { id: "naming", label: `📛 Naming & Alt Text (${result.imageNamingAudit?.images?.length || 0})` },
                { id: "originality", label: "🔍 Originality Check" },
                { id: "fixes", label: `🔧 Fix List (${result.prioritizedFixList?.length || 0})` },
                { id: "dev", label: "👨‍💻 Developer Brief" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: activeTab === tab.id ? "#1e293b" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "#334155" : "#1e293b"}`,
                  borderRadius: 6, padding: "8px 14px",
                  color: activeTab === tab.id ? "#f1f5f9" : "#64748b",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  fontFamily: "monospace", transition: "all 0.2s"
                }}>{tab.label}</button>
              ))}
            </div>

            {/* SPEED TAB */}
            {activeTab === "speed" && result.loadSpeedAssessment && (
              <div>
                {result.loadSpeedAssessment.carouselDetected && (
                  <div style={{
                    background: "rgba(236,72,153,0.08)", border: "2px solid rgba(236,72,153,0.4)",
                    borderRadius: 10, padding: 20, marginBottom: 16
                  }}>
                    <div style={{ fontSize: 11, color: "#ec4899", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
                      🎠 ROTATING CAROUSEL DETECTED — CRITICAL ISSUE
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f9a8d4", margin: "0 0 10px", lineHeight: 1.5 }}>
                      {result.loadSpeedAssessment.carouselImpact}
                    </p>
                    <div style={{ padding: 12, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                      <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>FIX →</div>
                      <p style={{ fontSize: 13, color: "#86efac", margin: 0 }}>{result.loadSpeedAssessment.carouselRecommendation}</p>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 8 }}>BIGGEST LOAD KILLERS</div>
                    {result.loadSpeedAssessment.biggestLoadKillers?.map((k, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#ef4444", flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{k}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 8 }}>ABOVE THE FOLD PROBLEMS</div>
                    {result.loadSpeedAssessment.otherAboveFoldProblems?.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.lazyLoadingAudit && (
                  <div style={{
                    background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16
                  }}>
                    <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace", marginBottom: 6 }}>LAZY LOADING STATUS</div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 8px" }}>{result.lazyLoadingAudit.assessment}</p>
                    <p style={{ fontSize: 12, color: "#fbbf24", margin: "0 0 6px" }}>{result.lazyLoadingAudit.impact}</p>
                    <p style={{ fontSize: 12, color: "#86efac", margin: 0 }}>Fix: {result.lazyLoadingAudit.recommendation}</p>
                  </div>
                )}
              </div>
            )}

            {/* FORMATS TAB */}
            {activeTab === "formats" && result.imageFormatAudit && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "JPG", count: result.imageFormatAudit.jpgCount, color: "#ef4444", note: "NEVER" },
                    { label: "PNG", count: result.imageFormatAudit.pngCount, color: "#f59e0b", note: "AVOID" },
                    { label: "WebP", count: result.imageFormatAudit.webpCount, color: "#22c55e", note: "GOOD" },
                    { label: "AVIF", count: result.imageFormatAudit.avifCount, color: "#14b8a6", note: "BEST" },
                    { label: "Other", count: result.imageFormatAudit.otherCount, color: "#64748b", note: "CHECK" },
                  ].map((f, i) => (
                    <div key={i} style={{
                      background: "#0d1420", border: `1px solid ${f.color}30`,
                      borderRadius: 8, padding: "10px 12px", textAlign: "center"
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: f.color, fontFamily: "monospace" }}>{f.count}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{f.label}</div>
                      <div style={{ fontSize: 9, color: f.color, fontFamily: "monospace", letterSpacing: "0.1em" }}>{f.note}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 16
                }}>
                  <span style={{ fontSize: 11, color: "#818cf8", fontFamily: "monospace" }}>TOTAL ESTIMATED SAVINGS → </span>
                  <span style={{ fontSize: 13, color: "#c7d2fe", fontWeight: 600 }}>{result.imageFormatAudit.totalEstimatedPageWeightReduction}</span>
                </div>
                {result.imageFormatAudit.images?.map((img, i) => (
                  <div key={i} style={{
                    background: "#0d1420",
                    border: `1px solid ${priorityColor[img.priority] || "#1e293b"}30`,
                    borderLeft: `3px solid ${priorityColor[img.priority] || "#1e293b"}`,
                    borderRadius: 8, padding: 14, marginBottom: 8
                  }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>{img.imageName}</div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 3,
                            background: (img.currentFormat === "jpg" || img.currentFormat === "png") ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                            border: `1px solid ${(img.currentFormat === "jpg" || img.currentFormat === "png") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                            color: (img.currentFormat === "jpg" || img.currentFormat === "png") ? "#fca5a5" : "#86efac",
                            fontFamily: "monospace", textTransform: "uppercase"
                          }}>{img.currentFormat}</span>
                          <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{img.estimatedFileSize}</span>
                          <span style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
                            background: `${priorityColor[img.priority] || "#64748b"}15`,
                            border: `1px solid ${priorityColor[img.priority] || "#64748b"}30`,
                            color: priorityColor[img.priority] || "#64748b"
                          }}>{img.priority}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 6px" }}>{img.problem}</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace" }}>→ Convert to {img.convertTo?.toUpperCase()}</span>
                          <span style={{ fontSize: 11, color: "#14b8a6", fontFamily: "monospace" }}>{img.estimatedSizeReduction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NAMING TAB */}
            {activeTab === "naming" && result.imageNamingAudit && (
              <div>
                <div style={{
                  background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 16
                }}>
                  <p style={{ fontSize: 13, color: "#c7d2fe", margin: 0 }}>{result.imageNamingAudit.summary}</p>
                </div>
                {result.imageNamingAudit.images?.map((img, i) => (
                  <div key={i} style={{
                    background: "#0d1420", border: "1px solid #1e293b",
                    borderLeft: "3px solid #818cf8", borderRadius: 8, padding: 16, marginBottom: 10
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "monospace", marginBottom: 4 }}>CURRENT NAME</div>
                        <div style={{ fontSize: 13, color: "#fca5a5", fontFamily: "monospace", marginBottom: 8, wordBreak: "break-all" }}>{img.currentName}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>CURRENT ALT TEXT</div>
                        <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", fontStyle: img.currentAltText === "MISSING" ? "italic" : "normal" }}>
                          {img.currentAltText}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 4 }}>RENAME TO</div>
                        <div style={{ fontSize: 13, color: "#86efac", fontFamily: "monospace", marginBottom: 8, wordBreak: "break-all" }}>{img.recommendedName}</div>
                        <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace", marginBottom: 4 }}>NEW ALT TEXT</div>
                        <div style={{ fontSize: 12, color: "#5eead4" }}>{img.recommendedAltText}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, padding: 10, background: "rgba(99,102,241,0.06)", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace" }}>SEO SIGNAL → </span>
                      <span style={{ fontSize: 12, color: "#a5b4fc" }}>{img.seoImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORIGINALITY TAB */}
            {activeTab === "originality" && result.imageOriginalityAudit && (
              <div>
                <div style={{
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: 8, padding: 16, marginBottom: 16
                }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "monospace", marginBottom: 8 }}>THE STOCK PHOTO RULE</div>
                  <p style={{ fontSize: 13, color: "#fde68a", margin: 0, lineHeight: 1.7 }}>
                    {result.imageOriginalityAudit.theStockPhotoRule}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{
                    padding: "8px 16px", borderRadius: 6, fontFamily: "monospace", fontSize: 12,
                    background: `${riskColor[result.imageOriginalityAudit.stockImageRisk] || "#64748b"}10`,
                    border: `1px solid ${riskColor[result.imageOriginalityAudit.stockImageRisk] || "#64748b"}30`,
                    color: riskColor[result.imageOriginalityAudit.stockImageRisk] || "#64748b"
                  }}>Stock Risk: {result.imageOriginalityAudit.stockImageRisk}</div>
                </div>
                {result.imageOriginalityAudit.flaggedImages?.map((img, i) => (
                  <div key={i} style={{
                    background: "#0d1420", border: "1px solid rgba(245,158,11,0.3)",
                    borderLeft: "3px solid #f59e0b", borderRadius: 8, padding: 16, marginBottom: 10
                  }}>
                    <div style={{ fontSize: 12, color: "#fbbf24", fontFamily: "monospace", marginBottom: 6 }}>{img.imageName}</div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 8px" }}>{img.reason}</p>
                    <p style={{ fontSize: 12, color: "#fca5a5", margin: "0 0 8px" }}>⚠ {img.risk}</p>
                    <div style={{ padding: 10, background: "rgba(34,197,94,0.06)", borderLeft: "2px solid #22c55e", borderRadius: 4 }}>
                      <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>REPLACE WITH → </span>
                      <span style={{ fontSize: 12, color: "#86efac" }}>{img.replacement}</span>
                    </div>
                  </div>
                ))}
                {result.imageOriginalityAudit.originalPhotosNeeded?.length > 0 && (
                  <div style={{ background: "#0d1420", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginTop: 16 }}>
                    <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", marginBottom: 10 }}>ORIGINAL PHOTOS TO TAKE — SCHEDULE THESE</div>
                    {result.imageOriginalityAudit.originalPhotosNeeded.map((photo, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#22c55e", flexShrink: 0, fontFamily: "monospace" }}>📷</span>
                        <span style={{ fontSize: 13, color: "#86efac" }}>{photo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FIX LIST TAB */}
            {activeTab === "fixes" && (
              <div>
                {result.prioritizedFixList?.map((fix, i) => <FixCard key={i} fix={fix} index={i} />)}
              </div>
            )}

            {/* DEVELOPER BRIEF TAB */}
            {activeTab === "dev" && (
              <div style={{
                background: "#0d1420", border: "1px solid #1e293b",
                borderRadius: 10, padding: 24
              }}>
                <div style={{ fontSize: 10, color: "#14b8a6", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>
                  👨‍💻 DEVELOPER BRIEFING — HAND THIS DIRECTLY TO YOUR DEVELOPER
                </div>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>
                  {result.developerBriefing}
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
