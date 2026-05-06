/**
 * LocalRank Pro — AutoFix Engine
 * Tag: AFE | Group: Overview (top level)
 *
 * THE GAME CHANGER.
 *
 * Collects every finding from every module,
 * builds a prioritized fix queue, and executes
 * fixes automatically on the live site.
 *
 * No one opens a website. No one writes code.
 * No one touches a server.
 *
 * WHAT IT AUTOMATES:
 *   Technical fixes (zero human touch needed):
 *     - Canonical tag injection on all pages
 *     - Meta title + description updates
 *     - H1 tag updates
 *     - LocalBusiness schema injection
 *     - FAQPage schema injection (AEO page)
 *     - noindex removal on public pages
 *     - robots.txt corrections
 *     - Image conversion + replacement (Sharp)
 *     - Redirect addition (301s for renamed files)
 *     - Sitemap regeneration + GSC resubmission
 *     - Mixed content HTTP→HTTPS URL fixes
 *
 *   GBP fixes (via Google Business Profile API):
 *     - Business description update
 *     - Hours update
 *     - Category updates
 *     - Photo uploads
 *     - Post publishing (from GBP Post Scheduler)
 *     - Review responses (from GBP Optimizer)
 *
 *   Content deployment (with one-click approval):
 *     - City page HTML published to site
 *     - AEO Q&A page published to site
 *     - FAQ schema added to existing pages
 *
 *   Requires client approval (never auto-run):
 *     - Major content rewrites
 *     - Navigation structure changes
 *     - New page creation (city pages etc)
 *     - Pricing or business information changes
 *
 * ACCESS METHODS (set in client account settings):
 *   WordPress: LocalRank Pro plugin token
 *   Shopify:   OAuth token
 *   Custom:    SFTP credentials (encrypted vault)
 *   cPanel:    Hosting login (encrypted vault)
 *   GBP:       Google OAuth token
 */

import { useState, useEffect } from "react";

const MODULE_COLOR = "#10D9A0";
const MODULE_TAG   = "AFE";

// ── Fix categories and their automation level ─────────────────────────────────
const FIX_CATEGORIES = {
  canonical:   { label: "Canonical Tags",    auto: true,  icon: "CAN", color: "#A78BFA" },
  meta:        { label: "Meta Tags",         auto: true,  icon: "T/M", color: "#60A5FA" },
  h1:          { label: "H1 Tags",           auto: true,  icon: "H1",  color: "#60A5FA" },
  schema:      { label: "Schema Markup",     auto: true,  icon: "SCH", color: "#34D399" },
  images:      { label: "Image Conversion",  auto: true,  icon: "IMG", color: "#60A5FA" },
  security:    { label: "Security Fixes",    auto: true,  icon: "SEC", color: "#F87171" },
  robots:      { label: "Robots + Crawl",    auto: true,  icon: "BOT", color: "#94A3B8" },
  gbp:         { label: "GBP Updates",       auto: true,  icon: "GBP", color: "#34D399" },
  content:     { label: "Content Pages",     auto: false, icon: "PGE", color: "#FBBF24" },
  redirects:   { label: "301 Redirects",     auto: true,  icon: "RDR", color: "#94A3B8" },
  sitemap:     { label: "Sitemap",           auto: true,  icon: "XML", color: "#94A3B8" },
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:    { color: "#94A3B8", label: "Queued" },
  running:    { color: "#60A5FA", label: "Running..." },
  done:       { color: "#34D399", label: "Fixed" },
  approved:   { color: "#FBBF24", label: "Needs approval" },
  failed:     { color: "#F87171", label: "Failed" },
  skipped:    { color: "#94A3B8", label: "Skipped" },
};

