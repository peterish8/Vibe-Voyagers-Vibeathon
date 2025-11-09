"use client";

export interface ParsedTask {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  effort: "small" | "medium" | "large" | null;
  due_date: string | null;
  tags: string[];
}

export interface ParsedResponse {
  text: string;
  tasks: ParsedTask[];
}

/**
 * Parse AI response to extract tasks from FLOWNOTE_TASKS JSON block
 */
export function parseAIResponse(response: string): ParsedResponse {
  const result: ParsedResponse = {
    text: response,
    tasks: [],
  };

  try {
    // Look for FLOWNOTE_TASKS block
    const taskBlockMatch = response.match(/<FLOWNOTE_TASKS>([\s\S]*?)<\/FLOWNOTE_TASKS>/);
    
    if (taskBlockMatch) {
      const jsonStr = taskBlockMatch[1].trim();
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        result.tasks = parsed.tasks.map((task: any, index: number) => {
          // Check if this is a physical activity (has "physical" tag or effort is null/undefined)
          const isPhysicalActivity = 
            (task.tags && Array.isArray(task.tags) && task.tags.includes("physical")) ||
            task.effort === null ||
            task.effort === undefined;
          
          // For physical activities, effort should be null
          // For academic subjects, use the provided effort or default to "medium"
          const effort = isPhysicalActivity 
            ? null 
            : ((task.effort || "medium") as "small" | "medium" | "large" | null);
          
          return {
            id: `task-${Date.now()}-${index}`,
            title: task.title || "",
            description: task.description || task.notes || undefined,
            priority: (task.priority || "medium") as "low" | "medium" | "high",
            effort: effort,
            due_date: task.due_date || null,
            tags: task.tags || [],
          };
        });
      }
      
      // Remove the FLOWNOTE_TASKS block from the text
      result.text = response.replace(/<FLOWNOTE_TASKS>[\s\S]*?<\/FLOWNOTE_TASKS>/, "").trim();
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    // If parsing fails, return the original response
  }

  return result;
}

