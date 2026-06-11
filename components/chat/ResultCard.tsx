"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { AuditResult } from "./types";
import { AUDIT_SIGNALS, SC } from "./constants";

export function CompactCountdown({ apiDone, onZero }: { apiDone: boolean; onZero: () => void }) {
  const total = AUDIT_SIGNALS.length;
  const [idx, setIdx]       = useState(0);
  const idxRef              = useRef(0);
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onZeroRef           = useRef(onZero);
  onZeroRef.current         = onZero;
  const apiDoneRef          = useRef(apiDone);

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
    <div style={{ background:"#0D0A1F", border:"1px solid #A78BFA25", borderRadius:12, padding:"16px 18px", width:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
        <div style={{
          fontSize:48, fontWeight:800, lineHeight:1, minWidth:56, textAlign:"center",
          color: count === 0 ? "#34D399" : "#A78BFA",
          fontVariantNumeric:"tabular-nums", letterSpacing:"-2px", transition:"color 0.3s",
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

export function ResultCard({ data, url }: { data: AuditResult; url: string }) {
  const ms = data.mobileScore ?? 0;
  const ds = data.desktopScore ?? 0;
  const top3 = (data.topIssues ?? []).slice(0, 3);
  const hostname = (() => { try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; } catch { return url; } })();

  return (
    <div style={{ width:"100%", background:"#0D0A1F", border:"1px solid #A78BFA30", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"14px 16px", background:"linear-gradient(135deg,#1A0E3D,#0D0A1F)", borderBottom:"1px solid #A78BFA20" }}>
        <div style={{ fontSize:13, color:"#A78BFA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>
          LocalSEOAEOPro Audit Report
        </div>
        <div style={{ fontSize:16, fontWeight:700, color:"#F1F5F9" }}>{hostname}</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid #1E1040" }}>
        {[["📱 Mobile", ms],["🖥️ Desktop", ds]].map(([label, score]) => (
          <div key={String(label)} style={{ padding:"12px 16px", textAlign:"center" }}>
            <div style={{ fontSize:13, color:"#64748B", marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:SC(Number(score)), lineHeight:1 }}>{score}</div>
            <div style={{ fontSize:13, color:SC(Number(score)), marginTop:2 }}>/100</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"10px 16px", borderBottom:"1px solid #1E1040", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>{data.passesOneSecond ? "✅" : "❌"}</span>
        <span style={{ fontSize:16, color: data.passesOneSecond ? "#34D399" : "#F87171", fontWeight:600 }}>
          {data.passesOneSecond ? "Passes Google's 1-second test" : "Failing Google's 1-second test"}
        </span>
      </div>

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

      <div style={{ padding:"12px 16px", background:"#10D9A008", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18, flexShrink:0 }}>⚡</span>
        <span style={{ fontSize:16, color:"#10D9A0", fontWeight:600 }}>
          Analyzes 74 signals. 47 fixed in 24 hours — the rest we walk you through. Clicks on your site in Days not Years.
        </span>
      </div>
    </div>
  );
}