// ── Demo fix queue (in production, populated from all module findings) ─────────
const buildDemoQueue = (businessName, city, websiteUrl) => [
  { id: "f01", category: "canonical", priority: 1, impact: "critical", page: `${websiteUrl || "https://citywidealarms.com"}/${(city||"st-charles").toLowerCase().replace(/\s+/g,"-")}-service/`, issue: `Your ${city||"city"} page is telling Google to ignore it — costing you local rankings`, fix: "Tell Google this page is the one it should rank for your city", autoFix: true, status: "pending", estimatedTime: "< 5 sec" },
  { id: "f02", category: "canonical", priority: 2, impact: "critical", page: `${websiteUrl || "https://citywidealarms.com"}/services/`, issue: "Your services page is pointing Google to your homepage instead of itself", fix: "Fix the signal so Google treats your services page as its own page", autoFix: true, status: "pending", estimatedTime: "< 5 sec" },
  { id: "f03", category: "security",  priority: 3, impact: "critical", page: "Entire website", issue: "12 photos on your site load over an old insecure connection — browsers warn visitors about this", fix: "Switch all 12 photos to the secure connection automatically", autoFix: true, status: "pending", estimatedTime: "~30 sec" },
  { id: "f04", category: "schema",    priority: 4, impact: "high",     page: "Homepage", issue: "Google's data about your business is missing your phone number and service area", fix: "Add your complete business info so Google shows it correctly in search results", autoFix: true, status: "pending", estimatedTime: "< 5 sec" },
  { id: "f05", category: "images",    priority: 5, impact: "high",     page: "Entire website", issue: "31 photos are in an old format that makes your site slow — slow sites rank lower and lose customers", fix: "Convert all 31 photos to a modern format that loads 5× faster", autoFix: true, status: "pending", estimatedTime: "~4 min" },
  { id: "f06", category: "meta",      priority: 6, impact: "high",     page: "Security cameras page", issue: "Your security cameras page has no description in Google search results — people skip past blank listings", fix: "Write a description that shows up under your link in Google", autoFix: true, status: "pending", estimatedTime: "< 5 sec" },
  { id: "f07", category: "gbp",       priority: 7, impact: "high",     page: "Google Business Profile", issue: "You haven't posted to your Google listing in 90 days — Google ranks active businesses higher", fix: "Publish 4 posts to your Google listing right now", autoFix: true, status: "pending", estimatedTime: "~20 sec" },
  { id: "f08", category: "gbp",       priority: 8, impact: "high",     page: "Google Business Profile", issue: "3 customer reviews have no reply from you — responding to reviews boosts your ranking", fix: "Send a personal reply to each of the 3 unanswered reviews", autoFix: true, status: "pending", estimatedTime: "~15 sec" },
  { id: "f09", category: "schema",    priority: 9, impact: "high",     page: "Q&A page", issue: "Your Q&A page isn't set up to appear in Google's featured answer boxes or AI answers", fix: "Add the behind-the-scenes code that gets your answers featured in Google", autoFix: true, status: "pending", estimatedTime: "< 5 sec" },
  { id: "f10", category: "robots",    priority: 10, impact: "medium",  page: "Entire website", issue: "Your test/staging website is showing up in Google search results and competing with your real site", fix: "Hide the test site from Google so only your real site ranks", autoFix: true, status: "pending", estimatedTime: "< 5 sec" },
  { id: "f11", category: "redirects", priority: 11, impact: "medium",  page: "Entire website", issue: "31 old photo links now lead to a broken dead-end page — bad for visitors and Google", fix: "Automatically send old photo links to the correct new photos", autoFix: true, status: "pending", estimatedTime: "~30 sec" },
  { id: "f12", category: "sitemap",   priority: 12, impact: "medium",  page: "Site map", issue: "3 of your city pages aren't on the list you gave Google — so Google may never find them", fix: "Add the missing pages to your list and tell Google to re-check your site", autoFix: true, status: "pending", estimatedTime: "~15 sec" },
  { id: "f13", category: "content",   priority: 13, impact: "high",    page: "New page needed", issue: "You have no Q&A page — Google and Siri use these to answer questions and feature local businesses", fix: `Publish a Q&A page written for ${city||"your city"} that gets you into AI answers`, autoFix: false, status: "approved", estimatedTime: "~10 sec after you approve" },
  { id: "f14", category: "content",   priority: 14, impact: "high",    page: "New page needed", issue: `You have no page targeting nearby cities — you're invisible to customers searching there`, fix: "Publish a page for a nearby city so you show up in those searches too", autoFix: false, status: "approved", estimatedTime: "~10 sec after you approve" },
];

