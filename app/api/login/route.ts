export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";

const SYSTEM_USERS: Record<string, { password: string; role: "admin" | "viewer" }> = {
  admin: { password: "1234", role: "admin" },
  user:  { password: "1234", role: "viewer" },
};

function cookieRoleForDbRole(dbRole: string): "admin" | "viewer" {
  const row = db
    .prepare("SELECT permission_level FROM custom_roles WHERE name = ?")
    .get(dbRole) as { permission_level: string } | undefined;
  return row?.permission_level === "admin" ? "admin" : "viewer";
}

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // System users (hardcoded)
  const sys = SYSTEM_USERS[username];
  if (sys && sys.password === password) {
    const res = NextResponse.json({ success: true, role: sys.role });
    setAuthCookies(res, sys.role, 0);
    return res;
  }

  // DB users — look up by email
  const person = db
    .prepare("SELECT id, role, password FROM people WHERE email = ?")
    .get(username) as { id: number; role: string; password: string | null } | undefined;

  if (!person || !person.password || person.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const authRole = cookieRoleForDbRole(person.role);
  const res = NextResponse.json({ success: true, role: authRole });
  setAuthCookies(res, authRole, person.id);
  return res;
}

function setAuthCookies(res: NextResponse, role: "admin" | "viewer", uid: number) {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  res.cookies.set("nexus-auth", role, opts);
  res.cookies.set("nexus-uid", String(uid), opts);
}
