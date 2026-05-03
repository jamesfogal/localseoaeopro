import { useState, useCallback, useRef } from "react";

// ============================================================
// UNIVERSAL SYSTEM PROMPT — READS WEBSITE FIRST, THEN COMPETES
// ============================================================
const buildSystemPrompt = (module) => `You are LocalRank Pro — the world's most sophisticated local SEO intelligence engine for any business in any industry in any city.

Your methodology has two mandatory steps before giving any advice:

STEP 1 — READ THE COMPANY'S OWN WEBSITE
When given a URL, you analyze that specific business. You identify:
- What industry they are in
- What services or products they offer
- What city and region they serve
- What their current SEO signals look like
- What keywords they are already using
- What is missing from their digital presence
You build a complete picture of THIS specific business before making any recommendations.

STEP 2 — BENCHMARK AGAINST THE TOP RANKING COMPETITORS IN THEIR INDUSTRY
You then analyze what the top 100 ranking companies in that same industry and location have that this business does not. You identify:
- What keywords the leaders rank for that this business does not target
- What content topics the leaders cover that this business ignores
- What local signals the leaders send that this business is missing
- Why Google rewards the leaders with clicks over this business
- The exact gap between where this business is and where the leaders are

THE RESULT is a personalized, specific, actionable report that works for:
- A plumber in Denver
- A personal injury attorney in Atlanta  
- A dental practice in Phoenix
- An HVAC company in Chicago
- A restaurant in Miami
- A veterinarian in Seattle
- A real estate agent in Dallas
- ANY service business in ANY city

Every recommendation must be specific to the actual business, their actual industry, their actual location, and their actual competitive landscape. No generic advice. No industry-specific assumptions baked in. Read the business. Read the competition. Report the gap.

Current module: ${module}`;

// ============================================================
// API CALL
// ============================================================
async function callClaude(systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const data = await res.json();
  return data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
}

async function callClaudeJSON(systemPrompt, userMessage) {
  const text = await callClaude(systemPrompt, userMessage);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ============================================================
// DESIGN TOKENS
// ============================================================
const C = {
  bg: "#050810",
  surface: "#0c1220",
  surface2: "#101828",
  border: "#1a2540",
  border2: "#243050",
  text: "#e8eef8",
  muted: "#5a7090",
  dim: "#2a3a55",
  accent: "#00d4ff",
  accent2: "#0099cc",
  gold: "#f0b429",
  green: "#10d98a",
  red: "#ff4d6a",
  orange: "#ff8c42",
  purple: "#9b6dff",
};

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Tag({ children, color }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 10, padding: "3px 10px", borderRadius: 2,
      fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase",
      background: `${color || C.accent}18`, border: `1px solid ${color || C.accent}35`,
      color: color || C.accent
    }}>{children}</span>
  );
}

function Card({ children, style, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${color || C.border}`,
      borderRadius: 10, padding: 20, ...style,
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.2s, transform 0.2s",
    }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = "translateY(-2px)"; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = color || C.border; e.currentTarget.style.transform = "translateY(0)"; } : undefined}
    >{children}</div>
  );
}

function Input({ label, value, onChange, placeholder, rows, color }) {
  const style = {
    width: "100%", background: C.bg, border: `1px solid ${color || C.border2}`,
    borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: 13,
    outline: "none", fontFamily: "monospace", boxSizing: "border-box",
    lineHeight: 1.5
  };
  return (
    <div>
      {label && <div style={{ fontSize: 10, color: color || C.muted, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...style, resize: "vertical" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      }
    </div>
  );
}

function Btn({ children, onClick, disabled, variant, full, small }) {
  const bg = variant === "ghost" ? "transparent" : variant === "danger" ? C.red : `linear-gradient(135deg, ${C.accent}, ${C.accent2})`;
  const color = variant === "ghost" ? C.muted : variant === "danger" ? "#fff" : "#050810";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.surface2 : bg,
      color: disabled ? C.muted : color,
      border: variant === "ghost" ? `1px solid ${C.border2}` : "none",
      borderRadius: 6, padding: small ? "6px 14px" : "12px 24px",
      fontSize: small ? 11 : 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'Outfit', sans-serif", width: full ? "100%" : "auto",
      transition: "opacity 0.2s"
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = "1")}
    >{children}</button>
  );
}

function Score({ value, label, color }) {
  const c = color || (value >= 70 ? C.green : value >= 40 ? C.gold : C.red);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: c, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ height: 4, background: C.surface2, borderRadius: 2, margin: "6px 0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: c, borderRadius: 2, transition: "width 1s" }} />
      </div>
      <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: 48, height: 48, border: `3px solid ${C.border2}`,
        borderTop: `3px solid ${C.accent}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 20px"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: C.accent, fontSize: 14, fontWeight: 600 }}>Analyzing your market...</div>
      <div style={{ color: C.muted, fontSize: 12, marginTop: 6, fontFamily: "monospace" }}>
        Reading website · Benchmarking competitors · Finding your gap
      </div>
    </div>
  );
}

