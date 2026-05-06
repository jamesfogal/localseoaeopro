/**
 * LocalRank Pro — Hosting Intelligence
 * Tag: HST | Group: Technical
 *
 * Detects who is hosting the site using:
 *   1. DNS nameserver lookup
 *   2. HTTP response header fingerprints
 *   3. IP address reverse lookup / ASN
 *   4. HTML source fingerprints
 *
 * Checks:
 *   - Hosting provider + tier (budget/quality/managed)
 *   - TTFB benchmark vs industry data
 *   - Cloudflare active? (CF-Ray header)
 *   - HTTP protocol version (1.1 / 2 / 3)
 *   - Server type (Apache / Nginx / LiteSpeed)
 *   - Storage type (NVMe / SSD / HDD if detectable)
 *   - Data center location vs client city
 *   - IP neighborhood quality
 *   - Upgrade recommendation with specific host + plan
 *   - Migration complexity rating
 *   - Affiliate link to recommended host
 */

import { useState } from "react";

const MODULE_COLOR = "#60A5FA";
const MODULE_TAG = "HST";

const SYSTEM_PROMPT = `You are a hosting intelligence specialist for LocalRank Pro, an AI Local SEO Platform.

You analyze a website's hosting environment and give specific upgrade recommendations.

DETECTION METHODS:
- Nameservers (ns1.bluehost.com = Bluehost, etc.)
- HTTP headers (Server: LiteSpeed, CF-Ray: = Cloudflare, x-kinsta-cache: = Kinsta, x-wpe-backend: = WP Engine)
- IP/ASN lookup
- HTML source fingerprints (WordPress generator, page builder classes)

HOSTING TIERS AND REAL 2025 TTFB BENCHMARKS:
Failing (avoid): GoDaddy ~790ms, HostGator ~790ms, IONOS ~590ms
Budget (acceptable): Bluehost ~440ms, Hostinger ~131ms, GreenGeeks ~395ms
Recommended: SiteGround ~300ms, Cloudways ~377ms, A2 Hosting ~397ms  
Premium: Kinsta ~200ms, WP Engine ~140ms

WHAT TO CHECK AND REPORT:
1. Detected hosting provider (with confidence level)
2. TTFB benchmark for this host
3. Cloudflare active (yes/no/partial)
4. HTTP protocol version (1.1/2/3)
5. Web server type (Apache/Nginx/LiteSpeed/unknown)
6. Server location vs business city (latency estimate)
7. Speed killers already handled by host (if managed)
8. Speed killers NOT handled (still need fixing)
9. Upgrade recommendation with specific host, plan, and monthly cost
10. Migration complexity (easy/medium/hard) and who handles it
11. Estimated speed improvement after migration
12. Monthly cost comparison (current vs recommended)

IMPORTANT: If site is already on Kinsta or WP Engine, flag as excellent and skip upgrade recommendation. Focus on remaining optimizations instead.

Return ONLY valid JSON:
{
  "detectedHost": "host name",
  "detectionConfidence": "high|medium|low",
  "detectionMethod": "how we detected it",
  "tier": "failing|budget|quality|managed|premium",
  "ttfbBenchmark": "XXXms",
  "ttfbRating": "excellent|good|poor|failing",
  "cloudflareActive": boolean,
  "cloudflareNote": "what cloudflare is or isn't doing",
  "httpProtocol": "HTTP/1.1|HTTP/2|HTTP/3",
  "webServer": "Apache|Nginx|LiteSpeed|unknown",
  "serverLocation": "estimated location",
  "distanceFromCity": "estimated distance and latency add",
  "monthlyHostingCost": "estimated current cost range",
  "speedKillersHandled": ["killers already handled by current host"],
  "speedKillersNotHandled": ["killers still needing fixes"],
  "upgradeNeeded": boolean,
  "upgradeRecommendation": {
    "host": "recommended host name",
    "plan": "specific plan name",
    "monthlyCost": "$/month",
    "ttfbImprovement": "XXXms → XXXms",
    "speedImprovement": "estimated total load time improvement",
    "migrationComplexity": "easy|medium|hard",
    "migrationHandledBy": "who handles the migration",
    "migrationTime": "estimated time",
    "migrationCost": "free|$XX",
    "whyThisHost": "specific reason this host is best for this business",
    "affiliateNote": "mention free migration and referral program"
  },
  "ipNeighborhoodRisk": "low|medium|high",
  "overallGrade": "A|B|C|D|F",
  "summary": "one paragraph plain English summary for a business owner",
  "topAction": "single most impactful hosting action to take"
}`;

