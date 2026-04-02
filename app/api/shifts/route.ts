import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/shifts — fetch all shifts
export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      include: { employee: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return NextResponse.json({ success: true, data: shifts });
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
      return NextResponse.json({ success: false, error: 'date, startTime, and endTime are required.' }, { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: { date, startTime, endTime, personId: personId || null },
    });
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
      return NextResponse.json({ success: false, error: 'shiftId is required.' }, { status: 400 });
    }

    const shift = await prisma.shift.update({
      where: { shiftId },
      data: { personId: personId ?? null },
    });
    return NextResponse.json({ success: true, data: shift });
  } catch (err) {
    console.error('[shifts PATCH]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
