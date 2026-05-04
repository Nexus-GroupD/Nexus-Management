export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY is not set");
    return NextResponse.json(
      { reply: "AI assistant is not configured. Please contact your administrator." },
      { status: 503 }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "No messages provided." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build history from all but the last message
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1]?.content ?? "";
    const result = await chat.sendMessage(lastMessage);
    const reply  = result.response.text();

    return NextResponse.json({ reply });

  } catch (err: any) {
    // Log the real error so it shows in Railway logs
    console.error("[chat] Gemini error:", err?.message ?? err);
    return NextResponse.json(
      { reply: `AI error: ${err?.message ?? "Unknown error"}` },
      { status: 500 }
    );
  }
}