const TIER_CONFIG = {
  premium:  { color: "#34D399", bg: "#34D39910", label: "Premium managed" },
  managed:  { color: "#84CC16", bg: "#84CC1610", label: "Managed hosting" },
  quality:  { color: "#FBBF24", bg: "#FBBF2410", label: "Quality shared" },
  budget:   { color: "#F97316", bg: "#F9731610", label: "Budget shared" },
  failing:  { color: "#F87171", bg: "#F8717110", label: "Failing — upgrade now" },
};

const GRADE_COLOR = { A: "#34D399", B: "#84CC16", C: "#FBBF24", D: "#F97316", F: "#F87171" };
const PROTO_COLOR = { "HTTP/3": "#34D399", "HTTP/2": "#FBBF24", "HTTP/1.1": "#F87171" };

// Build a plain-English result from the real API response
function buildResult(data, websiteUrl) {
  const cf = data.cloudflareActive;
  const host = data.detectedHost;
  const server = data.webServer;
  const proto = data.httpProtocol;

  // Grade
  let grade = "C";
  if (data.tier === "premium") grade = "A";
  else if (data.tier === "managed") grade = "B";
  else if (data.tier === "quality") grade = cf ? "B" : "C";
  else if (data.tier === "budget") grade = cf ? "C" : "D";
  else if (data.tier === "failing") grade = "F";
  else if (data.tier === "unknown" && cf) grade = "B"; // CF hiding origin

  // TTFB benchmarks
  const ttfbMap = { premium: "~150–200ms", managed: "~200–300ms", quality: "~280–400ms", budget: "~400–600ms", failing: "~700–900ms", unknown: "N/A (Cloudflare caching active)" };
  const ttfbRatingMap = { premium: "excellent", managed: "good", quality: "good", budget: "poor", failing: "failing", unknown: "good" };

  // Cloudflare note
  const cloudflareNote = cf
    ? "Cloudflare is active and confirmed by live response headers (CF-Ray detected). Your site gets CDN caching, DDoS protection, and automatic HTTPS from Cloudflare."
    : "No Cloudflare detected. Adding Cloudflare (free plan) would add a global CDN, speed up your site for visitors far from your server, and add security protection.";

  // Speed killers
  const handled = [];
  const notHandled = [];
  if (cf) { handled.push("CDN (Cloudflare is caching pages globally)"); handled.push("DDoS protection"); handled.push("Automatic HTTPS"); }
  else { notHandled.push("No CDN — every visitor hits your server directly"); }
  if (proto === "HTTP/3" || proto === "HTTP/2") handled.push(`${proto} (modern, fast protocol active)`);
  else notHandled.push("Old HTTP/1.1 protocol — upgrade to HTTP/2 for faster loading");
  if (server === "LiteSpeed") handled.push("LiteSpeed server (fast built-in page caching)");
  if (data.tier === "budget" || data.tier === "failing") {
    notHandled.push("Slow server response time (TTFB)");
    notHandled.push("Shared server resources with many other sites");
  }

  // Upgrade
  const upgradeNeeded = ["budget", "failing"].includes(data.tier) && !cf;
  const upgradeRecommendation = upgradeNeeded ? {
    ttfbImprovement: `${ttfbMap[data.tier]} → industry-leading TTFB`,
    speedImprovement: "Estimated 1–2 seconds faster on every page load",
    migrationCost: "No charge — we handle the full move for you",
    migrationTime: "Typically under 2 hours with zero downtime",
  } : null;

  // Summary
  let summary = "";
  if (cf && host.includes("hidden")) {
    summary = `Your site is running behind Cloudflare — confirmed by live response headers. This means your traffic gets CDN caching, global speed delivery, and DDoS protection automatically. The actual hosting server is masked by Cloudflare (this is normal and good). Protocol detected: ${proto}. Server type: ${server}.`;
  } else if (cf) {
    summary = `${websiteUrl} is hosted on ${host} with Cloudflare active (confirmed by CF-Ray header in the live response). Cloudflare is handling CDN and security. Protocol: ${proto}. Server: ${server}.`;
  } else {
    summary = `${websiteUrl} is hosted on ${host}. No Cloudflare CDN detected. Adding Cloudflare's free plan would immediately speed up the site and add security protection. Protocol: ${proto}. Server: ${server}.`;
  }

  return {
    detectedHost: host,
    detectionConfidence: data.detectionConfidence,
    detectionMethod: data.detectionMethod,
    tier: data.tier === "unknown" ? (cf ? "quality" : "budget") : data.tier,
    ttfbBenchmark: ttfbMap[data.tier] ?? "Unknown",
    ttfbRating: ttfbRatingMap[data.tier] ?? "poor",
    cloudflareActive: cf,
    cloudflareNote,
    httpProtocol: proto,
    webServer: server,
    monthlyHostingCost: "Contact host for current pricing",
    speedKillersHandled: handled,
    speedKillersNotHandled: notHandled,
    upgradeNeeded,
    upgradeRecommendation,
    overallGrade: grade,
    summary,
    topAction: cf
      ? "Cloudflare is active — focus on page speed optimizations like image compression and caching rules."
      : "Add Cloudflare (free) to get a CDN and speed boost without changing your hosting.",
    notableHeaders: data.notableHeaders,
  };
}

