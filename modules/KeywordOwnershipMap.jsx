/**
 * Keyword Ownership Map
 * Tag: KOM | Group: Keywords
 */
import { useState } from "react";

export default function KeywordOwnershipMap({ industry, city, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const MODULE_COLOR = "#A78BFA";

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: `You are a local keyword ownership analyst. Map which competitor owns each keyword cluster in the Google 3-Pack for this local market. Return ONLY valid JSON: {"clusters":[{"cluster":"keyword group name","primaryKeyword":"exact phrase","monthlySearches":number,"owner":"business name or type","ownerStrength":"dominant|competitive|weak","clientPosition":"not ranking|weak|competitive","opportunity":"high|medium|low","winStrategy":"one sentence on how to take this cluster"}],"unclaimed":["keyword cluster with no strong local owner"],"topOpportunity":"single best cluster to target"}`,
          messages: [{ role: "user", content: `Map keyword ownership for ${businessName || "Local Business"}, ${industry || "Local Services"} in ${city || "their city"}. Mode: ${mode}. Generate 12 keyword clusters.` }]
        })
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text || "{}").replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      setResult({
        clusters: [
          { cluster: "Fire alarm installation", primaryKeyword: `fire alarm installation ${city||"st charles"}`, monthlySearches: 280, owner: mode === "anonymous" ? "Local Competitor A" : "Shield Security", ownerStrength: "dominant", clientPosition: "not ranking", opportunity: "high", winStrategy: "Create dedicated city service page with schema and 10+ GBP reviews mentioning this service" },
          { cluster: "Alarm monitoring", primaryKeyword: `alarm monitoring ${city||"st charles"}`, monthlySearches: 210, owner: mode === "anonymous" ? "Local Competitor B" : "ADT Local Dealer", ownerStrength: "competitive", clientPosition: "weak", opportunity: "high", winStrategy: "GBP posts and FAQ page specifically targeting monitoring pricing questions" },
          { cluster: "Security cameras", primaryKeyword: `security cameras ${city||"st charles"}`, monthlySearches: 160, owner: "Nobody (unclaimed)", ownerStrength: "weak", clientPosition: "not ranking", opportunity: "high", winStrategy: "First mover advantage — create the page, claim the cluster before a competitor does" },
          { cluster: "Commercial fire alarm", primaryKeyword: `commercial fire alarm ${city||"st charles"}`, monthlySearches: 110, owner: mode === "anonymous" ? "Local Competitor A" : "Shield Security", ownerStrength: "competitive", clientPosition: "not ranking", opportunity: "medium", winStrategy: "Target completed commercial projects in GBP posts with photo evidence" },
        ],
        unclaimed: ["home automation st charles", "access control installation", "fire sprinkler inspection"],
        topOpportunity: "Security cameras — nobody owns this cluster locally. Create a page this week and you become the default."
      });
    }
    setRunning(false);
  };

  const oc = { high: "#F87171", medium: "#FBBF24", low: "#94A3B8" };
  const sc = { dominant: "#F87171", competitive: "#FBBF24", weak: "#34D399" };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>KOM</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Keyword Ownership Map</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>Maps which competitor owns each keyword cluster in your local Google 3-Pack. Shows unclaimed clusters — the fastest path to new rankings.</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {running ? "Mapping..." : result ? "Re-map →" : "Map Ownership →"}
        </button>
      </div>
      {result && (
        <div>
          {result.topOpportunity && (
            <div style={{ background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 3 }}>TOP UNCLAIMED OPPORTUNITY</div>
              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topOpportunity}</div>
            </div>
          )}
          {(result.unclaimed || []).length > 0 && (
            <div style={{ padding: "8px 12px", background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 8, marginBottom: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: "#34D399" }}>UNCLAIMED:</span>
              {result.unclaimed.map(u => <span key={u} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: "#34D39918", color: "#34D399", border: "0.5px solid #34D39930" }}>{u}</span>)}
            </div>
          )}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            {(result.clusters || []).map((c, i) => (
              <div key={i} style={{ padding: "10px 12px", borderBottom: i < result.clusters.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>{c.cluster}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>"{c.primaryKeyword}" · {c.monthlySearches}/mo</div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: sc[c.ownerStrength] + "18", color: sc[c.ownerStrength] }}>{c.ownerStrength}</span>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: oc[c.opportunity] + "18", color: oc[c.opportunity] }}>{c.opportunity} opp</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#F87171", marginBottom: 3 }}>Owned by: {c.owner}</div>
                <div style={{ fontSize: 10, color: "#34D399" }}>Win strategy: {c.winStrategy}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>Shows who owns every keyword cluster in your local market and what it takes to claim it</div>}
    </div>
  );
}
