import { useState, useCallback, useEffect } from "react";

const C = {
  bg: "#04080f", surface: "#080f1c", surface2: "#0d1528",
  border: "#152035", border2: "#1e2f48", text: "#eaf0ff",
  muted: "#4a6080", dim: "#1e3050",
  accent: "#0ea5e9", gold: "#f0b429", green: "#10d98a",
  red: "#ff4060", orange: "#ff7c42", purple: "#8b5cf6", teal: "#06b6d4",
};

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

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Pill({ children, color, small }) {
  return (
    <span style={{ display: "inline-block", fontSize: small ? 9 : 10, padding: small ? "2px 7px" : "3px 10px", borderRadius: 3, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", background: `${color || C.accent}15`, border: `1px solid ${color || C.accent}30`, color: color || C.accent }}>{children}</span>
  );
}

function Panel({ children, color, style }) {
  return <div style={{ background: C.surface, border: `1px solid ${color || C.border2}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>;
}

function Field({ label, value, onChange, placeholder, rows, color }) {
  const s = { width: "100%", background: C.bg, border: `1px solid ${color || C.border2}`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.5 };
  return (
    <div>
      {label && <div style={{ fontSize: 10, color: color || C.muted, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>}
      {rows ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...s, resize: "vertical" }} /> : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />}
    </div>
  );
}

function RunBtn({ onClick, disabled, loading, label }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ width: "100%", background: disabled || loading ? C.surface2 : `linear-gradient(135deg, ${C.accent}, #0369a1)`, color: disabled || loading ? C.muted : "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 13, fontWeight: 800, cursor: disabled || loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 12 }}>
      {loading ? "Analyzing..." : label || "Run Analysis →"}
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: 40, height: 40, margin: "0 auto 14px", border: `3px solid ${C.border2}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>Analyzing...</div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [c, setC] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setC(true); setTimeout(() => setC(false), 2000); }} style={{ background: c ? `${C.green}15` : `${C.accent}10`, border: `1px solid ${c ? C.green : C.accent}30`, color: c ? C.green : C.accent, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>
      {c ? "✓ COPIED" : "COPY"}
    </button>
  );
}

// ============================================================
// GAP 1: RANK TRACKER
// ============================================================
function RankTracker() {
  const [domain, setDomain] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try { const h = JSON.parse(localStorage.getItem("rank-history") || "[]"); setHistory(h); } catch (e) { }
  }, []);

  const run = async () => {
    if (!domain.trim() || !keywords.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a rank tracking analyst. Given a domain, keywords, and location, estimate current rankings for each keyword and provide trend analysis. Return ONLY valid JSON.",
        `Domain: ${domain}\nKeywords: ${keywords}\nLocation: ${location}\n\nFor each keyword estimate the current ranking position, who is in position 1, monthly search volume, ranking trend (RISING/STABLE/FALLING), and a specific recommendation to improve the rank.\n\nReturn JSON:\n{\n  "domain": "",\n  "location": "",\n  "checkedAt": "${new Date().toISOString()}",\n  "rankings": [\n    {\n      "keyword": "",\n      "estimatedRank": 0,\n      "rankLabel": "NOT RANKING|1-3|4-10|11-20|21+",\n      "monthlySearches": 0,\n      "currentPosition1": "",\n      "trend": "RISING|STABLE|FALLING|NEW",\n      "trendReason": "",\n      "recommendation": "",\n      "priority": "CRITICAL|HIGH|MEDIUM|LOW"\n    }\n  ],\n  "overallRankingHealth": 0,\n  "topOpportunity": "",\n  "biggestDrop": ""\n}`
      );
      const entry = { ...data, savedAt: new Date().toISOString() };
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      try { localStorage.setItem("rank-history", JSON.stringify(newHistory)); } catch (e) { }
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  const rankColor = (label) => ({ "1-3": C.green, "4-10": C.gold, "11-20": C.orange, "21+": C.red, "NOT RANKING": C.red }[label] || C.muted);

  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Domain" value={domain} onChange={setDomain} placeholder="citywidealarms.com" color={C.gold} />
          <Field label="★ Location" value={location} onChange={setLocation} placeholder="St. Louis, MO" color={C.gold} />
        </div>
        <Field label="★ Keywords to Track (one per line)" value={keywords} onChange={setKeywords} placeholder={"home security St. Louis MO\nbusiness security St. Charles\nalarm companies St. Louis"} rows={5} />
        <RunBtn onClick={run} loading={loading} disabled={!domain.trim() || !keywords.trim()} label="Check Rankings →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Ranking Health", val: result.overallRankingHealth + "/100", color: C.accent },
              { label: "Keywords Tracked", val: result.rankings?.length, color: C.gold },
              { label: "In Top 10", val: result.rankings?.filter(r => ["1-3","4-10"].includes(r.rankLabel)).length, color: C.green },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {result.rankings?.map((r, i) => (
            <div key={i} style={{ padding: "10px 14px", background: C.bg, border: `1px solid ${rankColor(r.rankLabel)}25`, borderLeft: `3px solid ${rankColor(r.rankLabel)}`, borderRadius: 6, marginBottom: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{r.keyword}</div>
                <div style={{ fontSize: 11, color: C.muted }}>#{1} {r.currentPosition1} · {(r.monthlySearches || 0).toLocaleString()}/mo</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: rankColor(r.rankLabel), fontFamily: "monospace" }}>{r.estimatedRank || "—"}</div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>rank</div>
                </div>
                <Pill color={r.trend === "RISING" ? C.green : r.trend === "FALLING" ? C.red : C.gold}>{r.trend}</Pill>
                <Pill color={({ CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.gold }[r.priority] || C.muted)} small>{r.priority}</Pill>
              </div>
              <div style={{ fontSize: 11, color: C.muted, maxWidth: 250 }}>{r.recommendation}</div>
            </div>
          ))}
        </div>
      )}
      {history.length > 0 && (
        <Panel style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>📅 RANK CHECK HISTORY (last {history.length} checks)</div>
          {history.slice(0, 5).map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
              <span>{h.domain} · {h.location}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11 }}>{new Date(h.savedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}

// ============================================================
// GAP 2: PAGE SPEED ANALYZER
// ============================================================
function PageSpeedAnalyzer() {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a Core Web Vitals and page speed expert. Analyze a website URL and provide detailed speed audit with specific fixes. Return ONLY valid JSON.",
        `URL: ${url}\nIndustry: ${industry || "general"}\n\nAnalyze this website's expected performance based on the URL and industry. Provide realistic Core Web Vitals estimates, specific issues that likely exist, and exact fixes ranked by impact.\n\nReturn JSON:\n{\n  "url": "",\n  "overallSpeedScore": 0,\n  "mobileScore": 0,\n  "desktopScore": 0,\n  "coreWebVitals": {\n    "lcp": { "value": "", "rating": "GOOD|NEEDS_IMPROVEMENT|POOR", "whatItMeans": "", "fix": "" },\n    "cls": { "value": "", "rating": "GOOD|NEEDS_IMPROVEMENT|POOR", "whatItMeans": "", "fix": "" },\n    "inp": { "value": "", "rating": "GOOD|NEEDS_IMPROVEMENT|POOR", "whatItMeans": "", "fix": "" },\n    "fcp": { "value": "", "rating": "GOOD|NEEDS_IMPROVEMENT|POOR", "whatItMeans": "", "fix": "" }\n  },\n  "loadTime4G": "",\n  "rankingImpact": "",\n  "issues": [\n    { "issue": "", "severity": "CRITICAL|HIGH|MEDIUM|LOW", "impact": "", "fix": "", "effort": "", "estimatedSpeedGain": "" }\n  ],\n  "carouselDetected": false,\n  "carouselImpact": "",\n  "imageIssues": { "estimatedCount": 0, "formatProblems": "", "fix": "" },\n  "competitorSpeedBenchmark": "",\n  "quickWins": [{ "action": "", "estimatedImpact": "" }]\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  const vitalColor = (rating) => ({ GOOD: C.green, NEEDS_IMPROVEMENT: C.gold, POOR: C.red }[rating] || C.muted);

  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Website URL" value={url} onChange={setUrl} placeholder="https://citywidealarms.com" color={C.gold} />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Home Security" />
        </div>
        <div style={{ padding: "10px 14px", background: `${C.orange}08`, border: `1px solid ${C.orange}20`, borderRadius: 6, fontSize: 12, color: C.muted, marginBottom: 12 }}>
          ⚠️ Google uses Core Web Vitals as a direct ranking factor. A slow site can cost you positions even with perfect SEO. Mobile speed is weighted more heavily than desktop.
        </div>
        <RunBtn onClick={run} loading={loading} disabled={!url.trim()} label="Analyze Page Speed →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Overall Score", val: result.overallSpeedScore, color: result.overallSpeedScore >= 70 ? C.green : result.overallSpeedScore >= 50 ? C.gold : C.red },
              { label: "Mobile Score", val: result.mobileScore, color: result.mobileScore >= 70 ? C.green : result.mobileScore >= 50 ? C.gold : C.red },
              { label: "4G Load Time", val: result.loadTime4G, color: C.accent },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg, border: "1px solid #1e2f48", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <Panel style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.purple, fontFamily: "monospace", marginBottom: 12 }}>CORE WEB VITALS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {result.coreWebVitals && Object.entries(result.coreWebVitals).map(([key, vital], i) => (
                <div key={i} style={{ padding: 12, background: C.bg, border: `1px solid ${vitalColor(vital.rating)}25`, borderLeft: `3px solid ${vitalColor(vital.rating)}`, borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{key.toUpperCase()}</span>
                    <Pill color={vitalColor(vital.rating)} small>{vital.rating?.replace(/_/g," ")}</Pill>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: vitalColor(vital.rating), fontFamily: "monospace", marginBottom: 4 }}>{vital.value}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{vital.whatItMeans}</div>
                  <div style={{ fontSize: 11, color: C.green }}>→ {vital.fix}</div>
                </div>
              ))}
            </div>
          </Panel>
          {result.carouselDetected && (
            <div style={{ padding: "12px 16px", background: `${C.red}08`, border: `1px solid ${C.red}25`, borderRadius: 6, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.red, fontFamily: "monospace", marginBottom: 4 }}>🚨 ROTATING CAROUSEL DETECTED</div>
              <div style={{ fontSize: 12, color: C.muted }}>{result.carouselImpact}</div>
            </div>
          )}
          {result.issues?.map((issue, i) => (
            <div key={i} style={{ padding: "10px 14px", background: C.bg, border: `1px solid ${({ CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.gold }[issue.severity] || C.muted)}20`, borderLeft: `3px solid ${({ CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.gold }[issue.severity] || C.muted)}`, borderRadius: 6, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <Pill color={({ CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.gold }[issue.severity] || C.muted)}>{issue.severity}</Pill>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{issue.issue}</span>
                <Pill color={C.green} small>{issue.estimatedSpeedGain}</Pill>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{issue.impact}</div>
              <div style={{ fontSize: 12, color: C.green }}>→ {issue.fix} ({issue.effort})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GAP 3: BLOG KEYWORD PLANNER
// ============================================================
function BlogPlanner() {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!url.trim() || !city.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a content strategist specializing in local service business blogs. Generate blog topic plans that capture long-tail keywords competitors are missing. Return ONLY valid JSON.",
        `Website: ${url}\nIndustry: ${industry || "detect from site"}\nCity: ${city}\n\nGenerate the 15 best blog topics for this business. Each must target a specific keyword gap, include a complete content outline, and explain exactly why this topic will rank. Focus on local intent, buyer intent, and informational searches that lead to conversions.\n\nReturn JSON:\n{\n  "industry": "",\n  "blogStrategy": "",\n  "totalMonthlyTrafficOpportunity": 0,\n  "posts": [\n    {\n      "title": "",\n      "targetKeyword": "",\n      "monthlySearches": 0,\n      "difficulty": "EASY|MEDIUM|HARD",\n      "intent": "INFORMATIONAL|COMMERCIAL|LOCAL",\n      "whyItRanks": "",\n      "outline": [""],\n      "recommendedWordCount": 0,\n      "callToAction": "",\n      "internalLinksTo": [],\n      "timeToRankEstimate": "",\n      "priority": "CRITICAL|HIGH|MEDIUM"\n    }\n  ],\n  "publishingSchedule": [\n    { "month": "", "posts": [] }\n  ]\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Website URL" value={url} onChange={setUrl} placeholder="citywidealarms.com" color={C.gold} />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Home Security (auto-detected)" />
          <Field label="★ City + State" value={city} onChange={setCity} placeholder="St. Louis, MO" color={C.gold} />
        </div>
        <RunBtn onClick={run} loading={loading} disabled={!url.trim() || !city.trim()} label="Generate Blog Plan →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Blog Posts Planned", val: result.posts?.length, color: C.accent },
              { label: "Monthly Traffic Opportunity", val: (result.totalMonthlyTrafficOpportunity || 0).toLocaleString(), color: C.gold },
              { label: "Easy Wins", val: result.posts?.filter(p => p.difficulty === "EASY").length, color: C.green },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg, border: "1px solid #1e2f48", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", background: `${C.accent}06`, border: `1px solid ${C.accent}15`, borderRadius: 6, marginBottom: 16, fontSize: 13, color: C.muted }}>{result.blogStrategy}</div>
          {result.posts?.map((post, i) => {
            const dc = { EASY: C.green, MEDIUM: C.gold, HARD: C.orange }[post.difficulty] || C.muted;
            const [open, setOpen] = useState(false);
            return (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 6, overflow: "hidden" }}>
                <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 4, background: `${dc}20`, border: `1px solid ${dc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: dc, fontFamily: "monospace", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{post.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{post.targetKeyword} · {(post.monthlySearches || 0).toLocaleString()}/mo</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Pill color={dc}>{post.difficulty}</Pill>
                    <Pill color={C.teal} small>{post.recommendedWordCount}w</Pill>
                    <Pill color={({ CRITICAL: C.red, HIGH: C.orange }[post.priority] || C.gold)} small>{post.priority}</Pill>
                  </div>
                  <span style={{ color: C.muted }}>{open ? "▲" : "▼"}</span>
                </div>
                {open && (
                  <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ marginTop: 10, marginBottom: 10, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{post.whyItRanks}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 6 }}>CONTENT OUTLINE</div>
                    {post.outline?.map((item, j) => (
                      <div key={j} style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "flex", gap: 8 }}>
                        <span style={{ color: C.gold, flexShrink: 0 }}>→</span>{item}
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: "8px 12px", background: `${C.green}08`, borderRadius: 4, fontSize: 12, color: C.green }}>
                      CTA: {post.callToAction} · Ranks in: {post.timeToRankEstimate}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GAP 4: FAQ GENERATOR
// ============================================================
function FAQGenerator() {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a local SEO FAQ strategist. Generate FAQ content and schema for any local service business. Return ONLY valid JSON.",
        `Website: ${url}\nIndustry: ${industry || "detect from site"}\nCity: ${city}\n\nGenerate 15 FAQ questions and answers plus complete FAQ schema. Questions must target actual search queries people ask. Answers must be helpful AND keyword-rich for SEO. Include FAQ schema JSON-LD ready to paste.\n\nReturn JSON:\n{\n  "industry": "",\n  "faqPageTitle": "",\n  "faqMetaDescription": "",\n  "faqs": [\n    {\n      "question": "",\n      "answer": "",\n      "targetKeyword": "",\n      "monthlySearches": 0,\n      "intent": "",\n      "richResultEligible": true\n    }\n  ],\n  "faqSchemaCode": "",\n  "implementationNote": "",\n  "expectedRichResults": ""\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Website URL" value={url} onChange={setUrl} placeholder="citywidealarms.com" color={C.gold} />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Auto-detected from site" />
          <Field label="City + State" value={city} onChange={setCity} placeholder="St. Louis, MO" />
        </div>
        <RunBtn onClick={run} loading={loading} disabled={!url.trim()} label="Generate FAQs + Schema →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "FAQs Generated", val: result.faqs?.length, color: C.accent },
              { label: "Rich Result Eligible", val: result.faqs?.filter(f => f.richResultEligible).length, color: C.green },
              { label: "Expected Impact", val: result.expectedRichResults, color: C.gold },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg, border: "1px solid #1e2f48", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: i === 2 ? 14 : 24, fontWeight: 800, color: s.color, fontFamily: "monospace", lineHeight: 1.2 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {result.faqs?.map((faq, i) => (
            <div key={i} style={{ padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Q: {faq.question}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {faq.richResultEligible && <Pill color={C.green} small>Rich Result ✓</Pill>}
                  <Pill color={C.muted} small>{(faq.monthlySearches || 0).toLocaleString()}/mo</Pill>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{faq.answer}</div>
            </div>
          ))}
          {result.faqSchemaCode && (
            <Panel style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.purple, fontFamily: "monospace" }}>FAQ SCHEMA — PASTE IN PAGE &lt;HEAD&gt;</div>
                <CopyBtn text={result.faqSchemaCode} />
              </div>
              <pre style={{ fontSize: 11, color: "#86efac", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, overflowX: "auto", maxHeight: 300 }}>{result.faqSchemaCode}</pre>
              <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>{result.implementationNote}</div>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GAP 5: PRICING PAGE GENERATOR
// ============================================================
function PricingPageGenerator() {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a conversion-focused pricing page strategist for local service businesses. Generate complete pricing page content that ranks AND converts. Return ONLY valid JSON.",
        `Website: ${url}\nIndustry: ${industry || "detect from site"}\nCity: ${city}\nServices: ${services || "detect from site"}\n\nGenerate a complete pricing page strategy including title tag, meta, H1, page structure, pricing presentation strategy, FAQs, schema, and specific SEO recommendations. This page type has the highest buyer intent of any page on a service business website.\n\nReturn JSON:\n{\n  "industry": "",\n  "pageUrl": "",\n  "titleTag": { "text": "", "charCount": 0 },\n  "metaDescription": { "text": "", "charCount": 0 },\n  "h1": "",\n  "whyPricingPageMatters": "",\n  "pricingStrategy": "",\n  "sections": [\n    { "section": "", "content": "", "seoNote": "" }\n  ],\n  "pricingTableRecommendation": "",\n  "trustSignals": [],\n  "competitorPricingInsight": "",\n  "targetKeywords": [{ "keyword": "", "monthlySearches": 0, "intent": "" }],\n  "conversionElements": [],\n  "schemaCode": ""\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ padding: "10px 16px", background: `${C.gold}08`, border: `1px solid ${C.gold}20`, borderRadius: 6, marginBottom: 16, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
        💡 Pricing pages are the highest-converting pages on any service business website. People searching "home security cost" or "alarm system price" have their credit card out. Most businesses don't have this page. The ones that do dominate.
      </div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Website URL" value={url} onChange={setUrl} placeholder="citywidealarms.com" color={C.gold} />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Auto-detected from site" />
          <Field label="City + State" value={city} onChange={setCity} placeholder="St. Louis, MO" />
        </div>
        <Field label="Services to Price (optional)" value={services} onChange={setServices} placeholder="Home Security, Business Security, Camera Systems, Medical Alert" />
        <RunBtn onClick={run} loading={loading} disabled={!url.trim()} label="Generate Pricing Page Strategy →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <Panel color={`${C.gold}30`} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 10 }}>PAGE URL: {result.pageUrl}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", marginBottom: 4 }}>TITLE ({result.titleTag?.charCount} chars)</div>
                <div style={{ fontSize: 13, color: C.gold, fontFamily: "monospace", background: C.bg, padding: 10, borderRadius: 4 }}>"{result.titleTag?.text}"</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 4 }}>H1</div>
                <div style={{ fontSize: 13, color: C.green, fontFamily: "monospace", background: C.bg, padding: 10, borderRadius: 4 }}>"{result.h1}"</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>{result.whyPricingPageMatters}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>{result.pricingStrategy}</div>
          </Panel>
          {result.sections?.map((s, i) => (
            <div key={i} style={{ padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{s.section}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{s.content}</div>
              {s.seoNote && <div style={{ fontSize: 11, color: C.purple, fontStyle: "italic" }}>SEO: {s.seoNote}</div>}
            </div>
          ))}
          {result.targetKeywords?.length > 0 && (
            <Panel style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>TARGET KEYWORDS FOR THIS PAGE</div>
              {result.targetKeywords.map((kw, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, padding: "6px 10px", background: C.bg, borderRadius: 4 }}>
                  <span style={{ flex: 1, fontSize: 13, color: C.text }}>{kw.keyword}</span>
                  <span style={{ fontSize: 11, color: C.gold, fontFamily: "monospace" }}>{(kw.monthlySearches || 0).toLocaleString()}/mo</span>
                  <Pill color={C.teal} small>{kw.intent}</Pill>
                </div>
              ))}
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GAP 6: COMPETITOR COMPARISON PAGE
// ============================================================
function ComparisonPageGenerator() {
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!url.trim() || !competitor.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a comparison page strategist for local service businesses. Comparison pages capture high-intent searchers who are choosing between two companies. Return ONLY valid JSON.",
        `Our Website: ${url}\nOur Business: ${businessName}\nCompetitor: ${competitor}\nCity: ${city}\n\nGenerate a complete comparison page strategy for "[Our Business] vs [Competitor]" — a page that ranks when someone searches comparing these two companies. This must be honest, not attack advertising, while clearly showing why we are the better choice.\n\nReturn JSON:\n{\n  "pageUrl": "",\n  "titleTag": { "text": "", "charCount": 0 },\n  "metaDescription": { "text": "", "charCount": 0 },\n  "h1": "",\n  "targetKeywords": [{ "keyword": "", "monthlySearches": 0 }],\n  "monthlySearchVolume": 0,\n  "comparisonStrategy": "",\n  "sections": [\n    { "section": "", "content": "", "advantage": "US|THEM|TIE" }\n  ],\n  "comparisonTable": [\n    { "factor": "", "us": "", "them": "", "winner": "US|THEM|TIE" }\n  ],\n  "whyWeBeat": [],\n  "honestAcknowledgements": [],\n  "callToAction": "",\n  "seoNotes": ""\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ padding: "10px 16px", background: `${C.purple}08`, border: `1px solid ${C.purple}20`, borderRadius: 6, marginBottom: 16, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
        💡 Comparison pages capture buyers at the final decision stage. When someone searches "Citywide Alarms vs ADT" they are ready to buy — they just need a reason to choose. If you don't have this page, you're missing those searchers entirely.
      </div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Your Website URL" value={url} onChange={setUrl} placeholder="citywidealarms.com" color={C.gold} />
          <Field label="★ Your Business Name" value={businessName} onChange={setBusinessName} placeholder="Citywide Alarms" color={C.gold} />
          <Field label="★ Competitor to Compare Against" value={competitor} onChange={setCompetitor} placeholder="ADT" color={C.red} />
          <Field label="City + State" value={city} onChange={setCity} placeholder="St. Louis, MO" />
        </div>
        <RunBtn onClick={run} loading={loading} disabled={!url.trim() || !competitor.trim()} label={`Generate ${businessName || "Your Business"} vs ${competitor || "Competitor"} Page →`} />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <Panel color={`${C.purple}30`} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.purple, fontFamily: "monospace", marginBottom: 8 }}>PAGE URL: {result.pageUrl}</div>
            <div style={{ fontSize: 13, color: C.gold, fontFamily: "monospace", marginBottom: 6 }}>"{result.titleTag?.text}"</div>
            <div style={{ fontSize: 13, color: C.green, fontFamily: "monospace", marginBottom: 10 }}>H1: "{result.h1}"</div>
            <div style={{ fontSize: 12, color: C.muted }}>{result.comparisonStrategy}</div>
          </Panel>
          {result.comparisonTable?.length > 0 && (
            <Panel style={{ marginBottom: 16, overflowX: "auto" }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 12 }}>COMPARISON TABLE</div>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead>
                  <tr style={{ background: C.surface2 }}>
                    {["Factor", businessName || "You", competitor, "Winner"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 12px", fontSize: 11, color: C.muted, fontFamily: "monospace", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.comparisonTable.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: C.text, fontWeight: 600 }}>{row.factor}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: row.winner === "US" ? C.green : C.muted }}>{row.us}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: row.winner === "THEM" ? C.red : C.muted }}>{row.them}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <Pill color={row.winner === "US" ? C.green : row.winner === "THEM" ? C.red : C.gold} small>{row.winner === "US" ? "✓ Us" : row.winner === "THEM" ? "Them" : "Tie"}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
          {result.targetKeywords?.length > 0 && (
            <Panel>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>TARGET KEYWORDS — BUYERS AT DECISION STAGE</div>
              {result.targetKeywords.map((kw, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.bg, borderRadius: 4, marginBottom: 4, fontSize: 12, color: C.text }}>
                  <span>{kw.keyword}</span>
                  <span style={{ color: C.gold, fontFamily: "monospace" }}>{(kw.monthlySearches || 0).toLocaleString()}/mo</span>
                </div>
              ))}
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GAP 7: BACKLINK FINDER
// ============================================================
function BacklinkFinder() {
  const [domain, setDomain] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are a backlink gap analyst for local service businesses. Identify the highest-value link building opportunities based on industry and location. Return ONLY valid JSON.",
        `Domain: ${domain}\nCompetitor Domain: ${competitor || "identify top competitors"}\nIndustry: ${industry || "detect from domain"}\nCity: ${city}\n\nIdentify the top 20 backlink opportunities for this business. Focus on local, industry-specific, and high-authority sources. For each opportunity, explain how to get the link and what it will do for rankings.\n\nReturn JSON:\n{\n  "domain": "",\n  "industry": "",\n  "estimatedCurrentBacklinks": 0,\n  "competitorBacklinkAdvantage": "",\n  "opportunities": [\n    {\n      "source": "",\n      "sourceType": "",\n      "domainAuthority": "",\n      "howToGetLink": "",\n      "difficulty": "EASY|MEDIUM|HARD",\n      "rankingImpact": "",\n      "isLocalSignal": true,\n      "isIndustrySpecific": true,\n      "priority": "CRITICAL|HIGH|MEDIUM|LOW"\n    }\n  ],\n  "searchQueriesToFindMore": [],\n  "thirtyDayLinkBuildingPlan": []\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="★ Your Domain" value={domain} onChange={setDomain} placeholder="citywidealarms.com" color={C.gold} />
          <Field label="Competitor Domain (optional)" value={competitor} onChange={setCompetitor} placeholder="passecurity.com" />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Home & Business Security" />
          <Field label="City + State" value={city} onChange={setCity} placeholder="St. Louis, MO" />
        </div>
        <RunBtn onClick={run} loading={loading} disabled={!domain.trim()} label="Find Backlink Opportunities →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ padding: "12px 16px", background: `${C.orange}06`, border: `1px solid ${C.orange}20`, borderRadius: 6, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.orange, fontFamily: "monospace", marginBottom: 4 }}>COMPETITOR BACKLINK ADVANTAGE</div>
            <div style={{ fontSize: 13, color: C.muted }}>{result.competitorBacklinkAdvantage}</div>
          </div>
          {result.opportunities?.map((opp, i) => {
            const dc = { EASY: C.green, MEDIUM: C.gold, HARD: C.orange }[opp.difficulty] || C.muted;
            const pc = { CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.gold }[opp.priority] || C.muted;
            return (
              <div key={i} style={{ padding: "12px 14px", background: C.bg, border: `1px solid ${pc}20`, borderLeft: `3px solid ${pc}`, borderRadius: 6, marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{opp.source}</div>
                  <Pill color={dc} small>{opp.difficulty}</Pill>
                  <Pill color={pc} small>{opp.priority}</Pill>
                  {opp.isLocalSignal && <Pill color={C.teal} small>LOCAL</Pill>}
                  {opp.domainAuthority && <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>DA: {opp.domainAuthority}</span>}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{opp.sourceType}</div>
                <div style={{ fontSize: 12, color: C.green, marginBottom: 4 }}>→ {opp.howToGetLink}</div>
                <div style={{ fontSize: 11, color: C.accent, fontStyle: "italic" }}>{opp.rankingImpact}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GAP 8: XML SITEMAP GENERATOR
// ============================================================
function SitemapGenerator() {
  const [domain, setDomain] = useState("");
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const data = await callClaudeJSON(
        "You are an XML sitemap generator for local service businesses. Generate a complete, valid XML sitemap and Google Search Console submission instructions. Return ONLY valid JSON.",
        `Domain: ${domain}\nPages/URLs provided: ${pages || "generate based on best practices for a local service business with city pages"}\n\nGenerate a complete XML sitemap. Include all page types: homepage, service pages, location pages, city pages. Set correct priority and changefreq values based on page importance. Provide Google Search Console submission steps.\n\nReturn JSON:\n{\n  "domain": "",\n  "totalUrls": 0,\n  "sitemapXML": "",\n  "sitemapUrl": "",\n  "submissionSteps": [],\n  "priorityExplanation": "",\n  "robotsTxtAddition": "",\n  "verificationNote": ""\n}`
      );
      setResult(data);
    } catch (e) { }
    setLoading(false);
  };

  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <Field label="★ Domain" value={domain} onChange={setDomain} placeholder="citywidealarms.com" color={C.gold} />
        </div>
        <Field label="Key Pages / URL Structure (optional — we generate a template if not provided)" value={pages} onChange={setPages} placeholder="/, /home-security/, /business-security/, /cameras/, /locations/, /service-areas/, /service-areas/wentzville-mo/, etc." rows={5} />
        <RunBtn onClick={run} loading={loading} disabled={!domain.trim()} label="Generate XML Sitemap →" />
      </Panel>
      {loading && <Spinner />}
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total URLs", val: result.totalUrls, color: C.accent },
              { label: "Sitemap URL", val: result.sitemapUrl, color: C.gold },
              { label: "Submit To", val: "Google Search Console", color: C.green },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg, border: "1px solid #1e2f48", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: i === 0 ? 26 : 13, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {result.sitemapXML && (
            <Panel style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace" }}>SITEMAP XML — SAVE AS /sitemap.xml</div>
                <CopyBtn text={result.sitemapXML} />
              </div>
              <pre style={{ fontSize: 11, color: "#86efac", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, overflowX: "auto", maxHeight: 400 }}>{result.sitemapXML}</pre>
            </Panel>
          )}
          {result.robotsTxtAddition && (
            <Panel style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>ADD TO robots.txt</div>
                <CopyBtn text={result.robotsTxtAddition} />
              </div>
              <pre style={{ fontSize: 12, color: C.accent, fontFamily: "monospace", background: C.bg, padding: 10, borderRadius: 4 }}>{result.robotsTxtAddition}</pre>
            </Panel>
          )}
          <Panel>
            <div style={{ fontSize: 11, color: C.green, fontFamily: "monospace", marginBottom: 10 }}>GOOGLE SEARCH CONSOLE SUBMISSION STEPS</div>
            {result.submissionSteps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: C.muted }}>
                <span style={{ color: C.gold, fontFamily: "monospace", flexShrink: 0 }}>{i + 1}.</span>{step}
              </div>
            ))}
          </Panel>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
const TOOLS = [
  { id: "rank", label: "📈 Rank Tracker", icon: "📈", color: C.accent, desc: "Track keyword positions over time", component: RankTracker },
  { id: "speed", label: "⚡ Page Speed", icon: "⚡", color: C.orange, desc: "Core Web Vitals & mobile speed audit", component: PageSpeedAnalyzer },
  { id: "blog", label: "✍️ Blog Planner", icon: "✍️", color: C.green, desc: "15 blog topics with full content outlines", component: BlogPlanner },
  { id: "faq", label: "❓ FAQ Generator", icon: "❓", color: C.purple, desc: "FAQ content + schema for rich results", component: FAQGenerator },
  { id: "pricing", label: "💲 Pricing Pages", icon: "💲", color: C.gold, desc: "Highest-converting page type most miss", component: PricingPageGenerator },
  { id: "comparison", label: "⚔️ Comparison Pages", icon: "⚔️", color: C.red, desc: "vs competitor pages for decision-stage buyers", component: ComparisonPageGenerator },
  { id: "backlinks", label: "🔗 Backlink Finder", icon: "🔗", color: C.teal, desc: "20 link opportunities with exact outreach", component: BacklinkFinder },
  { id: "sitemap", label: "🗺️ Sitemap Builder", icon: "🗺️", color: C.dim, desc: "XML sitemap + Search Console submission", component: SitemapGenerator },
];

export default function GapModules() {
  const [active, setActive] = useState("rank");
  const ActiveComp = TOOLS.find(t => t.id === active)?.component || RankTracker;
  const activeTool = TOOLS.find(t => t.id === active);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif", padding: "0 0 80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* HEADER */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "22px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: `${C.accent}10`, border: `1px solid ${C.accent}25`, color: C.accent, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 12px", borderRadius: 2, marginBottom: 10 }}>
            LOCALRANK PRO — COMPLETE MODULE SET
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px,4vw,40px)", fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 6 }}>
            The <span style={{ color: C.accent }}>8 Gap Modules</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 12, fontFamily: "monospace" }}>Rank tracking · Page speed · Blog planner · FAQ generator · Pricing pages · Comparison pages · Backlinks · Sitemap</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>
        {/* TOOL GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              background: active === t.id ? `${t.color}15` : C.surface,
              border: `1px solid ${active === t.id ? t.color : C.border}`,
              borderRadius: 8, padding: 14, cursor: "pointer", textAlign: "left",
              transition: "all 0.15s"
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: active === t.id ? t.color : C.text, marginBottom: 3 }}>{t.label.split(" ").slice(1).join(" ")}</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ACTIVE TOOL HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, background: `${activeTool?.color}15`, border: `1px solid ${activeTool?.color}30`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{activeTool?.icon}</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.text }}>{activeTool?.label}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{activeTool?.desc}</div>
          </div>
        </div>

        <ActiveComp key={active} />
      </div>
    </div>
  );
}
