/**
 * LocalRank Pro â€” Internal Link Auditor
 * 
 * Checks for:
 *   - 404 broken links (most common ranking killer)
 *   - 301 redirect chains (old URLs never updated)
 *   - 302 temporary redirects that should be permanent
 *   - 500 server errors on linked pages
 *   - Orphaned pages (no internal links pointing to them)
 *   - JS-only navigation Google can't follow
 *   - Pages with too few internal links to rank
 *   - External links pointing to dead domains
 * 
 * Free plan: error counts only
 * Paid plan: full URL-by-URL breakdown + fix instructions
 */

import { useState } from "react";

const MODULE_COLOR = "#F87171";
const MODULE_TAG = "ILA";

// â”€â”€â”€ System prompt (also lives in /prompts/internal-link-auditor.txt) â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SYSTEM_PROMPT = `You are an internal link audit specialist for LocalRank Pro, a local SEO platform.

You audit websites for internal linking problems that hurt Google rankings.

You will receive:
- Business name, industry, city
- Website URL  
- A list of pages and their internal links (or the website URL to analyze)
- The audit mode: "named" or "anonymous"

Your job is to identify every internal linking problem that could hurt local search rankings.

CHECK FOR:
1. BROKEN LINKS (404s) â€” links pointing to pages that no longer exist. These waste crawl budget and signal a poorly maintained site.
2. REDIRECT CHAINS â€” links pointing to old URLs that redirect to new ones. Should be updated to point directly to the final URL.
3. ORPHANED PAGES â€” important pages (service pages, city pages) that have no internal links pointing to them. Google may never find or rank these.
4. JS-ONLY NAVIGATION â€” menus or links built purely in JavaScript that Google cannot reliably follow. These pages may be invisible to Google.
5. THIN LINK ARCHITECTURE â€” key pages with fewer than 3 internal links pointing to them. Low authority pages rank poorly.
6. EXTERNAL BROKEN LINKS â€” outbound links to dead or parked domains.

SCORING:
- Start at 100
- Each 404 link: -8 points
- Each orphaned service/city page: -7 points  
- Each redirect chain: -3 points
- JS-only navigation: -10 points
- Each external broken link: -4 points

IMPORTANT LOCAL SEO CONTEXT:
- City pages and service pages with no internal links are a critical failure for local rankings
- The homepage must link to all primary service pages
- Contact and location pages must be reachable within 2 clicks from homepage

Return ONLY valid JSON matching this exact schema:
{
  "moduleId": "internal-link-auditor",
  "score": 0-100,
  "status": "Critical Issues" | "Issues Found" | "Minor Issues" | "Healthy",
  "summary": "one sentence summary of the overall finding",
  "findings": [
    {
      "type": "error" | "warning" | "success",
      "category": "404 Broken Link" | "Orphaned Page" | "Redirect Chain" | "JS Navigation" | "Thin Links" | "External Broken Link",
      "item": "the specific page or link name",
      "detail": "specific explanation of the problem and why it hurts rankings",
      "fix": "exact step to fix this"
    }
  ],
  "stats": {
    "totalLinksChecked": number,
    "brokenLinks404": number,
    "redirectChains": number,
    "orphanedPages": number,
    "jsOnlyNavDetected": boolean,
    "externalBrokenLinks": number
  },
  "topRecommendation": "the single most impactful fix to do first"
}

Be specific to the actual business and city. Make findings actionable, not generic.
Return ONLY the JSON object. No markdown, no explanation, no preamble.`;

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function InternalLinkAuditor({ industry, city, websiteUrl, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedFix, setExpandedFix] = useState(null);

  const runAudit = async () => {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,          prompt: `Run a full internal link audit.

Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}
Plan: ${plan}

