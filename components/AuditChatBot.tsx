"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type MsgType = "text" | "typing" | "chips" | "countdown" | "result-card" | "qa-answer";
type MsgFrom = "bot" | "user";

interface Msg {
  id: string;
  from: MsgFrom;
  type: MsgType;
  text?: string;
  chips?: string[];
  auditData?: AuditResult;
}

interface AuditResult {
  reportId?: string;
  mobileScore?: number;
  desktopScore?: number;
  passesOneSecond?: boolean;
  ttfb?: number;
  lcp?: number;
  cms?: string;
  hosting?: string;
  topIssues?: string[];
  city?: string;
  industry?: string;
  url?: string;
  error?: string;
  duplicate?: boolean;
  limit?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  "Security Systems","HVAC","Plumbing","Electrical","Legal Services",
  "Medical / Healthcare","Dental","Restaurant / Food Service",
  "Retail","Home Services","Real Estate","Auto Services","Other",
];

const AUDIT_SIGNALS = [
  "Mobile performance score","Desktop performance score","Server response time (TTFB)",
  "Largest Contentful Paint (LCP)","First Contentful Paint (FCP)","Cumulative Layout Shift (CLS)",
  "Interaction to Next Paint (INP)","Total Blocking Time (TBT)","Total page size",
  "Total network requests","1-second load test","Image count & WebP status",
  "Lazy loading detection","Largest image size","Render-blocking scripts",
  "Unused JavaScript","Unused CSS","Browser caching","Font display issues",
  "Google Tag Manager bloat","Rocket Loader conflict","Video detection",
  "Missing image alt text","Mobile vs desktop gap","Speed improvement opportunities",
  "CMS / platform detection","Page builder detection","CDN detection",
  "Hosting provider","Hosting speed verdict","E-commerce platform","HTTP version",
  "HTTPS status","Title tag","Meta description","H1 tag","Canonical tag",
  "Robots.txt","Sitemap.xml","Primary keyword","FAQ schema markup",
  "Pricing schema markup","LocalBusiness schema","Review / rating schema",
  "Google Analytics 4","Google Tag Manager","Facebook Pixel","TikTok Pixel",
  "Call tracking","Uptime monitoring","Backup detection","Images missing alt text",
  "Video autoplay","WordPress plugin issues",
  "GBP listing health","Citation accuracy","AI visibility score",
  "Competitor gap analysis","Keyword ownership","NAP consistency",
  "Review velocity","Social presence","SSL certificate","Redirect chains",
  "Schema completeness","Heading structure","Internal link depth",
  "Page speed vs competitors","Local rank signals","Tracking pixel coverage",
  "Tech stack analysis","Prospect qualification score","Content gap index",
  "City page coverage","Blog calendar status","FAQ schema depth",
  "Pricing page schema","Comparison page presence",
];

const FLASH_MESSAGES = [
  "🔥 This is going to be a big one...",
  "👀 Finding things most tools completely miss.",
  "📊 Your competitors don't know we do this.",
  "🎯 Just flagged something in your local signals.",
  "💡 Three critical issues found so far — and counting.",
  "⚡ Checking your AI visibility on ChatGPT and Gemini...",
  "🔍 Digging deeper than any free tool can go.",
  "🚨 Your hosting is slowing things down more than you think.",
];

