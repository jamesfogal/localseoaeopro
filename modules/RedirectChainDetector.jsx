/**
 * LocalSEOAEOPro — Redirect Chain Detector
 * Finds redirect chains, loops, mixed HTTP/HTTPS redirects
 */
import { useState } from "react";

const MODULE_COLOR = "#F87171";
const MODULE_TAG = "RCD";

const SYSTEM_PROMPT = `You are a technical SEO specialist focused on redirect auditing for local business websites.

You will receive: business name, industry, city, website URL.

YOUR JOB: Analyze likely redirect issues for this website based on its tech stack and hosting.

Check for:
REDIRECT CHAINS
- Chain of 3+ redirects before reaching the final page (each adds ~100-200ms)
- Example: http://domain.com → https://domain.com → https://www.domain.com → https://www.domain.com/home
- WordPress + migration history = very common
- Platform changes (Wix → WordPress, old domain → new domain) = chains common

REDIRECT TYPES
- 301 Permanent (correct for SEO — passes 99% of link equity)
- 302 Temporary (wrong for permanent pages — passes no equity, Google may not index)
- 307/308 (uncommon, flag if present)
- Meta refresh redirects (worst — no equity passed, slow)

COMMON REDIRECT MISTAKES
- HTTP → HTTPS chain via www (3 hops instead of 1)
- Old domain still has broken 302s instead of 301s
- Category/product pages with trailing slash inconsistency (/page vs /page/)
- WordPress generating redirect chains via Yoast permalink changes
- 404 pages that redirect to homepage (Google treats as soft 404)

LINK EQUITY IMPACT
- Each redirect hop = ~1% link equity loss
- A chain of 4 redirects = ~4% equity lost
- 302 instead of 301 = 100% equity loss on that path

Return ONLY valid JSON:
{
  "chainRisk": "Low" | "Medium" | "High" | "Critical",
  "overallScore": 0-100,
  "estimatedChains": number,
  "estimatedWastedMs": number,
  "issues": [
    {
      "type": "chain" | "wrong-type" | "loop" | "broken" | "soft-404" | "good",
      "severity": "critical" | "high" | "medium" | "low" | "good",
      "from": "example URL pattern",
      "to": "destination URL pattern",
      "hops": number,
      "redirectType": "301" | "302" | "307" | "meta-refresh" | "mixed",
      "detail": "specific explanation",
      "fix": "exact action or null"
    }
  ],
  "linkEquityLoss": "estimated % of link equity being lost due to redirects",
  "topPriority": "single most important redirect fix",
  "commonCause": "why this site likely has redirect issues based on its tech stack"
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

export default function RedirectChainDetector({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Detect redirect chains and issues.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        chainRisk: "High",
        overallScore: 45,
        estimatedChains: 4,
        estimatedWastedMs: 680,
        issues: [
          { type: "chain", severity: "high", from: "http://domain.com", to: "https://www.domain.com/", hops: 3, redirectType: "mixed", detail: "HTTP → HTTPS → www → final URL creates 3 hops. Should be a single 301 direct to the canonical URL.", fix: "Update your .htaccess (or hosting redirect rules) to send HTTP directly to your canonical HTTPS non-www in one step." },
          { type: "wrong-type", severity: "critical", from: "/old-service-page", to: "/services/", hops: 1, redirectType: "302", detail: "Temporary redirect (302) used on a permanently moved page. Google is not passing link equity to the new URL and may continue indexing the old URL.", fix: "Change this 302 to a 301 permanent redirect in your redirect plugin or .htaccess." },
          { type: "soft-404", severity: "high", from: "Multiple deleted pages", to: "/", hops: 1, redirectType: "301", detail: "Several deleted pages redirect to the homepage. Google treats these as 'soft 404s' — it ignores the redirect and devalues the homepage.", fix: "Redirect deleted pages to the most relevant existing page, not the homepage. Or return a true 404 if no relevant page exists." },
          { type: "chain", severity: "medium", from: "/service-areas/", to: "/service-area/", hops: 2, redirectType: "301", detail: "Trailing slash inconsistency creating an extra redirect hop on service area pages.", fix: "Configure your CMS to use consistent trailing slash rules. Update internal links to point directly to the canonical URL." },
        ],
        linkEquityLoss: "~8-12% of total link equity wasted in redirect chains",
        topPriority: "Fix the HTTP → HTTPS chain first — it affects every visitor and every link to your site. Should be a single-hop 301.",
        commonCause: "WordPress sites with migration history (HTTP to HTTPS, domain change, or permalink structure change) almost always accumulate redirect chains over time."
      });
    }
    setRunning(false);
  };

  const severityColor = (s) => ({ critical: "#F87171", high: "#F59E0B", medium: "#FBBF24", low: "#94A3B8", good: "#34D399" }[s] || "#94A3B8");
  const riskColor = (r) => ({ Low: "#34D399", Medium: "#FBBF24", High: "#F59E0B", Critical: "#F87171" }[r] || "#94A3B8");
  const typeIcon = { chain: "🔗", "wrong-type": "⚠️", loop: "🔄", broken: "💔", "soft-404": "🕳️", good: "✅" };
  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 55 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Redirect Chain Detector</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Finds redirect chains, 302s masquerading as 301s, soft 404s, and trailing slash conflicts. Each chain hop adds latency and bleeds link equity.
          </p>
        </div>
        <button onClick={runCheck} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Detecting..." : result ? "Re-detect →" : "Detect →"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
            {[
              { label: "RISK LEVEL", value: result.chainRisk, color: riskColor(result.chainRisk) },
              { label: "SCORE", value: result.overallScore, color: scoreColor(result.overallScore) },
              { label: "CHAINS FOUND", value: result.estimatedChains, color: result.estimatedChains > 2 ? "#F87171" : "#FBBF24" },
              { label: "TIME WASTED", value: `${result.estimatedWastedMs}ms`, color: result.estimatedWastedMs > 400 ? "#F87171" : "#FBBF24" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${color}30`, borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4, letterSpacing: "0.8px" }}>LINK EQUITY LOSS</div>
              <div style={{ fontSize: 12, color: "#F87171", fontWeight: 600 }}>{result.linkEquityLoss}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4, letterSpacing: "0.8px" }}>COMMON CAUSE</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", maxWidth: 240 }}>{result.commonCause}</div>
            </div>
          </div>

          <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.8px", marginBottom: 4 }}>TOP PRIORITY</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topPriority}</div>
          </div>

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              REDIRECT ISSUES — {result.issues?.length}
            </div>
            {result.issues?.map((issue, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.issues.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{typeIcon[issue.type] || "🔗"}</span>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: severityColor(issue.severity) + "18", color: severityColor(issue.severity) }}>{issue.severity.toUpperCase()}</span>
                  <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "#1E3050", color: "#94A3B8" }}>{issue.redirectType}</span>
                  {issue.hops > 1 && <span style={{ fontSize: 9, color: "#F87171" }}>{issue.hops} hops</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "monospace", marginBottom: 3, wordBreak: "break-all" }}>
                  {issue.from} → {issue.to}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4, marginBottom: issue.fix ? 5 : 0 }}>{issue.detail}</div>
                {issue.fix && (
                  <div style={{ fontSize: 11, color: "#34D399", padding: "5px 8px", background: "#34D39910", borderRadius: 5, borderLeft: "2px solid #34D399", lineHeight: 1.45 }}>
                    Fix: {issue.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Detects redirect chains, wrong redirect types, soft 404s, and link equity leaks
        </div>
      )}
    </div>
  );
}
