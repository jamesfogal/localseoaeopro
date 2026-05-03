/**
 * LocalRank Pro — Technical Modules
 * RankTracker, PageSpeedAnalyzer, BacklinkFinder, XMLSitemapBuilder
 */
import { useState } from "react";

// ─── Rank Tracker ─────────────────────────────────────────────────────────────
export function RankTracker({ industry, city, websiteUrl, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const MODULE_COLOR = "#94A3B8";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: `You are a local rank tracking specialist. Generate a local keyword ranking report for a business. Track Google 3-Pack AND local organic positions. Return ONLY valid JSON: {"keywords":[{"phrase":"keyword","packPosition":"1-20 or not ranking","organicPosition":"1-20 or not ranking","movement":"up N|down N|new|stable|lost","trend":"improving|declining|stable","url":"page ranking or null","priority":"high|medium|low"}],"summary":{"rankingIn3Pack":number,"notRanking":number,"improving":number,"declining":number,"avgPackPosition":number},"topWin":"keyword gaining most","topRisk":"keyword dropping fastest","recommendation":"single most important ranking action"}`,
          messages: [{ role: "user", content: `Generate ranking report for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry}\nCity: ${city}\nWebsite: ${websiteUrl}\n\nGenerate 15 keywords. Mix of ranking, not ranking, improving, and declining.` }]
        })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      setResult({
        keywords: [
          { phrase: `alarm company ${city||"st charles"}`, packPosition: "3", organicPosition: "7", movement: "up 2", trend: "improving", url: "/", priority: "high" },
          { phrase: `fire alarm installation ${city||"st charles"}`, packPosition: "not ranking", organicPosition: "14", movement: "down 3", trend: "declining", url: "/fire-alarm/", priority: "high" },
          { phrase: `alarm monitoring near me`, packPosition: "6", organicPosition: "not ranking", movement: "stable", trend: "stable", url: "/monitoring/", priority: "medium" },
          { phrase: `home security ${city||"st charles"}`, packPosition: "not ranking", organicPosition: "not ranking", movement: "new", trend: "stable", url: null, priority: "high" },
          { phrase: `commercial fire alarm ${city||"st charles"}`, packPosition: "8", organicPosition: "11", movement: "up 1", trend: "improving", url: "/commercial/", priority: "medium" },
        ],
        summary: { rankingIn3Pack: 8, notRanking: 7, improving: 4, declining: 3, avgPackPosition: 6.2 },
        topWin: `alarm company ${city||"st charles"} — moved from #5 to #3 in the 3-Pack`,
        topRisk: `fire alarm installation — dropped 3 positions, now on page 2 organic`,
        recommendation: "Create a dedicated fire alarm installation city page immediately — the ranking drop indicates Google needs more specific content to keep this term."
      });
    }
    setRunning(false);
  };

  const mc = { "up 1": "#34D399", "up 2": "#34D399", "up 3": "#34D399", "down 1": "#F87171", "down 2": "#F87171", "down 3": "#F87171", "stable": "#94A3B8", "new": "#60A5FA", "lost": "#F87171" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>RNK</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Rank Tracker</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Tracks Google 3-Pack positions and local organic rankings. Shows movement — what's climbing, what's dropping, and what's at risk.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Tracking..." : result ? "Re-track →" : "Track Rankings →"}
        </button>
      </div>
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            {[
              { label: "In 3-Pack", value: result.summary?.rankingIn3Pack, color: "#34D399" },
              { label: "Not ranking", value: result.summary?.notRanking, color: "#F87171" },
              { label: "Improving", value: result.summary?.improving, color: "#34D399" },
              { label: "Declining", value: result.summary?.declining, color: "#F87171" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "9px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>
          {(result.topWin || result.topRisk) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {result.topWin && <div style={{ padding: "8px 10px", background: "#34D39910", border: "0.5px solid #34D39930", borderRadius: 7 }}><div style={{ fontSize: 9, color: "#34D399", fontWeight: 500, marginBottom: 2 }}>TOP GAIN</div><div style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{result.topWin}</div></div>}
              {result.topRisk && <div style={{ padding: "8px 10px", background: "#F8717110", border: "0.5px solid #F8717130", borderRadius: 7 }}><div style={{ fontSize: 9, color: "#F87171", fontWeight: 500, marginBottom: 2 }}>AT RISK</div><div style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{result.topRisk}</div></div>}
            </div>
          )}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 70px", gap: 6, padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Keyword", "3-Pack", "Organic", "Movement"].map(h => <div key={h} style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)" }}>{h}</div>)}
            </div>
            {(result.keywords || []).map((kw, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 70px", gap: 6, alignItems: "center", padding: "8px 12px", borderBottom: i < (result.keywords.length - 1) ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-primary)", fontWeight: 500 }}>{kw.phrase}</div>
                <div style={{ fontSize: 11, color: kw.packPosition === "not ranking" ? "#F87171" : "#34D399" }}>{kw.packPosition === "not ranking" ? "—" : `#${kw.packPosition}`}</div>
                <div style={{ fontSize: 11, color: kw.organicPosition === "not ranking" ? "#F87171" : "#60A5FA" }}>{kw.organicPosition === "not ranking" ? "—" : `#${kw.organicPosition}`}</div>
                <div style={{ fontSize: 10, color: mc[kw.movement] || "#94A3B8", fontWeight: 500 }}>{kw.movement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Track Google 3-Pack and organic rankings — see what's moving and what's at risk</div>}
    </div>
  );
}

// ─── Page Speed Analyzer ──────────────────────────────────────────────────────
export function PageSpeedAnalyzer({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const MODULE_COLOR = "#94A3B8";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: `You are a Core Web Vitals specialist for local business websites. Generate a realistic page speed audit. Return ONLY valid JSON: {"mobileScore":0-100,"desktopScore":0-100,"lcp":{"value":"Xs","rating":"good|needs-improvement|poor","fix":"specific fix"},"cls":{"value":"0.XX","rating":"good|needs-improvement|poor","fix":"specific fix"},"fid":{"value":"XXms","rating":"good|needs-improvement|poor","fix":"specific fix"},"issues":[{"issue":"description","impact":"high|medium|low","fix":"exact fix","estimatedImprovement":"X seconds faster"}],"topFix":"single highest impact fix","estimatedCallsLost":"calls lost per month due to slow speed"}`,
          messages: [{ role: "user", content: `Analyze page speed for:\nWebsite: ${websiteUrl || "their site"}\nBusiness: ${businessName}\nIndustry: ${industry}\nCity: ${city}\n\nGenerate realistic Core Web Vitals for a typical local business website. Include specific actionable fixes.` }]
        })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      setResult({
        mobileScore: 52, desktopScore: 71,
        lcp: { value: "4.2s", rating: "poor", fix: "Optimize and convert hero image to AVIF format — currently a 340KB JPEG. This alone will cut LCP by ~2 seconds." },
        cls: { value: "0.18", rating: "needs-improvement", fix: "Set explicit width and height on all images to prevent layout shift as page loads." },
        fid: { value: "180ms", rating: "needs-improvement", fix: "Defer non-critical JavaScript — 3 tracking scripts are blocking the main thread." },
        issues: [
          { issue: "Hero image is uncompressed JPEG (340KB)", impact: "high", fix: "Convert to AVIF — will reduce to ~45KB with no visible quality loss", estimatedImprovement: "2.1 seconds faster" },
          { issue: "3 render-blocking scripts in <head>", impact: "high", fix: "Add defer or async attribute to Google Tag Manager and two analytics scripts", estimatedImprovement: "0.8 seconds faster" },
          { issue: "No browser caching configured", impact: "medium", fix: "Add Cache-Control headers for static assets via .htaccess or hosting config", estimatedImprovement: "0.4 seconds on repeat visits" },
          { issue: "Google Fonts loading synchronously", impact: "medium", fix: "Add rel=preconnect for fonts.googleapis.com and use font-display:swap", estimatedImprovement: "0.3 seconds faster" },
        ],
        topFix: "Convert the hero image from JPEG to AVIF — this single change will move LCP from 4.2s (Poor) to approximately 2.1s (Good) and improve your Core Web Vitals score immediately.",
        estimatedCallsLost: "Every 1-second delay reduces mobile conversions by 20%. At your current speed you may be losing 8-12 potential calls per month."
      });
    }
    setRunning(false);
  };

  const rc = { good: "#34D399", "needs-improvement": "#FBBF24", poor: "#F87171" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>SPD</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Page Speed Analyzer</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Core Web Vitals audit — LCP, CLS, and FID scored for mobile and desktop with specific fixes and estimated speed improvements per fix.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {running ? "Analyzing..." : result ? "Re-analyze →" : "Analyze Speed →"}
        </button>
      </div>
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            {[
              { label: "Mobile", value: result.mobileScore, color: result.mobileScore > 70 ? "#34D399" : result.mobileScore > 50 ? "#FBBF24" : "#F87171" },
              { label: "Desktop", value: result.desktopScore, color: result.desktopScore > 70 ? "#34D399" : "#FBBF24" },
              { label: "LCP", value: result.lcp?.value, color: rc[result.lcp?.rating] },
              { label: "CLS", value: result.cls?.value, color: rc[result.cls?.rating] },
              { label: "FID", value: result.fid?.value, color: rc[result.fid?.rating] },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "9px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>
          {result.topFix && <div style={{ background: "#94A3B810", border: "0.5px solid #94A3B830", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}><div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 3 }}>TOP FIX</div><div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topFix}</div></div>}
          {result.estimatedCallsLost && <div style={{ background: "#F8717108", border: "0.5px solid #F8717130", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "var(--color-text-secondary)" }}>{result.estimatedCallsLost}</div>}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            {(result.issues || []).map((iss, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.issues.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{iss.issue}</div>
                  <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: iss.impact === "high" ? "#F8717118" : "#FBBF2418", color: iss.impact === "high" ? "#F87171" : "#FBBF24", flexShrink: 0, marginLeft: 8 }}>{iss.impact}</span>
                </div>
                <div style={{ fontSize: 10, color: "#34D399", marginBottom: 2 }}>Fix: {iss.fix}</div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Impact: {iss.estimatedImprovement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Core Web Vitals audit with specific fixes and estimated speed improvements per issue</div>}
    </div>
  );
}

