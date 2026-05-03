import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { getRole, getUserId } from "@/lib/auth";

const db = new Database(process.cwd() + "/nexus.db");

export async function GET(req: Request) {
  const role = getRole(req);
  if (!role) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const uid = getUserId(req);
  if (uid && uid > 0) {
    const person = db.prepare(
      "SELECT id, name, email, role as dbRole FROM people WHERE id = ?"
    ).get(uid) as { id: number; name: string; email: string; dbRole: string } | undefined;

    if (person) {
      return NextResponse.json({
        id: person.id,
        name: person.name,
        email: person.email,
        dbRole: person.dbRole,
        role,
      });
    }
  }

  // Hardcoded system user
  const isAdmin = role === "admin";
  return NextResponse.json({
    id: 0,
    name: isAdmin ? "Admin" : "Viewer",
    email: "",
    dbRole: isAdmin ? "Manager" : "Employee",
    role,
  });
}
