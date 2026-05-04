export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Validates the message content for type, emptiness, and length
function validateMessageContent(content: unknown) {
  if (typeof content !== "string") {
    return "Message content must be text";
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return "Message cannot be empty";
  }

  if (trimmed.length > 500) {
    return "Message cannot exceed 500 characters";
  }

  return null;
}

// Returns a forbidden response
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Handles POST requests to send a message
export async function POST(req: Request) {
  // Check authentication
  if (!requireAuth(req)) return forbidden();

  try {
    // Parse request body
    const { conversationId, senderId, content } = await req.json();

    // Validate message content
    const validationError = validateMessageContent(content);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json({ error: "Message cannot exceed 500 characters" }, { status: 400 });
    }

    // Verify sender is a participant in this conversation
    const participant = db.prepare(`
      SELECT id FROM conversation_participants
      WHERE conversation_id = ? AND employee_id = ?
    `).get(Number(conversationId), Number(senderId));

    if (!participant) {
      return NextResponse.json({ error: "Not a participant in this conversation" }, { status: 403 });
    }

    // Insert the message into the database
    const result = db.prepare(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (?, ?, ?)
    `).run(Number(conversationId), Number(senderId), trimmedContent) as { lastInsertRowid: number };

    // Update conversation timestamp
    db.prepare("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(Number(conversationId));

    // Fetch the inserted message with sender details
    const message = db.prepare(`
      SELECT m.id, m.content, m.sender_id AS senderId, m.created_at AS createdAt,
             p.id AS senderId2, p.name AS senderName
      FROM messages m
      JOIN people p ON p.id = m.sender_id
      WHERE m.id = ?
    `).get(result.lastInsertRowid) as any;

    // Return the message data
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
