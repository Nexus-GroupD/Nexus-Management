/**
 * GET /api/history?person_ID=<id>&limit=<n>&offset=<n>
 * Returns paginated clock history for an employee.
 * Omit person_ID to get all employees' history (manager view).
 */

import { NextRequest, NextResponse } from 'next/server';

import type { ApiResponse, ClockEntry } from '@/type';
import { getDb } from '@/lib/db';

/** Parse a query param as a positive integer, returning undefined if invalid. */
function parsePositiveInt(value: string | null): number | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  // Reject anything that isn't a plain non-negative integer string
  if (!/^\d+$/.test(trimmed)) return undefined;
  const n = parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;

    // --- CWE-20: Validate person_ID ---
    const rawPersonId = params.get('person_ID');
    let person_ID: number | undefined;
    if (rawPersonId !== null) {
      person_ID = parsePositiveInt(rawPersonId);
      if (person_ID === undefined || person_ID === 0) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Invalid person_ID. Must be a positive integer.' },
          { status: 400 }
        );
      }
    }

    // --- CWE-20: Validate limit (1–200, default 50) ---
    const rawLimit = params.get('limit');
    let limit = 50;
    if (rawLimit !== null) {
      const parsed = parsePositiveInt(rawLimit);
      if (parsed === undefined || parsed < 1) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Invalid limit. Must be a positive integer.' },
          { status: 400 }
        );
      }
      limit = Math.min(parsed, 200);
    }

    // --- CWE-20: Validate offset (0+, default 0) ---
    const rawOffset = params.get('offset');
    let offset = 0;
    if (rawOffset !== null) {
      const parsed = parsePositiveInt(rawOffset);
      if (parsed === undefined) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Invalid offset. Must be a non-negative integer.' },
          { status: 400 }
        );
      }
      offset = parsed;
    }

    const db = getDb();
    let rows: ClockEntry[];

    if (person_ID !== undefined) {
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
