/**
 * GET /api/history?person_ID=<id>&limit=<n>&offset=<n>
 * Returns paginated clock history for an employee.
 * Omit person_ID to get all employees' history (manager view).
 */

import { NextRequest, NextResponse } from 'next/server';

import type { ApiResponse, ClockEntry } from '@/type';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const person_ID = params.get('person_ID') ? Number(params.get('person_ID')) : undefined;
    const limit = Math.min(Number(params.get('limit') ?? 50), 200);
    const offset = Number(params.get('offset') ?? 0);

    const db = getDb();
    let rows: ClockEntry[];

    if (person_ID) {
      rows = db.prepare(
        `SELECT id, person_ID, clock_in, clock_out, date, duration_minutes
         FROM clock_entries
         WHERE person_ID = ?
         ORDER BY clock_in DESC
         LIMIT ? OFFSET ?`
      ).all(person_ID, limit, offset) as ClockEntry[];
    } else {
      rows = db.prepare(
        `SELECT id, person_ID, clock_in, clock_out, date, duration_minutes
         FROM clock_entries
         ORDER BY clock_in DESC
         LIMIT ? OFFSET ?`
      ).all(limit, offset) as ClockEntry[];
    }

    return NextResponse.json<ApiResponse<ClockEntry[]>>({ success: true, data: rows });
  } catch (err) {
    console.error('[history]', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

