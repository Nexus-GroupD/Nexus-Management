/// <reference types="jest" />

// Mock next/server
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

// Mock better-sqlite3 so no real DB is needed
jest.mock("../../lib/db", () => {
  const mockDb = {
    exec: jest.fn(),
    prepare: jest.fn(),
  };
  return { __esModule: true, default: mockDb };
});

import { GET, POST } from "../../app/api/conversations/route";
import db from "../../lib/db";

/** Build a minimal Request with auth cookies + optional URL */
function makeRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, {
    headers: {
      cookie: "nexus-auth=admin; nexus-uid=1",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> ?? {}),
    },
    ...options,
  });
}

const mockPrepare = db.prepare as jest.Mock;


describe("GET /api/conversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.exec as jest.Mock).mockImplementation(() => {});
  });

  it("returns 403 if not authenticated", async () => {
    const req = new Request("http://localhost:3000/api/conversations?employeeId=1", {
      headers: { cookie: "" },
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("returns 400 if employeeId is missing", async () => {
    const req = makeRequest("http://localhost:3000/api/conversations");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "employeeId is required" });
  });

  it("returns 400 if employeeId is not a number", async () => {
    const req = makeRequest("http://localhost:3000/api/conversations?employeeId=abc");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "employeeId must be a number" });
  });

  it("returns conversations for a valid employeeId", async () => {
    // First prepare call = conversations query, rest = participants + messages per conv
    mockPrepare.mockImplementation(() => ({
      all: jest.fn()
        .mockReturnValueOnce([{ id: 1, created_at: "2026-01-01", updated_at: "2026-01-01" }])
        .mockReturnValueOnce([
          { employeeId: 1, id: 1, name: "Alex Rivera" },
          { employeeId: 2, id: 2, name: "Jordan Lee" },
        ])
        .mockReturnValueOnce([
          {
            id: 1,
            content: "Hi Jordan!",
            senderId: 1,
            createdAt: "2026-01-01T10:00:00Z",
            "sender.id": 1,
            "sender.name": "Alex Rivera",
          },
        ]),
      get: jest.fn(),
      run: jest.fn(),
    }));

    const req = makeRequest("http://localhost:3000/api/conversations?employeeId=1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe(1);
    expect(data[0].participants).toHaveLength(2);
    expect(data[0].messages[0].content).toBe("Hi Jordan!");
  });

  it("returns 500 if database throws", async () => {
    mockPrepare.mockImplementation(() => {
      throw new Error("Database failure");
    });

    const req = makeRequest("http://localhost:3000/api/conversations?employeeId=1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to fetch conversations" });
  });
});

describe("POST /api/conversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.exec as jest.Mock).mockImplementation(() => {});
  });

  it("returns 403 if not authenticated", async () => {
    const req = new Request("http://localhost:3000/api/conversations", {
      method: "POST",
      headers: { cookie: "", "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: 1, otherEmployeeId: 2 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 if employeeId or otherEmployeeId missing", async () => {
    const req = makeRequest("http://localhost:3000/api/conversations", {
      method: "POST",
      body: JSON.stringify({ employeeId: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 if talking to yourself", async () => {
    const req = makeRequest("http://localhost:3000/api/conversations", {
      method: "POST",
      body: JSON.stringify({ employeeId: 1, otherEmployeeId: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/yourself/i);
  });

  it("creates a new conversation and returns 201", async () => {
    mockPrepare.mockImplementation(() => ({
      get: jest.fn().mockReturnValue(undefined), // no existing conversation
      run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }),
      all: jest.fn().mockReturnValue([
        { employeeId: 1, id: 1, name: "Alex Rivera" },
        { employeeId: 2, id: 2, name: "Jordan Lee" },
      ]),
    }));

    const req = makeRequest("http://localhost:3000/api/conversations", {
      method: "POST",
      body: JSON.stringify({ employeeId: 1, otherEmployeeId: 2 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.participants).toHaveLength(2);
  });

  it("returns existing conversation if one already exists", async () => {
    mockPrepare.mockImplementation(() => ({
      get: jest.fn().mockReturnValue({ id: 3 }), // existing conversation found
      run: jest.fn(),
      all: jest.fn().mockReturnValue([
        { employeeId: 1, id: 1, name: "Alex Rivera" },
        { employeeId: 2, id: 2, name: "Jordan Lee" },
      ]),
    }));

    const req = makeRequest("http://localhost:3000/api/conversations", {
      method: "POST",
      body: JSON.stringify({ employeeId: 1, otherEmployeeId: 2 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(3);
  });
});