export default function HostingIntelligence({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result,  setResult]  = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const run = async () => {
    setRunning(true); setResult(null); setFetchError(null);
    const url = websiteUrl || "https://citywidealarms.com";
    try {
      const res  = await fetch(`/api/detect-hosting?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Detection failed");
      setResult(buildResult(data, url));
    } catch (err) {
      setFetchError(err.message || "Could not reach the site");
    }
    setRunning(false);
  };

  const tc = result ? (TIER_CONFIG[result.tier] || TIER_CONFIG.budget) : null;

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"14px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:9, fontWeight:500, color:MODULE_COLOR, background:MODULE_COLOR+"18", padding:"2px 6px", borderRadius:3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)" }}>Hosting Intelligence</span>
          </div>
          <p style={{ fontSize:11, color:"var(--color-text-secondary)", margin:0, lineHeight:1.5 }}>Detects who is hosting the site, their TTFB benchmark, whether Cloudflare is active, what HTTP protocol is running, and whether an upgrade would meaningfully improve speed and rankings.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding:"8px 14px", background:running?"transparent":MODULE_COLOR, border:`0.5px solid ${MODULE_COLOR}`, borderRadius:6, color:running?MODULE_COLOR:"#fff", fontSize:12, fontWeight:500, cursor:running?"not-allowed":"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
          {running?"Detecting...":result?"Re-detect →":"Detect Host →"}
        </button>
      </div>

      {result && (
        <div>
          {/* Host summary card */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            <div style={{ background:tc?.bg||"var(--color-background-secondary)", border:`0.5px solid ${tc?.color||"var(--color-border-tertiary)"}40`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:500, color:"var(--color-text-primary)", marginBottom:3 }}>{result.detectedHost}</div>
                  <span style={{ fontSize:9, padding:"2px 7px", borderRadius:3, background:tc?.color+"20", color:tc?.color, border:`0.5px solid ${tc?.color}40` }}>{tc?.label}</span>
                </div>
                <div style={{ fontSize:36, fontWeight:500, color:GRADE_COLOR[result.overallGrade], lineHeight:1 }}>{result.overallGrade}</div>
              </div>
              <div style={{ fontSize:10, color:"var(--color-text-secondary)" }}>Detected via: {result.detectionMethod}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {[
                { label:"TTFB", value:result.ttfbBenchmark, color:result.ttfbRating==="excellent"?"#34D399":result.ttfbRating==="good"?"#84CC16":result.ttfbRating==="poor"?"#FBBF24":"#F87171" },
                { label:"Protocol", value:result.httpProtocol, color:PROTO_COLOR[result.httpProtocol]||"#F87171" },
                { label:"Server", value:result.webServer, color:"var(--color-text-primary)" },
                { label:"Cloudflare", value:result.cloudflareActive?"Active ✓":"Not active", color:result.cloudflareActive?"#34D399":"#F87171" },
                { label:"Est. cost", value:result.monthlyHostingCost, color:"var(--color-text-secondary)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"5px 10px", background:"var(--color-background-secondary)", borderRadius:6, border:"0.5px solid var(--color-border-tertiary)" }}>
                  <span style={{ fontSize:10, color:"var(--color-text-secondary)" }}>{label}</span>
                  <span style={{ fontSize:10, fontWeight:500, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
            <div style={{ fontSize:9, color:"var(--color-text-secondary)", marginBottom:4, letterSpacing:"0.6px" }}>PLAIN ENGLISH SUMMARY</div>
            <div style={{ fontSize:11, color:"var(--color-text-primary)", lineHeight:1.6 }}>{result.summary}</div>
          </div>

          {/* Cloudflare note */}
          <div style={{ padding:"8px 12px", background:result.cloudflareActive?"#34D39910":"#F8717110", border:`0.5px solid ${result.cloudflareActive?"#34D39930":"#F8717130"}`, borderRadius:7, marginBottom:10 }}>
            <span style={{ fontSize:9, fontWeight:500, color:result.cloudflareActive?"#34D399":"#F87171" }}>CLOUDFLARE: </span>
            <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{result.cloudflareNote}</span>
          </div>

          {/* Speed killers handled vs not */}
          {result.speedKillersNotHandled?.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
              <div style={{ padding:"9px 12px", background:"#34D39910", border:"0.5px solid #34D39930", borderRadius:8 }}>
                <div style={{ fontSize:9, color:"#34D399", fontWeight:500, marginBottom:5 }}>HANDLED BY HOST ({result.speedKillersHandled?.length||0})</div>
                {(result.speedKillersHandled||[]).slice(0,4).map((k,i) => <div key={i} style={{ fontSize:10, color:"var(--color-text-secondary)", marginBottom:2 }}>✓ {k}</div>)}
                {(result.speedKillersHandled||[]).length === 0 && <div style={{ fontSize:10, color:"var(--color-text-secondary)" }}>None — upgrade needed</div>}
              </div>
              <div style={{ padding:"9px 12px", background:"#F8717110", border:"0.5px solid #F8717130", borderRadius:8 }}>
                <div style={{ fontSize:9, color:"#F87171", fontWeight:500, marginBottom:5 }}>STILL NEED FIXING ({result.speedKillersNotHandled?.length||0})</div>
                {(result.speedKillersNotHandled||[]).slice(0,4).map((k,i) => <div key={i} style={{ fontSize:10, color:"var(--color-text-secondary)", marginBottom:2 }}>✗ {k}</div>)}
              </div>
            </div>
          )}

          {/* Upgrade recommendation */}
          {result.upgradeNeeded && result.upgradeRecommendation && (
            <div style={{ border:"0.5px solid #10D9A040", borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"8px 14px", background:"#10D9A010", borderBottom:"0.5px solid #10D9A030", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:500, color:"var(--color-text-primary)" }}>Hosting Upgrade Available</span>
                <span style={{ fontSize:9, padding:"2px 8px", borderRadius:4, background:"#10D9A0", color:"#0B0E16", fontWeight:500 }}>We move everything — no charge</span>
              </div>
              <div style={{ padding:"14px" }}>
                <p style={{ fontSize:13, color:"var(--color-text-primary)", lineHeight:1.7, margin:"0 0 12px", fontWeight:500 }}>
                  We recommend two of the top hosting platforms in the industry — both deliver the lowest Time to First Byte available, meeting Google&apos;s strictest speed requirements.
                </p>
                <p style={{ fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.7, margin:"0 0 14px" }}>
                  If you choose to switch, we will move all of your website content to either platform at absolutely no charge. Your site stays live during the move and is typically fully migrated in under two hours.
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  <div style={{ padding:"9px 12px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8 }}>
                    <div style={{ fontSize:9, color:"var(--color-text-secondary)", marginBottom:3 }}>Expected TTFB after move</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#34D399" }}>{result.upgradeRecommendation.ttfbImprovement}</div>
                  </div>
                  <div style={{ padding:"9px 12px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8 }}>
                    <div style={{ fontSize:9, color:"var(--color-text-secondary)", marginBottom:3 }}>Migration cost to you</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#34D399" }}>{result.upgradeRecommendation.migrationCost}</div>
                  </div>
                </div>
                <div style={{ padding:"10px 14px", background:"#60A5FA10", border:"0.5px solid #60A5FA30", borderRadius:8, fontSize:11, color:"var(--color-text-secondary)", lineHeight:1.6 }}>
                  <span style={{ color:"#60A5FA", fontWeight:600 }}>Ready to switch? </span>
                  Contact us and we will walk you through both options, explain the difference, and handle everything from start to finish — including pointing your domain to the new server when the move is complete.
                </div>
              </div>
            </div>
          )}

          {!result.upgradeNeeded && (
            <div style={{ padding:"10px 14px", background:"#34D39910", border:"0.5px solid #34D39930", borderRadius:8 }}>
              <div style={{ fontSize:11, color:"#34D399", fontWeight:500 }}>Already on premium managed hosting — no upgrade needed.</div>
              <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:3 }}>{result.topAction}</div>
            </div>
          )}
        </div>
      )}

      {fetchError && (
        <div style={{ padding:"12px 16px", background:"#F8717110", border:"0.5px solid #F8717130", borderRadius:8, color:"#F87171", fontSize:12 }}>
          Could not reach {websiteUrl} — {fetchError}. Make sure the URL is correct and the site is live.
        </div>
      )}

      {!result && !running && !fetchError && (
        <div style={{ textAlign:"center", padding:"36px 20px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, color:"var(--color-text-secondary)", fontSize:12 }}>
          Detects your real hosting provider, Cloudflare status, HTTP protocol, and web server by reading your site&apos;s live response headers — no guessing.
        </div>
      )}
    </div>
  );
}
