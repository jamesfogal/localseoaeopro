/**
 * LocalSEOAEOPro — Heading Structure Auditor
 * Fetches the live page, extracts real H1/H2/H3 tags,
 * then uses Claude to audit and suggest rewrites.
 */
import { useState } from "react";

const MODULE_COLOR = "#60A5FA";
const MODULE_TAG = "HDG";

const SYSTEM_PROMPT = `You are a local SEO heading structure expert.

You will receive: the LIVE H1, H2, H3 tags extracted from a real website, plus the business name, industry, and city.

YOUR JOB: Audit every heading and provide specific, actionable rewrites that will improve local SEO rankings without cannibalizing dedicated interior pages.

HEADING AUDIT RULES:

H1 RULES:
- There must be exactly ONE H1 per page
- H1 must contain the primary keyword (city + service)
- H1 must match what someone actually types into Google
- H1 must NOT be a marketing slogan, brand statement, or question
- H1 should NOT be the business name alone
- BAD: "See Why We're St. Louis's Most Trusted Security Company"
- BAD: "Welcome to CityWide Alarms"
- GOOD: "Security Systems for St. Louis Homes & Businesses"
- GOOD: "Alarm Company in St. Louis, MO — Residential & Commercial"

H2 RULES:
- H2s are section headers — each should target a supporting keyword
- Generic H2s ("Our Services", "Why Choose Us", "Contact Us") waste SEO value
- Each H2 should include a local signal OR a specific service
- H2s should naturally flow from the H1 topic without repeating the exact H1 phrase

H3 RULES:
- H3s support H2 sections — more specific, longer tail
- Flagged if they are: too short (under 4 words), keyword stuffed, duplicates, or completely generic
- H3s on service pages should name specific services, neighborhoods, or FAQ-style questions

CANNIBALIZATION RULE:
The homepage H1 should use a BROAD umbrella keyword.
Dedicated interior pages own the SPECIFIC keywords.
Example:
- Homepage H1: "Security Systems for St. Louis Homes & Businesses"
- Interior page: "Home Security St. Louis, MO" (owns that specific keyword)
- Interior page: "Commercial Security Systems St. Louis" (owns that specific keyword)
Never suggest an H1 that competes with a known interior page keyword.

GRADING:
A = All headings optimized, clear hierarchy, local keywords throughout
B = Minor improvements needed, basic structure solid
C = H1 needs rewrite, H2s generic but not harmful
D = H1 has no keyword/location, H2s all generic
F = Multiple H1s, no keywords anywhere, or H1 is a marketing slogan

Return ONLY valid JSON:
{
  "overallGrade": "A"|"B"|"C"|"D"|"F",
  "overallSummary": "2-sentence honest assessment",
  "h1Analysis": {
    "current": "exact current H1 text",
    "multipleH1s": true|false,
    "verdict": "pass"|"warn"|"fail",
    "score": 0-100,
    "problems": ["problem 1", "problem 2"],
    "suggested": "Exact suggested H1 replacement",
    "reasoning": "Why this replacement works for local SEO without cannibalizing interior pages"
  },
  "h2Analysis": [
    {
      "current": "exact current H2",
      "verdict": "keep"|"rewrite"|"remove",
      "suggested": "exact suggested replacement (or empty string if keep)",
      "reason": "one sentence why"
    }
  ],
  "h3Analysis": {
    "verdict": "pass"|"warn"|"fail",
    "totalCount": number,
    "issues": [
      {
        "current": "exact H3 text",
        "problem": "what is wrong",
        "suggested": "exact fix"
      }
    ],
    "goodExamples": ["H3 texts that are already good"]
  },
  "missingOpportunities": ["keyword/topic that should have an H2 or H3 but does not"],
  "quickWins": ["the 3 highest-impact changes to make today, in order"]
}

Be specific to THIS business, industry, and city. Generic advice is useless.
Return ONLY the JSON object. No markdown.`;

async function fetchHeadings(url) {
  const res = await fetch('/api/fetch-headings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

async function callClaude(system, prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, prompt, max_tokens: 2500 }),
  });
  const data = await res.json();
  return JSON.parse(data.result);
}

