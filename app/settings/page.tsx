"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

type Me = { id: number; name: string; email: string; dbRole: string; role: "admin" | "viewer" };

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameMsg, setNameMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwMsg, setPwMsg]   = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving, setPwSaving]   = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push("/"); return; }
        setMe(d);
        setName(d.name);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true); setNameMsg(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const d = await res.json();
    setNameMsg(res.ok ? { type: "ok", text: "Name updated!" } : { type: "err", text: d.error });
    setNameSaving(false);
    if (res.ok && me) setMe({ ...me, name });
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "err", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 4) {
      setPwMsg({ type: "err", text: "Password must be at least 4 characters" });
      return;
    }
    setPwSaving(true); setPwMsg(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const d = await res.json();
    if (res.ok) {
      setPwMsg({ type: "ok", text: "Password updated!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      setPwMsg({ type: "err", text: d.error });
    }
    setPwSaving(false);
  };

  if (loading) return (
    <>
      <Navbar pageTitle="Settings" />
      <div style={pageStyle}><div style={spinnerStyle} /></div>
    </>
  );

  const isSystemUser = me?.id === 0;

  return (
    <>
      <Navbar pageTitle="Settings" />
      <div style={pageStyle}>

        {/* Profile Info */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={bigAvatarStyle}>{me?.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#0f172a" }}>{me?.name}</div>
              <div style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.2rem" }}>{me?.email || "System account"}</div>
              <span style={roleTagStyle}>{me?.dbRole}</span>
            </div>
          </div>

          {isSystemUser && (
            <div style={infoBannerStyle}>System accounts cannot change their name or password here.</div>
          )}
        </div>

        {/* Change Name */}
        {!isSystemUser && (
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Display Name</h2>
            <form onSubmit={saveName} style={formStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              {nameMsg && <p style={{ color: nameMsg.type === "ok" ? "#22c55e" : "#ef4444", fontSize: "0.85rem", margin: 0 }}>{nameMsg.text}</p>}
              <button type="submit" style={primaryBtn} disabled={nameSaving}>
                {nameSaving ? "Saving…" : "Save Name"}
              </button>
            </form>
          </div>
        )}

        {/* Change Password */}
        {!isSystemUser && (
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Change Password</h2>
            <form onSubmit={savePassword} style={formStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Current Password</label>
                <input style={inputStyle} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>New Password</label>
                <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Confirm New Password</label>
                <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              {pwMsg && <p style={{ color: pwMsg.type === "ok" ? "#22c55e" : "#ef4444", fontSize: "0.85rem", margin: 0 }}>{pwMsg.text}</p>}
              <button type="submit" style={primaryBtn} disabled={pwSaving}>
                {pwSaving ? "Saving…" : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: "560px", margin: "0 auto", padding: "6rem 1.5rem 3rem",
  display: "flex", flexDirection: "column", gap: "1.25rem",
};
const cardStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px", padding: "1.75rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};
const bigAvatarStyle: React.CSSProperties = {
  width: "60px", height: "60px", borderRadius: "50%", flexShrink: 0,
  background: "linear-gradient(135deg,#1a202c,#4a5568)",
  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: "1.4rem",
};
const roleTagStyle: React.CSSProperties = {
  display: "inline-block", marginTop: "0.4rem",
  background: "#f1f5f9", color: "#475569",
  borderRadius: "999px", padding: "0.15rem 0.65rem",
  fontSize: "0.75rem", fontWeight: 500,
};
const infoBannerStyle: React.CSSProperties = {
  background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe",
  borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.875rem",
};
const sectionTitle: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.1rem",
};
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "1rem" };
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.35rem" };
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem", fontWeight: 600, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.04em",
};
const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.875rem", border: "1.5px solid #e2e8f0",
  borderRadius: "10px", fontSize: "0.95rem", color: "#0f172a",
  outline: "none", background: "#f8fafc", boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  padding: "0.7rem 1.5rem", background: "#0f172a", color: "white",
  border: "none", borderRadius: "10px", fontSize: "0.9rem",
  fontWeight: 600, cursor: "pointer", alignSelf: "flex-start",
};
const spinnerStyle: React.CSSProperties = {
  width: "36px", height: "36px", border: "3px solid #e2e8f0",
  borderTopColor: "#0f172a", borderRadius: "50%",
  animation: "spin 0.7s linear infinite", margin: "auto",
};
