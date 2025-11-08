"use client";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export type AIMode = "productivity" | "journal";

export async function sendAIMessage(
  message: string,
  conversationHistory: AIMessage[] = [],
  mode: AIMode = "productivity"
): Promise<string> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        mode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get AI response");
    }

    const data = await response.json();
    return data.message;
  } catch (error: any) {
    console.error("Error sending AI message:", error);
    throw error;
  }
}
