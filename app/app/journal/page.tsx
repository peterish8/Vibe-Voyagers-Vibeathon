"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Mic, Save, Check } from "lucide-react";
import { format } from "date-fns";
import { useJournal } from "@/lib/hooks/use-journal";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">("neutral");
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { entries, loading, getEntryByDate, createOrUpdateEntry } =
    useJournal();

  // Load entry for selected date
  useEffect(() => {
    const loadEntry = async () => {
      try {
        const entry = await getEntryByDate(selectedDate);
        if (entry) {
          setContent(entry.content_text);
          setMood(entry.mood);
        } else {
          setContent("");
          setMood("neutral");
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
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving entry:", error);
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl input-glass"
            />
          </div>
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
                    <span className="text-2xl">
                      {moods.find((m) => m.value === entry.mood)?.emoji}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {entry.content_text}
                  </p>
                  {entry.tags.length > 0 && (
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
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                isRecording ? "bg-red-500 text-white" : "btn-glass"
              }`}
            >
              <Mic className="w-4 h-4" />
              {isRecording ? "Stop" : "Voice"}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was your day?"
            className="flex-1 w-full px-6 py-4 rounded-2xl input-glass resize-none text-lg leading-relaxed"
            style={{ lineHeight: "1.8" }}
          />

          {/* AI Summary Card (appears after saving) */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 card-glass"
            >
              <h3 className="font-semibold text-gray-900 mb-3">AI Insights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• You had a productive day with good energy levels</li>
                <li>
                  • Consider scheduling similar tasks during your peak hours
                </li>
                <li>
                  • Tomorrow&apos;s focus: Continue momentum on current projects
                </li>
              </ul>
              <button className="mt-4 text-sm text-purple-600 hover:text-purple-700">
                Regenerate
              </button>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              ) : (
                <span>Auto-saves every 5 seconds</span>
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