function ResultBlock({ title, content, color, icon }) {
  return (
    <div style={{ padding: 16, background: `${color || C.accent}08`, borderLeft: `3px solid ${color || C.accent}`, borderRadius: 4, marginBottom: 10 }}>
      {title && <div style={{ fontSize: 10, color: color || C.accent, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>{icon} {title}</div>}
      <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.7 }}>{content}</p>
    </div>
  );
}

// ============================================================
// UNIVERSAL INTAKE — used by every module
// ============================================================
function UniversalIntake({ onAnalyze, loading, buttonLabel, extraFields }) {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [extras, setExtras] = useState({});

  const handleExtra = (key, val) => setExtras(prev => ({ ...prev, [key]: val }));
  const canRun = url.trim() && city.trim();

  return (
    <Card color={C.border2} style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: C.accent, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 16 }}>
        STEP 1 OF 2 — TELL US ABOUT YOUR BUSINESS
      </div>
      <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Enter your website URL and location. The platform reads your site to understand your business, then benchmarks you against the top ranking companies in your industry to find exactly what they have that you do not.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Input label="★ Your Website URL" value={url} onChange={setUrl} placeholder="https://yourwebsite.com" color={C.accent + "60"} />
        <Input label="Industry (optional — we detect it)" value={industry} onChange={setIndustry} placeholder="e.g. Plumber, Attorney, HVAC..." />
        <Input label="★ Your City + State" value={city} onChange={setCity} placeholder="e.g. Denver, CO" color={C.accent + "60"} />
      </div>
      {extraFields && extraFields.map((field, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <Input {...field} value={extras[field.key] || ""} onChange={val => handleExtra(field.key, val)} />
        </div>
      ))}
      <Btn full disabled={loading || !canRun}
        onClick={() => onAnalyze({ url, industry, city, ...extras })}>
        {loading ? "Analyzing Your Market..." : buttonLabel || "Run Analysis →"}
      </Btn>
    </Card>
  );
}

