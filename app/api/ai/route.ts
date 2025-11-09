import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Check if the message is a greeting
 * Returns a formal reply if it's a greeting, null otherwise
 */
function handleGreeting(message: string): string | null {
  const lowerMessage = message.toLowerCase().trim();
  
  const greetings = [
    "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
    "greetings", "howdy", "hi there", "hello there"
  ];
  
  const thanks = [
    "thank you", "thanks", "thank", "appreciate", "grateful", "thanks a lot",
    "thank you so much", "ty", "thx"
  ];
  
  if (greetings.some(g => lowerMessage === g || lowerMessage.startsWith(g + " "))) {
    return "Hello! I'm here to help you with your productivity and task management. How can I assist you today?";
  }
  
  if (thanks.some(t => lowerMessage.includes(t))) {
    return "You're very welcome! I'm glad I could help. Is there anything else you'd like assistance with?";
  }
  
  return null;
}

/**
 * Check if the user's message is relevant to task/calendar creation
 * Returns true if relevant, false otherwise
 */
function isRelevantToProductivity(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  // Keywords related to tasks, calendar, scheduling, productivity
  const relevantKeywords = [
    // Task-related
    "task", "todo", "to-do", "to do", "remind", "reminder", "deadline", "due",
    "complete", "finish", "do", "need to", "have to", "should", "must",
    "create", "add", "make", "plan", "schedule", "organize", "organise",
    
    // Calendar/Time-related
    "calendar", "event", "meeting", "appointment", "schedule", "time",
    "date", "when", "today", "tomorrow", "week", "month", "year",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "january", "february", "march", "april", "may", "june", "july",
    "august", "september", "october", "november", "december",
    
    // Productivity-related
    "priority", "urgent", "important", "effort", "work", "project",
    "goal", "objective", "milestone", "checklist", "list",
    
    // Action verbs (expanded)
    "buy", "call", "email", "send", "write", "read", "study", "learn",
    "prepare", "review", "revise", "submit", "attend", "visit", "go to",
    "go out", "meet", "hang", "hangout", "hang out", "play", "exercise",
    "workout", "gym", "swim", "run", "jog", "walk", "practice", "practice",
    
    // Academic subjects (common abbreviations and full names)
    "math", "maths", "physics", "chemistry", "biology", "bio", "computer",
    "cs", "js", "javascript", "python", "java", "coding", "programming",
    
    // Social activities
    "friend", "frnd", "frnds", "friends", "party", "dinner", "lunch", "breakfast",
    "movie", "cinema", "shopping", "travel", "trip",
    
    // Common task patterns
    "i need", "i have to", "i should", "i want to", "help me", "want to",
    "can you", "please", "add", "set", "book", "reserve", "need", "want"
  ];
  
  // Check if message contains any relevant keywords
  const hasRelevantKeyword = relevantKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check if message looks like a task list (contains commas, numbers, or bullet-like patterns)
  const looksLikeTaskList = 
    lowerMessage.includes(",") || 
    /^\d+[\.\)]\s/.test(lowerMessage) || // Numbered list
    /^[-•*]\s/.test(lowerMessage) || // Bullet list
    lowerMessage.split(/\n/).length > 1; // Multiple lines
  
  // Check for common activity patterns (e.g., "go out", "study X", "revise X")
  const hasActivityPattern = 
    /(go|going)\s+(out|to|for)/.test(lowerMessage) || // "go out", "going to"
    /(study|revise|review|learn|practice)\s+\w+/.test(lowerMessage) || // "study math", "revise js"
    /(meet|meeting|hang|play|do)\s+(with|at|for)/.test(lowerMessage); // "meet with friends", "play at"
  
  // Message is relevant if it has keywords, looks like a task list, or has activity patterns
  return hasRelevantKeyword || looksLikeTaskList || hasActivityPattern;
}

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

    // Handle greetings with formal replies
    const greetingReply = handleGreeting(message);
    if (greetingReply) {
      return NextResponse.json({
        message: greetingReply,
        success: true,
      });
    }

    // Get current time for context (needed for relevance check and system prompt)
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Check if message is relevant to productivity mode (task/calendar creation)
    if (mode === "productivity" && !isRelevantToProductivity(message)) {
      // Provide time-aware suggestions even for non-task messages
      const timeAdvice = currentHour >= 6 && currentHour < 10 
        ? "Since it's morning, this is perfect for planning your day! What tasks would you like to tackle?"
        : currentHour >= 10 && currentHour < 14
        ? "It's peak productivity time! What important work can I help you organize?"
        : currentHour >= 14 && currentHour < 17
        ? "Afternoon is great for meetings and admin tasks. What needs scheduling?"
        : currentHour >= 17 && currentHour < 20
        ? "Evening is perfect for planning tomorrow. What would you like to prepare?"
        : "It's getting late - maybe plan for tomorrow instead? What tasks are on your mind?";
      
      return NextResponse.json({
        message: `I'm here to help with productivity and task management. ${timeAdvice}`,
        success: true,
      });
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
    
    // Determine energy level based on time
    let energyLevel = 'medium';
    let timeContext = '';
    
    if (currentHour >= 6 && currentHour < 10) {
      energyLevel = 'high';
      timeContext = 'morning (high energy time)';
    } else if (currentHour >= 10 && currentHour < 14) {
      energyLevel = 'high';
      timeContext = 'late morning (peak productivity)';
    } else if (currentHour >= 14 && currentHour < 17) {
      energyLevel = 'medium';
      timeContext = 'afternoon (moderate energy)';
    } else if (currentHour >= 17 && currentHour < 20) {
      energyLevel = 'medium';
      timeContext = 'evening (winding down)';
    } else {
      energyLevel = 'low';
      timeContext = 'late evening/night (low energy)';
    }

    // Build conversation context with mode-specific system prompt
    const systemPrompt =
      mode === "productivity"
        ? `You are a time-aware AI productivity assistant for FlowNote. Current context: ${currentDay}, ${currentTime} (${timeContext}).

When users provide tasks or activities, you MUST extract ALL distinct tasks/activities mentioned. Do not combine or group them unless they are truly the same task.

CRITICAL: Extract EVERY separate activity as its own task:
- Each study session = separate task
- Each meeting/appointment = separate task
- Each class/activity = separate task
- Each routine activity = separate task (unless user says "skip routines")
- Each preparation activity = separate task

IMPORTANT: CATEGORIZE TASKS INTO TWO TYPES:

1. ACADEMIC SUBJECTS (Physics, Chemistry, Maths, Biology, Computer Science):
   - These tasks MUST have an "effort" field (small|medium|large) based on difficulty
   - Tag them with "academic" and the subject name (e.g., ["academic", "physics"])
   - Examples: "study physics", "prepare for chemistry test", "math homework", "biology revision", "computer science project"

2. PHYSICAL ACTIVITIES (sports, exercise, fitness, recreational activities):
   - These tasks MUST have "effort": null or omit the effort field entirely
   - Tag them with "physical" and activity type (e.g., ["physical", "swimming"], ["physical", "jogging"])
   - Examples: "swimming", "jogging", "gym workout", "yoga", "meditation", "basketball", "cycling"

Example: If user says "I need to study physics today and prepare for the upcoming test on Tuesday, I have swimming classes in the evening at 5 and I'm meeting my friend after that. apart from these things I have my usual routines of jogging at 7am and meditating at 9pm"
You should extract:
1. Study physics (today) - ACADEMIC: effort="medium", tags=["academic", "physics"], title="Study physics"
2. Prepare for test (Tuesday) - ACADEMIC: effort="high", tags=["academic", "physics"], title="Prepare for Physics test"
3. Swimming class (5pm) - PHYSICAL: effort=null, tags=["physical", "swimming"], title="Swimming class at 5pm"
4. Meet friend (after swimming) - SOCIAL: effort=null, tags=["social"], title="Meet friend after swimming"
5. Jogging (7am routine) - PHYSICAL: effort=null, tags=["physical", "jogging"], title="Jogging at 7am"
6. Meditating (9pm routine) - PHYSICAL/WELLNESS: effort=null, tags=["physical", "meditation"], title="Meditate at 9pm"

CRITICAL: Always include time information in the task title if mentioned by the user:
- "jogging at 7am" → title="Jogging at 7am"
- "swimming at 5pm" → title="Swimming at 5pm"  
- "meditating at 9pm" → title="Meditate at 9pm"
- "meeting friend after swimming" → title="Meet friend after swimming"

That's 6 separate tasks, not 2!

Time-based recommendations:
- Morning (6-10 AM): Suggest high-focus, important tasks
- Late morning (10 AM-2 PM): Peak productivity - complex work
- Afternoon (2-5 PM): Meetings, admin tasks, moderate effort
- Evening (5-8 PM): Light tasks, planning, review
- Night (8 PM+): Avoid scheduling, suggest rest

For task lists, use this format:
<FLOWNOTE_TASKS>
{
  "tasks": [
    {
      "title": "Task title (be specific and clear)",
      "priority": "high|medium|low",
      "effort": "small|medium|large|null (ONLY for academic subjects, null for physical activities)",
      "due_date": "YYYY-MM-DD or null (extract dates mentioned like 'Tuesday', 'today', etc.)",
      "suggested_time": "morning|afternoon|evening based on effort and current time",
      "tags": ["academic" or "physical", subject/activity name, ...]
    }
  ]
}
</FLOWNOTE_TASKS>

CRITICAL RULES FOR EFFORT FIELD:
- Academic subjects (Physics, Chemistry, Maths, Biology, Computer Science): MUST include effort field (small|medium|large)
- Physical activities (swimming, jogging, gym, yoga, sports, etc.): MUST set effort to null or omit it
- Social activities (meetings, hangouts): effort should be null
- Other tasks: use effort based on complexity, but physical activities always null

Rules:
- Extract ALL distinct tasks mentioned - do not skip any
- If user mentions "study physics" and "prepare for test", these are TWO separate tasks
- If user mentions "swimming at 5pm" and "meeting friend after", these are TWO separate tasks
- Routines (like jogging, meditating) should be included unless user explicitly says to skip them
- ALWAYS distinguish academic subjects from physical activities
- Academic subjects: MUST have effort field (small|medium|large) based on difficulty
- Physical activities: MUST have effort=null (no difficulty level)
- Use appropriate tags: ["academic", "physics"] for subjects, ["physical", "swimming"] for activities
- Give time-aware advice ("Since it's ${timeContext}, I suggest...")
- Consider energy levels for task scheduling
- Keep responses SHORT but helpful
- Be encouraging and personalized`
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
    let responseText = "I'm sorry, I couldn't generate a response. Please try again.";
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      // Extract text from response - handle different response structures
      if (response && typeof response.text === 'function') {
        responseText = response.text();
      } else if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
        const content = response.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          responseText = content.parts[0].text;
        }
      } else {
        console.error("Unexpected response structure:", JSON.stringify(response, null, 2));
        throw new Error("Unexpected response format from AI service");
      }
    } catch (genError: any) {
      console.error("Error generating content:", genError);
      throw new Error(`AI generation failed: ${genError.message || "Unknown error"}`);
    }

    return NextResponse.json({
      message: responseText,
      success: true,
    });
  } catch (error: any) {
    console.error("AI API error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate AI response",
        success: false,
      },
      { status: 500 }
    );
  }
}
