export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Mock database tools (replace with Prisma later)
async function getShifts() {
  return [
    { employee: "John", time: "9-5" },
    { employee: "Sarah", time: "12-6" },
  ];
}

async function getEmployeeShifts(_name: string) {
  return [
    { date: "2026-05-03", time: "9-5" },
    { date: "2026-05-04", time: "10-4" },
  ];
}

function detectToolCall(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("today") || lower.includes("schedule")) {
    return "getShifts";
  }

  if (lower.includes("john")) {
    return "getEmployeeShifts";
  }

  return null;
}

const SYSTEM_PROMPT = `
You are the Nexus AI assistant.

You help manage employee schedules.

RULES:
- Use provided data to answer questions
- Never guess scheduling info
- Be concise and helpful

Nexus is an employee scheduling and workforce management system.

Core features:
- Create and manage employee schedules
- View weekly/daily shifts
- Assign employees to shifts
- Manage employee profiles (role, availability, department)
- Track staffing coverage

Behavior rules:
- Only answer questions related to Nexus, scheduling, employees, shifts, or system usage.
- If the user asks unrelated questions, politely redirect them back to Nexus.
- When explaining features, give clear step-by-step instructions.
- Keep responses short, practical, and easy to follow.
- If unsure, ask clarifying questions instead of guessing.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastMessage = messages[messages.length - 1]?.content;

    const tool = detectToolCall(lastMessage);

    let toolData = null;

    // STEP 1: run tool if needed
    if (tool === "getShifts") {
      toolData = await getShifts();
    }

    if (tool === "getEmployeeShifts") {
      toolData = await getEmployeeShifts("John");
    }

    // STEP 2: build prompt with real data
    const prompt = `
${SYSTEM_PROMPT}

USER QUESTION:
${lastMessage}

TOOL DATA:
${toolData ? JSON.stringify(toolData, null, 2) : "none"}

Respond naturally using this data.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      reply: response.text,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { reply: "Error connecting to Nexus AI." },
      { status: 500 }
    );
  }
}
