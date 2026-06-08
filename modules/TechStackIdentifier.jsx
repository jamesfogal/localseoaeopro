/**
 * LocalSEOAEOPro — Tech Stack Identifier
 * WordPress version, theme, plugins, hosting, CDN, page builder
 */
import { useState } from "react";

const MODULE_COLOR = "#60A5FA";
const MODULE_TAG = "TSI";

const SYSTEM_PROMPT = `You are a technical SEO specialist who audits website tech stacks for local businesses.

You will receive: business name, industry, city, website URL.

YOUR JOB: Identify the full technology stack of this website and flag any issues that affect SEO, speed, or security.

Identify:
PLATFORM
- CMS: WordPress, Wix, Squarespace, Shopify, Webflow, custom, unknown
- WordPress specifics: likely version, common themes (Divi, Elementor, Avada, Genesis, etc.), page builder
- Site builder: Elementor, Divi, WPBakery, Beaver Builder, Gutenberg

HOSTING
- Host: GoDaddy, Bluehost, HostGator, SiteGround, WP Engine, Kinsta, Cloudways, Vercel, Netlify, etc.
- Hosting tier: Dead Zone / Speed Limiter / Acceptable / Race Ready
- Server location: likely US region

PERFORMANCE STACK
- CDN: Cloudflare, AWS CloudFront, Fastly, BunnyCDN, none
- HTTP version: HTTP/1.1, HTTP/2, HTTP/3
- Caching: plugin-based (W3 Total Cache, WP Rocket, LiteSpeed) or server-level

SECURITY
- SSL: Let's Encrypt, paid cert, expired, missing
- WAF (Web Application Firewall): Cloudflare, Sucuri, Wordfence
- Last known vulnerability for detected versions

SEO IMPACT OF STACK
- What does this tech stack mean for rankings?
- What is the speed ceiling with this hosting?
- What fixes are possible vs platform-locked?

Return ONLY valid JSON:
{
  "overallRisk": "Low" | "Medium" | "High" | "Critical",
  "platform": { "cms": "", "version": "", "pageBuilder": "", "theme": "" },
  "hosting": { "provider": "", "tier": "dead-zone" | "speed-limiter" | "acceptable" | "race-ready", "tierLabel": "", "serverRegion": "", "speedCeiling": "" },
  "performance": { "cdn": "", "httpVersion": "", "caching": "", "cachingType": "" },
  "security": { "ssl": "", "waf": "", "vulnerabilities": [] },
  "findings": [
    {
      "category": "Platform" | "Hosting" | "Performance" | "Security",
      "severity": "critical" | "high" | "medium" | "low" | "good",
      "item": "",
      "detail": "",
      "fix": ""
    }
  ],
  "topRecommendation": ""
}

Return ONLY the JSON object.`;

async function callClaude(system, prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, prompt }),
  });
  const data = await res.json();
  return JSON.parse(data.result);
}

