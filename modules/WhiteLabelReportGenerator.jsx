/**
 * LocalRank Pro — White Label Report Generator
 * Tag: WLR | Group: Overview
 *
 * Assembles all module findings into a branded,
 * shareable client report. Two modes:
 *
 * PROSPECT MODE (Anonymous):
 *   - Shows scores, issues, and urgency
 *   - Competitor data labeled A/B/C
 *   - Ends with a call to action to work with you
 *   - Used as a sales tool before they become a client
 *
 * CLIENT MODE (Named):
 *   - Full detail report with all findings
 *   - Shows before/after progress over time
 *   - Shows fixes completed this month
 *   - Monthly ranking movement
 *   - Used for client retention and reporting
 *
 * Output: Shareable link + PDF download
 *
 * Agency branding: Upload logo, set agency colors,
 * set custom domain for the report link.
 */

import { useState } from "react";
const MODULE_COLOR = "#A78BFA";
const MODULE_TAG = "WLR";

// ── Mock module scores (in production these come from running all modules) ─────
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

const OVERALL_SCORE = Math.round(Object.values(DEMO_SCORES).reduce((a,b) => a + b.score, 0) / Object.keys(DEMO_SCORES).length);

const SC = s => s >= 80 ? "#34D399" : s >= 60 ? "#84CC16" : s >= 40 ? "#FBBF24" : s >= 20 ? "#F97316" : "#F87171";
const SL = s => s >= 80 ? "Strong" : s >= 60 ? "Good" : s >= 40 ? "Needs work" : s >= 20 ? "Poor" : "Critical";

export default function WhiteLabelReportGenerator({
  industry, city, businessName, websiteUrl, mode = "named", plan = "free",
  agencyName = "LocalRank Pro", agencyLogo = null
}) {
  const [reportMode, setReportMode] = useState(mode === "anonymous" ? "prospect" : "client");
  const [generated,  setGenerated]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [agencyBrand,setAgencyBrand]= useState(agencyName || "LocalRank Pro");

  const totalIssues    = Object.values(DEMO_SCORES).reduce((a,b) => a + b.issues,   0);
  const criticalIssues = Object.values(DEMO_SCORES).reduce((a,b) => a + b.critical, 0);

  const copyLink = () => {
    const link = `https://localrankpro.com/report/${Math.random().toString(36).slice(2,8)}`;
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>
      <div style={{ background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:9, fontWeight:500, color:MODULE_COLOR, background:MODULE_COLOR+"18", padding:"2px 6px", borderRadius:3 }}>{MODULE_TAG}</span>
              <span style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)" }}>White Label Report Generator</span>
            </div>
            <p style={{ fontSize:11, color:"var(--color-text-secondary)", margin:"0 0 10px", lineHeight:1.5 }}>Assembles all module findings into a branded, shareable report. Prospect mode for sales. Client mode for monthly reporting. Generates a shareable link and PDF download.</p>
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
          <button onClick={() => setGenerated(true)} style={{ padding:"8px 14px", background:MODULE_COLOR, border:`0.5px solid ${MODULE_COLOR}`, borderRadius:6, color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
            {generated?"Regenerate →":"Generate Report →"}
          </button>
        </div>
      </div>

      {generated && (
        <div>
          {/* Report preview */}
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
                  ? `This report analyzes ${totalIssues} SEO issues affecting ${reportMode==="prospect"?"your business's":"this business's"} local search visibility. ${criticalIssues} issues are critical and are actively costing calls and revenue right now.`
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

      {!generated && (
        <div style={{ textAlign:"center", padding:"36px 20px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, color:"var(--color-text-secondary)", fontSize:12 }}>
          Generates a branded shareable report — use Prospect mode to close sales, Client mode for monthly reporting
        </div>
      )}
    </div>
  );
}
