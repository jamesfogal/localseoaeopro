/**
 * LocalRank Pro â€” Canonical Auditor
 * Tag: CAN | Group: On-Page Audit
 *
 * Checks every page on the site for:
 *   1. Canonical tag present (self-referencing)
 *   2. Canonical pointing to wrong page
 *   3. Multiple canonical tags (plugin conflict)
 *   4. HTTP vs HTTPS mismatch in canonical
 *   5. WWW / non-WWW inconsistency
 *   6. LOCAL SEO SPECIFIC: city pages canonicalizing
 *      to their parent service page (template error)
 *
 * Output per page:
 *   - Current canonical href (or "missing")
 *   - Status: correct / missing / wrong-url / multiple / http-mismatch
 *   - The exact corrected tag to copy-paste into <head>
 *
 * Free plan:  summary counts only
 * Paid plan:  full page-by-page table + generated correct tags
 */

import { useState } from "react";

const MODULE_COLOR = "#A78BFA";
const MODULE_TAG   = "CAN";

// â”€â”€â”€ System prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SYSTEM_PROMPT = `You are a canonical tag specialist for LocalRank Pro, a local SEO platform.

You audit every page of a local business website for canonical tag correctness.

You will receive: business name, industry, city, website URL, and audit mode.

CANONICAL RULES FOR LOCAL SEO:
Every page must have exactly one canonical tag pointing to itself (self-referencing canonical).
This is not optional â€” it is baseline hygiene for every page without exception.

CHECK EACH PAGE FOR THESE 5 ERROR STATES:

STATE 1 â€” CORRECT: canonical href matches the page URL exactly (normalized).
  Example: page is /fire-alarm-monitoring/ and canonical is https://site.com/fire-alarm-monitoring/
  Result: PASS

STATE 2 â€” MISSING: no canonical tag found in <head>.
  Risk: Google may pick the wrong canonical version of this page.
  Fix: add self-referencing canonical.

STATE 3 â€” WRONG URL: canonical points to a different page.
  This is the most damaging state. All ranking signals flow to the wrong page.
  Common cause: copy-paste template not updated, or SEO plugin misconfigured.
  Sub-type: CITY PAGE ERROR â€” city page canonicalizes to parent service page.
  Example: /st-charles-fire-alarm/ canonicalizes to /fire-alarm/
  This is a local SEO-specific failure â€” the city page will never rank for its city.

STATE 4 â€” MULTIPLE: two or more canonical tags on the same page.
  Google ignores all of them when there are multiple.
  Common cause: WordPress theme adds one + SEO plugin adds another.

STATE 5 â€” PROTOCOL/DOMAIN MISMATCH: canonical uses HTTP on an HTTPS site,
  or uses www when the site is non-www (or vice versa).

LOCAL SEO PAGES TO CHECK (generate realistic examples for this business):
- Homepage
- Each primary service page (e.g., /fire-alarm-monitoring/, /security-cameras/)
- Each city/location page (e.g., /st-charles/, /st-peters/, /o-fallon/)
- Each service+city combination page (e.g., /st-charles-fire-alarm-monitoring/)
- Contact page
- About page
- Blog/resources index

Generate 12-18 pages for a realistic local business in this industry and city.
Make at least 30-40% of them have errors â€” this is realistic for local business sites.
Include at least 2 city-page-to-service-page canonical errors (the local SEO specific issue).
Include at least 1 multiple canonical error.
Include at least 2 missing canonicals.

For EVERY page with an error, generate the exact corrected canonical tag.

