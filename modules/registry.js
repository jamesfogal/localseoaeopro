/**
 * LocalRank Pro — Master Module Registry v2
 * All 32 modules registered with nav group, tag, and import path
 */

export const NAV_STRUCTURE = [
  {
    group: "Overview",
    modules: [
      { id: "WhiteLabelReportGenerator", tag: "WLR", label: "Report Generator",         color: "#A78BFA" },
      { id: "AutoFixEngine",             tag: "AFE", label: "AutoFix Engine",            color: "#10D9A0" },
    ]
  },
  {
    group: "On-Page Audit",
    modules: [
      { id: "HeadingStructureAuditor",   tag: "HDG", label: "Heading Structure H1-H4",  color: "#60A5FA" },
      { id: "TitleMetaAuditor",          tag: "T/M", label: "Title & Meta Tags",         color: "#60A5FA" },
      { id: "CanonicalAuditor",          tag: "CAN", label: "Canonical Audit",           color: "#A78BFA" },
      { id: "ImageAuditor",              tag: "IMG", label: "Image Auditor",             color: "#60A5FA" },
      { id: "InternalLinkAuditor",       tag: "ILA", label: "Internal Links",            color: "#94A3B8" },
      { id: "CriticalSignalsChecker",    tag: "CSC", label: "Critical Signals",          color: "#F87171" },
    ]
  },
  {
    group: "Keywords",
    modules: [
      { id: "KeywordInspector",          tag: "KI",  label: "Keyword Inspector",         color: "#A78BFA" },
      { id: "KeywordOwnershipMap",       tag: "KO",  label: "Keyword Ownership Map",     color: "#A78BFA" },
      { id: "KeywordIntelligence",       tag: "KX",  label: "Keyword Intelligence",      color: "#A78BFA" },
    ]
  },
  {
    group: "Competitors",
    modules: [
      { id: "CompetitorIntelligence",    tag: "CX",  label: "Competitor Intelligence",   color: "#F87171" },
    ]
  },
  {
    group: "Local Presence",
    modules: [
      { id: "GeoGridTracker",            tag: "GRD", label: "GeoGrid Map Tracker",       color: "#10D9A0" },
      { id: "GBPOptimizer",              tag: "GBP", label: "GBP Optimizer",             color: "#34D399" },
      { id: "GBPPostScheduler",          tag: "GPS", label: "GBP Post Scheduler",        color: "#34D399" },
      { id: "GBPListingProtection",      tag: "GLP", label: "GBP Listing Protection",    color: "#F87171" },
      { id: "CitationIntelligence",      tag: "CIT", label: "Citation Intelligence",     color: "#34D399" },
      { id: "CitationAutoSubmit",        tag: "CAS", label: "Citation Auto Submit",      color: "#34D399" },
      { id: "ReviewRequestCampaign",     tag: "RRC", label: "Review Request Campaign",   color: "#F87171" },
      { id: "MultiPlatformReviewMonitor",tag: "RPM", label: "Review Monitor",            color: "#F87171" },
    ]
  },
  {
    group: "Content Generation",
    modules: [
      { id: "AIVisibilityChecker",       tag: "AVC", label: "AI Visibility Checker",     color: "#10D9A0" },
      { id: "AEOQAGeneratorV2",          tag: "AQ2", label: "AEO Q&A Generator V2",      color: "#10D9A0" },
      { id: "AEOQAPageGenerator",        tag: "AEO", label: "AEO Q&A Generator V1",      color: "#10D9A0" },
      { id: "CityPageGenerator",         tag: "CPG", label: "City Page Generator",       color: "#FBBF24" },
      { id: "BlogPlanner",               tag: "BLG", label: "Blog Planner",              color: "#FBBF24" },
      { id: "FAQGenerator",              tag: "FAQ", label: "FAQ Generator",             color: "#FBBF24" },
      { id: "PricingPageGenerator",      tag: "PRC", label: "Pricing Page Generator",    color: "#FBBF24" },
      { id: "ComparisonPageGenerator",   tag: "CMP", label: "Comparison Pages",          color: "#FBBF24" },
    ]
  },
  {
    group: "Technical",
    modules: [
      { id: "PageSpeedIntelligence",     tag: "PSI", label: "Page Speed Intelligence",   color: "#F87171" },
      { id: "HostingIntelligence",       tag: "HST", label: "Hosting Intelligence",      color: "#60A5FA" },
      { id: "RankTracker",               tag: "RNK", label: "Rank Tracker",              color: "#94A3B8" },
      { id: "BacklinkFinder",            tag: "BKL", label: "Backlink Finder",           color: "#94A3B8" },
      { id: "XMLSitemapBuilder",         tag: "XML", label: "XML Sitemap Builder",       color: "#94A3B8" },
    ]
  },
];

export const MODULE_MANIFEST = NAV_STRUCTURE.flatMap(g =>
  g.modules.map(m => ({ ...m, group: g.group }))
);

export default MODULE_MANIFEST;
