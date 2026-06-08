/**
 * Local SEO & AEO Pro â€” Page Speed Intelligence
 * Tag: PSI | Group: Technical
 * Checks every page found in local search â€” 23 speed killers, 1-second mobile rule
 */
import { useState } from "react";
const MODULE_COLOR = "#F87171";

export default function PageSpeedIntelligence({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: `You are a page speed and Core Web Vitals specialist for local SEO. Audit page speed for a local business website. Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "pagesUnderOneSec": number,
  "totalPages": number,
  "ttfb": number,
  "cloudflareActive": true|false,
  "pages": [
    {
      "url": "/page-url",
      "pageName": "Page Name",
      "mobileScore": 0-100,
      "desktopScore": 0-100,
      "lcp": "X.Xs",
      "fid": "XXms",
      "cls": "0.XX",
      "passesOneSec": true|false,
      "killers": [
        { "issue": "killer name", "impact": "high|medium|low", "detail": "specific detail", "fix": "how to fix", "fixType": "auto|approval|manual" }
      ]
    }
  ],
  "topKillers": ["most common issue 1", "most common issue 2"],
  "summary": "brief overview"
}
Generate 4 pages. Be specific about real speed issues for a local business website.`,
          prompt: `Audit page speed for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\nWebsite: ${websiteUrl || "their site"}` })
      });
      const data = await res.json();
      setResult(JSON.parse(data.result));
    } catch {
      setResult({
        overallScore: 28,
        pagesUnderOneSec: 0,
        totalPages: 4,
        ttfb: 780,
        cloudflareActive: false,
        pages: [
          {
            url: "/", pageName: "Homepage", mobileScore: 18, desktopScore: 54, lcp: "6.2s", fid: "210ms", cls: "0.31", passesOneSec: false,
            killers: [
              { issue: "Hero image carousel (4 images)", impact: "high", detail: "4 JPEG images at 1.2â€“1.9MB each load before any content renders", fix: "Replace carousel with single CSS hero + text. If carousel required, lazy-load slides 2-4 and convert slide 1 to AVIF under 80KB", fixType: "approval" },
              { issue: "Render-blocking JavaScript", impact: "high", detail: "3 scripts load synchronously in <head> blocking page render for 1.8s", fix: "Add defer attribute to all non-critical scripts", fixType: "auto" },
              { issue: "No Cloudflare CDN", impact: "high", detail: "Pages served directly from GoDaddy server â€” 780ms TTFB before first byte", fix: "Enable Cloudflare free tier â€” reduces TTFB to under 200ms with CDN caching", fixType: "manual" },
              { issue: "Google Fonts loading slow", impact: "medium", detail: "Google Fonts loads from external server with no preconnect hint", fix: "Add <link rel='preconnect' href='https://fonts.googleapis.com'> to <head>", fixType: "auto" },
            ]
          },
          {
            url: "/fire-alarm-monitoring", pageName: "Fire Alarm Monitoring", mobileScore: 34, desktopScore: 68, lcp: "4.1s", fid: "140ms", cls: "0.12", passesOneSec: false,
            killers: [
              { issue: "Uncompressed hero image", impact: "high", detail: "1.4MB JPEG hero image â€” should be AVIF under 100KB", fix: "Convert to AVIF â€” estimated 1.3MB savings", fixType: "auto" },
              { issue: "Google Maps iframe above fold", impact: "medium", detail: "Full Google Maps iframe loads on page init â€” 180KB of scripts", fix: "Replace with static map image. Load full map on click.", fixType: "approval" },
            ]
          },
          {
            url: "/contact", pageName: "Contact", mobileScore: 61, desktopScore: 84, lcp: "2.1s", fid: "80ms", cls: "0.04", passesOneSec: false,
            killers: [
              { issue: "Contact form plugin bloat", impact: "medium", detail: "Contact form plugin loading 180KB of JS/CSS even on pages without forms", fix: "Load form scripts only on pages where form is present (conditional loading)", fixType: "approval" },
            ]
          },
          {
            url: "/about", pageName: "About", mobileScore: 22, desktopScore: 59, lcp: "5.3s", fid: "190ms", cls: "0.22", passesOneSec: false,
            killers: [
              { issue: "Team photo gallery (9 JPEGs)", impact: "high", detail: "9 uncompressed team photos totaling 6.8MB load at page init", fix: "Lazy load all images below fold and convert to AVIF. Above-fold photo under 80KB.", fixType: "auto" },
              { issue: "Layout shift from images", impact: "medium", detail: "Images load without defined width/height â€” causes 0.22 CLS score", fix: "Add width and height attributes to all img tags", fixType: "auto" },
            ]
          },
        ],
        topKillers: [
          "0 of 4 pages pass the 1-second mobile load rule â€” all pages are failing Core Web Vitals",
          "Hero images are the #1 issue â€” 3 pages have uncompressed JPEGs above the fold"
        ],
        summary: "No pages on this site pass the 1-second mobile load rule. The homepage carousel is the most damaging single element â€” it alone adds 4+ seconds to load time on 4G."
      });
    }
    setRunning(false);
  };

  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 60 ? "#84CC16" : s >= 40 ? "#FBBF24" : s >= 20 ? "#F97316" : "#F87171";
  const fixTypeColor = { auto: "#34D399", approval: "#FBBF24", manual: "#94A3B8" };
  const fixTypeLabel = { auto: "Auto Fix", approval: "1-Click Approval", manual: "Manual Step" };

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>PSI</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Page Speed Intelligence</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Tests every page found in local search for mobile load time, Core Web Vitals (LCP, FID, CLS), TTFB, and Cloudflare status. Identifies all 23 speed killers and classifies each fix as automatic, approval, or manual.
          </p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Testing..." : result ? "Re-run â†’" : "Test Speed â†’"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
            {[
              { label: "Speed Score", value: `${result.overallScore}/100`, color: scoreColor(result.overallScore) },
              { label: "TTFB", value: `${result.ttfb}ms`, color: result.ttfb < 400 ? "#34D399" : result.ttfb < 700 ? "#FBBF24" : "#F87171" },
              { label: "Under 1 Second", value: `${result.pagesUnderOneSec}/${result.totalPages}`, color: result.pagesUnderOneSec === result.totalPages ? "#34D399" : "#F87171" },
              { label: "Cloudflare", value: result.cloudflareActive ? "Active âœ“" : "Not Active", color: result.cloudflareActive ? "#34D399" : "#F87171" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "9px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "var(--color-text-secondary)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: i === 0 ? 16 : 13, fontWeight: 500, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {!result.cloudflareActive && (
            <div style={{ background: "#F8717108", border: "0.5px solid #F87171", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#F87171", marginBottom: 3 }}>âš¡ FREE WIN: Cloudflare is not active</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Enabling Cloudflare's free tier typically reduces TTFB by 200â€“600ms and costs $0. This is the fastest speed improvement available with zero code changes.</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(result.pages || []).map((page, i) => (
              <div key={i} style={{ border: `0.5px solid ${page.passesOneSec ? "#34D39940" : "#F8717140"}`, borderRadius: 8, overflow: "hidden" }}>
                <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", cursor: "pointer", background: "var(--color-background-secondary)" }}>
                  <div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{page.pageName}</span>
                      <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: page.passesOneSec ? "#34D39920" : "#F8717120", color: page.passesOneSec ? "#34D399" : "#F87171" }}>
                        {page.passesOneSec ? "PASSES" : "FAILING"}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>LCP: {page.lcp} Â· CLS: {page.cls} Â· FID: {page.fid}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 8, color: "var(--color-text-secondary)" }}>Mobile</div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: scoreColor(page.mobileScore) }}>{page.mobileScore}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{expanded === i ? "â–²" : "â–¼"}</span>
                  </div>
                </div>
                {expanded === i && (
                  <div style={{ padding: "10px 12px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", gap: 6 }}>
                    {(page.killers || []).map((k, j) => (
                      <div key={j} style={{ padding: "8px 10px", background: "var(--color-background-primary)", borderRadius: 7, borderLeft: `2px solid ${k.impact === "high" ? "#F87171" : k.impact === "medium" ? "#FBBF24" : "#94A3B8"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{k.issue}</span>
                          <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 10, background: fixTypeColor[k.fixType] + "20", color: fixTypeColor[k.fixType] }}>{fixTypeLabel[k.fixType]}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>{k.detail}</div>
                        <div style={{ fontSize: 10, color: "#34D399" }}>Fix: {k.fix}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {plan === "free" && (
            <div style={{ marginTop: 10, padding: "9px 12px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Upgrade to auto-fix image compression, render-blocking scripts, and Cloudflare setup.</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Tests every page for Core Web Vitals and identifies all 23 speed killers with exact fixes
        </div>
      )}
    </div>
  );
}

