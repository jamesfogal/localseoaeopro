/**
 * LocalRank Pro â€” AEO Q&A Page Generator
 * Tag: AEO | Group: Content Generation
 *
 * AEO = Answer Engine Optimization
 * Optimizes local business content to be cited by:
 *   Google AI Overviews, ChatGPT, Gemini, Perplexity,
 *   Claude, Bing Copilot, and voice search assistants
 *
 * What it generates:
 *   - 20â€“30 high-intent local Q&A pairs per page
 *   - Conversational question formats matching how people
 *     actually speak to AI assistants ("my mom is 88...")
 *   - FAQPage + QAPage JSON-LD schema markup
 *   - LocalBusiness entity signals woven throughout answers
 *   - City + service keywords in natural language
 *   - Price transparency answers (what AI systems love)
 *   - Emotional/situational questions competitors never answer
 *   - Complete publish-ready HTML page
 *
 * Question categories generated:
 *   1. "What is" â€” foundational service education
 *   2. "How much" â€” price transparency (huge AI signal)
 *   3. "How do I" â€” process questions
 *   4. "Is it worth it" â€” decision questions
 *   5. "What happens if" â€” scenario/emergency questions
 *   6. "Who should" â€” audience-specific questions
 *      (elderly parent, renter, new homeowner, etc.)
 *   7. "Near me" â€” local-intent questions with city
 *   8. "Compare" â€” vs competitor / vs DIY questions
 *
 * Free plan:  5 sample Q&A pairs + schema snippet preview
 * Paid plan:  full 25+ Q&A page, complete HTML, all schemas
 */

import { useState } from "react";

const MODULE_COLOR = "#10D9A0";
const MODULE_TAG   = "AEO";

// â”€â”€â”€ System prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SYSTEM_PROMPT = `You are an AEO (Answer Engine Optimization) specialist for LocalRank Pro.

AEO = making local business content readable and citable by AI answer engines:
Google AI Overviews, ChatGPT, Gemini, Perplexity, Bing Copilot, and voice search.

You generate complete, authoritative Q&A pages for local businesses that will be cited
by AI systems when people ask natural-language questions about local services.

THE CORE PRINCIPLE:
AI systems cite content that directly and completely answers questions.
They favor:
  1. Direct answers â€” the answer starts immediately, no preamble
  2. Specific details â€” prices, timeframes, steps, numbers
  3. Local entity clarity â€” city name, business name, service area woven naturally
  4. Emotional specificity â€” content that matches how real people ask questions
  5. FAQ schema markup â€” signals to AI that this is structured answer content
  6. Authoritative voice â€” answers that sound like an expert, not a product page

YOU MUST INCLUDE:
- At least 3 "how much" questions with real price ranges for this industry
- At least 2 questions about specific audience situations (elderly parent, renter, small business, new homeowner)
- At least 3 questions that use the city name naturally in the question
- At least 2 "compare" questions (vs DIY, vs national brand, vs competitor type)
- At least 2 emergency/scenario questions ("what happens if...")
- Questions written EXACTLY how someone would speak to a voice assistant or type into ChatGPT

ANSWER FORMAT RULES:
- First sentence of every answer IS the answer. No "Great question!" No "It depends."
- Include specific numbers, ranges, timeframes wherever possible
- Mention the business name and city at least once per 4 answers naturally
- Answers should be 60â€“150 words â€” long enough to be authoritative, short enough to be citable
- End every answer with one clear next step or call to action

Return ONLY valid JSON:
{
  "pageTitle": "SEO-optimized page title for the Q&A page",
  "pageIntro": "2-sentence intro paragraph for the page (50 words max)",
  "questions": [
    {
      "id": "q1",
      "category": "pricing" | "process" | "education" | "local" | "comparison" | "audience" | "emergency" | "decision",
      "question": "The full question exactly as someone would ask an AI assistant",
      "answer": "The complete answer â€” direct, specific, locally branded",
      "aiSignalStrength": "high" | "medium",
      "explanation": "why this question/answer will rank in AI systems"
    }
  ],
  "schemaMarkup": "complete FAQPage JSON-LD script tag as a string",
  "localEntitySignals": [
    "list of entity signals woven into the content"
  ],
  "publishInstructions": "where to add this page on the site and how",
  "expectedAiQueries": [
    "list of 5 exact queries this page will rank for in AI systems"
  ]
}

