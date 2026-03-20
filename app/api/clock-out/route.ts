/**
 * POST /api/clock-out
 * Body: { person_ID: number }
 * Clocks an employee out, computing duration in minutes.
 */

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { durationMinutes, todayString } from '@/lib/time';
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
    if (!db) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Database unavailable.' },
        { status: 503 }
      );
    }

    // Find the open clock-in entry
    const entry = db.prepare(
      `SELECT id, clock_in FROM clock_entries WHERE person_ID = ? AND date = ? AND clock_out IS NULL`
    ).get(person_ID, todayString()) as { id: number; clock_in: string } | undefined;

    if (!entry) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'No active clock-in found for this employee today.' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const duration = durationMinutes(entry.clock_in, now);

    db.prepare(
      `UPDATE clock_entries SET clock_out = ?, duration_minutes = ? WHERE id = ?`
    ).run(now, duration, entry.id);

    return NextResponse.json<ApiResponse<{ clock_out: string; duration_minutes: number }>>({
      success: true,
      data: { clock_out: now, duration_minutes: duration },
    });
  } catch (err) {
    console.error('[clock-out]', err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

