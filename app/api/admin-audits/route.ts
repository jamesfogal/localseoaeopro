import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

    const { data: audits } = await supabaseAdmin
      .from("audits")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: snapshots } = await supabaseAdmin
      .from("page_snapshots")
      .select("id, created_at, user_id, page_url, page_title, fix_description, status")
      .order("created_at", { ascending: false });

    return NextResponse.json({ ok: true, profiles: profiles ?? [], audits: audits ?? [], snapshots: snapshots ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: msg.includes("SUPABASE") ? msg : `Admin data error: ${msg}` },
      { status: 500 }
    );
  }
}
