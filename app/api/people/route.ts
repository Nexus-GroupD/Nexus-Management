import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("database.db");

// ✅ GET all people (this fixes your error)
export async function GET() {
  try {
    const people = db.prepare("SELECT * FROM people").all();
    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

// ✅ POST new person
export async function POST(req: Request) {
  try {
    const { name, email, role } = await req.json();

    db.prepare(
      "INSERT INTO people (name, email, role) VALUES (?, ?, ?)"
    ).run(name, email, role);

    return NextResponse.json({ message: "Person added!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}