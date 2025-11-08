import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const {
      message,
      conversationHistory,
      mode = "productivity",
    } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize Google GenAI
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_GENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // Build conversation context with mode-specific system prompt
    const systemPrompt =
      mode === "productivity"
        ? `You are a friendly, encouraging AI assistant for FlowNote. When users provide task lists, respond with a brief, encouraging message (1 sentence, max 20 words) like "Great tasks! Let's get these organized." or "Nice list! Here's how we can structure these." Then add parsed tasks in this exact format:

<FLOWNOTE_TASKS>
{
  "tasks": [
    {
      "title": "Task title",
      "priority": "high|medium|low",
      "effort": "small|medium|large",
      "due_date": "YYYY-MM-DD or null",
      "tags": []
    }
  ]
}
</FLOWNOTE_TASKS>

Rules:
- Keep responses VERY SHORT (1 sentence, max 20 words)
- Be encouraging and friendly, not formal
- Use casual language like "Great!", "Nice!", "Let's do this!"
- Parse comma-separated task lists automatically
- Infer priority/effort from context`
        : `You are a concise AI assistant for FlowNote focused on journaling. Keep responses SHORT (2-3 sentences, max 50 words). Be empathetic and direct.`;

    // Build contents array for proper conversation structure
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> =
      [];

    // Add system prompt as first user message
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    // Add conversation history if provided
    if (
      conversationHistory &&
      Array.isArray(conversationHistory) &&
      conversationHistory.length > 0
    ) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === "user" || msg.role === "assistant") {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          });
        }
      });
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Generate response using proper array structure
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const responseText =
      response.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({
      message: responseText,
      success: true,
    });
  } catch (error: any) {
    console.error("AI API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate AI response",
        success: false,
      },
      { status: 500 }
    );
  }
}
