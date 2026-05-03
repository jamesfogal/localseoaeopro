import { useState, useCallback } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
const C = {
  bg: "#04080f",
  surface: "#080f1c",
  surface2: "#0d1528",
  border: "#152035",
  border2: "#1e2f48",
  text: "#eaf0ff",
  muted: "#4a6080",
  dim: "#1e3050",
  accent: "#0ea5e9",
  accentDark: "#0369a1",
  gold: "#f0b429",
  goldDark: "#b45309",
  green: "#10d98a",
  red: "#ff4060",
  orange: "#ff7c42",
  purple: "#8b5cf6",
  teal: "#06b6d4",
};

// ============================================================
// CLAUDE API
// ============================================================
async function callClaude(system, user, maxTokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  const data = await res.json();
  const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ============================================================
// MASTER SYSTEM PROMPT
// ============================================================
const MASTER_PROMPT = `You are LocalRank Pro — an elite local SEO intelligence engine that analyzes any business website and produces a complete competitive intelligence report.

YOUR CORE PHILOSOPHY:
You act smarter than the business owner. You tell them what you find — you do not ask them questions. Given only a name, email, and website URL, you determine everything else yourself. You read the website, identify the business type, classify the industry correctly, benchmark against top local competitors, and deliver findings the business owner never knew to look for.

YOUR TWO-STEP MANDATORY PROCESS:

STEP 1 — READ AND CLASSIFY THE WEBSITE
- Identify the exact business type and industry classification
- Determine if they are classified correctly (many businesses are misclassified — a "general contractor" who only does kitchens should be classified as a kitchen remodeler)
- Identify all services offered
- Detect the physical address and service locations
- Identify the GBP categories they likely use vs what they should use
- Read all signals: H1 tags, title tags, meta descriptions, schema, phone numbers, review counts

STEP 2 — BENCHMARK AND GAP ANALYSIS  
- Identify the top 5 local competitors in the same industry and city
- Determine what keywords those competitors rank for that this business does not
- Calculate the traffic and lead gap
- Find the specific signals the leaders have that this business is missing

SERVICE AREA INTELLIGENCE — CRITICAL MODULE:
You analyze the business's claimed service area and apply industry-specific logic:

INDUSTRY SERVICE RADIUS BENCHMARKS:
- Auto repair / garage / body shop: 8-15 miles. Customers will not drive 60 miles for oil changes.
- Restaurant / cafe / retail: 5-10 miles. Beyond 15 miles is almost never realistic.
- Attorney / law firm: 30-60 miles for most practice areas. Estate planning can be statewide.
- Plumber / electrician / HVAC: 25-50 miles. Emergency services may extend further.
- Medical / dental / chiropractic: 10-20 miles for routine care. Specialty care can be 50+ miles.
- Home security / alarm: 40-80 miles. Installation businesses travel further.
- Landscaping / lawn care: 15-30 miles.
- Real estate agent: County-level, typically 30-50 mile radius.
- General contractor / remodeler: 30-60 miles.
- Pest control: 30-60 miles.

GOOGLE'S SERVICE AREA RADIUS TRUTH:
Claiming an unrealistically large service area does not help — it actively hurts. Google's proximity algorithm rewards businesses that are genuinely local to the searcher. When a business claims 50 cities across 3 counties, Google cannot establish strong relevance for any of them. The result: you rank mediocrely in many places instead of ranking #1 in the right places. The optimal strategy is to claim the realistic service radius, build city-specific content pages for suburbs within that radius, and let content do the geographic expansion rather than GBP radius claims.

OVER-CLAIMING PENALTIES (how Google actually responds):
- Relevance dilution: Google scores your local relevance lower for every location because you are claiming too many
- 3 Pack suppression: Businesses with realistic, focused service areas rank in the map pack more consistently than those with inflated areas
- Citation inconsistency: Over-claimed service areas often conflict with NAP data across directories, creating trust signals that suppress rankings
- User experience signals: If users in claimed areas cannot realistically reach you or you cannot realistically serve them, bounce rates from those searches hurt your overall ranking

Your job is to calculate the OPTIMAL center point (likely their physical address) and the OPTIMAL radius for their specific business type, then flag any cities they are currently claiming that fall outside realistic service distance.

FOLLOW-UP EMAIL INTELLIGENCE:
Generate 3 specific, personalized follow-up emails based on the actual gaps you find. Each email should reference a specific competitor by name, a specific keyword or ranking gap, and a specific number. These emails should feel like they were written by someone who deeply researched the business — not a generic template.

Always respond in the JSON format specified in each prompt.`;

// ============================================================
// COMPONENTS
// ============================================================
function Pill({ children, color, small }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: small ? 9 : 10,
      padding: small ? "2px 7px" : "3px 10px",
      borderRadius: 3,
      fontFamily: "monospace",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      background: `${color || C.accent}15`,
      border: `1px solid ${color || C.accent}30`,
      color: color || C.accent
    }}>{children}</span>
  );
}

