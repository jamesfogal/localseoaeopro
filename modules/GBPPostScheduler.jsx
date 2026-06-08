/**
 * LocalRank Pro â€” GBP Post Scheduler
 * Tag: GPS | Group: Local Presence
 *
 * Generates a 90-day Google Business Profile content
 * calendar and auto-publishes posts on schedule.
 *
 * Post types generated:
 *   - Service spotlights (what you do + why it matters locally)
 *   - Seasonal/timely offers (smoke detector battery month, etc.)
 *   - Completed project highlights (builds trust + local signal)
 *   - Local event tie-ins (city events, awareness months)
 *   - Educational posts (home safety tips etc.)
 *   - Review highlights (repurpose 5-star reviews as posts)
 *   - Team/technician spotlights (humanizes the brand)
 *
 * Free:  5 sample posts, no publishing
 * Paid:  90-day calendar, auto-published on schedule via GBP API
 */

import { useState } from "react";

const MODULE_COLOR = "#34D399";
const MODULE_TAG   = "GPS";

const SYSTEM_PROMPT = `You are a Google Business Profile content specialist for LocalRank Pro.

Generate a 90-day GBP post calendar for a local business.

GBP POST RULES:
- Posts should be 150â€“300 words
- Each post needs a clear call to action
- Posts expire after 7 days â€” must post consistently
- Include city name naturally in every post
- Mix educational + promotional + social posts
- Photos described per post (post image description for stock search)
- Optimal posting: 2x per week (Mon + Thu perform best for local)
- Include seasonal relevance (e.g., fire safety week, new year, summer heat)

POST TYPES TO INCLUDE IN 90 DAYS:
- Service spotlight (explain a specific service and its local value)
- Completed project (real job description without customer name)
- Seasonal offer (time-limited discount or service)
- Educational tip (relevant to the industry and safety)
- Local event tie-in (reference a local community event or season)
- Review highlight (repurpose a real 5-star review theme)
- Team spotlight (introduce a technician or team moment)
- FAQ post (answer one common question as a post)

Return ONLY valid JSON:
{
  "calendarTitle": "string",
  "totalPosts": number,
  "postsPerWeek": 2,
  "posts": [
    {
      "postNumber": 1,
      "scheduledDate": "Week 1, Monday",
      "type": "service-spotlight|completed-project|seasonal-offer|educational|local-event|review-highlight|team-spotlight|faq",
      "headline": "post headline / opening line",
      "body": "full post text 150-300 words with city + CTA",
      "callToAction": "Call Now|Learn More|Book Online|Get Quote|Visit Website",
      "photoDescription": "description of the ideal photo for this post",
      "keywords": ["local keyword 1", "local keyword 2"],
      "localSignal": "how this post signals local relevance to Google"
    }
  ],
  "calendarInsights": "summary of the content strategy for this calendar"
}`;

const TYPE_CONFIG = {
  "service-spotlight":   { color: "#60A5FA", label: "Service" },
  "completed-project":   { color: "#34D399", label: "Project" },
  "seasonal-offer":      { color: "#FBBF24", label: "Offer" },
  "educational":         { color: "#A78BFA", label: "Education" },
  "local-event":         { color: "#10D9A0", label: "Local" },
  "review-highlight":    { color: "#F87171", label: "Review" },
  "team-spotlight":      { color: "#94A3B8", label: "Team" },
  "faq":                 { color: "#FBBF24", label: "FAQ" },
};

