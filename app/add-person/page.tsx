"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Role = "admin" | "viewer" | null;

export default function AddPersonPage() {
  const [role, setRole] = useState<Role>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [personRole, setPersonRole] = useState("Employee");
  const [pay, setPay] = useState("");
  const [password, setPassword] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // People list
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setRole(d.role ?? null))
      .catch(() => setRole(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (role) fetchPeople();
  }, [role]);

  const fetchPeople = async () => {
    try {
      const res = await fetch("/api/people");
      const data = await res.json();
      setPeople(Array.isArray(data) ? data : []);
    } catch {
      setPeople([]);
    }
  };

  const handleDayToggle = (day: string) => {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleEdit = (person: any) => {
    setEditingId(person.id);
    setName(person.name);
    setEmail(person.email);
    setPersonRole(person.role);
    setPay(person.pay_per_hour.toString());
    const daysList = Object.keys(person.availability || {});
    setDays(daysList);
    if (daysList.length > 0) {
      const [start, end] = person.availability[daysList[0]][0].split("-");
      setStartTime(start);
      setEndTime(end);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName(""); setEmail(""); setPersonRole("Employee");
    setPay(""); setPassword(""); setStartTime(""); setEndTime(""); setDays([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this person?")) return;
    await fetch("/api/people", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPeople();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const availability = days.reduce((acc: any, day) => {
      acc[day] = [`${startTime}-${endTime}`];
      return acc;
    }, {});
    const isEditing = editingId !== null;
    try {
      const res = await fetch("/api/people", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing
            ? { id: editingId, name, email, role: personRole, pay_per_hour: Number(pay), availability, ...(password ? { password } : {}) }
            : { name, email, role: personRole, pay_per_hour: Number(pay), availability, password: password || null }
        ),
      });
      if (res.ok) {
        handleCancelEdit();
        fetchPeople();
      } else {
        alert("Error saving person");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar pageTitle="People" />
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar pageTitle={editingId ? "Edit Person" : "People"} />

      {/* MAIN CONTENT */}
      <div style={pageStyle}>

        {/* ADD / EDIT FORM — admin only */}
        {role === "admin" && (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>{editingId ? "Edit Person" : "Add New Person"}</h2>

            <form onSubmit={handleSubmit} style={formStyle}>
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
                    <option value="Employee">Employee</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Pay per Hour ($)</label>
                  <input style={inputStyle} type="number" placeholder="18.00" min="0" step="0.01" value={pay} onChange={(e) => setPay(e.target.value)} required />
                </div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Login Password <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — lets them sign in)</span></label>
                <input style={inputStyle} type="password" placeholder="Set a password…" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Available Days</label>
                <div style={daysGridStyle}>
                  {DAYS.map((day) => (
                    <label key={day} style={{ ...dayChipStyle, ...(days.includes(day) ? dayChipActiveStyle : {}) }}>
                      <input type="checkbox" checked={days.includes(day)} onChange={() => handleDayToggle(day)} style={{ display: "none" }} />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Available Hours</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input style={{ ...inputStyle, flex: 1 }} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>to</span>
                  <input style={{ ...inputStyle, flex: 1 }} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" style={primaryBtnStyle} disabled={submitting}>
                  {submitting ? "Saving…" : editingId ? "Update Person" : "Add Person"}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} style={ghostBtnStyle}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* VIEWER BANNER */}
        {role === "viewer" && (
          <div style={viewerBannerStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            You have view-only access. Contact an admin to make changes.
          </div>
        )}

        {/* PEOPLE LIST */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Team Directory</h2>
            <span style={badgeStyle}>{people.length} {people.length === 1 ? "person" : "people"}</span>
          </div>

          {people.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>No people added yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {people.map((person) => {
                const availDays = Object.keys(person.availability || {});
                const timeRange = availDays.length > 0 ? person.availability[availDays[0]]?.[0] : null;
                return (
                  <div key={person.id} style={personRowStyle}>
                    <div style={avatarStyle}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>{person.name}</span>
                        <span style={roleTagStyle}>{person.role}</span>
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "0.2rem" }}>{person.email}</div>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                        <span style={metaStyle}>${person.pay_per_hour}/hr</span>
                        {availDays.length > 0 && (
                          <span style={metaStyle}>{availDays.map((d: string) => d.slice(0, 3)).join(", ")}</span>
                        )}
                        {timeRange && <span style={metaStyle}>{timeRange.replace("-", " – ")}</span>}
                      </div>
                    </div>
                    {role === "admin" && (
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button onClick={() => handleEdit(person)} style={editBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(person.id)} style={deleteBtnStyle}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Styles ── */
const pageStyle: React.CSSProperties = {
  maxWidth: "780px", margin: "0 auto",
  padding: "6rem 1.5rem 3rem",
  display: "flex", flexDirection: "column", gap: "1.5rem",
};

const cardStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px",
  padding: "1.75rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem",
};

const formStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: "1.1rem",
};

const twoColStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
};

const fieldGroupStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: "0.35rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.875rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "0.95rem",
  color: "#0f172a",
  outline: "none",
  background: "#f8fafc",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const daysGridStyle: React.CSSProperties = {
  display: "flex", flexWrap: "wrap", gap: "0.5rem",
};

const dayChipStyle: React.CSSProperties = {
  padding: "0.4rem 0.875rem",
  borderRadius: "999px",
  border: "1.5px solid #e2e8f0",
  cursor: "pointer",
  fontSize: "0.82rem",
  fontWeight: 500,
  color: "#64748b",
  userSelect: "none",
  transition: "all 0.15s",
  background: "#f8fafc",
};

const dayChipActiveStyle: React.CSSProperties = {
  background: "#0f172a", color: "white", borderColor: "#0f172a",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "0.7rem 1.5rem",
  background: "#0f172a", color: "white",
  border: "none", borderRadius: "10px",
  fontSize: "0.9rem", fontWeight: 600,
  cursor: "pointer",
};

const ghostBtnStyle: React.CSSProperties = {
  padding: "0.7rem 1.25rem",
  background: "transparent", color: "#64748b",
  border: "1.5px solid #e2e8f0", borderRadius: "10px",
  fontSize: "0.9rem", fontWeight: 500,
  cursor: "pointer",
};

const viewerBannerStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.6rem",
  background: "#eff6ff", color: "#3b82f6",
  border: "1px solid #bfdbfe",
  borderRadius: "12px", padding: "0.875rem 1.25rem",
  fontSize: "0.875rem", fontWeight: 500,
};

const badgeStyle: React.CSSProperties = {
  background: "#f1f5f9", color: "#64748b",
  borderRadius: "999px", padding: "0.25rem 0.75rem",
  fontSize: "0.8rem", fontWeight: 500,
};

const personRowStyle: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: "1rem",
  padding: "1rem 1.25rem",
  borderRadius: "12px", border: "1px solid #f1f5f9",
  background: "#fafafa",
  transition: "box-shadow 0.15s",
};

const avatarStyle: React.CSSProperties = {
  width: "42px", height: "42px", borderRadius: "50%",
  background: "linear-gradient(135deg,#1a202c,#4a5568)",
  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: "1rem", flexShrink: 0,
};

const roleTagStyle: React.CSSProperties = {
  background: "#f1f5f9", color: "#475569",
  borderRadius: "999px", padding: "0.1rem 0.6rem",
  fontSize: "0.75rem", fontWeight: 500,
};

const metaStyle: React.CSSProperties = {
  color: "#94a3b8", fontSize: "0.8rem",
};

const editBtnStyle: React.CSSProperties = {
  padding: "0.4rem 0.875rem",
  background: "white", color: "#475569",
  border: "1.5px solid #e2e8f0", borderRadius: "8px",
  fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "0.4rem 0.875rem",
  background: "white", color: "#ef4444",
  border: "1.5px solid #fecaca", borderRadius: "8px",
  fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
};

const loadingStyle: React.CSSProperties = {
  height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
};

const spinnerStyle: React.CSSProperties = {
  width: "36px", height: "36px",
  border: "3px solid #e2e8f0",
  borderTopColor: "#0f172a",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
