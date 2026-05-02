"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

const ADMIN_PIN = "1234"; // change this to whatever PIN you want

export default function AddPersonPage() {
  const [pinInput, setPinInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinError, setPinError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [pay, setPay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Try again.");
      setPinInput("");
    }
  };

  const handleDayChange = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const fetchPeople = async () => {
    try {
      const res = await fetch("/api/people");
      const data = await res.json();
      setPeople(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await fetch("/api/people", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchPeople();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (person: any) => {
    setEditingId(person.id);
    setName(person.name);
    setEmail(person.email);
    setRole(person.role);
    setPay(person.pay_per_hour.toString());
    const daysList = Object.keys(person.availability || {});
    setDays(daysList);
    if (daysList.length > 0) {
      const [start, end] = person.availability[daysList[0]][0].split("-");
      setStartTime(start);
      setEndTime(end);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            ? { id: editingId, name, email, role, pay_per_hour: Number(pay), availability }
            : { name, email, role, pay_per_hour: Number(pay), availability }
        ),
      });
      if (res.ok) {
        alert(isEditing ? "Person updated!" : "Person added!");
        setEditingId(null);
        setName("");
        setEmail("");
        setRole("Employee");
        setPay("");
        setStartTime("");
        setEndTime("");
        setDays([]);
        fetchPeople();
      } else {
        alert("Error saving person");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <Navbar pageTitle={editingId ? "Edit Person" : "Add Person"} />

      {/* PIN OVERLAY */}
      {!isAdmin && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            width: "300px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Admin Access</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Enter your PIN to continue
            </p>

            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1.2rem",
                letterSpacing: "0.5rem",
                textAlign: "center",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                marginBottom: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              autoFocus
            />

            {pinError && (
              <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {pinError}
              </p>
            )}

            <button
              onClick={handlePinSubmit}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#1a202c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={{ paddingTop: "5rem", padding: "5rem 2rem 2rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Employee">Employee</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Manager">Manager</option>
          </select>
          <input
            type="number"
            placeholder="Pay per hour"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            required
          />
          <div>
            <p>Days Available:</p>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <label key={day} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            ))}
          </div>
          <div>
            <p>Time Available:</p>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            {" - "}
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <button type="submit">{editingId ? "Update Person" : "Add Person"}</button>
        </form>

        <hr style={{ margin: "2rem 0" }} />

        <h2>People</h2>
        {people.map((person) => (
          <div
            key={person.id}
            style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}
          >
            <p><strong>{person.name}</strong></p>
            <p>{person.email}</p>
            <p>{person.role}</p>
            <p>${person.pay_per_hour}/hr</p>
            <button onClick={() => handleEdit(person)}>Edit</button>
            <button onClick={() => handleDelete(person.id)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
