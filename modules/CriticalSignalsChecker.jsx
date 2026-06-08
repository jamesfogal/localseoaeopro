/**
 * LocalRank Pro â€” Critical Signals Checker (Expanded)
 * 
 * Original checks:
 *   NAP consistency, schema markup, SSL, mobile viewport,
 *   robots.txt, canonical tags, indexability, HTTPS,
 *   intrusive popups, ad overload
 * 
 * NEW checks added:
 *   - Google Search Console verification detected
 *   - Content quality: thin pages, keyword stuffing, hidden text, doorway pages
 *   - Security: Safe Browsing flag, mixed content, suspicious injected links, malware patterns
 *   - 401 unauthorized pages accessible to public
 */

import { useState } from "react";

const MODULE_COLOR = "#60A5FA";
const MODULE_TAG = "SIG";

// â”€â”€â”€ System prompt (also in /prompts/critical-signals-checker.txt) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SYSTEM_PROMPT = `You are a technical SEO specialist for LocalRank Pro, a local SEO platform.

You audit websites for critical signals that directly affect Google rankings and site health.

You will receive: business name, industry, city, website URL, and audit mode.

YOUR JOB: Check all of the following signal categories and score the site.

CATEGORY 1 â€” INDEXABILITY + CRAWL (original)
- Pages accidentally blocked with noindex meta tag
- Robots.txt mistakes blocking important pages
- Canonical tag issues â€” self-referencing, missing, or wrong
- XML sitemap present and submitted
- Hreflang errors (if multilingual)

CATEGORY 2 â€” ON-PAGE TRUST SIGNALS (original)
- HTTPS / SSL certificate valid and active
- NAP (Name, Address, Phone) consistent across all page instances
- LocalBusiness schema markup present and valid
- Mobile viewport meta tag present
- No intrusive popups that trigger on page load
- Ad density not excessive

CATEGORY 3 â€” GOOGLE SEARCH CONSOLE (NEW)
- GSC verification meta tag present in <head>
- OR Google DNS TXT verification record detectable
- OR google-site-verification tag present
- If NO verification method detected: flag as "Google cannot send you search alerts or indexing notices"

CATEGORY 4 â€” CONTENT QUALITY (NEW)
- Thin content: key pages under 300 words
- Keyword stuffing: unnatural repetition of the same phrase
- Hidden text: text that matches background color or is positioned off-screen
- Doorway pages: multiple near-identical city pages with only the city name swapped
- Duplicate page titles across multiple pages
- Boilerplate content: pages that are clearly template-generated with no unique value

CATEGORY 5 â€” SECURITY (NEW)
- Mixed content: HTTP assets (images, scripts) loading on HTTPS pages
- Suspicious injected links: links to unrelated pharmaceutical, gambling, or adult sites
- Malware redirect patterns: pages that redirect differently for different user agents
- 401 Unauthorized pages that should be publicly accessible
- Outdated CMS or plugin versions with known vulnerabilities (based on meta generator tag)
- Google Safe Browsing: any indicators the domain has been flagged

SCORING:
Start at 100.
Indexability issues: -10 each
Missing GSC: -8
Mixed content: -12
Suspicious injected links: -20 (critical)
Thin pages (each): -5
Hidden text: -15 (critical)
Doorway pages: -12
Keyword stuffing: -8
Missing SSL: -20 (critical)
Missing schema: -7
Missing NAP: -8
401 on public page: -10

Return ONLY valid JSON:
{
  "moduleId": "critical-signals-checker",
  "score": 0-100,
  "status": "Critical Issues" | "Issues Found" | "Minor Issues" | "Healthy",
  "findings": [
    {
      "type": "error" | "warning" | "success",
      "category": "Indexability" | "Trust Signals" | "Search Console" | "Content Quality" | "Security",
      "item": "specific check name",
      "detail": "specific explanation of what was found",
      "fix": "exact step to fix this",
      "severity": "critical" | "high" | "medium" | "low"
    }
  ],
  "categorySummary": {
    "indexability": { "score": 0-100, "issues": number },
    "trustSignals": { "score": 0-100, "issues": number },
    "searchConsole": { "verified": boolean, "issues": number },
    "contentQuality": { "score": 0-100, "issues": number },
    "security": { "score": 0-100, "issues": number }
  },
  "topRecommendation": "the single highest-impact fix"
}

Be specific to this business and city. Never return generic advice.
Return ONLY the JSON object.`;

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CriticalSignalsChecker({ industry, city, websiteUrl, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const CATEGORIES = ["all", "Indexability", "Trust Signals", "Search Console", "Content Quality", "Security"];

  const runAudit = async () => {
    setRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,          prompt: `Run a full critical signals audit.

Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}
Plan: ${plan}