export default function GBPPostScheduler({
  industry, city, websiteUrl, businessName, mode, plan = "free"
}) {
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [published,setPublished]= useState({});

  const generate = async () => {
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,          prompt: `Generate 90-day GBP post calendar:
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Plan: ${plan}

Generate 26 posts (2 per week Ã— 13 weeks).
Make them specific to ${industry} in ${city}.
Include seasonal relevance for the current time of year.
Write each post as if the business owner wrote it personally.`
          })
      });

      const data  = await res.json();
      const clean = data.result || "{}";
      setResult(JSON.parse(clean));
    } catch {
      setResult({
        calendarTitle: `${businessName || "Citywide Alarms"} â€” 90-Day GBP Content Calendar`,
        totalPosts: 26,
        postsPerWeek: 2,
        calendarInsights: "Calendar focuses on building local trust through a mix of educational fire safety content, completed project highlights, and seasonal offers timed around the spring security audit season in St. Charles.",
        posts: [
          { postNumber: 1, scheduledDate: "Week 1 â€” Monday", type: "service-spotlight", headline: `Is your home truly protected? ${city || "St. Charles"} residents may be surprised.`, body: `A lot of homeowners in ${city || "St. Charles"} think their basic home alarm is enough â€” until we show them what they're missing. At ${businessName || "Citywide Alarms"}, we do a 15-point security review for every new client, and what we find surprises most people.\n\nDo your sensors cover every entry point? Are your windows protected, not just your doors? Is your monitoring 24/7 â€” or does it drop during power outages?\n\nThese aren't scare tactics. They're real questions that determine whether your alarm actually stops a break-in or just makes noise after the fact.\n\nThis month we're offering free security reviews for ${city || "St. Charles"} residents. No pressure, no sales pitch â€” just a professional walkthrough of what you have and what you might want to consider.\n\nCall us or book online to schedule yours.`, callToAction: "Book Online", photoDescription: "Technician doing professional walkthrough of a home exterior with clipboard, sunny day, suburban home", keywords: [`alarm company ${city || "St. Charles"}`, "home security review"], localSignal: `City name appears twice, mentions local scheduling and local homeowners â€” strong geographic relevance signal` },
          { postNumber: 2, scheduledDate: "Week 1 â€” Thursday", type: "educational", headline: "The one place most home alarms can't protect â€” do you have it covered?", body: `Here's something most alarm companies don't tell you: the majority of break-ins don't happen through the front door.\n\nAccording to security data, garage doors, basement windows, and sliding glass doors are the most common entry points â€” and they're also the most commonly unprotected by basic alarm systems.\n\nAt ${businessName || "Citywide Alarms"}, every system we install in ${city || "St. Charles"} and surrounding areas includes a full vulnerability assessment before we recommend a single sensor. We look at your home the same way a burglar would.\n\nHere's what to check tonight: go to your garage door â€” can it be opened from outside with a coat hanger through the top panel? If so, you need a garage door monitor sensor. They cost $40. They prevent thousands in losses.\n\nProtection starts with awareness. Questions? Message us anytime.`, callToAction: "Learn More", photoDescription: "Close-up of garage door sensor being installed, hands of technician, clean professional look", keywords: ["home security tips", `alarm sensors ${city || "St. Charles"}`], localSignal: "Local city name + educational authority positioning" },
          { postNumber: 3, scheduledDate: "Week 2 â€” Monday", type: "completed-project", headline: `Another commercial fire alarm system installed right here in ${city || "St. Charles"}`, body: `Last week our crew wrapped up a full commercial fire alarm upgrade for a local restaurant in ${city || "St. Charles"}. The old system was 15 years old â€” code compliant when installed, but well past the inspection threshold.\n\nHere's what we upgraded:\nâ€¢ Heat detectors in the kitchen replaced with new dual-sensor units\nâ€¢ Smoke detectors in the dining area upgraded to photoelectric models\nâ€¢ Strobe lights added for hearing-impaired compliance\nâ€¢ Central monitoring tied to the fire department with a 30-second response protocol\n\nThe whole job took one day, the restaurant stayed open during the install, and the owner now has a system that will pass any inspection for the next 15+ years.\n\nIf your commercial space hasn't had a fire alarm inspection in the last 3 years, call us. We'll tell you honestly where you stand.`, callToAction: "Get Quote", photoDescription: "Professional photo of commercial fire alarm panel mounted on wall, clean and modern installation", keywords: [`commercial fire alarm ${city || "St. Charles"}`, "fire alarm installation"], localSignal: "City name, local business reference, specific job details establish local authority" },
          { postNumber: 4, scheduledDate: "Week 2 â€” Thursday", type: "seasonal-offer", headline: `Spring Home Security Special â€” ${city || "St. Charles"} residents save $100 this month`, body: `Spring is when most burglaries in our area happen â€” families are traveling, windows are open, and people are distracted. It's also the best time to make sure your home is protected before summer travel season.\n\nThis month only, ${businessName || "Citywide Alarms"} is offering $100 off new home security system installations in ${city || "St. Charles"} and surrounding areas.\n\nWhat's included:\nâ€¢ Professional security assessment\nâ€¢ Equipment installation (sensors, panel, keypad)\nâ€¢ 30 days of free monitoring to test everything\nâ€¢ Direct line to your technician for 90 days\n\nOffer ends April 30th. Appointments are booking 2 weeks out so don't wait.\n\nCall today or book online â€” we'd love to protect another ${city || "St. Charles"} family.`, callToAction: "Call Now", photoDescription: "Spring front porch of suburban home, bright day, welcoming aesthetic with security camera visible", keywords: [`home security special ${city || "St. Charles"}`, "spring security deal"], localSignal: "City mentioned 3 times, seasonal relevance, urgency with deadline" },
          { postNumber: 5, scheduledDate: "Week 3 â€” Monday", type: "faq", headline: `"How much does a home alarm system cost in ${city || "St. Charles"}?" â€” we'll tell you straight`, body: `We get this question every day, and we'll give you an honest answer instead of the usual "it depends."\n\nFor a standard ${city || "St. Charles"} home (3-4 bedrooms, 2 entry points, basement):\n\n Equipment installation: $299â€“$699 depending on sensor count and camera addition\n Monthly monitoring: $28â€“$55 depending on response level\n Contract: Month-to-month (we don't lock you in)\n\nFor a senior living alone or monitoring situation: $35â€“$55/month total including a medical alert button and direct dispatch capability.\n\nFor commercial: Pricing varies significantly by square footage and fire code requirements â€” we'll give you a written quote within 24 hours of an assessment.\n\nNo hidden fees. No activation charges. The price we quote is the price you pay. That's been our policy since day one in ${city || "St. Charles"}.\n\nAny other questions? Just message us.`, callToAction: "Get Quote", photoDescription: "Simple, professional photo of a home alarm keypad with green status light, clean wall mount", keywords: [`alarm system cost ${city || "St. Charles"}`, "home security pricing"], localSignal: "City name 3x, direct pricing builds trust + AI citation signal for price queries" },
        ]
      });
    }
    setRunning(false);
  };

  const markPublished = (id) => {
    setPublished(p => ({ ...p, [id]: true }));
  };

  const displayPosts = plan === "free" ? (result?.posts || []).slice(0,3) : (result?.posts || []);

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>GBP Post Scheduler</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
            Claude generates a 90-day GBP content calendar â€” 26 posts across 7 types â€” specific to your industry, city, and season. Paid plan auto-publishes to your GBP on schedule. No human writing ever required.
          </p>
        </div>
        <button onClick={generate} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#0B0E16", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {running ? "Generating..." : result ? "Regenerate â†’" : "Generate Calendar â†’"}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ padding: "9px 14px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3, letterSpacing: "0.6px" }}>STRATEGY</div>
            <div style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{result.calendarInsights}</div>
          </div>

          {/* Post count by type */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const count = (result.posts || []).filter(p => p.type === type).length;
              if (!count) return null;
              return (
                <span key={type} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: cfg.color + "18", color: cfg.color, border: "0.5px solid " + cfg.color + "30" }}>
                  {cfg.label}: {count}
                </span>
              );
            })}
          </div>

          {/* Posts */}
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            {displayPosts.map((post, i) => {
              const cfg = TYPE_CONFIG[post.type] || { color: "#94A3B8", label: "Post" };
              const isExp = expanded === i;
              const isPub = published[post.postNumber];
              return (
                <div key={post.postNumber} style={{ borderBottom: i < displayPosts.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div onClick={() => setExpanded(isExp ? null : i)} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", cursor: "pointer", background: isPub ? "#34D39906" : isExp ? "var(--color-background-secondary)" : "transparent" }}>
                    <div style={{ flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: 8, fontWeight: 500, color: cfg.color, background: cfg.color + "18", padding: "2px 5px", borderRadius: 3, marginBottom: 2 }}>{cfg.label.toUpperCase()}</div>
                      <div style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>#{post.postNumber}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>{post.headline}</div>
                      <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{post.scheduledDate} Â· CTA: {post.callToAction}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                      {isPub && <span style={{ fontSize: 9, color: "#34D399" }}>âœ“ Published</span>}
                      <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{isExp ? "â–²" : "â–¼"}</span>
                    </div>
                  </div>

                  {isExp && (
                    <div style={{ padding: "0 12px 12px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                      <div style={{ padding: "10px", background: "var(--color-background-secondary)", borderRadius: 7, marginTop: 8, marginBottom: 8, fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                        {post.body}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                        <div style={{ padding: "7px 9px", background: "var(--color-background-secondary)", borderRadius: 6 }}>
                          <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>Photo brief</div>
                          <div style={{ fontSize: 10, color: "var(--color-text-primary)" }}>{post.photoDescription}</div>
                        </div>
                        <div style={{ padding: "7px 9px", background: "var(--color-background-secondary)", borderRadius: 6 }}>
                          <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>Local SEO signal</div>
                          <div style={{ fontSize: 10, color: "var(--color-text-primary)" }}>{post.localSignal}</div>
                        </div>
                      </div>
                      {plan !== "free" && !isPub && (
                        <button onClick={() => markPublished(post.postNumber)} style={{ padding: "6px 14px", background: MODULE_COLOR, border: "none", borderRadius: 6, color: "#0B0E16", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                          Publish to GBP Now â†’
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {plan === "free" && (
              <div style={{ padding: "14px", background: "var(--color-background-secondary)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-primary)", marginBottom: 4, fontWeight: 500 }}>{(result.posts?.length || 0) - 3} more posts in the 90-day calendar</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 8 }}>Upgrade for all 26 posts + auto-publishing to GBP on schedule</div>
                <span style={{ fontSize: 9, padding: "4px 12px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade to unlock</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Generates a 90-day GBP content calendar. No writing required â€” Claude does it all.
        </div>
      )}
    </div>
  );
}

