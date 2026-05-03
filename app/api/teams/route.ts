export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, hasPermission } from "@/lib/auth";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "teams.view")) return forbidden();

  const teams = db.prepare("SELECT * FROM teams ORDER BY name").all() as { id: number; name: string }[];
  const members = db.prepare(`
    SELECT tm.team_id, p.id, p.name
    FROM team_members tm
    JOIN people p ON tm.person_id = p.id
    ORDER BY p.name
  `).all() as { team_id: number; id: number; name: string }[];

  const membersByTeam: Record<number, { id: number; name: string }[]> = {};
  for (const m of members) {
    if (!membersByTeam[m.team_id]) membersByTeam[m.team_id] = [];
    membersByTeam[m.team_id].push({ id: m.id, name: m.name });
  }

  return NextResponse.json(
    teams.map((t) => ({ ...t, members: membersByTeam[t.id] ?? [] }))
  );
}

export async function POST(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "teams.edit")) return forbidden();

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  try {
    const result = db
      .prepare("INSERT INTO teams (name) VALUES (?)")
      .run(name.trim()) as { lastInsertRowid: number };
    return NextResponse.json({ id: result.lastInsertRowid, name: name.trim(), members: [] });
  } catch {
    return NextResponse.json({ error: "A team with that name already exists" }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "teams.edit")) return forbidden();

  const { teamId, addPersonIds, removePersonIds } = await req.json();
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  const team = db.prepare("SELECT id FROM teams WHERE id = ?").get(teamId);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const ins = db.prepare("INSERT OR IGNORE INTO team_members (team_id, person_id) VALUES (?, ?)");
  const del = db.prepare("DELETE FROM team_members WHERE team_id = ? AND person_id = ?");

  db.transaction(() => {
    for (const pid of addPersonIds    ?? []) ins.run(teamId, pid);
    for (const pid of removePersonIds ?? []) del.run(teamId, pid);
  })();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  if (!requireAuth(req)) return forbidden();
  if (!hasPermission(req, "teams.edit")) return forbidden();

  const { id } = await req.json();
  db.prepare("DELETE FROM teams WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
