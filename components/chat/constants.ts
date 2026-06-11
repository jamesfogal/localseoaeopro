export const INDUSTRIES = [
  "Security Systems","HVAC","Plumbing","Electrical","Legal Services",
  "Medical / Healthcare","Dental","Restaurant / Food Service",
  "Retail","Home Services","Real Estate","Auto Services","Other",
];

export const AUDIT_SIGNALS = [
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

export const FLASH_MESSAGES = [
  "🔥 This is going to be a big one...",
  "👀 Finding things most tools completely miss.",
  "📊 Your competitors don't know we do this.",
  "🎯 Just flagged something in your local signals.",
  "💡 Three critical issues found so far — and counting.",
  "⚡ Checking your AI visibility on ChatGPT and Gemini...",
  "🔍 Digging deeper than any free tool can go.",
  "🚨 Your hosting is slowing things down more than you think.",
];

export const SC = (s: number) =>
  s >= 70 ? "#34D399" : s >= 50 ? "#FBBF24" : "#F87171";

let _id = 0;
export const uid = () => String(++_id);

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
