/**
 * LocalRank Pro — White Label Report Generator
 * Tag: WLR | Group: Overview
 */

import { useState, useEffect, useRef, useCallback } from "react";

const MODULE_COLOR = "#A78BFA";
const MODULE_TAG   = "WLR";

// ── Demo scores ───────────────────────────────────────────────────────────────
const DEMO_SCORES = {
  "On-Page":       { score: 42, issues: 8,  critical: 3 },
  "Technical":     { score: 38, issues: 12, critical: 4 },
  "Page Speed":    { score: 28, issues: 9,  critical: 5 },
  "GBP":           { score: 61, issues: 5,  critical: 1 },
  "Citations":     { score: 55, issues: 7,  critical: 2 },
  "Reviews":       { score: 63, issues: 4,  critical: 1 },
  "Keywords":      { score: 31, issues: 11, critical: 3 },
  "AI Visibility": { score: 18, issues: 8,  critical: 5 },
  "Security":      { score: 72, issues: 2,  critical: 1 },
  "Hosting":       { score: 22, issues: 6,  critical: 3 },
};

const SC = s => s >= 80 ? "#34D399" : s >= 60 ? "#84CC16" : s >= 40 ? "#FBBF24" : s >= 20 ? "#F97316" : "#F87171";
const SL = s => s >= 80 ? "Strong"  : s >= 60 ? "Good"    : s >= 40 ? "Needs work" : s >= 20 ? "Poor"  : "Critical";
const OVERALL_SCORE = Math.round(Object.values(DEMO_SCORES).reduce((a,b) => a + b.score, 0) / Object.keys(DEMO_SCORES).length);

// ── Phase 1 — 36 signals ──────────────────────────────────────────────────────
const SIGNALS = [
  "Heading structure (H1–H4)",
  "Title tags & meta descriptions",
  "Canonical tag audit",
  "Image alt text & compression",
  "Internal link architecture",
  "Critical signals checklist",
  "Keyword inspector",
  "Keyword ownership map",
  "Keyword intelligence layer",
  "Competitor intelligence scan",
  "Geo-grid rank positions",
  "Google Business Profile health",
  "GBP post schedule",
  "GBP listing protection",
  "Citation accuracy (50+ directories)",
  "Citation search engine sweep",
  "Citation auto-submit queue",
  "Review request campaign status",
  "Multi-platform review monitor",
  "AI visibility score (ChatGPT + Gemini)",
  "AEO Q&A generator check",
  "AEO Q&A page status",
  "City page coverage",
  "Blog calendar & content gap",
  "FAQ page structure",
  "Pricing page schema",
  "Comparison page presence",
  "PageSpeed Intelligence (mobile + desktop)",
  "Hosting intelligence verdict",
  "Rank tracker — 90-day trend",
  "Backlink finder & toxic link check",
  "XML sitemap builder status",
  "Social presence scanner",
  "Tracking pixel detector",
  "SSL certificate monitor",
  "Redirect chain detector",
];

// ── Phase 2 — compile checks ──────────────────────────────────────────────────
const COMPILE_STEPS = [
  "Scoring on-page signals",
  "Scoring technical health",
  "Scoring local SEO layer",
  "Scoring AI visibility",
  "Scoring reputation",
  "Weighing critical issues",
  "Ranking fix priorities",
  "Calculating opportunity score",
  "Formatting insights",
  "Building score grid",
  "Applying agency branding",
  "Finalizing report",
];

