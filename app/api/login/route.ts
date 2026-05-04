export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";

const SYSTEM_USERS: Record<string, { password: string; role: "admin" | "viewer" }> = {
  admin: { password: "1234", role: "admin" },
  user:  { password: "1234", role: "viewer" },
};

// ── Rate limiter ────────────────────────────────────────────────────────────
const MAX_ATTEMPTS  = 5;          // max failed attempts
const WINDOW_MS     = 15 * 60 * 1000; // 15 minute window
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minute lockout after MAX_ATTEMPTS

type AttemptRecord = { count: number; firstAttempt: number; lockedUntil?: number };
const attempts = new Map<string, AttemptRecord>();

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { blocked: boolean; retryAfter?: number } {
  const now    = Date.now();
  const record = attempts.get(ip);

  // Currently locked out
  if (record?.lockedUntil && now < record.lockedUntil) {
    return { blocked: true, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  // Window expired — reset
  if (record && now - record.firstAttempt > WINDOW_MS) {
    attempts.delete(ip);
  }

  return { blocked: false };
}

function recordFailure(ip: string) {
  const now    = Date.now();
  const record = attempts.get(ip) ?? { count: 0, firstAttempt: now };

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  attempts.set(ip, record);
}

function clearFailures(ip: string) {
  attempts.delete(ip);
}
// ── End rate limiter ─────────────────────────────────────────────────────────

function cookieRoleForDbRole(dbRole: string): "admin" | "viewer" {
  const row = db
    .prepare("SELECT permission_level FROM custom_roles WHERE name = ?")
    .get(dbRole) as { permission_level: string } | undefined;
  return row?.permission_level === "admin" ? "admin" : "viewer";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Check rate limit before doing anything else
  const { blocked, retryAfter } = checkRateLimit(ip);
  if (blocked) {
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // System users (hardcoded)
  const sys = SYSTEM_USERS[username];
  if (sys && sys.password === password) {
    clearFailures(ip); // successful login clears the counter
    const res = NextResponse.json({ success: true, role: sys.role });
    setAuthCookies(res, sys.role, 0);
    return res;
  }

  // DB users — look up by email
  const person = db
    .prepare("SELECT id, role, password FROM people WHERE email = ?")
    .get(username) as { id: number; role: string; password: string | null } | undefined;

  if (!person || !person.password || person.password !== password) {
    recordFailure(ip); // count this failed attempt
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearFailures(ip); // successful login clears the counter
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
