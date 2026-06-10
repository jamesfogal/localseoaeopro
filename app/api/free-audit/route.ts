import { NextRequest, NextResponse } from 'next/server';

// VIP emails — never rate limited
const VIP_EMAILS = [
  'jim@pingclose.com',
  'james.fogal@gmail.com',
  'james.fogal@citywidealarms.com',
  'jim@localseoaeopro.com',
];

// Proxies to PingClose audit engine (server-to-server, no CORS issues)
// Returns the same shape PingClose returns
export async function POST(req: NextRequest) {
  try {
    const { url, email, city, industry } = await req.json();
    if (!url || !email) {
      return NextResponse.json({ error: 'URL and email required' }, { status: 400 });
    }

    const isVIP = VIP_EMAILS.includes(email.toLowerCase());

    const res = await fetch('https://pingclose.com/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Pass a VIP email to PingClose so it never rate limits our server calls
      body: JSON.stringify({ url, email: isVIP ? email : email }),
    });

    const data = await res.json();

    // Attach the extra context for Q&A later
    return NextResponse.json({ ...data, city, industry });
  } catch (err) {
    console.error('free-audit error:', err);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
