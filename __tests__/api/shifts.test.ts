/// <reference types="jest" />
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

jest.mock("../../lib/prisma", () => ({
  prisma: {
    shift: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { GET, POST, PATCH } from "../../app/api/shifts/route";
import { prisma } from "../../lib/prisma";

describe("GET /api/shifts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns all shifts successfully", async () => {
    const mockShifts = [
      {
        shiftId: 1,
        date: "2026-04-02",
        startTime: "9:00 AM",
        endTime: "5:00 PM",
        personId: 1,
        employee: { id: 1, name: "Alex Rivera" },
      },
      {
        shiftId: 2,
        date: "2026-04-02",
        startTime: "5:00 PM",
        endTime: "11:00 PM",
        personId: null,
        employee: null,
      },
    ];

    const findManyMock = prisma.shift.findMany as jest.Mock;
    findManyMock.mockResolvedValue(mockShifts);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, data: mockShifts });
    expect(findManyMock).toHaveBeenCalledWith({
      include: { employee: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  });

  it("returns 500 if prisma throws an error", async () => {
    const findManyMock = prisma.shift.findMany as jest.Mock;
    findManyMock.mockRejectedValue(new Error("Database failure"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error." });
  });
});

describe("POST /api/shifts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a shift successfully", async () => {
    const newShift = {
      shiftId: 3,
      date: "2026-04-03",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      personId: null,
    };

    const createMock = prisma.shift.create as jest.Mock;
    createMock.mockResolvedValue(newShift);

    const req = {
      json: async () => ({
        date: "2026-04-03",
        startTime: "9:00 AM",
        endTime: "5:00 PM",
      }),
    } as Request;

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, data: newShift });
  });

  it("returns 400 if required fields are missing", async () => {
    const req = {
      json: async () => ({ date: "2026-04-03" }),
    } as Request;

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: "date, startTime, and endTime are required.",
    });
  });

  it("returns 500 if prisma throws an error", async () => {
    const createMock = prisma.shift.create as jest.Mock;
    createMock.mockRejectedValue(new Error("Database failure"));

    const req = {
      json: async () => ({
        date: "2026-04-03",
        startTime: "9:00 AM",
        endTime: "5:00 PM",
      }),
    } as Request;

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error." });
  });
});

describe("PATCH /api/shifts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("assigns an employee to a shift", async () => {
    const updatedShift = {
      shiftId: 1,
      date: "2026-04-02",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      personId: 2,
    };

    const updateMock = prisma.shift.update as jest.Mock;
    updateMock.mockResolvedValue(updatedShift);

    const req = {
      json: async () => ({ shiftId: 1, personId: 2 }),
    } as Request;

    const res = await PATCH(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, data: updatedShift });
    expect(updateMock).toHaveBeenCalledWith({
      where: { shiftId: 1 },
      data: { personId: 2 },
    });
  });

  it("unassigns an employee from a shift", async () => {
    const updatedShift = {
      shiftId: 1,
      date: "2026-04-02",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      personId: null,
    };

    const updateMock = prisma.shift.update as jest.Mock;
    updateMock.mockResolvedValue(updatedShift);

    const req = {
      json: async () => ({ shiftId: 1, personId: null }),
    } as Request;

    const res = await PATCH(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, data: updatedShift });
    expect(updateMock).toHaveBeenCalledWith({
      where: { shiftId: 1 },
      data: { personId: null },
    });
  });

  it("returns 400 if shiftId is missing", async () => {
    const req = {
      json: async () => ({ personId: 2 }),
    } as Request;

    const res = await PATCH(req as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: "shiftId is required.",
    });
  });

  it("returns 500 if prisma throws an error", async () => {
    const updateMock = prisma.shift.update as jest.Mock;
    updateMock.mockRejectedValue(new Error("Database failure"));

    const req = {
      json: async () => ({ shiftId: 1, personId: 2 }),
    } as Request;

    const res = await PATCH(req as any);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error." });
  });
});
