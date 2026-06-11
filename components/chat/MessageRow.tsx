"use client";
import type { Msg } from "./types";
import { CompactCountdown } from "./ResultCard";
import { ResultCard } from "./ResultCard";

export function BotAvatar() {
  return (
    <div style={{
      width:32, height:32, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#7C3AED,#A78BFA)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:16, border:"1px solid #A78BFA30",
    }}>🤖</div>
  );
}

export function TypingDots() {
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

interface MessageRowProps {
  msg: Msg;
  onChip: (chip: string) => void;
  apiDone: boolean;
  onCountdownZero: () => void;
  auditUrl: string;
}

export function MessageRow({ msg, onChip, apiDone, onCountdownZero, auditUrl }: MessageRowProps) {
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
