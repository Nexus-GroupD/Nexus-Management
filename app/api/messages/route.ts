export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, getUserId } from "@/lib/auth";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/* ── POST /api/messages ── */
export async function POST(req: Request) {
  if (!requireAuth(req)) return forbidden();

  try {
    const { conversationId, senderId, content } = await req.json();

    if (!conversationId || !senderId || typeof content !== "string") {
      return NextResponse.json(
        { error: "conversationId, senderId, and content are required" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json({ error: "Message cannot exceed 500 characters" }, { status: 400 });
    }

    // Verify the conversation exists and sender is a participant
    const participant = db.prepare(`
      SELECT id FROM conversation_participants
      WHERE conversation_id = ? AND employee_id = ?
    `).get(Number(conversationId), Number(senderId));

    if (!participant) {
      return NextResponse.json({ error: "Not a participant in this conversation" }, { status: 403 });
    }

    const result = db.prepare(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (?, ?, ?)
    `).run(Number(conversationId), Number(senderId), trimmedContent) as { lastInsertRowid: number };

    // Update conversation updated_at timestamp
    db.prepare("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(Number(conversationId));

    const message = db.prepare(`
      SELECT m.id, m.content, m.sender_id AS senderId, m.created_at AS createdAt,
             p.id AS senderId2, p.name AS senderName
      FROM messages m
      JOIN people p ON p.id = m.sender_id
      WHERE m.id = ?
    `).get(result.lastInsertRowid) as any;

    return NextResponse.json({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt,
      sender: { id: message.senderId2, name: message.senderName },
    }, { status: 201 });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
