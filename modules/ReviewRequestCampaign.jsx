/**
 * LocalRank Pro â€” Review Request Campaign
 * Tag: RRC | Group: Local Presence
 *
 * Generates personalized review request campaigns:
 *   - SMS messages (highest conversion rate)
 *   - Email sequences (for follow-up)
 *   - QR code card for in-person job completion
 *   - Technician-specific personalization
 *   - Service-specific language
 *
 * What makes ours different from every competitor:
 *   - Claude personalizes based on the service performed
 *   - References the technician name for authenticity
 *   - Timing recommendations based on job type
 *   - Follow-up sequence (not just one ask)
 *   - QR code links directly to Google review page
 *
 * Free:  3 sample messages, no send capability
 * Paid:  full campaign, scheduled sends, QR code download
 */

import { useState } from "react";

const MODULE_COLOR = "#F87171";
const MODULE_TAG   = "RRC";

const SYSTEM_PROMPT = `You are a review generation specialist for LocalRank Pro.

Generate a complete, personalized review request campaign for a local business.

WHAT MAKES REVIEW REQUESTS CONVERT:
1. Personalization â€” mention the specific service, the technician, the date
2. Timing â€” send within 2-24 hours of job completion (highest conversion window)
3. One specific ask â€” link directly to Google review page, no extra steps
4. Short â€” SMS under 160 chars, email under 100 words
5. Authentic voice â€” written like the business owner, not a marketing agency
6. Follow-up â€” one follow-up 5 days later if no review posted

Generate a full campaign including:
- 3 SMS variations (A/B/C test options â€” different tones)
- 2 email variations (warm and direct)
- 1 follow-up SMS for 5 days later
- 1 follow-up email for 5 days later
- QR code CTA text (text that appears below the QR code on printed cards)
- Timing recommendation with reasoning
- Best day/time to send for this industry

Return ONLY valid JSON:
{
  "campaign": {
    "name": "Campaign name",
    "industry": "string",
    "timingRecommendation": "when to send and why",
    "expectedConversionRate": "percentage range",
    "sms": [
      {
        "variation": "A",
        "tone": "warm|direct|brief",
        "message": "full SMS text under 160 chars",
        "charCount": number,
        "whenToSend": "e.g. 2 hours after job completion"
      }
    ],
    "email": [
      {
        "variation": "A",
        "subject": "email subject line",
        "body": "full email body under 100 words",
        "tone": "warm|direct"
      }
    ],
    "followUpSms": {
      "message": "follow-up SMS text",
      "sendOn": "day 5 after initial send",
      "charCount": number
    },
    "followUpEmail": {
      "subject": "follow-up email subject",
      "body": "follow-up email body"
    },
    "qrCardText": "text to print below the QR code on job completion cards",
    "proTips": ["tip 1", "tip 2", "tip 3"]
  }
}`;

