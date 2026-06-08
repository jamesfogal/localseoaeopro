import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const normalized = url.startsWith('http') ? url : `https://${url}`;

    const res = await fetch(normalized, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalSEOAEOPro/1.0; +https://localseoaeopro.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Could not fetch page (HTTP ${res.status})` }, { status: 422 });
    }

    const html = await res.text();

    // ── Extract page title ───────────────────────────────────────────
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    // ── Strip scripts and styles before extracting headings ─────────
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '');

    function extractTags(tag: string): string[] {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      const results: string[] = [];
      let match;
      while ((match = regex.exec(cleaned)) !== null) {
        // Strip inner HTML tags to get text only
        const text = match[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#\d+;/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (text.length > 1 && text.length < 300) {
          results.push(text);
        }
      }
      return results;
    }

    const h1s = extractTags('h1');
    const h2s = extractTags('h2');
    const h3s = extractTags('h3');
    const h4s = extractTags('h4');

    return NextResponse.json({ pageTitle, h1s, h2s, h3s, h4s });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('timeout') || msg.includes('abort')) {
      return NextResponse.json({ error: 'Page took too long to respond (12s timeout)' }, { status: 422 });
    }
    return NextResponse.json({ error: `Failed to fetch page: ${msg}` }, { status: 500 });
  }
}
