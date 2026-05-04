export const runtime = "nodejs";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeIdParam = searchParams.get("employeeId");

    if (!employeeIdParam) {
      return NextResponse.json(
        { error: "employeeId is required" },
        { status: 400 }
      );
    }

    const employeeId = Number(employeeIdParam);

    if (Number.isNaN(employeeId)) {
      return NextResponse.json(
        { error: "employeeId must be a number" },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            employeeId,
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

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { employeeId: Number(employeeId) },
            { employeeId: Number(otherEmployeeId) },
          ],
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
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}