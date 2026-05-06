import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { wpUrl, wpUsername, wpAppPassword, pageId, userId, fixDescription } = await req.json();

  if (!wpUrl || !wpUsername || !wpAppPassword || !pageId || !userId) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const base = wpUrl.replace(/\/$/, "");
  const token = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");

  try {
    // Fetch current page content from WordPress
    const res = await fetch(`${base}/wp-json/wp/v2/pages/${pageId}`, {
      headers: { Authorization: `Basic ${token}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      // Also try posts endpoint
      const postRes = await fetch(`${base}/wp-json/wp/v2/posts/${pageId}`, {
        headers: { Authorization: `Basic ${token}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!postRes.ok) {
        return NextResponse.json({ ok: false, error: `Could not fetch page ${pageId} from WordPress` }, { status: 400 });
      }
      const postData = await postRes.json();
      return await saveSnapshot(userId, pageId, postData, wpUrl, fixDescription);
    }

    const pageData = await res.json();
    return await saveSnapshot(userId, pageId, pageData, wpUrl, fixDescription);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

async function saveSnapshot(userId: string, pageId: number, wpData: Record<string, unknown>, wpUrl: string, fixDescription: string) {
  const { data, error } = await supabaseAdmin
    .from("page_snapshots")
    .insert({
      user_id: userId,
      wp_page_id: pageId,
      page_url: (wpData.link as string) ?? wpUrl,
      page_title: ((wpData.title as Record<string, string>)?.rendered) ?? `Page ${pageId}`,
      original_content: wpData,
      fix_description: fixDescription ?? "Fix applied",
      status: "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, snapshotId: data.id });
}