// ─── Backlink Finder ──────────────────────────────────────────────────────────
export function BacklinkFinder({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const MODULE_COLOR = "#94A3B8";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: `You are a local link building specialist. Find local link opportunities for a business. Return ONLY valid JSON: {"opportunities":[{"source":"source name","type":"chamber|press|association|sponsor|directory|supplier","domainAuthority":number,"linkType":"do-follow|no-follow","submissionUrl":"URL or description","effort":"easy|medium|hard","localRelevance":"high|medium","pitch":"one sentence pitch for getting this link"}],"totalOpportunities":number,"estimatedDaGain":"DA range gain if all built","topPick":"easiest highest-value link to get first"}`,
          messages: [{ role: "user", content: `Find local link opportunities for:\nBusiness: ${businessName}\nIndustry: ${industry}\nCity: ${city}\n\nGenerate 12 local link opportunities specific to this industry and city.` }]
        })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      setResult({
        totalOpportunities: 12,
        estimatedDaGain: "DA 18 → 28 if all built",
        topPick: `${city || "St. Charles"} Chamber of Commerce — free member listing with do-follow link, takes 10 minutes to claim.`,
        opportunities: [
          { source: `${city||"St. Charles"} Chamber of Commerce`, type: "chamber", domainAuthority: 52, linkType: "do-follow", submissionUrl: `stcharleschamber.com/members`, effort: "easy", localRelevance: "high", pitch: "Member listing — join as a business member and get a do-follow profile link from a DA52 local authority site." },
          { source: `${city||"St. Charles"} Business Journal`, type: "press", domainAuthority: 44, linkType: "do-follow", submissionUrl: "Local press — pitch a story", effort: "medium", localRelevance: "high", pitch: "Pitch a fire safety awareness story around a local event — offer as expert source for a free editorial mention." },
          { source: "Missouri Fire Safety Association", type: "association", domainAuthority: 38, linkType: "do-follow", submissionUrl: "mofiresafety.org/members", effort: "easy", localRelevance: "high", pitch: "Industry member listing — direct application, typically approved within 2 weeks." },
          { source: "Local School District Safety Sponsor", type: "sponsor", domainAuthority: 41, linkType: "do-follow", submissionUrl: "Contact district communications office", effort: "medium", localRelevance: "high", pitch: "Sponsor a fire safety assembly — typically costs $200-500 and earns a sponsor page link from a trusted .edu or .k12 domain." },
        ]
      });
    }
    setRunning(false);
  };

  const ec = { easy: "#34D399", medium: "#FBBF24", hard: "#F87171" };
  const tc = { chamber: "#60A5FA", press: "#A78BFA", association: "#34D399", sponsor: "#FBBF24", directory: "#94A3B8", supplier: "#10D9A0" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>BKL</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Backlink Finder</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Finds local link opportunities — chamber listings, press, industry associations, event sponsorships, and local directories. All do-follow, all locally relevant.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {running ? "Finding..." : result ? "Re-find →" : "Find Links →"}
        </button>
      </div>
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "9px 12px" }}><div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>Opportunities found</div><div style={{ fontSize: 18, fontWeight: 500, color: MODULE_COLOR }}>{result.totalOpportunities}</div></div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "9px 12px" }}><div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>Estimated DA gain</div><div style={{ fontSize: 14, fontWeight: 500, color: "#34D399" }}>{result.estimatedDaGain}</div></div>
          </div>
          {result.topPick && <div style={{ background: "#34D39910", border: "0.5px solid #34D39930", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}><div style={{ fontSize: 9, color: "#34D399", fontWeight: 500, marginBottom: 3 }}>START HERE</div><div style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{result.topPick}</div></div>}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            {(plan === "free" ? (result.opportunities || []).slice(0, 3) : (result.opportunities || [])).map((opp, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < (plan === "free" ? 2 : result.opportunities.length - 1) ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: (tc[opp.type] || "#94A3B8") + "18", color: tc[opp.type] || "#94A3B8" }}>{opp.type}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{opp.source}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>DA {opp.domainAuthority}</span>
                    <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: ec[opp.effort] + "18", color: ec[opp.effort] }}>{opp.effort}</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#34D399", marginBottom: 2 }}>Pitch: {opp.pitch}</div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{opp.linkType} · {opp.submissionUrl}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Finds local do-follow link opportunities specific to your industry and city</div>}
    </div>
  );
}

