"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Msg, AuditResult, Collected, Stage } from "./chat/types";
import { INDUSTRIES, FLASH_MESSAGES, uid, sleep } from "./chat/constants";
import { MessageRow } from "./chat/MessageRow";

export default function AuditChatBot({ onClose }: { onClose: () => void }) {
  const [messages,    setMessages]    = useState<Msg[]>([]);
  const [stage,       setStage]       = useState<Stage>("idle");
  const [input,       setInput]       = useState("");
  const [collected,   setCollected]   = useState<Collected>({ url:"", city:"", industry:"", email:"" });
  const [apiDone,     setApiDone]     = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [qaLoading,   setQaLoading]   = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const stageRef   = useRef(stage);
  stageRef.current = stage;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 400); }, [stage]);

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

  // Greeting
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

  const runAudit = useCallback(async (url: string, city: string, industry: string, email: string) => {
    setStage("running");
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
  }, [addMsg, removeMsg]);

  const showResults = useCallback(async (result: AuditResult) => {
    setStage("results");
    if (result.error) { await botSay(`Sorry — ${result.error}`); return; }
    if (result.duplicate) { await botSay("Looks like we already ran this one! Check your inbox for the report we sent earlier. 📬"); return; }
    if (result.limit) { await botSay("You've hit the 5-audit daily limit — come back tomorrow, or give Jim a call at (314) 517-2533."); return; }

    await botSayFast("Your report is ready. Here's what I found:");
    addMsg({ from:"bot", type:"result-card", auditData: result });
    await sleep(600);

    const ms = result.mobileScore ?? 0;
    if (ms < 50) await botSay(`A ${ms}/100 mobile score means you're losing visitors before your page even loads. Google sees this too.`);
    else if (ms < 70) await botSay(`A ${ms}/100 mobile score is in the danger zone — your competitors with faster sites are taking your calls.`);
    else await botSay(`A ${ms}/100 mobile score is solid — now let's work on the other signals pulling you down.`);

    if (result.reportId) await botSay(`Your full report has been sent to your email. The link is permanent — you can share it with your team. 📩`);

    await botSay("Analyzes 74 signals. We can have 49 of these problems fixed in 24 hours and 98% of the rest within 48 hours. Citations take longer. What questions do you have? Ask me anything.");
    setStage("qa");
  }, [addMsg, botSay, botSayFast]);

  const countdownDoneRef        = useRef(false);
  const handleCountdownZero     = useCallback(() => {
    if (auditResult) showResults(auditResult);
  }, [auditResult, showResults]);
  const handleCountdownZeroRef  = useRef(handleCountdownZero);
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

  const handleQA = useCallback(async (question: string, result: AuditResult | null) => {
    setQaLoading(true);
    const tid = addMsg({ from:"bot", type:"typing" });
    await sleep(600);
    removeMsg(tid);
    try {
      const system = `You are the LocalSEOAEOPro audit bot. You just completed a free local SEO audit.
Audit data: URL: ${result?.url ?? "unknown"}, City: ${result?.city ?? "unknown"}, Industry: ${result?.industry ?? "unknown"}, Mobile: ${result?.mobileScore ?? "unknown"}/100, Desktop: ${result?.desktopScore ?? "unknown"}/100, Passes 1s: ${result?.passesOneSecond ?? "unknown"}, TTFB: ${result?.ttfb ?? "unknown"}ms, LCP: ${result?.lcp ? (result.lcp/1000).toFixed(1)+"s" : "unknown"}, Hosting: ${result?.hosting ?? "unknown"}, CMS: ${result?.cms ?? "unknown"}, Top issues: ${(result?.topIssues ?? []).slice(0,5).join(" | ")}
Answer conversationally. Be specific to their data. 2-3 sentences max. Plain language. If they ask about pricing, mention LocalSEOAEOPro.com. Never make up data.`;
      const res  = await fetch("/api/claude", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ system, prompt: question, max_tokens: 300 }) });
      const data = await res.json();
      addMsg({ from:"bot", type:"qa-answer", text: data.result || "I'm not sure — let me have Jim take a look. He's at (314) 517-2533." });
    } catch {
      addMsg({ from:"bot", type:"text", text:"I'm having trouble answering that right now. Give Jim a call at (314) 517-2533 — he can walk you through anything." });
    }
    setQaLoading(false);
  }, [addMsg, removeMsg]);

  const handleSend = useCallback(async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text) return;
    setInput("");
    addMsg({ from:"user", type:"text", text });

    if (stage === "url") {
      const url = text.replace(/^https?:\/\//i,"").replace(/\/.*$/,"").trim();
      setCollected(c => ({ ...c, url }));
      await botSayFast(`Got it — ${url} ✓  What city is your business in?`);
      setStage("city");
    } else if (stage === "city") {
      setCollected(c => ({ ...c, city: text }));
      await botSayFast(`${text} — great market. What industry are you in?`);
      addMsg({ from:"bot", type:"chips", chips: INDUSTRIES });
      setStage("industry");
    } else if (stage === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) { await botSayFast("Hmm, that doesn't look like a valid email. Try again?"); return; }
      setCollected(c => ({ ...c, email: text }));
      await botSayFast("Perfect. Running your audit now — checking all 74 signals...");
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

  const placeholder   = stage === "url" ? "Type your website URL..." : stage === "city" ? "Type your city..." : stage === "email" ? "Type your email address..." : stage === "qa" ? "Ask me anything about your site..." : "...";
  const inputDisabled = stage === "idle" || stage === "running" || stage === "industry" || qaLoading;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", flexDirection:"column", background:"linear-gradient(180deg,#07050F 0%,#0D0A1F 100%)", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid #1E1040", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7C3AED,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
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

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:6 }}>
        {messages.map(msg => (
          <MessageRow key={msg.id} msg={msg} onChip={handleChip} apiDone={apiDone} onCountdownZero={onCountdownZero} auditUrl={collected.url} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px", borderTop:"1px solid #1E1040", flexShrink:0, background:"#0D0A1F" }}>
        {stage === "qa" && <div style={{ fontSize:16, color:"#374151", marginBottom:6, textAlign:"center" }}>💬 Ask anything — powered by Claude AI</div>}
        <div style={{ display:"flex", gap:10 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !inputDisabled) handleSend(); }} disabled={inputDisabled} placeholder={placeholder}
            style={{ flex:1, padding:"13px 16px", background: inputDisabled ? "#0A0718" : "#1A1040", border:`1px solid ${inputDisabled ? "#1E1040" : "#A78BFA40"}`, borderRadius:10, color:"#F1F5F9", fontSize:16, outline:"none", transition:"all 0.2s", opacity: inputDisabled ? 0.5 : 1 }}
          />
          <button onClick={() => handleSend()} disabled={inputDisabled || !input.trim()}
            style={{ padding:"0 20px", background:"#A78BFA", border:"none", borderRadius:10, color:"#0D0A1F", fontWeight:700, fontSize:16, cursor: inputDisabled || !input.trim() ? "not-allowed" : "pointer", opacity: inputDisabled || !input.trim() ? 0.4 : 1, transition:"opacity 0.2s" }}
          >→</button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); opacity:0.4; } 40% { transform:translateY(-6px); opacity:1; } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
