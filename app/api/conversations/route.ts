export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, hasPermission, getUserId } from "@/lib/auth";

/**
 * Returns a 403 Forbidden response
 */
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * GET /api/conversations
 * Retrieves all conversations for a given employee
 * Query params: employeeId (required)
 * Returns: Array of conversations with participants and messages
 */
export async function GET(req: Request) {
  // Verify user is authenticated
  if (!requireAuth(req)) return forbidden();

  // Extract employeeId from query parameters
  const { searchParams } = new URL(req.url);
  const employeeIdParam  = searchParams.get("employeeId");

  // Validate employeeId parameter exists
  if (!employeeIdParam) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  // Convert and validate employeeId is a number
  const employeeId = Number(employeeIdParam);
  if (Number.isNaN(employeeId)) {
    return NextResponse.json({ error: "employeeId must be a number" }, { status: 400 });
  }

  // Check permissions: user can only view their own conversations or has messages.view permission
  const currentUserId = getUserId(req);
  if (currentUserId !== employeeId && !hasPermission(req, "messages.view")) {
    return forbidden();
  }

  try {
    // Fetch all conversations for the employee
    const convRows = db.prepare(`
      SELECT DISTINCT c.id, c.created_at, c.updated_at
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE cp.employee_id = ?
      ORDER BY c.updated_at DESC
    `).all(employeeId) as { id: number; created_at: string; updated_at: string }[];

    // Map conversations with participants and messages
    const conversations = convRows.map((conv) => {
      // Fetch all participants in the conversation
      const participants = db.prepare(`
        SELECT cp.employee_id AS employeeId, p.id, p.name
        FROM conversation_participants cp
        JOIN people p ON p.id = cp.employee_id
        WHERE cp.conversation_id = ?
      `).all(conv.id) as { employeeId: number; id: number; name: string }[];

      // Fetch all messages in the conversation
      const messages = db.prepare(`
        SELECT m.id, m.content, m.sender_id AS senderId, m.created_at AS createdAt,
               p.id AS "sender.id", p.name AS "sender.name"
        FROM messages m
        JOIN people p ON p.id = m.sender_id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
      `).all(conv.id) as any[];

      return {
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        participants: participants.map((p) => ({
          employeeId: p.employeeId,
          employee: { id: p.id, name: p.name },
        })),
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          createdAt: m.createdAt,
          sender: { id: m["sender.id"], name: m["sender.name"] },
        })),
      };
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!requireAuth(req)) return forbidden();

  try {
    const { employeeId, otherEmployeeId } = await req.json();

    if (!employeeId || !otherEmployeeId) {
      return NextResponse.json(
        { error: "employeeId and otherEmployeeId are required" },
        { status: 400 }
      );
    }

    if (Number(employeeId) === Number(otherEmployeeId)) {
      return NextResponse.json(
        { error: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    const existing = db.prepare(`
      SELECT c.id FROM conversations c
      JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.employee_id = ?
      JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.employee_id = ?
    `).get(Number(employeeId), Number(otherEmployeeId)) as { id: number } | undefined;

    if (existing) {
      const participants = db.prepare(`
        SELECT cp.employee_id AS employeeId, p.id, p.name
        FROM conversation_participants cp
        JOIN people p ON p.id = cp.employee_id
        WHERE cp.conversation_id = ?
      `).all(existing.id) as any[];

      return NextResponse.json({
        id: existing.id,
        participants: participants.map((p) => ({
          employeeId: p.employeeId,
          employee: { id: p.id, name: p.name },
        })),
        messages: [],
      });
    }

    const result = db.prepare("INSERT INTO conversations DEFAULT VALUES").run() as { lastInsertRowid: number };
    const convId = result.lastInsertRowid;

    db.prepare("INSERT INTO conversation_participants (conversation_id, employee_id) VALUES (?, ?)").run(convId, Number(employeeId));
    db.prepare("INSERT INTO conversation_participants (conversation_id, employee_id) VALUES (?, ?)").run(convId, Number(otherEmployeeId));

    const participants = db.prepare(`
      SELECT cp.employee_id AS employeeId, p.id, p.name
      FROM conversation_participants cp
      JOIN people p ON p.id = cp.employee_id
      WHERE cp.conversation_id = ?
    `).all(convId) as any[];

    return NextResponse.json({
      id: convId,
      participants: participants.map((p) => ({
        employeeId: p.employeeId,
        employee: { id: p.id, name: p.name },
      })),
      messages: [],
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
