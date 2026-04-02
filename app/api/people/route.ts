export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database(process.cwd() + "/nexus.db");

// Enable foreign keys (good practice)
db.pragma("foreign_keys = ON");

export async function GET() {
  try {
    const people = db.prepare("SELECT * FROM people").all();

    // Convert availability back to JSON
    const formatted = people.map((p: any) => ({
      ...p,
      availability: p.availability
        ? JSON.parse(p.availability)
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  console.log("DELETE HIT");

  const { id } = await req.json();
  console.log("Deleting id:", id);

  db.prepare("DELETE FROM people WHERE id = ?").run(id);

  return NextResponse.json({ message: "Person deleted!" });
}

export async function PUT(req: Request) {
  try {
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
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
      JSON.stringify(availability) // store as string
    );

    return NextResponse.json({ message: "Person added!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}