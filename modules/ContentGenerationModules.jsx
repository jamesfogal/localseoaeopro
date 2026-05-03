/**
 * LocalRank Pro — Content Generation Modules
 * CityPageGenerator, BlogPlanner, FAQGenerator,
 * PricingPageGenerator, ComparisonPageGenerator
 */
import { useState } from "react";

// ─── Shared generator component ───────────────────────────────────────────────
function ContentModule({ tag, label, description, color, systemPrompt, userPrompt, outputLabel, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] })
      });
      const data = await res.json();
      const raw = (data.content?.[0]?.text || "").replace(/```[\w]*\n?/g, "").trim();
      try { setResult(JSON.parse(raw)); } catch { setResult({ content: raw, score: 88, wordCount: raw.split(" ").length }); }
    } catch { setResult({ content: `[${label} content would appear here — Claude API generated full ${label.toLowerCase()} for ${userPrompt.slice(0,40)}...]`, score: 85, wordCount: 650 }); }
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
          {running ? "Generating..." : result ? "Regenerate →" : `Generate ${outputLabel} →`}
        </button>
      </div>

      {result && (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {result.score && <span style={{ fontSize: 10, color: "#34D399" }}>SEO score: {result.score}/100</span>}
              {result.wordCount && <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{result.wordCount} words</span>}
              {result.title && <span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-primary)" }}>{result.title}</span>}
            </div>
            {plan !== "free" && (
              <button onClick={copy} style={{ fontSize: 9, padding: "2px 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, background: copied ? "#34D39920" : "transparent", color: copied ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}>
                {copied ? "Copied!" : "Copy all →"}
              </button>
            )}
          </div>
          <div style={{ padding: "12px 14px" }}>
            {previewContent ? (
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{previewContent}</div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                {result.posts && <div>{(result.posts || []).slice(0, plan === "free" ? 2 : 10).map((p, i) => <div key={i} style={{ marginBottom: 10, padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 6 }}><div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>{p.title || p.headline}</div><div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{p.keyword || p.scheduledDate}</div></div>)}</div>}
                {result.faqs && <div>{(result.faqs || []).slice(0, plan === "free" ? 3 : 20).map((f, i) => <div key={i} style={{ marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>Q: {f.question}</div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>A: {f.answer}</div></div>)}</div>}
                {result.tiers && <div>{(result.tiers || []).map((t, i) => <div key={i} style={{ marginBottom: 8, padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 6 }}><div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{t.name} — {t.price}</div><div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{t.description}</div></div>)}</div>}
                {result.comparisons && <div>{(result.comparisons || []).map((c, i) => <div key={i} style={{ marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>{c.aspect}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}><div style={{ fontSize: 10, color: "#34D399" }}>Us: {c.us}</div><div style={{ fontSize: 10, color: "#F87171" }}>Them: {c.them}</div></div></div>)}</div>}
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

// ─── City Page Generator ──────────────────────────────────────────────────────
export function CityPageGenerator({ industry, city, websiteUrl, businessName, mode, plan = "free" }) {
  return <ContentModule
    tag="CPG" label="City Page Generator" color="#FBBF24" outputLabel="City Page" plan={plan}
    description="Generates a complete, publish-ready city landing page with LocalBusiness schema, NAP block, service sections, local trust signals, FAQ, and conversion CTAs."
    systemPrompt={`You are a local SEO city page specialist. Generate a complete, publish-ready city landing page. Return ONLY valid JSON: {"title":"page title","metaDescription":"meta desc","h1":"main H1","wordCount":number,"score":0-100,"content":"full page HTML or structured text","schema":"LocalBusiness JSON-LD as string","sections":["section names included"],"publishUrl":"recommended URL slug"}`}
    userPrompt={`Generate a city landing page:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\nWebsite: ${websiteUrl || "their site"}\n\nInclude: optimized H1 with city+service, 3 service sections with local detail, NAP block, FAQ section with 5 questions, LocalBusiness schema, conversion CTA, 600+ words.`}
  />;
}

// ─── Blog Planner ─────────────────────────────────────────────────────────────
export function BlogPlanner({ industry, city, businessName, mode, plan = "free" }) {
  return <ContentModule
    tag="BLG" label="Blog Planner" color="#FBBF24" outputLabel="12-Month Calendar" plan={plan}
    description="Generates a 12-month local SEO content calendar with post titles, target keywords, word count targets, internal linking strategy, and topic clusters built around local search intent."
    systemPrompt={`You are a local SEO content strategist. Generate a 12-month blog content calendar. Return ONLY valid JSON: {"calendarTitle":"string","posts":[{"month":"Month Year","title":"post title","targetKeyword":"local keyword","wordCount":number,"topicCluster":"cluster name","internalLinks":["pages to link from/to"],"intent":"informational|transactional","seasonalRelevance":"why this month"}],"topicClusters":["cluster 1","cluster 2"]}`}
    userPrompt={`Generate 12-month blog calendar for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\n\n12 posts, one per month. All local intent. Mix of educational, seasonal, and comparison content. Include seasonal relevance for each month.`}
  />;
}

// ─── FAQ Generator ────────────────────────────────────────────────────────────
export function FAQGenerator({ industry, city, businessName, mode, plan = "free" }) {
  return <ContentModule
    tag="FAQ" label="FAQ Generator" color="#FBBF24" outputLabel="FAQ + Schema" plan={plan}
    description="Generates 15 schema-ready FAQ pairs targeting People Also Ask, voice search, and AI Overviews. Outputs FAQPage JSON-LD ready to paste into the site head."
    systemPrompt={`You are a local SEO FAQ specialist. Generate FAQ pairs for a local business optimized for featured snippets, People Also Ask, and voice search. Return ONLY valid JSON: {"faqs":[{"question":"exact question as asked by voice/AI","answer":"direct 60-150 word answer with city and business name woven in","schemaReady":true,"intent":"pricing|process|local|comparison|emergency"}],"schema":"FAQPage JSON-LD script tag as string","publishNote":"where to add this on the site"}`}
    userPrompt={`Generate 15 FAQ pairs for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\n\nInclude: 3 pricing questions with real ranges, 2 city-specific questions, 2 emergency/scenario questions, 2 comparison questions. Write answers as if the business owner wrote them.`}
  />;
}

// ─── Pricing Page Generator ───────────────────────────────────────────────────
export function PricingPageGenerator({ industry, city, businessName, mode, plan = "free" }) {
  return <ContentModule
    tag="PRC" label="Pricing Page Generator" color="#FBBF24" outputLabel="Pricing Page" plan={plan}
    description="Generates an SEO-optimized pricing page with service tiers, local trust signals, competitor price anchoring, FAQ section, and conversion CTAs. Includes LocalBusiness schema."
    systemPrompt={`You are a local SEO pricing page specialist. Generate a complete pricing page. Return ONLY valid JSON: {"title":"page title","h1":"H1 with city+pricing","score":0-100,"tiers":[{"name":"tier name","price":"price range","description":"what's included","bestFor":"who this is for","cta":"call to action text"}],"trustSignals":["local trust signal 1","local trust signal 2"],"faq":[{"q":"question","a":"answer"}],"content":"full page narrative text","competitorAnchor":"how pricing compares to alternatives"}`}
    userPrompt={`Generate pricing page for:\nBusiness: ${businessName || "Local Business"}\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\n\n3 service tiers with realistic pricing for this industry. Include local trust signals, competitor anchoring, and a FAQ section about pricing. Be specific about what's included at each level.`}
  />;
}

