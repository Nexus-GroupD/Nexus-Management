export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, hasPermission } from "@/lib/auth";

function forbidden() {
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}

function parsePositiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Any logged-in user can read shifts — employees need to see their own schedule,
// and the client-side filters down to just their shifts after fetching.
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return forbidden();
  try {
    const rows = db.prepare(`
      SELECT s.shift_ID AS shiftId, s.date, s.start_time AS startTime,
             s.end_time AS endTime, s.person_ID AS personId,
             p.id AS "employee.id", p.name AS "employee.name"
      FROM shifts s
      LEFT JOIN people p ON s.person_ID = p.id
      ORDER BY s.date ASC, s.start_time ASC
    `).all() as any[];

    const formatted = rows.map((s) => ({
      shiftId:   s.shiftId,
      date:      s.date,
      startTime: s.startTime,
      endTime:   s.endTime,
      personId:  s.personId,
      employee:  s["employee.id"] ? { id: s["employee.id"], name: s["employee.name"] } : null,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("[shifts GET]", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

// Creating shifts is restricted to managers — only roles with schedule.edit
// (e.g. Manager) can add new slots to the schedule.
export async function POST(req: NextRequest) {
  if (!hasPermission(req, "schedule.edit")) return forbidden();
  try {
    const body = await req.json();
    const { date, startTime, endTime } = body;
    const personId = body.personId != null ? parsePositiveInt(body.personId) : null;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "date, startTime, and endTime are required." },
        { status: 400 }
      );
    }
    if (body.personId != null && personId === null) {
      return NextResponse.json(
        { success: false, error: "Invalid personId." },
        { status: 400 }
      );
    }

    const result = db.prepare(
      "INSERT INTO shifts (date, start_time, end_time, person_ID) VALUES (?, ?, ?, ?)"
    ).run(date, startTime, endTime, personId ?? null);
    return NextResponse.json({ success: true, data: { shiftId: result.lastInsertRowid } });
  } catch (err) {
    console.error("[shifts POST]", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

// Assigning an employee to a shift uses a separate permission from creating shifts —
// team leads can assign without being able to create or delete shifts entirely.
export async function PATCH(req: NextRequest) {
  if (!hasPermission(req, "schedule.assign_shifts")) return forbidden();
  try {
    const body = await req.json();
    const personId = body.personId != null ? parsePositiveInt(body.personId) : null;

    if (body.shiftId == null) {
      return NextResponse.json(
        { success: false, error: "shiftId is required." },
        { status: 400 }
      );
    }

    const shiftId = parsePositiveInt(body.shiftId);
    if (shiftId === null) {
      return NextResponse.json(
        { success: false, error: "Invalid shiftId." },
        { status: 400 }
      );
    }
    if (body.personId != null && personId === null) {
      return NextResponse.json(
        { success: false, error: "Invalid personId." },
        { status: 400 }
      );
    }

    db.prepare("UPDATE shifts SET person_ID = ? WHERE shift_ID = ?").run(personId ?? null, shiftId);
    const shift = db.prepare("SELECT shift_ID AS shiftId, date, start_time AS startTime, end_time AS endTime, person_ID AS personId FROM shifts WHERE shift_ID = ?").get(shiftId);
    return NextResponse.json({ success: true, data: shift });
  } catch (err) {
    console.error("[shifts PATCH]", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
