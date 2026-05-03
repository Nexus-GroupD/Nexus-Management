import db from "@/lib/db";
import { ALL_PERMISSIONS } from "@/lib/permissions";

export function getRole(req: Request): "admin" | "viewer" | null {
  const cookie = req.headers.get("cookie") ?? "";
  if (cookie.includes("nexus-auth=admin")) return "admin";
  if (cookie.includes("nexus-auth=viewer")) return "viewer";
  return null;
}

export function getUserId(req: Request): number | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/nexus-uid=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function requireAuth(req: Request): boolean {
  return getRole(req) !== null;
}

export function requireAdmin(req: Request): boolean {
  return getRole(req) === "admin";
}

export function getPermissions(req: Request): string[] {
  const cookieRole = getRole(req);
  if (!cookieRole) return [];

  const uid = getUserId(req);

  // System admin (no uid or uid=0, admin cookie) → full access
  if (!uid || uid === 0) {
    return cookieRole === "admin" ? [...ALL_PERMISSIONS] : [];
  }

  const person = db
    .prepare("SELECT role FROM people WHERE id = ?")
    .get(uid) as { role: string } | undefined;

  if (!person) return [];

  const roleRow = db
    .prepare("SELECT permissions FROM custom_roles WHERE name = ?")
    .get(person.role) as { permissions: string } | undefined;

  try {
    return JSON.parse(roleRow?.permissions ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function hasPermission(req: Request, permission: string): boolean {
  return getPermissions(req).includes(permission);
}
