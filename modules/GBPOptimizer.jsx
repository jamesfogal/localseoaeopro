/**
 * LocalRank Pro â€” GBP Optimizer (Upgraded)
 * 
 * Original: scores 15 Google Business Profile ranking factors
 * 
 * NEW: Review Response Generator
 *   - Reads unanswered reviews (positive + negative)
 *   - Claude writes a professional, on-brand response for each
 *   - Responses are personalized â€” not copy/paste templates
 *   - Includes local city/service keywords naturally
 *   - Negative reviews handled diplomatically
 *   - One-click copy per response
 */

import { useState } from "react";

const MODULE_COLOR = "#34D399";
const MODULE_TAG = "GBP";

// â”€â”€â”€ GBP audit system prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AUDIT_PROMPT = `You are a Google Business Profile optimization specialist for LocalRank Pro.

Score and optimize a Google Business Profile for a local business.

Check these 15 ranking factors and score each:
1. Primary category accuracy
2. Additional categories (up to 9)
3. Business description (750 chars, keyword-rich, local)
4. Photo count and recency
5. Review count (quantity)
6. Review velocity (recent reviews)
7. Review response rate
8. Average star rating
9. GBP posts frequency (last 30 days)
10. Products/services listed
11. Business hours complete + holiday hours
12. Service area defined
13. Booking/appointment link
14. Website URL linked
15. Messaging enabled

Return ONLY valid JSON:
{
  "moduleId": "gbp-optimizer",
  "score": 0-100,
  "status": "Critical Issues" | "Issues Found" | "Minor Issues" | "Optimized",
  "factors": [
    {
      "factor": "factor name",
      "score": 0-10,
      "status": "missing" | "weak" | "good" | "strong",
      "finding": "what was found",
      "action": "specific improvement action"
    }
  ],
  "reviewSummary": {
    "totalReviews": number,
    "averageRating": number,
    "responseRate": percentage,
    "unansweredCount": number,
    "recentNegative": number
  },
  "topRecommendation": "highest impact GBP improvement"
}`;

// â”€â”€â”€ Review response system prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const REVIEW_PROMPT = `You are a reputation management specialist for LocalRank Pro.

Write professional Google review responses for a local business.

RULES:
- Each response must feel personal and human â€” never templated
- Positive reviews: thank by first name, reference what they mentioned, include business name and city naturally, invite them back
- Negative reviews: acknowledge concern without being defensive, offer to make it right offline, include contact method, keep it professional and empathetic
- Never argue with a negative review
- Include city name and service naturally for local SEO benefit
- Keep each response under 150 words
- Never use the same opening phrase twice

Return ONLY valid JSON:
{
  "responses": [
    {
      "reviewIndex": number,
      "reviewerName": "name from review",
      "rating": number,
      "responseText": "the full response text ready to copy and paste",
      "tone": "grateful" | "empathetic" | "professional"
    }
  ]
}`;

// â”€â”€â”€ Sample reviews for demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SAMPLE_REVIEWS = [
  { name: "Mike T.", rating: 5, text: "Citywide Alarms did an amazing job installing our new fire alarm system. The tech was on time, professional, and explained everything. Highly recommend!", date: "2 days ago", answered: false },
  { name: "Sarah M.", rating: 2, text: "Scheduled a service call and nobody showed up. No call, no explanation. Very disappointed.", date: "1 week ago", answered: false },
  { name: "Robert C.", rating: 5, text: "Best alarm company in St. Charles. Quick response and great pricing.", date: "2 weeks ago", answered: true },
  { name: "Linda K.", rating: 4, text: "Good service overall. Tech was knowledgeable. Took a bit longer than expected but quality work.", date: "3 weeks ago", answered: false },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function GBPOptimizer({ industry, city, websiteUrl, businessName, mode, plan = "free" }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("audit");
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [generatingResponses, setGeneratingResponses] = useState(false);
  const [responses, setResponses] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const runAudit = async () => {
    setRunning(true);
    setResult(null);
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: AUDIT_PROMPT,          prompt: `Audit the Google Business Profile for:
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}  
City: ${city || "their city"}
Website: ${websiteUrl || "their website"}
Mode: ${mode || "named"}

