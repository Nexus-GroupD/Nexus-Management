import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database(process.cwd() + "/nexus.db");

const SYSTEM_USERS: Record<string, { password: string; role: "admin" | "viewer" }> = {
  admin: { password: "1234", role: "admin" },
  user:  { password: "1234", role: "viewer" },
};

function mapDbRole(role: string): "admin" | "viewer" {
  return role === "Manager" ? "admin" : "viewer";
}

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // 1. Check hardcoded system users first
  const sys = SYSTEM_USERS[username];
  if (sys && sys.password === password) {
    const res = NextResponse.json({ success: true, role: sys.role });
    setAuthCookies(res, sys.role, 0);
    return res;
  }

  // 2. Check people table by email
  const person = db.prepare(
    "SELECT id, name, email, role, password FROM people WHERE email = ?"
  ).get(username) as { id: number; name: string; email: string; role: string; password: string | null } | undefined;

  if (!person || person.password !== password || !person.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const authRole = mapDbRole(person.role);
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
