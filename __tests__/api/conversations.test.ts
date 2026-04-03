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
    conversation: {
      findMany: jest.fn(),
    },
  },
}));

import { GET } from "../../app/api/conversations/route";
import { prisma } from "../../lib/prisma";

describe("GET /api/conversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if employeeId is missing", async () => {
    const req = { url: "http://localhost:3000/api/conversations" } as Request;

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "employeeId is required" });
  });

  it("returns 400 if employeeId is not a number", async () => {
    const req = {
      url: "http://localhost:3000/api/conversations?employeeId=abc",
    } as Request;

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "employeeId must be a number" });
  });

  it("returns conversations for a valid employeeId", async () => {
    const mockConversations = [
      {
        id: 1,
        participants: [
          {
            employeeId: 1,
            employee: { id: 1, name: "Alex Rivera" },
          },
          {
            employeeId: 2,
            employee: { id: 2, name: "Jordan Lee" },
          },
        ],
        messages: [
          {
            id: 1,
            content: "Hi Jordan, can you cover the Friday evening shift?",
            senderId: 1,
            createdAt: "2026-03-31T10:00:00.000Z",
            sender: { id: 1, name: "Alex Rivera" },
          },
        ],
      },
    ];

    const findManyMock = prisma.conversation.findMany as jest.Mock;
    findManyMock.mockResolvedValue(mockConversations);

    const req = {
      url: "http://localhost:3000/api/conversations?employeeId=2",
    } as Request;

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockConversations);
    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        participants: {
          some: {
            employeeId: 2,
          },
        },
      },
      include: {
        participants: {
          include: {
            employee: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  });

  it("returns 500 if prisma throws an error", async () => {
    const findManyMock = prisma.conversation.findMany as jest.Mock;
    findManyMock.mockRejectedValue(new Error("Database failure"));

    const req = {
      url: "http://localhost:3000/api/conversations?employeeId=2",
    } as Request;

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to fetch conversations" });
  });
});