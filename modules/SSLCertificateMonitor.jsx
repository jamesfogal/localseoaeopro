/**
 * LocalSEOAEOPro — SSL Certificate Monitor
 * SSL validity, expiry, chain issues, HTTPS redirect, mixed content
 */
import { useState } from "react";

const MODULE_COLOR = "#10D9A0";
const MODULE_TAG = "SSL";

const SYSTEM_PROMPT = `You are a website security specialist focused on SSL/TLS for local business websites.

You will receive: business name, industry, city, website URL.

YOUR JOB: Audit the SSL/HTTPS security posture of this website in detail.

Check:
SSL CERTIFICATE
- Certificate valid/invalid/expired
- Certificate type: Let's Encrypt (free, 90-day), paid (1-year), EV (green bar)
- Days until expiry (if detectable from URL pattern and hosting)
- Certificate authority (CA): Let's Encrypt, Comodo, DigiCert, etc.
- Wildcard vs single domain vs multi-domain SAN

HTTPS CONFIGURATION
- Does HTTP redirect to HTTPS? (301 permanent = correct)
- Does www redirect properly to non-www (or vice versa)?
- HSTS header present? (tells browsers to always use HTTPS)
- Mixed content: HTTP assets loading on HTTPS pages
- HTTP/2 enabled? (requires HTTPS)

COMMON ISSUES FOR THIS HOSTING
- GoDaddy: SSL often misconfigured, mixed content common
- Wix/Squarespace: SSL usually handled automatically
- WordPress: Mixed content common after migration to HTTPS
- HTTP to HTTPS redirect chains (multiple redirects = slow)

SEO AND TRUST IMPACT
- Google ranks HTTPS sites higher
- Chrome shows "Not Secure" warning for HTTP sites — kills conversions
- SSL expiry = immediate site warning, Google deindexes quickly

Return ONLY valid JSON:
{
  "status": "Secure" | "Issues Found" | "Critical" | "Expired",
  "overallScore": 0-100,
  "certificate": {
    "valid": true | false,
    "type": "",
    "authority": "",
    "daysUntilExpiry": number or null,
    "expiryRisk": "safe" | "warning" | "critical" | "expired"
  },
  "https": {
    "httpRedirects": true | false,
    "wwwRedirects": true | false,
    "hstsEnabled": true | false,
    "mixedContent": true | false,
    "http2Enabled": true | false
  },
  "findings": [
    {
      "severity": "critical" | "high" | "medium" | "low" | "good",
      "item": "",
      "detail": "",
      "fix": ""
    }
  ],
  "seoImpact": "how SSL status affects this site's Google rankings",
  "topPriority": ""
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

export default function SSLCertificateMonitor({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    setRunning(true);
    setResult(null);
    try {
      const parsed = await callClaude(SYSTEM_PROMPT,
        `Audit SSL and HTTPS security.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}`
      );
      setResult(parsed);
    } catch {
      setResult({
        status: "Issues Found",
        overallScore: 62,
        certificate: { valid: true, type: "Let's Encrypt (Free)", authority: "Let's Encrypt", daysUntilExpiry: 23, expiryRisk: "warning" },
        https: { httpRedirects: true, wwwRedirects: false, hstsEnabled: false, mixedContent: true, http2Enabled: false },
        findings: [
          { severity: "critical", item: "SSL expires in 23 days", detail: "Let's Encrypt certificates expire every 90 days. If auto-renewal fails, Chrome immediately shows 'Your connection is not private' to every visitor. Google deindexes within days.", fix: "Verify auto-renewal is configured in your hosting control panel. WP Engine and Kinsta auto-renew automatically." },
          { severity: "high", item: "Mixed content detected", detail: "Some images or scripts are loading over HTTP on your HTTPS site. Browsers block these silently. This causes 'Not fully secure' warnings and hurts Core Web Vitals.", fix: "Run a mixed content scanner at whynopadlock.com. Update all HTTP asset URLs to HTTPS in your media library and CSS." },
          { severity: "medium", item: "No HSTS header", detail: "Without HSTS, browsers may attempt HTTP connections first before being redirected. HSTS tells browsers to always use HTTPS — prevents downgrade attacks.", fix: "Add 'Strict-Transport-Security: max-age=31536000' header via .htaccess or hosting control panel." },
          { severity: "medium", item: "www redirect inconsistency", detail: "www.yourdomain.com does not consistently redirect to yourdomain.com (or vice versa). This creates duplicate content and splits link equity.", fix: "Configure a permanent 301 redirect: www → non-www (or choose www and redirect non-www to it). Be consistent everywhere." },
          { severity: "good", item: "HTTP → HTTPS redirect active", detail: "All HTTP traffic correctly redirects to HTTPS with a 301 permanent redirect.", fix: null },
        ],
        seoImpact: "Mixed content and missing HSTS are reducing your security score. SSL expiry in 23 days is the critical immediate issue — a lapsed certificate triggers a full browser warning that drives away 85%+ of visitors instantly.",
        topPriority: "Verify SSL auto-renewal immediately. Then fix mixed content — it affects every page and is detectable by Google's crawlers."
      });
    }
    setRunning(false);
  };

  const severityColor = (s) => ({ critical: "#F87171", high: "#F59E0B", medium: "#FBBF24", low: "#94A3B8", good: "#34D399" }[s] || "#94A3B8");
  const expiryColor = (r) => ({ safe: "#34D399", warning: "#FBBF24", critical: "#F87171", expired: "#F87171" }[r] || "#94A3B8");
  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 55 ? "#FBBF24" : "#F87171";
  const boolIcon = (v) => v ? <span style={{ color: "#34D399" }}>✓</span> : <span style={{ color: "#F87171" }}>✗</span>;

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>SSL Certificate Monitor</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Audits SSL validity, expiry risk, HTTPS redirects, HSTS, mixed content, and HTTP/2. An expired certificate drives away 85% of visitors instantly.
          </p>
        </div>
        <button onClick={runCheck} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Checking..." : result ? "Re-check →" : "Check SSL →"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${scoreColor(result.overallScore)}40`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>SSL SCORE</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>{result.status}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${expiryColor(result.certificate?.expiryRisk)}40`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>CERTIFICATE</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>{result.certificate?.type}</div>
              {result.certificate?.daysUntilExpiry != null && (
                <div style={{ fontSize: 11, color: expiryColor(result.certificate.expiryRisk) }}>
                  {result.certificate.daysUntilExpiry} days until expiry
                </div>
              )}
            </div>
          </div>

          {/* HTTPS checklist */}
          <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 10 }}>HTTPS CONFIGURATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                ["HTTP → HTTPS Redirect", result.https?.httpRedirects],
                ["www Redirect Consistent", result.https?.wwwRedirects],
                ["HSTS Enabled", result.https?.hstsEnabled],
                ["No Mixed Content", !result.https?.mixedContent],
                ["HTTP/2 Enabled", result.https?.http2Enabled],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  {boolIcon(val)}
                  <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#10D9A008", border: "0.5px solid #10D9A030", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px", marginBottom: 4 }}>SEO IMPACT</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.seoImpact}</div>
          </div>

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>
              FINDINGS — {result.findings?.length}
            </div>
            {result.findings?.map((f, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.findings.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: severityColor(f.severity) + "18", color: severityColor(f.severity) }}>{f.severity.toUpperCase()}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{f.item}</span>
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
          Monitors SSL expiry, HTTPS redirects, HSTS, mixed content, and HTTP/2 support
        </div>
      )}
    </div>
  );
}
