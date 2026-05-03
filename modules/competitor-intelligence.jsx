import { useState, useCallback, useEffect } from "react";

// ============================================================
// PERSISTENT STORAGE HELPERS
// ============================================================
async function saveReport(businessKey, reportData) {
  try {
    await window.storage.set(`report:${businessKey}`, JSON.stringify({
      ...reportData,
      savedAt: new Date().toISOString()
    }));
  } catch (e) { console.error("Storage save failed:", e); }
}

async function loadReport(businessKey) {
  try {
    const result = await window.storage.get(`report:${businessKey}`);
    return result ? JSON.parse(result.value) : null;
  } catch (e) { return null; }
}

async function listSavedReports() {
  try {
    const result = await window.storage.list("report:");
    return result?.keys || [];
  } catch (e) { return []; }
}

async function deleteReport(businessKey) {
  try {
    await window.storage.delete(`report:${businessKey}`);
  } catch (e) { console.error("Delete failed:", e); }
}

// ============================================================
// DESIGN TOKENS
// ============================================================
const C = {
  bg: "#04080f", surface: "#080f1c", surface2: "#0d1528",
  border: "#152035", border2: "#1e2f48", text: "#eaf0ff",
  muted: "#4a6080", dim: "#1e3050",
  accent: "#0ea5e9", gold: "#f0b429", green: "#10d98a",
  red: "#ff4060", orange: "#ff7c42", purple: "#8b5cf6", teal: "#06b6d4",
};