const verdictColor = { pass: "#34D399", warn: "#FBBF24", fail: "#F87171", keep: "#34D399", rewrite: "#FBBF24", remove: "#F87171" };
const verdictIcon = { pass: "✓", warn: "⚠", fail: "✗", keep: "✓", rewrite: "↻", remove: "✗" };
const gradeColor = (g) => ({ A: "#34D399", B: "#34D399", C: "#FBBF24", D: "#F87171", F: "#F87171" }[g] || "#94A3B8");

export default function HeadingStructureAuditor({ businessName, industry, city, websiteUrl, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState(null);
  const [headings, setHeadings] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("h1");
  const [copied, setCopied] = useState("");

  const run = async () => {
    setRunning(true);
    setResult(null);
    setHeadings(null);
    setError("");

    try {
      setStep("fetching");
      const h = await fetchHeadings(websiteUrl || "citywidealarms.com");

      if (h.error) {
        setStep("analyzing");
        const parsed = await callClaude(SYSTEM_PROMPT,
          `Audit heading structure for this business. NOTE: Could not fetch live page (${h.error}). Generate analysis based on business context and common patterns for this industry.
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "St. Louis"}
Website: ${websiteUrl || "their website"}`
        );
        setResult(parsed);
      } else {
        setHeadings(h);
        setStep("analyzing");

        const prompt = `Audit the heading structure for this local business.

Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "St. Louis"}
Website: ${websiteUrl || "their website"}

LIVE HEADINGS EXTRACTED FROM THE PAGE:

Page Title: ${h.pageTitle || "(not found)"}

H1 Tags (${h.h1s?.length || 0} found):
${h.h1s?.length > 0 ? h.h1s.map((t, i) => `  ${i + 1}. "${t}"`).join('\n') : '  (none found)'}

H2 Tags (${h.h2s?.length || 0} found):
${h.h2s?.length > 0 ? h.h2s.map((t, i) => `  ${i + 1}. "${t}"`).join('\n') : '  (none found)'}

H3 Tags (${h.h3s?.length || 0} found):
${h.h3s?.length > 0 ? h.h3s.slice(0, 20).map((t, i) => `  ${i + 1}. "${t}"`).join('\n') : '  (none found)'}

${h.h4s?.length > 0 ? `H4 Tags (${h.h4s.length} found):\n${h.h4s.slice(0, 10).map((t, i) => `  ${i + 1}. "${t}"`).join('\n')}` : ''}

Audit all headings. The H1 is especially critical. Be specific about what to replace and why.`;

        const parsed = await callClaude(SYSTEM_PROMPT, prompt);
        setResult(parsed);
      }
    } catch (err) {
      setError("Analysis failed — check the website URL and try again.");
      console.error(err);
    }

    setStep("");
    setRunning(false);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const TABS = [
    { id: "h1", label: "H1 Tag" },
    { id: "h2", label: `H2 Tags${result?.h2Analysis ? ` (${result.h2Analysis.length})` : ""}` },
    { id: "h3", label: "H3 Tags" },
    { id: "wins", label: "Quick Wins" },
  ];

  return (
    <div style={{ maxWidth: 660, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Heading Structure Auditor</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Fetches the live page, extracts every H1, H2, and H3 tag, then audits each one and generates exact replacement copy with local SEO reasoning.
          </p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? (step === "fetching" ? "Fetching page..." : "Analyzing...") : result ? "Re-audit →" : "Audit Headings →"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#F8717110", border: "0.5px solid #F8717140", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 11, color: "#F87171" }}>
          {error}
        </div>
      )}

      {/* Live headings found */}
      {headings && !running && (
        <div style={{ background: "#60A5FA08", border: "0.5px solid #60A5FA20", borderRadius: 8, padding: "8px 14px", marginBottom: 10, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#60A5FA", fontWeight: 500 }}>LIVE PAGE SCAN</span>
          {[["H1", headings.h1s?.length], ["H2", headings.h2s?.length], ["H3", headings.h3s?.length], ["H4", headings.h4s?.length]].map(([tag, count]) => (
            <span key={tag} style={{ fontSize: 10, color: count > 0 ? "var(--color-text-primary)" : "#475569" }}>
              {tag}: <strong>{count ?? 0}</strong>
            </span>
          ))}
          {headings.pageTitle && <span style={{ fontSize: 10, color: "#94A3B8" }}>Title: "{headings.pageTitle.slice(0, 50)}{headings.pageTitle.length > 50 ? '…' : ''}"</span>}
        </div>
      )}

      {result && (
        <div>
          {/* Grade + summary */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${gradeColor(result.overallGrade)}40`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>GRADE</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: gradeColor(result.overallGrade), lineHeight: 1 }}>{result.overallGrade}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 6 }}>OVERALL ASSESSMENT</div>
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{result.overallSummary}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, border: "0.5px solid var(--color-border-secondary)", background: activeTab === t.id ? MODULE_COLOR : "transparent", color: activeTab === t.id ? "#0B0E16" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: activeTab === t.id ? 600 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* H1 Tab */}
          {activeTab === "h1" && result.h1Analysis && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.h1Analysis.multipleH1s && (
                <div style={{ background: "#F8717110", border: "0.5px solid #F8717140", borderRadius: 8, padding: "8px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "#F87171", fontSize: 14 }}>⚠</span>
                  <span style={{ fontSize: 11, color: "#F87171", fontWeight: 500 }}>Multiple H1 tags detected — Google sees conflicting page topics. Only one H1 per page.</span>
                </div>
              )}
              <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${verdictColor[result.h1Analysis.verdict]}40`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px" }}>CURRENT H1</span>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: verdictColor[result.h1Analysis.verdict] + "18", color: verdictColor[result.h1Analysis.verdict], fontWeight: 500 }}>
                    {verdictIcon[result.h1Analysis.verdict]} {result.h1Analysis.verdict.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10, fontStyle: "italic" }}>
                  "{result.h1Analysis.current}"
                </div>
                {result.h1Analysis.problems?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {result.h1Analysis.problems.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#F87171", fontSize: 10, flexShrink: 0, marginTop: 1 }}>✗</span>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {result.h1Analysis.suggested && (
                <div style={{ background: "#34D39908", border: "0.5px solid #34D39940", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.8px" }}>REPLACE WITH</span>
                    <button onClick={() => copyText(result.h1Analysis.suggested, "h1")} style={{ fontSize: 9, padding: "2px 8px", border: "0.5px solid #34D39940", borderRadius: 4, background: copied === "h1" ? "#34D39920" : "transparent", color: copied === "h1" ? "#34D399" : "#64748B", cursor: "pointer" }}>
                      {copied === "h1" ? "Copied!" : "Copy →"}
                    </button>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#34D399", marginBottom: 10 }}>
                    {result.h1Analysis.suggested}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 6 }}>
                    <strong style={{ color: "var(--color-text-primary)" }}>Why this works: </strong>{result.h1Analysis.reasoning}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* H2 Tab */}
          {activeTab === "h2" && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px" }}>H2 TAG AUDIT — {result.h2Analysis?.length || 0} TAGS</span>
                <div style={{ display: "flex", gap: 12 }}>
                  {["keep", "rewrite", "remove"].map(v => (
                    <span key={v} style={{ fontSize: 9, color: verdictColor[v] }}>
                      {verdictIcon[v]} {result.h2Analysis?.filter(h => h.verdict === v).length || 0} {v}
                    </span>
                  ))}
                </div>
              </div>
              {result.h2Analysis?.length > 0 ? result.h2Analysis.map((h2, i) => (
                <div key={i} style={{ padding: "10px 14px", borderBottom: i < result.h2Analysis.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, color: verdictColor[h2.verdict], flexShrink: 0, marginTop: 1, fontWeight: 700 }}>{verdictIcon[h2.verdict]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: h2.verdict === "keep" ? "var(--color-text-primary)" : "#94A3B8", fontStyle: "italic", marginBottom: 2, textDecoration: h2.verdict === "remove" ? "line-through" : "none" }}>
                        "{h2.current}"
                      </div>
                      {h2.reason && <div style={{ fontSize: 10, color: "#64748B" }}>{h2.reason}</div>}
                    </div>
                  </div>
                  {h2.suggested && h2.verdict !== "keep" && (
                    <div style={{ marginLeft: 19, display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                      <span style={{ fontSize: 10, color: "#475569", flexShrink: 0 }}>→</span>
                      <div style={{ flex: 1, fontSize: 12, color: "#34D399", fontWeight: 500 }}>"{h2.suggested}"</div>
                      <button onClick={() => copyText(h2.suggested, `h2-${i}`)} style={{ fontSize: 9, padding: "2px 6px", border: "0.5px solid #34D39940", borderRadius: 3, background: copied === `h2-${i}` ? "#34D39920" : "transparent", color: copied === `h2-${i}` ? "#34D399" : "#64748B", cursor: "pointer", flexShrink: 0 }}>
                        {copied === `h2-${i}` ? "✓" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              )) : (
                <div style={{ padding: "20px 14px", fontSize: 11, color: "#64748B", textAlign: "center" }}>No H2 tags found on this page.</div>
              )}
              {result.missingOpportunities?.length > 0 && (
                <div style={{ padding: "10px 14px", background: "#FBBF2408", borderTop: "0.5px solid #FBBF2430" }}>
                  <div style={{ fontSize: 9, color: "#FBBF24", letterSpacing: "0.8px", marginBottom: 6 }}>MISSING H2 OPPORTUNITIES</div>
                  {result.missingOpportunities.map((opp, i) => (
                    <div key={i} style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>+ {opp}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* H3 Tab */}
          {activeTab === "h3" && result.h3Analysis && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${verdictColor[result.h3Analysis.verdict]}40`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 20, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 2 }}>H3 VERDICT</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: verdictColor[result.h3Analysis.verdict] }}>{result.h3Analysis.verdict.toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 2 }}>TOTAL TAGS</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{result.h3Analysis.totalCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", marginBottom: 2 }}>ISSUES</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: result.h3Analysis.issues?.length > 0 ? "#F87171" : "#34D399" }}>{result.h3Analysis.issues?.length || 0}</div>
                </div>
              </div>

              {result.h3Analysis.issues?.length > 0 && (
                <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "7px 14px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "#F87171", letterSpacing: "0.8px" }}>H3 ISSUES TO FIX</div>
                  {result.h3Analysis.issues.map((issue, i) => (
                    <div key={i} style={{ padding: "10px 14px", borderBottom: i < result.h3Analysis.issues.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                      <div style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic", marginBottom: 3 }}>"{issue.current}"</div>
                      <div style={{ fontSize: 10, color: "#F87171", marginBottom: 5 }}>Problem: {issue.problem}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#475569" }}>→</span>
                        <span style={{ fontSize: 12, color: "#34D399", flex: 1 }}>"{issue.suggested}"</span>
                        <button onClick={() => copyText(issue.suggested, `h3-${i}`)} style={{ fontSize: 9, padding: "2px 6px", border: "0.5px solid #34D39940", borderRadius: 3, background: copied === `h3-${i}` ? "#34D39920" : "transparent", color: copied === `h3-${i}` ? "#34D399" : "#64748B", cursor: "pointer" }}>
                          {copied === `h3-${i}` ? "✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.h3Analysis.goodExamples?.length > 0 && (
                <div style={{ border: "0.5px solid #34D39930", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "7px 14px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid #34D39930", fontSize: 9, color: "#34D399", letterSpacing: "0.8px" }}>ALREADY GOOD</div>
                  {result.h3Analysis.goodExamples.map((ex, i) => (
                    <div key={i} style={{ padding: "8px 14px", borderBottom: i < result.h3Analysis.goodExamples.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", fontSize: 11, color: "var(--color-text-secondary)" }}>
                      <span style={{ color: "#34D399", marginRight: 8 }}>✓</span>"{ex}"
                    </div>
                  ))}
                </div>
              )}

              {result.h3Analysis.totalCount === 0 && (
                <div style={{ background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#FBBF24" }}>
                  No H3 tags found. Consider adding H3s under each H2 section to target long-tail keywords and improve content structure.
                </div>
              )}
            </div>
          )}

          {/* Quick Wins Tab */}
          {activeTab === "wins" && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: MODULE_COLOR, letterSpacing: "0.8px" }}>
                HIGHEST IMPACT CHANGES — DO THESE FIRST
              </div>
              {result.quickWins?.map((win, i) => (
                <div key={i} style={{ padding: "12px 14px", borderBottom: i < result.quickWins.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: MODULE_COLOR + "18", border: `0.5px solid ${MODULE_COLOR}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700, color: MODULE_COLOR }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{win}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Is your H1 what Google needs — or what your marketing team wrote?</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
            Fetches the live page, reads every heading tag, and generates exact replacement copy with the reasoning behind every change.
          </div>
        </div>
      )}
    </div>
  );
}
