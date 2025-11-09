"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { format, addDays, isSameDay, addHours, setHours, setMinutes, startOfDay } from "date-fns";
import { ParsedTask } from "@/lib/parse-tasks";
import { useEvents } from "@/lib/hooks/use-events";

interface ScheduledTask {
  task: ParsedTask;
  startTime: Date | null;
  endTime: Date | null;
  dayIndex: number;
  hour: number;
  duration: number;
}

interface MultiTaskSchedulerProps {
  tasks: ParsedTask[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduledTasks: Array<{ task: ParsedTask; start: Date; end: Date }>) => Promise<void>;
}

export default function MultiTaskScheduler({
  tasks,
  isOpen,
  onClose,
  onSave,
}: MultiTaskSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dayStart = startOfDay(selectedDate);
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
  const { events, refetch } = useEvents(dayStart, addDays(dayStart, 1));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getDuration = (effort: "small" | "medium" | "large" | null | string): number => {
    if (effort === null || effort === undefined) return 1;
    switch (effort) {
      case "small": return 0.5;
      case "medium": return 1.5;
      case "large": return 3;
      default: return 1.5;
    }
  };

  const handleAIAllocateAll = () => {
    if (tasks.length === 0) {
      alert("No tasks to allocate");
      return;
    }

    setIsAllocating(true);
    setScheduledTasks([]);
    
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    const allocated: ScheduledTask[] = [];
    let currentHour = 9;
    let currentMinutes = 0;

    sortedTasks.forEach((task) => {
      const duration = getDuration(task.effort);
      
      const startTime = new Date(selectedDate);
      startTime.setHours(currentHour, currentMinutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setTime(startTime.getTime() + (duration * 60 * 60 * 1000));
      
      allocated.push({
        task,
        startTime,
        endTime,
        dayIndex: 0,
        hour: currentHour,
        duration
      });
      
      const totalMinutes = (duration * 60) + 15;
      currentMinutes += totalMinutes;
      
      while (currentMinutes >= 60) {
        currentHour += 1;
        currentMinutes -= 60;
      }
    });

    setScheduledTasks(allocated);
    setIsAllocating(false);
  };

  const handleSave = async () => {
    const validScheduled = scheduledTasks.filter((st) => st.startTime && st.endTime);
    if (validScheduled.length === 0) {
      alert("Please schedule at least one task");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(
        validScheduled.map((st) => ({
          task: st.task,
          start: st.startTime!,
          end: st.endTime!,
        }))
      );
      await refetch();
      onClose();
    } catch (error) {
      console.error("Error saving tasks:", error);
      alert("Failed to save tasks");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="glass-strong rounded-2xl p-4 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Schedule All Tasks
              </h2>
              <p className="text-sm text-gray-600">{tasks.length} tasks • {scheduledTasks.length} scheduled</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAIAllocateAll}
                disabled={isAllocating}
                className="btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50"
              >
                {isAllocating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI Allocate All
                  </>
                )}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Tasks to Schedule</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No tasks to schedule
                </div>
              ) : (
                tasks.map((task) => {
                  const scheduled = scheduledTasks.find((st) => st.task.id === task.id);
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border-2 ${
                        scheduled ? "bg-green-50 border-green-200" : "bg-white/70 border-white/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              task.priority === "high" ? "bg-red-100 text-red-700" :
                              task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              task.effort === "small" ? "bg-green-100 text-green-700" :
                              task.effort === "medium" ? "bg-amber-100 text-amber-700" :
                              task.effort === "large" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {task.effort || 'N/A'}
                            </span>
                          </div>
                        </div>
                        {scheduled && scheduled.startTime && scheduled.endTime && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(scheduled.startTime, "h:mm a")} - {format(scheduled.endTime, "h:mm a")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="btn-glass">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={scheduledTasks.filter((st) => st.startTime && st.endTime).length === 0 || isSaving}
              className="btn-primary disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All ({scheduledTasks.filter((st) => st.startTime && st.endTime).length}/{tasks.length})
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}