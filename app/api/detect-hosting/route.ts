import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) return NextResponse.json({ ok: false, error: "url param required" }, { status: 400 });

  const targetUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(targetUrl, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
    });

    clearTimeout(timer);

    // Collect all response headers
    const h: Record<string, string> = {};
    res.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });

    // ── Cloudflare detection ──────────────────────────────────────────────────
    const cfRay    = h["cf-ray"]          ?? null;
    const cfCache  = h["cf-cache-status"] ?? null;
    const cfConnIp = h["cf-connecting-ip"]?? null;
    const serverHdr = (h["server"] ?? "").toLowerCase();
    const cloudflareActive = !!(cfRay || cfCache || cfConnIp || serverHdr === "cloudflare");

    // ── Web server ─────────────────────────────────────────────────────────────
    let webServer = "Unknown";
    if (serverHdr.includes("litespeed"))  webServer = "LiteSpeed";
    else if (serverHdr.includes("nginx")) webServer = "Nginx";
    else if (serverHdr.includes("apache"))webServer = "Apache";
    else if (serverHdr === "cloudflare")  webServer = "Cloudflare";
    else if (h["server"])                 webServer = h["server"];

    // ── HTTP protocol ─────────────────────────────────────────────────────────
    // Infer from alt-svc or known Cloudflare behaviour
    const altSvc = h["alt-svc"] ?? "";
    const httpProtocol = altSvc.includes("h3") ? "HTTP/3"
      : (cloudflareActive || altSvc.includes("h2")) ? "HTTP/2"
      : "HTTP/1.1";

    // ── Hosting fingerprints ───────────────────────────────────────────────────
    let detectedHost   = "Unknown";
    let detectionMethod = "HTTP response headers";
    let tier           = "budget";
    let detectionConfidence = "medium";

    if (h["x-kinsta-cache"] !== undefined) {
      detectedHost = "Kinsta"; tier = "premium"; detectionConfidence = "high";
      detectionMethod = "x-kinsta-cache header";
    } else if (h["x-wpe-request-id"] !== undefined || (h["x-powered-by"] ?? "").includes("WP Engine")) {
      detectedHost = "WP Engine"; tier = "premium"; detectionConfidence = "high";
      detectionMethod = "x-wpe-request-id header";
    } else if (h["x-sg-route"] !== undefined || h["x-sg-host"] !== undefined) {
      detectedHost = "SiteGround"; tier = "quality"; detectionConfidence = "high";
      detectionMethod = "x-sg-route header";
    } else if (h["x-nf-request-id"] !== undefined || h["x-netlify-id"] !== undefined) {
      detectedHost = "Netlify"; tier = "managed"; detectionConfidence = "high";
      detectionMethod = "Netlify request-id header";
    } else if (h["x-vercel-id"] !== undefined) {
      detectedHost = "Vercel"; tier = "managed"; detectionConfidence = "high";
      detectionMethod = "x-vercel-id header";
    } else if ((h["x-cache"] ?? "").toLowerCase().includes("cloudfront")) {
      detectedHost = "AWS CloudFront"; tier = "managed"; detectionConfidence = "high";
      detectionMethod = "CloudFront x-cache header";
    } else if (h["fly-request-id"] !== undefined) {
      detectedHost = "Fly.io"; tier = "managed"; detectionConfidence = "high";
      detectionMethod = "fly-request-id header";
    } else if ((h["x-powered-by"] ?? "").includes("Pagely")) {
      detectedHost = "Pagely"; tier = "premium"; detectionConfidence = "high";
      detectionMethod = "x-powered-by Pagely header";
    } else if ((h["x-powered-by"] ?? "").includes("Pressable")) {
      detectedHost = "Pressable"; tier = "managed"; detectionConfidence = "high";
      detectionMethod = "x-powered-by Pressable header";
    } else if (cloudflareActive) {
      // Cloudflare proxies the origin — we can still try to fingerprint the origin
      detectedHost = "Origin hidden behind Cloudflare";
      detectionMethod = "Cloudflare proxy detected (origin server masked)";
      tier = "unknown"; detectionConfidence = "high";
    } else if (webServer === "LiteSpeed") {
      detectedHost = "LiteSpeed-based host (likely SiteGround, A2, or Hostinger)";
      tier = "quality"; detectionConfidence = "medium";
      detectionMethod = "LiteSpeed server header";
    } else if (webServer === "Nginx") {
      detectedHost = "Nginx-based host"; tier = "budget"; detectionConfidence = "low";
      detectionMethod = "Nginx server header (many hosts use Nginx)";
    } else if (webServer === "Apache") {
      detectedHost = "Apache-based host"; tier = "budget"; detectionConfidence = "low";
      detectionMethod = "Apache server header (many hosts use Apache)";
    }

    // ── Notable headers for transparency ─────────────────────────────────────
    const notable = [
      "server","x-powered-by","cf-ray","cf-cache-status","x-kinsta-cache",
      "x-wpe-request-id","x-sg-route","x-vercel-id","x-nf-request-id",
      "x-cache","alt-svc","via","age","cache-control","content-encoding",
    ].reduce<Record<string,string>>((acc, k) => {
      if (h[k]) acc[k] = h[k];
      return acc;
    }, {});

    return NextResponse.json({
      ok: true,
      url: targetUrl,
      status: res.status,
      cloudflareActive,
      cloudflareHeaders: { "cf-ray": cfRay, "cf-cache-status": cfCache },
      webServer,
      httpProtocol,
      detectedHost,
      detectionMethod,
      detectionConfidence,
      tier,
      notableHeaders: notable,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