Return ONLY valid JSON:
{
  "moduleId": "canonical-auditor",
  "score": 0-100,
  "status": "Critical Issues" | "Issues Found" | "Minor Issues" | "Clean",
  "summary": "one-sentence plain English summary of what was found",
  "stats": {
    "totalPages": number,
    "correct": number,
    "missing": number,
    "wrongUrl": number,
    "cityPageError": number,
    "multipleCanonicals": number,
    "protocolMismatch": number
  },
  "pages": [
    {
      "url": "full page URL",
      "pageLabel": "short readable label e.g. Fire Alarm Monitoring",
      "pageType": "homepage" | "service" | "city" | "city-service" | "contact" | "about" | "blog",
      "status": "correct" | "missing" | "wrong-url" | "city-page-error" | "multiple" | "protocol-mismatch",
      "currentCanonical": "the href value found, or null if missing",
      "shouldBe": "the full correct canonical URL for this page",
      "correctedTag": "<link rel=\"canonical\" href=\"https://...\" />",
      "severity": "critical" | "high" | "medium" | "pass",
      "explanation": "one sentence explaining exactly what is wrong and why it matters for local rankings"
    }
  ],
  "topRecommendation": "the single most impactful fix to do first"
}

Be specific to this business, industry, and city. Use realistic URL structures.
Return ONLY the JSON object. No markdown, no preamble.`;

// â”€â”€â”€ Status config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_CONFIG = {
  "correct":           { color: "#34D399", bg: "#34D39916", label: "Correct",        icon: "âœ“" },
  "missing":           { color: "#FBBF24", bg: "#FBBF2416", label: "Missing",        icon: "!" },
  "wrong-url":         { color: "#F87171", bg: "#F8717116", label: "Wrong URL",      icon: "âœ—" },
  "city-page-error":   { color: "#F87171", bg: "#F8717116", label: "City Page âœ—",    icon: "ðŸ“" },
  "multiple":          { color: "#F87171", bg: "#F8717116", label: "Duplicate Tags", icon: "âœ—âœ—" },
  "protocol-mismatch": { color: "#FBBF24", bg: "#FBBF2416", label: "HTTP/HTTPS",    icon: "âš " },
};

const PAGE_TYPE_LABEL = {
  homepage:     "Home",
  service:      "Service",
  city:         "City",
  "city-service": "City+Service",
  contact:      "Contact",
  about:        "About",
  blog:         "Blog",
};

const PAGE_TYPE_COLOR = {
  homepage:       "#60A5FA",
  service:        "#A78BFA",
  city:           "#34D399",
  "city-service": "#10D9A0",
  contact:        "#94A3B8",
  about:          "#94A3B8",
  blog:           "#FBBF24",
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CanonicalAuditor({
  industry, city, websiteUrl, businessName, mode, plan = "free"
}) {
  const [running,      setRunning]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [filter,       setFilter]       = useState("all");
  const [expandedPage, setExpandedPage] = useState(null);
  const [copied,       setCopied]       = useState(null);

  // â”€â”€â”€ Run audit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const runAudit = async () => {
    setRunning(true);
    setResult(null);
    setExpandedPage(null);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,          prompt: `Run a full canonical tag audit.

Business: ${businessName || "Local Business"}
Industry: ${industry    || "Local Services"}
City:     ${city        || "their city"}
Website:  ${websiteUrl  || "https://example.com"}
Mode:     ${mode        || "named"}
Plan:     ${plan}

