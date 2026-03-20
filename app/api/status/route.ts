/**
 * GET /api/status?person_ID=<id>
 * Returns whether the employee is currently clocked in or out.
 */

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { todayString } from '@/lib/time';
import type { ApiResponse, StatusResponse } from '@/type';

export async function GET(req: NextRequest) {
  try {
    const person_ID = Number(req.nextUrl.searchParams.get('person_ID'));

    if (!person_ID || isNaN(person_ID)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'person_ID query param is required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Database unavailable.' },
        { status: 503 }
      );
    }

    const entry = db.prepare(
      `SELECT clock_in FROM clock_entries WHERE person_ID = ? AND date = ? AND clock_out IS NULL`
    ).get(person_ID, todayString()) as { clock_in: string } | undefined;

    const response: StatusResponse = entry
      ? { status: 'clocked_in', clock_in_time: entry.clock_in, person_ID }
      : { status: 'clocked_out', person_ID };

    return NextResponse.json<ApiResponse<StatusResponse>>({ success: true, data: response });
  } catch (err) {
    console.error('[status]', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

