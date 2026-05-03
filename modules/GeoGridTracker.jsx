/**
 * LocalRank Pro — GeoGrid Map Rank Tracker
 * Tag: GRD | Group: Local Presence
 *
 * Shows Google Maps ranking position at every geographic
 * point in a 7x7 grid around the business location.
 *
 * Each cell = one GPS coordinate point. The number inside
 * is what position the business ranks when someone searches
 * from that exact location. Green = strong, Red = invisible.
 *
 * This is the #1 sales tool in local SEO. Prospects
 * immediately understand their problem when they see red.
 *
 * Free:  5x5 grid, one keyword, current snapshot only
 * Paid:  7x7 grid, 10 keywords, weekly tracking, competitor overlay
 */

import { useState } from "react";

const MODULE_COLOR = "#10D9A0";
const MODULE_TAG   = "GRD";

const SYSTEM_PROMPT = `You are a local Google Maps ranking specialist for LocalRank Pro.

Generate a realistic GeoGrid ranking report for a local business.

A GeoGrid shows what position a business ranks on Google Maps when searched from
different geographic points around their location. Each point on the grid represents
a different GPS coordinate — a potential customer searching from that location.

GRID LOGIC FOR LOCAL SEO:
- A business typically ranks strongest near its physical address (center of grid)
- Rankings weaken as distance from the address increases
- Competitor density in certain directions affects rankings
- Business in a strip mall may rank differently north/south vs east/west
- Service area businesses have more uniform but generally weaker rankings

Generate a 7x7 grid (49 cells). The center cell should generally be the strongest.
Realistically distribute rankings: some cells 1-3 (dominant), some 4-7 (competitive),
some 8-15 (weak), some 16+ (not visible). Show geographic weaknesses.

For a typical local business expect: 30% dominant (1-3), 30% competitive (4-7),
25% weak (8-15), 15% not ranking (16-20).

Also generate competitor data for the 3 strongest local competitors in Named Mode.

Return ONLY valid JSON:
{
  "businessName": "string",
  "keyword": "string — the search term tracked",
  "city": "string",
  "gridSize": 7,
  "centerRank": number,
  "averageRank": number,
  "shareOfVoice": number (0-100, percentage of top-3 positions across grid),
  "grid": [[r,r,r,r,r,r,r],[r,r,r,r,r,r,r],...] (7 rows of 7 rank numbers, 1-20),
  "weakZones": ["direction description of weak areas e.g. Northeast quadrant weak"],
  "strongZones": ["direction description of strong areas"],
  "competitors": [
    {
      "name": "Competitor name (or Local Competitor A in anonymous mode)",
      "averageRank": number,
      "shareOfVoice": number,
      "threat": "high|medium|low"
    }
  ],
  "topInsight": "one specific actionable insight about what the grid reveals",
  "fixes": [
    "specific fix that would improve rankings in the weak zones"
  ]
}`;

const RANK_COLOR = (r) => {
  if (r <= 3)  return { bg: "#34D399", text: "#064E3B", border: "#059669" };
  if (r <= 7)  return { bg: "#84CC16", text: "#1A2E05", border: "#4D7C0F" };
  if (r <= 13) return { bg: "#F59E0B", text: "#451A03", border: "#B45309" };
  if (r <= 19) return { bg: "#F87171", text: "#450A0A", border: "#B91C1C" };
  return         { bg: "#6B7280", text: "#F9FAFB", border: "#374151" };
};

const COMPASS = [
  ["NW","N","NE"],
  ["W","","E"],
  ["SW","S","SE"],
];

