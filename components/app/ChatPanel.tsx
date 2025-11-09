"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Bot,
  Target,
  BookOpen,
  Copy,
  Edit2,
  Check,
  X as XIcon,
  Trash2,
  Mic,
} from "lucide-react";
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
  edited?: boolean;
  editedAt?: Date;
}

// Character names for each mode
const CHARACTER_NAMES = {
  productivity: "Tasker",
  journal: "Scribe",
} as const;

const CHARACTER_GREETINGS = {
  productivity:
    "Hi! I'm Tasker, your productivity assistant. How can I help you get things done today?",
  journal:
    "Hello! I'm Scribe, your journaling companion. Ready to reflect and write together?",
} as const;

export default function ChatPanel() {
  const { collapsed, setCollapsed } = useChatPanel();
  const mode = "productivity"; // Fixed to productivity only

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const prevCollapsedRef = useRef(collapsed);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const accumulatedTranscriptRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);

    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText + " ";
              accumulatedTranscriptRef.current += transcriptText + " ";
            } else {
              interimTranscript += transcriptText;
            }
          }

          if (finalTranscript) {
            const processedFinal = addPunctuation(finalTranscript.trim());
            let fullText = accumulatedTranscriptRef.current.trim();
            if (fullText && !fullText.match(/[.!?]$/)) {
              fullText += " ";
            }
            fullText += processedFinal;

            if (interimTranscript) {
              fullText += " " + interimTranscript;
            }

            setInput(fullText.trim());
          } else if (interimTranscript) {
            let fullText = accumulatedTranscriptRef.current.trim();
            if (fullText && !fullText.match(/[.!?]$/)) {
              fullText += " ";
            }
            fullText += interimTranscript;
            setInput(fullText.trim());
          }
        };

        recognitionInstance.onstart = () => {
          if (input.trim()) {
            accumulatedTranscriptRef.current = input + "\n\n";
            setInput(input + "\n\n");
          } else {
            accumulatedTranscriptRef.current = input;
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "no-speech") {
            return;
          }
          setIsListening(false);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  // Clear messages when panel is reopened (transitions from collapsed to expanded)
  useEffect(() => {
    if (prevCollapsedRef.current === true && collapsed === false) {
      // Panel just reopened, clear all messages and reset to initial greeting
      setMessages([getInitialMessage(mode)]);
      setReviewingMessageId(null);
      setEditingMessageId(null);
      setError(null);
    }
    prevCollapsedRef.current = collapsed;
  }, [collapsed, mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    setMessages([getInitialMessage(mode)]);
    setReviewingMessageId(null);
    setEditingMessageId(null);
    setError(null);
  };

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

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: editContent,
              edited: true,
              editedAt: new Date(),
            }
          : msg
      )
    );
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
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

  const currentColors = {
    gradient: "from-blue-500 to-blue-600",
    icon: "text-blue-600",
    userBubble: "from-blue-500 to-blue-600",
    sendButton: "from-blue-500 to-blue-600",
    sphere: "from-blue-200 via-blue-300 to-blue-500",
  };

  // Add punctuation based on speech patterns
  const addPunctuation = (text: string): string => {
    if (!text.trim()) return text;

    const sentences = text.split(/([.!?]\s+)/).filter((s) => s.trim());

    return sentences
      .map((sentence) => {
        let cleaned = sentence.trim();
        if (!cleaned) return "";

        cleaned = cleaned.replace(/[.!?]+$/, "");
        if (!cleaned) return "";

        const questionPatterns =
          /^(what|when|where|who|why|how|is|are|was|were|do|does|did|can|could|would|should|will|didn't|doesn't|isn't|aren't|wasn't|weren't)\b/i;
        const hasQuestionWord = questionPatterns.test(cleaned);

        const exclamationPatterns =
          /\b(wow|amazing|incredible|fantastic|great|awesome|yes|yeah|yay|oh|ah|hooray|bravo|excellent|perfect|wonderful)\b/i;
        const hasExclamationWord = exclamationPatterns.test(cleaned);

        const questionIndicators =
          /\b(question|wonder|ask|curious|think|suppose|guess|maybe|perhaps)\b/i;
        const hasQuestionIndicator = questionIndicators.test(cleaned);

        const endsWithQuestion =
          /\b(what|when|where|who|why|how|right|correct|true|sure)\?*$/i.test(
            cleaned
          );

        if (hasQuestionWord || hasQuestionIndicator || endsWithQuestion) {
          return cleaned + "?";
        } else if (hasExclamationWord) {
          return cleaned + "!";
        } else {
          return cleaned + ".";
        }
      })
      .join(" ")
      .trim();
  };

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 380 }}
        animate={{ width: 60 }}
        className="glass-chat border-l border-white/30 z-30 flex flex-col items-center py-4"
        style={{
          position: "fixed",
          right: 0,
          left: "auto",
          top: "4rem",
          bottom: 0,
          transform: "translateX(0)",
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
        position: "fixed",
        right: 0,
        left: "auto",
        top: "4rem",
        bottom: 0,
        transform: "translateX(0)",
        background: "rgba(59, 130, 246, 0.1)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Background Sphere - Mode Specific */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className={`absolute w-[700px] h-[700px] rounded-full bg-gradient-to-br ${currentColors.sphere} blur-2xl`}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.5, 0.7, 0.5],
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 relative z-10">
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${currentColors.icon}`} />
          <h3 className={`font-semibold ${currentColors.icon}`}>Tasker</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearChat();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 relative z-50"
            title="Clear conversation"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCollapsed(true);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 relative z-50"
            title="Collapse AI Assistant"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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
                className={`group flex items-start gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700"
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-2.5 relative ${
                    message.role === "user"
                      ? `bg-gradient-to-r ${currentColors.userBubble} text-white rounded-br-sm`
                      : `bg-gradient-to-br ${currentColors.gradient} text-white rounded-bl-sm`
                  }`}
                >
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
                        style={{
                          color: message.role === "user" ? "white" : "inherit",
                        }}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(message.id)}
                          className="p-1 rounded hover:bg-white/20 transition-colors"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded hover:bg-white/20 transition-colors"
                          title="Cancel"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {mounted ? (
                            message.timestamp.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          ) : (
                            <span className="invisible">00:00 AM</span>
                          )}
                          {message.edited && (
                            <span className="ml-1 italic">(edited)</span>
                          )}
                        </p>
                        {message.role === "user" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(message)}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              title="Edit message"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700"
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Task Review UI */}
              {message.role === "assistant" &&
                message.parsedTasks &&
                message.parsedTasks.length > 0 &&
                reviewingMessageId === message.id && (
                  <TaskReview
                    tasks={message.parsedTasks}
                    onApply={async (tasks) => {
                      console.log(
                        "[ChatPanel] onApply called with tasks:",
                        tasks
                      );
                      try {
                        if (!tasks || tasks.length === 0) {
                          throw new Error("No tasks to create");
                        }

                        let createdCount = 0;
                        const errors = [];

                        for (const task of tasks) {
                          if (!task.title?.trim()) {
                            console.warn(
                              "[ChatPanel] Skipping task with empty title:",
                              task
                            );
                            continue;
                          }

                          try {
                            const taskData = {
                              title: task.title.trim(),
                              notes: task.description || null,
                              priority: "medium" as const,
                              effort: "medium" as const,
                              due_date: null,
                              tags: [],
                              status: "open" as const,
                            };

                            console.log(
                              "[ChatPanel] Creating simple task:",
                              taskData
                            );
                            await createTask(taskData);
                            createdCount++;
                            console.log(
                              `[ChatPanel] Task ${createdCount} created successfully`
                            );
                          } catch (taskError: any) {
                            console.error(
                              `[ChatPanel] Error creating task "${task.title}":`,
                              taskError
                            );
                            errors.push(
                              `${task.title}: ${
                                taskError.message || "Unknown error"
                              }`
                            );
                          }
                        }

                        if (createdCount === 0) {
                          throw new Error(
                            `No tasks were created. Errors: ${errors.join(
                              ", "
                            )}`
                          );
                        }

                        console.log(
                          `[ChatPanel] ${createdCount} tasks created successfully`
                        );

                        // Auto-schedule tasks to calendar
                        if (createdCount > 0) {
                          try {
                            console.log(
                              "[ChatPanel] Auto-scheduling tasks to calendar..."
                            );
                            const now = new Date();
                            let currentTime = new Date();
                            currentTime.setHours(now.getHours() + 1, 0, 0, 0); // Start 1 hour from now

                            for (const task of tasks.slice(0, createdCount)) {
                              const eventData = {
                                title: task.title,
                                category: "deep-work" as const,
                                start_ts: currentTime.toISOString(),
                                end_ts: new Date(
                                  currentTime.getTime() + 60 * 60 * 1000
                                ).toISOString(), // 1 hour duration
                                notes: task.description || null,
                              };

                              const response = await fetch("/api/events", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(eventData),
                              });

                              if (response.ok) {
                                console.log(
                                  `[ChatPanel] Scheduled "${
                                    task.title
                                  }" at ${currentTime.toLocaleTimeString()}`
                                );
                                // Move to next hour for next task
                                currentTime = new Date(
                                  currentTime.getTime() + 90 * 60 * 1000
                                ); // 1.5 hours later
                              }
                            }

                            // Notify calendar to refresh
                            window.dispatchEvent(
                              new CustomEvent("eventsUpdated")
                            );
                            console.log(
                              "[ChatPanel] Tasks auto-scheduled to calendar"
                            );
                          } catch (scheduleError) {
                            console.error(
                              "[ChatPanel] Error auto-scheduling:",
                              scheduleError
                            );
                          }
                        }

                        // Refetch tasks to update the list
                        await refetchTasks();
                        console.log(
                          "[ChatPanel] Tasks refetched, closing review UI"
                        );
                        setReviewingMessageId(null);
                        setError(null);

                        // Show success message
                        if (errors.length > 0) {
                          alert(
                            `${createdCount} tasks created and scheduled! ${
                              errors.length
                            } failed: ${errors.join(", ")}`
                          );
                        } else {
                          console.log(
                            `[ChatPanel] ${createdCount} tasks created and auto-scheduled successfully`
                          );
                        }
                      } catch (err: any) {
                        console.error(
                          "[ChatPanel] Error in task creation process:",
                          err
                        );
                        const errorMessage =
                          err.message ||
                          "Failed to create tasks. Please try again.";
                        setError(errorMessage);
                        // Don't re-throw - let TaskReview handle the error state properly
                      }
                    }}
                    onCancel={() => {
                      console.log(
                        "[ChatPanel] onCancel called, closing task review"
                      );
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
            <div
              className={`bg-gradient-to-br ${currentColors.gradient} rounded-3xl rounded-bl-sm px-4 py-2.5`}
            >
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
              className="px-3 py-1.5 rounded-full text-xs glass hover:bg-white/80 transition-colors whitespace-nowrap flex-shrink-0 text-gray-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200/50 relative z-10">
        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              if (!recognition) {
                alert("Speech recognition not supported in this browser");
                return;
              }

              if (isRecording) {
                recognition.stop();
                setIsRecording(false);
                setIsListening(false);
              } else {
                recognition.start();
                setIsRecording(true);
                setIsListening(true);
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "glass hover:bg-white/80 text-gray-600"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none z-0"
              style={{
                background:
                  mode === "productivity"
                    ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                    : "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                padding: "2px",
                borderRadius: "16px",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
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
