export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { getUserId, requireAuth } from "@/lib/auth";

const db = new Database(process.cwd() + "/nexus.db");

export async function PATCH(req: Request) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const uid = getUserId(req);
  if (!uid || uid === 0) {
    return NextResponse.json({ error: "System accounts cannot be edited here" }, { status: 403 });
  }

  const body = await req.json();
  const { name, currentPassword, newPassword } = body;

  const person = db.prepare(
    "SELECT id, name, password FROM people WHERE id = ?"
  ).get(uid) as { id: number; name: string; password: string | null } | undefined;

  if (!person) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (newPassword !== undefined) {
    if (person.password !== currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    db.prepare("UPDATE people SET password = ? WHERE id = ?").run(newPassword, uid);
  }

  if (name !== undefined && name.trim()) {
    db.prepare("UPDATE people SET name = ? WHERE id = ?").run(name.trim(), uid);
  }

  return NextResponse.json({ success: true });
}
