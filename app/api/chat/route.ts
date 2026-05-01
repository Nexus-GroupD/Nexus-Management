import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "OpenAI API key not configured." },
        { status: 500 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    // Extract the actual reply from OpenAI response
    const reply = response.choices[0]?.message?.content ?? "No response.";

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json(
      { reply: "Error connecting to AI." },
      { status: 500 }
    );
  }
}
