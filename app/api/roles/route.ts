export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hasPermission, requireAuth } from "@/lib/auth";
import { ALL_PERMISSIONS, Permission } from "@/lib/permissions";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Type-safe permission validator — avoids TS2345 on Array<Permission>.includes(string) */
function isValidPermission(p: string): p is Permission {
  return (ALL_PERMISSIONS as readonly string[]).includes(p);
}

function filterValidPerms(permissions: unknown): string[] {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p): p is string => typeof p === "string" && isValidPermission(p));
}

export async function GET(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "roles.view")) return forbidden();

  const rows = db
    .prepare("SELECT * FROM custom_roles ORDER BY is_builtin DESC, name")
    .all() as { id: number; name: string; permission_level: string; is_builtin: number; permissions: string }[];

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      permissions: JSON.parse(r.permissions ?? "[]") as string[],
    }))
  );
}

export async function POST(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "roles.create")) return forbidden();

  const { name, permission_level, permissions } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (permission_level !== "admin" && permission_level !== "viewer") {
    return NextResponse.json({ error: "permission_level must be admin or viewer" }, { status: 400 });
  }

  const perms = filterValidPerms(permissions);

  try {
    const result = db
      .prepare("INSERT INTO custom_roles (name, permission_level, permissions) VALUES (?, ?, ?)")
      .run(name.trim(), permission_level, JSON.stringify(perms)) as { lastInsertRowid: number };

    return NextResponse.json({
      id: result.lastInsertRowid,
      name: name.trim(),
      permission_level,
      is_builtin: 0,
      permissions: perms,
    });
  } catch {
    return NextResponse.json({ error: "A role with that name already exists" }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "roles.edit")) return forbidden();

  const { id, permissions, permission_level } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const role = db
    .prepare("SELECT id FROM custom_roles WHERE id = ?")
    .get(id);
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  const validPerms = filterValidPerms(permissions);

  if (permission_level !== undefined) {
    if (permission_level !== "admin" && permission_level !== "viewer") {
      return NextResponse.json({ error: "permission_level must be admin or viewer" }, { status: 400 });
    }
    db.prepare("UPDATE custom_roles SET permissions = ?, permission_level = ? WHERE id = ?")
      .run(JSON.stringify(validPerms), permission_level, id);
  } else {
    db.prepare("UPDATE custom_roles SET permissions = ? WHERE id = ?")
      .run(JSON.stringify(validPerms), id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "roles.delete")) return forbidden();

  const { id } = await req.json();
  const role = db
    .prepare("SELECT * FROM custom_roles WHERE id = ?")
    .get(id) as { is_builtin: number } | undefined;

  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role.is_builtin) return NextResponse.json({ error: "Built-in roles cannot be deleted" }, { status: 400 });

  db.prepare("DELETE FROM custom_roles WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