// ═══════════════════════════════════════════════════════════════════════════════
// BotBubble — animated chat bubble
// ═══════════════════════════════════════════════════════════════════════════════
function BotBubble({ text, delay = 0, onDone }) {
  const [visible, setVisible] = useState(false);
  const [typed,   setTyped]   = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setVisible(true);
      let i = 0;
      const speed = Math.max(18, Math.min(28, 1200 / text.length));
      const t2 = setInterval(() => {
        i++;
        setTyped(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(t2);
          if (!doneRef.current) { doneRef.current = true; onDone?.(); }
        }
      }, speed);
      return () => clearInterval(t2);
    }, delay);
    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, border: "1px solid #A78BFA40",
      }}>🤖</div>
      {/* Bubble */}
      <div style={{
        background: "#1A1040", border: "1px solid #A78BFA30",
        borderRadius: "4px 12px 12px 12px",
        padding: "10px 14px", maxWidth: "85%",
        fontSize: 16, color: "#E2E8F0", lineHeight: 1.55,
      }}>
        {typed}
        {typed.length < text.length && (
          <span style={{ display: "inline-block", width: 2, height: 14, background: "#A78BFA", marginLeft: 2, verticalAlign: "middle", animation: "blink 0.7s infinite" }} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CountdownBlock — shared countdown display used in phase 1 + 2
// ═══════════════════════════════════════════════════════════════════════════════
function CountdownBlock({ items, totalMs, color, onComplete }) {
  const total = items.length;
  const [idx, setIdx]       = useState(0);
  const idxRef              = useRef(0);
  const timerRef            = useRef(null);
  const onCompleteRef       = useRef(onComplete);
  onCompleteRef.current     = onComplete;

  const msEach = totalMs / total;

  const tick = useCallback((currentIdx) => {
    timerRef.current = setTimeout(() => {
      const next = currentIdx + 1;
      idxRef.current = next;
      setIdx(next);
      if (next >= total) { onCompleteRef.current?.(); }
      else { tick(next); }
    }, msEach);
  }, [msEach, total]);

  useEffect(() => {
    tick(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count    = total - idx;
  const progress = (idx / total) * 100;
  const label    = idx >= total ? "Done ✓" : items[idx];

  return (
    <div style={{
      background: "#0D0A1F", border: `1px solid ${color}30`,
      borderRadius: 12, padding: "20px 20px 16px",
      marginBottom: 16,
    }}>
      {/* Number + label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <div style={{
          fontSize: 64, fontWeight: 800, color: count === 0 ? "#34D399" : color,
          lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-2px",
          minWidth: 72, textAlign: "center",
          transition: "color 0.3s",
        }}>
          {count}
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            {total === SIGNALS.length ? "Signals Remaining" : "Steps Remaining"}
          </div>
          <div style={{ fontSize: 16, color, fontWeight: 600 }}>
            {label}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#1A1040", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 6 }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}, #60A5FA)`,
          borderRadius: 6, transition: "width 0.4s linear",
        }} />
      </div>
      <div style={{ fontSize: 13, color: "#374151", textAlign: "right" }}>
        {idx} / {total}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FinalCountdown — 5-4-3-2-1
// ═══════════════════════════════════════════════════════════════════════════════
function FinalCountdown({ onComplete }) {
  const [n, setN]           = useState(5);
  const onCompleteRef       = useRef(onComplete);
  onCompleteRef.current     = onComplete;

  useEffect(() => {
    let current = 5;
    const t = setInterval(() => {
      current--;
      setN(current);
      if (current <= 0) { clearInterval(t); setTimeout(() => onCompleteRef.current?.(), 400); }
    }, 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
      <div style={{
        fontSize: 96, fontWeight: 800, lineHeight: 1,
        color: n === 0 ? "#34D399" : "#F1F5F9",
        letterSpacing: "-4px", fontVariantNumeric: "tabular-nums",
        transition: "color 0.3s, transform 0.2s",
        transform: "scale(1)",
      }}>
        {n === 0 ? "✓" : n}
      </div>
      <div style={{ fontSize: 16, color: "#64748B", marginTop: 10 }}>
        {n === 0 ? "Report ready!" : "Generating your report…"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ReportBot — the full bot experience
// ═══════════════════════════════════════════════════════════════════════════════
function ReportBot({ businessName, city, industry, reportMode, agencyBrand, onReady }) {
  // phase: 0=intro bubbles, 1=signals countdown, 2=compile bubble, 3=compile countdown, 4=final bubble, 5=final countdown
  const [phase, setPhase] = useState(0);

  const advance = useCallback((to) => setPhase(to), []);

  return (
    <div style={{
      background: "linear-gradient(180deg, #0A0718 0%, #0D0A1F 100%)",
      border: "1px solid #A78BFA20", borderRadius: 14,
      padding: "24px 20px", minHeight: 320,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #1E1040" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>LocalRank AI</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399" }} />
            <span style={{ fontSize: 13, color: "#64748B" }}>Compiling report for {businessName || "your business"}</span>
          </div>
        </div>
      </div>

      {/* Phase 0 — Intro bubbles */}
      {phase >= 0 && (
        <BotBubble
          text={`Hey! I'm pulling together every signal we track for ${businessName ? businessName : "your business"} in ${city || "your market"}.`}
          delay={200}
          onDone={() => advance(0.5)}
        />
      )}
      {phase >= 0.5 && (
        <BotBubble
          text={`I'm scanning all ${SIGNALS.length} local SEO signals right now — let's count them down together.`}
          delay={0}
          onDone={() => advance(1)}
        />
      )}

      {/* Phase 1 — 36-signal countdown */}
      {phase >= 1 && (
        <CountdownBlock
          items={SIGNALS}
          totalMs={22000}
          color={MODULE_COLOR}
          onComplete={() => advance(2)}
        />
      )}

      {/* Phase 2 — "Now let's compile" bubble */}
      {phase >= 2 && (
        <BotBubble
          text="All signals collected. Now let's compile this report."
          delay={300}
          onDone={() => advance(3)}
        />
      )}

      {/* Phase 3 — Compile countdown */}
      {phase >= 3 && (
        <CountdownBlock
          items={COMPILE_STEPS}
          totalMs={10000}
          color="#60A5FA"
          onComplete={() => advance(4)}
        />
      )}

      {/* Phase 4 — Final step bubble */}
      {phase >= 4 && (
        <BotBubble
          text="This is the final step. Your report is being built right now."
          delay={400}
          onDone={() => advance(5)}
        />
      )}

      {/* Phase 5 — 5-4-3-2-1 */}
      {phase >= 5 && (
        <FinalCountdown onComplete={onReady} />
      )}

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main module
// ═══════════════════════════════════════════════════════════════════════════════
export default function WhiteLabelReportGenerator({
  industry, city, businessName, websiteUrl, mode = "named", plan = "free",
  agencyName = "LocalRank Pro", agencyLogo = null
}) {
  const [reportMode,  setReportMode]  = useState(mode === "anonymous" ? "prospect" : "client");
  const [stage,       setStage]       = useState("idle");   // idle | bot | report
  const [copied,      setCopied]      = useState(false);
  const [agencyBrand, setAgencyBrand] = useState(agencyName || "LocalRank Pro");

  const totalIssues    = Object.values(DEMO_SCORES).reduce((a,b) => a + b.issues,   0);
  const criticalIssues = Object.values(DEMO_SCORES).reduce((a,b) => a + b.critical, 0);

  const copyLink = () => {
    const link = `https://localrankpro.com/report/${Math.random().toString(36).slice(2,8)}`;
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>

      {/* ── Controls ──────────────────────────────────────────────── */}
      <div style={{ background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:9, fontWeight:500, color:MODULE_COLOR, background:MODULE_COLOR+"18", padding:"2px 6px", borderRadius:3 }}>{MODULE_TAG}</span>
              <span style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)" }}>White Label Report Generator</span>
            </div>
            <p style={{ fontSize:11, color:"var(--color-text-secondary)", margin:"0 0 10px", lineHeight:1.5 }}>
              Assembles all module findings into a branded, shareable report. Prospect mode for sales. Client mode for monthly reporting.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div>
                <div style={{ fontSize:9, color:"var(--color-text-secondary)", marginBottom:4 }}>Agency/Business name on report</div>
                <input type="text" value={agencyBrand} onChange={e => setAgencyBrand(e.target.value)} style={{ width:"100%", fontSize:11, padding:"5px 8px" }} placeholder="Your Agency Name" />
              </div>
              <div>
                <div style={{ fontSize:9, color:"var(--color-text-secondary)", marginBottom:4 }}>Report mode</div>
                <div style={{ display:"flex", gap:4 }}>
                  {["prospect","client"].map(m => (
                    <button key={m} onClick={() => setReportMode(m)} style={{ flex:1, fontSize:10, padding:"5px 8px", border:"0.5px solid var(--color-border-secondary)", borderRadius:5, background:reportMode===m?MODULE_COLOR:"transparent", color:reportMode===m?"#fff":"var(--color-text-secondary)", cursor:"pointer" }}>
                      {m.charAt(0).toUpperCase()+m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setStage("bot")}
            disabled={stage === "bot"}
            style={{ padding:"8px 14px", background: stage === "bot" ? MODULE_COLOR+"60" : MODULE_COLOR, border:`0.5px solid ${MODULE_COLOR}`, borderRadius:6, color:"#fff", fontSize:12, fontWeight:500, cursor: stage === "bot" ? "not-allowed" : "pointer", whiteSpace:"nowrap", flexShrink:0 }}
          >
            {stage === "report" ? "Regenerate →" : stage === "bot" ? "Running…" : "Generate Report →"}
          </button>
        </div>
      </div>

      {/* ── Bot experience ────────────────────────────────────────── */}
      {stage === "bot" && (
        <ReportBot
          businessName={businessName}
          city={city}
          industry={industry}
          reportMode={reportMode}
          agencyBrand={agencyBrand}
          onReady={() => setStage("report")}
        />
      )}

      {/* ── Report output ─────────────────────────────────────────── */}
      {stage === "report" && (
        <div>
          <div style={{ border:`0.5px solid ${MODULE_COLOR}40`, borderRadius:12, overflow:"hidden", marginBottom:12 }}>

            {/* Report header */}
            <div style={{ padding:"20px 24px", background:`linear-gradient(135deg, #1A0E3D 0%, #0B0E16 100%)`, borderBottom:`0.5px solid ${MODULE_COLOR}30` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:10, color:MODULE_COLOR, letterSpacing:"1px", marginBottom:4 }}>LOCAL SEO AUDIT REPORT</div>
                  <div style={{ fontSize:18, fontWeight:500, color:"#F1F5F9", marginBottom:2 }}>
                    {reportMode === "prospect" ? "Your Local SEO Opportunity Report" : `${businessName||"Your Business"} — Monthly SEO Report`}
                  </div>
                  <div style={{ fontSize:11, color:"#94A3B8" }}>Prepared by {agencyBrand} · {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:42, fontWeight:500, color:SC(OVERALL_SCORE), lineHeight:1 }}>{OVERALL_SCORE}</div>
                  <div style={{ fontSize:9, color:"#94A3B8" }}>Overall Score</div>
                  <div style={{ fontSize:10, color:SC(OVERALL_SCORE), fontWeight:500 }}>{SL(OVERALL_SCORE)}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:"#94A3B8", lineHeight:1.6 }}>
                {reportMode === "prospect"
                  ? `This report analyzes ${totalIssues} SEO issues affecting this business's local search visibility. ${criticalIssues} issues are critical and actively costing calls and revenue right now.`
                  : `This month's report covers all active optimizations, rankings movement, and fixes completed. ${criticalIssues} critical issues remain in the queue.`
                }
              </div>
            </div>

            {/* Score grid */}
            <div style={{ padding:"16px 20px", background:"var(--color-background-secondary)", borderBottom:`0.5px solid var(--color-border-tertiary)` }}>
              <div style={{ fontSize:9, fontWeight:500, color:"var(--color-text-secondary)", letterSpacing:"0.8px", marginBottom:10 }}>SEO HEALTH SCORES BY CATEGORY</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,minmax(0,1fr))", gap:6 }}>
                {Object.entries(DEMO_SCORES).map(([cat, data]) => (
                  <div key={cat} style={{ textAlign:"center", padding:"8px 6px", background:"var(--color-background-primary)", borderRadius:7, border:`0.5px solid ${SC(data.score)}30` }}>
                    <div style={{ fontSize:9, color:"var(--color-text-secondary)", marginBottom:4, lineHeight:1.3 }}>{cat}</div>
                    <div style={{ fontSize:20, fontWeight:500, color:SC(data.score), lineHeight:1 }}>{data.score}</div>
                    {data.critical > 0 && <div style={{ fontSize:8, color:"#F87171", marginTop:2 }}>{data.critical} critical</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Critical issues */}
            <div style={{ padding:"14px 20px", borderBottom:`0.5px solid var(--color-border-tertiary)` }}>
              <div style={{ fontSize:9, fontWeight:500, color:"#F87171", letterSpacing:"0.8px", marginBottom:8 }}>CRITICAL ISSUES REQUIRING IMMEDIATE ACTION</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {[
                  "Homepage carousel loading 4.2MB on 4G mobile — failing 1-second rule by 5+ seconds",
                  "Infogroup aggregator has wrong phone number — feeding bad data to 200+ directories",
                  `AI visibility score 18/100 — business not appearing on ChatGPT or Gemini for local ${industry||"service"} searches`,
                  "GBP secondary category changed by unauthorized edit 18 days ago — ranking impact in progress",
                  `Hosting on GoDaddy — 790ms TTFB using 80% of 1-second budget before first image loads`,
                ].map((issue, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 10px", background:"#F8717108", border:"0.5px solid #F8717130", borderRadius:6 }}>
                    <span style={{ color:"#F87171", fontSize:11, flexShrink:0, marginTop:1 }}>!</span>
                    <span style={{ fontSize:11, color:"var(--color-text-primary)", lineHeight:1.45 }}>{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What happens next */}
            <div style={{ padding:"14px 20px", background: reportMode==="prospect"?"#10D9A008":"var(--color-background-secondary)" }}>
              {reportMode === "prospect" ? (
                <div>
                  <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-primary)", marginBottom:6 }}>What happens when you work with {agencyBrand}:</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                    {[
                      "47 issues fixed automatically on your live site",
                      "18 more fixed with one approval click",
                      "GBP optimized and posting on schedule",
                      "Citations corrected across 50+ directories",
                      "Page speed improved to under 1 second",
                      "AI visibility built to appear on ChatGPT + Gemini",
                    ].map((p, i) => (
                      <div key={i} style={{ display:"flex", gap:6, fontSize:11, color:"var(--color-text-secondary)" }}>
                        <span style={{ color:"#10D9A0", flexShrink:0 }}>✓</span>{p}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10, padding:"8px 12px", background:MODULE_COLOR+"18", border:`0.5px solid ${MODULE_COLOR}40`, borderRadius:7, fontSize:11, color:"var(--color-text-primary)", fontWeight:500, textAlign:"center" }}>
                    Ready to fix all {totalIssues} issues? Contact {agencyBrand} today.
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-primary)", marginBottom:6 }}>Completed this month:</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {["All images converted to AVIF — 2.1s faster on homepage","Meta descriptions added to 6 missing pages","GBP review responses posted to all 3 pending reviews","New city page published for O'Fallon targeting 280 monthly searches"].map((c,i) => (
                      <div key={i} style={{ display:"flex", gap:6, fontSize:11, color:"var(--color-text-secondary)" }}>
                        <span style={{ color:"#34D399", flexShrink:0 }}>✓</span>{c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share options */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
            <button onClick={copyLink} style={{ padding:"9px", background:"var(--color-background-secondary)", border:`0.5px solid ${MODULE_COLOR}40`, borderRadius:7, color:copied?"#34D399":MODULE_COLOR, cursor:"pointer", fontSize:11, fontWeight:500 }}>
              {copied?"Link Copied! ✓":"Copy Share Link →"}
            </button>
            <button style={{ padding:"9px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:7, color:"var(--color-text-secondary)", cursor:plan==="free"?"not-allowed":"pointer", fontSize:11 }}>
              {plan==="free"?"PDF Export (paid)":"Export PDF →"}
            </button>
            <button style={{ padding:"9px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:7, color:"var(--color-text-secondary)", cursor:plan==="free"?"not-allowed":"pointer", fontSize:11 }}>
              {plan==="free"?"Email Report (paid)":"Email to Client →"}
            </button>
          </div>

          {plan === "free" && (
            <div style={{ marginTop:8, padding:"9px 12px", background:"#FBBF2408", border:"0.5px solid #FBBF2430", borderRadius:7, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>Upgrade for PDF export, email delivery, custom domain, and agency logo on every report.</div>
              <span style={{ fontSize:9, padding:"3px 8px", background:"#FBBF24", color:"#412402", borderRadius:4, fontWeight:500, whiteSpace:"nowrap", marginLeft:10 }}>Upgrade</span>
            </div>
          )}
        </div>
      )}

      {/* ── Idle state ────────────────────────────────────────────── */}
      {stage === "idle" && (
        <div style={{ textAlign:"center", padding:"36px 20px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, color:"var(--color-text-secondary)", fontSize:12 }}>
          Generates a branded shareable report — use Prospect mode to close sales, Client mode for monthly reporting
        </div>
      )}
    </div>
  );
}