function Panel({ children, color, style }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${color || C.border2}`,
      borderRadius: 10,
      padding: 20,
      ...style
    }}>{children}</div>
  );
}

function Finding({ title, content, color, icon }) {
  return (
    <div style={{
      padding: 16,
      background: `${color || C.accent}08`,
      borderLeft: `3px solid ${color || C.accent}`,
      borderRadius: "0 6px 6px 0",
      marginBottom: 10
    }}>
      {title && <div style={{ fontSize: 10, color: color || C.accent, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>{icon} {title}</div>}
      <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.7 }}>{content}</p>
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <Panel style={{ textAlign: "center", padding: 16 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || C.accent, fontFamily: "monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: color || C.accent, marginTop: 2, fontFamily: "monospace" }}>{sub}</div>}
      <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
    </Panel>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        background: copied ? `${C.green}15` : `${C.accent}10`,
        border: `1px solid ${copied ? C.green : C.accent}30`,
        color: copied ? C.green : C.accent,
        fontSize: 10, padding: "4px 10px", borderRadius: 4,
        cursor: "pointer", fontFamily: "monospace"
      }}>
      {copied ? "✓ COPIED" : "COPY"}
    </button>
  );
}

function EmailCard({ email, index }) {
  return (
    <Panel color={`${C.gold}25`} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Pill color={C.gold}>Follow-Up #{index + 1} — Send {email.sendTiming}</Pill>
        <CopyBtn text={`Subject: ${email.subject}\n\n${email.body}`} />
      </div>
      <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace", marginBottom: 6 }}>Subject: {email.subject}</div>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
        <pre style={{ fontSize: 12, color: C.muted, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Outfit', sans-serif" }}>{email.body}</pre>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: "italic" }}>{email.strategyNote}</div>
    </Panel>
  );
}

// ============================================================
// LOADING STEPS
// ============================================================
const STEPS = [
  { id: "reading", label: "Reading your website...", sub: "Identifying business type, services, and location signals" },
  { id: "classifying", label: "Classifying your industry...", sub: "Determining correct category and checking for misclassification" },
  { id: "service-area", label: "Analyzing your service area...", sub: "Calculating optimal radius and flagging over-claims" },
  { id: "competitors", label: "Benchmarking local competitors...", sub: "Finding who is winning your keywords and why" },
  { id: "gaps", label: "Calculating your keyword gaps...", sub: "Identifying traffic and leads going to competitors" },
  { id: "emails", label: "Writing your follow-up intelligence...", sub: "Personalizing outreach based on your specific gaps" },
];

function LoadingView({ currentStep }) {
  return (
    <div style={{ padding: "60px 20px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ width: 56, height: 56, margin: "0 auto 28px", position: "relative" }}>
        <div style={{
          width: "100%", height: "100%",
          border: `3px solid ${C.border2}`,
          borderTop: `3px solid ${C.accent}`,
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STEPS.map((step, i) => {
          const stepIdx = STEPS.findIndex(s => s.id === currentStep);
          const isPast = i < stepIdx;
          const isCurrent = i === stepIdx;
          return (
            <div key={step.id} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              opacity: isPast ? 0.4 : isCurrent ? 1 : 0.2,
              transition: "opacity 0.4s",
              animation: isCurrent ? "fadeIn 0.4s ease" : "none"
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                background: isPast ? C.green : isCurrent ? C.accent : C.dim,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: isPast || isCurrent ? "#000" : C.muted,
                fontWeight: 700, fontFamily: "monospace"
              }}>{isPast ? "✓" : i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? C.text : C.muted }}>{step.label}</div>
                {isCurrent && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{step.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 32, padding: "12px 16px", background: `${C.accent}06`, border: `1px solid ${C.accent}15`, borderRadius: 6, fontSize: 12, color: C.muted, textAlign: "center" }}>
        We're doing the detective work. This takes 30-60 seconds.
      </div>
    </div>
  );
}

// ============================================================
// REPORT VIEW
// ============================================================
function ReportView({ report, name, email, url }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "classification", label: "🏷️ Classification" },
    { id: "servicearea", label: "📍 Service Area" },
    { id: "keywords", label: "🔑 Keywords" },
    { id: "competitors", label: "⚔️ Competitors" },
    { id: "technical", label: "🔧 Technical" },
    { id: "emails", label: "✉️ Follow-Up Emails" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>

      {/* REPORT HEADER */}
      <div style={{
        background: `linear-gradient(135deg, ${C.surface2}, ${C.surface})`,
        border: `1px solid ${C.border2}`,
        borderRadius: 12, padding: 24, marginBottom: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Pill color={C.green} style={{ marginBottom: 10 }}>LOCALRANK PRO INTELLIGENCE REPORT</Pill>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(18px,4vw,28px)", fontWeight: 800, color: C.text, margin: "8px 0 4px" }}>
              {report.businessProfile?.businessName || name}
            </h2>
            <div style={{ fontSize: 13, color: C.muted }}>{url}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>REPORT DELIVERED TO</div>
            <div style={{ fontSize: 13, color: C.accent }}>{email}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>

        {/* SCORES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 20 }}>
          {[
            { label: "Overall Score", value: report.overallScore, color: report.overallScore >= 70 ? C.green : report.overallScore >= 40 ? C.gold : C.red },
            { label: "vs Competitors", value: report.competitiveScore, color: C.accent },
            { label: "Keyword Gaps", value: report.keywordGaps?.length || 0, color: C.red, sub: "opportunities" },
            { label: "Monthly Lead Gap", value: report.estimatedMonthlyLeadGap, color: C.orange, sub: "leads/mo to competitors" },
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* VERDICT */}
        <div style={{ marginTop: 16, padding: "14px 18px", background: `${C.gold}08`, border: `1px solid ${C.gold}20`, borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", marginBottom: 6 }}>📋 BOTTOM LINE</div>
          <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.7 }}>{report.verdict}</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? C.surface2 : "transparent",
            border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
            borderRadius: 6, padding: "7px 14px",
            color: activeTab === t.id ? C.accent : C.muted,
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: "monospace", whiteSpace: "nowrap"
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Panel>
              <div style={{ fontSize: 11, color: C.green, fontFamily: "monospace", marginBottom: 10 }}>✅ WHAT YOU ARE DOING RIGHT</div>
              {report.strengths?.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: C.muted }}>
                  <span style={{ color: C.green, flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </Panel>
            <Panel>
              <div style={{ fontSize: 11, color: C.red, fontFamily: "monospace", marginBottom: 10 }}>❌ WHAT TOP RANKERS HAVE THAT YOU DON'T</div>
              {report.criticalGaps?.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: C.muted }}>
                  <span style={{ color: C.red, flexShrink: 0 }}>✗</span>{g}
                </div>
              ))}
            </Panel>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>⚡ QUICK WINS — ACT ON THESE THIS WEEK</div>
            {report.quickWins?.map((win, i) => (
              <div key={i} style={{ padding: "12px 16px", background: `${C.green}06`, border: `1px solid ${C.green}15`, borderRadius: 6, marginBottom: 8, display: "flex", gap: 12 }}>
                <span style={{ color: C.green, fontSize: 18, flexShrink: 0 }}>→</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 3 }}>{win.action}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{win.impact} · {win.timeframe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLASSIFICATION */}
      {activeTab === "classification" && (
        <div>
          <Finding
            title="HOW YOUR WEBSITE IS CURRENTLY CLASSIFIED"
            content={report.classification?.currentClassification}
            color={report.classification?.isCorrect ? C.green : C.red}
            icon={report.classification?.isCorrect ? "✅" : "🚨"}
          />
          {!report.classification?.isCorrect && (
            <Finding
              title="HOW YOU SHOULD BE CLASSIFIED"
              content={report.classification?.correctClassification}
              color={C.gold}
              icon="🎯"
            />
          )}
          {report.classification?.misclassificationImpact && (
            <Finding
              title="WHY THIS MISCLASSIFICATION IS COSTING YOU RANKINGS"
              content={report.classification?.misclassificationImpact}
              color={C.red}
              icon="📉"
            />
          )}
          <Panel style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", marginBottom: 14 }}>📍 GOOGLE BUSINESS PROFILE CATEGORY AUDIT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 8 }}>LIKELY CURRENT CATEGORIES</div>
                {report.classification?.currentGBPCategories?.map((c, i) => <div key={i} style={{ marginBottom: 6 }}><Pill color={C.muted}>{c}</Pill></div>)}
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 8 }}>RECOMMENDED CATEGORIES</div>
                <div style={{ marginBottom: 6 }}><Pill color={C.gold}>Primary: {report.classification?.recommendedPrimaryCategory}</Pill></div>
                {report.classification?.recommendedSecondaryCategories?.map((c, i) => (
                  <div key={i} style={{ marginBottom: 6 }}><Pill color={C.green}>{c}</Pill></div>
                ))}
              </div>
            </div>
            {report.classification?.categoryFixImpact && (
              <Finding content={report.classification.categoryFixImpact} color={C.green} icon="📈" title="IMPACT OF FIXING CATEGORIES" />
            )}
          </Panel>
        </div>
      )}

      {/* SERVICE AREA */}
      {activeTab === "servicearea" && (
        <div>
          <div style={{ background: `${C.accent}06`, border: `1px solid ${C.accent}15`, borderRadius: 8, padding: "12px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.accent, fontFamily: "monospace", marginBottom: 4 }}>THE TRUTH ABOUT SERVICE AREA RADIUS AND GOOGLE RANKINGS</div>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.7 }}>
              Claiming too large a service area does not help you rank in more places — it actively suppresses your rankings everywhere. Google's proximity algorithm treats over-claimed service areas as a relevance dilution signal. Businesses with focused, realistic service areas consistently outrank those with inflated radius claims in the local 3 Pack.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Panel>
              <div style={{ fontSize: 11, color: C.red, fontFamily: "monospace", marginBottom: 10 }}>📍 CURRENT SERVICE AREA CLAIM</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.red, fontFamily: "monospace", marginBottom: 4 }}>
                {report.serviceArea?.currentRadiusMiles} miles
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Claimed radius from {report.serviceArea?.businessAddress}</div>
              {report.serviceArea?.overClaimedCities?.length > 0 && (
                <>
                  <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 6 }}>CITIES OUTSIDE REALISTIC SERVICE ZONE</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {report.serviceArea?.overClaimedCities?.map((city, i) => <Pill key={i} color={C.red}>{city}</Pill>)}
                  </div>
                </>
              )}
            </Panel>
            <Panel color={`${C.green}30`}>
              <div style={{ fontSize: 11, color: C.green, fontFamily: "monospace", marginBottom: 10 }}>✅ RECOMMENDED SERVICE AREA</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.green, fontFamily: "monospace", marginBottom: 4 }}>
                {report.serviceArea?.recommendedRadiusMiles} miles
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Optimal radius for a {report.businessProfile?.industry} in {report.serviceArea?.businessCity}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Center point: {report.serviceArea?.optimalCenterPoint}</div>
              {report.serviceArea?.recommendedCities?.length > 0 && (
                <>
                  <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 6 }}>CITIES TO CLAIM AND BUILD PAGES FOR</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {report.serviceArea?.recommendedCities?.map((city, i) => <Pill key={i} color={C.green}>{city}</Pill>)}
                  </div>
                </>
              )}
            </Panel>
          </div>

          <Finding title="WHY YOUR CURRENT RADIUS IS HURTING YOU" content={report.serviceArea?.overClaimImpact} color={C.red} icon="📉" />
          <Finding title="WHAT FIXING YOUR SERVICE AREA WILL DO" content={report.serviceArea?.fixImpact} color={C.green} icon="📈" />

          <Panel style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 10 }}>🏙️ CITY PAGE STRATEGY — DO THIS INSTEAD OF OVER-CLAIMING</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
              Rather than telling Google you serve everywhere, build dedicated content pages for each city within your realistic radius. This is how the top-ranking companies in your industry dominate multiple cities from one location — they let content do the geographic expansion rather than GBP radius claims.
            </p>
            {report.serviceArea?.cityPagesNeeded?.map((page, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                <span style={{ color: C.gold, fontFamily: "monospace", flexShrink: 0 }}>→</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text, fontFamily: "monospace" }}>{page.url}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{page.targetKeyword} · {page.monthlySearches} searches/mo</div>
                </div>
                <Pill color={page.priority === "HIGH" ? C.red : C.gold} small>{page.priority}</Pill>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {/* KEYWORDS */}
      {activeTab === "keywords" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            <StatCard label="Total Market Searches/Mo" value={(report.totalMarketSearchVolume || 0).toLocaleString()} color={C.gold} />
            <StatCard label="Your Estimated Traffic" value={(report.yourEstimatedTraffic || 0).toLocaleString()} color={C.accent} />
            <StatCard label="Traffic Going to Competitors" value={(report.competitorTrafficShare || 0).toLocaleString()} color={C.red} sub="/mo" />
          </div>
          {report.keywordGaps?.map((kw, i) => {
            const dc = { EASY: C.green, MEDIUM: C.gold, HARD: C.orange, VERY_HARD: C.red }[kw.difficulty] || C.muted;
            return (
              <Panel key={i} style={{ marginBottom: 8, padding: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.text }}>{kw.keyword}</div>
                  <Pill color={dc}>{kw.difficulty}</Pill>
                  <div style={{ fontSize: 12, color: C.gold, fontFamily: "monospace" }}>{(kw.monthlySearches || 0).toLocaleString()}/mo</div>
                  <div style={{ fontSize: 12, color: kw.yourRank === "NOT RANKING" ? C.red : C.green, fontFamily: "monospace" }}>
                    You: {kw.yourRank === "NOT RANKING" ? "Not ranking" : `#${kw.yourRank}`}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: 10, background: `${C.red}08`, borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 3 }}>#{1} {kw.leader}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{kw.whyLeaderWins}</div>
                  </div>
                  <div style={{ padding: 10, background: `${C.green}08`, borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 3 }}>TO CAPTURE THIS:</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{kw.howToCapture}</div>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {/* COMPETITORS */}
      {activeTab === "competitors" && (
        <div>
          {report.competitors?.map((comp, i) => (
            <Panel key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{comp.name}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill color={C.red}>{(comp.estimatedMonthlyTraffic || 0).toLocaleString()} visits/mo</Pill>
                    <Pill color={C.gold}>{comp.reviewCount} reviews · {comp.avgRating}⭐</Pill>
                    <Pill color={C.muted}>{comp.domainAge}</Pill>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, textAlign: "right" }}>
                  Ranks #{1} for {comp.primaryKeywordsCount} keywords you don't
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", marginBottom: 6 }}>WHY THEY BEAT YOU</div>
                  {comp.advantages?.map((a, j) => <div key={j} style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: C.red }}>→</span>{a}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.green, fontFamily: "monospace", marginBottom: 6 }}>THEIR WEAKNESSES</div>
                  {comp.weaknesses?.map((w, j) => <div key={j} style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: C.green }}>✓</span>{w}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.accent, fontFamily: "monospace", marginBottom: 6 }}>HOW TO DISPLACE THEM</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{comp.howToDisplace}</div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* TECHNICAL */}
      {activeTab === "technical" && (
        <div>
          {report.technicalIssues?.map((issue, i) => (
            <Panel key={i} style={{ marginBottom: 10, borderLeft: `3px solid ${issue.severity === "CRITICAL" ? C.red : issue.severity === "HIGH" ? C.orange : C.gold}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <Pill color={issue.severity === "CRITICAL" ? C.red : issue.severity === "HIGH" ? C.orange : C.gold}>{issue.severity}</Pill>
                    <Pill color={C.muted}>{issue.effort}</Pill>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{issue.issue}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{issue.impact}</div>
                  <div style={{ fontSize: 12, color: C.green }}>→ {issue.fix}</div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* FOLLOW-UP EMAILS */}
      {activeTab === "emails" && (
        <div>
          <div style={{ background: `${C.gold}08`, border: `1px solid ${C.gold}20`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 6 }}>✉️ INTELLIGENT FOLLOW-UP SEQUENCE</div>
            <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7 }}>
              These emails reference your specific competitor gaps, real keyword opportunities, and actual traffic data found in this report. Each one is designed to create urgency around a specific ranking problem we identified — sent to {email} from your account.
            </p>
          </div>
          {report.followUpEmails?.map((email, i) => <EmailCard key={i} email={email} index={i} />)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// INTAKE FORM
// ============================================================
function IntakeForm({ onSubmit, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const canRun = name.trim() && email.trim() && url.trim() && email.includes("@");

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "inline-block", background: `${C.accent}10`, border: `1px solid ${C.accent}25`, color: C.accent, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "5px 14px", borderRadius: 3, marginBottom: 16 }}>
          FREE LOCAL SEO INTELLIGENCE REPORT
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px,5vw,38px)", fontWeight: 800, color: C.text, lineHeight: 1.1, marginBottom: 12 }}>
          We'll find exactly who is<br /><span style={{ color: C.accent }}>beating you</span> — and why.
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
          Enter your name, email, and website. We read your site, identify your industry, benchmark your competitors, audit your service area, and deliver a complete local SEO intelligence report — all from your URL alone.
        </p>
      </div>

      <Panel color={`${C.accent}30`} style={{ padding: 28 }}>
        <div style={{ display: "flex", flex: 1, gap: 6, background: `${C.accent}08`, border: `1px solid ${C.accent}15`, borderRadius: 6, padding: "10px 14px", marginBottom: 20, alignItems: "flex-start" }}>
          <span style={{ color: C.accent, fontSize: 16, flexShrink: 0 }}>ℹ</span>
          <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            We detect your industry automatically. We do not ask you any questions — we tell you what we find. If your website is misclassified, we catch it and tell you exactly what it is costing you.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>YOUR NAME</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>EMAIL — WE SEND THE FULL REPORT HERE</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@yourbusiness.com" type="email"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.accent}40`, borderRadius: 6, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>YOUR WEBSITE URL — THIS IS ALL WE NEED</div>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourbusiness.com"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}50`, borderRadius: 6, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
          </div>

          <button onClick={() => onSubmit({ name, email, url })} disabled={loading || !canRun}
            style={{
              width: "100%",
              background: loading || !canRun ? C.surface2 : `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
              color: loading || !canRun ? C.muted : "#fff",
              border: "none", borderRadius: 8, padding: "14px 24px",
              fontSize: 14, fontWeight: 800, cursor: loading || !canRun ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em", marginTop: 4
            }}>
            {loading ? "Analyzing Your Business..." : "Get My Free Intelligence Report →"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          {[
            { icon: "🔍", label: "We detect your industry" },
            { icon: "📍", label: "We audit your service area" },
            { icon: "✉️", label: "Report sent to your email" },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: "center", padding: "10px 6px", background: C.bg, borderRadius: 6 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
        {["Plumbers", "Attorneys", "HVAC", "Dentists", "Auto Repair", "Restaurants", "Contractors", "Any Business"].map((ind, i) => (
          <div key={i} style={{ fontSize: 12, color: C.muted }}>✓ {ind}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function LocalRankPro() {
  const [phase, setPhase] = useState("intake"); // intake | loading | report
  const [loadingStep, setLoadingStep] = useState("reading");
  const [report, setReport] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const runReport = useCallback(async ({ name, email, url }) => {
    setUserData({ name, email, url });
    setPhase("loading");
    setError("");

    const stepDelay = async (stepId) => {
      setLoadingStep(stepId);
      await sleep(1200);
    };

    try {
      await stepDelay("reading");
      await stepDelay("classifying");
      await stepDelay("service-area");
      await stepDelay("competitors");
      await stepDelay("gaps");
      await stepDelay("emails");

      const prompt = `Analyze this local business website and produce a complete intelligence report.

Business Name: ${name}
Contact Email: ${email}  
Website URL: ${url}

MANDATORY PROCESS:
1. Read the website at the URL provided. Determine everything from the site — industry, services, location, current SEO signals.
2. DO NOT ask for any additional information. Figure it out from the URL.
3. If you cannot determine something, make the best professional estimate based on the URL and business name.
4. Classify the industry correctly. If the site appears misclassified, flag it.
5. Analyze their service area claims vs what is realistic for their industry type.
6. Benchmark against the top local competitors.
7. Generate specific follow-up emails referencing actual competitor names and specific gaps.

Return ONLY valid JSON — no markdown, no preamble:
{
  "businessProfile": {
    "businessName": "",
    "industry": "",
    "detectedServices": [],
    "physicalAddress": "",
    "city": "",
    "state": "",
    "yearsEstimated": ""
  },
  "overallScore": 0,
  "competitiveScore": 0,
  "estimatedMonthlyLeadGap": 0,
  "verdict": "",
  "strengths": [],
  "criticalGaps": [],
  "quickWins": [{ "action": "", "impact": "", "timeframe": "" }],
  "classification": {
    "currentClassification": "",
    "isCorrect": false,
    "correctClassification": "",
    "misclassificationImpact": "",
    "currentGBPCategories": [],
    "recommendedPrimaryCategory": "",
    "recommendedSecondaryCategories": [],
    "categoryFixImpact": ""
  },
  "serviceArea": {
    "businessAddress": "",
    "businessCity": "",
    "currentRadiusMiles": 0,
    "overClaimedCities": [],
    "recommendedRadiusMiles": 0,
    "optimalCenterPoint": "",
    "recommendedCities": [],
    "overClaimImpact": "",
    "fixImpact": "",
    "industryRadiusBenchmark": "",
    "cityPagesNeeded": [
      { "url": "", "targetKeyword": "", "monthlySearches": 0, "priority": "HIGH|MEDIUM|LOW" }
    ]
  },
  "totalMarketSearchVolume": 0,
  "yourEstimatedTraffic": 0,
  "competitorTrafficShare": 0,
  "keywordGaps": [
    {
      "keyword": "",
      "monthlySearches": 0,
      "difficulty": "EASY|MEDIUM|HARD|VERY_HARD",
      "leader": "",
      "yourRank": "NOT RANKING",
      "whyLeaderWins": "",
      "howToCapture": ""
    }
  ],
  "competitors": [
    {
      "name": "",
      "estimatedMonthlyTraffic": 0,
      "reviewCount": 0,
      "avgRating": 0,
      "domainAge": "",
      "primaryKeywordsCount": 0,
      "advantages": [],
      "weaknesses": [],
      "howToDisplace": ""
    }
  ],
  "technicalIssues": [
    { "issue": "", "severity": "CRITICAL|HIGH|MEDIUM", "impact": "", "fix": "", "effort": "" }
  ],
  "followUpEmails": [
    {
      "sendTiming": "Day 3",
      "subject": "",
      "body": "",
      "strategyNote": ""
    },
    {
      "sendTiming": "Day 7",
      "subject": "",
      "body": "",
      "strategyNote": ""
    },
    {
      "sendTiming": "Day 14",
      "subject": "",
      "body": "",
      "strategyNote": ""
    }
  ]
}

CRITICAL for follow-up emails: Each email must reference a SPECIFIC competitor by name, a SPECIFIC keyword or ranking gap with a specific number, and feel like it was written by someone who deeply researched this business. The subject line must create urgency around a real finding. Sign each email from "The LocalRank Pro Team".`;

      const result = await callClaude(MASTER_PROMPT, prompt, 1000);
      setReport(result);
      setPhase("report");
    } catch (e) {
      setError("Analysis failed: " + e.message + ". Please check the URL and try again.");
      setPhase("intake");
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }`}</style>

      {/* NAV */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>L</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: C.text }}>
              LocalRank<span style={{ color: C.accent }}>Pro</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>Works for any industry · any city</div>
            {phase === "report" && (
              <button onClick={() => setPhase("intake")} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.muted, padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                ← New Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HERO — only on intake */}
      {phase === "intake" && (
        <div style={{ background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.border}`, padding: "60px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center' }}>
            <div>
              <div style={{ display: "inline-block", background: `${C.green}12`, border: `1px solid ${C.green}25`, color: C.green, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "5px 14px", borderRadius: 3, marginBottom: 20 }}>
                ● FREE · NO CREDIT CARD · ANY INDUSTRY
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 20, color: "#fff" }}>
                Your competitors are<br />getting leads that<br /><span style={{ color: C.accent }}>should be yours.</span>
              </h1>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 28 }}>
                LocalRank Pro reads your website, detects your industry, analyzes your service area, benchmarks your local competitors, and tells you exactly what they have that you do not — and exactly what to build to take it back.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "🔍", text: "We detect your industry — you don't tell us" },
                  { icon: "📍", text: "Service area radius intelligence" },
                  { icon: "⚔️", text: "Named competitor gap analysis" },
                  { icon: "✉️", text: "Report delivered to your inbox" },
                  { icon: "🏙️", text: "City-by-city ranking opportunity" },
                  { icon: "⚡", text: "Quick wins you can act on today" },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <IntakeForm onSubmit={runReport} loading={phase === "loading"} />
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: phase === "intake" ? "48px 24px" : "32px 24px" }}>

        {phase === "loading" && <LoadingView currentStep={loadingStep} />}

        {error && (
          <div style={{ padding: "14px 18px", background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 8, color: C.red, fontSize: 13, fontFamily: "monospace", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {phase === "report" && report && userData && (
          <ReportView report={report} name={userData.name} email={userData.email} url={userData.url} />
        )}

        {/* INDUSTRIES SECTION — intake only */}
        {phase === "intake" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 12 }}>WORKS FOR ANY LOCAL SERVICE BUSINESS</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: C.text }}>One platform. Every industry. Every city.</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { icon: "🔧", label: "Plumbers", example: "Denver, CO" },
                { icon: "⚖️", label: "Attorneys", example: "Atlanta, GA" },
                { icon: "❄️", label: "HVAC", example: "Chicago, IL" },
                { icon: "🦷", label: "Dentists", example: "Phoenix, AZ" },
                { icon: "🚗", label: "Auto Repair", example: "St. Peters, MO" },
                { icon: "🏠", label: "Real Estate", example: "Dallas, TX" },
                { icon: "🌿", label: "Landscaping", example: "Nashville, TN" },
                { icon: "🔒", label: "Security", example: "St. Louis, MO" },
                { icon: "🐾", label: "Veterinarians", example: "Seattle, WA" },
                { icon: "🍕", label: "Restaurants", example: "Miami, FL" },
                { icon: "🏗️", label: "Contractors", example: "Portland, OR" },
                { icon: "💆", label: "Med Spas", example: "Houston, TX" },
              ].map((ind, i) => (
                <Panel key={i} style={{ padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ind.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{ind.label}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{ind.example}</div>
                </Panel>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px", textAlign: "center", marginTop: 60 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: C.accent, marginBottom: 4 }}>LocalRank<span style={{ color: C.text }}>Pro</span></div>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>Local SEO intelligence · Any business · Any industry · Any city</div>
      </div>
    </div>
  );
}