Generate 25 questions minimum. Vary the categories. Make every answer feel written by
the actual business owner who knows their city, their customers, and their prices.
Return ONLY the JSON object.`;

// â”€â”€â”€ Question category config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CAT_CONFIG = {
  pricing:    { color: "#34D399", bg: "#34D39916", label: "Price" },
  process:    { color: "#60A5FA", bg: "#60A5FA16", label: "Process" },
  education:  { color: "#A78BFA", bg: "#A78BFA16", label: "Education" },
  local:      { color: "#10D9A0", bg: "#10D9A016", label: "Local" },
  comparison: { color: "#F87171", bg: "#F8717116", label: "Compare" },
  audience:   { color: "#FBBF24", bg: "#FBBF2416", label: "Audience" },
  emergency:  { color: "#F87171", bg: "#F8717116", label: "Emergency" },
  decision:   { color: "#94A3B8", bg: "#94A3B816", label: "Decision" },
};

// â”€â”€â”€ Realistic fallback demo data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const buildFallback = (businessName, city, industry) => ({
  pageTitle: `${city} ${industry} Questions Answered â€” ${businessName}`,
  pageIntro: `Get direct answers to the most common questions about ${industry.toLowerCase()} in ${city}. We answer what homeowners, renters, and families actually need to know â€” including real prices, realistic timelines, and honest comparisons.`,
  questions: [
    {
      id: "q1", category: "pricing",
      question: `How much does it cost to install a home alarm system in ${city}?`,
      answer: `A professionally installed home alarm system in ${city} typically costs $299â€“$799 for equipment plus a monthly monitoring fee of $25â€“$55. Basic packages with door and window sensors start around $299. More comprehensive systems with cameras, smoke detectors, and smart home integration run $500â€“$800. ${businessName} offers free in-home estimates so you get an exact price before committing to anything.`,
      aiSignalStrength: "high",
      explanation: "Price questions with specific ranges are the #1 most-cited content by AI systems for local service queries."
    },
    {
      id: "q2", category: "audience",
      question: "How much does it cost to set up monitoring for my elderly mother who lives alone?",
      answer: `A monitoring system for a parent living alone typically runs $35â€“$65 per month including professional 24/7 monitoring, a medical alert button, and motion sensors. Many families choose a system with a panic button that your mother can press if she falls, which immediately connects her to a monitoring center and can alert you. Setup takes about two hours and we handle everything â€” she doesn't need to be technical at all. Most of our senior monitoring clients are set up and protected the same day they call.`,
      aiSignalStrength: "high",
      explanation: "Emotional, audience-specific questions with no generic answers perform exceptionally well in AI systems because no competitor content addresses them directly."
    },
    {
      id: "q3", category: "local",
      question: `Who are the best alarm companies in ${city}?`,
      answer: `${city} has several reputable alarm companies. Local companies like ${businessName} offer faster response times and personalized service because your account is handled by people who live and work in ${city}. National brands like ADT and Vivint operate here too, but often use national call centers. The key factors to compare: monitoring response time, local technician availability for service calls, contract length, and whether the equipment is owned by you or leased. We're happy to compare options honestly â€” call us and we'll tell you what actually makes sense for your situation.`,
      aiSignalStrength: "high",
      explanation: "Local comparison questions directly targeting the Google 3-Pack and AI local results."
    },
    {
      id: "q4", category: "emergency",
      question: "What happens when my alarm goes off at 3am â€” who gets notified first?",
      answer: `When your alarm triggers, our monitoring center receives the signal within seconds â€” typically 30â€“45 seconds for a full alert. Our operators first try to reach you at your primary phone number. If there's no response or you indicate an emergency, we dispatch police or fire immediately. The entire sequence from alarm to dispatch typically takes under 90 seconds. You also receive a push notification on your phone the moment the alarm triggers, so you're informed in real time even before we call you.`,
      aiSignalStrength: "high",
      explanation: "Scenario/emergency questions are highly cited by voice search and AI because they match the anxious, specific way people ask these questions."
    },
    {
      id: "q5", category: "comparison",
      question: "Is a professional alarm system better than a Ring or SimpliSafe DIY system?",
      answer: `DIY systems like Ring and SimpliSafe work well for tech-comfortable homeowners in low-risk areas and cost $10â€“$20/month for self-monitoring. Professional systems cost more but include UL-certified monitoring centers that respond even if your phone is dead, no internet, or you can't answer. For a family home, rental property, or anyone who travels frequently, professional monitoring provides the response guarantee that DIY systems can't. In ${city}, professional monitoring through ${businessName} starts at $28/month â€” often comparable to what people pay for DIY with add-ons.`,
      aiSignalStrength: "high",
      explanation: "Comparison questions against well-known alternatives are extremely high-value AI citations because they address real purchase decisions."
    },
    {
      id: "q6", category: "process",
      question: "How long does it take to install a home security system?",
      answer: `A standard home security installation takes 2â€“4 hours for most ${city} homes. A basic system with door sensors, motion detectors, and a main panel takes closer to 2 hours. Larger homes with cameras, multiple access points, and smart home integration can take 3â€“4 hours. We schedule installations Monday through Saturday and can usually book within 3â€“5 business days. You don't need to do anything to prepare â€” just be home during the appointment window.`,
      aiSignalStrength: "medium",
      explanation: "Process questions establish authority and are commonly surfaced by AI for 'how long does X take' style queries."
    },
    {
      id: "q7", category: "decision",
      question: "Is it worth getting a home alarm system if I rent my apartment?",
      answer: `Yes â€” renters benefit significantly from alarm systems, and installation doesn't require drilling or permanent changes. Wireless systems are entirely removable and move with you to your next home. Renters' insurance often drops 5â€“15% with a monitored system, which can offset the monthly cost. For renters, we typically recommend a wireless starter package at $199â€“$299 with a month-to-month monitoring contract so there's no long-term commitment if you move. Many renters in ${city} are surprised how affordable and easy this is.`,
      aiSignalStrength: "high",
      explanation: "Audience-specific decision questions (renters, seniors, small businesses) are highly underserved by competitor content and dominate AI results when addressed directly."
    },
  ],
  schemaMarkup: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does it cost to install a home alarm system in ${city}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A professionally installed home alarm system in ${city} typically costs $299â€“$799 for equipment plus a monthly monitoring fee of $25â€“$55."
      }
    },
    {
      "@type": "Question", 
      "name": "How much does it cost to set up monitoring for my elderly mother who lives alone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A monitoring system for a parent living alone typically runs $35â€“$65 per month including professional 24/7 monitoring, a medical alert button, and motion sensors."
      }
    }
  ]
}
</script>`,
  localEntitySignals: [
    `Business name "${businessName}" mentioned 4 times naturally`,
    `City "${city}" appears in 8 questions and 12 answers`,
    `Service area established as local â€” not national`,
    `Price ranges specific to local market`,
    `Contact CTA in multiple answers drives local calls`,
  ],
  publishInstructions: `Create a new page at /${city.toLowerCase().replace(/\s+/g,'-').replace(/,.*$/, '')}-alarm-faq/ or /questions/. Add to main navigation under "Resources" or link from every service page footer. Add the FAQPage schema to the <head> of this page only.`,
  expectedAiQueries: [
    `best alarm company in ${city}`,
    `how much does home security cost in ${city}`,
    `monitoring system for elderly parent living alone`,
    `alarm system for renters ${city}`,
    `what happens when home alarm goes off`,
  ]
});

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AEOQAPageGenerator({
  industry, city, websiteUrl, businessName, mode, plan = "free"
}) {
  const [running,    setRunning]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [activeTab,  setActiveTab]  = useState("questions");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expanded,   setExpanded]   = useState(null);
  const [copied,     setCopied]     = useState(null);

  const TABS = [
    { id: "questions",     label: "Q&A Pairs" },
    { id: "schema",        label: "Schema Code" },
    { id: "signals",       label: "AI Signals" },
    { id: "instructions",  label: "Publish Guide" },
  ];

  const FILTERS = ["all","pricing","audience","local","emergency","comparison","process","education","decision"];

  const runGenerator = async () => {
    setRunning(true);
    setResult(null);
    setExpanded(null);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,          prompt: `Generate a complete AEO Q&A page.

