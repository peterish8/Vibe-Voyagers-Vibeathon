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
        ? `You are a friendly AI assistant for FlowNote. When users provide task lists, you MUST respond with ONLY a JSON object in this exact format (no other text before or after):

{
  "message": "Brief encouraging message (max 15 words)",
  "tasks": [
    {
      "title": "Task title",
      "description": "Optional description",
      "priority": "high|medium|low",
      "effort": "small|medium|large",
      "due_date": "YYYY-MM-DD or null",
      "tags": []
    }
  ]
}

CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no code blocks, no extra text
- Parse comma-separated task lists automatically
- Infer priority from keywords: "urgent", "important", "asap" = high; "later", "whenever" = low
- Infer effort from keywords: "quick", "simple", "easy" = small; "complex", "big", "major" = large
- Extract dates from text like "before 11", "after 8pm", "tomorrow" and convert to YYYY-MM-DD format
- If no tasks detected, return: {"message": "I didn't find any tasks. Can you list them?", "tasks": []}`
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

    let responseText =
      response.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    // For productivity mode, try to parse JSON response
    if (mode === "productivity") {
      try {
        // Remove markdown code blocks if present
        responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        // Try to parse as JSON
        const jsonResponse = JSON.parse(responseText);
        
        // Validate structure
        if (jsonResponse.tasks && Array.isArray(jsonResponse.tasks)) {
          return NextResponse.json({
            message: jsonResponse.message || "Tasks parsed successfully!",
            tasks: jsonResponse.tasks,
            success: true,
          });
        }
      } catch (parseError) {
        // If JSON parsing fails, fall back to text parsing
        console.log("JSON parse failed, using text parser:", parseError);
      }
    }

    return NextResponse.json({
      message: responseText,
      tasks: [],
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
