export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { requireAuth } from "@/lib/auth";

const db = new Database(process.cwd() + "/nexus.db");

db.pragma("foreign_keys = ON");

function unauthorized() {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

/* ---------------- GET ---------------- */
export async function GET(req: Request) {
  if (!requireAuth(req)) return unauthorized();

  const people = db.prepare("SELECT * FROM people").all();

  const formatted = people.map((p: any) => ({
    ...p,
    availability: p.availability
      ? JSON.parse(p.availability)
      : null,
  }));

  return NextResponse.json(formatted);
}

/* ---------------- POST ---------------- */
export async function POST(req: Request) {
  if (!requireAuth(req)) return unauthorized();

  const { name, email, role, pay_per_hour, availability } =
    await req.json();

  db.prepare(
    `INSERT INTO people (name, email, role, pay_per_hour, availability)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    name,
    email,
    role,
    pay_per_hour,
    JSON.stringify(availability)
  );

  return NextResponse.json({ message: "Person added!" });
}

/* ---------------- PUT ---------------- */
export async function PUT(req: Request) {
  if (!requireAuth(req)) return unauthorized();

  const { id, name, email, role, pay_per_hour, availability } =
    await req.json();

  db.prepare(`
    UPDATE people
    SET name = ?, email = ?, role = ?, pay_per_hour = ?, availability = ?
    WHERE id = ?
  `).run(
    name,
    email,
    role,
    pay_per_hour,
    JSON.stringify(availability),
    id
  );

  return NextResponse.json({ message: "Person updated!" });
}

/* ---------------- DELETE ---------------- */
export async function DELETE(req: Request) {
  if (!requireAuth(req)) return unauthorized();

  const { id } = await req.json();

  db.prepare("DELETE FROM people WHERE id = ?").run(id);

  return NextResponse.json({ message: "Person deleted!" });
}