// ============================================================
// CLAUDE API
// ============================================================
async function callClaudeJSON(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  const data = await res.json();
  const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

const SYSTEM = `You are an elite local SEO competitive intelligence analyst. Given a business website, industry, and city, you identify the actual companies currently dominating organic search and Google Maps rankings in that exact market.

Your analysis has two outputs:

OUTPUT A — NAMED COMPETITOR REPORT (for the business owner's internal use):
- Real competitor names
- Specific keywords each competitor is winning
- Exact reasons WHY they rank (reviews, domain age, backlinks, content depth, schema, GBP signals)
- Traffic estimates and lead theft calculations
- Specific displacement strategy per competitor

OUTPUT B — ANONYMIZED PROSPECT REPORT (for showing to prospects without revealing competitor names):
- Competitors labeled only as "Local Competitor A", "Local Competitor B", "Local Competitor C"
- Same data but names replaced with labels
- Keyword gaps shown as pure opportunity without competitor identification
- Lead theft shown as "X leads per month going to competitors" without naming them
- Creates urgency around the gap without letting the prospect know exactly who is beating them

The anonymized version is used in sales presentations. The prospect sees the damage — they just do not see whose pocket the money is going into. That creates urgency to act without giving them a DIY roadmap.

CRITICAL: Generate REAL keywords specific to the actual industry and city. Research which companies actually rank in this market. Use real competitor names that would plausibly rank in this geographic area for this industry. Provide specific, believable traffic and lead estimates based on the market size.

Return ONLY valid JSON — no markdown.`;

// ============================================================
// COMPONENTS
// ============================================================
function Pill({ children, color, small }) {
  return (
    <span style={{
      display: "inline-block", fontSize: small ? 9 : 10,
      padding: small ? "2px 7px" : "3px 10px", borderRadius: 3,
      fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase",
      background: `${color || C.accent}15`, border: `1px solid ${color || C.accent}30`,
      color: color || C.accent
    }}>{children}</span>
  );
}

function Panel({ children, color, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${color || C.border2}`,
      borderRadius: 10, padding: 20, ...style,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.15s"
    }}>{children}</div>
  );
}

function StatBox({ label, value, color, sub }) {
  return (
    <Panel style={{ textAlign: "center", padding: 16 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || C.accent, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: color || C.muted, fontFamily: "monospace", marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
    </Panel>
  );
}

function KeywordLossRow({ kw, mode }) {
  const [open, setOpen] = useState(false);
  const dc = { EASY: C.green, MEDIUM: C.gold, HARD: C.orange, VERY_HARD: C.red }[kw.difficulty] || C.muted;
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 5, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "10px 14px", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{kw.keyword}</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginTop: 2 }}>
            {mode === "named" ? `Winner: ${kw.currentWinner}` : `Winner: ${kw.anonymousLabel}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: "monospace" }}>{(kw.monthlySearches || 0).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>searches/mo</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.red, fontFamily: "monospace" }}>{kw.estimatedLeadsLost || "?"}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>leads/mo lost</div>
          </div>
          <Pill color={dc}>{kw.difficulty}</Pill>
          <div style={{ fontSize: 12, color: kw.yourRank === "NOT RANKING" ? C.red : C.orange, fontFamily: "monospace" }}>
            You: {kw.yourRank === "NOT RANKING" ? "Not ranking" : `#${kw.yourRank}`}
          </div>
        </div>
        <span style={{ color: C.muted }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ padding: 10, background: `${C.red}08`, borderLeft: `2px solid ${C.red}`, borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 4 }}>WHY THEY WIN THIS KEYWORD</div>
              <div style={{ fontSize: 12, color: C.muted }}>{kw.whyTheyWin}</div>
            </div>
            <div style={{ padding: 10, background: `${C.green}08`, borderLeft: `2px solid ${C.green}`, borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 4 }}>HOW TO TAKE IT BACK</div>
              <div style={{ fontSize: 12, color: C.muted }}>{kw.howToCapture}</div>
            </div>
          </div>
          <div style={{ marginTop: 8, padding: "6px 12px", background: `${C.teal}08`, borderRadius: 4, fontSize: 11, color: C.teal, fontFamily: "monospace" }}>
            ⏱ Time to rank: {kw.timeToRank} · Revenue at stake: {kw.revenueAtStake}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitorCard({ comp, mode, index }) {
  const [open, setOpen] = useState(false);
  const label = mode === "named" ? comp.name : `Local Competitor ${String.fromCharCode(65 + index)}`;
  const colors = [C.red, C.orange, C.gold, C.purple, C.teal];
  const color = colors[index % colors.length];

  return (
    <Panel color={`${color}30`} style={{ marginBottom: 12 }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color, marginBottom: 4 }}>{label}</div>
            {mode === "named" && comp.website && (
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{comp.website}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill color={color}>{(comp.estimatedMonthlyTraffic || 0).toLocaleString()} visits/mo</Pill>
            <Pill color={C.gold}>{comp.reviewCount} reviews · {comp.avgRating}⭐</Pill>
            <Pill color={C.red}>{comp.keywordsBeatingYou} keywords beating you</Pill>
          </div>
        </div>
        <div style={{ height: 6, background: C.dim, borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min((comp.marketSharePct || 0), 100)}%`, background: color, borderRadius: 3, transition: "width 1s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
          <span>Market share: {comp.marketSharePct}%</span>
          <span>Leads stolen/mo: <span style={{ color: C.red, fontWeight: 700 }}>{comp.estimatedLeadsStolen}</span></span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 6 }}>WHY THEY DOMINATE</div>
              {comp.strengthSignals?.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "flex", gap: 6 }}>
                  <span style={{ color: C.red, flexShrink: 0 }}>→</span>{s}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 6 }}>THEIR WEAK POINTS</div>
              {comp.weaknesses?.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "flex", gap: 6 }}>
                  <span style={{ color: C.green, flexShrink: 0 }}>✓</span>{w}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.accent, fontFamily: "monospace", marginBottom: 6 }}>DISPLACEMENT STRATEGY</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{comp.displacementStrategy}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: color, fontFamily: "monospace", marginBottom: 8 }}>TOP KEYWORDS THEY ARE BEATING YOU ON</div>
            {comp.topKeywordsBeatingYou?.map((kw, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, padding: "6px 10px", background: C.bg, borderRadius: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{kw.keyword}</span>
                <span style={{ fontSize: 11, color: C.gold, fontFamily: "monospace" }}>{(kw.monthlySearches || 0).toLocaleString()}/mo</span>
                <span style={{ fontSize: 11, color: C.red, fontFamily: "monospace" }}>You: {kw.yourRank}</span>
                <span style={{ fontSize: 11, color: color, fontFamily: "monospace" }}>Them: #{kw.theirRank}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

// ============================================================
// SAVED REPORTS SIDEBAR
// ============================================================
function SavedReports({ keys, onLoad, onDelete }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      const loaded = [];
      for (const key of keys) {
        try {
          const r = await window.storage.get(key);
          if (r) {
            const data = JSON.parse(r.value);
            loaded.push({ key, data });
          }
        } catch (e) { /* skip */ }
      }
      setReports(loaded);
    };
    if (keys.length > 0) load();
  }, [keys]);

  if (reports.length === 0) return null;

  return (
    <Panel color={`${C.gold}25`} style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 12 }}>📋 SAVED REPORTS — CLICK TO RELOAD FOR FOLLOW-UP</div>
      {reports.map((r, i) => {
        const d = r.data;
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: C.bg, borderRadius: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.businessName}</div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                {d.city} · {d.industry} · Saved {new Date(d.savedAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>
                {d.totalLeadsLostPerMonth} leads/mo lost · {d.competitors?.length} competitors identified
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onLoad(d)} style={{ background: `${C.accent}15`, border: `1px solid ${C.accent}30`, color: C.accent, padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>
                LOAD →
              </button>
              <button onClick={() => onDelete(r.key)} style={{ background: `${C.red}10`, border: `1px solid ${C.red}20`, color: C.red, padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

// ============================================================
// UPSELL SUMMARY — what to pitch based on saved data
// ============================================================
function UpsellSummary({ report }) {
  const upsells = report?.upsellOpportunities || [];
  return (
    <Panel color={`${C.gold}30`} style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 12 }}>💰 UPSELL INTELLIGENCE — WHAT TO PITCH THIS PROSPECT</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
        Based on the {report.competitors?.length} competitors and {report.totalKeywordsLost} keyword gaps found, here is the specific work this business needs and the revenue framing for each service:
      </div>
      {upsells.map((item, i) => (
        <div key={i} style={{ padding: 14, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{item.service}</div>
            <Pill color={C.green}>{item.estimatedMonthlyleadGain} new leads/mo if done</Pill>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.6 }}>{item.whyNeeded}</div>
          <div style={{ padding: "8px 12px", background: `${C.green}08`, borderLeft: `2px solid ${C.green}`, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 3 }}>PITCH THIS:</div>
            <div style={{ fontSize: 12, color: "#86efac", fontStyle: "italic" }}>"{item.pitchLine}"</div>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function CompetitorIntelligence() {
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [mode, setMode] = useState("named"); // named | anonymous
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [savedKeys, setSavedKeys] = useState([]);

  // Load saved report keys on mount
  useEffect(() => {
    listSavedReports().then(keys => setSavedKeys(keys));
  }, []);

  const run = useCallback(async () => {
    if (!businessName.trim() || !city.trim()) return;
    setLoading(true); setError(""); setResult(null);

    const prompt = `Perform a complete competitive intelligence analysis for a local business.

Business Name: ${businessName}
Website: ${website || "not provided"}
City / Market: ${city}
Industry: ${industry || "detect from business name and website"}
Contact: ${contactName || "Business Owner"} (${contactEmail || "email not provided"})

STEP 1: Read the website if provided. Identify the business type, all services, and current SEO signals.

STEP 2: Identify the TOP 5 real competitors in this exact market who are currently dominating organic search rankings. Use real company names that would plausibly exist in this market. For each competitor, find the specific keywords they rank for that this business does NOT.

STEP 3: Calculate the total lead theft — how many leads per month are going to competitors that should be going to this business.

STEP 4: Generate upsell opportunities — what specific work does this business need, why, and what is the pitch line for each service.

Return ONLY valid JSON:
{
  "businessName": "",
  "industry": "",
  "city": "",
  "website": "",
  "contactName": "${contactName}",
  "contactEmail": "${contactEmail}",
  "overallMarketScore": 0,
  "totalMarketMonthlySearches": 0,
  "yourEstimatedMonthlyTraffic": 0,
  "competitorCombinedTraffic": 0,
  "totalLeadsLostPerMonth": 0,
  "totalKeywordsLost": 0,
  "revenueAtRisk": "",
  "marketVerdict": "",
  "competitors": [
    {
      "name": "",
      "website": "",
      "reviewCount": 0,
      "avgRating": 0,
      "estimatedMonthlyTraffic": 0,
      "marketSharePct": 0,
      "estimatedLeadsStolen": 0,
      "keywordsBeatingYou": 0,
      "strengthSignals": [],
      "weaknesses": [],
      "displacementStrategy": "",
      "topKeywordsBeatingYou": [
        {
          "keyword": "",
          "monthlySearches": 0,
          "yourRank": "NOT RANKING",
          "theirRank": 1,
          "whyTheyWin": "",
          "howToCapture": "",
          "timeToRank": "",
          "revenueAtStake": "",
          "estimatedLeadsLost": 0,
          "difficulty": "EASY|MEDIUM|HARD|VERY_HARD"
        }
      ]
    }
  ],
  "allKeywordGaps": [
    {
      "keyword": "",
      "monthlySearches": 0,
      "currentWinner": "",
      "anonymousLabel": "Local Competitor A|B|C|D|E",
      "yourRank": "NOT RANKING",
      "whyTheyWin": "",
      "howToCapture": "",
      "timeToRank": "",
      "revenueAtStake": "",
      "estimatedLeadsLost": 0,
      "difficulty": "EASY|MEDIUM|HARD|VERY_HARD",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW"
    }
  ],
  "quickWinsAvailable": [
    {
      "keyword": "",
      "monthlySearches": 0,
      "currentLeader": "",
      "whyQuickWin": "",
      "exactAction": "",
      "estimatedWeeksToRank": 0
    }
  ],
  "upsellOpportunities": [
    {
      "service": "",
      "whyNeeded": "",
      "estimatedMonthlyleadGain": 0,
      "pitchLine": ""
    }
  ],
  "followUpEmails": [
    {
      "sendOn": "Day 3",
      "subject": "",
      "body": "",
      "hook": ""
    },
    {
      "sendOn": "Day 7",
      "subject": "",
      "body": "",
      "hook": ""
    },
    {
      "sendOn": "Day 14",
      "subject": "",
      "body": "",
      "hook": ""
    }
  ]
}

CRITICAL: Use real, plausible competitor names for this market. Make all numbers realistic for this city size and industry. The follow-up emails must reference specific competitor keyword gaps with specific numbers — not generic templates. Sign emails from "The LocalRank Pro Team".`;

    try {
      const data = await callClaudeJSON(SYSTEM, prompt);

      // Save to persistent storage automatically
      const storageKey = `${businessName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      await saveReport(storageKey, data);
      setSavedKeys(await listSavedReports());

      setResult(data);
      setActiveTab("overview");
    } catch (e) {
      setError("Analysis failed: " + e.message);
    }
    setLoading(false);
  }, [businessName, website, city, industry, contactName, contactEmail]);

  const loadSaved = (data) => {
    setResult(data);
    setMode("named");
    setActiveTab("overview");
  };

  const deleteSaved = async (key) => {
    await deleteReport(key.replace("report:", ""));
    setSavedKeys(await listSavedReports());
  };

  const tabs = [
    { id: "overview", label: "📊 Market Overview" },
    { id: "competitors", label: `⚔️ Competitors (${result?.competitors?.length || 0})` },
    { id: "keywords", label: `🔑 All Keyword Gaps (${result?.allKeywordGaps?.length || 0})` },
    { id: "quickwins", label: `⚡ Quick Wins (${result?.quickWinsAvailable?.length || 0})` },
    { id: "upsell", label: "💰 Upsell Intel" },
    { id: "emails", label: "✉️ Follow-Up Emails" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif", padding: "0 0 80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeUp { from {opacity:0;transform:translateY(12px)} to {opacity:1;transform:translateY(0)} } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* HEADER */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "22px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "inline-block", background: `${C.red}10`, border: `1px solid ${C.red}25`, color: C.red, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 12px", borderRadius: 2, marginBottom: 10 }}>
              COMPETITOR INTELLIGENCE ENGINE
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px,4vw,40px)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              Competitor <span style={{ color: C.red }}>Intelligence</span>
            </h1>
            <p style={{ color: C.muted, fontSize: 12, fontFamily: "monospace", marginTop: 6 }}>
              Who is stealing your leads · Exactly which keywords · Why they win · How to take it back · Saves automatically
            </p>
          </div>
          {/* MODE TOGGLE */}
          <div style={{ display: "flex", gap: 0, border: `1px solid ${C.border2}`, borderRadius: 6, overflow: "hidden" }}>
            {[
              { id: "named", label: "🔓 Named Mode", sub: "Your own use" },
              { id: "anonymous", label: "🔒 Anonymous Mode", sub: "Show to prospects" },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                background: mode === m.id ? C.surface2 : "transparent",
                border: "none", padding: "10px 16px", cursor: "pointer",
                textAlign: "left", borderRight: m.id === "named" ? `1px solid ${C.border2}` : "none"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: mode === m.id ? C.text : C.muted }}>{m.label}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{m.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* MODE EXPLANATION */}
        <div style={{ padding: "10px 16px", background: mode === "named" ? `${C.red}06` : `${C.gold}06`, border: `1px solid ${mode === "named" ? C.red : C.gold}20`, borderRadius: 6, marginBottom: 20, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          {mode === "named"
            ? "🔓 NAMED MODE: You see real competitor names. Use this for your own strategy sessions."
            : "🔒 ANONYMOUS MODE: Competitors shown as Local Competitor A, B, C. Use this when showing the report to prospects — they see the damage in numbers, not which companies are beating them. This creates urgency to hire you without giving them a DIY roadmap."}
        </div>

        {/* SAVED REPORTS */}
        {savedKeys.length > 0 && <SavedReports keys={savedKeys} onLoad={loadSaved} onDelete={deleteSaved} />}

        {/* INPUT */}
        {!result && !loading && (
          <Panel color={`${C.red}30`} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.red, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 18 }}>ANALYZE A BUSINESS — ALL DATA SAVES AUTOMATICALLY</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { label: "★ BUSINESS NAME", val: businessName, set: setBusinessName, ph: "Citywide Alarms", color: C.gold },
                { label: "★ CITY + STATE", val: city, set: setCity, ph: "St. Louis, MO", color: C.gold },
                { label: "INDUSTRY (optional — we detect it)", val: industry, set: setIndustry, ph: "Home & Business Security" },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: f.color || C.muted, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 5 }}>{f.label}</div>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", background: C.bg, border: `1px solid ${f.color ? f.color + "40" : C.border2}`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "WEBSITE URL", val: website, set: setWebsite, ph: "citywidealarms.com" },
                { label: "CONTACT NAME (for follow-up emails)", val: contactName, set: setContactName, ph: "Jim Smith" },
                { label: "CONTACT EMAIL (for follow-up emails)", val: contactEmail, set: setContactEmail, ph: "jim@citywidealarms.com" },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 5 }}>{f.label}</div>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <button onClick={run} disabled={!businessName.trim() || !city.trim()}
              style={{
                width: "100%", background: `linear-gradient(135deg, ${C.red}, #cc1a3a)`,
                color: "#fff", border: "none", borderRadius: 8, padding: "13px 24px",
                fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Syne', sans-serif"
              }}>
              Find Every Competitor Stealing Your Leads →
            </button>
          </Panel>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 52, height: 52, margin: "0 auto 20px", border: `3px solid ${C.border2}`, borderTop: `3px solid ${C.red}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 6 }}>Mapping your competitive landscape...</div>
            <div style={{ fontSize: 12, color: C.muted }}>Finding every competitor · Counting every keyword gap · Calculating lead theft · Saving automatically</div>
          </div>
        )}

        {error && <div style={{ padding: "14px 18px", background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 8, color: C.red, fontSize: 13, fontFamily: "monospace", marginBottom: 16 }}>{error}</div>}

        {result && !loading && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <div style={{ padding: "4px 10px", background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 4, fontSize: 11, color: C.green, fontFamily: "monospace" }}>
                  ✓ AUTO-SAVED
                </div>
                <div style={{ padding: "4px 10px", background: `${C.gold}10`, border: `1px solid ${C.gold}25`, borderRadius: 4, fontSize: 11, color: C.gold, fontFamily: "monospace" }}>
                  {result.businessName} · {result.city}
                </div>
              </div>
              <button onClick={() => { setResult(null); setError(""); }} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.muted, padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                ← New Analysis
              </button>
            </div>

            {/* DAMAGE BANNER */}
            <div style={{ background: `${C.red}08`, border: `2px solid ${C.red}30`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 12 }}>🚨 LEAD THEFT SUMMARY — {result.city?.toUpperCase()}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                <StatBox label="Total Market Searches/Mo" value={(result.totalMarketMonthlySearches || 0).toLocaleString()} color={C.gold} />
                <StatBox label="Competitor Combined Traffic" value={(result.competitorCombinedTraffic || 0).toLocaleString()} color={C.red} sub="/mo" />
                <StatBox label="Leads Stolen/Mo" value={result.totalLeadsLostPerMonth} color={C.red} />
                <StatBox label="Keyword Gaps Found" value={result.totalKeywordsLost} color={C.orange} />
              </div>
              <div style={{ padding: "12px 16px", background: `${C.red}08`, borderLeft: `3px solid ${C.red}`, borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 4 }}>REVENUE AT RISK</div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>{result.revenueAtRisk}</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{result.marketVerdict}</div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  background: activeTab === t.id ? C.surface2 : "transparent",
                  border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
                  color: activeTab === t.id ? C.accent : C.muted,
                  padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                  fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap"
                }}>{t.label}</button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                  {result.competitors?.slice(0, 3).map((comp, i) => {
                    const label = mode === "named" ? comp.name : `Local Competitor ${String.fromCharCode(65 + i)}`;
                    const colors = [C.red, C.orange, C.gold];
                    const c = colors[i] || C.muted;
                    return (
                      <Panel key={i} color={`${c}30`} style={{ textAlign: "center", padding: 16 }}>
                        <div style={{ fontSize: 11, color: c, fontFamily: "monospace", marginBottom: 4 }}>#{i + 1} THREAT</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color, marginBottom: 8 }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.red, fontFamily: "monospace" }}>{comp.estimatedLeadsStolen}</div>
                        <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>leads stolen/mo</div>
                        <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>{comp.keywordsBeatingYou} keywords they beat you on</div>
                      </Panel>
                    );
                  })}
                </div>
                <Panel>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>⚡ FASTEST WINS AVAILABLE RIGHT NOW</div>
                  {result.quickWinsAvailable?.slice(0, 3).map((qw, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: `${C.green}06`, border: `1px solid ${C.green}15`, borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{qw.keyword}</div>
                        <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace" }}>{(qw.monthlySearches || 0).toLocaleString()}/mo · {qw.estimatedWeeksToRank} weeks to rank</div>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>{qw.exactAction}</div>
                    </div>
                  ))}
                </Panel>
              </div>
            )}

            {/* COMPETITORS */}
            {activeTab === "competitors" && (
              <div>
                {result.competitors?.map((comp, i) => <CompetitorCard key={i} comp={comp} mode={mode} index={i} />)}
              </div>
            )}

            {/* KEYWORDS */}
            {activeTab === "keywords" && (
              <div>
                <div style={{ padding: "10px 16px", background: `${C.accent}06`, border: `1px solid ${C.accent}15`, borderRadius: 6, marginBottom: 14, fontSize: 12, color: C.muted }}>
                  {mode === "named"
                    ? "Showing real competitor names. Switch to Anonymous Mode to see the version you show to prospects."
                    : "Anonymous Mode active. Competitors shown as Local Competitor A/B/C. This is what you show to prospects to create urgency without revealing who is winning."}
                </div>
                {result.allKeywordGaps?.map((kw, i) => <KeywordLossRow key={i} kw={kw} mode={mode} />)}
              </div>
            )}

            {/* QUICK WINS */}
            {activeTab === "quickwins" && (
              <div>
                {result.quickWinsAvailable?.map((qw, i) => (
                  <Panel key={i} color={`${C.green}25`} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.green }}>{qw.keyword}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Pill color={C.gold}>{(qw.monthlySearches || 0).toLocaleString()}/mo</Pill>
                        <Pill color={C.teal}>{qw.estimatedWeeksToRank} weeks</Pill>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{qw.whyQuickWin}</div>
                    <div style={{ padding: "8px 12px", background: `${C.green}08`, borderLeft: `2px solid ${C.green}`, borderRadius: 4 }}>
                      <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 3 }}>EXACT ACTION</div>
                      <div style={{ fontSize: 13, color: "#86efac" }}>{qw.exactAction}</div>
                    </div>
                  </Panel>
                ))}
              </div>
            )}

            {/* UPSELL */}
            {activeTab === "upsell" && result && <UpsellSummary report={result} />}

            {/* EMAILS */}
            {activeTab === "emails" && (
              <div>
                <div style={{ padding: "12px 16px", background: `${C.gold}06`, border: `1px solid ${C.gold}20`, borderRadius: 8, marginBottom: 16, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                  These emails reference specific competitor gaps found in this report. Each one is personalized to {result.contactName || "the prospect"} and creates urgency around a real finding. Send from your account, not from an automated system.
                </div>
                {result.followUpEmails?.map((email, i) => {
                  const [copied, setCopied] = useState(false);
                  const fullText = `Subject: ${email.subject}\n\n${email.body}`;
                  return (
                    <Panel key={i} color={`${C.gold}25`} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                        <Pill color={C.gold}>Send on {email.sendOn}</Pill>
                        <button onClick={() => { navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                          style={{ background: copied ? `${C.green}15` : `${C.accent}10`, border: `1px solid ${copied ? C.green : C.accent}30`, color: copied ? C.green : C.accent, padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>
                          {copied ? "✓ COPIED" : "COPY EMAIL"}
                        </button>
                      </div>
                      <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace", marginBottom: 8 }}>Subject: {email.subject}</div>
                      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
                        <pre style={{ fontSize: 12, color: C.muted, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "'Outfit', sans-serif" }}>{email.body}</pre>
                      </div>
                      {email.hook && <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: "italic" }}>Hook strategy: {email.hook}</div>}
                    </Panel>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
