"use client";

import { useState, useEffect, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

/** Props passed into each tool module (code-split via dynamic import to avoid huge webpack chunks on Vercel). */
type DashboardModuleProps = {
  businessName: string;
  websiteUrl: string;
  city: string;
  industry: string;
  mode: string;
  plan: string;
  userId?: string;
  wpUrl?: string;
  wpUsername?: string;
  wpAppPassword?: string;
  onStatusChange?: (status: string) => void;
};

function ModuleLoading() {
  return (
    <div style={{ color: "#94A3B8", fontSize: 14, padding: 24 }}>Loading module…</div>
  );
}

const MODULE_MAP = {
  WhiteLabelReportGenerator: dynamic(() => import("@/modules/WhiteLabelReportGenerator"), { loading: ModuleLoading }),
  AutoFixEngine: dynamic(() => import("@/modules/AutoFixEngine"), { loading: ModuleLoading }),
  HeadingStructureAuditor: dynamic(() => import("@/modules/HeadingStructureAuditor"), { loading: ModuleLoading }),
  TitleMetaAuditor: dynamic(() => import("@/modules/TitleMetaAuditor"), { loading: ModuleLoading }),
  CanonicalAuditor: dynamic(() => import("@/modules/CanonicalAuditor"), { loading: ModuleLoading }),
  ImageAuditor: dynamic(() => import("@/modules/ImageAuditor"), { loading: ModuleLoading }),
  InternalLinkAuditor: dynamic(() => import("@/modules/InternalLinkAuditor"), { loading: ModuleLoading }),
  CriticalSignalsChecker: dynamic(() => import("@/modules/CriticalSignalsChecker"), { loading: ModuleLoading }),
  KeywordInspector: dynamic(() => import("@/modules/KeywordInspector"), { loading: ModuleLoading }),
  KeywordOwnershipMap: dynamic(() => import("@/modules/KeywordOwnershipMap"), { loading: ModuleLoading }),
  KeywordIntelligence: dynamic(() => import("@/modules/KeywordIntelligence"), { loading: ModuleLoading }),
  CompetitorIntelligence: dynamic(() => import("@/modules/CompetitorIntelligence"), { loading: ModuleLoading }),
  GeoGridTracker: dynamic(() => import("@/modules/GeoGridTracker"), { loading: ModuleLoading }),
  GBPOptimizer: dynamic(() => import("@/modules/GBPOptimizer"), { loading: ModuleLoading }),
  GBPPostScheduler: dynamic(() => import("@/modules/GBPPostScheduler"), { loading: ModuleLoading }),
  GBPListingProtection: dynamic(() => import("@/modules/GBPListingProtection"), { loading: ModuleLoading }),
  CitationIntelligence: dynamic(() => import("@/modules/CitationIntelligence"), { loading: ModuleLoading }),
  CitationSearchEngine: dynamic(() => import("@/modules/CitationSearchEngine"), { loading: ModuleLoading }),
  CitationAutoSubmit: dynamic(() => import("@/modules/CitationAutoSubmit"), { loading: ModuleLoading }),
  ReviewRequestCampaign: dynamic(() => import("@/modules/ReviewRequestCampaign"), { loading: ModuleLoading }),
  MultiPlatformReviewMonitor: dynamic(() => import("@/modules/MultiPlatformReviewMonitor"), { loading: ModuleLoading }),
  AIVisibilityChecker: dynamic(() => import("@/modules/AIVisibilityChecker"), { loading: ModuleLoading }),
  AEOQAGeneratorV2: dynamic(() => import("@/modules/AEOQAGeneratorV2"), { loading: ModuleLoading }),
  AEOQAPageGenerator: dynamic(() => import("@/modules/AEOQAPageGenerator"), { loading: ModuleLoading }),
  CityPageGenerator: dynamic(() => import("@/modules/CityPageGenerator"), { loading: ModuleLoading }),
  BlogCalendarGenerator: dynamic(() => import("@/modules/BlogCalendarGenerator"), { loading: ModuleLoading }),
  FAQPageGenerator: dynamic(() => import("@/modules/FAQPageGenerator"), { loading: ModuleLoading }),
  PricingPageGenerator: dynamic(() => import("@/modules/PricingPageGenerator"), { loading: ModuleLoading }),
  ComparisonPageGenerator: dynamic(() => import("@/modules/ComparisonPageGenerator"), { loading: ModuleLoading }),
  PageSpeedIntelligence: dynamic(() => import("@/modules/PageSpeedIntelligence"), { loading: ModuleLoading }),
  HostingIntelligence: dynamic(() => import("@/modules/HostingIntelligence"), { loading: ModuleLoading }),
  RankTracker: dynamic(() => import("@/modules/RankTracker"), { loading: ModuleLoading }),
  BacklinkFinder: dynamic(() => import("@/modules/BacklinkFinder"), { loading: ModuleLoading }),
  XMLSitemapBuilder: dynamic(() => import("@/modules/XMLSitemapBuilder"), { loading: ModuleLoading }),
  // ── 7 New Intelligence Agents ────────────────────────────────────────────
  SocialPresenceScanner:     dynamic(() => import("@/modules/SocialPresenceScanner"),     { loading: ModuleLoading }),
  TrackingPixelDetector:     dynamic(() => import("@/modules/TrackingPixelDetector"),     { loading: ModuleLoading }),
  TechStackIdentifier:       dynamic(() => import("@/modules/TechStackIdentifier"),       { loading: ModuleLoading }),
  NAPConsistencyChecker:     dynamic(() => import("@/modules/NAPConsistencyChecker"),     { loading: ModuleLoading }),
  SSLCertificateMonitor:     dynamic(() => import("@/modules/SSLCertificateMonitor"),     { loading: ModuleLoading }),
  RedirectChainDetector:     dynamic(() => import("@/modules/RedirectChainDetector"),     { loading: ModuleLoading }),
  ProspectQualificationScorer: dynamic(() => import("@/modules/ProspectQualificationScorer"), { loading: ModuleLoading }),
} as Record<string, ComponentType<DashboardModuleProps>>;

const NAV = [
  { group: "Overview", modules: [
    { id: "WhiteLabelReportGenerator", tag: "WLR", label: "Report Generator",        color: "#A78BFA" },
    { id: "AutoFixEngine",             tag: "AFE", label: "AutoFix Engine",           color: "#10D9A0" },
  ]},
  { group: "On-Page Audit", modules: [
    { id: "HeadingStructureAuditor",   tag: "HDG", label: "Heading Structure H1–H4", color: "#60A5FA" },
    { id: "TitleMetaAuditor",          tag: "T/M", label: "Title & Meta Tags",        color: "#60A5FA" },
    { id: "CanonicalAuditor",          tag: "CAN", label: "Canonical Audit",          color: "#A78BFA" },
    { id: "ImageAuditor",              tag: "IMG", label: "Image Auditor",            color: "#60A5FA" },
    { id: "InternalLinkAuditor",       tag: "ILA", label: "Internal Links",           color: "#94A3B8" },
    { id: "CriticalSignalsChecker",    tag: "CSC", label: "Critical Signals",         color: "#F87171" },
  ]},
  { group: "Keywords", modules: [
    { id: "KeywordInspector",          tag: "KI",  label: "Keyword Inspector",        color: "#A78BFA" },
    { id: "KeywordOwnershipMap",       tag: "KO",  label: "Keyword Ownership Map",    color: "#A78BFA" },
    { id: "KeywordIntelligence",       tag: "KX",  label: "Keyword Intelligence",     color: "#A78BFA" },
  ]},
  { group: "Competitors", modules: [
    { id: "CompetitorIntelligence",    tag: "CX",  label: "Competitor Intelligence",  color: "#F87171" },
  ]},
  { group: "Local Presence", modules: [
    { id: "GeoGridTracker",            tag: "GRD", label: "GeoGrid Map Tracker",      color: "#10D9A0" },
    { id: "GBPOptimizer",              tag: "GBP", label: "GBP Optimizer",            color: "#34D399" },
    { id: "GBPPostScheduler",          tag: "GPS", label: "GBP Post Scheduler",       color: "#34D399" },
    { id: "GBPListingProtection",      tag: "GLP", label: "GBP Listing Protection",   color: "#F87171" },
    { id: "CitationIntelligence",      tag: "CIT", label: "Citation Intelligence",    color: "#34D399" },
    { id: "CitationSearchEngine",      tag: "CSE", label: "Citation Search Engine",   color: "#34D399" },
    { id: "CitationAutoSubmit",        tag: "CAS", label: "Citation Auto Submit",     color: "#34D399" },
    { id: "ReviewRequestCampaign",     tag: "RRC", label: "Review Request Campaign",  color: "#F87171" },
    { id: "MultiPlatformReviewMonitor",tag: "RPM", label: "Review Monitor",           color: "#F87171" },
  ]},
  { group: "Content Generation", modules: [
    { id: "AIVisibilityChecker",       tag: "AVC", label: "AI Visibility Checker",    color: "#10D9A0" },
    { id: "AEOQAGeneratorV2",          tag: "AQ2", label: "AEO Q&A Generator V2",     color: "#10D9A0" },
    { id: "AEOQAPageGenerator",        tag: "AEO", label: "AEO Q&A Generator V1",     color: "#10D9A0" },
    { id: "CityPageGenerator",         tag: "CPG", label: "City Page Generator",      color: "#FBBF24" },
    { id: "BlogCalendarGenerator",      tag: "BCG", label: "Blog Calendar Generator", color: "#FBBF24" },
    { id: "FAQPageGenerator",          tag: "FAQ", label: "FAQ Page Generator",       color: "#FBBF24" },
    { id: "PricingPageGenerator",      tag: "PRC", label: "Pricing Page Generator",   color: "#FBBF24" },
    { id: "ComparisonPageGenerator",   tag: "CMP", label: "Comparison Pages",         color: "#FBBF24" },
  ]},
  { group: "Technical", modules: [
    { id: "PageSpeedIntelligence",     tag: "PSI", label: "Page Speed Intelligence",  color: "#F87171" },
    { id: "HostingIntelligence",       tag: "HST", label: "Hosting Intelligence",     color: "#60A5FA" },
    { id: "RankTracker",               tag: "RNK", label: "Rank Tracker",             color: "#94A3B8" },
    { id: "BacklinkFinder",            tag: "BKL", label: "Backlink Finder",          color: "#94A3B8" },
    { id: "XMLSitemapBuilder",         tag: "XML", label: "XML Sitemap Builder",      color: "#94A3B8" },
    { id: "SSLCertificateMonitor",     tag: "SSL", label: "SSL Certificate Monitor",  color: "#10D9A0" },
    { id: "RedirectChainDetector",     tag: "RCD", label: "Redirect Chain Detector",  color: "#F87171" },
    { id: "TechStackIdentifier",       tag: "TSI", label: "Tech Stack Identifier",    color: "#60A5FA" },
  ]},
  { group: "Intelligence Agents", modules: [
    { id: "SocialPresenceScanner",       tag: "SPS", label: "Social Presence Scanner",       color: "#A78BFA" },
    { id: "TrackingPixelDetector",       tag: "TPD", label: "Tracking Pixel Detector",       color: "#F59E0B" },
    { id: "NAPConsistencyChecker",       tag: "NAP", label: "NAP Consistency Checker",       color: "#34D399" },
    { id: "ProspectQualificationScorer", tag: "PQS", label: "Prospect Qualification Scorer", color: "#A78BFA" },
  ]},
];

const ALL_MODULES = NAV.flatMap(g => g.modules);

type Profile = {
  business_name: string; city: string; website: string;
  phone: string; country: string; industry: string;
  wp_url?: string; wp_username?: string; wp_app_password?: string;
};

type WPForm = { wpUrl: string; wpUsername: string; wpAppPassword: string; };

export default function Dashboard() {
  const [profile,        setProfile]        = useState<Profile | null>(null);
  const [userId,         setUserId]         = useState<string>("");
  const [userEmail,      setUserEmail]      = useState<string>("");
  const [activeId,       setActiveId]       = useState("AutoFixEngine");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [isMobile,       setIsMobile]       = useState(false);
  const [wpForm,         setWpForm]         = useState<WPForm>({ wpUrl: "", wpUsername: "", wpAppPassword: "" });
  const [wpConnecting,   setWpConnecting]   = useState(false);
  const [wpStatus,       setWpStatus]       = useState<{ ok: boolean; siteName?: string } | null>(null);
  const [wpPanelOpen,    setWpPanelOpen]    = useState(false);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      setUserId(user.id);
      setUserEmail(user.email ?? "");

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (p) {
        setProfile(p);
        setWpForm({ wpUrl: p.wp_url || "", wpUsername: p.wp_username || "", wpAppPassword: p.wp_app_password || "" });
        if (p.wp_url) setWpStatus({ ok: true, siteName: p.wp_url });
      } else {
        const meta = user.user_metadata;
        setProfile({
          business_name: meta?.business_name || "",
          city: meta?.city || "",
          website: meta?.website || "",
          phone: meta?.phone || "",
          country: meta?.country || "",
          industry: meta?.industry || "",
        });
      }
    }
    load();
  }, []);

  async function testWPConnection() {
    setWpConnecting(true);
    setWpStatus(null);
    try {
      const res  = await fetch("/api/wp/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(wpForm) });
      const data = await res.json();
      setWpStatus(data);
      if (data.ok) {
        const supabase = createClient();
        await supabase.from("profiles").update({ wp_url: wpForm.wpUrl, wp_username: wpForm.wpUsername, wp_app_password: wpForm.wpAppPassword }).eq("id", userId);
        setProfile(p => p ? { ...p, wp_url: wpForm.wpUrl, wp_username: wpForm.wpUsername, wp_app_password: wpForm.wpAppPassword } : p);
        setWpPanelOpen(false);
      }
    } catch { setWpStatus({ ok: false }); }
    setWpConnecting(false);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0E16", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontFamily: "system-ui, sans-serif" }}>
        Loading your dashboard…
      </div>
    );
  }

  const ActiveModule =
    activeId in MODULE_MAP ? MODULE_MAP[activeId] : null;
  const activeMeta   = ALL_MODULES.find(m => m.id === activeId);

  const moduleProps: DashboardModuleProps = {
    businessName: profile.business_name,
    websiteUrl:   profile.website,
    city:         profile.city,
    industry:     profile.industry || "",
    mode:         "named",
    plan:         "free",
    userId,
    wpUrl:        profile.wp_url,
    wpUsername:   profile.wp_username,
    wpAppPassword: profile.wp_app_password,
    onStatusChange: (status: string) => setModuleStatuses(prev => ({ ...prev, [activeId]: status })),
  };

  const statusDot: Record<string, string> = { clean: "#34D399", "needs-work": "#FBBF24", critical: "#F87171", multiple: "#94A3B8" };

  const wpConnected = !!(profile.wp_url);
  const inp: React.CSSProperties = { width: "100%", padding: "8px 11px", background: "#0B0E16", border: "1px solid #374151", borderRadius: 6, color: "#F1F5F9", fontSize: 12, boxSizing: "border-box", outline: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "#0B0E16", color: "#F1F5F9" }}>

      {/* ── Mobile top bar ── */}
      {isMobile && (
        <div style={{ height: 52, background: "#111827", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0, zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 20, padding: 4 }}>☰</button>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F9FAFB" }}>Local SEO &amp; AEO Pro</div>
          {activeMeta && (
            <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: activeMeta.color, background: activeMeta.color + "22", padding: "2px 7px", borderRadius: 3, fontFamily: "monospace" }}>
              {activeMeta.tag}
            </span>
          )}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* ── Mobile overlay ── */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 40 }} />
        )}

        {/* ── Sidebar ── */}
        <aside style={{
          width: 240, flexShrink: 0,
          background: "#111827", borderRight: "1px solid #374151",
          display: "flex", flexDirection: "column", overflowY: "auto",
          ...(isMobile ? {
            position: "fixed", top: 52, bottom: 0, left: 0, zIndex: 45,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.2s ease",
          } : {}),
        }}>
          {/* Logo */}
          {!isMobile && (
            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1F2937", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #10D9A0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>LS</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F9FAFB" }}>Local SEO &amp; AEO Pro</div>
                <div style={{ fontSize: 10, color: "#6B7280" }}>{profile.business_name}</div>
              </div>
            </div>
          )}

          {/* WordPress connection */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #1F2937" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: wpPanelOpen ? 8 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: wpConnected ? "#34D399" : "#F87171", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: wpConnected ? "#34D399" : "#94A3B8" }}>
                  {wpConnected ? "WordPress connected" : "Connect WordPress"}
                </span>
              </div>
              <button onClick={() => setWpPanelOpen(o => !o)} style={{ fontSize: 10, color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>
                {wpPanelOpen ? "▲" : "▼"}
              </button>
            </div>

            {wpPanelOpen && (
              <div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: "#64748B", marginBottom: 3 }}>WP SITE URL</div>
                  <input style={inp} placeholder="https://yourdomain.com" value={wpForm.wpUrl} onChange={e => setWpForm(f => ({ ...f, wpUrl: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: "#64748B", marginBottom: 3 }}>WP USERNAME</div>
                  <input style={inp} placeholder="admin" value={wpForm.wpUsername} onChange={e => setWpForm(f => ({ ...f, wpUsername: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: "#64748B", marginBottom: 3 }}>APPLICATION PASSWORD</div>
                  <input style={inp} type="password" placeholder="xxxx xxxx xxxx xxxx" value={wpForm.wpAppPassword} onChange={e => setWpForm(f => ({ ...f, wpAppPassword: e.target.value }))} />
                  <div style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>WP Admin → Users → Profile → Application Passwords</div>
                </div>
                <button onClick={testWPConnection} disabled={wpConnecting} style={{ width: "100%", padding: "7px", background: wpConnecting ? "transparent" : "#10D9A0", border: "1px solid #10D9A0", borderRadius: 6, color: wpConnecting ? "#10D9A0" : "#0B0E16", fontSize: 11, fontWeight: 600, cursor: wpConnecting ? "not-allowed" : "pointer" }}>
                  {wpConnecting ? "Testing…" : "Test & Save Connection →"}
                </button>
                {wpStatus && !wpStatus.ok && (
                  <div style={{ fontSize: 10, color: "#F87171", marginTop: 5 }}>Connection failed — check URL and credentials</div>
                )}
                {wpStatus?.ok && (
                  <div style={{ fontSize: 10, color: "#34D399", marginTop: 5 }}>✓ Connected to {wpStatus.siteName}</div>
                )}
              </div>
            )}
          </div>

          {/* Nav groups */}
          <div style={{ flex: 1, padding: "8px 0" }}>
            {NAV.map(group => (
              <div key={group.group} style={{ marginBottom: 4 }}>
                <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {group.group}
                </div>
                {group.modules.map(mod => {
                  const active = mod.id === activeId;
                  const status = moduleStatuses[mod.id];
                  return (
                    <button key={mod.id} onClick={() => { setActiveId(mod.id); if (isMobile) setSidebarOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "7px 16px",
                      background: active ? "#1F2937" : "transparent",
                      border: "none",
                      borderLeft: active ? `3px solid ${mod.color}` : "3px solid transparent",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: active ? mod.color : "#6B7280", background: active ? mod.color + "22" : "#1F2937", padding: "2px 5px", borderRadius: 3, minWidth: 28, textAlign: "center", fontFamily: "monospace", flexShrink: 0 }}>
                        {mod.tag}
                      </span>
                      <span style={{ fontSize: 12, color: active ? "#F9FAFB" : "#D1D5DB", lineHeight: 1.3, flex: 1 }}>
                        {mod.label}
                      </span>
                      {status && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusDot[status] || "#94A3B8", flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1F2937" }}>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 2 }}>{userEmail}</div>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 8 }}>{profile.city} · {profile.website.replace(/^https?:\/\//, "")}</div>
            <button onClick={signOut} style={{ fontSize: 11, color: "#9CA3AF", background: "none", border: "1px solid #374151", borderRadius: 6, padding: "5px 12px", cursor: "pointer", width: "100%" }}>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Module title bar (desktop only) */}
          {!isMobile && (
            <div style={{ padding: "14px 24px", background: "#111827", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {activeMeta && (
                <>
                  <span style={{ fontSize: 10, fontWeight: 700, color: activeMeta.color, background: activeMeta.color + "22", padding: "3px 8px", borderRadius: 4, fontFamily: "monospace" }}>
                    {activeMeta.tag}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#F9FAFB" }}>{activeMeta.label}</span>
                </>
              )}
            </div>
          )}

          {/* Module content */}
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "28px 32px" }}>
            {ActiveModule
              ? <ActiveModule {...moduleProps} />
              : <div style={{ color: "#6B7280", fontSize: 13 }}>Module not found.</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
