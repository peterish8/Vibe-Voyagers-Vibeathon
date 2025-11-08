"use client";

import { useState } from "react";
import { Check, Edit2, X, Loader2, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ParsedTask } from "@/lib/parse-tasks";
import TaskScheduleModal from "./TaskScheduleModal";
import MultiTaskScheduler from "./MultiTaskScheduler";

interface TaskReviewProps {
  tasks: ParsedTask[];
  onApply: (tasks: ParsedTask[]) => Promise<void>;
  onCancel: () => void;
}

export default function TaskReview({ tasks, onApply, onCancel }: TaskReviewProps) {
  const [editingTasks, setEditingTasks] = useState<ParsedTask[]>(tasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"title" | "description" | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [schedulingTask, setSchedulingTask] = useState<ParsedTask | null>(null);
  const [showMultiScheduler, setShowMultiScheduler] = useState(false);

  const handleEditTitle = (task: ParsedTask) => {
    setEditingId(task.id);
    setEditingField("title");
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const handleSaveEdit = (taskId: string) => {
    setEditingTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: editTitle.trim(),
              description: editDescription.trim() || undefined,
            }
          : task
      )
    );
    setEditingId(null);
    setEditingField(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handlePriorityChange = (taskId: string, priority: "low" | "medium" | "high") => {
    setEditingTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, priority } : task))
    );
  };

  const handleEffortChange = (taskId: string, effort: "small" | "medium" | "large") => {
    setEditingTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, effort } : task))
    );
  };

  const getEffortColor = (effort: "small" | "medium" | "large") => {
    switch (effort) {
      case "small":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "large":
        return "bg-red-100 text-red-700 border-red-300";
    }
  };

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
    }
  };

  const handleRemove = (taskId: string) => {
    setEditingTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleApply = async () => {
    if (editingTasks.length === 0) {
      console.warn("[TaskReview] No tasks to apply");
      return;
    }
    
    console.log("[TaskReview] Applying tasks:", editingTasks);
    setIsApplying(true);
    
    try {
      await onApply(editingTasks);
      console.log("[TaskReview] Tasks applied successfully");
    } catch (error) {
      console.error("[TaskReview] Error applying tasks:", error);
      // Don't reset isApplying on error - let the error message show
      // The error will be displayed in ChatPanel
      throw error; // Re-throw so ChatPanel can handle it
    } finally {
      setIsApplying(false);
    }
  };

  if (editingTasks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 glass-strong rounded-2xl p-4 border border-purple-200/30 shadow-lg relative z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm text-gray-900">
          {editingTasks.length} task{editingTasks.length > 1 ? "s" : ""}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMultiScheduler(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Allocate All
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("[TaskReview] Cancel button clicked, calling onCancel");
              onCancel();
              console.log("[TaskReview] onCancel called");
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors relative z-[100] cursor-pointer flex items-center justify-center"
            type="button"
            aria-label="Close task review"
            style={{ pointerEvents: 'auto' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto overflow-x-hidden">
        {editingTasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-xl bg-white/70 border border-white/50 hover:border-purple-200/50 transition-all"
          >
            {editingId === task.id && editingField === "title" ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-3 py-2 rounded-lg text-sm input-glass font-medium"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-xs input-glass resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveEdit(task.id)}
                    className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm text-gray-900 mb-1">
                      {task.title}
                    </h5>
                    {task.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSchedulingTask(task)}
                      className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Schedule on Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditTitle(task)}
                      className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium w-16">Priority:</span>
                    <div className="flex items-center gap-1">
                      {(["low", "medium", "high"] as const).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(task.id, priority)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all ${
                            task.priority === priority
                              ? getPriorityColor(priority) + " scale-110"
                              : "bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-200"
                          }`}
                          title={priority.charAt(0).toUpperCase() + priority.slice(1)}
                        >
                          {priority.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium w-16">Effort:</span>
                    <div className="flex items-center gap-1">
                      {(["small", "medium", "large"] as const).map((effort) => (
                        <button
                          key={effort}
                          onClick={() => handleEffortChange(task.id, effort)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all ${
                            task.effort === effort
                              ? getEffortColor(effort) + " scale-110"
                              : "bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-200"
                          }`}
                          title={effort.charAt(0).toUpperCase() + effort.slice(1)}
                        >
                          {effort.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("[TaskReview] Apply button clicked", { 
              editingTasksLength: editingTasks.length,
              isApplying,
              tasks: editingTasks 
            });
            handleApply();
          }}
          disabled={isApplying || editingTasks.length === 0}
          className="flex-1 btn-primary flex items-center justify-center gap-1.5 text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Check className="w-3 h-3" />
              Apply
            </>
          )}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          disabled={isApplying}
          className="px-3 py-2 rounded-full text-xs font-medium btn-glass disabled:opacity-50 relative z-50"
          type="button"
        >
          Cancel
        </button>
      </div>

      {/* Task Schedule Modal */}
      {schedulingTask && (
        <TaskScheduleModal
          task={schedulingTask}
          isOpen={!!schedulingTask}
          onClose={() => setSchedulingTask(null)}
          onSchedule={async ({ start, end }) => {
            // Task is scheduled, you can update the task or create an event
            console.log("Task scheduled:", { start, end });
          }}
        />
      )}

      {/* Multi-Task Scheduler */}
      {showMultiScheduler && (
        <MultiTaskScheduler
          tasks={editingTasks}
          isOpen={showMultiScheduler}
          onClose={() => setShowMultiScheduler(false)}
          onSave={async (scheduledTasks) => {
            try {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error("Not authenticated");

              console.log(`[TaskReview] Saving ${scheduledTasks.length} scheduled tasks`);

              // Create events for all scheduled tasks
              const insertPromises = scheduledTasks.map((st) =>
                supabase.from("events").insert({
                  user_id: user.id,
                  title: st.task.title,
                  category: "deep-work",
                  start_ts: st.start.toISOString(),
                  end_ts: st.end.toISOString(),
                  notes: st.task.description || null,
                })
              );

              const results = await Promise.all(insertPromises);
              
              // Check for errors
              const errors = results.filter((r) => r.error);
              if (errors.length > 0) {
                console.error("Errors saving some tasks:", errors);
                throw new Error(`Failed to save ${errors.length} tasks`);
              }

              console.log(`[TaskReview] Successfully scheduled ${scheduledTasks.length} tasks`);
            } catch (error) {
              console.error("[TaskReview] Error saving scheduled tasks:", error);
              throw error;
            }
          }}
        />
      )}
    </motion.div>
  );
}