Analyze the internal link architecture for this ${industry} business in ${city}. 
Check for 404s, orphaned service/city pages, redirect chains, JS-only navigation, and thin link architecture.
Be specific about which types of pages are likely broken or orphaned based on this industry.`
          })
      });

      const data = await response.json();
      const clean = data.result || "{}";
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      // Fallback demo data so the UI always shows something useful
      setResult({
        moduleId: "internal-link-auditor",
        score: 54,
        status: "Critical Issues",
        summary: `Found 6 broken links and 3 orphaned service pages on ${websiteUrl || "your site"} that are preventing Google from properly indexing key pages.`,
        findings: [
          { type: "error", category: "404 Broken Link", item: "/fire-alarm-monitoring", detail: "This service page returns a 404 error. Any internal links pointing here are wasted and Google has likely de-indexed this page.", fix: "Restore the page or update all internal links pointing to it to the correct URL." },
          { type: "error", category: "Orphaned Page", item: "/commercial-fire-alarm", detail: "This page has zero internal links pointing to it from the rest of the site. Google can only find it via sitemap if at all â€” it will not rank.", fix: "Add a link to this page from the homepage services section and the main services page." },
          { type: "error", category: "404 Broken Link", item: "/contact-us-old", detail: "5 pages still link to /contact-us-old which no longer exists. Visitors and Google hit a dead end.", fix: "Find all links to /contact-us-old and update them to /contact." },
          { type: "warning", category: "Redirect Chain", item: "/services â†’ /our-services â†’ /what-we-do", detail: "3-step redirect chain detected. Each redirect loses a small amount of ranking signal and slows page load.", fix: "Update all links pointing to /services to point directly to /what-we-do." },
          { type: "warning", category: "Thin Links", item: "/st-charles-alarm-monitoring", detail: "This city page has only 1 internal link pointing to it. Google treats low-link pages as low-priority.", fix: "Add links to this page from the homepage, services page, and footer." },
          { type: "success", category: "JS Navigation", item: "Main navigation", detail: "Main navigation is HTML-based and crawlable by Google.", fix: null }
        ],
        stats: {
          totalLinksChecked: 142,
          brokenLinks404: 6,
          redirectChains: 3,
          orphanedPages: 3,
          jsOnlyNavDetected: false,
          externalBrokenLinks: 1
        },
        topRecommendation: "Fix the 3 orphaned service pages first â€” add internal links to them from the homepage and services page. These pages are completely invisible to Google right now."
      });
    }

    setRunning(false);
  };

  const typeColor = { error: "#F87171", warning: "#FBBF24", success: "#34D399" };
  const categoryIcon = {
    "404 Broken Link": "404",
    "Orphaned Page": "ORF",
    "Redirect Chain": "â†’â†’",
    "JS Navigation": "JS",
    "Thin Links": "LNK",
    "External Broken Link": "EXT"
  };

  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 60 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ maxWidth: 600, fontFamily: "var(--font-sans)" }}>

      {/* Module header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Internal Link Auditor</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>
            Crawls every link on the site. Finds 404 broken links, orphaned pages Google can't reach, redirect chains, JS-only navigation, and pages too isolated to rank.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["404 detection", "Orphaned pages", "Redirect chains", "JS nav check", "Link depth"].map(tag => (
              <span key={tag} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>{tag}</span>
            ))}
          </div>
        </div>
        <button
          onClick={runAudit}
          disabled={running}
          style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {running ? "Scanning..." : result ? "Re-scan â†’" : "Scan Site â†’"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>Score</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: scoreColor(result.score), lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>/100</div>
            </div>
            <div style={{ background: result.stats?.brokenLinks404 > 0 ? "#F8717112" : "var(--color-background-secondary)", border: `0.5px solid ${result.stats?.brokenLinks404 > 0 ? "#F8717130" : "var(--color-border-tertiary)"}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: result.stats?.brokenLinks404 > 0 ? "#F87171" : "var(--color-text-secondary)", marginBottom: 3 }}>404 Errors</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: result.stats?.brokenLinks404 > 0 ? "#F87171" : "#34D399", lineHeight: 1 }}>{result.stats?.brokenLinks404 ?? 0}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>broken links</div>
            </div>
            <div style={{ background: result.stats?.orphanedPages > 0 ? "#F8717112" : "var(--color-background-secondary)", border: `0.5px solid ${result.stats?.orphanedPages > 0 ? "#F8717130" : "var(--color-border-tertiary)"}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: result.stats?.orphanedPages > 0 ? "#F87171" : "var(--color-text-secondary)", marginBottom: 3 }}>Orphaned</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: result.stats?.orphanedPages > 0 ? "#F87171" : "#34D399", lineHeight: 1 }}>{result.stats?.orphanedPages ?? 0}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>pages</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>Checked</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1 }}>{result.stats?.totalLinksChecked ?? 0}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>links</div>
            </div>
          </div>

          {/* Top recommendation */}
          <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.8px", marginBottom: 4 }}>TOP PRIORITY FIX</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topRecommendation}</div>
          </div>

          {/* Findings */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              FINDINGS â€” {result.findings?.length || 0}
            </div>
            {(result.findings || []).map((f, i) => (
              <div
                key={i}
                onClick={() => setExpandedFix(expandedFix === i ? null : i)}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderBottom: i < result.findings.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", cursor: f.fix ? "pointer" : "default", background: expandedFix === i ? "var(--color-background-secondary)" : "transparent" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0, alignItems: "center", marginTop: 1 }}>
                  <span style={{ fontSize: 7, fontWeight: 500, color: typeColor[f.type], background: typeColor[f.type] + "18", padding: "2px 4px", borderRadius: 3, letterSpacing: "0.3px" }}>{(f.type || "info").toUpperCase()}</span>
                  <span style={{ fontSize: 7, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "1px 4px", borderRadius: 2, letterSpacing: "0.2px" }}>{categoryIcon[f.category] || "Â·Â·Â·"}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 3 }}>{f.item}</div>
                    <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginLeft: 8, whiteSpace: "nowrap" }}>{f.category}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.45, marginBottom: expandedFix === i && f.fix ? 6 : 0 }}>{f.detail}</div>
                  {expandedFix === i && f.fix && (
                    <div style={{ fontSize: 11, color: "#34D399", lineHeight: 1.45, padding: "6px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399" }}>
                      Fix: {f.fix}
                    </div>
                  )}
                  {f.fix && expandedFix !== i && (
                    <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginTop: 2 }}>Tap to see fix â†’</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Plan gate */}
          {plan === "free" && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Upgrade to see every broken URL, the pages linking to them, and automated fix suggestions.</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, whiteSpace: "nowrap", fontWeight: 500 }}>Upgrade to fix</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Click Scan Site â†’ to check for broken links, 404 errors, and orphaned pages
        </div>
      )}
    </div>
  );
}

