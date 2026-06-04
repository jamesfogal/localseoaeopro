import { useState, useMemo } from "react";

const C = {
  bg: "#04080f", surface: "#080f1c", surface2: "#0d1528",
  border: "#152035", border2: "#1e2f48", text: "#eaf0ff",
  muted: "#4a6080", dim: "#1e3050",
  accent: "#0ea5e9", gold: "#f0b429", green: "#10d98a",
  red: "#ff4060", orange: "#ff7c42", purple: "#8b5cf6", teal: "#06b6d4",
};

// ============================================================
// SEARCH QUERY GENERATOR
// ============================================================
function buildQueries({ name, nameLLC, address, city, state, phone, website, oldPhone, oldAddress, oldWebsite }) {
  const domain = website.replace(/https?:\/\//i, "").replace(/\//g, "").trim();
  const excludeOwn = domain ? `-site:${domain}` : "";
  const excludeSocial = `-site:facebook.com -site:linkedin.com -site:instagram.com`;

  const sections = [
    {
      id: "master",
      label: "Master Search — Start Here",
      color: C.gold,
      icon: "⭐",
      description: "The most efficient starting point. Strips your own site and major social profiles to surface all third-party citation pages fast.",
      queries: [
        {
          label: "Master citation sweep",
          query: `"${name}" ${excludeOwn} ${excludeSocial}`,
          why: "Best single search to find all third-party citations quickly"
        },
        ...(nameLLC ? [{
          label: "Legal entity sweep",
          query: `"${nameLLC}" ${excludeOwn} ${excludeSocial}`,
          why: "Finds citations using the LLC or legal business name"
        }] : []),
      ]
    },
    {
      id: "name",
      label: "Business Name Variations",
      color: C.accent,
      icon: "🏷️",
      description: "Searches for every way your business name might appear — correctly and incorrectly.",
      queries: [
        { label: "Exact business name", query: `"${name}" ${excludeOwn}`, why: "Finds every page mentioning your exact business name" },
        ...(nameLLC ? [{ label: "LLC name", query: `"${nameLLC}" ${excludeOwn}`, why: "Finds pages using the legal entity name" }] : []),
        { label: "Name + city", query: `"${name}" "${city}" ${excludeOwn}`, why: "Surfaces geo-specific mentions" },
        { label: "Name + state", query: `"${name}" "${state}" ${excludeOwn}`, why: "Finds state-level directory listings" },
        { label: "Name + city + state", query: `"${name}" "${city}, ${state}" ${excludeOwn}`, why: "Finds full location combinations" },
      ]
    },
    {
      id: "contact",
      label: "Core Citation Data — Name + Contact",
      color: C.green,
      icon: "📞",
      description: "Searches for your phone number and address independently and in combination. Every result is a citation — correct or not.",
      queries: [
        ...(phone ? [
          { label: "Name + phone", query: `"${name}" "${phone}" ${excludeOwn}`, why: "Finds pages showing your current phone with your name" },
          { label: "Phone alone", query: `"${phone}" ${excludeOwn}`, why: "Finds EVERY page where this number appears — could reveal surprises" },
        ] : []),
        ...(address ? [
          { label: "Name + address", query: `"${name}" "${address}" ${excludeOwn}`, why: "Finds pages listing your current address" },
          { label: "Address alone", query: `"${address}" "${city}" ${excludeOwn}`, why: "Finds all pages with this address — may find old businesses at same location" },
        ] : []),
        ...(domain ? [
          { label: "Website URL mentions", query: `"${domain}" ${excludeOwn}`, why: "Finds every site that links to or mentions your URL" },
        ] : []),
      ]
    },
    {
      id: "errors",
      label: "Likely Error Patterns",
      color: C.red,
      icon: "🚨",
      description: "Searches for the most common ways your business name gets misspelled or altered. These bad citations hurt your rankings.",
      queries: buildErrorPatterns(name, city, state, excludeOwn)
    },
    {
      id: "oldnap",
      label: "Old NAP Footprint",
      color: C.orange,
      icon: "⏮️",
      description: "Searches for old phone numbers, addresses, and websites that are still indexed. Every one of these is actively hurting your local pack rankings.",
      queries: [
        ...(oldPhone ? [
          { label: "Name + old phone", query: `"${name}" "${oldPhone}" ${excludeOwn}`, why: "Finds all listings still showing your old phone number" },
          { label: "Old phone alone", query: `"${oldPhone}" ${excludeOwn}`, why: "Finds everywhere the old number still appears" },
        ] : []),
        ...(oldAddress ? [
          { label: "Name + old address", query: `"${name}" "${oldAddress}" ${excludeOwn}`, why: "Finds all listings still showing your old address" },
          { label: "Old address alone", query: `"${oldAddress}" "${city}" ${excludeOwn}`, why: "Finds everywhere the old address still appears" },
        ] : []),
        ...(oldWebsite ? [
          { label: "Name + old website", query: `"${name}" "${oldWebsite}" ${excludeOwn}`, why: "Finds listings pointing to an old or defunct website" },
        ] : []),
        ...(!oldPhone && !oldAddress && !oldWebsite ? [
          { label: "No old NAP provided", query: "", why: "Enter previous phone, address, or website above to search for old citations" }
        ] : [])
      ].filter(q => q.query !== "")
    },
    {
      id: "directories",
      label: "High-Priority Directory Checks",
      color: C.purple,
      icon: "📋",
      description: "These directories create the most citation inconsistencies because they aggregate data from multiple sources and often have outdated information.",
      queries: [
        { label: "Yelp", query: `"${name}" site:yelp.com`, why: "Yelp is one of the highest-authority local citation sources" },
        { label: "Facebook", query: `"${name}" site:facebook.com`, why: "Facebook business pages are heavily weighted local signals" },
        { label: "BBB", query: `"${name}" site:bbb.org`, why: "BBB is a high-trust citation source that Google verifies" },
        { label: "Angi", query: `"${name}" site:angi.com`, why: "Major home services directory — common source of bad data" },
        { label: "MapQuest", query: `"${name}" site:mapquest.com`, why: "MapQuest data feeds many other map-based directories" },
        { label: "Yellow Pages", query: `"${name}" site:yellowpages.com`, why: "YP data is syndicated across hundreds of other sites" },
        { label: "Manta", query: `"${name}" site:manta.com`, why: "Manta auto-generates listings that are often inaccurate" },
        { label: "Nextdoor", query: `"${name}" site:nextdoor.com`, why: "Nextdoor business pages visible in Google and trusted locally" },
        { label: "Yahoo Local", query: `"${name}" site:local.yahoo.com`, why: "Yahoo Local data syndicates to Bing and Apple Maps" },
        { label: "Foursquare", query: `"${name}" site:foursquare.com`, why: "Foursquare data feeds apps like Uber, Snapchat, and many others" },
        { label: "Superpages", query: `"${name}" site:superpages.com`, why: "Superpages syndicates to Verizon-owned properties" },
        { label: "City-Data", query: `"${name}" site:city-data.com`, why: "City-Data has high local authority and often has bad data" },
        { label: "Hotfrog", query: `"${name}" site:hotfrog.com`, why: "Hotfrog auto-generates listings from other sources" },
        { label: "ChamberOfCommerce.com", query: `"${name}" site:chamberofcommerce.com`, why: "Often has old or incorrect business data" },
        { label: "DexKnows", query: `"${name}" site:dexknows.com`, why: "Dex data feeds many regional directory networks" },
      ]
    },
    {
      id: "local",
      label: "Local & Community Sources",
      color: C.teal,
      icon: "🏘️",
      description: "The sources that most tools never check — local news, government sites, community organizations, chambers of commerce. This is where the surprising ones live.",
      queries: [
        { label: `${city} Chamber of Commerce`, query: `"${name}" "${city}" "chamber" ${excludeOwn}`, why: "Chamber listings often have outdated member data" },
        { label: "Local newspaper mentions", query: `"${name}" "${city}" site:patch.com OR site:stltoday.com OR site:ksdk.com OR site:kmov.com`, why: "News mentions contain NAP data that may be outdated" },
        { label: "Government / city registries", query: `"${name}" site:.gov "${city}"`, why: "Business permits, licenses, and contractor registries" },
        { label: "Nonprofit/event sponsorships", query: `"${name}" "sponsor" OR "supporter" "${city}" ${excludeOwn}`, why: "Event sponsor pages often list business info incorrectly" },
        { label: "School and community pages", query: `"${name}" "school" OR "community" "${city}" ${excludeOwn}`, why: "Local sponsorships on school sites often have stale data" },
        { label: "Neighborhood associations", query: `"${name}" "neighborhood" OR "HOA" OR "association" "${city}" ${excludeOwn}`, why: "Neighborhood sites list local businesses and rarely update" },
      ]
    }
  ];

  return sections;
}

function buildErrorPatterns(name, city, state, excludeOwn) {
  const words = name.split(" ");
  const patterns = [];

  // Space insertion / removal
  if (name.includes(" ")) {
    const noSpace = name.replace(/\s+/g, "");
    patterns.push({ label: `No spaces: "${noSpace}"`, query: `"${noSpace}" ${excludeOwn}`, why: "Common data entry error — spaces removed" });
  }

  // Each word capitalization variant
  const lowerName = name.toLowerCase();
  if (lowerName !== name) {
    patterns.push({ label: `Lowercase name`, query: `"${lowerName}" ${excludeOwn}`, why: "Some systems store names in lowercase" });
  }

  // Abbreviation of common words
  const abbrevMap = { "Street": "St", "Avenue": "Ave", "Drive": "Dr", "Boulevard": "Blvd", "Systems": "Sys", "Services": "Svcs", "Company": "Co", "Corporation": "Corp" };
  for (const [full, abbrev] of Object.entries(abbrevMap)) {
    if (name.includes(full)) {
      const abbrevName = name.replace(full, abbrev);
      patterns.push({ label: `Abbreviated: "${abbrevName}"`, query: `"${abbrevName}" ${excludeOwn}`, why: `Common abbreviation of "${full}" to "${abbrev}"` });
    }
    if (name.includes(abbrev)) {
      const expandedName = name.replace(abbrev, full);
      patterns.push({ label: `Expanded: "${expandedName}"`, query: `"${expandedName}" ${excludeOwn}`, why: `Expansion of "${abbrev}" to "${full}"` });
    }
  }

  // Singular/plural
  if (name.endsWith("s")) {
    const singular = name.slice(0, -1);
    patterns.push({ label: `Singular: "${singular}"`, query: `"${singular}" ${excludeOwn}`, why: "Missing the S at the end" });
  } else {
    patterns.push({ label: `Plural: "${name}s"`, query: `"${name}s" ${excludeOwn}`, why: "Extra S added to end of name" });
  }

  // The + name
  patterns.push({ label: `"The ${name}"`, query: `"The ${name}" ${excludeOwn}`, why: "Some directories add 'The' to business names" });

  // Name + LLC, Inc, etc
  patterns.push({ label: `"${name} Inc"`, query: `"${name} Inc" ${excludeOwn}`, why: "Directories sometimes append Inc or LLC even if not in name" });

  // &  vs "and"
  if (name.includes(" & ")) {
    patterns.push({ label: `"and" instead of &`, query: `"${name.replace(" & ", " and ")}" ${excludeOwn}`, why: "Some systems convert & to 'and'" });
  }
  if (name.toLowerCase().includes(" and ")) {
    patterns.push({ label: `& instead of "and"`, query: `"${name.replace(/ and /i, " & ")}" ${excludeOwn}`, why: "Some systems convert 'and' to &" });
  }

  return patterns.slice(0, 10); // Cap at 10 error patterns
}

// ============================================================
// TRACKING SHEET
// ============================================================
const SHEET_COLS = [
  "Website / Source Name",
  "URL Found",
  "Name Shown",
  "Address Shown",
  "Phone Shown",
  "Website Shown",
  "Correct or Incorrect",
  "Fix Needed",
  "Status"
];

function TrackingSheet({ entries, onUpdate, onAdd, businessName, phone, address }) {
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newRow, setNewRow] = useState({});

  const startEdit = (i) => {
    setEditingRow(i);
    setEditValues({ ...entries[i] });
  };

  const saveEdit = (i) => {
    onUpdate(i, editValues);
    setEditingRow(null);
  };

  const statusColor = { "✅ Fixed": C.green, "🔴 Needs Fix": C.red, "⚠️ Partial": C.orange, "📋 Logged": C.muted };

  const exportCSV = () => {
    const rows = [SHEET_COLS.join(",")];
    entries.forEach(e => {
      rows.push(SHEET_COLS.map(col => {
        const key = col.toLowerCase().replace(/[^a-z]/g, "_");
        const val = e[key] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${businessName.replace(/\s+/g, "-")}-citation-audit.csv`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", marginBottom: 2 }}>CITATION TRACKING SPREADSHEET</div>
          <div style={{ fontSize: 12, color: C.muted }}>As you run each search in Google, paste your findings here. Record every source — accurate or not.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onAdd} style={{ background: `${C.green}15`, border: `1px solid ${C.green}35`, color: C.green, padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
            + Add Row
          </button>
          <button onClick={exportCSV} style={{ background: `${C.accent}15`, border: `1px solid ${C.accent}35`, color: C.accent, padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* COLUMN HEADERS */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: C.surface2 }}>
              {SHEET_COLS.map((col, i) => (
                <th key={i} style={{
                  padding: "8px 10px", fontSize: 9, color: C.muted,
                  fontFamily: "monospace", letterSpacing: "0.08em",
                  textAlign: "left", borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap", textTransform: "uppercase"
                }}>{col}</th>
              ))}
              <th style={{ padding: "8px 10px", width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const isEditing = editingRow === i;
              const sc = statusColor[entry.status] || C.muted;
              const isIncorrect = entry.correct_or_incorrect?.toLowerCase().includes("incorrect") || entry.correct_or_incorrect === "❌ Incorrect";

              return (
                <tr key={i} style={{
                  background: isEditing ? C.surface2 : isIncorrect ? `${C.red}06` : "transparent",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  {isEditing ? (
                    <>
                      {[
                        { key: "website_source_name", w: 140 },
                        { key: "url_found", w: 140 },
                        { key: "name_shown", w: 120 },
                        { key: "address_shown", w: 140 },
                        { key: "phone_shown", w: 110 },
                        { key: "website_shown", w: 110 },
                        { key: "correct_or_incorrect", w: 90, options: ["✅ Correct", "❌ Incorrect", "⚠️ Partial"] },
                        { key: "fix_needed", w: 160 },
                        { key: "status", w: 100, options: ["📋 Logged", "🔴 Needs Fix", "⚠️ Partial", "✅ Fixed"] },
                      ].map((f, j) => (
                        <td key={j} style={{ padding: "4px 6px" }}>
                          {f.options ? (
                            <select value={editValues[f.key] || ""} onChange={e => setEditValues({ ...editValues, [f.key]: e.target.value })}
                              style={{ width: f.w, background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 4, padding: "4px 6px", color: C.text, fontSize: 11, fontFamily: "monospace", outline: "none" }}>
                              <option value="">—</option>
                              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input value={editValues[f.key] || ""} onChange={e => setEditValues({ ...editValues, [f.key]: e.target.value })}
                              style={{ width: f.w, background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 4, padding: "4px 6px", color: C.text, fontSize: 11, fontFamily: "monospace", outline: "none" }} />
                          )}
                        </td>
                      ))}
                      <td style={{ padding: "4px 6px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => saveEdit(i)} style={{ background: `${C.green}20`, border: `1px solid ${C.green}40`, color: C.green, padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 10 }}>✓</button>
                          <button onClick={() => setEditingRow(null)} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 10 }}>✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: "8px 10px", fontSize: 12, color: C.text, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.website_source_name || "—"}</td>
                      <td style={{ padding: "8px 10px", maxWidth: 140 }}>
                        {entry.url_found ? (
                          <a href={entry.url_found.startsWith("http") ? entry.url_found : `https://${entry.url_found}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: C.accent, textDecoration: "none", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "nowrap" }}>
                            {entry.url_found}
                          </a>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "8px 10px", fontSize: 11, color: entry.name_shown !== businessName ? C.red : C.green, fontFamily: "monospace", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name_shown || "—"}</td>
                      <td style={{ padding: "8px 10px", fontSize: 11, color: C.muted, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.address_shown || "—"}</td>
                      <td style={{ padding: "8px 10px", fontSize: 11, color: entry.phone_shown && entry.phone_shown !== phone ? C.red : C.muted, fontFamily: "monospace" }}>{entry.phone_shown || "—"}</td>
                      <td style={{ padding: "8px 10px", fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{entry.website_shown || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
                          background: entry.correct_or_incorrect?.includes("Correct") && !entry.correct_or_incorrect?.includes("In") ? `${C.green}15` : entry.correct_or_incorrect?.includes("Incorrect") ? `${C.red}15` : `${C.orange}15`,
                          color: entry.correct_or_incorrect?.includes("Correct") && !entry.correct_or_incorrect?.includes("In") ? C.green : entry.correct_or_incorrect?.includes("Incorrect") ? C.red : C.orange,
                        }}>{entry.correct_or_incorrect || "—"}</span>
                      </td>
                      <td style={{ padding: "8px 10px", fontSize: 11, color: C.muted, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{entry.fix_needed || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", background: `${sc}15`, color: sc }}>
                          {entry.status || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <button onClick={() => startEdit(i)} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 10 }}>✏️</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: 13 }}>
                  Run searches in Google → paste every finding you find here → mark each one correct or incorrect
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      {entries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }}>
          {[
            { label: "Total Found", val: entries.length, color: C.accent },
            { label: "Correct", val: entries.filter(e => e.correct_or_incorrect?.includes("✅")).length, color: C.green },
            { label: "Incorrect", val: entries.filter(e => e.correct_or_incorrect?.includes("❌")).length, color: C.red },
            { label: "Fixed", val: entries.filter(e => e.status?.includes("Fixed")).length, color: C.teal },
          ].map((s, i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// QUERY CARD
// ============================================================
function QueryCard({ q, index }) {
  const [copied, setCopied] = useState(false);

  const openGoogle = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(q.query)}`;
    window.open(url, "_blank");
  };

  const copy = () => {
    navigator.clipboard.writeText(q.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!q.query) return (
    <div style={{ padding: "10px 14px", background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 6, marginBottom: 6 }}>
      <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>{q.why}</div>
    </div>
  );

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 6, marginBottom: 6, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 22, height: 22, borderRadius: 4, background: `${C.accent}12`, border: `1px solid ${C.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.accent, fontFamily: "monospace", flexShrink: 0 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 3 }}>{q.label}</div>
          <div style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>{q.query}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={copy} style={{
            background: copied ? `${C.green}15` : `${C.accent}10`,
            border: `1px solid ${copied ? C.green : C.accent}30`,
            color: copied ? C.green : C.accent,
            padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "monospace"
          }}>{copied ? "✓ COPIED" : "COPY"}</button>
          <button onClick={openGoogle} style={{
            background: `${C.gold}10`, border: `1px solid ${C.gold}30`,
            color: C.gold, padding: "5px 10px", borderRadius: 4,
            cursor: "pointer", fontSize: 10, fontFamily: "monospace"
          }}>SEARCH ↗</button>
        </div>
      </div>
      {q.why && (
        <div style={{ padding: "0 14px 8px 46px", fontSize: 11, color: C.muted, fontStyle: "italic" }}>{q.why}</div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function CitationSearchEngine() {
  // INPUTS
  const [name, setName] = useState("");
  const [nameLLC, setNameLLC] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [oldPhone, setOldPhone] = useState("");
  const [oldAddress, setOldAddress] = useState("");
  const [oldWebsite, setOldWebsite] = useState("");
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("searches");
  const [activeSection, setActiveSection] = useState("master");

  // TRACKING SHEET
  const [entries, setEntries] = useState([]);

  const sections = useMemo(() => {
    if (!generated || !name) return [];
    return buildQueries({ name, nameLLC, address, city, state, phone, website, oldPhone, oldAddress, oldWebsite });
  }, [generated, name, nameLLC, address, city, state, phone, website, oldPhone, oldAddress, oldWebsite]);

  const totalQueries = sections.reduce((sum, s) => sum + s.queries.filter(q => q.query).length, 0);

  const addBlankRow = () => {
    setEntries([...entries, {
      website_source_name: "", url_found: "", name_shown: "", address_shown: "",
      phone_shown: "", website_shown: "", correct_or_incorrect: "", fix_needed: "", status: "📋 Logged"
    }]);
    setActiveTab("sheet");
  };

  const updateEntry = (i, vals) => {
    const updated = [...entries];
    updated[i] = vals;
    setEntries(updated);
  };

  const openAllInSection = (section) => {
    section.queries.filter(q => q.query).forEach((q, i) => {
      setTimeout(() => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(q.query)}`, "_blank");
      }, i * 400);
    });
  };

  const canGenerate = name.trim() && city.trim();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif", padding: "0 0 80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; }`}</style>

      {/* HEADER */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "22px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: `${C.accent}10`, border: `1px solid ${C.accent}25`, color: C.accent, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 12px", borderRadius: 2, marginBottom: 10 }}>
            CITATION SEARCH ENGINE
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px,4vw,44px)", fontWeight: 800, lineHeight: 1, margin: "0 0 8px", color: "#fff" }}>
            Citation <span style={{ color: C.accent }}>Search Engine</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 13, fontFamily: "monospace", margin: 0, lineHeight: 1.6 }}>
            Generates every Google search query to find every web mention of your business · Opens them in Google · Tracks every finding
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* HOW IT WORKS */}
        <div style={{ background: `${C.gold}06`, border: `1px solid ${C.gold}20`, borderRadius: 8, padding: "14px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 6 }}>THE METHODOLOGY</div>
          <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7 }}>
            We do not check a list of directories. We generate Google search queries using exact-match and exclusion operators that surface every indexed mention of your business — whether it is on Yelp, a local newspaper from 2015, a school fundraiser sponsor page, or a neighborhood association directory. Enter your canonical NAP, generate the queries, run them in Google one by one, and record every finding in the tracking sheet. This is the manual methodology that finds the hidden inconsistencies no automated tool discovers.
          </p>
        </div>

        {/* INPUT FORM */}
        {!generated && (
          <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 18 }}>
              STEP 1 — ENTER YOUR CANONICAL NAP
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>★ EXACT BUSINESS NAME (as it should appear everywhere)</div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Citywide Alarms"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}40`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", fontFamily: "monospace", boxSizing: "border-box", fontWeight: 700 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>LEGAL ENTITY NAME if different (e.g. "Citywide Alarms LLC")</div>
                <input value={nameLLC} onChange={e => setNameLLC(e.target.value)} placeholder="Citywide Alarms LLC"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>★ STREET ADDRESS</div>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="965 Sycamore Dr"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}40`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>★ CITY</div>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="St. Charles"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}40`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>★ STATE</div>
                <input value={state} onChange={e => setState(e.target.value)} placeholder="MO"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}40`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: C.red, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>★ PHONE NUMBER — we search for this across the entire web</div>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(314) 266-6760"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.red}50`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 15, outline: "none", fontFamily: "monospace", boxSizing: "border-box", fontWeight: 700 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>WEBSITE (domain only)</div>
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="citywidealarms.com"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* OLD NAP */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: C.orange, fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 8 }}>
                ⚡ OLD NAP — CRITICAL IF YOU HAVE MOVED OR CHANGED YOUR NUMBER
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.6 }}>
                If you changed your phone number or moved locations, your old information is still indexed across the web and actively suppressing your rankings. We search for these too and surface every stale listing.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "PREVIOUS PHONE NUMBER", val: oldPhone, set: setOldPhone, ph: "Old number if changed" },
                  { label: "PREVIOUS ADDRESS", val: oldAddress, set: setOldAddress, ph: "Old address if moved" },
                  { label: "OLD WEBSITE", val: oldWebsite, set: setOldWebsite, ph: "Old domain if changed" },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 9, color: C.orange, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 5 }}>{f.label}</div>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width: "100%", background: C.surface, border: `1px solid ${C.orange}30`, borderRadius: 4, padding: "8px 10px", color: C.text, fontSize: 12, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { if (canGenerate) setGenerated(true); }} disabled={!canGenerate}
              style={{
                width: "100%",
                background: canGenerate ? `linear-gradient(135deg, ${C.accent}, #0369a1)` : C.surface2,
                color: canGenerate ? "#fff" : C.muted,
                border: "none", borderRadius: 8, padding: "13px 24px",
                fontSize: 14, fontWeight: 800, cursor: canGenerate ? "pointer" : "not-allowed",
                fontFamily: "'Syne', sans-serif"
              }}>
              Generate All Search Queries →
            </button>
          </div>
        )}

        {/* GENERATED QUERIES */}
        {generated && sections.length > 0 && (
          <div>
            {/* SUMMARY BAR */}
            <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: "monospace" }}>{totalQueries}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>search queries generated</div>
              </div>
              <div style={{ width: 1, height: 40, background: C.border2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                  Canonical NAP: <span style={{ color: C.gold, fontFamily: "monospace" }}>{name}</span> · <span style={{ color: C.green, fontFamily: "monospace" }}>{phone}</span> · <span style={{ color: C.teal, fontFamily: "monospace" }}>{address}, {city}, {state}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>Run each search in Google. Record every result in the tracking sheet. Mark each one correct or incorrect.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setGenerated(false)} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.muted, padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                  ← Edit Inputs
                </button>
                <button onClick={addBlankRow} style={{ background: `${C.green}15`, border: `1px solid ${C.green}35`, color: C.green, padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                  + Log a Finding
                </button>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "searches", label: `🔍 Search Queries (${totalQueries})` },
                { id: "sheet", label: `📋 Tracking Sheet (${entries.length} logged)` },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  background: activeTab === t.id ? C.surface2 : "transparent",
                  border: `1px solid ${activeTab === t.id ? C.accent : C.border}`,
                  color: activeTab === t.id ? C.accent : C.muted,
                  padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "monospace"
                }}>{t.label}</button>
              ))}
            </div>

            {/* SEARCHES TAB */}
            {activeTab === "searches" && (
              <div>
                {/* SECTION NAVIGATION */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                  {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                      background: activeSection === s.id ? `${s.color}12` : "transparent",
                      border: `1px solid ${activeSection === s.id ? s.color : C.border}`,
                      color: activeSection === s.id ? s.color : C.muted,
                      padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 11,
                      fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5
                    }}>
                      <span>{s.icon}</span>
                      <span style={{ display: "none" }}>{s.label.split("—")[0].trim()}</span>
                      <span>{s.label}</span>
                      <span style={{ fontSize: 9, opacity: 0.7 }}>({s.queries.filter(q => q.query).length})</span>
                    </button>
                  ))}
                </div>

                {sections.filter(s => s.id === activeSection).map(section => (
                  <div key={section.id}>
                    <div style={{ background: `${section.color}06`, border: `1px solid ${section.color}20`, borderRadius: 8, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: section.color, marginBottom: 4 }}>{section.icon} {section.label}</div>
                        <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>{section.description}</p>
                      </div>
                      <button onClick={() => openAllInSection(section)} style={{
                        background: `${section.color}10`, border: `1px solid ${section.color}30`,
                        color: section.color, padding: "6px 12px", borderRadius: 5,
                        cursor: "pointer", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0
                      }}>
                        Open All in Google ↗
                      </button>
                    </div>
                    {section.queries.map((q, i) => <QueryCard key={i} q={q} index={i} />)}

                    {/* WORKFLOW REMINDER */}
                    <div style={{ marginTop: 16, padding: "12px 16px", background: `${C.green}06`, border: `1px solid ${C.green}15`, borderRadius: 6, display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 18 }}>📋</span>
                      <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                        Found a citation in this section? Click <strong style={{ color: C.green }}>+ Log a Finding</strong> or switch to the <strong style={{ color: C.green }}>Tracking Sheet</strong> tab to record it. Note the URL, the name/address/phone shown, and whether it is correct.
                      </p>
                      <button onClick={addBlankRow} style={{ background: `${C.green}15`, border: `1px solid ${C.green}35`, color: C.green, padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0 }}>
                        + Log Finding
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TRACKING SHEET TAB */}
            {activeTab === "sheet" && (
              <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 20 }}>
                <TrackingSheet
                  entries={entries}
                  onUpdate={updateEntry}
                  onAdd={addBlankRow}
                  businessName={name}
                  phone={phone}
                  address={address}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
