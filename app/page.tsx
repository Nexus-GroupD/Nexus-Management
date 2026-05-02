"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getGreeting } from "@/lib/time";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "1234";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // check session
  useEffect(() => {
    const saved = sessionStorage.getItem("nexus_logged_in");
    if (saved === "true") setIsLoggedIn(true);
    setLoading(false);
  }, []);

  // lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isLoggedIn ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      sessionStorage.setItem("nexus_logged_in", "true");
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password");
      setPassword("");
    }
  };

  if (loading) {
    return <div style={{ height: "100vh", background: "#0f172a" }} />;
  }

  return (
    <>
      <Navbar pageTitle="Home" />

      {/* LOGIN OVERLAY */}
      {!isLoggedIn && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: 0, textAlign: "center" }}>
              Nexus Management
            </h2>
            <p style={{ marginTop: 4, textAlign: "center", color: "#666" }}>
              Please sign in to continue
            </p>

            <input
              style={inputStyle}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            {error && (
              <div style={{ color: "red", fontSize: "0.85rem", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button onClick={handleLogin} style={buttonStyle}>
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={{ padding: "6rem 2rem 2rem 2rem", textAlign: "center" }}>
        <h1>Nexus Management</h1>
        <p>Welcome to the Nexus scheduling system</p>

        <p>{getGreeting()}! Welcome to the Nexus scheduling system</p>

        {isLoggedIn && (
          <button
            onClick={() => {
              sessionStorage.removeItem("nexus_logged_in");
              setIsLoggedIn(false);
              setUsername("");
              setPassword("");
            }}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        )}
      </div>
    </>
  );
}

/* Styles */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  width: "360px",
  background: "white",
  padding: "2rem",
  borderRadius: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const inputStyle: React.CSSProperties = {
  padding: "0.75rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  outline: "none",
  fontSize: "1rem",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem",
  background: "#1a202c",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};