import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { snapshotId, wpUrl, wpUsername, wpAppPassword, pageId, newContent, userId } = await req.json();

  if (!snapshotId || !wpUrl || !wpUsername || !wpAppPassword || !pageId || !newContent || !userId) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // Safety: confirm snapshot exists before applying any fix
  const { data: snapshot } = await supabaseAdmin
    .from("page_snapshots")
    .select("id")
    .eq("id", snapshotId)
    .eq("user_id", userId)
    .single();

  if (!snapshot) {
    return NextResponse.json({ ok: false, error: "No backup found — fix blocked. Take a snapshot first." }, { status: 400 });
  }

  const base = wpUrl.replace(/\/$/, "");
  const token = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");

  try {
    const res = await fetch(`${base}/wp-json/wp/v2/pages/${pageId}`, {
      method: "POST",
      headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      // Try posts endpoint
      const postRes = await fetch(`${base}/wp-json/wp/v2/posts/${pageId}`, {
        method: "POST",
        headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
        signal: AbortSignal.timeout(15000),
      });
      if (!postRes.ok) {
        return NextResponse.json({ ok: false, error: `WordPress rejected the update: ${res.status}` }, { status: 400 });
      }
    }

    // Save the fixed content to the snapshot record
    await supabaseAdmin
      .from("page_snapshots")
      .update({ fixed_content: { raw: newContent } })
      .eq("id", snapshotId);

    return NextResponse.json({ ok: true, message: "Fix applied. Use the restore endpoint if you need to roll back." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
