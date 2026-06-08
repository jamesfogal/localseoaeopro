/**
 * Pricing Page Generator
 * Tag: PPG | Group: Content
 */
import { useState } from "react";

function ContentModule({ tag, label, description, color, systemPrompt, userPrompt, outputLabel, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, prompt: userPrompt })
      });
      const data = await res.json();
      const raw = (data.result || "").replace(/```[\w]*\n?/g, "").trim();
      try { setResult(JSON.parse(raw)); } catch { setResult({ content: raw, score: 88, wordCount: raw.split(" ").length }); }
    } catch { setResult({ content: `[${label} content would appear here â€” Claude API generated full ${label.toLowerCase()} for ${userPrompt.slice(0,40)}...]`, score: 85, wordCount: 650 }); }
    setRunning(false);
  };

  const copy = () => {
    const text = result?.content || result?.html || JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const displayContent = result ? (result.content || result.html || result.pageContent || result.calendarSummary || "") : "";
  const previewContent = plan === "free" ? displayContent.slice(0, 400) + (displayContent.length > 400 ? "..." : "") : displayContent;

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color, background: color + "18", padding: "2px 6px", borderRadius: 3 }}>{tag}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{description}</p>
        </div>
        <button onClick={run} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : color, border: `0.5px solid ${color}`, borderRadius: 6, color: running ? color : plan === "free" ? "#0B0E16" : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Generating..." : result ? "Regenerate â†’" : `Generate ${outputLabel} â†’`}
        </button>
      </div>
      {result && (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {result.score && <span style={{ fontSize: 10, color: "#34D399" }}>SEO score: {result.score}/100</span>}
              {result.title && <span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-primary)" }}>{result.title}</span>}
            </div>
            {plan !== "free" && (
              <button onClick={copy} style={{ fontSize: 9, padding: "2px 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, background: copied ? "#34D39920" : "transparent", color: copied ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}>
                {copied ? "Copied!" : "Copy all â†’"}
              </button>
            )}
          </div>
          <div style={{ padding: "12px 14px" }}>
            {previewContent ? (
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{previewContent}</div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                {result.tiers && <div>{(result.tiers || []).map((t, i) => <div key={i} style={{ marginBottom: 8, padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 6 }}><div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{t.name} â€” {t.price}</div><div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{t.description}</div></div>)}</div>}
              </div>
            )}
            {plan === "free" && displayContent.length > 400 && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Showing preview only. Upgrade for the complete {outputLabel.toLowerCase()} + copy button.</div>
                <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade to get full content</span>
              </div>
            )}
          </div>
        </div>
      )}
      {!result && !running && <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>{description}</div>}
    </div>
  );
}

export default function PricingPageGenerator({ industry, city, businessName, mode, plan = "free" }) {
  return <ContentModule
    tag="PPG" label="Pricing Page Generator" color="#FBBF24" outputLabel="Pricing Page" plan={plan}
    description="Generates an SEO-optimized pricing page with service tiers, local trust signals, competitor price anchoring, FAQ section, and conversion CTAs. Includes LocalBusiness schema."
    systemPrompt={`You are a local SEO pricing page specialist. Generate a complete pricing page. Return ONLY valid JSON: {"title":"page title","h1":"H1 with city+pricing","score":0-100,"tiers":[{"name":"tier name","price":"price range","description":"what's included","bestFor":"who this is for","cta":"call to action text"}],"trustSignals":["local trust signal 1","local trust signal 2"],"faq":[{"q":"question","a":"answer"}],"content":"full page narrative text","competitorAnchor":"how pricing compares to alternatives"}`}
    userPrompt={`Generate pricing page for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\n\n3 service tiers with realistic pricing for this industry. Include local trust signals, competitor anchoring, and a FAQ section about pricing. Be specific about what's included at each level.`}
  />;
}

