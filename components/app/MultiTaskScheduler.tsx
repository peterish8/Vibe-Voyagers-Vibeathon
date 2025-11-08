"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, addHours, setHours, setMinutes, startOfDay } from "date-fns";
import { ParsedTask } from "@/lib/parse-tasks";
import { useEvents } from "@/lib/hooks/use-events";
import { createClient } from "@/lib/supabase/client";

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
  const [dragOverSlot, setDragOverSlot] = useState<{ dayIndex: number; hour: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const dayStart = startOfDay(selectedDate);
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
  const { events, refetch } = useEvents(dayStart, addDays(dayStart, 1));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate duration based on effort
  const getDuration = (effort: "small" | "medium" | "large") => {
    switch (effort) {
      case "small":
        return 0.5; // 30 minutes
      case "medium":
        return 1.5; // 1.5 hours
      case "large":
        return 3; // 3 hours
    }
  };

  // AI Auto-allocate ALL tasks
  const handleAIAllocateAll = async () => {
    setIsAllocating(true);
    
    // Simulate AI processing time (you can remove this if allocation is instant)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Round to next 15-minute interval
      const roundedMinute = Math.ceil(currentMinute / 15) * 15;
      let startHour = currentHour;
      let startMin = roundedMinute;
      
      if (startMin >= 60) {
        startHour += 1;
        startMin = 0;
      }

      // Sort tasks by priority (high first, then medium, then low)
      const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const allocated: ScheduledTask[] = [];
      
      // Start from selected day
      let currentTime = new Date(selectedDate);
      
      // If selected date is today, use current time (or next 15 min if past)
      if (isSameDay(selectedDate, now)) {
        currentTime.setHours(startHour, startMin, 0, 0);
        currentTime.setSeconds(0, 0);
        currentTime.setMilliseconds(0);

        // If current time is in the past, start from next hour
        if (currentTime <= now) {
          currentTime = new Date(selectedDate);
          currentTime.setHours(startHour + 1, 0, 0, 0);
          currentTime.setSeconds(0, 0);
          currentTime.setMilliseconds(0);
        }
      } else {
        // If selected date is in the future, start from 9 AM
        currentTime.setHours(9, 0, 0, 0);
        currentTime.setSeconds(0, 0);
        currentTime.setMilliseconds(0);
      }

      console.log("[MultiTaskScheduler] Starting allocation for", sortedTasks.length, "tasks");
      console.log("[MultiTaskScheduler] Starting time:", currentTime);

      for (let i = 0; i < sortedTasks.length; i++) {
        const task = sortedTasks[i];
        const duration = getDuration(task.effort);
        const taskStart = new Date(currentTime);
        let taskEnd = addHours(taskStart, duration);

        // Check if task goes past 10 PM on the selected day
        if (taskEnd.getHours() >= 22 || (taskEnd.getHours() === 22 && taskEnd.getMinutes() > 0)) {
          // Move to next day at 9 AM
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(9, 0, 0, 0);
          taskStart.setTime(nextDay.getTime());
          taskEnd = addHours(taskStart, duration);
          currentTime = new Date(nextDay);
        } else {
          currentTime = new Date(taskEnd);
        }

        const hour = taskStart.getHours();

        allocated.push({
          task,
          startTime: new Date(taskStart),
          endTime: new Date(taskEnd),
          dayIndex: 0, // Always 0 for single day view
          hour,
          duration,
        });

        console.log(`[MultiTaskScheduler] Allocated task ${i + 1}/${sortedTasks.length}:`, {
          title: task.title,
          start: taskStart.toISOString(),
          end: taskEnd.toISOString(),
        });

        // Move to next available time slot (add buffer of 15 minutes)
        currentTime = addHours(taskEnd, 0.25);
        
        // If we go past 10 PM, move to next day at 9 AM
        if (currentTime.getHours() >= 22) {
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(9, 0, 0, 0);
          currentTime = nextDay;
        }
      }

      console.log("[MultiTaskScheduler] AI Allocated", allocated.length, "tasks:", allocated);
      setScheduledTasks(allocated);
    } catch (error) {
      console.error("[MultiTaskScheduler] Error allocating tasks:", error);
    } finally {
      setIsAllocating(false);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    setDragOverSlot({ dayIndex, hour });
  };

  const handleDrop = (dayIndex: number, hour: number) => {
    if (!draggedTask) return;

    // Check if it's a task from the list (not yet scheduled)
    const unscheduledTask = tasks.find((t) => t.id === draggedTask);
    if (unscheduledTask) {
      // Create new scheduled task
      const newStart = setHours(dayStart, hour);
      const duration = getDuration(unscheduledTask.effort);
      const newEnd = addHours(newStart, duration);

      setScheduledTasks((prev) => {
        // Remove if already exists
        const filtered = prev.filter((st) => st.task.id !== draggedTask);
        return [
          ...filtered,
          {
            task: unscheduledTask,
            startTime: newStart,
            endTime: newEnd,
            dayIndex: 0,
            hour,
            duration,
          },
        ];
      });
    } else {
      // Update existing scheduled task
      const task = scheduledTasks.find((st) => st.task.id === draggedTask);
      if (!task) return;

      const newStart = setHours(dayStart, hour);
      const newEnd = addHours(newStart, task.duration);

      setScheduledTasks((prev) =>
        prev.map((st) =>
          st.task.id === draggedTask
            ? {
                ...st,
                startTime: newStart,
                endTime: newEnd,
                dayIndex: 0,
                hour,
              }
            : st
        )
      );
    }

    setDraggedTask(null);
    setDragOverSlot(null);
  };

  const handleResize = (taskId: string, newDuration: number) => {
    setScheduledTasks((prev) =>
      prev.map((st) => {
        if (st.task.id === taskId && st.startTime) {
          return {
            ...st,
            endTime: addHours(st.startTime, newDuration),
            duration: newDuration,
          };
        }
        return st;
      })
    );
  };

  const handleSave = async () => {
    const validScheduled = scheduledTasks.filter(
      (st) => st.startTime && st.endTime
    );

    if (validScheduled.length === 0) {
      alert("Please schedule at least one task");
      return;
    }

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
      console.error("Error saving scheduled tasks:", error);
    }
  };

  const getEventsForSlot = (dayIndex: number, hour: number) => {
    if (!events || events.length === 0) return [];
    return events.filter((event) => {
      if (!event.start_ts || !event.end_ts) return false;
      try {
        const eventStart = new Date(event.start_ts);
        const eventEnd = new Date(event.end_ts);
        const slotStart = setHours(dayStart, hour);
        const slotEnd = setHours(dayStart, hour + 1);

        // Check if event is on the selected day
        return isSameDay(eventStart, selectedDate) && eventStart < slotEnd && eventEnd > slotStart;
      } catch {
        return false;
      }
    });
  };

  const getTasksForSlot = (hour: number) => {
    return scheduledTasks.filter((st) => {
      if (!st.startTime || !st.endTime) return false;
      const taskStart = new Date(st.startTime);
      const taskEnd = new Date(st.endTime);
      const slotStart = setHours(dayStart, hour);
      const slotEnd = setHours(dayStart, hour + 1);

      // Check if task is on the selected day and overlaps with this hour slot
      const isOnSelectedDay = isSameDay(taskStart, selectedDate);
      const overlapsSlot = taskStart < slotEnd && taskEnd > slotStart;
      
      return isOnSelectedDay && overlapsSlot;
    });
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
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
          className="glass-strong rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Schedule All Tasks
              </h2>
              <p className="text-gray-600">{tasks.length} tasks to schedule</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAIAllocateAll}
                disabled={isAllocating}
                className="btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className={`px-4 py-2 rounded-lg glass text-sm font-medium hover:bg-white/80 transition-colors ${
                  isSameDay(selectedDate, new Date()) ? "bg-purple-100 text-purple-700" : ""
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="ml-4 text-lg font-semibold text-gray-900">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Calendar Grid - Single Day View */}
          <div className="card-glass p-4 mb-6">
            <div className="grid grid-cols-2 gap-1">
              {/* Time column */}
              <div className="col-span-1 border-r border-gray-200">
                <div className="h-12 border-b border-gray-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">Time</span>
                </div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 flex items-start justify-end pr-3 text-xs text-gray-500 border-b border-gray-100"
                  >
                    {hour === 12
                      ? "12 PM"
                      : hour > 12
                      ? `${hour - 12} PM`
                      : `${hour} AM`}
                  </div>
                ))}
              </div>

              {/* Single Day Column */}
              <div className="col-span-1">
                <div className="h-12 flex flex-col items-center justify-center border-b border-gray-200 bg-purple-50 rounded-t-lg">
                  <div className="text-xs text-gray-500">{format(selectedDate, "EEE")}</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {format(selectedDate, "d")}
                  </div>
                </div>
                <div className="relative">
                  {hours.map((hour) => {
                    const slotEvents = getEventsForSlot(0, hour);
                    const task = getTaskForSlot(hour);
                    const isDragOver = dragOverSlot?.hour === hour;

                    return (
                      <div
                        key={hour}
                        className={`h-16 border-b border-gray-100 relative ${
                          isDragOver ? "bg-purple-100/50" : "hover:bg-purple-50/30"
                        }`}
                        onDragOver={(e) => handleDragOver(e, 0, hour)}
                        onDrop={() => handleDrop(0, hour)}
                      >
                        {task && task.startTime && task.endTime && (
                          <div
                            draggable
                            onDragStart={() => handleDragStart(task.task.id)}
                            className={`absolute left-0.5 right-0.5 rounded-md border z-10 cursor-move ${
                              task.task.priority === "high"
                                ? "bg-red-200 border-red-300 text-red-800"
                                : task.task.priority === "medium"
                                ? "bg-amber-200 border-amber-300 text-amber-800"
                                : "bg-blue-200 border-blue-300 text-blue-800"
                            } flex items-center px-2 py-1 text-xs font-medium overflow-hidden`}
                            style={{
                              top: `${Math.max(0, (task.startTime.getMinutes() / 60) * 64)}px`,
                              height: `${Math.max(16, (task.duration * 64))}px`,
                            }}
                            title={`${task.task.title} (${format(task.startTime, "h:mm a")} - ${format(task.endTime, "h:mm a")})`}
                          >
                            <span className="truncate flex-1">{task.task.title}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (task.duration > 0.5) {
                                    handleResize(task.task.id, task.duration - 0.5);
                                  }
                                }}
                                className="px-1 hover:bg-white/50 rounded"
                              >
                                -
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (task.duration < 4) {
                                    handleResize(task.task.id, task.duration + 0.5);
                                  }
                                }}
                                className="px-1 hover:bg-white/50 rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                            );
                          }
                          return null;
                        })()}
                        {slotEvents.map((event) => (
                          <div
                            key={event.id}
                            className="absolute left-0.5 right-0.5 top-0 bottom-0 bg-blue-200/50 border border-blue-300 rounded text-xs p-1 overflow-hidden"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks to Schedule</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task) => {
                const scheduled = scheduledTasks.find((st) => st.task.id === task.id);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`p-3 rounded-xl border-2 ${
                      scheduled
                        ? "bg-green-50 border-green-200"
                        : "bg-white/70 border-white/50"
                    } cursor-move`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              task.effort === "small"
                                ? "bg-green-100 text-green-700"
                                : task.effort === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {task.effort}
                          </span>
                        </div>
                      </div>
                      {scheduled && scheduled.startTime && scheduled.endTime && (
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(scheduled.startTime, "MMM d, h:mm a")} -{" "}
                          {format(scheduled.endTime, "h:mm a")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button onClick={onClose} className="btn-glass">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={scheduledTasks.filter((st) => st.startTime && st.endTime).length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save All ({scheduledTasks.filter((st) => st.startTime && st.endTime).length}/{tasks.length})
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