// ============================================================
// MODULE 1 — FULL SITE AUDIT
// ============================================================
function ModuleSiteAudit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async ({ url, industry, city }) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const prompt = `You are analyzing a local business website for a complete SEO audit.

Website: ${url}
Industry hint (may be blank — detect from site): ${industry}
City: ${city}

STEP 1: Read the website and identify the business type, services, location, and current SEO state.
STEP 2: Benchmark this business against the top 10 ranking companies in the same industry and city.

Return ONLY valid JSON:
{
  "businessDetected": { "name": "", "industry": "", "services": [], "location": "", "yearsInBusiness": "" },
  "overallScore": 0,
  "grades": { "technical": 0, "onPage": 0, "localSEO": 0, "content": 0, "authority": 0 },
  "verdict": "",
  "vsCompetitors": { "summary": "", "youHave": [], "competitorsHave": [], "biggestGap": "" },
  "criticalIssues": [{ "issue": "", "impact": "", "fix": "", "effort": "" }],
  "quickWins": [{ "action": "", "expectedResult": "", "timeframe": "" }],
  "industryBenchmark": { "topRankersAvgScore": 0, "yourScoreVsAvg": "", "topRankerAdvantages": [] }
}`;
      setResult(await callClaudeJSON(buildSystemPrompt("Full Site Audit"), prompt));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <UniversalIntake onAnalyze={run} loading={loading} buttonLabel="Run Full Site Audit →" />
      {error && <div style={{ color: C.red, padding: 12, background: `${C.red}10`, borderRadius: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 12 }}>{error}</div>}
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Card color={`${C.accent}30`} style={{ gridColumn: "1", textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 10, color: C.accent, fontFamily: "monospace", marginBottom: 8 }}>OVERALL SCORE</div>
              <Score value={result.overallScore} label="out of 100" />
            </Card>
            <Card style={{ gridColumn: "2 / 4" }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 8 }}>BUSINESS DETECTED</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{result.businessDetected?.name}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag>{result.businessDetected?.industry}</Tag>
                <Tag color={C.green}>{result.businessDetected?.location}</Tag>
                {result.businessDetected?.services?.slice(0, 3).map((s, i) => <Tag key={i} color={C.muted}>{s}</Tag>)}
              </div>
            </Card>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }}>
            {Object.entries(result.grades || {}).map(([key, val], i) => (
              <Card key={i} style={{ textAlign: "center", padding: 16 }}>
                <Score value={val} label={key.replace(/([A-Z])/g, ' $1').trim()} />
              </Card>
            ))}
          </div>
          <ResultBlock title="VERDICT" content={result.verdict} color={C.gold} icon="📊" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Card>
              <div style={{ fontSize: 11, color: C.green, fontFamily: "monospace", marginBottom: 10 }}>✅ WHAT YOU HAVE</div>
              {result.vsCompetitors?.youHave?.map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 6, display: "flex", gap: 8 }}>
                  <span style={{ color: C.green }}>✓</span>{item}
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 11, color: C.red, fontFamily: "monospace", marginBottom: 10 }}>❌ WHAT TOP RANKERS HAVE THAT YOU DON'T</div>
              {result.vsCompetitors?.competitorsHave?.map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 6, display: "flex", gap: 8 }}>
                  <span style={{ color: C.red }}>✗</span>{item}
                </div>
              ))}
            </Card>
          </div>
          <ResultBlock title="BIGGEST GAP VS COMPETITORS" content={result.vsCompetitors?.biggestGap} color={C.red} icon="🎯" />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>CRITICAL ISSUES</div>
            {result.criticalIssues?.map((issue, i) => (
              <Card key={i} color={`${C.red}20`} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{issue.issue}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{issue.impact}</div>
                <div style={{ fontSize: 12, color: C.green }}>→ {issue.fix}</div>
                <Tag color={C.muted} style={{ marginTop: 6 }}>{issue.effort}</Tag>
              </Card>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>⚡ QUICK WINS — DO THESE FIRST</div>
            {result.quickWins?.map((win, i) => (
              <Card key={i} color={`${C.green}20`} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 4 }}>{win.action}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Expected: {win.expectedResult} · {win.timeframe}</div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODULE 2 — KEYWORD INTELLIGENCE
// ============================================================
function ModuleKeywords() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("opportunities");

  const run = async ({ url, industry, city }) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const prompt = `Keyword intelligence analysis for a local business.

Website: ${url}
Industry: ${industry || "detect from website"}
City: ${city}

STEP 1: Read the website. Identify the business type, all services, and current keywords they appear to target.
STEP 2: Research what the TOP 100 ranking companies in this same industry and city rank for. What keywords are they getting clicks on that this business is NOT targeting?

Return ONLY valid JSON:
{
  "businessSummary": { "detectedIndustry": "", "detectedServices": [], "currentKeywords": [], "estimatedMonthlyTraffic": 0 },
  "totalMarketSearchVolume": 0,
  "marketLeader": { "name": "", "estimatedTraffic": 0, "whyTheyWin": "" },
  "keywordGaps": [
    {
      "keyword": "", "monthlySearches": 0, "difficulty": "EASY|MEDIUM|HARD",
      "whoRanks1": "", "whyTheyRank": "", "yourCurrentRank": "",
      "howToCapture": "", "timeToRank": "", "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "intent": "READY_TO_BUY|COMPARING|RESEARCHING|LOCAL"
    }
  ],
  "keywordsYouAlreadyRankFor": [{ "keyword": "", "currentRank": 0, "opportunity": "" }],
  "quickWinKeywords": [{ "keyword": "", "monthlySearches": 0, "reason": "", "action": "" }],
  "localKeywordClusters": [{ "cluster": "", "totalSearches": 0, "keywords": [], "pageNeeded": "" }],
  "competitorKeywordMap": [{ "competitor": "", "uniqueKeywords": [], "trafficShare": "" }]
}`;
      setResult(await callClaudeJSON(buildSystemPrompt("Keyword Intelligence"), prompt));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const tabs = [
    { id: "opportunities", label: "🎯 Keyword Gaps" },
    { id: "quickwins", label: "⚡ Quick Wins" },
    { id: "clusters", label: "📍 Local Clusters" },
    { id: "competitors", label: "⚔️ Competitor Map" },
  ];

  return (
    <div>
      <UniversalIntake onAnalyze={run} loading={loading} buttonLabel="Map All Keywords →" />
      {error && <div style={{ color: C.red, padding: 12, background: `${C.red}10`, borderRadius: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 12 }}>{error}</div>}
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total Market Searches/Mo", val: (result.totalMarketSearchVolume || 0).toLocaleString(), color: C.gold },
              { label: "Your Current Traffic Est.", val: (result.businessSummary?.estimatedMonthlyTraffic || 0).toLocaleString(), color: C.accent },
              { label: "Keyword Gaps Found", val: result.keywordGaps?.length || 0, color: C.red },
              { label: "Quick Wins Available", val: result.quickWinKeywords?.length || 0, color: C.green },
            ].map((s, i) => (
              <Card key={i} style={{ textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </Card>
            ))}
          </div>
          <ResultBlock title="MARKET LEADER" content={`${result.marketLeader?.name} — ${result.marketLeader?.whyTheyWin}`} color={C.red} icon="👑" />
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                background: activeTab === t.id ? C.surface2 : "transparent",
                border: `1px solid ${activeTab === t.id ? C.border2 : C.border}`,
                color: activeTab === t.id ? C.text : C.muted,
                padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace"
              }}>{t.label}</button>
            ))}
          </div>
          {activeTab === "opportunities" && (
            <div>
              {result.keywordGaps?.map((kw, i) => {
                const dc = { EASY: C.green, MEDIUM: C.gold, HARD: C.orange, VERY_HARD: C.red }[kw.difficulty] || C.muted;
                const ic = { READY_TO_BUY: C.green, COMPARING: C.gold, RESEARCHING: C.accent, LOCAL: C.purple }[kw.intent] || C.muted;
                return (
                  <Card key={i} style={{ marginBottom: 8, padding: 16 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{kw.keyword}</div>
                      <Tag color={dc}>{kw.difficulty}</Tag>
                      <Tag color={ic}>{kw.intent?.replace(/_/g, " ")}</Tag>
                      <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace" }}>{(kw.monthlySearches || 0).toLocaleString()}/mo</div>
                      <div style={{ fontSize: 12, color: kw.yourCurrentRank === "NOT RANKING" ? C.red : C.green, fontFamily: "monospace" }}>
                        You: #{kw.yourCurrentRank}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        <span style={{ color: C.red }}>#{1} {kw.whoRanks1}</span> — {kw.whyTheyRank}
                      </div>
                      <div style={{ fontSize: 12, color: C.green }}>→ {kw.howToCapture} ({kw.timeToRank})</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          {activeTab === "quickwins" && (
            <div>
              {result.quickWinKeywords?.map((kw, i) => (
                <Card key={i} color={`${C.green}25`} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 4 }}>{kw.keyword}</div>
                  <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace", marginBottom: 6 }}>{(kw.monthlySearches || 0).toLocaleString()} searches/mo</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{kw.reason}</div>
                  <div style={{ fontSize: 12, color: C.green }}>→ {kw.action}</div>
                </Card>
              ))}
            </div>
          )}
          {activeTab === "clusters" && (
            <div>
              {result.localKeywordClusters?.map((cluster, i) => (
                <Card key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{cluster.cluster}</div>
                    <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace" }}>{(cluster.totalSearches || 0).toLocaleString()}/mo</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {cluster.keywords?.map((kw, j) => <Tag key={j} color={C.accent}>{kw}</Tag>)}
                  </div>
                  <div style={{ fontSize: 12, color: C.purple }}>📄 Build: {cluster.pageNeeded}</div>
                </Card>
              ))}
            </div>
          )}
          {activeTab === "competitors" && (
            <div>
              {result.competitorKeywordMap?.map((comp, i) => (
                <Card key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{comp.competitor}</div>
                    <Tag color={C.red}>{comp.trafficShare} of market traffic</Tag>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {comp.uniqueKeywords?.map((kw, j) => <Tag key={j} color={C.muted}>{kw}</Tag>)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODULE 3 — LOCAL SIGNALS (3 Pack + GBP + Reviews + Schema)
// ============================================================
function ModuleLocalSignals() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async ({ url, industry, city, phone, reviewCount, rating }) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const prompt = `Local SEO signals audit for any business in any industry.

Website: ${url}
Industry: ${industry || "detect from site"}
City: ${city}
Phone Number: ${phone || "not provided"}
Current Google Review Count: ${reviewCount || "unknown"}
Current Average Rating: ${rating || "unknown"}

STEP 1: Read the website. Identify business type, location signals, phone numbers, schema presence.
STEP 2: Benchmark against top 3 Pack ranking businesses in the same industry and city.

Return ONLY valid JSON:
{
  "businessDetected": { "industry": "", "location": "" },
  "threePack": {
    "currentEstimatedPosition": "",
    "killersFound": [],
    "phoneAudit": { "number": "", "type": "LANDLINE|CELL|VOIP|UNKNOWN", "isKiller": false, "fix": "" },
    "multiLocationIssues": []
  },
  "reviewAudit": {
    "currentCount": 0, "currentRating": 0,
    "competitorAvgCount": 0, "competitorAvgRating": 0,
    "gapAnalysis": "",
    "velocityNeeded": "",
    "unansweredEstimate": "",
    "responseTemplates": [{ "type": "", "template": "" }],
    "acquisitionSystem": ""
  },
  "schemaAudit": {
    "currentStatus": "NOT_FOUND|BASIC|PARTIAL|COMPREHENSIVE",
    "missing": [],
    "homepageSchemaCode": "",
    "servicePageSchemaCode": "",
    "faqSchemaCode": ""
  },
  "gbpRecommendations": {
    "primaryCategory": "",
    "secondaryCategories": [],
    "descriptionTemplate": "",
    "postingStrategy": "",
    "photoStrategy": ""
  },
  "thirtyDayPlan": [{ "week": "", "actions": [], "expectedSignalChange": "" }]
}`;
      setResult(await callClaudeJSON(buildSystemPrompt("Local Signals Audit"), prompt));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <UniversalIntake onAnalyze={run} loading={loading} buttonLabel="Audit Local Signals →"
        extraFields={[
          { key: "phone", label: "Business Phone Number (critical — we check if it's a 3 Pack killer)", placeholder: "(555) 123-4567", color: C.red + "60" },
          { key: "reviewCount", label: "Current Google Review Count", placeholder: "e.g. 47" },
          { key: "rating", label: "Current Average Star Rating", placeholder: "e.g. 4.6" },
        ]}
      />
      {error && <div style={{ color: C.red, padding: 12, background: `${C.red}10`, borderRadius: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 12 }}>{error}</div>}
      {loading && <Spinner />}
      {result && (
        <div>
          {result.threePack?.killersFound?.length > 0 && (
            <Card color={`${C.red}40`} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.red, fontFamily: "monospace", marginBottom: 8 }}>🚨 {result.threePack.killersFound.length} ACTIVE 3 PACK KILLERS FOUND</div>
              {result.threePack.killersFound.map((k, i) => (
                <div key={i} style={{ fontSize: 13, color: "#fca5a5", marginBottom: 4, display: "flex", gap: 8 }}>
                  <span style={{ color: C.red }}>☠</span>{k}
                </div>
              ))}
            </Card>
          )}
          {result.threePack?.phoneAudit?.isKiller && (
            <ResultBlock title={`PHONE NUMBER IS A 3 PACK KILLER — ${result.threePack.phoneAudit.type}`} content={result.threePack.phoneAudit.fix} color={C.red} icon="📱" />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Card>
              <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 10 }}>⭐ REVIEW AUDIT</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "Your Reviews", val: result.reviewAudit?.currentCount },
                  { label: "Competitor Avg", val: result.reviewAudit?.competitorAvgCount },
                  { label: "Your Rating", val: result.reviewAudit?.currentRating },
                  { label: "Competitor Avg", val: result.reviewAudit?.competitorAvgRating },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", background: C.bg, borderRadius: 6, padding: 10 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.gold, fontFamily: "monospace" }}>{s.val || "?"}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{result.reviewAudit?.gapAnalysis}</div>
              <div style={{ fontSize: 12, color: C.green, marginTop: 8 }}>Target: {result.reviewAudit?.velocityNeeded}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 11, color: C.purple, fontFamily: "monospace", marginBottom: 10 }}>🏷️ SCHEMA STATUS</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: result.schemaAudit?.currentStatus === "NOT_FOUND" ? C.red : result.schemaAudit?.currentStatus === "COMPREHENSIVE" ? C.green : C.gold, marginBottom: 10 }}>
                {result.schemaAudit?.currentStatus?.replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 6 }}>MISSING:</div>
              {result.schemaAudit?.missing?.map((m, i) => (
                <div key={i} style={{ fontSize: 12, color: "#fca5a5", display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: C.red }}>✗</span>{m}
                </div>
              ))}
            </Card>
          </div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", marginBottom: 10 }}>📍 GOOGLE BUSINESS PROFILE RECOMMENDATIONS</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>PRIMARY CATEGORY</div>
              <Tag color={C.green}>{result.gbpRecommendations?.primaryCategory}</Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>SECONDARY CATEGORIES</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.gbpRecommendations?.secondaryCategories?.map((c, i) => <Tag key={i} color={C.muted}>{c}</Tag>)}
              </div>
            </div>
            <ResultBlock title="DESCRIPTION TEMPLATE" content={result.gbpRecommendations?.descriptionTemplate} color={C.accent} />
          </Card>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>📅 30-DAY ACTION PLAN</div>
            {result.thirtyDayPlan?.map((phase, i) => (
              <Card key={i} style={{ marginBottom: 8, borderLeft: `3px solid ${[C.red, C.orange, C.gold, C.green][i] || C.muted}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>{phase.week}</div>
                {phase.actions?.map((a, j) => <div key={j} style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "flex", gap: 8 }}><span style={{ color: C.gold }}>→</span>{a}</div>)}
                {phase.expectedSignalChange && <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>Signal change: {phase.expectedSignalChange}</div>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODULE 4 — CONTENT + PAGE OPTIMIZER
// ============================================================
function ModuleContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async ({ url, industry, city, pageContent }) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const prompt = `Content and on-page SEO analysis.

Website: ${url}
Industry: ${industry || "detect from site"}
City: ${city}
Page content sample (if provided): ${pageContent || "analyze based on URL"}

STEP 1: Read the website. Identify all pages, H1s, title tags, meta descriptions, keyword usage.
STEP 2: Compare against top ranking pages for this industry in this city.

Return ONLY valid JSON:
{
  "businessDetected": { "industry": "", "location": "" },
  "sitewideTitleMetaAudit": {
    "grade": "A|B|C|D|F",
    "verdict": "",
    "pagesWithMissingTitles": 0,
    "pagesWithWeakMeta": 0
  },
  "pages": [
    {
      "url": "", "pageType": "",
      "currentTitle": { "text": "", "charCount": 0, "grade": "", "problems": [] },
      "recommendedTitle": { "text": "", "charCount": 0 },
      "currentMeta": { "text": "", "charCount": 0, "grade": "" },
      "recommendedMeta": { "text": "", "charCount": 0 },
      "h1Audit": { "current": "", "recommended": "", "problem": "" },
      "keywordDensity": { "primaryKeyword": "", "currentDensity": "", "idealDensity": "1-2%", "status": "" },
      "lsiKeywordsMissing": [],
      "competitorContentGap": ""
    }
  ],
  "contentOpportunities": [
    { "topic": "", "whyItRanks": "", "estimatedSearchVolume": 0, "contentType": "", "outline": [] }
  ],
  "titleMetaFormulas": { "homepage": "", "servicePage": "", "locationPage": "", "cityPage": "" }
}`;
      setResult(await callClaudeJSON(buildSystemPrompt("Content Optimizer"), prompt));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <UniversalIntake onAnalyze={run} loading={loading} buttonLabel="Analyze All Pages →"
        extraFields={[{ key: "pageContent", label: "Paste specific page content to analyze (optional)", placeholder: "Paste page copy here for deeper keyword density analysis...", rows: 4 }]}
      />
      {error && <div style={{ color: C.red, padding: 12, background: `${C.red}10`, borderRadius: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 12 }}>{error}</div>}
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Site Grade", val: result.sitewideTitleMetaAudit?.grade, color: { A: C.green, B: "#84cc16", C: C.gold, D: C.orange, F: C.red }[result.sitewideTitleMetaAudit?.grade] || C.muted },
              { label: "Missing Titles", val: result.sitewideTitleMetaAudit?.pagesWithMissingTitles, color: C.red },
              { label: "Weak Meta", val: result.sitewideTitleMetaAudit?.pagesWithWeakMeta, color: C.orange },
              { label: "Content Opportunities", val: result.contentOpportunities?.length, color: C.green },
            ].map((s, i) => (
              <Card key={i} style={{ textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </Card>
            ))}
          </div>
          <ResultBlock content={result.sitewideTitleMetaAudit?.verdict} color={C.gold} icon="📋" title="VERDICT" />
          {result.pages?.map((page, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>{page.url} · {page.pageType}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 4 }}>CURRENT TITLE ({page.currentTitle?.charCount} chars)</div>
                  <div style={{ fontSize: 12, color: "#fca5a5", fontFamily: "monospace", background: C.bg, padding: 8, borderRadius: 4 }}>"{page.currentTitle?.text}"</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 4 }}>RECOMMENDED ({page.recommendedTitle?.charCount} chars)</div>
                  <div style={{ fontSize: 12, color: "#86efac", fontFamily: "monospace", background: C.bg, padding: 8, borderRadius: 4 }}>"{page.recommendedTitle?.text}"</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 4 }}>CURRENT META ({page.currentMeta?.charCount} chars)</div>
                  <div style={{ fontSize: 12, color: "#fca5a5", fontFamily: "monospace", background: C.bg, padding: 8, borderRadius: 4, fontStyle: "italic" }}>"{page.currentMeta?.text}"</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 4 }}>RECOMMENDED ({page.recommendedMeta?.charCount} chars)</div>
                  <div style={{ fontSize: 12, color: "#86efac", fontFamily: "monospace", background: C.bg, padding: 8, borderRadius: 4, fontStyle: "italic" }}>"{page.recommendedMeta?.text}"</div>
                </div>
              </div>
              {page.competitorContentGap && (
                <div style={{ marginTop: 10, padding: 10, background: `${C.purple}10`, borderLeft: `2px solid ${C.purple}`, borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: C.purple, fontFamily: "monospace", marginBottom: 4 }}>COMPETITOR CONTENT GAP</div>
                  <div style={{ fontSize: 12, color: "#d8b4fe" }}>{page.competitorContentGap}</div>
                </div>
              )}
            </Card>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>💡 CONTENT OPPORTUNITIES — WHAT TOP RANKERS HAVE THAT YOU DON'T</div>
            {result.contentOpportunities?.map((opp, i) => (
              <Card key={i} color={`${C.green}20`} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{opp.topic}</div>
                  <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace" }}>{(opp.estimatedSearchVolume || 0).toLocaleString()}/mo</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{opp.whyItRanks}</div>
                <Tag color={C.accent}>{opp.contentType}</Tag>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODULE 5 — CITY PAGE BUILDER
// ============================================================
function ModuleCityPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async ({ url, industry, city, targetCity }) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const prompt = `Generate a complete city/service area landing page strategy.

Business Website: ${url}
Industry: ${industry || "detect from site"}
Business Location: ${city}
Target City for Page: ${targetCity || city}

STEP 1: Read the website to understand the business type and services.
STEP 2: Determine what city-specific resources, local data, and content would make this page genuinely useful for someone in the target city — AND what top ranking competitors include on their city pages for this industry.

The city page strategy must be industry-specific. A plumber's city page includes water utility contacts. A lawyer's city page includes courthouse information. A dentist's city page includes local dental resources.

Return ONLY valid JSON:
{
  "businessDetected": { "industry": "", "services": [], "location": "" },
  "targetCity": "",
  "pageUrl": "",
  "titleTag": { "text": "", "charCount": 0 },
  "metaDescription": { "text": "", "charCount": 0 },
  "h1": "",
  "localResources": [{ "category": "", "name": "", "phone": "", "address": "", "whyIncluded": "" }],
  "localDataPoints": [{ "stat": "", "source": "", "relevanceToService": "" }],
  "pageOutline": [{ "section": "", "htmlElement": "", "content": "", "seoNote": "" }],
  "competitorPageAnalysis": { "whatTopRankersInclude": [], "whatMostPagesMiss": [], "yourDifferentiator": "" },
  "internalLinkingStrategy": [{ "linkTo": "", "anchorText": "", "reason": "" }],
  "schemaForPage": ""
}`;
      setResult(await callClaudeJSON(buildSystemPrompt("City Page Builder"), prompt));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <UniversalIntake onAnalyze={run} loading={loading} buttonLabel="Build City Page Strategy →"
        extraFields={[{ key: "targetCity", label: "Target City for This Page (if different from your location)", placeholder: "e.g. Wentzville, MO — the city you want to rank in" }]}
      />
      {error && <div style={{ color: C.red, padding: 12, background: `${C.red}10`, borderRadius: 6, marginBottom: 16, fontFamily: "monospace", fontSize: 12 }}>{error}</div>}
      {loading && <Spinner />}
      {result && (
        <div>
          <Card color={`${C.accent}30`} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.accent, fontFamily: "monospace", marginBottom: 8 }}>PAGE URL</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "monospace", marginBottom: 12 }}>{result.pageUrl}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", marginBottom: 4 }}>TITLE TAG ({result.titleTag?.charCount} chars)</div>
                <div style={{ fontSize: 13, color: C.gold, fontFamily: "monospace", background: C.bg, padding: 10, borderRadius: 4 }}>"{result.titleTag?.text}"</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 4 }}>H1</div>
                <div style={{ fontSize: 13, color: C.green, fontFamily: "monospace", background: C.bg, padding: 10, borderRadius: 4 }}>"{result.h1}"</div>
              </div>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Card>
              <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace", marginBottom: 10 }}>📍 LOCAL RESOURCES TO INCLUDE</div>
              {result.localResources?.map((r, i) => (
                <div key={i} style={{ marginBottom: 10, padding: 10, background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 2 }}>{r.category}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: C.accent, fontFamily: "monospace" }}>{r.phone}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{r.whyIncluded}</div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 11, color: C.purple, fontFamily: "monospace", marginBottom: 10 }}>📊 LOCAL DATA POINTS</div>
              {result.localDataPoints?.map((d, i) => (
                <div key={i} style={{ marginBottom: 8, padding: 10, background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{d.stat}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.relevanceToService}</div>
                </div>
              ))}
            </Card>
          </div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 10 }}>📋 PAGE CONTENT OUTLINE</div>
            {result.pageOutline?.map((section, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <Tag color={C.accent}>{section.htmlElement}</Tag>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{section.section}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{section.content}</div>
                  <div style={{ fontSize: 11, color: C.purple, fontStyle: "italic" }}>{section.seoNote}</div>
                </div>
              </div>
            ))}
          </Card>
          <ResultBlock title="WHAT TOP RANKERS INCLUDE THAT MOST MISS" content={result.competitorPageAnalysis?.whatMostPagesMiss?.join(" · ")} color={C.red} icon="⚔️" />
          <ResultBlock title="YOUR DIFFERENTIATOR" content={result.competitorPageAnalysis?.yourDifferentiator} color={C.green} icon="⭐" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
const MODULES = [
  { id: "audit", label: "Site Audit", icon: "📊", desc: "Full site analysis vs top rankers in your industry", component: ModuleSiteAudit },
  { id: "keywords", label: "Keyword Intelligence", icon: "🔑", desc: "Top 100 keywords — who wins each one and why", component: ModuleKeywords },
  { id: "local", label: "Local Signals", icon: "📍", desc: "3 Pack killers, reviews, schema, GBP audit", component: ModuleLocalSignals },
  { id: "content", label: "Content Optimizer", icon: "📝", desc: "Title tags, meta, H1s, keyword density, content gaps", component: ModuleContent },
  { id: "citypage", label: "City Page Builder", icon: "🏙️", desc: "Build pages that rank in any city you serve", component: ModuleCityPage },
];

export default function LocalRankPro() {
  const [activeModule, setActiveModule] = useState("audit");
  const [menuOpen, setMenuOpen] = useState(false);
  const ActiveComp = MODULES.find(m => m.id === activeModule)?.component || ModuleSiteAudit;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* TOP NAV */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
          {/* LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#050810"
            }}>L</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: C.text, lineHeight: 1 }}>LocalRank<span style={{ color: C.accent }}>Pro</span></div>
              <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em" }}>LOCAL SEO INTELLIGENCE</div>
            </div>
          </div>

          {/* MODULE TABS */}
          <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
            {MODULES.map(m => (
              <button key={m.id} onClick={() => setActiveModule(m.id)} style={{
                background: activeModule === m.id ? `${C.accent}15` : "transparent",
                border: "none", borderBottom: `2px solid ${activeModule === m.id ? C.accent : "transparent"}`,
                color: activeModule === m.id ? C.accent : C.muted,
                padding: "0 14px", height: 60, cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* RIGHT */}
          <div style={{ marginLeft: 16, flexShrink: 0 }}>
            <div style={{
              background: `${C.green}15`, border: `1px solid ${C.green}30`,
              color: C.green, fontSize: 10, padding: "4px 10px", borderRadius: 20,
              fontFamily: "monospace", letterSpacing: "0.1em"
            }}>● LIVE</div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`, padding: "40px 24px 32px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <Tag>Any Industry</Tag>
            <Tag color={C.green}>Any City</Tag>
            <Tag color={C.gold}>Any Business</Tag>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 12, color: "#fff" }}>
            See exactly who is<br />
            <span style={{ color: C.accent }}>beating you</span> and why.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, maxWidth: 600, lineHeight: 1.7, marginBottom: 20 }}>
            Enter your website URL. LocalRank Pro reads your business, then benchmarks you against the top ranking companies in your industry and city — showing you the exact gap between where you are and where the leads are going.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              "Works for plumbers, attorneys, HVAC, dentists, restaurants, and any service business",
              "Reads your website first — no manual setup",
              "Compares you to your actual local competitors"
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: C.muted }}>
                <span style={{ color: C.green }}>✓</span>{point}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULE CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* MODULE HEADER */}
        <div style={{ marginBottom: 24 }} className="fade-up">
          {MODULES.filter(m => m.id === activeModule).map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, background: `${C.accent}15`, border: `1px solid ${C.accent}30`,
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
              }}>{m.icon}</div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>{m.label}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS REMINDER */}
        <div style={{ background: `${C.accent}06`, border: `1px solid ${C.accent}15`, borderRadius: 8, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 16, flex: 1, flexWrap: "wrap" }}>
            {[
              { step: "1", label: "Enter your URL", desc: "We read your site" },
              { step: "2", label: "We detect your industry", desc: "Auto-identified from your content" },
              { step: "3", label: "We benchmark competitors", desc: "Top rankers in your market" },
              { step: "4", label: "You get your gap report", desc: "Exactly what to build" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.accent}20`, border: `1px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: "monospace", flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.desc}</div>
                </div>
                {i < 3 && <div style={{ color: C.border2, fontSize: 16, marginLeft: 8 }}>→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE MODULE */}
        <div className="fade-up">
          <ActiveComp key={activeModule} />
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px", textAlign: "center", marginTop: 40 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: C.accent, marginBottom: 6 }}>
          LocalRank<span style={{ color: C.text }}>Pro</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: "monospace" }}>
          Local SEO intelligence for any business · any industry · any city
        </div>
      </div>
    </div>
  );
}
