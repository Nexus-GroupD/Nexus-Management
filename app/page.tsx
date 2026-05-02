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

  // Check login state
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("nexus_logged_in");
    if (loggedIn === "true") setIsLoggedIn(true);
    setLoading(false);
  }, []);

  // Lock background scroll when modal is open
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
      setError("Invalid username or password.");
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2rem",
              width: "360px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h2 style={{ textAlign: "center", margin: 0 }}>
              Nexus Management
            </h2>

            <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
              Sign in to continue
            </p>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={inputStyle}
            />

            {error && (
              <p style={{ color: "red", fontSize: "0.85rem", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button onClick={handleLogin} style={buttonStyle}>
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <h1>Nexus Management</h1>
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
              padding: "0.5rem 1.25rem",
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

const inputStyle = {
  padding: "0.75rem",
  border: "2px solid "#e2e8f0",
  borderRadius: "8px",
  fontSize: "1rem",
  outline: "none",
};

const buttonStyle = {
  padding: "0.75rem",
  background: "#1a202c",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
};
