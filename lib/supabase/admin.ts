import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  admin = createClient(url, key ?? "", {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return admin;
}

/**
 * Service-role client. Lazily created on first use so `next build` (e.g. on Vercel
 * when env is only injected at runtime) does not throw during "Collecting page data".
 * Route modules may import this file; the client is not constructed until a property
 * is accessed.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
