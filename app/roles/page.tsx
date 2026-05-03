"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { PERMISSION_GROUPS, ALL_PERMISSIONS } from "@/lib/permissions";

type RoleRow = {
  id: number;
  name: string;
  permission_level: "admin" | "viewer";
  is_builtin: number;
  permissions: string[];
};

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles]           = useState<RoleRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pending, setPending]       = useState<Record<number, string[]>>({});
  const [saving, setSaving]         = useState<number | null>(null);

  // New role form
  const [newName, setNewName]   = useState("");
  const [newLevel, setNewLevel] = useState<"viewer" | "admin">("viewer");
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.permissions?.includes("roles.view")) { router.replace("/"); return; }
        fetchRoles();
      })
      .finally(() => setLoading(false));
  }, [router]);

  const fetchRoles = async () => {
    const res  = await fetch("/api/roles");
    const data = await res.json();
    if (Array.isArray(data)) {
      setRoles(data);
      const init: Record<number, string[]> = {};
      for (const r of data) init[r.id] = [...r.permissions];
      setPending(init);
    }
  };

  /* ── Permission toggling ── */
  const toggle = (roleId: number, perm: string) => {
    setPending((prev) => {
      const cur = prev[roleId] ?? [];
      return {
        ...prev,
        [roleId]: cur.includes(perm) ? cur.filter((p) => p !== perm) : [...cur, perm],
      };
    });
  };

  const toggleGroup = (roleId: number, groupPerms: readonly { key: string }[]) => {
    const keys = groupPerms.map((p) => p.key);
    setPending((prev) => {
      const cur = prev[roleId] ?? [];
      const allIn = keys.every((k) => cur.includes(k));
      return {
        ...prev,
        [roleId]: allIn ? cur.filter((p) => !keys.includes(p)) : [...new Set([...cur, ...keys])],
      };
    });
  };

  const toggleAll = (roleId: number) => {
    setPending((prev) => {
      const cur = prev[roleId] ?? [];
      const allIn = ALL_PERMISSIONS.every((p) => cur.includes(p));
      return { ...prev, [roleId]: allIn ? [] : [...ALL_PERMISSIONS] };
    });
  };

  const saveRole = async (role: RoleRow) => {
    setSaving(role.id);
    const perms = pending[role.id] ?? role.permissions;
    const newLevel = perms.length === ALL_PERMISSIONS.length ? "admin"
      : role.permission_level; // preserve existing level unless all granted

    const res = await fetch("/api/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: role.id, permissions: perms, permission_level: newLevel }),
    });
    if (res.ok) {
      setRoles((prev) => prev.map((r) => r.id === role.id ? { ...r, permissions: perms, permission_level: newLevel } : r));
    } else {
      alert("Failed to save");
    }
    setSaving(null);
  };

  /* ── New role creation ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setCreateErr("");
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, permission_level: newLevel, permissions: newPerms }),
    });
    const data = await res.json();
    if (res.ok) {
      setRoles((prev) => [...prev, data]);
      setPending((prev) => ({ ...prev, [data.id]: [...newPerms] }));
      setNewName(""); setNewLevel("viewer"); setNewPerms([]);
    } else {
      setCreateErr(data.error ?? "Failed");
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this role?")) return;
    const res = await fetch("/api/roles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setRoles((prev) => prev.filter((r) => r.id !== id));
    else {
      const d = await res.json();
      alert(d.error ?? "Failed");
    }
  };

  if (loading) return (
    <>
      <Navbar pageTitle="Roles & Permissions" />
      <div style={pageStyle}><div style={spinnerStyle} /></div>
    </>
  );

  const builtIn = roles.filter((r) => r.is_builtin);
  const custom  = roles.filter((r) => !r.is_builtin);

  return (
    <>
      <Navbar pageTitle="Roles & Permissions" />
      <div style={pageStyle}>

        {/* ── Create role ── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Create New Role</h2>
          <form onSubmit={handleCreate} style={formStyle}>
            <div style={twoCol}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Role Name</label>
                <input style={inputStyle} placeholder="e.g. Supervisor" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Base Level</label>
                <select style={inputStyle} value={newLevel} onChange={(e) => setNewLevel(e.target.value as "viewer" | "admin")}>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Starting Permissions</label>
              <div style={permGridStyle}>
                {PERMISSION_GROUPS.map((group) => {
                  const keys = group.perms.map((p) => p.key);
                  const allIn = keys.every((k) => newPerms.includes(k));
                  return (
                    <div key={group.label} style={groupBoxStyle}>
                      <label style={groupHeaderStyle}>
                        <input type="checkbox" checked={allIn} onChange={() =>
                          setNewPerms((prev) =>
                            allIn ? prev.filter((p) => !keys.includes(p)) : [...new Set([...prev, ...keys])]
                          )
                        } style={{ accentColor: "#0f172a" }} />
                        {group.label}
                      </label>
                      {group.perms.map((p) => (
                        <label key={p.key} style={permRowStyle}>
                          <input type="checkbox" checked={newPerms.includes(p.key)}
                            onChange={() => setNewPerms((prev) =>
                              prev.includes(p.key) ? prev.filter((x) => x !== p.key) : [...prev, p.key]
                            )}
                            style={{ accentColor: "#0f172a" }}
                          />
                          <span style={{ fontSize: "0.82rem", color: "#374151" }}>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {createErr && <p style={errorStyle}>{createErr}</p>}
            <button type="submit" style={primaryBtn} disabled={creating}>
              {creating ? "Creating…" : "Create Role"}
            </button>
          </form>
        </div>

        {/* ── All roles ── */}
        {[...builtIn, ...custom].map((role) => {
          const cur         = pending[role.id] ?? role.permissions;
          const isExpanded  = expandedId === role.id;
          const isDirty     = JSON.stringify(cur.slice().sort()) !== JSON.stringify(role.permissions.slice().sort());
          const allChecked  = ALL_PERMISSIONS.every((p) => cur.includes(p));
          const someChecked = ALL_PERMISSIONS.some((p) => cur.includes(p));

          return (
            <div key={role.id} style={cardStyle}>
              {/* Role header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={roleNameStyle}>{role.name}</span>
                <span style={levelBadge(role.permission_level)}>
                  {role.permission_level === "admin" ? "Admin" : "Viewer"}
                </span>
                {role.is_builtin ? <span style={builtinBadge}>Built-in</span> : null}
                <span style={countBadge}>{cur.length} / {ALL_PERMISSIONS.length} permissions</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                  {!role.is_builtin && (
                    <button style={deleteBtnStyle} onClick={() => handleDelete(role.id)}>Delete</button>
                  )}
                  <button
                    style={ghostBtn}
                    onClick={() => setExpandedId(isExpanded ? null : role.id)}
                  >
                    {isExpanded ? "Collapse" : "Edit Permissions"}
                  </button>
                  {isExpanded && isDirty && (
                    <button style={primaryBtn} onClick={() => saveRole(role)} disabled={saving === role.id}>
                      {saving === role.id ? "Saving…" : "Save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Permission editor */}
              {isExpanded && (
                <div style={{ marginTop: "1.25rem" }}>
                  {/* Select all */}
                  <label style={{ ...groupHeaderStyle, marginBottom: "1rem", fontSize: "0.85rem" }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked; }}
                      onChange={() => toggleAll(role.id)}
                      style={{ accentColor: "#0f172a" }}
                    />
                    Select all permissions
                  </label>

                  <div style={permGridStyle}>
                    {PERMISSION_GROUPS.map((group) => {
                      const keys   = group.perms.map((p) => p.key);
                      const allIn  = keys.every((k) => cur.includes(k));
                      const someIn = keys.some((k) => cur.includes(k));
                      return (
                        <div key={group.label} style={groupBoxStyle}>
                          <label style={groupHeaderStyle}>
                            <input
                              type="checkbox"
                              checked={allIn}
                              ref={(el) => { if (el) el.indeterminate = !allIn && someIn; }}
                              onChange={() => toggleGroup(role.id, group.perms)}
                              style={{ accentColor: "#0f172a" }}
                            />
                            {group.label}
                          </label>
                          {group.perms.map((p) => (
                            <label key={p.key} style={permRowStyle}>
                              <input
                                type="checkbox"
                                checked={cur.includes(p.key)}
                                onChange={() => toggle(role.id, p.key)}
                                style={{ accentColor: "#0f172a" }}
                              />
                              <span style={{ fontSize: "0.82rem", color: "#374151" }}>{p.label}</span>
                            </label>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {isDirty && (
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                      <button style={primaryBtn} onClick={() => saveRole(role)} disabled={saving === role.id}>
                        {saving === role.id ? "Saving…" : "Save Changes"}
                      </button>
                      <button style={ghostBtn} onClick={() =>
                        setPending((prev) => ({ ...prev, [role.id]: [...role.permissions] }))
                      }>
                        Discard
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Styles ── */
const pageStyle: React.CSSProperties = {
  maxWidth: "900px", margin: "0 auto", padding: "6rem 1.5rem 3rem",
  display: "flex", flexDirection: "column", gap: "1.25rem",
};
const cardStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px", padding: "1.75rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};
const sectionTitle: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.1rem",
};
const formStyle: React.CSSProperties    = { display: "flex", flexDirection: "column", gap: "1rem" };
const twoCol: React.CSSProperties       = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const fieldStyle: React.CSSProperties   = { display: "flex", flexDirection: "column", gap: "0.35rem" };
const labelStyle: React.CSSProperties   = {
  fontSize: "0.8rem", fontWeight: 600, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.04em",
};
const inputStyle: React.CSSProperties   = {
  padding: "0.65rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "10px",
  fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc", outline: "none", boxSizing: "border-box",
};
const permGridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem",
};
const groupBoxStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem",
  display: "flex", flexDirection: "column", gap: "0.35rem", background: "#fafafa",
};
const groupHeaderStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.5rem",
  fontWeight: 700, fontSize: "0.8rem", color: "#0f172a",
  cursor: "pointer", userSelect: "none",
};
const permRowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.5rem",
  cursor: "pointer", userSelect: "none",
};
const primaryBtn: React.CSSProperties = {
  padding: "0.65rem 1.25rem", background: "#0f172a", color: "white",
  border: "none", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
  alignSelf: "flex-start",
};
const ghostBtn: React.CSSProperties = {
  padding: "0.65rem 1.25rem", background: "transparent", color: "#64748b",
  border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
};
const errorStyle: React.CSSProperties = { color: "#ef4444", fontSize: "0.85rem", margin: 0 };
const roleNameStyle: React.CSSProperties = { fontWeight: 700, fontSize: "1rem", color: "#0f172a" };
const levelBadge = (level: "admin" | "viewer"): React.CSSProperties => ({
  display: "inline-block",
  background: level === "admin" ? "#fef3c7" : "#f1f5f9",
  color: level === "admin" ? "#92400e" : "#475569",
  borderRadius: "999px", padding: "0.15rem 0.65rem", fontSize: "0.75rem", fontWeight: 500,
});
const builtinBadge: React.CSSProperties = {
  background: "#f1f5f9", color: "#94a3b8",
  borderRadius: "999px", padding: "0.15rem 0.65rem", fontSize: "0.75rem", fontWeight: 500,
};
const countBadge: React.CSSProperties = {
  background: "#eff6ff", color: "#3b82f6",
  borderRadius: "999px", padding: "0.15rem 0.65rem", fontSize: "0.75rem", fontWeight: 500,
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "0.4rem 0.875rem", background: "white", color: "#ef4444",
  border: "1.5px solid #fecaca", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
};
const spinnerStyle: React.CSSProperties = {
  width: "36px", height: "36px", border: "3px solid #e2e8f0",
  borderTopColor: "#0f172a", borderRadius: "50%",
  animation: "spin 0.7s linear infinite", margin: "auto", marginTop: "8rem",
};
