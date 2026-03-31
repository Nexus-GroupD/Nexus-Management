import { GET } from "@/app/api/conversations/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    conversation: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/conversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if employeeId is missing", async () => {
    const req = new Request("http://localhost:3000/api/conversations");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "employeeId is required" });
  });

  it("returns 400 if employeeId is not a number", async () => {
    const req = new Request(
      "http://localhost:3000/api/conversations?employeeId=abc"
    );

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
            createdAt: new Date("2026-03-31T10:00:00.000Z"),
            sender: { id: 1, name: "Alex Rivera" },
          },
        ],
      },
    ];

    (prisma.conversation.findMany as jest.Mock).mockResolvedValue(
      mockConversations
    );

    const req = new Request(
      "http://localhost:3000/api/conversations?employeeId=2"
    );

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockConversations);
    expect(prisma.conversation.findMany).toHaveBeenCalledWith({
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
    (prisma.conversation.findMany as jest.Mock).mockRejectedValue(
      new Error("Database failure")
    );

    const req = new Request(
      "http://localhost:3000/api/conversations?employeeId=2"
    );

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to fetch conversations" });
  });
});