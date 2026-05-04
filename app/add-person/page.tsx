"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Person = {
  id: number;
  name: string;
  email?: string;
  role: string;
  pay_per_hour?: number;
  availability?: Record<string, string[]> | null;
  teams: { id: number; name: string }[];
};

type Team = {
  id: number;
  name: string;
  members: { id: number; name: string }[];
};

type CustomRole = { id: number; name: string };

export default function AddPersonPage() {
  const [perms, setPerms]         = useState<string[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  const [people, setPeople]   = useState<Person[]>([]);
  const [teams, setTeams]     = useState<Team[]>([]);
  const [roles, setRoles]     = useState<CustomRole[]>([]);

  // Search & filter
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  // Add / edit form
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [personRole, setPersonRole] = useState("Employee");
  const [pay, setPay]               = useState("");
  const [password, setPassword]     = useState("");
  const [startTime, setStartTime]   = useState("");
  const [endTime, setEndTime]       = useState("");
  const [days, setDays]             = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Teams UI
  const [newTeamName, setNewTeamName]       = useState("");
  const [creatingTeam, setCreatingTeam]     = useState(false);
  const [managingTeamId, setManagingTeamId] = useState<number | null>(null);

  // Derived permission flags
  const can = (p: string) => perms.includes(p);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setPerms(Array.isArray(d.permissions) ? d.permissions : []))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (perms.length === 0) return;
    if (can("people.view"))  fetchPeople();
    if (can("teams.view"))   fetchTeams();
    if (can("roles.view"))   fetchRoles();
  }, [perms]); // intentionally omitting fetch helpers — they are stable references

  const fetchPeople = async () => {
    const data = await fetch("/api/people").then((r) => r.json());
    setPeople(Array.isArray(data) ? data : []);
  };

  const fetchTeams = async () => {
    const data = await fetch("/api/teams").then((r) => r.json());
    setTeams(Array.isArray(data) ? data : []);
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/roles");
    const data = await res.json();
    setRoles(Array.isArray(data) ? data : []);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return people.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !(p.email ?? "").toLowerCase().includes(q)) return false;
      if (filterRole && p.role !== filterRole) return false;
      if (filterTeam && !p.teams.some((t) => t.id === Number(filterTeam))) return false;
      return true;
    });
  }, [people, search, filterRole, filterTeam]);

  /* ── Form helpers ── */
  const resetForm = () => {
    setEditingId(null); setShowForm(false);
    setName(""); setEmail(""); setPersonRole("Employee");
    setPay(""); setPassword(""); setStartTime(""); setEndTime(""); setDays([]);
  };

  const handleEdit = (p: Person) => {
    setEditingId(p.id); setName(p.name); setEmail(p.email ?? ""); setPersonRole(p.role);
    setPay(p.pay_per_hour?.toString() ?? "");
    const daysList = Object.keys(p.availability ?? {});
    setDays(daysList);
    if (daysList.length > 0) {
      const [s, e] = (p.availability![daysList[0]][0] ?? "-").split("-");
      setStartTime(s ?? ""); setEndTime(e ?? "");
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this person?")) return;
    await fetch("/api/people", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const availability = days.reduce((acc: Record<string, string[]>, day) => {
      acc[day] = [`${startTime}-${endTime}`]; return acc;
    }, {});
    const isEditing = editingId !== null;
    const res = await fetch("/api/people", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEditing
          ? { id: editingId, name, email, role: personRole, pay_per_hour: Number(pay), availability, ...(password ? { password } : {}) }
          : { name, email, role: personRole, pay_per_hour: Number(pay), availability, password: password || null }
      ),
    });
    if (res.ok) { resetForm(); fetchPeople(); }
    else alert("Error saving person");
    setSubmitting(false);
  };

  /* ── Teams helpers ── */
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newTeamName.trim()) return; setCreatingTeam(true);
    const res  = await fetch("/api/teams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName.trim() }),
    });
    const data = await res.json();
    if (res.ok) { setTeams((prev) => [...prev, data]); setNewTeamName(""); }
    else alert(data.error ?? "Failed to create team");
    setCreatingTeam(false);
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Delete this team?")) return;
    await fetch("/api/teams", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTeams((prev) => prev.filter((t) => t.id !== id));
    if (managingTeamId === id) setManagingTeamId(null);
    fetchPeople();
  };

  const toggleMember = async (teamId: number, personId: number, currentlyIn: boolean) => {
    await fetch("/api/teams", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentlyIn ? { teamId, removePersonIds: [personId] } : { teamId, addPersonIds: [personId] }),
    });
    setTeams((prev) => prev.map((t) => {
      if (t.id !== teamId) return t;
      const person = people.find((p) => p.id === personId);
      if (!person) return t;
      return currentlyIn
        ? { ...t, members: t.members.filter((m) => m.id !== personId) }
        : { ...t, members: [...t.members, { id: person.id, name: person.name }] };
    }));
    setPeople((prev) => prev.map((p) => {
      if (p.id !== personId) return p;
      const team = teams.find((t) => t.id === teamId);
      if (!team) return p;
      return currentlyIn
        ? { ...p, teams: p.teams.filter((t) => t.id !== teamId) }
        : { ...p, teams: [...p.teams, { id: team.id, name: team.name }] };
    }));
  };

  if (authLoading) return (
    <>
      <Navbar pageTitle="People" />
      <div style={loadingStyle}><div style={spinnerStyle} /></div>
    </>
  );

  const roleOptions = roles.map((r) => r.name);

  return (
    <>
      <Navbar pageTitle={editingId ? "Edit Person" : "People"} />
      <div style={pageStyle}>

        {/* Read-only banner */}
        {!can("people.add") && !can("people.edit") && !can("teams.edit") && (
          <div style={viewerBannerStyle}>
            <InfoIcon /> You have view-only access. Contact an admin to make changes.
          </div>
        )}

        {/* Add / Edit form */}
        {can("people.add") && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ ...sectionTitleStyle, margin: 0 }}>
                {editingId ? "Edit Person" : "Add New Person"}
              </h2>
              {!editingId && (
                <button style={ghostBtnStyle} onClick={() => setShowForm((v) => !v)}>
                  {showForm ? "Cancel" : "+ Add Person"}
                </button>
              )}
            </div>

            {(showForm || editingId) && (
              <form onSubmit={handleSubmit} style={{ ...formStyle, marginTop: "1.25rem" }}>
                <div style={twoColStyle}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div style={twoColStyle}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Role</label>
                    <select style={inputStyle} value={personRole} onChange={(e) => setPersonRole(e.target.value)}>
                      {(roleOptions.length ? roleOptions : ["Employee", "Team Lead", "Manager"]).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  {can("pay.edit") && (
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Pay per Hour ($)</label>
                      <input style={inputStyle} type="number" placeholder="18.00" min="0" step="0.01" value={pay} onChange={(e) => setPay(e.target.value)} required />
                    </div>
                  )}
                </div>

                {can("accounts.set_password") && (
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>
                      Login Password <span style={hintSpan}>(optional — lets them sign in)</span>
                    </label>
                    <input style={inputStyle} type="password" placeholder="Set a password…" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                  </div>
                )}

                {can("availability.edit") && (
                  <>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Available Days</label>
                      <div style={daysGridStyle}>
                        {DAYS.map((day) => (
                          <label key={day} style={{ ...dayChipStyle, ...(days.includes(day) ? dayChipActiveStyle : {}) }}>
                            <input type="checkbox" checked={days.includes(day)} onChange={() => setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])} style={{ display: "none" }} />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Available Hours</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <input style={{ ...inputStyle, flex: 1 }} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        <span style={{ color: "#94a3b8" }}>to</span>
                        <input style={{ ...inputStyle, flex: 1 }} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="submit" style={primaryBtnStyle} disabled={submitting}>
                    {submitting ? "Saving…" : editingId ? "Update Person" : "Add Person"}
                  </button>
                  <button type="button" onClick={resetForm} style={ghostBtnStyle}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Teams */}
        {can("teams.view") && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Teams</h2>
              <span style={badgeStyle}>{teams.length} {teams.length === 1 ? "team" : "teams"}</span>
            </div>

            {can("teams.edit") && (
              <form onSubmit={handleCreateTeam} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="New team name…" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required />
                <button type="submit" style={primaryBtnStyle} disabled={creatingTeam}>
                  {creatingTeam ? "Creating…" : "Create"}
                </button>
              </form>
            )}

            {teams.length === 0 ? (
              <p style={emptyStyle}>No teams yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {teams.map((team) => (
                  <div key={team.id} style={teamCardStyle}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={teamNameStyle}>{team.name}</span>
                        <span style={{ ...badgeStyle, marginLeft: "0.625rem" }}>{team.members.length} members</span>
                      </div>
                      {can("teams.edit") && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={editBtnStyle} onClick={() => setManagingTeamId(managingTeamId === team.id ? null : team.id)}>
                            {managingTeamId === team.id ? "Done" : "Manage"}
                          </button>
                          <button style={deleteBtnStyle} onClick={() => handleDeleteTeam(team.id)}>Delete</button>
                        </div>
                      )}
                    </div>

                    {team.members.length > 0 && managingTeamId !== team.id && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.625rem" }}>
                        {team.members.map((m) => <span key={m.id} style={memberChipStyle}>{m.name}</span>)}
                      </div>
                    )}

                    {managingTeamId === team.id && (
                      <div style={managePanelStyle}>
                        <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                          Toggle people in / out of <strong>{team.name}</strong>
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          {people.map((p) => {
                            const inTeam = team.members.some((m) => m.id === p.id);
                            return (
                              <label key={p.id} style={memberToggleStyle(inTeam)}>
                                <input type="checkbox" checked={inTeam} onChange={() => toggleMember(team.id, p.id, inTeam)} style={{ accentColor: "#0f172a" }} />
                                <span style={{ fontWeight: 500, color: "#0f172a" }}>{p.name}</span>
                                <span style={{ color: "#94a3b8", fontSize: "0.8rem", marginLeft: "auto" }}>{p.role}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* People directory */}
        {can("people.view") && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Team Directory</h2>
              <span style={badgeStyle}>{filtered.length} / {people.length}</span>
            </div>

            <div style={filterRowStyle}>
              <input style={{ ...inputStyle, flex: 2, minWidth: 0 }} placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">All roles</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
              {can("teams.view") && (
                <select style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
                  <option value="">All teams</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
                {people.length === 0 ? "No people added yet." : "No results match your search."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                {filtered.map((person) => {
                  const availDays = Object.keys(person.availability ?? {});
                  const timeRange = availDays.length > 0 ? person.availability![availDays[0]]?.[0] : null;
                  return (
                    <div key={person.id} style={personRowStyle}>
                      <div style={avatarStyle}>{person.name.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>{person.name}</span>
                          <span style={roleTagStyle}>{person.role}</span>
                          {person.teams.map((t) => <span key={t.id} style={teamTagStyle}>{t.name}</span>)}
                        </div>
                        {can("emails.view") && person.email && (
                          <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "0.2rem" }}>{person.email}</div>
                        )}
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                          {can("pay.view") && person.pay_per_hour !== undefined && (
                            <span style={metaStyle}>${person.pay_per_hour}/hr</span>
                          )}
                          {can("availability.view") && availDays.length > 0 && (
                            <span style={metaStyle}>{availDays.map((d) => d.slice(0, 3)).join(", ")}</span>
                          )}
                          {can("availability.view") && timeRange && (
                            <span style={metaStyle}>{timeRange.replace("-", " – ")}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        {can("people.edit") && <button onClick={() => handleEdit(person)} style={editBtnStyle}>Edit</button>}
                        {can("people.delete") && <button onClick={() => handleDelete(person.id)} style={deleteBtnStyle}>Delete</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ── Styles ── */
const pageStyle: React.CSSProperties = { maxWidth: "820px", margin: "0 auto", padding: "6rem 1.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.5rem" };
const cardStyle: React.CSSProperties = { background: "white", borderRadius: "16px", padding: "1.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" };
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "1.1rem" };
const twoColStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const fieldGroupStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.35rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" };
const hintSpan: React.CSSProperties = { color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 };
const inputStyle: React.CSSProperties = { padding: "0.65rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.9rem", color: "#0f172a", outline: "none", background: "#f8fafc", width: "100%", boxSizing: "border-box" };
const daysGridStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem" };
const dayChipStyle: React.CSSProperties = { padding: "0.4rem 0.875rem", borderRadius: "999px", border: "1.5px solid #e2e8f0", cursor: "pointer", fontSize: "0.82rem", fontWeight: 500, color: "#64748b", userSelect: "none", background: "#f8fafc" };
const dayChipActiveStyle: React.CSSProperties = { background: "#0f172a", color: "white", borderColor: "#0f172a" };
const primaryBtnStyle: React.CSSProperties = { padding: "0.65rem 1.25rem", background: "#0f172a", color: "white", border: "none", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" };
const ghostBtnStyle: React.CSSProperties = { padding: "0.65rem 1.25rem", background: "transparent", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" };
const viewerBannerStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.6rem", background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "0.875rem 1.25rem", fontSize: "0.875rem", fontWeight: 500 };
const filterRowStyle: React.CSSProperties = { display: "flex", gap: "0.75rem", flexWrap: "wrap" };
const badgeStyle: React.CSSProperties = { background: "#f1f5f9", color: "#64748b", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.8rem", fontWeight: 500 };
const emptyStyle: React.CSSProperties = { color: "#94a3b8", fontSize: "0.875rem", margin: 0 };
const teamCardStyle: React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.875rem 1.125rem", background: "#fafafa" };
const teamNameStyle: React.CSSProperties = { fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" };
const memberChipStyle: React.CSSProperties = { background: "#f1f5f9", color: "#475569", borderRadius: "999px", padding: "0.2rem 0.625rem", fontSize: "0.78rem", fontWeight: 500 };
const managePanelStyle: React.CSSProperties = { marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px solid #e2e8f0" };
const memberToggleStyle = (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.75rem", borderRadius: "8px", cursor: "pointer", background: active ? "#f0fdf4" : "transparent", border: `1px solid ${active ? "#bbf7d0" : "transparent"}` });
const personRowStyle: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#fafafa" };
const avatarStyle: React.CSSProperties = { width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#1a202c,#4a5568)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", flexShrink: 0 };
const roleTagStyle: React.CSSProperties = { background: "#f1f5f9", color: "#475569", borderRadius: "999px", padding: "0.1rem 0.6rem", fontSize: "0.75rem", fontWeight: 500 };
const teamTagStyle: React.CSSProperties = { background: "#eff6ff", color: "#3b82f6", borderRadius: "999px", padding: "0.1rem 0.6rem", fontSize: "0.75rem", fontWeight: 500 };
const metaStyle: React.CSSProperties = { color: "#94a3b8", fontSize: "0.8rem" };
const editBtnStyle: React.CSSProperties = { padding: "0.4rem 0.875rem", background: "white", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" };
const deleteBtnStyle: React.CSSProperties = { padding: "0.4rem 0.875rem", background: "white", color: "#ef4444", border: "1.5px solid #fecaca", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" };
const loadingStyle: React.CSSProperties = { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" };
const spinnerStyle: React.CSSProperties = { width: "36px", height: "36px", border: "3px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.7s linear infinite" };
