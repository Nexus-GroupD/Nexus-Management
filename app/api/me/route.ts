export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getRole, getUserId, getPermissions } from "@/lib/auth";

export async function GET(req: Request) {
  const role = getRole(req);
  if (!role) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const permissions = getPermissions(req);
  const uid = getUserId(req);

  if (uid && uid > 0) {
    const person = db
      .prepare("SELECT id, name, email, role as dbRole FROM people WHERE id = ?")
      .get(uid) as { id: number; name: string; email: string; dbRole: string } | undefined;

    if (person) {
      return NextResponse.json({ ...person, role, permissions });
    }
  }

  const isAdmin = role === "admin";
  return NextResponse.json({
    id: 1,
    name: isAdmin ? "Admin" : "Viewer",
    email: "",
    dbRole: isAdmin ? "Manager" : "Employee",
    role,
    permissions,
  });
}
