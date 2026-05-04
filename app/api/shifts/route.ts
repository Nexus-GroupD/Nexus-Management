export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Ensure shifts table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS shifts (
    shiftId   INTEGER PRIMARY KEY AUTOINCREMENT,
    date      TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime   TEXT NOT NULL,
    personId  INTEGER REFERENCES people(id) ON DELETE SET NULL
  );
`);

// GET /api/shifts — fetch all shifts
export async function GET() {
  try {
    const shifts = db.prepare(`
      SELECT s.shiftId, s.date, s.startTime, s.endTime, s.personId,
             p.id AS "employee.id", p.name AS "employee.name"
      FROM shifts s
      LEFT JOIN people p ON p.id = s.personId
      ORDER BY s.date ASC, s.startTime ASC
    `).all() as any[];

    const formatted = shifts.map((s) => ({
      shiftId:   s.shiftId,
      date:      s.date,
      startTime: s.startTime,
      endTime:   s.endTime,
      personId:  s.personId,
      employee:  s["employee.id"] ? { id: s["employee.id"], name: s["employee.name"] } : null,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[shifts GET]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

// POST /api/shifts — create a new shift
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, startTime, endTime, personId } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'date, startTime, and endTime are required.' },
        { status: 400 }
      );
    }

    const result = db.prepare(
      'INSERT INTO shifts (date, startTime, endTime, personId) VALUES (?, ?, ?, ?)'
    ).run(date, startTime, endTime, personId ?? null) as { lastInsertRowid: number };

    const shift = db.prepare('SELECT * FROM shifts WHERE shiftId = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json({ success: true, data: shift });
  } catch (err) {
    console.error('[shifts POST]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH /api/shifts — assign/unassign employee
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { shiftId, personId } = body;

    if (!shiftId) {
      return NextResponse.json(
        { success: false, error: 'shiftId is required.' },
        { status: 400 }
      );
    }

    db.prepare('UPDATE shifts SET personId = ? WHERE shiftId = ?')
      .run(personId ?? null, shiftId);

    const shift = db.prepare('SELECT * FROM shifts WHERE shiftId = ?').get(shiftId);

    return NextResponse.json({ success: true, data: shift });
  } catch (err) {
    console.error('[shifts PATCH]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