const SC = (s: number) =>
  s >= 70 ? "#34D399" : s >= 50 ? "#FBBF24" : "#F87171";

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => String(++_id);

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display:"flex", gap:5, padding:"12px 16px", alignItems:"center" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:8, height:8, borderRadius:"50%", background:"#A78BFA",
          animation:`bounce 1s ${i*0.15}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function CompactCountdown({ apiDone, onZero }: { apiDone: boolean; onZero: () => void }) {
  const total = AUDIT_SIGNALS.length;
  const [idx, setIdx]   = useState(0);
  const idxRef          = useRef(0);
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onZeroRef       = useRef(onZero);
  onZeroRef.current     = onZero;
  const apiDoneRef      = useRef(apiDone);

  const tick = useCallback((cur: number, ms: number) => {
    timerRef.current = setTimeout(() => {
      const next = cur + 1;
      idxRef.current = next;
      setIdx(next);
      if (next >= total) { onZeroRef.current(); return; }
      const nextMs = apiDoneRef.current
        ? Math.min(90, ms)
        : (next >= Math.floor(total * 0.78) ? 2200 : ms);
      tick(next, nextMs);
    }, ms);
  }, [total]);

  useEffect(() => {
    const ms = (23000 * 0.78) / (total * 0.78);
    tick(0, ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiDoneRef.current = apiDone;
    if (apiDone && idxRef.current < total) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const remaining = total - idxRef.current;
      const fast = remaining <= 1 ? 80 : Math.min(90, 1000 / remaining);
      tick(idxRef.current, fast);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiDone]);

  const count    = total - idx;
  const progress = (idx / total) * 100;
  const label    = idx >= total ? "Done ✓" : AUDIT_SIGNALS[idx];

  return (
    <div style={{
      background:"#0D0A1F", border:"1px solid #A78BFA25",
      borderRadius:12, padding:"16px 18px", width:"100%",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
        <div style={{
          fontSize:48, fontWeight:800, lineHeight:1, minWidth:56, textAlign:"center",
          color: count === 0 ? "#34D399" : "#A78BFA",
          fontVariantNumeric:"tabular-nums", letterSpacing:"-2px",
          transition:"color 0.3s",
        }}>
          {count}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, color:"#64748B", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>
            Signals Remaining
          </div>
          <div style={{ fontSize:16, color:"#A78BFA", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {label}
          </div>
        </div>
      </div>
      <div style={{ background:"#1A1040", borderRadius:4, height:4, overflow:"hidden", marginBottom:4 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#A78BFA,#60A5FA)", borderRadius:4, transition:"width 0.35s linear" }} />
      </div>
      <div style={{ fontSize:13, color:"#374151", textAlign:"right" }}>{idx} / {total}</div>
    </div>
  );
}

function ResultCard({ data, url }: { data: AuditResult; url: string }) {
  const ms = data.mobileScore ?? 0;
  const ds = data.desktopScore ?? 0;
  const top3 = (data.topIssues ?? []).slice(0, 3);
  const hostname = (() => { try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; } catch { return url; } })();

  return (
    <div style={{ width:"100%", background:"#0D0A1F", border:"1px solid #A78BFA30", borderRadius:12, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 16px", background:"linear-gradient(135deg,#1A0E3D,#0D0A1F)", borderBottom:"1px solid #A78BFA20" }}>
        <div style={{ fontSize:13, color:"#A78BFA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>
          LocalSEOAEOPro Audit Report
        </div>
        <div style={{ fontSize:16, fontWeight:700, color:"#F1F5F9" }}>{hostname}</div>
      </div>

      {/* Scores */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid #1E1040" }}>
        {[["📱 Mobile", ms],["🖥️ Desktop", ds]].map(([label, score]) => (
          <div key={String(label)} style={{ padding:"12px 16px", textAlign:"center" }}>
            <div style={{ fontSize:13, color:"#64748B", marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:SC(Number(score)), lineHeight:1 }}>{score}</div>
            <div style={{ fontSize:13, color:SC(Number(score)), marginTop:2 }}>/100</div>
          </div>
        ))}
      </div>

      {/* 1-second verdict */}
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #1E1040", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>{data.passesOneSecond ? "✅" : "❌"}</span>
        <span style={{ fontSize:16, color: data.passesOneSecond ? "#34D399" : "#F87171", fontWeight:600 }}>
          {data.passesOneSecond ? "Passes Google's 1-second test" : "Failing Google's 1-second test"}
        </span>
      </div>

      {/* Top issues */}
      {top3.length > 0 && (
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #1E1040" }}>
          <div style={{ fontSize:13, color:"#F87171", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
            Top Issues Found
          </div>
          {top3.map((issue, i) => (
            <div key={i} style={{ fontSize:16, color:"#CBD5E1", lineHeight:1.5, marginBottom:5, paddingLeft:8, borderLeft:"2px solid #F8717150" }}>
              {issue.replace(/^\[\d+\]\s*/, "")}
            </div>
          ))}
        </div>
      )}

      {/* Fix promise */}
      <div style={{ padding:"12px 16px", background:"#10D9A008", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18, flexShrink:0 }}>⚡</span>
        <span style={{ fontSize:16, color:"#10D9A0", fontWeight:600 }}>
          Analyzes 74 signals. We can fix 47 of those signals in 24 hours and we will let you know the process it takes to complete the rest. Clicks on your site in Days not Years.
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main chat bot
// ─────────────────────────────────────────────────────────────────────────────
type Stage = "idle" | "url" | "city" | "industry" | "email" | "running" | "results" | "qa";

export default function AuditChatBot({ onClose }: { onClose: () => void }) {
  const [messages,    setMessages]    = useState<Msg[]>([]);
  const [stage,       setStage]       = useState<Stage>("idle");
  const [input,       setInput]       = useState("");
  const [collected,   setCollected]   = useState({ url:"", city:"", industry:"", email:"" });
  const [apiDone,     setApiDone]     = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [qaLoading,   setQaLoading]   = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const stageRef   = useRef(stage);
  stageRef.current = stage;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [stage]);

  // ── Message queue helpers ────────────────────────────────────────
  const addMsg = useCallback((msg: Omit<Msg, "id">) => {
    const full: Msg = { ...msg, id: uid() };
    setMessages(prev => [...prev, full]);
    return full.id;
  }, []);

  const removeMsg = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const botSay = useCallback(async (text: string, typingMs = 900) => {
    const tid = addMsg({ from:"bot", type:"typing" });
    await sleep(typingMs);
    removeMsg(tid);
    addMsg({ from:"bot", type:"text", text });
  }, [addMsg, removeMsg]);

  const botSayFast = useCallback(async (text: string) => {
    await botSay(text, 500);
  }, [botSay]);

  // ── Start conversation ───────────────────────────────────────────
  useEffect(() => {
    const greet = async () => {
      setStage("idle");
      await botSay("Hey! 👋 I'm your LocalSEOAEOPro audit bot.", 600);
      await botSay("I check 74 signals on your site and show you exactly what's costing you customers — and what we can fix in 24 hours.");
      await botSayFast("Let's start. What's your website URL?");
      setStage("url");
    };
    greet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Run audit + flash messages ───────────────────────────────────
  const runAudit = useCallback(async (url: string, city: string, industry: string, email: string) => {
    setStage("running");

    // Staggered flash messages while audit runs
    const flashTimers: ReturnType<typeof setTimeout>[] = [];
    FLASH_MESSAGES.forEach((msg, i) => {
      flashTimers.push(setTimeout(async () => {
        if (stageRef.current === "running") {
          const tid = addMsg({ from:"bot", type:"typing" });
          await sleep(400);
          removeMsg(tid);
          addMsg({ from:"bot", type:"text", text: msg });
        }
      }, 4500 + i * 4000));
    });

    // Fire the actual audit API
    let result: AuditResult = {};
    try {
      const res  = await fetch("/api/free-audit", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ url, email, city, industry }),
      });
      const data = await res.json();
      result = { ...data, url, city, industry };
    } catch {
      result = { error:"Something went wrong. Please try again." };
    }

    flashTimers.forEach(clearTimeout);
    setAuditResult(result);
    setApiDone(true);
    // onZero in CompactCountdown will trigger showResults
  }, [addMsg, removeMsg]);

  // ── Show results after countdown hits zero ───────────────────────
  const showResults = useCallback(async (result: AuditResult) => {
    setStage("results");

    if (result.error) {
      await botSay(`Sorry — ${result.error}`);
      return;
    }
    if (result.duplicate) {
      await botSay("Looks like we already ran this one! Check your inbox for the report we sent earlier. 📬");
      return;
    }
    if (result.limit) {
      await botSay("You've hit the 5-audit daily limit — come back tomorrow, or give Jim a call at (314) 517-2533.");
      return;
    }

    await botSayFast("Your report is ready. Here's what I found:");

    // Inject result card
    addMsg({ from:"bot", type:"result-card", auditData: result });

    await sleep(600);

    const ms = result.mobileScore ?? 0;
    if (ms < 50) {
      await botSay(`A ${ms}/100 mobile score means you're losing visitors before your page even loads. Google sees this too.`);
    } else if (ms < 70) {
      await botSay(`A ${ms}/100 mobile score is in the danger zone — your competitors with faster sites are taking your calls.`);
    } else {
      await botSay(`A ${ms}/100 mobile score is solid — now let's work on the other signals pulling you down.`);
    }

    if (result.reportId) {
      await botSay(`Your full report has been sent to ${result.url ? "" : "your email"}. The link is permanent — you can share it with your team. 📩`);
    }

    await botSay("Analyzes 74 signals. We can fix 47 of those signals in 24 hours and we will let you know the process it takes to complete the rest. Clicks on your site in Days not Years. What questions do you have? Ask me anything.");
    setStage("qa");
  }, [addMsg, botSay, botSayFast]);

  // ── Handle countdown hitting zero ───────────────────────────────
  const handleCountdownZero = useCallback(() => {
    if (auditResult) { showResults(auditResult); }
  }, [auditResult, showResults]);

  // Watch for auditResult landing after countdown already at zero
  const countdownDoneRef = useRef(false);
  const handleCountdownZeroRef = useRef(handleCountdownZero);
  handleCountdownZeroRef.current = handleCountdownZero;

  const onCountdownZero = useCallback(() => {
    countdownDoneRef.current = true;
    handleCountdownZeroRef.current();
  }, []);

  useEffect(() => {
    if (auditResult && countdownDoneRef.current && stageRef.current === "running") {
      handleCountdownZero();
    }
  }, [auditResult, handleCountdownZero]);

  // ── Handle user input ────────────────────────────────────────────
  const handleSend = useCallback(async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text) return;
    setInput("");

    addMsg({ from:"user", type:"text", text });

    if (stage === "url") {
      const url = text.replace(/^https?:\/\//i,"").replace(/\/.*$/,"").trim();
      const normalized = url;
      setCollected(c => ({ ...c, url: normalized }));
      await botSayFast(`Got it — ${normalized} ✓  What city is your business in?`);
      setStage("city");

    } else if (stage === "city") {
      setCollected(c => ({ ...c, city: text }));
      await botSayFast(`${text} — great market. What industry are you in?`);
      addMsg({ from:"bot", type:"chips", chips: INDUSTRIES });
      setStage("industry");

    } else if (stage === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        await botSayFast("Hmm, that doesn't look like a valid email. Try again?");
        return;
      }
      setCollected(c => ({ ...c, email: text }));
      await botSayFast(`Perfect. Running your audit now — checking all 74 signals...`);
      addMsg({ from:"bot", type:"countdown" });
      const { url, city, industry } = collected;
      runAudit(url, city, collected.industry || industry, text);

    } else if (stage === "qa") {
      handleQA(text, auditResult);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, stage, collected, auditResult]);

  const handleChip = useCallback(async (chip: string) => {
    addMsg({ from:"user", type:"text", text: chip });
    setCollected(c => ({ ...c, industry: chip }));
    await botSayFast(`${chip} — perfect. Last thing: what email should I send the full report to?`);
    setStage("email");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMsg, botSayFast]);

  // ── Q&A via Claude ───────────────────────────────────────────────
  const handleQA = useCallback(async (question: string, result: AuditResult | null) => {
    setQaLoading(true);
    const tid = addMsg({ from:"bot", type:"typing" });
    await sleep(600);
    removeMsg(tid);

    try {
      const system = `You are the LocalSEOAEOPro audit bot. You just completed a free local SEO audit for a business.

Audit data:
- URL: ${result?.url ?? "unknown"}
- City: ${result?.city ?? "unknown"}
- Industry: ${result?.industry ?? "unknown"}
- Mobile score: ${result?.mobileScore ?? "unknown"}/100
- Desktop score: ${result?.desktopScore ?? "unknown"}/100
- Passes 1-second test: ${result?.passesOneSecond ?? "unknown"}
- TTFB: ${result?.ttfb ?? "unknown"}ms
- LCP: ${result?.lcp ? (result.lcp/1000).toFixed(1)+"s" : "unknown"}
- Hosting: ${result?.hosting ?? "unknown"}
- CMS: ${result?.cms ?? "unknown"}
- Top issues: ${(result?.topIssues ?? []).slice(0,5).join(" | ")}

Answer the user's question conversationally. Be specific to their data. Keep it to 2-3 sentences max. Use plain language — no jargon. If they ask about pricing or getting started, mention they can start with a free trial at LocalSEOAEOPro.com. Never make up data not in the audit.`;

      const res  = await fetch("/api/claude", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ system, prompt: question, max_tokens: 300 }),
      });
      const data = await res.json();
      addMsg({ from:"bot", type:"qa-answer", text: data.result || "I'm not sure — let me have Jim take a look. He's at (314) 517-2533." });
    } catch {
      addMsg({ from:"bot", type:"text", text:"I'm having trouble answering that right now. Give Jim a call at (314) 517-2533 — he can walk you through anything." });
    }
    setQaLoading(false);
  }, [addMsg, removeMsg]);

  // ── Input placeholder ────────────────────────────────────────────
  const placeholder =
    stage === "url"     ? "Type your website URL..." :
    stage === "city"    ? "Type your city..." :
    stage === "email"   ? "Type your email address..." :
    stage === "qa"      ? "Ask me anything about your site..." :
    "...";

  const inputDisabled = stage === "idle" || stage === "running" || stage === "industry" || qaLoading;

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      display:"flex", flexDirection:"column",
      background:"linear-gradient(180deg,#07050F 0%,#0D0A1F 100%)",
      fontFamily:"system-ui,-apple-system,sans-serif",
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px", borderBottom:"1px solid #1E1040", flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:38, height:38, borderRadius:"50%",
            background:"linear-gradient(135deg,#7C3AED,#A78BFA)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          }}>🤖</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#F1F5F9" }}>LocalSEOAEOPro Bot</div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#34D399" }} />
              <span style={{ fontSize:13, color:"#64748B" }}>
                {stage === "running" ? "Scanning your site..." : stage === "qa" ? "Ready to answer your questions" : "Online — let's audit your site"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"1px solid #1E1040", borderRadius:8, color:"#64748B", fontSize:20, cursor:"pointer", padding:"4px 10px", lineHeight:1 }}>✕</button>
      </div>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:6 }}>
        {messages.map(msg => (
          <MessageRow
            key={msg.id}
            msg={msg}
            onChip={handleChip}
            apiDone={apiDone}
            onCountdownZero={onCountdownZero}
            auditUrl={collected.url}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <div style={{
        padding:"12px 16px", borderTop:"1px solid #1E1040", flexShrink:0,
        background:"#0D0A1F",
      }}>
        {stage === "qa" && (
          <div style={{ fontSize:16, color:"#374151", marginBottom:6, textAlign:"center" }}>
            💬 Ask anything — powered by Claude AI
          </div>
        )}
        <div style={{ display:"flex", gap:10 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !inputDisabled) handleSend(); }}
            disabled={inputDisabled}
            placeholder={placeholder}
            style={{
              flex:1, padding:"13px 16px",
              background: inputDisabled ? "#0A0718" : "#1A1040",
              border:`1px solid ${inputDisabled ? "#1E1040" : "#A78BFA40"}`,
              borderRadius:10, color:"#F1F5F9", fontSize:16,
              outline:"none", transition:"all 0.2s",
              opacity: inputDisabled ? 0.5 : 1,
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={inputDisabled || !input.trim()}
            style={{
              padding:"0 20px", background:"#A78BFA",
              border:"none", borderRadius:10,
              color:"#0D0A1F", fontWeight:700, fontSize:16,
              cursor: inputDisabled || !input.trim() ? "not-allowed" : "pointer",
              opacity: inputDisabled || !input.trim() ? 0.4 : 1,
              transition:"opacity 0.2s",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40% { transform:translateY(-6px); opacity:1; }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageRow — renders one message
// ─────────────────────────────────────────────────────────────────────────────
function MessageRow({
  msg, onChip, apiDone, onCountdownZero, auditUrl,
}: {
  msg: Msg;
  onChip: (chip: string) => void;
  apiDone: boolean;
  onCountdownZero: () => void;
  auditUrl: string;
}) {
  const isBot = msg.from === "bot";

  if (msg.type === "typing") {
    return (
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", animation:"fadeSlideIn 0.25s ease" }}>
        <BotAvatar />
        <div style={{ background:"#1A1040", border:"1px solid #A78BFA20", borderRadius:"4px 12px 12px 12px" }}>
          <TypingDots />
        </div>
      </div>
    );
  }

  if (msg.type === "countdown") {
    return (
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", animation:"fadeSlideIn 0.3s ease" }}>
        <BotAvatar />
        <div style={{ flex:1, maxWidth:360 }}>
          <CompactCountdown apiDone={apiDone} onZero={onCountdownZero} />
        </div>
      </div>
    );
  }

  if (msg.type === "chips" && msg.chips) {
    return (
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", animation:"fadeSlideIn 0.3s ease" }}>
        <BotAvatar />
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, maxWidth:320 }}>
          {msg.chips.map(chip => (
            <button
              key={chip}
              onClick={() => onChip(chip)}
              style={{
                padding:"8px 14px", background:"#1A1040",
                border:"1px solid #A78BFA40", borderRadius:20,
                color:"#C4B5FD", fontSize:16, fontWeight:600,
                cursor:"pointer", transition:"all 0.15s",
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background="#2D1B69"; (e.target as HTMLElement).style.borderColor="#A78BFA"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background="#1A1040"; (e.target as HTMLElement).style.borderColor="#A78BFA40"; }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (msg.type === "result-card" && msg.auditData) {
    return (
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", animation:"fadeSlideIn 0.3s ease" }}>
        <BotAvatar />
        <div style={{ flex:1, maxWidth:380 }}>
          <ResultCard data={msg.auditData} url={auditUrl} />
        </div>
      </div>
    );
  }

  // Text message (bot or user)
  return (
    <div style={{
      display:"flex", gap:10,
      flexDirection: isBot ? "row" : "row-reverse",
      alignItems:"flex-start",
      animation:"fadeSlideIn 0.25s ease",
    }}>
      {isBot && <BotAvatar />}
      <div style={{
        maxWidth:"75%", padding:"11px 15px",
        background: isBot ? "#1A1040" : "#2D1B69",
        border: isBot ? "1px solid #A78BFA20" : "1px solid #A78BFA40",
        borderRadius: isBot ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
        fontSize:16, color:"#E2E8F0", lineHeight:1.55,
      }}>
        {msg.text}
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div style={{
      width:32, height:32, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#7C3AED,#A78BFA)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:16, border:"1px solid #A78BFA30",
    }}>🤖</div>
  );
}
