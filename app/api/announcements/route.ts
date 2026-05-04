export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, hasPermission } from "@/lib/auth";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/* ---------------- GET: all logged-in users can view ---------------- */
export async function GET(req: Request) {
  if (!requireAuth(req)) return forbidden();

  const announcements = db
    .prepare("SELECT * FROM announcements ORDER BY created_at DESC")
    .all();

  return NextResponse.json(announcements);
}

/* ---------------- POST: only admins/managers can create ---------------- */
export async function POST(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "announcements.create")) return forbidden();

  const { title, message, category } = await req.json();

  db.prepare(
    "INSERT INTO announcements (title, message, category) VALUES (?, ?, ?)"
  ).run(title, message, category);

  return NextResponse.json({ message: "Announcement created!" });
}

/* ---------------- DELETE: only admins/managers can delete ---------------- */
export async function DELETE(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "announcements.delete")) return forbidden();

  const { id } = await req.json();

  db.prepare("DELETE FROM announcements WHERE id = ?").run(id);

  return NextResponse.json({ message: "Announcement deleted!" });
}