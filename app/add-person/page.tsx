"use client";

import { useState, useEffect } from "react";

export default function AddPersonPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [pay, setPay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [days, setDays] = useState<string[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDayChange = (day: string) => {
    setDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  // Fetch people
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

  // DELETE
  const handleDelete = async (id: number) => {
    try {
      await fetch("/api/people", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      fetchPeople();
    } catch (err) {
      console.error(err);
    }
  };

  // EDIT
  const handleEdit = (person: any) => {
    setEditingId(person.id);
    setName(person.name);
    setEmail(person.email);
    setRole(person.role);
    setPay(person.pay_per_hour.toString());

    const daysList = Object.keys(person.availability || {});
    setDays(daysList);

    if (daysList.length > 0) {
      const [start, end] =
        person.availability[daysList[0]][0].split("-");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                id: editingId,
                name,
                email,
                role,
                pay_per_hour: Number(pay),
                availability,
              }
            : {
                name,
                email,
                role,
                pay_per_hour: Number(pay),
                availability,
              }
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
    <div style={{ padding: "2rem" }}>
      <h1>{editingId ? "Edit Person" : "Add Person"}</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
        }}
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
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"].map(
            (day) => (
              <label key={day} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            )
          )}
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

        <button type="submit">
          {editingId ? "Update Person" : "Add Person"}
        </button>
      </form>

      {/* PEOPLE LIST */}
      <hr style={{ margin: "2rem 0" }} />

      <h2>People</h2>

      {people.map((person) => (
        <div
          key={person.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p><strong>{person.name}</strong></p>
          <p>{person.email}</p>
          <p>{person.role}</p>
          <p>${person.pay_per_hour}/hr</p>

          <button onClick={() => handleEdit(person)}>
            Edit
          </button>

          <button onClick={() => handleDelete(person.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}