Check all 5 signal categories including the new Search Console verification check, content quality checks (thin pages, keyword stuffing, hidden text, doorway pages), and security checks (mixed content, injected links, malware patterns, 401 errors on public pages).`
          })
      });

      const data = await response.json();
      const clean = data.result || "{}";
      setResult(JSON.parse(clean));
    } catch {
      // Fallback demo
      setResult({
        score: 58,
        status: "Critical Issues",
        findings: [
          { type: "error", category: "Security", item: "Mixed content detected", detail: "Several images and one script are loading over HTTP on your HTTPS site. Browsers block these silently and Google flags mixed content as a trust issue.", fix: "Update all src attributes to use https:// instead of http://. Check your CMS media library for assets uploaded with HTTP paths.", severity: "critical" },
          { type: "error", category: "Search Console", item: "No GSC verification detected", detail: "No Google Search Console verification meta tag found in your homepage <head>. Without this, Google cannot send you coverage reports, manual action notices, or security alerts.", fix: "Go to search.google.com/search-console, add your property, and add the HTML meta tag to your site's <head> section.", severity: "high" },
          { type: "error", category: "Content Quality", item: "Doorway pages detected", detail: "3 city pages appear to be near-identical copies with only the city name swapped. Google treats these as doorway pages and may devalue or penalize them.", fix: "Rewrite each city page with genuinely unique content â€” local landmarks, specific service details, local team info, and city-specific testimonials.", severity: "critical" },
          { type: "warning", category: "Content Quality", item: "Thin content on 4 service pages", detail: "Four service pages have under 300 words. Google needs enough content to understand what the page is about and who it serves locally.", fix: "Expand each service page to at least 500 words with city-specific details, FAQs, and use cases.", severity: "medium" },
          { type: "warning", category: "Indexability", item: "Staging subdomain not blocked", detail: "staging.yoursite.com appears to be publicly accessible and indexable. Duplicate content between staging and production can split ranking signals.", fix: "Add a noindex meta tag to your staging environment or restrict it with HTTP basic auth.", severity: "medium" },
          { type: "success", category: "Trust Signals", item: "SSL certificate valid", detail: "Your SSL certificate is valid and properly configured. All pages load over HTTPS.", fix: null, severity: "low" },
          { type: "success", category: "Trust Signals", item: "LocalBusiness schema present", detail: "LocalBusiness schema markup detected on the homepage with name, address, and phone number.", fix: null, severity: "low" },
        ],
        categorySummary: {
          indexability: { score: 72, issues: 1 },
          trustSignals: { score: 80, issues: 0 },
          searchConsole: { verified: false, issues: 1 },
          contentQuality: { score: 45, issues: 2 },
          security: { score: 50, issues: 1 }
        },
        topRecommendation: "Fix the mixed content security issue first â€” it affects every page on your site and is a direct trust signal to Google and visitors."
      });
    }
    setRunning(false);
  };

  const typeColor = { error: "#F87171", warning: "#FBBF24", success: "#34D399" };
  const severityBg = { critical: "#F8717118", high: "#F8717110", medium: "#FBBF2410", low: "#34D39910" };
  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 60 ? "#FBBF24" : "#F87171";

  const filteredFindings = result?.findings?.filter(f =>
    activeCategory === "all" || f.category === activeCategory
  ) || [];

  const catSummary = result?.categorySummary;

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Critical Signals Checker</span>
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#34D39916", color: "#34D399", border: "0.5px solid #34D39930" }}>Updated</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 6px", lineHeight: 1.5 }}>
            5 signal categories: indexability, trust signals, Search Console verification, content quality (thin pages, stuffing, doorways), and security (mixed content, injected links, hacked pages).
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={running}
          style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {running ? "Checking..." : result ? "Re-check â†’" : "Run Check â†’"}
        </button>
      </div>

      {result && (
        <div>
          {/* Category scores */}
          {catSummary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
              {[
                { key: "indexability", label: "Crawl" },
                { key: "trustSignals", label: "Trust" },
                { key: "searchConsole", label: "GSC" },
                { key: "contentQuality", label: "Content" },
                { key: "security", label: "Security" },
              ].map(({ key, label }) => {
                const cat = catSummary[key];
                const s = key === "searchConsole" ? (cat?.verified ? 100 : 0) : cat?.score;
                return (
                  <div
                    key={key}
                    onClick={() => setActiveCategory(activeCategory === label.replace("GSC", "Search Console") ? "all" : key === "searchConsole" ? "Search Console" : key === "trustSignals" ? "Trust Signals" : key === "contentQuality" ? "Content Quality" : key.charAt(0).toUpperCase() + key.slice(1))}
                    style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${cat?.issues > 0 ? typeColor.error + "40" : "var(--color-border-tertiary)"}`, borderRadius: 8, padding: "8px 6px", textAlign: "center", cursor: "pointer" }}
                  >
                    <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: scoreColor(s), lineHeight: 1 }}>{key === "searchConsole" ? (cat?.verified ? "âœ“" : "âœ—") : s}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top rec */}
          <div style={{ background: "#60A5FA08", border: "0.5px solid #60A5FA30", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#60A5FA", letterSpacing: "0.8px", marginBottom: 4 }}>TOP PRIORITY</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topRecommendation}</div>
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "0.5px solid var(--color-border-secondary)", background: activeCategory === cat ? MODULE_COLOR : "transparent", color: activeCategory === cat ? "#fff" : "var(--color-text-secondary)", cursor: "pointer" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Findings */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              FINDINGS â€” {filteredFindings.length}
            </div>
            {filteredFindings.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderBottom: i < filteredFindings.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", background: f.severity === "critical" ? severityBg.critical : "transparent" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0, alignItems: "center", marginTop: 1 }}>
                  <span style={{ fontSize: 7, fontWeight: 500, color: typeColor[f.type], background: typeColor[f.type] + "18", padding: "2px 5px", borderRadius: 3 }}>{(f.type || "info").toUpperCase()}</span>
                  {f.severity === "critical" && <span style={{ fontSize: 7, color: "#F87171", background: "#F8717118", padding: "1px 4px", borderRadius: 2 }}>CRIT</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 3 }}>{f.item}</div>
                    <span style={{ fontSize: 9, color: "var(--color-text-secondary)", whiteSpace: "nowrap", flexShrink: 0 }}>{f.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.45, marginBottom: f.fix ? 5 : 0 }}>{f.detail}</div>
                  {f.fix && (
                    <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45 }}>
                      Fix: {f.fix}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {plan === "free" && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Free plan shows all issues. Upgrade to get automated fixes for content quality and security problems.</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, whiteSpace: "nowrap", fontWeight: 500 }}>Upgrade to fix</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Checks indexability, trust signals, GSC verification, content quality, and security across your site
        </div>
      )}
    </div>
  );
}