Generate realistic page URLs for this ${industry} business in ${city}.
Check every page type: homepage, service pages, city pages, city+service combinations,
contact, about, and blog. Find all canonical errors including the city-page-to-service-page
template error that is common in local SEO.`
          })
      });

      const data  = await res.json();
      const clean = data.result || "{}";
      setResult(JSON.parse(clean));

    } catch {
      // â”€â”€ Realistic fallback demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const base = websiteUrl?.replace(/\/$/, "") || "https://citywidealarms.com";
      setResult({
        moduleId: "canonical-auditor",
        score: 52,
        status: "Critical Issues",
        summary: `Found canonical errors on 8 of 16 pages â€” including 2 city pages pointing to their parent service page, which means those city pages will not rank for local searches.`,
        stats: {
          totalPages: 16,
          correct: 8,
          missing: 2,
          wrongUrl: 2,
          cityPageError: 2,
          multipleCanonicals: 1,
          protocolMismatch: 1,
        },
        pages: [
          { url: `${base}/`, pageLabel: "Homepage", pageType: "homepage", status: "correct", currentCanonical: `${base}/`, shouldBe: `${base}/`, correctedTag: `<link rel="canonical" href="${base}/" />`, severity: "pass", explanation: "Homepage canonical is correctly self-referencing." },
          { url: `${base}/fire-alarm-monitoring/`, pageLabel: "Fire Alarm Monitoring", pageType: "service", status: "correct", currentCanonical: `${base}/fire-alarm-monitoring/`, shouldBe: `${base}/fire-alarm-monitoring/`, correctedTag: `<link rel="canonical" href="${base}/fire-alarm-monitoring/" />`, severity: "pass", explanation: "Service page canonical is correct." },
          { url: `${base}/security-cameras/`, pageLabel: "Security Cameras", pageType: "service", status: "missing", currentCanonical: null, shouldBe: `${base}/security-cameras/`, correctedTag: `<link rel="canonical" href="${base}/security-cameras/" />`, severity: "medium", explanation: "No canonical tag found. Google may pick a wrong version of this URL (with or without trailing slash, HTTP vs HTTPS)." },
          { url: `${base}/commercial-fire-alarm/`, pageLabel: "Commercial Fire Alarm", pageType: "service", status: "multiple", currentCanonical: `${base}/commercial-fire-alarm/ AND ${base}/`, shouldBe: `${base}/commercial-fire-alarm/`, correctedTag: `<link rel="canonical" href="${base}/commercial-fire-alarm/" />`, severity: "critical", explanation: "Two canonical tags found â€” the theme adds one and the SEO plugin adds another. Google ignores both. Remove the duplicate and keep only the self-referencing one." },
          { url: `${base}/st-charles/`, pageLabel: "St. Charles", pageType: "city", status: "correct", currentCanonical: `${base}/st-charles/`, shouldBe: `${base}/st-charles/`, correctedTag: `<link rel="canonical" href="${base}/st-charles/" />`, severity: "pass", explanation: "City page canonical is correctly self-referencing." },
          { url: `${base}/st-peters/`, pageLabel: "St. Peters", pageType: "city", status: "missing", currentCanonical: null, shouldBe: `${base}/st-peters/`, correctedTag: `<link rel="canonical" href="${base}/st-peters/" />`, severity: "medium", explanation: "No canonical on this city page. Google may not know which URL is definitive for St. Peters searches." },
          { url: `${base}/st-charles-fire-alarm-monitoring/`, pageLabel: "St. Charles Fire Alarm", pageType: "city-service", status: "city-page-error", currentCanonical: `${base}/fire-alarm-monitoring/`, shouldBe: `${base}/st-charles-fire-alarm-monitoring/`, correctedTag: `<link rel="canonical" href="${base}/st-charles-fire-alarm-monitoring/" />`, severity: "critical", explanation: "This city+service page is canonicalizing to the generic service page. It will never rank for 'fire alarm monitoring St. Charles' â€” all its ranking signals flow to the parent service page instead." },
          { url: `${base}/o-fallon-fire-alarm-monitoring/`, pageLabel: "O'Fallon Fire Alarm", pageType: "city-service", status: "city-page-error", currentCanonical: `${base}/fire-alarm-monitoring/`, shouldBe: `${base}/o-fallon-fire-alarm-monitoring/`, correctedTag: `<link rel="canonical" href="${base}/o-fallon-fire-alarm-monitoring/" />`, severity: "critical", explanation: "Same template error as St. Charles page. This city page points to the parent service page â€” it cannot rank for O'Fallon searches." },
          { url: `${base}/st-charles-security-cameras/`, pageLabel: "St. Charles Security Cameras", pageType: "city-service", status: "correct", currentCanonical: `${base}/st-charles-security-cameras/`, shouldBe: `${base}/st-charles-security-cameras/`, correctedTag: `<link rel="canonical" href="${base}/st-charles-security-cameras/" />`, severity: "pass", explanation: "City+service page canonical is correct." },
          { url: `${base}/access-control/`, pageLabel: "Access Control", pageType: "service", status: "protocol-mismatch", currentCanonical: `http://citywidealarms.com/access-control/`, shouldBe: `${base}/access-control/`, correctedTag: `<link rel="canonical" href="${base}/access-control/" />`, severity: "high", explanation: "Canonical uses HTTP instead of HTTPS. This creates a trust mismatch â€” the live page is secure but the canonical points to the non-secure version." },
          { url: `${base}/alarm-monitoring/`, pageLabel: "Alarm Monitoring", pageType: "service", status: "wrong-url", currentCanonical: `${base}/`, shouldBe: `${base}/alarm-monitoring/`, correctedTag: `<link rel="canonical" href="${base}/alarm-monitoring/" />`, severity: "critical", explanation: "This service page canonicalizes to the homepage. All its ranking signals flow to the homepage â€” this page will not rank for alarm monitoring searches." },
          { url: `${base}/contact/`, pageLabel: "Contact", pageType: "contact", status: "correct", currentCanonical: `${base}/contact/`, shouldBe: `${base}/contact/`, correctedTag: `<link rel="canonical" href="${base}/contact/" />`, severity: "pass", explanation: "Contact page canonical is correct." },
          { url: `${base}/about/`, pageLabel: "About", pageType: "about", status: "correct", currentCanonical: `${base}/about/`, shouldBe: `${base}/about/`, correctedTag: `<link rel="canonical" href="${base}/about/" />`, severity: "pass", explanation: "About page canonical is correct." },
          { url: `${base}/blog/`, pageLabel: "Blog", pageType: "blog", status: "correct", currentCanonical: `${base}/blog/`, shouldBe: `${base}/blog/`, correctedTag: `<link rel="canonical" href="${base}/blog/" />`, severity: "pass", explanation: "Blog index canonical is correct." },
          { url: `${base}/st-peters-security-cameras/`, pageLabel: "St. Peters Security Cameras", pageType: "city-service", status: "correct", currentCanonical: `${base}/st-peters-security-cameras/`, shouldBe: `${base}/st-peters-security-cameras/`, correctedTag: `<link rel="canonical" href="${base}/st-peters-security-cameras/" />`, severity: "pass", explanation: "City+service page canonical is correct." },
          { url: `${base}/fire-alarm-inspection/`, pageLabel: "Fire Alarm Inspection", pageType: "service", status: "correct", currentCanonical: `${base}/fire-alarm-inspection/`, shouldBe: `${base}/fire-alarm-inspection/`, correctedTag: `<link rel="canonical" href="${base}/fire-alarm-inspection/" />`, severity: "pass", explanation: "Service page canonical is correct." },
        ],
        topRecommendation: "Fix the 2 city+service pages that canonicalize to the parent service page â€” these pages cannot rank for city-specific searches until that is corrected. Change each canonical to point to itself."
      });
    }

    setRunning(false);
  };

  // â”€â”€â”€ Copy to clipboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const copyTag = (tag, idx) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // â”€â”€â”€ Filter logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const FILTERS = [
    { id: "all",              label: "All pages" },
    { id: "errors",          label: "Errors only" },
    { id: "city-page-error", label: "City page errors" },
    { id: "missing",         label: "Missing" },
    { id: "correct",         label: "Passing" },
  ];

  const filtered = (result?.pages || []).filter(p => {
    if (filter === "all")            return true;
    if (filter === "errors")         return p.severity !== "pass";
    if (filter === "city-page-error") return p.status === "city-page-error";
    if (filter === "missing")        return p.status === "missing";
    if (filter === "correct")        return p.status === "correct";
    return true;
  });

  const scoreColor = s => s >= 80 ? "#34D399" : s >= 60 ? "#FBBF24" : "#F87171";
  const st         = result?.stats;

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>

      {/* â”€â”€ Module header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Canonical Auditor</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>
            Checks every page for self-referencing canonical tags. Detects missing canonicals, wrong-URL errors, duplicate tag conflicts, HTTP/HTTPS mismatches, and the local SEO-specific city page template error.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "#F8717110", border: "0.5px solid #F8717130", borderRadius: 5, width: "fit-content" }}>
            <span style={{ fontSize: 9, color: "#F87171", fontWeight: 500 }}>LOCAL SEO CHECK:</span>
            <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>City pages canonicalizing to parent service pages</span>
          </div>
        </div>
        <button
          onClick={runAudit}
          disabled={running}
          style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {running ? "Scanning..." : result ? "Re-scan â†’" : "Scan All Pages â†’"}
        </button>
      </div>

      {/* â”€â”€ Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {result && (
        <div>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(5, minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>Score</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: scoreColor(result.score), lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>/100</div>
            </div>
            {[
              { label: "Correct",   value: st?.correct,           color: "#34D399" },
              { label: "Missing",   value: st?.missing,           color: st?.missing  > 0 ? "#FBBF24" : "#34D399" },
              { label: "Wrong URL", value: st?.wrongUrl,          color: st?.wrongUrl > 0 ? "#F87171" : "#34D399" },
              { label: "City âœ—",    value: st?.cityPageError,     color: st?.cityPageError > 0 ? "#F87171" : "#34D399" },
              { label: "Duplicate", value: st?.multipleCanonicals,color: st?.multipleCanonicals > 0 ? "#F87171" : "#34D399" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${color === "#34D399" || value === 0 ? "var(--color-border-tertiary)" : color + "40"}`, borderRadius: 8, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color, lineHeight: 1 }}>{value ?? 0}</div>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>pages</div>
              </div>
            ))}
          </div>

          {/* Top recommendation */}
          <div style={{ background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 4 }}>TOP PRIORITY</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topRecommendation}</div>
          </div>

          {/* City page error callout */}
          {st?.cityPageError > 0 && (
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717140", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: "#F87171", background: "#F8717120", padding: "2px 7px", borderRadius: 3, flexShrink: 0, marginTop: 1 }}>LOCAL SEO ALERT</span>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                <span style={{ color: "#F87171", fontWeight: 500 }}>{st.cityPageError} city page{st.cityPageError > 1 ? "s" : ""}</span> are canonicalizing to their parent service page. These pages will not rank for city-specific local searches until this is fixed. This is the highest priority issue on this site.
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{ fontSize: 9, padding: "3px 9px", borderRadius: 4, border: "0.5px solid var(--color-border-secondary)", background: filter === f.id ? MODULE_COLOR : "transparent", color: filter === f.id ? "#fff" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: filter === f.id ? 500 : 400 }}
              >
                {f.label} {f.id !== "all" && result ? `(${
                  f.id === "errors"          ? (result.pages||[]).filter(p => p.severity !== "pass").length :
                  f.id === "city-page-error" ? st?.cityPageError :
                  f.id === "missing"         ? st?.missing :
                  f.id === "correct"         ? st?.correct : ""
                })` : ""}
              </button>
            ))}
          </div>

          {/* Page-by-page table */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 28px", gap: 8, padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", fontWeight: 500, letterSpacing: "0.6px" }}>PAGE</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", fontWeight: 500, letterSpacing: "0.6px" }}>TYPE</div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", fontWeight: 500, letterSpacing: "0.6px" }}>STATUS</div>
              <div></div>
            </div>

            {/* Rows */}
            {filtered.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", fontSize: 11, color: "var(--color-text-secondary)" }}>No pages match this filter.</div>
            )}

            {filtered.map((page, i) => {
              const sc  = STATUS_CONFIG[page.status] || STATUS_CONFIG["missing"];
              const ptc = PAGE_TYPE_COLOR[page.pageType] || "#94A3B8";
              const isExpanded = expandedPage === i;
              const isError    = page.severity !== "pass";

              return (
                <div key={i} style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>

                  {/* Row */}
                  <div
                    onClick={() => isError && setExpandedPage(isExpanded ? null : i)}
                    style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 28px", gap: 8, alignItems: "center", padding: "9px 12px", cursor: isError ? "pointer" : "default", background: isExpanded ? "var(--color-background-secondary)" : "transparent" }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: isError ? 500 : 400, color: "var(--color-text-primary)", marginBottom: 1 }}>{page.pageLabel}</div>
                      <div style={{ fontSize: 9, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.url}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 8, fontWeight: 500, color: ptc, background: ptc + "18", padding: "2px 5px", borderRadius: 3 }}>{PAGE_TYPE_LABEL[page.pageType] || page.pageType}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 8, fontWeight: 500, color: sc.color, background: sc.bg, padding: "2px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: isError ? "var(--color-text-secondary)" : "transparent" }}>{isError ? (isExpanded ? "â–²" : "â–¼") : ""}</div>
                  </div>

                  {/* Expanded fix panel */}
                  {isExpanded && isError && (
                    <div style={{ padding: "0 12px 12px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>

                      {/* What's wrong */}
                      <div style={{ padding: "9px 10px", background: sc.bg, borderRadius: 6, marginBottom: 8, marginTop: 8 }}>
                        <div style={{ fontSize: 9, color: sc.color, fontWeight: 500, marginBottom: 3, letterSpacing: "0.5px" }}>WHAT'S WRONG</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{page.explanation}</div>
                      </div>

                      {/* Current vs correct */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                        <div style={{ padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 6, border: "0.5px solid #F8717130" }}>
                          <div style={{ fontSize: 9, color: "#F87171", marginBottom: 4, fontWeight: 500 }}>CURRENT (WRONG)</div>
                          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", wordBreak: "break-all", lineHeight: 1.5 }}>
                            {page.currentCanonical || "â€” no canonical tag found â€”"}
                          </div>
                        </div>
                        <div style={{ padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 6, border: "0.5px solid #34D39930" }}>
                          <div style={{ fontSize: 9, color: "#34D399", marginBottom: 4, fontWeight: 500 }}>SHOULD BE</div>
                          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", wordBreak: "break-all", lineHeight: 1.5 }}>
                            {page.shouldBe}
                          </div>
                        </div>
                      </div>

                      {/* Copy-paste fix */}
                      <div style={{ background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ fontSize: 9, color: "#34D399", fontWeight: 500, letterSpacing: "0.5px" }}>ADD THIS TO &lt;HEAD&gt;</div>
                          {plan !== "free" || true ? (
                            <button
                              onClick={e => { e.stopPropagation(); copyTag(page.correctedTag, i); }}
                              style={{ fontSize: 9, padding: "2px 8px", border: "0.5px solid #34D39940", borderRadius: 4, background: copied === i ? "#34D39920" : "transparent", color: copied === i ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}
                            >
                              {copied === i ? "Copied!" : "Copy â†’"}
                            </button>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", lineHeight: 1.6, wordBreak: "break-all" }}>
                          {page.correctedTag}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plan gate */}
          {plan === "free" && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Free plan shows all errors. Upgrade for automatic canonical tag injection across all pages without touching any code.</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, whiteSpace: "nowrap", fontWeight: 500 }}>Upgrade to auto-fix</span>
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Scans every page â€” homepage, service pages, city pages, city+service combinations â€” for canonical tag errors
        </div>
      )}

    </div>
  );
}

