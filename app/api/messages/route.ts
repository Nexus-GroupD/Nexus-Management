import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This POST route handles creating new messages in the database.
// It includes input validation to ensure only safe and well-formed data is stored.
// This helps protect against malformed requests, spam, and potential abuse.

export async function POST(req: Request) {
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
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: "Message cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId: Number(senderId),
        content: trimmedContent,
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}