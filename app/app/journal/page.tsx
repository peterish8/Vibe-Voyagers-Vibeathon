"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Mic, Save, Check, Bot, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useJournal } from "@/lib/hooks/use-journal";


export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">("neutral");
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIInsights, setShowAIInsights] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<{[key: string]: string}>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const accumulatedTranscriptRef = useRef<string>("");
  const processedTranscriptRef = useRef<string>("");
  const isRecognitionActiveRef = useRef<boolean>(false);

  const { entries, loading, getEntryByDate, createOrUpdateEntry, deleteEntry } =
    useJournal();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = "";
          let newFinalTranscript = "";

          // Process only new results (from resultIndex onwards)
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              newFinalTranscript += transcriptText + " ";
            } else {
              interimTranscript += transcriptText;
            }
          }

          // If we have new final transcript, add it to accumulated and process
          if (newFinalTranscript) {
            // Add to accumulated (raw text, no punctuation)
            accumulatedTranscriptRef.current += newFinalTranscript;
            
            // Process only the NEW part with punctuation
            const processedNew = addPunctuation(newFinalTranscript.trim());
            
            // Combine processed previous + processed new
            // Preserve line breaks and paragraph structure
            let displayText = processedTranscriptRef.current;
            
            // If previous text ends with newlines (\n\n), we're in a new paragraph - don't add space
            // If it ends with punctuation, add space before next sentence
            // If it doesn't end with punctuation or newline, add space
            if (displayText && !displayText.match(/[\n.!?]$/)) {
              displayText += " ";
            }
            // If it ends with \n\n, the processedNew will start on a new line (paragraph break preserved)
            
            displayText += processedNew;
            
            // Update processed transcript ref
            processedTranscriptRef.current = displayText;
            
            // Add interim results if any
            if (interimTranscript) {
              displayText += " " + interimTranscript;
            }
            
            setTranscript(displayText);
            setContent(displayText);
          } else if (interimTranscript) {
            // Just show interim results with accumulated (processed)
            let displayText = processedTranscriptRef.current;
            if (displayText && !displayText.match(/[\n.!?]$/)) {
              displayText += " ";
            }
            displayText += interimTranscript;
            setTranscript(displayText);
            setContent(displayText);
          }
        };

        recognitionInstance.onstart = () => {
          isRecognitionActiveRef.current = true;
          // Get the latest content from state (use a function to get current value)
          // This ensures we have the most up-to-date content
          setContent((prevContent) => {
            const currentContent = prevContent.trim();
            if (currentContent) {
              // Add paragraph break (two newlines) to create a new paragraph
              const newContent = currentContent + "\n\n";
              accumulatedTranscriptRef.current = newContent;
              processedTranscriptRef.current = newContent;
              setTranscript(newContent);
              setIsRecording(true);
              setIsListening(true);
              return newContent;
            } else {
              accumulatedTranscriptRef.current = "";
              processedTranscriptRef.current = "";
              setTranscript("");
              setIsRecording(true);
              setIsListening(true);
              return "";
            }
          });
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "no-speech") {
            // User stopped speaking, keep listening
            return;
          }
          setIsListening(false);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          isRecognitionActiveRef.current = false;
          // Preserve the final content when recording ends (keep line breaks)
          const finalContent = processedTranscriptRef.current;
          if (finalContent) {
            setContent(finalContent);
            accumulatedTranscriptRef.current = finalContent;
            processedTranscriptRef.current = finalContent;
          }
          setIsListening(false);
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
        
        // Cleanup on unmount
        return () => {
          if (recognitionInstance) {
            try {
              recognitionInstance.stop();
            } catch (e) {
              // Ignore errors on cleanup
            }
          }
        };
      } else {
        setIsSupported(false);
        console.warn("Speech recognition not supported in this browser");
      }
    }
  }, []);

  // Add punctuation based on speech patterns
  const addPunctuation = (text: string): string => {
    if (!text.trim()) return text;
    
    // Split text into sentences (by existing punctuation or pauses)
    const sentences = text.split(/([.!?]\s+)/).filter(s => s.trim());
    
    return sentences.map(sentence => {
      let cleaned = sentence.trim();
      if (!cleaned) return "";
      
      // Remove existing punctuation at the end
      cleaned = cleaned.replace(/[.!?]+$/, "");
      if (!cleaned) return "";
      
      // Check for question words/phrases at the start
      const questionPatterns = /^(what|when|where|who|why|how|is|are|was|were|do|does|did|can|could|would|should|will|didn't|doesn't|isn't|aren't|wasn't|weren't)\b/i;
      const hasQuestionWord = questionPatterns.test(cleaned);
      
      // Check for exclamation words/phrases
      const exclamationPatterns = /\b(wow|amazing|incredible|fantastic|great|awesome|yes|yeah|yay|oh|ah|hooray|bravo|excellent|perfect|wonderful)\b/i;
      const hasExclamationWord = exclamationPatterns.test(cleaned);
      
      // Check for question indicators
      const questionIndicators = /\b(question|wonder|ask|curious|think|suppose|guess|maybe|perhaps)\b/i;
      const hasQuestionIndicator = questionIndicators.test(cleaned);
      
      // Check if sentence ends with a question structure
      const endsWithQuestion = /\b(what|when|where|who|why|how|right|correct|true|sure)\?*$/i.test(cleaned);
      
      // Add appropriate punctuation
      if (hasQuestionWord || hasQuestionIndicator || endsWithQuestion) {
        return cleaned + "?";
      } else if (hasExclamationWord) {
        return cleaned + "!";
      } else {
        // Default to period
        return cleaned + ".";
      }
    }).join(" ").trim();
  };

  // Load entry for selected date
  useEffect(() => {
    const loadEntry = async () => {
      try {
        const entry = await getEntryByDate(selectedDate);
        if (entry) {
          setContent(entry.content_text);
          setMood(entry.mood);
          setSaved(false); // Reset saved state when loading
        } else {
          setContent("");
          setMood("neutral");
          setSaved(false);
        }
      } catch (error) {
        console.error("Error loading entry:", error);
      }
    };

    loadEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleSave = async () => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await createOrUpdateEntry({
        entry_date: dateStr,
        content_text: content,
        mood,
        tags: [],
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    }
  };

  const handleDelete = async (entryId: string, entryDate: Date) => {
    try {
      await deleteEntry(entryId);
      setDeleteConfirmId(null);
      
      // If the deleted entry is currently selected, clear the editor
      if (format(entryDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
        setContent("");
        setMood("neutral");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  };

  const generateAIInsights = async (entryId: string, entryContent: string, entryMood: string) => {
    setLoadingAI(entryId);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on this journal entry, provide 3-4 brief suggestions for tomorrow in this format:

Morning routine suggestions (1-2 items):
• [suggestion]

Wellness suggestions (1-2 items):
• [suggestion]

If there are any serious health concerns mentioned, suggest consulting a doctor. Keep suggestions general and positive.

Journal entry: "${entryContent}"
Mood: ${entryMood}`,
          mode: 'journal'
        })
      });
      
      const data = await response.json();
      setAiInsights(prev => ({ ...prev, [entryId]: data.message }));
      setShowAIInsights(entryId);
    } catch (error) {
      console.error('Error generating insights:', error);
      setAiInsights(prev => ({ ...prev, [entryId]: 'Unable to generate insights at the moment. Please try again.' }));
      setShowAIInsights(entryId);
    } finally {
      setLoadingAI(null);
    }
  };

  const moods = [
    { emoji: "😊", value: "happy" as const, label: "Happy" },
    { emoji: "😐", value: "neutral" as const, label: "Neutral" },
    { emoji: "😞", value: "sad" as const, label: "Sad" },
  ];

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    return entry.content_text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Entry List */}
      <div className="w-[30%] bg-white/50 border-r border-white/30 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Journal
          </h2>
        </div>

                <div className="space-y-3">
                  {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => {
              const entryDate = new Date(entry.entry_date);
              const isSelected =
                format(entryDate, "yyyy-MM-dd") ===
                format(selectedDate, "yyyy-MM-dd");

              return (
                <motion.div
                  key={entry.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDate(entryDate)}
                  className={`card-glass p-4 cursor-pointer ${
                    isSelected ? "bg-purple-50 border-purple-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {format(entryDate, "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {moods.find((m) => m.value === entry.mood)?.emoji}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(entry.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {entry.content_text}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1 flex-wrap">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateAIInsights(entry.id, entry.content_text, entry.mood);
                      }}
                      disabled={loadingAI === entry.id}
                      className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
                    >
                      {loadingAI === entry.id ? (
                        '...'
                      ) : (
                        <>
                          <Bot className="w-3 h-3" />
                          AI
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showAIInsights === entry.id && aiInsights[entry.id] && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-700">AI Suggestions</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAIInsights(null);
                          }}
                          className="text-purple-400 hover:text-purple-600 p-1"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-purple-800 whitespace-pre-line">
                        {aiInsights[entry.id]}
                      </div>
                    </div>
                  )}
                  
                  {/* Delete Confirmation */}
                  {deleteConfirmId === entry.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-800 mb-2">
                        Are you sure you want to delete this entry? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id, entryDate);
                          }}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 text-sm py-8">
              {searchQuery ? "No entries found" : "No journal entries yet"}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Editor */}
      <div className="flex-1 flex flex-col p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="input-glass"
            />
            <div className="flex gap-2">
              {moods.map((m) => (
                <motion.button
                  key={m.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMood(m.value)}
                  className={`text-4xl p-2 rounded-xl transition-all ${
                    mood === m.value
                      ? "bg-purple-100 scale-110"
                      : "hover:bg-gray-100"
                  }`}
                  title={m.label}
                >
                  {m.emoji}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSupported ? (
              <button
                onClick={() => {
                  if (isRecording) {
                    // Stop recording
                    if (recognition) {
                      try {
                        recognition.stop();
                        isRecognitionActiveRef.current = false;
                      } catch (error: any) {
                        console.error("Error stopping recognition:", error);
                        // Continue anyway to update state
                        isRecognitionActiveRef.current = false;
                      }
                    }
                    // Preserve the final content (keep line breaks)
                    const finalContent = processedTranscriptRef.current;
                    if (finalContent) {
                      setContent(finalContent);
                      accumulatedTranscriptRef.current = finalContent;
                      processedTranscriptRef.current = finalContent;
                    }
                    setIsRecording(false);
                    setIsListening(false);
                  } else {
                    // Start recording
                    if (recognition && !isRecording && !isRecognitionActiveRef.current) {
                      // Use functional update to get the latest content state
                      setContent((prevContent) => {
                        const currentContent = prevContent.trim();
                        if (currentContent) {
                          // Add paragraph break (two newlines) to create a new paragraph
                          const newContent = currentContent + "\n\n";
                          accumulatedTranscriptRef.current = newContent;
                          processedTranscriptRef.current = newContent;
                          setTranscript(newContent);
                          // Start recognition after state is updated
                          setTimeout(() => {
                            try {
                              if (recognition && !isRecognitionActiveRef.current) {
                                recognition.start();
                              }
                            } catch (error: any) {
                              console.error("Error starting recognition:", error);
                              if (error.name === "InvalidStateError") {
                                // Recognition already started, just update state
                                isRecognitionActiveRef.current = true;
                                setIsRecording(true);
                                setIsListening(true);
                              }
                            }
                          }, 100);
                          return newContent;
                        } else {
                          accumulatedTranscriptRef.current = "";
                          processedTranscriptRef.current = "";
                          setTranscript("");
                          // Start recognition after state is updated
                          setTimeout(() => {
                            try {
                              if (recognition && !isRecognitionActiveRef.current) {
                                recognition.start();
                              }
                            } catch (error: any) {
                              console.error("Error starting recognition:", error);
                              if (error.name === "InvalidStateError") {
                                // Recognition already started, just update state
                                isRecognitionActiveRef.current = true;
                                setIsRecording(true);
                                setIsListening(true);
                              }
                            }
                          }, 100);
                          return "";
                        }
                      });
                    }
                  }
                }}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  isRecording 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "btn-glass hover:bg-purple-50"
                }`}
                disabled={!isSupported}
              >
                <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
                {isRecording ? "Stop Recording" : "Start Voice"}
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm">
                Voice not supported in this browser
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                Listening...
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false); // Reset saved state when content changes
            }}
            placeholder="How was your day?"
            className="flex-1 w-full px-6 py-4 rounded-2xl input-glass resize-none text-lg leading-relaxed"
            style={{ lineHeight: "1.8" }}
          />



          {/* Save Button */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              ) : (
                <span>Write your thoughts...</span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