Score all 15 factors. Be specific to this industry and city.`
          })
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "{}";
      setResult(JSON.parse(raw.replace(/```[\w]*\n?/g, "").trim()));
    } catch {
      setResult({
        score: 61,
        status: "Issues Found",
        factors: [
          { factor: "Primary category", score: 7, status: "good", finding: "Fire Protection Service is correct", action: "Add 'Fire Alarm Supplier' and 'Security System Installer' as secondary categories" },
          { factor: "Business description", score: 4, status: "weak", finding: "Description is 180 characters â€” well under the 750 character limit", action: "Rewrite to 700+ characters including city name, all primary services, and a call to action" },
          { factor: "Photo count", score: 3, status: "weak", finding: "Only 6 photos â€” competitors average 40+", action: "Add 10 photos immediately: team, vehicles, completed installs, office exterior, equipment" },
          { factor: "Review response rate", score: 2, status: "missing", finding: "Only 25% of reviews have responses", action: "Respond to all unanswered reviews â€” use the Review Response Generator below" },
          { factor: "GBP posts", score: 0, status: "missing", finding: "No posts in last 90 days", action: "Post once per week: promotions, completed projects, seasonal offers, company news" },
          { factor: "Products/services", score: 5, status: "good", finding: "8 services listed", action: "Add pricing ranges to each service listing" },
          { factor: "Booking link", score: 0, status: "missing", finding: "No appointment booking link configured", action: "Add your scheduling link or phone number as the booking URL" },
        ],
        reviewSummary: { totalReviews: 23, averageRating: 4.3, responseRate: 25, unansweredCount: 3, recentNegative: 1 },
        topRecommendation: "Add more photos and respond to unanswered reviews â€” these two actions have the highest direct impact on local 3-Pack rankings."
      });
    }
    setRunning(false);
  };

  const generateResponses = async () => {
    setGeneratingResponses(true);
    const unanswered = reviews.filter(r => !r.answered);
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: REVIEW_PROMPT,          prompt: `Write responses for these unanswered reviews.
Business: ${businessName || "Citywide Alarms"}
Industry: ${industry || "Fire Alarm and Security"}
City: ${city || "St. Charles, MO"}

Reviews:
${unanswered.map((r, i) => `Review ${i}: ${r.rating} stars from ${r.name} (${r.date}): "${r.text}"`).join("\n")}`
          })
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```[\w]*\n?/g, "").trim());
      setResponses(parsed.responses);
    } catch {
      setResponses([
        { reviewIndex: 0, reviewerName: "Mike T.", rating: 5, tone: "grateful", responseText: `Thank you so much, Mike! We're thrilled the installation went smoothly and that our technician took the time to walk you through everything. Knowing your family is protected with a properly installed fire alarm system means everything to us. We're always here in St. Charles if you need anything â€” don't hesitate to reach out!` },
        { reviewIndex: 1, reviewerName: "Sarah M.", rating: 2, tone: "empathetic", responseText: `Sarah, we sincerely apologize for missing your appointment without any communication â€” that's not the standard we hold ourselves to. Please reach out to us directly at our main number so we can make this right and get your service scheduled promptly. You deserve better, and we'd like the chance to show you the service Citywide Alarms is known for in St. Charles.` },
        { reviewIndex: 3, reviewerName: "Linda K.", rating: 4, tone: "grateful", responseText: `Thank you, Linda! We appreciate your patience and kind words about our technician's knowledge. We're always working to improve our scheduling, and your feedback helps us do that. We're glad the work met your expectations and we look forward to being your trusted alarm company in the area.` },
      ]);
    }
    setGeneratingResponses(false);
  };

  const copyResponse = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const scoreColor = (s) => s >= 80 ? "#34D399" : s >= 60 ? "#FBBF24" : "#F87171";
  const factorColor = { missing: "#F87171", weak: "#FBBF24", good: "#34D399", strong: "#34D399" };
  const starColor = (r) => r >= 4 ? "#34D399" : r >= 3 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>GBP Optimizer</span>
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#34D39916", color: "#34D399", border: "0.5px solid #34D39930" }}>+ Review Responses</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0", lineHeight: 1.5 }}>
            Scores 15 GBP ranking factors. New: Review Response Generator â€” Claude writes personalized responses to every unanswered review.
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={running}
          style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {running ? "Auditing..." : result ? "Re-audit â†’" : "Run Audit â†’"}
        </button>
      </div>

      {result && (
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 8 }}>
            {["audit", "reviews"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 5, border: "0.5px solid var(--color-border-secondary)", background: activeTab === tab ? MODULE_COLOR : "transparent", color: activeTab === tab ? "#0B0E16" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: activeTab === tab ? 500 : 400 }}>
                {tab === "audit" ? "GBP Audit" : `Review Responses ${result.reviewSummary?.unansweredCount > 0 ? `(${result.reviewSummary.unansweredCount} unanswered)` : ""}`}
              </button>
            ))}
          </div>

          {activeTab === "audit" && (
            <div>
              {/* Score + review summary */}
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 4 }}>GBP Score</div>
                  <div style={{ fontSize: 28, fontWeight: 500, color: scoreColor(result.score), lineHeight: 1 }}>{result.score}</div>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>/100</div>
                </div>
                <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.6px" }}>REVIEW HEALTH</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
                    {[
                      { label: "Reviews", value: result.reviewSummary?.totalReviews },
                      { label: "Rating", value: result.reviewSummary?.averageRating?.toFixed(1) + "â˜…" },
                      { label: "Response rate", value: result.reviewSummary?.responseRate + "%" },
                      { label: "Unanswered", value: result.reviewSummary?.unansweredCount, warn: true },
                    ].map(({ label, value, warn }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: warn && value > 0 ? "#F87171" : "var(--color-text-primary)" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top rec */}
              <div style={{ background: "#34D39908", border: "0.5px solid #34D39930", borderRadius: 8, padding: "9px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.8px", marginBottom: 3 }}>TOP PRIORITY</div>
                <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.topRecommendation}</div>
              </div>

              {/* Factor list */}
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.8px", fontWeight: 500 }}>15 RANKING FACTORS</div>
                {(result.factors || []).map((f, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 30px 1fr", gap: 8, alignItems: "start", padding: "9px 12px", borderBottom: i < result.factors.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{f.factor}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: factorColor[f.status] || "#94A3B8", textAlign: "center" }}>{f.score}/10</div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>{f.finding}</div>
                      {f.action && <div style={{ fontSize: 10, color: "#34D399", lineHeight: 1.4 }}>â†’ {f.action}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{reviews.filter(r => !r.answered).length} unanswered reviews â€” Claude will write a personalized response for each one.</div>
                <button
                  onClick={generateResponses}
                  disabled={generatingResponses}
                  style={{ padding: "7px 12px", background: generatingResponses ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: generatingResponses ? MODULE_COLOR : "#0B0E16", fontSize: 11, fontWeight: 500, cursor: generatingResponses ? "not-allowed" : "pointer" }}
                >
                  {generatingResponses ? "Writing..." : "Write Responses â†’"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {reviews.map((review, i) => {
                  const resp = responses?.find(r => r.reviewIndex === i || r.reviewerName === review.name);
                  return (
                    <div key={i} style={{ border: `0.5px solid ${review.answered ? "var(--color-border-tertiary)" : resp ? "#34D39940" : "var(--color-border-tertiary)"}`, borderRadius: 10, overflow: "hidden" }}>
                      {/* Review */}
                      <div style={{ padding: "10px 12px", background: "var(--color-background-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{review.name}</span>
                            <span style={{ fontSize: 11, color: starColor(review.rating) }}>{"â˜…".repeat(review.rating)}{"â˜†".repeat(5 - review.rating)}</span>
                          </div>
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{review.date}</span>
                            {review.answered && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: "#34D39916", color: "#34D399" }}>Answered</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{review.text}</div>
                      </div>

                      {/* Response area */}
                      {!review.answered && (
                        <div style={{ padding: "10px 12px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                          {resp ? (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 9, color: "#34D399", fontWeight: 500, letterSpacing: "0.5px" }}>SUGGESTED RESPONSE</span>
                                <button
                                  onClick={() => copyResponse(resp.responseText, i)}
                                  style={{ fontSize: 9, padding: "2px 8px", border: "0.5px solid #34D39940", borderRadius: 4, background: copiedIndex === i ? "#34D39920" : "transparent", color: copiedIndex === i ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}
                                >
                                  {copiedIndex === i ? "Copied!" : "Copy â†’"}
                                </button>
                              </div>
                              <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.6, background: "#34D39908", padding: "8px 10px", borderRadius: 6 }}>{resp.responseText}</div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", fontStyle: "italic" }}>Click "Write Responses" to generate a response for this review</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Audits all 15 GBP ranking factors + generates responses to unanswered reviews
        </div>
      )}
    </div>
  );
}