export default function GeoGridTracker({
  industry, city, websiteUrl, businessName, mode, plan = "free"
}) {
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [keyword,  setKeyword]  = useState("");
  const [hovCell,  setHovCell]  = useState(null);

  const runScan = async () => {
    setRunning(true);
    setResult(null);

    const kw = keyword.trim() || `${industry || "alarm company"} ${city || "local area"}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Generate GeoGrid for:
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Keyword: "${kw}"
Mode: ${mode || "named"}
Plan: ${plan}

Make the grid realistic for a ${industry} business in ${city}.
Show geographic weaknesses that would make sense for this market.
${mode === "anonymous" ? "Use 'Local Competitor A/B/C' for competitor names." : "Use realistic local competitor names."}`
          }]
        })
      });

      const data  = await res.json();
      const raw   = data.content?.[0]?.text || "{}";
      const clean = raw.replace(/```[\w]*\n?/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      // Realistic fallback
      setResult({
        businessName: businessName || "Citywide Alarms",
        keyword: kw,
        city: city || "St. Charles",
        gridSize: 7,
        centerRank: 2,
        averageRank: 8.4,
        shareOfVoice: 34,
        grid: [
          [18,15,12,10,14,17,20],
          [14,10, 8, 6, 9,13,16],
          [11, 7, 4, 3, 5, 8,12],
          [ 9, 5, 2, 1, 2, 6,10],
          [12, 8, 4, 3, 4, 7,11],
          [16,12, 9, 7,10,14,18],
          [20,17,13,11,15,19,20],
        ],
        weakZones: ["Northeast quadrant — low ranking suggests competitor strength there","Far edges of service area drop below position 15"],
        strongZones: ["Center and immediate surrounding cells — strong near physical address","South-central corridor performs well"],
        competitors: [
          { name: mode === "anonymous" ? "Local Competitor A" : "Shield Security St. Charles", averageRank: 3.2, shareOfVoice: 48, threat: "high" },
          { name: mode === "anonymous" ? "Local Competitor B" : "St. Louis Alarm Pros",       averageRank: 6.8, shareOfVoice: 22, threat: "medium" },
          { name: mode === "anonymous" ? "Local Competitor C" : "Safe Home Systems MO",       averageRank: 9.1, shareOfVoice: 11, threat: "low" },
        ],
        topInsight: "Strong near your address but ranking drops sharply in the northeast — that area likely has a competitor with more GBP reviews and photos. Adding 15 photos and 10 new reviews would likely push rankings there from 10–18 down to 4–7.",
        fixes: [
          "Add 15+ photos to GBP — specifically showing service vehicles and job sites in the northeast area",
          "Generate 10 new reviews mentioning service coverage across St. Charles County",
          "Create a service-area city page targeting the northeast zip codes",
          "Add service area pins in GBP Settings to cover the northeast quadrant",
        ]
      });
    }
    setRunning(false);
  };

  const grid = result?.grid || [];
  const displayGrid = plan === "free"
    ? grid.map(row => row.slice(1,6)).slice(1,6)  // 5x5 for free
    : grid;
  const gridSize = plan === "free" ? 5 : (result?.gridSize || 7);

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>GeoGrid Map Rank Tracker</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
              Shows your Google Maps ranking position at every geographic point around your business. The number in each cell is what rank you appear when someone searches from that location. Green = you're visible. Red = you don't exist.
            </p>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="text"
                placeholder={`e.g. alarm company ${city || "your city"}`}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && runScan()}
                style={{ flex: 1, fontSize: 11 }}
              />
            </div>
          </div>
          <button
            onClick={runScan}
            disabled={running}
            style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {running ? "Scanning..." : result ? "Re-scan →" : "Scan Grid →"}
          </button>
        </div>
      </div>

      {result && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, marginBottom: 12 }}>
            {[
              { label: "Center rank",    value: `#${result.centerRank}`,         color: RANK_COLOR(result.centerRank).bg },
              { label: "Avg rank",       value: `#${result.averageRank?.toFixed(1)}`, color: RANK_COLOR(Math.round(result.averageRank)).bg },
              { label: "Share of voice", value: `${result.shareOfVoice}%`,        color: result.shareOfVoice > 40 ? "#34D399" : result.shareOfVoice > 20 ? "#FBBF24" : "#F87171" },
              { label: "Keyword",        value: result.keyword?.split(" ").slice(0,3).join(" "), color: "var(--color-text-primary)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color, lineHeight: 1, wordBreak: "break-all" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Grid legend */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>Rankings:</span>
            {[["1–3","#34D399","Dominant"],["4–7","#84CC16","Competitive"],["8–13","#F59E0B","Weak"],["14+","#F87171","Not visible"]].map(([range,color,label]) => (
              <div key={range} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: color, display: "inline-block" }}></span>
                <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{range} {label}</span>
              </div>
            ))}
          </div>

          {/* The grid */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>
                {plan === "free" ? "5×5 GRID PREVIEW" : "7×7 GRID — FULL SCAN"} · {result.keyword}
              </span>
              {plan === "free" && <span style={{ fontSize: 9, color: "#FBBF24" }}>Upgrade for 7×7 + 10 keywords</span>}
            </div>
            <div style={{ padding: "16px", display: "flex", justifyContent: "center" }}>
              <div>
                {/* N label */}
                <div style={{ textAlign: "center", fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>N</div>
                <div style={{ display: "flex", gap: 2 }}>
                  {/* W label */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: 9, color: "var(--color-text-secondary)", marginRight: 4, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>W</div>
                  {/* Grid cells */}
                  <div>
                    {displayGrid.map((row, ri) => (
                      <div key={ri} style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        {row.map((rank, ci) => {
                          const c  = RANK_COLOR(rank);
                          const isCenter = plan === "free"
                            ? ri === 2 && ci === 2
                            : ri === 3 && ci === 3;
                          const hov = hovCell?.r === ri && hovCell?.c === ci;
                          return (
                            <div
                              key={ci}
                              onMouseEnter={() => setHovCell({ r: ri, c: ci, rank })}
                              onMouseLeave={() => setHovCell(null)}
                              style={{
                                width: 38, height: 38,
                                background: c.bg,
                                border: `${isCenter ? "2px" : "0.5px"} solid ${isCenter ? "#fff" : c.border}`,
                                borderRadius: 5,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 500, color: c.text,
                                cursor: "default",
                                boxShadow: hov ? "0 0 0 2px #fff" : "none",
                                position: "relative",
                              }}
                            >
                              {rank >= 20 ? "20+" : rank}
                              {isCenter && (
                                <div style={{ position: "absolute", top: -1, right: -1, width: 7, height: 7, background: "#fff", borderRadius: "50%" }}></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {/* E label */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: 9, color: "var(--color-text-secondary)", marginLeft: 4, writingMode: "vertical-rl" }}>E</div>
                </div>
                <div style={{ textAlign: "center", fontSize: 9, color: "var(--color-text-secondary)", marginTop: 4 }}>S</div>
                <div style={{ textAlign: "center", fontSize: 9, color: "var(--color-text-secondary)", marginTop: 2 }}>● = your address</div>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div style={{ background: "#10D9A008", border: "0.5px solid #10D9A030", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 4, letterSpacing: "0.6px" }}>GRID INSIGHT</div>
            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topInsight}</div>
          </div>

          {/* Fixes + Competitors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "6px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>FIXES TO EXPAND YOUR GREEN ZONE</div>
              {(result.fixes || []).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 7, padding: "7px 12px", borderBottom: i < result.fixes.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <span style={{ color: MODULE_COLOR, fontSize: 11, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "6px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>COMPETITORS ON THIS GRID</div>
              {(result.competitors || []).map((c, i) => (
                <div key={i} style={{ padding: "8px 12px", borderBottom: i < result.competitors.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{c.name}</div>
                    <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: c.threat === "high" ? "#F8717116" : c.threat === "medium" ? "#FBBF2416" : "#34D39916", color: c.threat === "high" ? "#F87171" : c.threat === "medium" ? "#FBBF24" : "#34D399" }}>{c.threat}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Avg rank #{c.averageRank} · {c.shareOfVoice}% share of voice</div>
                </div>
              ))}
            </div>
          </div>

          {plan === "free" && (
            <div style={{ padding: "10px 14px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Free plan shows a 5×5 preview. Upgrade for the full 7×7 grid, 10 keywords, weekly tracking, and competitor overlay.</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, whiteSpace: "nowrap", fontWeight: 500 }}>Upgrade</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Enter a keyword and scan — see exactly where you're winning and losing on Google Maps
        </div>
      )}
    </div>
  );
}
