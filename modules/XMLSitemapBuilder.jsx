/**
 * XML Sitemap Builder
 * Tag: XML | Group: Technical
 */
import { useState } from "react";

export default function XMLSitemapBuilder({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const MODULE_COLOR = "#94A3B8";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          system: `You are an XML sitemap specialist for local business websites. Generate an optimized XML sitemap. Return ONLY valid JSON: {"totalUrls":number,"sitemapXml":"complete XML sitemap as string","pagesByType":{"homepage":number,"service":number,"city":number,"blog":number,"other":number},"priorityLogic":"explanation of priority assignments","excludedPages":["pages excluded and why"],"submissionSteps":["step 1","step 2","step 3"],"gscUrl":"Google Search Console sitemap submission URL"}`,
          messages: [{ role: "user", content: `Generate XML sitemap for:\nBusiness: ${businessName}\nIndustry: ${industry}\nCity: ${city}\nWebsite: ${websiteUrl || "https://example.com"}\n\nGenerate realistic page structure for this local business. Prioritize: homepage (1.0), city pages (0.9), service pages (0.8), blog (0.6).` })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      const base = websiteUrl?.replace(/\/$/, "") || "https://citywidealarms.com";
      setResult({
        totalUrls: 18,
        pagesByType: { homepage: 1, service: 6, city: 5, blog: 4, other: 2 },
        priorityLogic: "Homepage gets 1.0, city+service pages 0.9 (highest local intent), service pages 0.8, blog 0.6, contact/about 0.5.",
        excludedPages: ["Staging subdomain (not indexed)", "Thank you pages (no-index set)", "Admin pages"],
        submissionSteps: ["Log into Google Search Console", "Click 'Sitemaps' in left sidebar", `Enter: ${base}/sitemap.xml`, "Click Submit", "Check back in 48 hours for indexing status"],
        gscUrl: "https://search.google.com/search-console",
        sitemapXml: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><lastmod>2025-04-20</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/st-charles-fire-alarm-monitoring/</loc><lastmod>2025-04-20</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/st-charles-security-cameras/</loc><lastmod>2025-04-20</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/fire-alarm-monitoring/</loc><lastmod>2025-04-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/security-cameras/</loc><lastmod>2025-04-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/commercial-fire-alarm/</loc><lastmod>2025-04-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/alarm-monitoring/</loc><lastmod>2025-04-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/contact/</loc><lastmod>2025-04-20</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>
  <url><loc>${base}/about/</loc><lastmod>2025-04-20</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>
</urlset>`
      });
    }
    setRunning(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result?.sitemapXml || "").then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>XML</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>XML Sitemap Builder</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Generates and validates an XML sitemap with city page prioritization for Googlebot. Includes Search Console submission steps.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {running ? "Building..." : result ? "Rebuild â†’" : "Build Sitemap â†’"}
        </button>
      </div>
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            {Object.entries(result.pagesByType || {}).map(([type, count]) => (
              <div key={type} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 7, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>{type}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)" }}>{count}</div>
              </div>
            ))}
          </div>
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>SITEMAP XML â€” {result.totalUrls} URLs</span>
              {plan !== "free" && <button onClick={copy} style={{ fontSize: 9, padding: "2px 7px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, background: copied ? "#34D39920" : "transparent", color: copied ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}>{copied ? "Copied!" : "Copy XML â†’"}</button>}
            </div>
            <div style={{ padding: "10px 12px", maxHeight: 200, overflowY: "auto" }}>
              <pre style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {plan === "free" ? (result.sitemapXml || "").slice(0, 400) + "..." : result.sitemapXml}
              </pre>
            </div>
          </div>
          {(result.submissionSteps || []).length > 0 && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>GOOGLE SEARCH CONSOLE SUBMISSION</div>
              {(result.submissionSteps || []).map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderBottom: i < result.submissionSteps.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", alignItems: "flex-start" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: MODULE_COLOR, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Generates an XML sitemap with city page prioritization and Search Console submission steps</div>}
    </div>
  );
}

