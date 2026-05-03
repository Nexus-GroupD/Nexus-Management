"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid username or password");
      setPassword("");
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Left panel — branding */}
      <div style={brandPanelStyle}>
        <div style={brandInnerStyle}>
          <div style={logoStyle}>N</div>
          <h1 style={brandTitleStyle}>Nexus Management</h1>
          <p style={brandSubStyle}>Scheduling, communication, and team management — all in one place.</p>
        </div>
        <div style={brandFooterStyle}>© {new Date().getFullYear()} Nexus</div>
      </div>

      {/* Right panel — form */}
      <div style={formPanelStyle}>
        <div style={formInnerStyle}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={formTitleStyle}>Welcome back</h2>
            <p style={formSubStyle}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} style={formStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Username or Email</label>
              <input
                style={inputStyle}
                placeholder="admin or jane@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                autoComplete="username"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={errorStyle}>{error}</div>
            )}

            <button type="submit" style={btnStyle} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
};

const brandPanelStyle: React.CSSProperties = {
  flex: "0 0 42%",
  background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "3rem",
};

const brandInnerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  marginTop: "3rem",
};

const logoStyle: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  fontWeight: 800,
  fontSize: "1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const brandTitleStyle: React.CSSProperties = {
  color: "white",
  fontSize: "1.9rem",
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.2,
};

const brandSubStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  fontSize: "1rem",
  lineHeight: 1.6,
  margin: 0,
  maxWidth: "320px",
};

const brandFooterStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.3)",
  fontSize: "0.8rem",
};

const formPanelStyle: React.CSSProperties = {
  flex: 1,
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

const formInnerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "380px",
};

const formTitleStyle: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 700,
  color: "#0f172a",
  margin: "0 0 0.4rem",
};

const formSubStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "0.95rem",
  margin: 0,
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.1rem",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "0.95rem",
  color: "#0f172a",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};

const errorStyle: React.CSSProperties = {
  background: "#fff5f5",
  color: "#ef4444",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "0.65rem 0.875rem",
  fontSize: "0.875rem",
};

const btnStyle: React.CSSProperties = {
  padding: "0.8rem",
  background: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "0.25rem",
};