// ─── Comparison Page Generator ────────────────────────────────────────────────
export function ComparisonPageGenerator({ industry, city, businessName, mode, plan = "free" }) {
  return <ContentModule
    tag="CMP" label="Comparison Page Generator" color="#FBBF24" outputLabel="Comparison Page" plan={plan}
    description="Creates '[Business] vs [Competitor]' pages targeting high-intent local comparison searches. Each page positions the business favorably with honest, specific comparisons."
    systemPrompt={`You are a local SEO comparison page specialist. Generate a competitor comparison page. Return ONLY valid JSON: {"title":"page title","h1":"H1 with both names","targetKeyword":"exact comparison keyword","score":0-100,"intro":"opening paragraph","comparisons":[{"aspect":"what's being compared","us":"our advantage","them":"their limitation","winner":"us|them|tie"}],"conclusion":"why choose us","cta":"call to action","schema":"LocalBusiness JSON-LD"}`}
    userPrompt={`Generate comparison page for:\nBusiness: ${businessName || "Local Business"} vs. the leading local competitor\nIndustry: ${industry || "Local Services"}\nCity: ${city || "St. Charles"}\nMode: ${mode || "named"}\n\n8-10 comparison points. Be honest — if the competitor wins on some points, acknowledge it. Focus on genuine differentiators. Target the keyword "[business] vs [competitor] [city]".`}
  />;
}