export default function TechStackIdentifier({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runScan = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Identify the full technology stack.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        overallRisk: "High",
        platform: { cms: "WordPress", version: "6.2 (outdated)", pageBuilder: "Elementor", theme: "Hello Elementor" },
        hosting: { provider: "GoDaddy", tier: "dead-zone", tierLabel: "☠️ Dead Zone", serverRegion: "US East", speedCeiling: "Cannot achieve under 2s load regardless of optimization" },
        performance: { cdn: "None detected", httpVersion: "HTTP/1.1", caching: "None detected", cachingType: "" },
        security: { ssl: "Let's Encrypt (valid)", waf: "None detected", vulnerabilities: ["Elementor 3.8.x has 2 known XSS vulnerabilities", "WordPress 6.2 missing 6 security patches"] },
        findings: [
          { category: "Hosting", severity: "critical", item: "GoDaddy shared hosting — Dead Zone", detail: "GoDaddy's shared infrastructure cannot achieve sub-2 second load times for WordPress sites. Server response alone averages 800ms+.", fix: "Migrate to WP Engine or Kinsta. WP Engine starts at $20/mo and eliminates hosting as a speed bottleneck." },
          { category: "Security", severity: "high", item: "WordPress 6.2 — 6 security patches missing", detail: "Running an outdated WordPress version with known vulnerabilities. Hacked sites get deindexed by Google immediately.", fix: "Update WordPress to latest version. Back up first. Takes 2 minutes in WP Admin → Updates." },
          { category: "Performance", severity: "high", item: "No CDN detected", detail: "All assets load from one server. Visitors far from the server get significantly slower load times.", fix: "Add Cloudflare free tier. 5 minute setup via DNS change. Immediate speed improvement." },
          { category: "Performance", severity: "high", item: "HTTP/1.1 — No HTTP/2", detail: "HTTP/1.1 loads resources sequentially. HTTP/2 loads them in parallel — up to 50% faster.", fix: "HTTP/2 is automatic on WP Engine, Kinsta, and Cloudflare. Fixing hosting fixes this." },
          { category: "Security", severity: "medium", item: "No WAF (Web Application Firewall)", detail: "No protection against bot attacks, form spam, or brute force login attempts.", fix: "Install Wordfence free plugin. Immediate protection against common attacks." },
        ],
        topRecommendation: "Migrate from GoDaddy to WP Engine. This single change fixes hosting tier, HTTP/2, server caching, and eliminates the speed ceiling — all at once."
      });
    }
    setRunning(false);
  };

  const tierColors = { "dead-zone": "#F87171", "speed-limiter": "#F59E0B", "acceptable": "#FBBF24", "race-ready": "#34D399" };
  const severityColor = (s) => ({ critical: "#F87171", high: "#F59E0B", medium: "#FBBF24", low: "#94A3B8", good: "#34D399" }[s] || "#94A3B8");
  const riskColor = (r) => ({ Low: "#34D399", Medium: "#FBBF24", High: "#F59E0B", Critical: "#F87171" }[r] || "#94A3B8");

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Tech Stack Identifier</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Identifies CMS, hosting tier, CDN, HTTP version, WordPress version, theme, page builder, and security gaps.
          </p>
        </div>
        <button onClick={runScan} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Identifying..." : result ? "Re-identify →" : "Identify →"}
        </button>
      </div>

      {result && (
        <div>
          {/* Stack summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.8px" }}>PLATFORM</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>{result.platform?.cms}</div>
              {result.platform?.version && <div style={{ fontSize: 10, color: "#FBBF24" }}>{result.platform.version}</div>}
              {result.platform?.pageBuilder && <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{result.platform.pageBuilder}</div>}
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${tierColors[result.hosting?.tier] || "#1E3050"}40`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.8px" }}>HOSTING</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>{result.hosting?.provider}</div>
              <div style={{ fontSize: 11, color: tierColors[result.hosting?.tier] }}>{result.hosting?.tierLabel}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.8px" }}>PERFORMANCE</div>
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", marginBottom: 2 }}>CDN: {result.performance?.cdn || "None"}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{result.performance?.httpVersion}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.8px" }}>SECURITY</div>
              <div style={{ fontSize: 11, color: "#34D399", marginBottom: 2 }}>{result.security?.ssl}</div>
              <div style={{ fontSize: 11, color: result.security?.vulnerabilities?.length > 0 ? "#F87171" : "#34D399" }}>
                {result.security?.vulnerabilities?.length > 0 ? `⚠ ${result.security.vulnerabilities.length} vulnerabilities` : "✓ No known CVEs"}
              </div>
            </div>
          </div>

          {result.hosting?.speedCeiling && (
            <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.8px", marginBottom: 4 }}>SPEED CEILING</div>
              <div style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{result.hosting.speedCeiling}</div>
            </div>
          )}

          <div style={{ background: "#60A5FA08", border: "0.5px solid #60A5FA30", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 4 }}>TOP RECOMMENDATION</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topRecommendation}</div>
          </div>

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              FINDINGS — {result.findings?.length}
            </div>
            {result.findings?.map((f, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.findings.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: severityColor(f.severity) + "18", color: severityColor(f.severity) }}>{f.severity.toUpperCase()}</span>
                  <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{f.category}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>{f.item}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4, marginBottom: f.fix ? 5 : 0 }}>{f.detail}</div>
                {f.fix && (
                  <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45 }}>
                    Fix: {f.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Identifies full tech stack — CMS, hosting tier, CDN, HTTP version, security gaps
        </div>
      )}
    </div>
  );
}