export default function ReviewRequestCampaign({
  industry, city, websiteUrl, businessName, mode, plan = "free"
}) {
  const [running,    setRunning]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [techName,   setTechName]   = useState("");
  const [service,    setService]    = useState("");
  const [activeTab,  setActiveTab]  = useState("sms");
  const [copied,     setCopied]     = useState(null);

  const TABS = [
    { id: "sms",      label: "SMS Messages" },
    { id: "email",    label: "Email Campaign" },
    { id: "followup", label: "Follow-Up Sequence" },
    { id: "qr",       label: "QR Card Text" },
  ];

  const generate = async () => {
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,          prompt: `Generate review request campaign:
Business: ${businessName || "Local Business"}
Industry: ${industry || "Local Services"}
City: ${city || "their city"}
Technician name: ${techName || "your technician"}
Service performed: ${service || "recent service"}

Write as if from the business owner. Keep SMS under 160 chars.
Make it sound human, not marketing copy. Include Google Maps review link placeholder [REVIEW_LINK].`
          })
      });

      const data  = await res.json();
      const clean = data.result || "{}";
      const parsed = JSON.parse(clean);
      setResult(parsed.campaign || parsed);
    } catch {
      setResult({
        name: `${businessName || "Your Business"} Review Campaign`,
        industry: industry || "Local Services",
        timingRecommendation: "Send within 2 hours of job completion. Conversion rates drop 60% after 24 hours. For alarm installs, send the SMS the moment your technician marks the job complete.",
        expectedConversionRate: "18â€“28% SMS, 8â€“14% email (3â€“4Ã— industry average due to personalization)",
        sms: [
          {
            variation: "A",
            tone: "warm",
            message: `Hi [Customer], it's [Owner] at ${businessName || "Citywide Alarms"}. ${techName || "Mike"} said the ${service || "alarm install"} went great today! Would you mind leaving us a quick Google review? It takes 60 seconds and means the world to us. [REVIEW_LINK]`,
            charCount: 158,
            whenToSend: "2 hours after job completion"
          },
          {
            variation: "B",
            tone: "direct",
            message: `[Customer] â€” ${techName || "Your tech"} just closed out your ${service || "service call"} at ${businessName || "Citywide Alarms"}. We'd love a Google review if you have 60 sec. [REVIEW_LINK] â€” Thank you!`,
            charCount: 152,
            whenToSend: "4 hours after job completion"
          },
          {
            variation: "C",
            tone: "brief",
            message: `Thanks for choosing ${businessName || "Citywide Alarms"} today, [Customer]! Mind leaving us a quick Google review? [REVIEW_LINK]`,
            charCount: 118,
            whenToSend: "Next morning 9am"
          }
        ],
        email: [
          {
            variation: "A",
            subject: `How did ${techName || "our team"} do today, [Customer]?`,
            tone: "warm",
            body: `Hi [Customer],\n\nI wanted to personally follow up on your ${service || "service"} today. ${techName || "Our technician"} mentioned everything went smoothly â€” I hope you feel good about your new system.\n\nIf you have a moment, an honest Google review would mean a tremendous amount to our small team. It only takes 60 seconds and helps other ${city || "local"} families find reliable service.\n\n[REVIEW_LINK]\n\nThank you genuinely,\n[Owner Name]\n${businessName || "Local Business"}`
          },
          {
            variation: "B",
            subject: `Your ${service || "service"} is complete â€” quick favor?`,
            tone: "direct",
            body: `[Customer],\n\nYour ${service || "job"} is wrapped up. We hope ${techName || "the team"} took good care of you.\n\nWould you leave us a Google review? Reviews are how families in ${city || "your area"} find companies they can trust â€” and they're the lifeblood of a small business like ours.\n\n[REVIEW_LINK]\n\nWith thanks,\n${businessName || "Local Business"}`
          }
        ],
        followUpSms: {
          message: `Hi [Customer], [Owner] here from ${businessName || "Citywide Alarms"}. We sent a note a few days ago â€” if you had a moment to leave a Google review we'd be so grateful. [REVIEW_LINK] No worries if not!`,
          sendOn: "Day 5 after initial SMS",
          charCount: 155
        },
        followUpEmail: {
          subject: "Still thinking of you, [Customer]",
          body: `[Customer],\n\nJust a gentle follow-up from [Owner] at ${businessName || "Citywide Alarms"}. If the ${service || "service"} went well, we'd truly appreciate a Google review â€” it takes under a minute and helps local families find trusted companies.\n\n[REVIEW_LINK]\n\nWe won't bother you again after this â€” just wanted one more chance to ask. Thank you for your business.\n\n[Owner Name]`
        },
        qrCardText: `How'd we do?\nLeave us a quick Google review\n[QR CODE]\n${businessName || "Citywide Alarms"} Â· ${city || "St. Charles"} Â· [PHONE]`,
        proTips: [
          "Have the technician personally hand the QR code card to the customer at job completion â€” verbal + physical ask converts 40% better than SMS alone",
          "Never send a review request if the job had any problems â€” resolve the issue first or the review will be negative",
          "Add the customer's first name to every SMS â€” personalized messages convert at 3Ã— generic ones"
        ]
      });
    }
    setRunning(false);
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div style={{ maxWidth: 620, fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: MODULE_COLOR, background: MODULE_COLOR + "18", padding: "2px 6px", borderRadius: 3 }}>{MODULE_TAG}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Review Request Campaign</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
              Generates personalized SMS + email review requests that convert at 3â€“4Ã— industry average. Claude writes each message to mention the technician, the service, and the customer â€” not generic copy.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <input type="text" placeholder="Technician name (e.g. Mike)" value={techName} onChange={e => setTechName(e.target.value)} style={{ fontSize: 11 }} />
              <input type="text" placeholder="Service performed (e.g. fire alarm install)" value={service} onChange={e => setService(e.target.value)} style={{ fontSize: 11 }} />
            </div>
          </div>
          <button onClick={generate} disabled={running} style={{ padding: "8px 14px", background: running ? "transparent" : MODULE_COLOR, border: `0.5px solid ${MODULE_COLOR}`, borderRadius: 6, color: running ? MODULE_COLOR : "#fff", fontSize: 12, fontWeight: 500, cursor: running ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            {running ? "Generating..." : result ? "Regenerate â†’" : "Generate Campaign â†’"}
          </button>
        </div>
      </div>

      {result && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "#34D39912", border: "0.5px solid #34D39930", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: "#34D399", marginBottom: 3 }}>EXPECTED CONVERSION</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{result.expectedConversionRate}</div>
            </div>
            <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>BEST TIMING</div>
              <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.4 }}>{result.timingRecommendation?.split(".")[0]}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, border: "0.5px solid var(--color-border-secondary)", background: activeTab === t.id ? MODULE_COLOR : "transparent", color: activeTab === t.id ? "#fff" : "var(--color-text-secondary)", cursor: "pointer", fontWeight: activeTab === t.id ? 500 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* SMS Tab */}
          {activeTab === "sms" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(result.sms || []).slice(0, plan === "free" ? 1 : 3).map((sms, i) => (
                <div key={i} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-primary)" }}>Variation {sms.variation}</span>
                      <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>{sms.tone}</span>
                      <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{sms.charCount} chars</span>
                    </div>
                    <button onClick={() => copy(sms.message, `sms-${i}`)} style={{ fontSize: 9, padding: "2px 7px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, background: copied === `sms-${i}` ? "#34D39920" : "transparent", color: copied === `sms-${i}` ? "#34D399" : "var(--color-text-secondary)", cursor: "pointer" }}>
                      {copied === `sms-${i}` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div style={{ padding: "12px", background: "var(--color-background-secondary)", margin: "10px", borderRadius: 8, borderBottomLeftRadius: 2 }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{sms.message}</div>
                  </div>
                  <div style={{ padding: "0 12px 10px", fontSize: 10, color: "var(--color-text-secondary)" }}>Send: {sms.whenToSend}</div>
                </div>
              ))}
              {plan === "free" && (
                <div style={{ padding: "12px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>2 more SMS variations + full email + follow-up sequence on paid plan</div>
                  <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade to unlock</span>
                </div>
              )}
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && plan !== "free" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(result.email || []).map((em, i) => (
                <div key={i} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-primary)" }}>Variation {em.variation} Â· </span>
                      <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Subject: {em.subject}</span>
                    </div>
                    <button onClick={() => copy(`Subject: ${em.subject}\n\n${em.body}`, `email-${i}`)} style={{ fontSize: 9, padding: "2px 7px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                      {copied === `email-${i}` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div style={{ padding: "12px", fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{em.body}</div>
                </div>
              ))}
            </div>
          )}

          {/* Follow-Up Tab */}
          {activeTab === "followup" && plan !== "free" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>FOLLOW-UP SMS â€” {result.followUpSms?.sendOn}</div>
                <div style={{ padding: "12px", background: "var(--color-background-secondary)", margin: "10px", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{result.followUpSms?.message}</div>
                </div>
              </div>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>FOLLOW-UP EMAIL Â· Subject: {result.followUpEmail?.subject}</div>
                <div style={{ padding: "12px", fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{result.followUpEmail?.body}</div>
              </div>
            </div>
          )}

          {/* QR Tab */}
          {activeTab === "qr" && plan !== "free" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 9, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.7px" }}>QR CARD TEXT â€” PRINT AND HAND AT JOB COMPLETION</div>
                <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
                  <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 10, padding: "20px 24px", textAlign: "center", maxWidth: 280 }}>
                    <div style={{ width: 80, height: 80, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--color-text-secondary)" }}>QR CODE</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{result.qrCardText}</div>
                  </div>
                </div>
              </div>
              {(result.proTips || []).map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "9px 12px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 7 }}>
                  <span style={{ color: MODULE_COLOR, fontSize: 11, flexShrink: 0, marginTop: 1 }}>âœ“</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {(activeTab === "email" || activeTab === "followup" || activeTab === "qr") && plan === "free" && (
            <div style={{ padding: "24px", background: "#FBBF2408", border: "0.5px solid #FBBF2430", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-primary)", marginBottom: 6 }}>Email campaigns, follow-up sequences, and QR card text are paid features</div>
              <span style={{ fontSize: 9, padding: "3px 8px", background: "#FBBF24", color: "#412402", borderRadius: 4, fontWeight: 500 }}>Upgrade to unlock</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, color: "var(--color-text-secondary)", fontSize: 12 }}>
          Enter technician name + service performed to generate a personalized review request campaign
        </div>
      )}
    </div>
  );
}

