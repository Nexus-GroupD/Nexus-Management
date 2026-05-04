/// <reference types="jest" />

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

jest.mock("../../lib/db", () => {
  const mockDb = {
    exec:    jest.fn(),
    prepare: jest.fn(),
  };
  return { __esModule: true, default: mockDb };
});

import { GET, POST, PATCH } from "../../app/api/shifts/route";
import db from "../../lib/db";

const mockPrepare = db.prepare as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  (db.exec as jest.Mock).mockImplementation(() => {});
});

describe("GET /api/shifts", () => {
  it("returns all shifts successfully", async () => {
    const mockRows = [
      {
        shiftId: 1, date: "2026-04-02", startTime: "9:00 AM", endTime: "5:00 PM",
        personId: 1, "employee.id": 1, "employee.name": "Alex Rivera",
      },
      {
        shiftId: 2, date: "2026-04-02", startTime: "5:00 PM", endTime: "11:00 PM",
        personId: null, "employee.id": null, "employee.name": null,
      },
    ];

    mockPrepare.mockReturnValue({ all: jest.fn().mockReturnValue(mockRows) });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].employee).toEqual({ id: 1, name: "Alex Rivera" });
    expect(data.data[1].employee).toBeNull();
  });

  it("returns 500 if database throws", async () => {
    mockPrepare.mockImplementation(() => { throw new Error("Database failure"); });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error." });
  });
});

describe("POST /api/shifts", () => {
  it("creates a shift successfully", async () => {
    const newShift = { shiftId: 3, date: "2026-04-03", startTime: "9:00 AM", endTime: "5:00 PM", personId: null };

    mockPrepare.mockReturnValue({
      run: jest.fn().mockReturnValue({ lastInsertRowid: 3 }),
      get: jest.fn().mockReturnValue(newShift),
    });

    const req = { json: async () => ({ date: "2026-04-03", startTime: "9:00 AM", endTime: "5:00 PM" }) } as any;
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 400 if required fields are missing", async () => {
    const req = { json: async () => ({ date: "2026-04-03" }) } as any;
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ success: false, error: "date, startTime, and endTime are required." });
  });

  it("returns 500 if database throws", async () => {
    mockPrepare.mockImplementation(() => { throw new Error("Database failure"); });

    const req = { json: async () => ({ date: "2026-04-03", startTime: "9:00 AM", endTime: "5:00 PM" }) } as any;
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error." });
  });
});

describe("PATCH /api/shifts", () => {
  it("assigns an employee to a shift", async () => {
    const updatedShift = { shiftId: 1, date: "2026-04-02", startTime: "9:00 AM", endTime: "5:00 PM", personId: 2 };

    mockPrepare.mockReturnValue({
      run: jest.fn(),
      get: jest.fn().mockReturnValue(updatedShift),
    });

    const req = { json: async () => ({ shiftId: 1, personId: 2 }) } as any;
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, data: updatedShift });
  });

  it("unassigns an employee from a shift", async () => {
    const updatedShift = { shiftId: 1, date: "2026-04-02", startTime: "9:00 AM", endTime: "5:00 PM", personId: null };

    mockPrepare.mockReturnValue({
      run: jest.fn(),
      get: jest.fn().mockReturnValue(updatedShift),
    });

    const req = { json: async () => ({ shiftId: 1, personId: null }) } as any;
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, data: updatedShift });
  });

  it("returns 400 if shiftId is missing", async () => {
    const req = { json: async () => ({ personId: 2 }) } as any;
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ success: false, error: "shiftId is required." });
  });

  it("returns 500 if database throws", async () => {
    mockPrepare.mockImplementation(() => { throw new Error("Database failure"); });

    const req = { json: async () => ({ shiftId: 1, personId: 2 }) } as any;
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ success: false, error: "Internal server error." });
  });
});
