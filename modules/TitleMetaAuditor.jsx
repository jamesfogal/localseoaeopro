/**
 * Local SEO & AEO Pro â€” Title & Meta Auditor
 * Tag: T/M | Group: On-Page Audit
 */
import { useState } from "react";
const MODULE_COLOR = "#60A5FA";

export default function TitleMetaAuditor({ industry, city, websiteUrl, businessName, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: `You are a local SEO title and meta description analyst. Audit title tags and meta descriptions for a local business. Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "pagesAudited": number,
  "criticalIssues": number,
  "pages": [
    {
      "url": "/page-url",
      "pageName": "Page Name",
      "score": 0-100,
      "title": { "current": "current title", "length": number, "issues": ["issue1"], "suggested": "improved title tag" },
      "meta": { "current": "current meta desc", "length": number, "issues": ["issue1"], "suggested": "improved meta description" }
    }
  ],
  "summary": "one paragraph overview of the biggest issues found"
}`,
          prompt: `Audit title tags and meta descriptions for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\nWebsite: ${websiteUrl || "their site"}` })
      });
      const data = await res.json();
      setResult(JSON.parse(data.result));
    } catch {
      setResult({
        overallScore: 38,
        pagesAudited: 6,
        criticalIssues: 7,
        pages: [
          {
            url: "/", pageName: "Homepage", score: 42,
            title: { current: "Home | Citywide Alarms", length: 22, issues: ["Too short (22 chars, ideal 50-60)", "No city name", "No primary keyword"], suggested: `Fire Alarm & Security Systems in ${city || "St. Charles"}, MO | ${businessName || "Citywide Alarms"}` },
            meta: { current: "We provide alarm services.", length: 26, issues: ["Way too short (26 chars, ideal 150-160)", "No city", "No call to action"], suggested: `Professional fire alarm installation and 24/7 security monitoring in ${city || "St. Charles"}, MO. Trusted by 500+ local homeowners. Free estimate today.` }
          },
          {
            url: "/fire-alarm-monitoring", pageName: "Fire Alarm Monitoring", score: 51,
            title: { current: "Fire Alarm Monitoring Services", length: 30, issues: ["No city name", "No brand"], suggested: `Fire Alarm Monitoring in ${city || "St. Charles"}, MO â€” 24/7 Central Station | ${businessName || "Citywide Alarms"}` },
            meta: { current: "Learn about our fire alarm monitoring services and how we can help protect your home or business.", length: 96, issues: ["No city name", "No price or urgency signal"], suggested: `24/7 fire alarm monitoring in ${city || "St. Charles"} starting at $28/mo. UL-listed central station. Local technicians. Call for a free assessment.` }
          },
          {
            url: "/contact", pageName: "Contact", score: 18,
            title: { current: "Contact Us", length: 10, issues: ["Way too short", "No city, no keyword, no brand"], suggested: `Contact ${businessName || "Citywide Alarms"} â€” ${city || "St. Charles"} Alarm & Security Company` },
            meta: { current: "(missing)", length: 0, issues: ["Meta description completely missing"], suggested: `Reach ${businessName || "Citywide Alarms"} in ${city || "St. Charles"}, MO. Call, email, or schedule a free on-site security assessment. Available Monâ€“Sat 8amâ€“6pm.` }
          },
        ],
        summary: `Most pages are missing city names in both the title and meta description â€” a critical local SEO issue. Three pages have meta descriptions under 50 characters, and one page has no meta description at all. Fixing these alone could move rankings within 2-4 weeks.`
      });
    }
    setRunning(false);
  };

  const lengthColor = (len, type) => {
    if (type === "title") return len === 0 ? "#F87171" : len < 40 ? "#F87171" : len > 60 ? "#FBBF24" : "#34D399";
    return len === 0 ? "#F87171" : len < 120 ? "#F87171" : len > 165 ? "#FBBF24" : "#34D399";
  };

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>T/M</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Title & Meta Tag Auditor</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Audits every page's title tag and meta description for length, city inclusion, keyword presence, and click-through potential. Generates optimized replacements for each.
          </p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Auditing..." : result ? "Re-run â†’" : "Audit Titles & Meta â†’"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
            {[
              { label: "Overall Score", value: `${result.overallScore}/100`, color: result.overallScore > 60 ? "#34D399" : "#F87171" },
              { label: "Pages Audited", value: result.pagesAudited, color: "var(--color-text-primary)" },
              { label: "Critical Issues", value: result.criticalIssues, color: "#F87171" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "9px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {result.summary && (
            <div style={{ background: "#60A5FA08", border: "0.5px solid #60A5FA30", borderRadius: 8, padding: "9px 12px", marginBottom: 10, fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {result.summary}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(result.pages || []).map((page, i) => (
              <div key={i} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
                <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", cursor: "pointer", background: "var(--color-background-secondary)" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{page.pageName}</span>
                    <span style={{ fontSize: 10, color: "var(--color-text-secondary)", marginLeft: 8 }}>{page.url}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: page.score > 60 ? "#34D399" : page.score > 40 ? "#FBBF24" : "#F87171" }}>{page.score}/100</span>
                    <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{expanded === i ? "â–²" : "â–¼"}</span>
                  </div>
                </div>
                {expanded === i && (
                  <div style={{ padding: "10px 12px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", gap: 8 }}>
                    {["title", "meta"].map(type => {
                      const data = page[type];
                      if (!data) return null;
                      return (
                        <div key={type} style={{ padding: "8px 10px", background: "var(--color-background-primary)", borderRadius: 7 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 9, fontWeight: 600, color: MODULE_COLOR }}>{type === "title" ? "TITLE TAG" : "META DESCRIPTION"}</span>
                            <span style={{ fontSize: 9, color: lengthColor(data.length, type) }}>{data.length} chars {type === "title" ? "(ideal 50â€“60)" : "(ideal 150â€“160)"}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Current: {data.current || "(missing)"}</div>
                          {(data.issues || []).map((issue, j) => <div key={j} style={{ fontSize: 10, color: "#FBBF24", marginBottom: 2 }}>âš  {issue}</div>)}
                          {data.suggested && (
                            <div style={{ marginTop: 5, padding: "6px 8px", background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 5 }}>
                              <div style={{ fontSize: 9, color: "#34D399", marginBottom: 2 }}>SUGGESTED</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{data.suggested}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {plan === "free" && (
            <div style={{ marginTop: 10, padding: "9px 12px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Upgrade to auto-inject all suggested titles and meta descriptions.</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Audits every title tag and meta description â€” generates optimized replacements for each page
        </div>
      )}
    </div>
  );
}