export default function AutoFixEngine({
  industry, city, websiteUrl, businessName, mode, plan = "free",
  moduleFindings = null // in production, receives findings from all other modules
}) {
  const [accessConnected, setAccessConnected] = useState(false);
  const [accessMethod,    setAccessMethod]    = useState(null);
  const [queue,           setQueue]           = useState(null);
  const [running,         setRunning]         = useState(false);
  const [runningId,       setRunningId]       = useState(null);
  const [filter,          setFilter]          = useState("all");
  const [log,             setLog]             = useState([]);

  const initQueue = () => {
    setQueue(buildDemoQueue(businessName, city, websiteUrl));
    setLog([]);
  };

  // Simulate running a fix
  const runFix = async (fix) => {
    if (plan === "free") return;
    setRunning(true);
    setRunningId(fix.id);

    // Mark as running
    setQueue(q => q.map(f => f.id === fix.id ? { ...f, status: "running" } : f));
    setLog(l => [...l, { time: new Date().toLocaleTimeString(), message: `Starting: ${fix.fix}`, id: fix.id }]);

    // Simulate async fix execution
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    // 95% success rate
    const success = Math.random() > 0.05;
    setQueue(q => q.map(f => f.id === fix.id ? { ...f, status: success ? "done" : "failed" } : f));
    setLog(l => [...l, {
      time: new Date().toLocaleTimeString(),
      message: success ? `✓ Fixed: ${fix.issue}` : `✗ Failed: ${fix.issue} — check access credentials`,
      id: fix.id,
      success
    }]);

    setRunning(false);
    setRunningId(null);
  };

  // Run all auto-fixable items in sequence
  const runAll = async () => {
    if (plan === "free" || !queue) return;
    const autoFixes = queue.filter(f => f.autoFix && f.status === "pending");
    for (const fix of autoFixes) {
      await runFix(fix);
    }
  };

  const stats = queue ? {
    total:    queue.length,
    auto:     queue.filter(f => f.autoFix).length,
    approval: queue.filter(f => !f.autoFix).length,
    done:     queue.filter(f => f.status === "done").length,
    critical: queue.filter(f => f.impact === "critical").length,
  } : null;

  const filtered = (queue || []).filter(f => {
    if (filter === "all")      return true;
    if (filter === "auto")     return f.autoFix && f.status !== "done";
    if (filter === "approval") return !f.autoFix;
    if (filter === "done")     return f.status === "done";
    return true;
  });

  const IMPACT_COLOR = { critical: "#F87171", high: "#FBBF24", medium: "#60A5FA", low: "#94A3B8" };
  const IMPACT_LABEL = { critical: "Urgent", high: "High", medium: "Medium", low: "Low" };

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B0E16 0%, #1A2035 100%)", border: "0.5px solid #10D9A040", borderRadius: 10, padding: "16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "20", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#F1F5F9" }}>AutoFix Engine</span>
          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#10D9A020", color: MODULE_COLOR, border: "0.5px solid #10D9A040" }}>Automation Platform</span>
        </div>
        <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 12px", lineHeight: 1.6 }}>
          We scan your whole website, find every problem hurting your Google ranking, and fix them automatically — no tech skills needed. Most fixes happen in seconds. Anything that changes your content gets your approval first.
        </p>

        {/* Access connection */}
        {!accessConnected ? (
          <div>
            <div style={{ fontSize: 9, color: "#64748B", marginBottom: 6, letterSpacing: "0.8px" }}>STEP 1 — HOW IS YOUR WEBSITE BUILT? (ONE TIME SETUP)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 5 }}>
              {[
                { id: "wp",     label: "WordPress",        desc: "Most common — install our free plugin" },
                { id: "shopify",label: "Shopify",          desc: "Click approve in your Shopify admin" },
                { id: "cpanel", label: "Web Hosting Login",desc: "Use your hosting username & password" },
                { id: "sftp",   label: "Other / Custom",   desc: "We'll walk you through it" },
              ].map(m => (
                <button key={m.id} onClick={() => { setAccessMethod(m.id); setAccessConnected(true); initQueue(); }} style={{ padding: "8px 6px", background: "#1E293B", border: "0.5px solid #334155", borderRadius: 7, color: "#94A3B8", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: "#E2E8F0", marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 9, color: "#64748B" }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: MODULE_COLOR }}></div>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Connected via {accessMethod} · {websiteUrl || "citywidealarms.com"}</span>
            <button onClick={() => { setAccessConnected(false); setQueue(null); setLog([]); }} style={{ fontSize: 9, padding: "2px 7px", border: "0.5px solid #334155", borderRadius: 4, background: "transparent", color: "#64748B", cursor: "pointer", marginLeft: "auto" }}>Disconnect</button>
          </div>
        )}
      </div>

      {/* Queue loaded */}
      {queue && stats && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            {[
              { label: "Issues found",       value: stats.total,    color: "var(--color-text-primary)" },
              { label: "We fix for you",     value: stats.auto,     color: MODULE_COLOR },
              { label: "You approve first",  value: stats.approval, color: "#FBBF24" },
              { label: "Urgent",             value: stats.critical, color: "#F87171" },
              { label: "Fixed",              value: stats.done,     color: "#34D399" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 7, padding: "9px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Run all button */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <button
              onClick={runAll}
              disabled={running || plan === "free"}
              style={{ flex: 1, padding: "10px", background: plan === "free" ? "var(--color-background-secondary)" : running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 7, color: plan === "free" ? "var(--color-text-secondary)" : running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: plan === "free" || running ? "not-allowed" : "pointer" }}
            >
              {plan === "free" ? "Upgrade to Fix Everything Automatically" : running ? `Fixing… (${stats.done} of ${stats.auto} done)` : `Fix All ${stats.auto} Issues Automatically →`}
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              {["all","auto","approval","done"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 9, padding: "4px 8px", borderRadius: 4, border: "0.5px solid var(--color-border-secondary)", background: filter === f ? "var(--color-background-secondary)" : "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                  {f === "all" ? "All" : f === "auto" ? "Auto-fix" : f === "approval" ? "Need approval" : "Fixed"}
                </button>
              ))}
            </div>
          </div>

          {/* Fix queue */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "grid", gridTemplateColumns: "28px 1fr 80px 60px 70px", gap: 8, alignItems: "center" }}>
              {["#","What's wrong + what we'll do","Type","Priority",""].map(h => (
                <div key={h} style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.6px" }}>{h}</div>
              ))}
            </div>

            {filtered.map((fix, i) => {
              const cat = FIX_CATEGORIES[fix.category] || FIX_CATEGORIES.meta;
              const st  = STATUS[fix.status] || STATUS.pending;
              const isRunning = runningId === fix.id;
              return (
                <div key={fix.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 60px 70px", gap: 8, alignItems: "center", padding: "9px 12px", borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", background: isRunning ? "#10D9A008" : fix.status === "done" ? "#34D39906" : "transparent" }}>

                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", textAlign: "center" }}>{fix.priority}</div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>{fix.issue}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Fix: {fix.fix}</div>
                    <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fix.page}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: 8, fontWeight: 500, color: cat.color, background: cat.color + "18", padding: "2px 5px", borderRadius: 3 }}>{cat.icon}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: IMPACT_COLOR[fix.impact] + "18", color: IMPACT_COLOR[fix.impact] }}>{IMPACT_LABEL[fix.impact] || fix.impact}</span>
                  </div>

                  <div>
                    {fix.status === "done" ? (
                      <span style={{ fontSize: 9, color: "#34D399" }}>✓ Fixed</span>
                    ) : fix.status === "running" ? (
                      <span style={{ fontSize: 9, color: "#60A5FA" }}>Running...</span>
                    ) : fix.autoFix ? (
                      <button onClick={() => runFix(fix)} disabled={running || plan === "free"} style={{ fontSize: 9, padding: "3px 8px", background: plan === "free" ? "var(--color-background-secondary)" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 4, color: plan === "free" ? "var(--color-text-secondary)" : "#0B0E16", cursor: plan === "free" ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                        Fix now
                      </button>
                    ) : (
                      <button onClick={() => { setQueue(q => q.map(f => f.id === fix.id ? { ...f, status: "approved" } : f)); runFix({ ...fix, autoFix: true }); }} style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF2416", border: "0.5px solid #FBBF2430", borderRadius: 4, color: "#FBBF24", cursor: "pointer", whiteSpace: "nowrap" }}>
                        Approve
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Live activity log */}
          {log.length > 0 && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>ACTIVITY LOG</div>
              <div style={{ padding: "8px 12px", maxHeight: 160, overflowY: "auto" }}>
                {log.slice().reverse().map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: i < log.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ fontSize: 9, color: "var(--color-text-secondary)", flexShrink: 0 }}>{entry.time}</span>
                    <span style={{ fontSize: 10, color: entry.success === false ? "#F87171" : entry.message.startsWith("✓") ? "#34D399" : "var(--color-text-secondary)" }}>{entry.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Not connected state */}
      {!queue && !accessConnected && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>Choose how your website is built above to get started</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            We connect securely to your website one time. Your login is encrypted and stored safely. You can disconnect any time.
          </div>
        </div>
      )}

    </div>
  );
}
