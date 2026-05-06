import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { snapshotId, wpUsername, wpAppPassword, userId } = await req.json();

  if (!snapshotId || !wpUsername || !wpAppPassword || !userId) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // Get the snapshot
  const { data: snapshot, error: snapErr } = await supabaseAdmin
    .from("page_snapshots")
    .select("*")
    .eq("id", snapshotId)
    .eq("user_id", userId)
    .single();

  if (snapErr || !snapshot) {
    return NextResponse.json({ ok: false, error: "Snapshot not found" }, { status: 404 });
  }

  const original = snapshot.original_content as Record<string, unknown>;
  const base = (snapshot.page_url as string).replace(/\/[^/]*$/, "").replace(/\/$/, "");
  const token = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");
  const pageId = snapshot.wp_page_id as number;

  try {
    // Restore original content to WordPress
    const res = await fetch(`${base}/wp-json/wp/v2/pages/${pageId}`, {
      method: "POST",
      headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: (original.content as Record<string, string>)?.raw ?? original.content }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      // Try posts
      await fetch(`${base}/wp-json/wp/v2/posts/${pageId}`, {
        method: "POST",
        headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: (original.content as Record<string, string>)?.raw ?? original.content }),
        signal: AbortSignal.timeout(15000),
      });
    }

    // Mark snapshot as restored
    await supabaseAdmin
      .from("page_snapshots")
      .update({ status: "restored" })
      .eq("id", snapshotId);

    return NextResponse.json({ ok: true, message: "Page restored to original content" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