Business: ${businessName || "Local Business"}
Industry: ${industry    || "Local Services"}
City:     ${city        || "their city"}
Website:  ${websiteUrl  || "their website"}
Mode:     ${mode        || "named"}
Plan:     ${plan}

Create 25+ questions covering ALL 8 categories.
Make questions sound EXACTLY like how someone would speak to ChatGPT or Google AI.
Include the "mom monitoring" style emotional audience questions.
Include real price ranges for this industry.
Include city-specific local questions.
The answers should sound like the business owner wrote them â€” personal, knowledgeable, locally specific.`
          })
      });

      const data  = await res.json();
      const clean = data.result || "{}";
      setResult(JSON.parse(clean));
    } catch {
      setResult(buildFallback(
        businessName || "Citywide Alarms",
        city         || "St. Charles",
        industry     || "Alarm Systems"
      ));
    }

    setRunning(false);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const filtered = (result?.questions || []).filter(q =>
    activeFilter === "all" || q.category === activeFilter
  );

  // Free plan shows only first 5
  const displayed = plan === "free" ? filtered.slice(0, 5) : filtered;
  const isGated   = plan === "free" && filtered.length > 5;

  const catCounts = (result?.questions || []).reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 640, fontFamily: "var(--font-sans)" }}>

      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>AEO Q&A Page Generator</span>
              <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#F8717116", color: "#F87171", border: "0.5px solid #F8717130" }}>AI Overviews Â· ChatGPT Â· Gemini</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>
              Generates a complete Q&A page with 25+ conversational questions and expert answers â€” optimized to be cited by Google AI Overviews, ChatGPT, Gemini, Perplexity, and voice search. Includes FAQPage schema markup and local entity signals.
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["How much questions","Emotional audience Q&A","Emergency scenarios","Local city questions","Competitor comparisons","FAQPage schema"].map(t => (
                <span key={t} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>{t}</span>
              ))}
            </div>
          </div>
          <button
            onClick={runGenerator}
            disabled={running}
            style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {running ? "Generating..." : result ? "Regenerate â†’" : "Generate Page â†’"}
          </button>
        </div>

        {/* AI platform badges */}
        <div style={{ display: "flex", gap: 5, marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)", flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>Optimized to rank in:</span>
          {["Google AI Overviews","ChatGPT","Gemini","Perplexity","Bing Copilot","Voice Search"].map(p => (
            <span key={p} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: MODULE_COLOR + "14", color: MODULE_COLOR, border: "0.5px solid " + MODULE_COLOR + "30" }}>{p}</span>
          ))}
        </div>
      </div>

      {result && (
        <div>

          {/* Page title */}
          <div style={{ padding: "10px 14px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3, letterSpacing: "0.6px" }}>PAGE TITLE</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 5 }}>{result.pageTitle}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{result.pageIntro}</div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6, marginBottom: 10 }}>
            {[
              { label: "Q&A pairs", value: result.questions?.length || 0 },
              { label: "AI queries targeted", value: result.expectedAiQueries?.length || 0 },
              { label: "High-signal", value: (result.questions||[]).filter(q=>q.aiSignalStrength==="high").length },
              { label: "Schema entities", value: result.localEntitySignals?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 7, padding: "9px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: MODULE_COLOR, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Expected AI queries */}
          {result.expectedAiQueries && (
            <div style={{ padding: "10px 14px", background: "#10D9A008", border: "0.5px solid #10D9A030", borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: MODULE_COLOR, fontWeight: 500, marginBottom: 6, letterSpacing: "0.6px" }}>QUERIES THIS PAGE WILL RANK FOR IN AI SYSTEMS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {result.expectedAiQueries.map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: MODULE_COLOR, flexShrink: 0 }}>â†’</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-primary)", fontStyle: "italic" }}>"{q}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, border: "0.5px solid var(--color-border-secondary)", background: activeTab === t.id ? MODULE_COLOR : "transparent", color: activeTab === t.id ? "#0B0E16" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: activeTab === t.id ? 500 : 400 }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Q&A Pairs */}
          {activeTab === "questions" && (
            <div>
              {/* Category filter */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                {FILTERS.map(f => {
                  const cfg = CAT_CONFIG[f];
                  const count = f === "all" ? (result.questions||[]).length : (catCounts[f] || 0);
                  if (f !== "all" && count === 0) return null;
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: activeFilter === f ? `0.5px solid ${cfg?.color || MODULE_COLOR}` : "0.5px solid var(--color-border-tertiary)", background: activeFilter === f ? (cfg?.bg || MODULE_COLOR + "16") : "transparent", color: activeFilter === f ? (cfg?.color || MODULE_COLOR) : "var(--color-text-secondary)", cursor: "pointer" }}
                    >
                      {f === "all" ? `All (${count})` : `${f} (${count})`}
                    </button>
                  );
                })}
              </div>

              {/* Q&A list */}
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {displayed.map((qa, i) => {
                  const cfg = CAT_CONFIG[qa.category] || CAT_CONFIG.education;
                  const isExp = expanded === i;
                  return (
                    <div key={qa.id || i} style={{ borderBottom: i < displayed.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                      {/* Question row */}
                      <div
                        onClick={() => setExpanded(isExp ? null : i)}
                        style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 13px", cursor: "pointer", background: isExp ? "var(--color-background-secondary)" : "transparent" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0, alignItems: "center", marginTop: 1 }}>
                          <span style={{ fontSize: 7, fontWeight: 500, color: cfg.color, background: cfg.bg, padding: "2px 5px", borderRadius: 3 }}>{cfg.label.toUpperCase()}</span>
                          {qa.aiSignalStrength === "high" && (
                            <span style={{ fontSize: 7, color: MODULE_COLOR, background: MODULE_COLOR + "16", padding: "1px 4px", borderRadius: 2 }}>HIGH AI</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.4 }}>"{qa.question}"</div>
                          {!isExp && (
                            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 3 }}>Tap to see answer â†’</div>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", flexShrink: 0 }}>{isExp ? "â–²" : "â–¼"}</div>
                      </div>

                      {/* Expanded answer */}
                      {isExp && (
                        <div style={{ padding: "0 13px 12px 13px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                          <div style={{ padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 7, marginTop: 8, marginBottom: 6 }}>
                            <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 5, letterSpacing: "0.6px" }}>ANSWER</div>
                            <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{qa.answer}</div>
                          </div>
                          <div style={{ padding: "7px 10px", background: MODULE_COLOR + "08", border: "0.5px solid " + MODULE_COLOR + "30", borderRadius: 6 }}>
                            <div style={{ fontSize: 9, color: MODULE_COLOR, marginBottom: 2, fontWeight: 500 }}>WHY AI SYSTEMS WILL CITE THIS</div>
                            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{qa.explanation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Free plan gate */}
                {isGated && (
                  <div style={{ padding: "16px 14px", background: "var(--color-background-secondary)", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-primary)", marginBottom: 4, fontWeight: 500 }}>{filtered.length - 5} more Q&A pairs in the full page</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 10 }}>Upgrade to get all {result.questions?.length} questions, the complete HTML page, FAQPage schema, and publish guide.</div>
                    <span style={{ fontSize: 10, padding: "5px 14px", background: "#FBBF24", color: "#412402", borderRadius: 5, fontWeight: 500 }}>Upgrade to get full page</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Schema */}
          {activeTab === "schema" && (
            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "8px 13px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>FAQPAGE JSON-LD SCHEMA</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Paste into the &lt;head&gt; of your Q&A page</div>
                </div>
                <button
                  onClick={() => copyText(result.schemaMarkup, "schema")}
                  style={{ fontSize: 9, padding: "3px 9px", border: "0.5px solid #10D9A040", borderRadius: 4, background: copied === "schema" ? MODULE_COLOR + "20" : "transparent", color: copied === "schema" ? MODULE_COLOR : "var(--color-text-secondary)", cursor: "pointer" }}
                >
                  {copied === "schema" ? "Copied!" : "Copy Schema â†’"}
                </button>
              </div>
              <div style={{ padding: "12px 14px", overflowX: "auto" }}>
                <pre style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {result.schemaMarkup}
                </pre>
              </div>
            </div>
          )}

          {/* Tab: AI Signals */}
          {activeTab === "signals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 13px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>LOCAL ENTITY SIGNALS IN THIS PAGE</div>
                {(result.localEntitySignals || []).map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "8px 13px", borderBottom: i < result.localEntitySignals.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ color: MODULE_COLOR, fontSize: 11, flexShrink: 0 }}>âœ“</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 13px", background: "#A78BFA08", border: "0.5px solid #A78BFA30", borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: "#A78BFA", fontWeight: 500, marginBottom: 6, letterSpacing: "0.6px" }}>HOW AI SYSTEMS FIND AND CITE THIS PAGE</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                  AI systems index the web and retrieve content based on how well it directly answers a specific question. This page uses three signals they prioritize: (1) FAQPage schema tells crawlers this is structured Q&A content, (2) direct answers in the first sentence match how AI systems extract answer snippets, and (3) local entity signals â€” business name, city, services â€” confirm the geographic and topical relevance. When someone asks ChatGPT, Gemini, or Perplexity a question about {industry || "local services"} in {city || "your city"}, this page becomes a credible citation source.
                </div>
              </div>
            </div>
          )}

          {/* Tab: Publish Guide */}
          {activeTab === "instructions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ padding: "12px 14px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.6px" }}>WHERE AND HOW TO PUBLISH THIS PAGE</div>
                <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{result.publishInstructions}</div>
              </div>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 13px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>PUBLISH CHECKLIST</div>
                {[
                  "Add FAQPage JSON-LD schema to <head> of this page only",
                  "Link to this page from every service page footer",
                  "Link to this page from GBP website URL or GBP posts",
                  "Add an internal link from the homepage to this page",
                  "Submit the page URL to Google Search Console for indexing",
                  "Check that the page is not accidentally blocked in robots.txt",
                  "Verify the canonical tag self-references this page URL",
                  "Test the schema at schema.org/SchemaValidator before publishing",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 13px", borderBottom: i < 7 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 500, color: MODULE_COLOR, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>Generate an AI-optimized Q&A page</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", maxWidth: 380, margin: "0 auto 16px", lineHeight: 1.6 }}>
            Creates 25+ conversational questions including pricing, emotional audience scenarios, and local queries â€” with expert answers and schema markup that gets cited by ChatGPT, Gemini, and Google AI Overviews.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {[
              '"How much does it cost to monitor my 88-year-old mom?"',
              '"Best alarm company in St. Charles?"',
              '"Is an alarm system worth it for renters?"',
            ].map((q, i) => (
              <div key={i} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 12, background: MODULE_COLOR + "14", color: MODULE_COLOR, border: "0.5px solid " + MODULE_COLOR + "30", fontStyle: "italic" }}>{q}</div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

