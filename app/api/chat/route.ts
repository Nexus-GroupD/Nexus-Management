export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are the Nexus AI assistant. You help managers and employees with scheduling, shift management, and workforce questions.

Nexus features:
- Create and manage employee schedules
- View weekly/daily shifts
- Assign employees to shifts
- Manage employee profiles (role, availability, department)
- Track staffing coverage
- Clock in/out tracking
- Time-off management

Rules:
- Only answer questions related to Nexus, scheduling, employees, or shifts
- If asked unrelated questions, politely redirect back to Nexus topics
- Keep responses short and practical
- If unsure, ask a clarifying question`;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { reply: "AI assistant is not configured. Please contact your administrator." },
        { status: 503 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "No messages provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert message history for Gemini (exclude the last user message)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1]?.content ?? "";
    const result = await chat.sendMessage(lastMessage);
    const reply  = result.response.text();

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json(
      { reply: "Error connecting to Nexus AI." },
      { status: 500 }
    );
  }
}
