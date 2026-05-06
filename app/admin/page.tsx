"use client";

import { useState } from "react";

type Profile = {
  id: string; created_at: string; business_name: string; email?: string;
  website: string; phone: string; city: string; country: string; industry: string;
  wp_url?: string;
};
type Audit   = { id: string; created_at: string; user_id: string; module_id: string; module_status: string; };
type Snap    = { id: string; created_at: string; user_id: string; page_url: string; page_title: string; fix_description: string; status: string; };

export default function AdminPage() {
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authErr, setAuthErr]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [profiles, setProfiles]   = useState<Profile[]>([]);
  const [audits, setAudits]       = useState<Audit[]>([]);
  const [snaps, setSnaps]         = useState<Snap[]>([]);
  const [selected, setSelected]   = useState<Profile | null>(null);
  const [tab, setTab]             = useState<"users"|"audits"|"snapshots">("users");

  const inp: React.CSSProperties = { padding: "10px 14px", background: "#0B0E16", border: "1px solid #1E293B", borderRadius: 7, color: "#F1F5F9", fontSize: 14, outline: "none" };

  async function handleAuth(ev: React.FormEvent) {
    ev.preventDefault();
    setAuthErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      let data: { ok?: boolean; error?: string };
      try {
        data = await res.json();
      } catch {
        setAuthErr("Server returned an invalid response. Try again.");
        return;
      }
      if (!data.ok) {
        setAuthErr(res.status === 401 ? "Wrong password" : (data.error || "Sign-in failed"));
        return;
      }

      const dr = await fetch("/api/admin-audits", { headers: { "x-admin-password": password } });
      let dd: { ok?: boolean; error?: string; profiles?: Profile[]; audits?: Audit[]; snapshots?: Snap[] };
      try {
        dd = await dr.json();
      } catch {
        setAuthErr("Could not load admin data (bad response). Check Supabase env on the server.");
        return;
      }
      if (!dd.ok) {
        setAuthErr(dd.error || "Could not load admin data. Check SUPABASE_SERVICE_ROLE_KEY and database tables.");
        return;
      }
      setProfiles(dd.profiles ?? []);
      setAudits(dd.audits ?? []);
      setSnaps(dd.snapshots ?? []);
      setAuthed(true);
    } catch {
      setAuthErr("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusColor: Record<string, string> = { clean: "#34D399", "needs-work": "#FBBF24", critical: "#F87171", multiple: "#94A3B8" };
  const snapColor:   Record<string, string> = { active: "#34D399", restored: "#FBBF24" };
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (!authed) return (
    <main style={{ background: "#0B0E16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 360, width: "100%", padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#F87171", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Super Admin</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Admin Access</h1>
        </div>
        <div style={{ background: "#161B2E", border: "1px solid #1E293B", borderRadius: 12, padding: 24 }}>
          <form onSubmit={handleAuth}>
            <input {...{style: { ...inp, width: "100%", boxSizing: "border-box", marginBottom: 12 }}} type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            {authErr && <div style={{ color: "#F87171", fontSize: 12, marginBottom: 10 }}>{authErr}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px", background: "#F87171", border: "none", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Checking…" : "Enter Admin →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );

  const userAudits   = (u: Profile) => audits.filter(a => a.user_id === u.id);
  const userSnaps    = (u: Profile) => snaps.filter(s => s.user_id === u.id);

  return (
    <div style={{ background: "#0B0E16", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#F1F5F9" }}>
      {/* Header */}
      <div style={{ background: "#111827", borderBottom: "1px solid #374151", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#F87171", letterSpacing: "2px", textTransform: "uppercase", marginRight: 12 }}>Super Admin</span>
          <span style={{ fontSize: 13, color: "#94A3B8" }}>{profiles.length} users · {audits.length} audits · {snaps.length} snapshots</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["users","audits","snapshots"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(null); }} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #374151", background: tab === t ? "#1F2937" : "transparent", color: tab === t ? "#F9FAFB" : "#94A3B8", fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>
        {/* List panel */}
        <div style={{ width: 420, flexShrink: 0, borderRight: "1px solid #374151", overflowY: "auto" }}>
          {tab === "users" && profiles.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} style={{ padding: "12px 20px", borderBottom: "1px solid #1F2937", cursor: "pointer", background: selected?.id === p.id ? "#1F2937" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{p.business_name || "—"}</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>{fmt(p.created_at)}</div>
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{p.website || "—"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#64748B" }}>{p.city}</span>
                {p.wp_url && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#34D39920", color: "#34D399" }}>WP Connected</span>}
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#60A5FA20", color: "#60A5FA" }}>{userAudits(p).length} audits</span>
              </div>
            </div>
          ))}

          {tab === "audits" && audits.map(a => (
            <div key={a.id} style={{ padding: "10px 20px", borderBottom: "1px solid #1F2937" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#F1F5F9" }}>{a.module_id}</div>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: (statusColor[a.module_status] || "#94A3B8") + "20", color: statusColor[a.module_status] || "#94A3B8" }}>{a.module_status || "—"}</span>
              </div>
              <div style={{ fontSize: 10, color: "#64748B" }}>{fmt(a.created_at)}</div>
            </div>
          ))}

          {tab === "snapshots" && snaps.map(s => (
            <div key={s.id} style={{ padding: "10px 20px", borderBottom: "1px solid #1F2937" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#F1F5F9" }}>{s.page_title}</div>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: (snapColor[s.status] || "#94A3B8") + "20", color: snapColor[s.status] || "#94A3B8" }}>{s.status}</span>
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{s.fix_description}</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>{fmt(s.created_at)}</div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {!selected && tab === "users" && (
            <div style={{ color: "#64748B", fontSize: 13, marginTop: 40, textAlign: "center" }}>Select a user to see their full details</div>
          )}
          {selected && tab === "users" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px" }}>{selected.business_name}</h2>
                <div style={{ fontSize: 13, color: "#94A3B8" }}>Joined {fmt(selected.created_at)}</div>
              </div>
              {[
                { label: "Website", value: selected.website },
                { label: "City", value: selected.city },
                { label: "Country", value: selected.country },
                { label: "Phone", value: selected.phone },
                { label: "Industry", value: selected.industry },
                { label: "WP URL", value: selected.wp_url || "Not connected" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid #1F2937" }}>
                  <div style={{ fontSize: 11, color: "#64748B", width: 90, flexShrink: 0 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#F1F5F9" }}>{value || "—"}</div>
                </div>
              ))}

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Audits ({userAudits(selected).length})</div>
                {userAudits(selected).length === 0 && <div style={{ fontSize: 12, color: "#64748B" }}>No audits run yet</div>}
                {userAudits(selected).map(a => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: "#111827", borderRadius: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#F1F5F9" }}>{a.module_id}</span>
                    <span style={{ fontSize: 10, color: statusColor[a.module_status] || "#94A3B8" }}>{a.module_status}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Page Snapshots ({userSnaps(selected).length})</div>
                {userSnaps(selected).length === 0 && <div style={{ fontSize: 12, color: "#64748B" }}>No snapshots saved yet</div>}
                {userSnaps(selected).map(s => (
                  <div key={s.id} style={{ padding: "8px 10px", background: "#111827", borderRadius: 6, marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#F1F5F9" }}>{s.page_title}</span>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: (snapColor[s.status] || "#94A3B8") + "20", color: snapColor[s.status] || "#94A3B8" }}>{s.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{s.fix_description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
