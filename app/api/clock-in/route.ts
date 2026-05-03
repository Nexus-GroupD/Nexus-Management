/**
 * POST /api/clock-in
 * Body: { person_ID: number }
 * Clocks an employee in. Rejects if they are already clocked in.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { todayString } from '@/lib/time';
import type { ApiResponse } from '@/type';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const person_ID = Number(body?.person_ID);

    if (!person_ID || isNaN(person_ID)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'person_ID is required and must be a number.' },
        { status: 400 }
      );
    }

  const db = getDb();

    // Check if already clocked in today (no clock_out yet)
    const existing = db.prepare(
      `SELECT id FROM clock_entries WHERE person_ID = ? AND date = ? AND clock_out IS NULL`
    ).get(person_ID, todayString());

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Employee is already clocked in.' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO clock_entries (person_ID, clock_in, date) VALUES (?, ?, ?)`
    ).run(person_ID, now, todayString());

    return NextResponse.json<ApiResponse<{ id: number; clock_in: string }>>({
      success: true,
      data: { id: result.lastInsertRowid as number, clock_in: now },
    });
  } catch (err) {
    console.error('[clock-in]', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

