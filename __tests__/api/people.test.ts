/// <reference types="jest" />

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

jest.mock("../../lib/db", () => ({
  __esModule: true,
  default: { prepare: jest.fn() },
}));

jest.mock("../../lib/auth", () => ({
  requireAuth: jest.fn(),
  hasPermission: jest.fn(),
}));

import { GET, POST, PUT, DELETE } from "../../app/api/people/route";
import { requireAuth, hasPermission } from "../../lib/auth";
import db from "../../lib/db";

const mockRequireAuth = requireAuth as jest.Mock;
const mockHasPermission = hasPermission as jest.Mock;
const mockPrepare = db.prepare as jest.Mock;

function stmt(run = jest.fn(), get = jest.fn(), all = jest.fn()) {
  return { run, get, all };
}

function makeReq(body?: unknown): Request {
  return { json: async () => body, headers: { get: () => "" } } as unknown as Request;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET ──────────────────────────────────────────────────────────────────────

describe("GET /api/people", () => {
  it("returns 403 if not authenticated", async () => {
    mockRequireAuth.mockReturnValue(false);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("returns 403 if missing people.view permission", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(false);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("returns people list when authorized", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockImplementation((_req: unknown, perm: string) =>
      ["people.view", "emails.view", "pay.view", "availability.view"].includes(perm)
    );

    const mockPeople = [
      { id: 1, name: "Alice", email: "alice@example.com", role: "Employee", pay_per_hour: 20, availability: null, created_at: "2026-01-01" },
    ];

    const peopleStmt = stmt(jest.fn(), jest.fn(), jest.fn().mockReturnValue(mockPeople));
    const membershipsStmt = stmt(jest.fn(), jest.fn(), jest.fn().mockReturnValue([]));
    mockPrepare
      .mockReturnValueOnce(peopleStmt)
      .mockReturnValueOnce(membershipsStmt);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Alice");
    expect(data[0].email).toBe("alice@example.com");
  });
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe("POST /api/people", () => {
  it("returns 403 if not authenticated", async () => {
    mockRequireAuth.mockReturnValue(false);

    const res = await POST(makeReq({ name: "Bob", email: "bob@example.com", role: "Employee" }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("returns 403 if authenticated but missing people.add permission", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(false);

    const res = await POST(makeReq({ name: "Bob", email: "bob@example.com", role: "Employee" }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("inserts person and returns success when authorized", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(true);
    const mockRun = jest.fn();
    mockPrepare.mockReturnValue(stmt(mockRun));

    const body = { name: "Bob", email: "bob@example.com", role: "Employee", pay_per_hour: 18, availability: { mon: true }, password: null };
    const res = await POST(makeReq(body));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: "Person added!" });
    expect(mockPrepare).toHaveBeenCalledWith(
      "INSERT INTO people (name, email, role, pay_per_hour, availability, password) VALUES (?, ?, ?, ?, ?, ?)"
    );
    expect(mockRun).toHaveBeenCalledWith(
      "Bob", "bob@example.com", "Employee", 18, JSON.stringify({ mon: true }), null
    );
  });

  it("stores null password when password is omitted", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(true);
    const mockRun = jest.fn();
    mockPrepare.mockReturnValue(stmt(mockRun));

    const body = { name: "Carol", email: "carol@example.com", role: "Employee", pay_per_hour: 15, availability: null };
    await POST(makeReq(body));

    expect(mockRun).toHaveBeenCalledWith(
      "Carol", "carol@example.com", "Employee", 15, JSON.stringify(null), null
    );
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe("PUT /api/people", () => {
  it("returns 403 if not authenticated", async () => {
    mockRequireAuth.mockReturnValue(false);

    const res = await PUT(makeReq({ id: 1, name: "Bob" }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("returns 403 if missing people.edit permission", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(false);

    const res = await PUT(makeReq({ id: 1, name: "Bob" }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("updates person without changing password when password is omitted", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(true);
    const mockRun = jest.fn();
    mockPrepare.mockReturnValue(stmt(mockRun));

    const body = { id: 1, name: "Bob Updated", email: "bob@example.com", role: "Team Lead", pay_per_hour: 25, availability: null };
    const res = await PUT(makeReq(body));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: "Person updated!" });
    expect(mockPrepare).toHaveBeenCalledWith(
      "UPDATE people SET name=?, email=?, role=?, pay_per_hour=?, availability=? WHERE id=?"
    );
  });

  it("updates person including password when password is provided", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(true);
    const mockRun = jest.fn();
    mockPrepare.mockReturnValue(stmt(mockRun));

    const body = { id: 1, name: "Bob", email: "bob@example.com", role: "Employee", pay_per_hour: 18, availability: null, password: "newpass" };
    const res = await PUT(makeReq(body));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: "Person updated!" });
    expect(mockPrepare).toHaveBeenCalledWith(
      "UPDATE people SET name=?, email=?, role=?, pay_per_hour=?, availability=?, password=? WHERE id=?"
    );
    expect(mockRun).toHaveBeenCalledWith(
      "Bob", "bob@example.com", "Employee", 18, JSON.stringify(null), "newpass", 1
    );
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe("DELETE /api/people", () => {
  it("returns 403 if not authenticated", async () => {
    mockRequireAuth.mockReturnValue(false);

    const res = await DELETE(makeReq({ id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("returns 403 if missing people.delete permission", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(false);

    const res = await DELETE(makeReq({ id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
  });

  it("deletes person and returns success when authorized", async () => {
    mockRequireAuth.mockReturnValue(true);
    mockHasPermission.mockReturnValue(true);
    const mockRun = jest.fn();
    mockPrepare.mockReturnValue(stmt(mockRun));

    const res = await DELETE(makeReq({ id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: "Person deleted!" });
    expect(mockPrepare).toHaveBeenCalledWith("DELETE FROM people WHERE id = ?");
    expect(mockRun).toHaveBeenCalledWith(1);
  });
});
