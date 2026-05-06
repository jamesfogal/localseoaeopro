import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { wpUrl, wpUsername, wpAppPassword } = await req.json();
  if (!wpUrl || !wpUsername || !wpAppPassword) {
    return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
  }

  const base = wpUrl.replace(/\/$/, "");
  const token = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");

  try {
    const res = await fetch(`${base}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `WordPress returned ${res.status} — check your URL and credentials` }, { status: 400 });
    }

    const user = await res.json();

    const siteRes = await fetch(`${base}/wp-json`, {
      headers: { Authorization: `Basic ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    const site = await siteRes.json();

    return NextResponse.json({ ok: true, siteName: site.name, siteUrl: site.url, wpUser: user.name, wpVersion: site.namespaces });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
