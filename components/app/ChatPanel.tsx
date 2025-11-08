"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, Target, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendAIMessage, type AIMessage } from "@/lib/ai";
import { parseAIResponse, type ParsedTask } from "@/lib/parse-tasks";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useChatPanel } from "@/lib/contexts/ChatPanelContext";
import TaskReview from "./TaskReview";

type AIMode = "productivity" | "journal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  parsedTasks?: ParsedTask[];
}

// Character names for each mode
const CHARACTER_NAMES = {
  productivity: "Tasker",
  journal: "Scribe",
} as const;

const CHARACTER_GREETINGS = {
  productivity: "Hi! I'm Tasker, your productivity assistant. How can I help you get things done today?",
  journal: "Hello! I'm Scribe, your journaling companion. Ready to reflect and write together?",
} as const;

export default function ChatPanel() {
  const { collapsed, setCollapsed } = useChatPanel();
  const [mode, setMode] = useState<AIMode>("productivity");
  
  // Initialize messages with mode-specific greeting
  const getInitialMessage = (currentMode: AIMode) => ({
    id: "1",
    role: "assistant" as const,
    content: CHARACTER_GREETINGS[currentMode],
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([
    getInitialMessage("productivity"),
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { createTask, refetch: refetchTasks } = useTasks();
  const [reviewingMessageId, setReviewingMessageId] = useState<string | null>(
    null
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const userInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // Build conversation history for context
      const conversationHistory: AIMessage[] = messages
        .filter((msg) => msg.id !== "1") // Exclude initial greeting
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call AI API with mode
      const aiResponse = await sendAIMessage(
        userInput,
        conversationHistory,
        mode
      );

      // Parse response for tasks (only in productivity mode)
      const parsed =
        mode === "productivity"
          ? parseAIResponse(aiResponse)
          : { text: aiResponse, tasks: [] };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: parsed.text,
        timestamp: new Date(),
        parsedTasks: parsed.tasks.length > 0 ? parsed.tasks : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Show review UI if tasks were parsed
      if (parsed.tasks.length > 0) {
        setReviewingMessageId(aiMessage.id);
      }
    } catch (err: any) {
      console.error("Error getting AI response:", err);
      setError(err.message || "Failed to get AI response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = {
    productivity: [
      "Plan my day",
      "Create tasks from notes",
      "Schedule my meetings",
    ],
    journal: [
      "Summarize today",
      "Reflect on my week",
      "What patterns do you notice?",
    ],
  };

  const modeColors = {
    productivity: {
      gradient: "from-blue-500 to-blue-600",
      icon: "text-blue-600",
      userBubble: "from-blue-500 to-blue-600",
      sendButton: "from-blue-500 to-blue-600",
      sphere: "from-blue-400 via-blue-500 to-blue-600",
    },
    journal: {
      gradient: "from-purple-500 to-purple-600",
      icon: "text-purple-600",
      userBubble: "from-purple-500 to-purple-600",
      sendButton: "from-purple-500 to-purple-600",
      sphere: "from-purple-400 via-purple-500 to-purple-600",
    },
  };

  const currentColors = modeColors[mode];

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 380 }}
        animate={{ width: 60 }}
        className="glass-chat border-l border-white/30 z-30 flex flex-col items-center py-4"
        style={{ 
          position: 'fixed',
          right: 0,
          left: 'auto',
          top: '4rem',
          bottom: 0,
          transform: 'translateX(0)',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <Bot className={`w-5 h-5 ${currentColors.icon}`} />
        </motion.button>
      </motion.div>
    );
  }

  return (
            <motion.aside
              initial={{ width: 60 }}
              animate={{ width: 380 }}
              className="glass-chat border-l border-white/30 z-30 flex flex-col relative overflow-hidden"
              style={{ 
                position: 'fixed',
                right: 0,
                left: 'auto',
                top: '4rem',
                bottom: 0,
                transform: 'translateX(0)',
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(24px)",
              }}
            >
      {/* Background Sphere - Mode Specific */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className={`absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br ${currentColors.sphere} blur-3xl`}
          initial={{ scale: 0.8, opacity: 0.2 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 relative z-10">
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${currentColors.icon}`} />
          <h3 className="font-semibold text-gray-900">{CHARACTER_NAMES[mode]}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCollapsed(true);
            }}
            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700 relative z-50"
            title="Collapse AI Assistant"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20 relative z-10">
        <button
          onClick={() => {
            setMode("productivity");
            // Reset messages with new character greeting
            setMessages([getInitialMessage("productivity")]);
            setReviewingMessageId(null);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === "productivity"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
              : "glass hover:bg-white/80 text-gray-700"
          }`}
        >
          <Target className="w-4 h-4" />
          Productivity
        </button>
        <button
          onClick={() => {
            setMode("journal");
            // Reset messages with new character greeting
            setMessages([getInitialMessage("journal")]);
            setReviewingMessageId(null);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === "journal"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
              : "glass hover:bg-white/80 text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Journal
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 relative z-10">
        <AnimatePresence>
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-2.5 ${
                    message.role === "user"
                      ? `bg-gradient-to-r ${currentColors.userBubble} text-white rounded-br-sm`
                      : "glass-strong text-gray-700 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs mt-1 opacity-70" suppressHydrationWarning>
                    {typeof window !== "undefined" 
                      ? message.timestamp.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </motion.div>

              {/* Task Review UI */}
              {message.role === "assistant" &&
                message.parsedTasks &&
                message.parsedTasks.length > 0 &&
                reviewingMessageId === message.id && (
                  <TaskReview
                    tasks={message.parsedTasks}
                    onApply={async (tasks) => {
                      console.log("[ChatPanel] onApply called with tasks:", tasks);
                      try {
                        if (!tasks || tasks.length === 0) {
                          throw new Error("No tasks to create");
                        }

                        let createdCount = 0;
                        for (const task of tasks) {
                          if (!task.title || !task.title.trim()) {
                            console.warn("[ChatPanel] Skipping task with empty title:", task);
                            continue;
                          }
                          
                          console.log("[ChatPanel] Creating task:", {
                            title: task.title,
                            priority: task.priority,
                            effort: task.effort,
                            due_date: task.due_date,
                          });

                          await createTask({
                            title: task.title.trim(),
                            notes: task.description || null,
                            priority: task.priority,
                            effort: task.effort,
                            due_date: task.due_date,
                            tags: task.tags || [],
                            status: "open",
                          });
                          
                          createdCount++;
                          console.log(`[ChatPanel] Task ${createdCount} created successfully`);
                        }

                        if (createdCount === 0) {
                          throw new Error("No valid tasks to create");
                        }

                        console.log(`[ChatPanel] All ${createdCount} tasks created, refetching...`);
                        // Refetch tasks to update the list
                        await refetchTasks();
                        console.log("[ChatPanel] Tasks refetched, closing review UI");
                        setReviewingMessageId(null);
                        setError(null);
                      } catch (err: any) {
                        console.error("[ChatPanel] Error creating tasks:", err);
                        const errorMessage = err.message || "Failed to create tasks. Please try again.";
                        setError(errorMessage);
                        throw err; // Re-throw so TaskReview can handle loading state
                      }
                    }}
                    onCancel={() => {
                      console.log("[ChatPanel] onCancel called, closing task review");
                      setReviewingMessageId(null);
                    }}
                  />
                )}
            </div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-strong rounded-3xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1">
                <div
                  className={`w-2 h-2 rounded-full animate-bounce bg-gradient-to-r ${currentColors.gradient}`}
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className={`w-2 h-2 rounded-full animate-bounce bg-gradient-to-r ${currentColors.gradient}`}
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className={`w-2 h-2 rounded-full animate-bounce bg-gradient-to-r ${currentColors.gradient}`}
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 pb-2">
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto relative z-10 scrollbar-hide">
          {quickPrompts[mode].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 rounded-full text-xs glass hover:bg-white/80 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/20 relative z-10">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none z-0"
              style={{
                background: mode === "productivity"
                  ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                  : "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                padding: "2px",
                borderRadius: "16px",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="relative w-full px-4 py-3 rounded-2xl resize-none max-h-24 overflow-hidden transition-all duration-200 focus:outline-none focus:ring-0 border-0 text-gray-900 placeholder:text-gray-400 z-10"
              style={{
                height: "auto",
                minHeight: "44px",
                background: "transparent",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                borderRadius: "16px",
              }}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentColors.sendButton} text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
