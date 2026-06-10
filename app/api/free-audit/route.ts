import { NextRequest, NextResponse } from 'next/server';

// Proxies to PingClose audit engine (server-to-server, no CORS issues)
// Returns the same shape PingClose returns
export async function POST(req: NextRequest) {
  try {
    const { url, email, city, industry } = await req.json();
    if (!url || !email) {
      return NextResponse.json({ error: 'URL and email required' }, { status: 400 });
    }

    const res = await fetch('https://pingclose.com/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, email }),
    });

    const data = await res.json();

    // Attach the extra context for Q&A later
    return NextResponse.json({ ...data, city, industry });
  } catch (err) {
    console.error('free-audit error:', err);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