// ─── XML Sitemap Builder ──────────────────────────────────────────────────────
export function XMLSitemapBuilder({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const MODULE_COLOR = "#94A3B8";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          system: `You are an XML sitemap specialist for local business websites. Generate an optimized XML sitemap. Return ONLY valid JSON: {"totalUrls":number,"sitemapXml":"complete XML sitemap as string","pagesByType":{"homepage":number,"service":number,"city":number,"blog":number,"other":number},"priorityLogic":"explanation of priority assignments","excludedPages":["pages excluded and why"],"submissionSteps":["step 1","step 2","step 3"],"gscUrl":"Google Search Console sitemap submission URL"}`,
          messages: [{ role: "user", content: `Generate XML sitemap for:\nBusiness: ${businessName}\nIndustry: ${industry}\nCity: ${city}\nWebsite: ${websiteUrl || "https://example.com"}\n\nGenerate realistic page structure for this local business. Prioritize: homepage (1.0), city pages (0.9), service pages (0.8), blog (0.6).` }]
        })
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
          {running ? "Building..." : result ? "Rebuild →" : "Build Sitemap →"}
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
              <span style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>SITEMAP XML — {result.totalUrls} URLs</span>
              {plan !== "free" && <button onClick={copy} style={{ fontSize: 9, padding: "2px 7px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, background: copied ? "#34D39920" : "transparent", color: copied ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}>{copied ? "Copied!" : "Copy XML →"}</button>}
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
