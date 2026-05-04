export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, hasPermission } from "@/lib/auth";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/* ---------------- GET ---------------- */
export async function GET(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "people.view")) return forbidden();

  const showPay = hasPermission(req, "pay.view");

  const people = db.prepare("SELECT * FROM people ORDER BY name").all() as any[];
  const memberships = db.prepare(`
    SELECT tm.person_id, t.id AS team_id, t.name AS team_name
    FROM team_members tm JOIN teams t ON tm.team_id = t.id
  `).all() as { person_id: number; team_id: number; team_name: string }[];

  const teamsByPerson: Record<number, { id: number; name: string }[]> = {};
  for (const m of memberships) {
    if (!teamsByPerson[m.person_id]) teamsByPerson[m.person_id] = [];
    teamsByPerson[m.person_id].push({ id: m.team_id, name: m.team_name });
  }

  const formatted = people.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    ...(showPay ? { pay_per_hour: p.pay_per_hour } : {}),
    availability: hasPermission(req, "availability.view")
      ? (p.availability ? JSON.parse(p.availability) : null)
      : undefined,
    teams: teamsByPerson[p.id] ?? [],
  }));

  return NextResponse.json(formatted);
}

/* ---------------- POST ---------------- */
export async function POST(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "people.add")) return forbidden();

  const { name, email, role, pay_per_hour, availability, password } = await req.json();

  db.prepare(
    "INSERT INTO people (name, email, role, pay_per_hour, availability, password) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, email, role, pay_per_hour, JSON.stringify(availability), password ?? null);

  return NextResponse.json({ message: "Person added!" });
}

/* ---------------- PUT ---------------- */
export async function PUT(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "people.edit")) return forbidden();

  const { id, name, email, role, pay_per_hour, availability, password } = await req.json();

  const current = db.prepare("SELECT role FROM people WHERE id = ?").get(id) as { role: string } | undefined;
  if (current && current.role !== role && !hasPermission(req, "roles.assign")) {
    return forbidden();
  }

  if (password !== undefined) {
    db.prepare(
      "UPDATE people SET name=?, email=?, role=?, pay_per_hour=?, availability=?, password=? WHERE id=?"
    ).run(name, email, role, pay_per_hour, JSON.stringify(availability), password || null, id);
  } else {
    db.prepare(
      "UPDATE people SET name=?, email=?, role=?, pay_per_hour=?, availability=? WHERE id=?"
    ).run(name, email, role, pay_per_hour, JSON.stringify(availability), id);
  }

  return NextResponse.json({ message: "Person updated!" });
}

/* ---------------- DELETE ---------------- */
export async function DELETE(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "people.delete")) return forbidden();

  const { id } = await req.json();
  db.prepare("DELETE FROM people WHERE id = ?").run(id);
  return NextResponse.json({ message: "Person deleted!" });
}
