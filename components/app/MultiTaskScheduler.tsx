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
  const [dragOverSlot, setDragOverSlot] = useState<{ dayIndex: number; hour: number; minutes?: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dayStart = startOfDay(selectedDate);
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 (midnight) to 23 (11 PM) - all 24 hours
  const { events, refetch } = useEvents(dayStart, addDays(dayStart, 1));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate duration based on effort
  const getDuration = (effort: "small" | "medium" | "large" | null | string): number => {
    // Physical activities (null effort) default to 1 hour
    if (effort === null || effort === undefined) {
      return 1; // 1 hour for physical activities
    }
    
    switch (effort) {
      case "small":
        return 0.5; // 30 minutes
      case "medium":
        return 1.5; // 1.5 hours
      case "large":
        return 3; // 3 hours
      default:
        console.warn(`[MultiTaskScheduler] Unknown effort level: ${effort}, defaulting to medium`);
        return 1.5; // Default to medium
    }
  };

  // Parse time preferences from task title
  const parseTimePreference = (title: string) => {
    const text = title.toLowerCase();
    
    // First, try to match times with colons like "10:30", "11:30", "10:30 am", etc.
    const timePatternWithColon = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;
    const timeMatchWithColon = text.match(timePatternWithColon);
    if (timeMatchWithColon) {
      let hour = parseInt(timeMatchWithColon[1]);
      const minutes = parseInt(timeMatchWithColon[2]);
      const ampm = timeMatchWithColon[3]?.toLowerCase();
      
      // Convert to 24-hour format
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      
      // Round minutes to nearest 15 minutes
      const roundedMinutes = Math.round(minutes / 15) * 15;
      
      if (hour >= 0 && hour <= 23) {
        return { preferredHour: hour, preferredMinutes: roundedMinutes, type: 'specific' };
      }
    }
    
    // Try to match times without colons like "7am", "5pm", "9pm", "7 am", "5 pm", etc.
    const timePatternWithoutColon = /(\d{1,2})\s*(am|pm)/i;
    const timeMatchWithoutColon = text.match(timePatternWithoutColon);
    if (timeMatchWithoutColon) {
      let hour = parseInt(timeMatchWithoutColon[1]);
      const ampm = timeMatchWithoutColon[2]?.toLowerCase();
      
      // Convert to 24-hour format
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      
      if (hour >= 0 && hour <= 23) {
        return { preferredHour: hour, preferredMinutes: 0, type: 'specific' };
      }
    }
    
    // Handle "after [activity]" patterns - check if title mentions "after swimming", "after [something]"
    const afterMatch = text.match(/after\s+(\w+)/i);
    if (afterMatch) {
      // This will be handled by sorting logic - return a marker
      return { preferredHour: null, preferredMinutes: null, type: 'after', afterActivity: afterMatch[1] };
    }
    
    // Evening/night patterns
    if (text.includes('after 8') || text.includes('8 pm') || text.includes('8pm') || 
        text.includes('evening') || text.includes('night') || text.includes('8 o\'clock')) {
      return { preferredHour: 20, preferredMinutes: 0, type: 'evening' }; // 8 PM
    }
    
    // Morning patterns (but prioritize specific times if found above)
    if (text.includes('morning') || text.includes('early') || text.includes('9 am') || text.includes('9am')) {
      return { preferredHour: 9, preferredMinutes: 0, type: 'morning' };
    }
    
    // Afternoon patterns
    if (text.includes('afternoon') || text.includes('lunch') || text.includes('2 pm') || text.includes('2pm')) {
      return { preferredHour: 14, preferredMinutes: 0, type: 'afternoon' };
    }
    
    return null;
  };

  // AI Auto-allocate ALL tasks with time and energy awareness
  const handleAIAllocateAll = () => {
    if (tasks.length === 0) {
      alert("No tasks to allocate");
      return;
    }

    setIsAllocating(true);
    
    // Clear existing scheduled tasks
    setScheduledTasks([]);
    
    // Get current time context
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    // Separate tasks with time preferences
    const tasksWithTimePrefs = tasks.map(task => ({
      ...task,
      timePreference: parseTimePreference(task.title)
    }));
    
    // Sort: time-specific tasks first (by hour), then handle "after" relationships, then by priority and effort
    const sortedTasks = [...tasksWithTimePrefs].sort((a, b) => {
      // Tasks with specific time preferences come first, sorted by hour
      const aHasTime = a.timePreference && a.timePreference.preferredHour !== null && a.timePreference.type === 'specific';
      const bHasTime = b.timePreference && b.timePreference.preferredHour !== null && b.timePreference.type === 'specific';
      
      if (aHasTime && bHasTime) {
        // Both have specific times - sort by hour
        return (a.timePreference!.preferredHour! - b.timePreference!.preferredHour!);
      }
      if (aHasTime && !bHasTime) return -1;
      if (!aHasTime && bHasTime) return 1;
      
      // Handle "after" relationships - tasks that come "after" another should be scheduled after that task
      const aIsAfter = a.timePreference && a.timePreference.type === 'after';
      const bIsAfter = b.timePreference && b.timePreference.type === 'after';
      
      if (aIsAfter && !bIsAfter) return 1; // "After" tasks come later
      if (!aIsAfter && bIsAfter) return -1;
      
      // If both are "after" tasks, try to match them to their referenced activity
      if (aIsAfter && bIsAfter) {
        // Find the task that "a" comes after
        const aAfterTask = tasksWithTimePrefs.find(t => 
          t.title.toLowerCase().includes(a.timePreference!.afterActivity!.toLowerCase())
        );
        const bAfterTask = tasksWithTimePrefs.find(t => 
          t.title.toLowerCase().includes(b.timePreference!.afterActivity!.toLowerCase())
        );
        
        if (aAfterTask && bAfterTask) {
          // Sort based on when their referenced tasks are scheduled
          const aAfterTime = aAfterTask.timePreference?.preferredHour ?? 12;
          const bAfterTime = bAfterTask.timePreference?.preferredHour ?? 12;
          return aAfterTime - bAfterTime;
        }
      }
      
      // For tasks without specific times, sort by priority and effort
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      const effortOrder = { large: 3, medium: 2, small: 1, null: 0 };
      const aEffort = a.effort || 'null';
      const bEffort = b.effort || 'null';
      return (effortOrder[bEffort as keyof typeof effortOrder] || 0) - (effortOrder[aEffort as keyof typeof effortOrder] || 0);
    });

    const allocated: ScheduledTask[] = [];
    
    // Start from current time + 30 minutes if today, otherwise 9 AM
    let currentSlotHour = isToday ? currentHour : 9;
    let currentSlotMinutes = isToday ? Math.ceil((currentMinutes + 30) / 15) * 15 : 0;
    
    // Handle minute overflow
    if (currentSlotMinutes >= 60) {
      currentSlotHour += Math.floor(currentSlotMinutes / 60);
      currentSlotMinutes = currentSlotMinutes % 60;
    }
    
    // Don't start before 8 AM or after 8 PM
    if (currentSlotHour < 8) {
      currentSlotHour = 8;
      currentSlotMinutes = 0;
    }
    if (currentSlotHour >= 20) {
      currentSlotHour = 20;
      currentSlotMinutes = 0;
    }

    sortedTasks.forEach((task) => {
      const duration = getDuration(task.effort);
      let startHour = currentSlotHour;
      let startMinutes = currentSlotMinutes;
      
      // Handle "after" relationships first
      if (task.timePreference && task.timePreference.type === 'after') {
        // Find the task this one comes after
        const afterTask = allocated.find(t => 
          t.title.toLowerCase().includes(task.timePreference!.afterActivity!.toLowerCase())
        );
        
        if (afterTask) {
          // Schedule right after the referenced task ends
          const afterEnd = new Date(afterTask.endTime);
          startHour = afterEnd.getHours();
          startMinutes = afterEnd.getMinutes();
        } else {
          // If referenced task not found yet, use current slot (will be adjusted later)
          // This shouldn't happen if sorting is correct, but fallback just in case
        }
      }
      // Use time preference if specified (and not an "after" type)
      else if (task.timePreference && task.timePreference.preferredHour !== null) {
        startHour = task.timePreference.preferredHour;
        startMinutes = task.timePreference.preferredMinutes ?? 0;
      } else {
        // Smart scheduling based on effort and current time
        if (task.effort === 'large' && startHour >= 14) {
          // Large tasks after 2 PM should be moved to next morning
          startHour = 9;
          startMinutes = 0;
        } else if (task.effort === 'small' && startHour <= 11) {
          // Small tasks in morning can be scheduled in gaps
          // Keep current slot
        }
      }
      
      // Ensure within working hours (but allow 9pm for meditation)
      if (startHour < 7) startHour = 7; // Allow 7am for jogging
      if (startHour >= 21 && !task.title.toLowerCase().includes('meditat')) {
        startHour = 20; // Don't allow after 8pm except for meditation
      }
      
      // Create start time
      const startTime = new Date(selectedDate);
      startTime.setHours(startHour, startMinutes, 0, 0);
      
      // Create end time
      const endTime = new Date(startTime);
      endTime.setTime(startTime.getTime() + (duration * 60 * 60 * 1000));
      
      // Don't let tasks run past 8 PM (except meditation which can go to 9pm)
      const isMeditation = task.title.toLowerCase().includes('meditat');
      const maxEndHour = isMeditation ? 21 : 20; // 9pm for meditation, 8pm for others
      const maxEndTime = new Date(selectedDate);
      maxEndTime.setHours(maxEndHour, 0, 0, 0);
      if (endTime > maxEndTime && !task.timePreference) {
        endTime.setTime(maxEndTime.getTime());
      }
      
      allocated.push({
        task,
        startTime,
        endTime,
        dayIndex: 0,
        hour: startHour,
        duration
      });
      
      // Advance to next slot only for non-time-specific tasks
      if (!task.timePreference) {
        const totalMinutes = (duration * 60) + 15; // 15 min buffer
        currentSlotMinutes += totalMinutes;
        
        while (currentSlotMinutes >= 60) {
          currentSlotHour += 1;
          currentSlotMinutes -= 60;
        }
        
        // Round to nearest 15 minutes
        currentSlotMinutes = Math.round(currentSlotMinutes / 15) * 15;
        
        // Skip lunch (12-1 PM)
        if (currentSlotHour === 12) {
          currentSlotHour = 13;
          currentSlotMinutes = 0;
        }
        
        // Stop scheduling after 8 PM
        if (currentSlotHour >= 20) {
          currentSlotHour = 20;
          currentSlotMinutes = 0;
        }
      }
      
      console.log(`Allocated: ${task.title} at ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
    });

    console.log("Final allocated tasks:", allocated);
    setScheduledTasks(allocated);
    setIsAllocating(false);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    
    // Calculate minutes based on mouse position within the hour slot
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotHeight = 48; // 48px per hour
    const rawMinutes = (y / slotHeight) * 60;
    
    // Handle overflow: if minutes >= 60, move to next hour
    let displayHour = hour;
    let minutes = Math.round(rawMinutes);
    
    if (minutes >= 60 && hour < 23) {
      displayHour = hour + 1;
      minutes = 0;
    } else if (minutes < 0 && hour > 0) {
      displayHour = hour - 1;
      minutes = 59;
    } else {
      minutes = Math.max(0, Math.min(59, minutes));
    }
    
    // Round to nearest 15 minutes for easier scheduling
    const roundedMinutes = Math.round(minutes / 15) * 15;
    
    setDragOverSlot({ dayIndex, hour: displayHour, minutes: roundedMinutes });
  };

  const handleDrop = (dayIndex: number, hour: number) => {
    if (!draggedTask) return;

    // Get the hour and minutes from dragOverSlot if available, otherwise use defaults
    const targetHour = dragOverSlot?.hour ?? hour;
    const minutes = dragOverSlot?.minutes ?? 0;
    
    // Ensure minutes are valid (0-59)
    const validMinutes = Math.max(0, Math.min(59, minutes));

    // Check if it's a task from the list (not yet scheduled)
    const unscheduledTask = tasks.find((t) => t.id === draggedTask);
    if (unscheduledTask) {
      // Create new scheduled task
      const newStart = setMinutes(setHours(dayStart, targetHour), validMinutes);
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
            hour: targetHour,
            duration,
          },
        ];
      });
    } else {
      // Update existing scheduled task
      const task = scheduledTasks.find((st) => st.task.id === draggedTask);
      if (!task) return;

      const newStart = setMinutes(setHours(dayStart, targetHour), validMinutes);
      const newEnd = addHours(newStart, task.duration);

      setScheduledTasks((prev) =>
        prev.map((st) =>
          st.task.id === draggedTask
            ? {
                ...st,
                startTime: newStart,
                endTime: newEnd,
                dayIndex: 0,
                hour: targetHour,
              }
            : st
        )
      );
    }

    setDraggedTask(null);
    setDragOverSlot(null);
  };

  const handleTimeSlotClick = (e: React.MouseEvent, hour: number) => {
    // Only handle clicks if there's a dragged task
    if (!draggedTask) return;
    
    // Calculate minutes based on click position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotHeight = 48; // 48px per hour
    const rawMinutes = (y / slotHeight) * 60;
    
    // Handle overflow: if minutes >= 60, move to next hour
    let targetHour = hour;
    let minutes = Math.round(rawMinutes);
    
    if (minutes >= 60 && hour < 23) {
      targetHour = hour + 1;
      minutes = 0;
    } else if (minutes < 0 && hour > 0) {
      targetHour = hour - 1;
      minutes = 59;
    } else {
      minutes = Math.max(0, Math.min(59, minutes));
    }
    
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(minutes / 15) * 15;
    
    // Use the same logic as handleDrop
    const unscheduledTask = tasks.find((t) => t.id === draggedTask);
    if (unscheduledTask) {
      const newStart = setMinutes(setHours(dayStart, targetHour), roundedMinutes);
      const duration = getDuration(unscheduledTask.effort);
      const newEnd = addHours(newStart, duration);

      setScheduledTasks((prev) => {
        const filtered = prev.filter((st) => st.task.id !== draggedTask);
        return [
          ...filtered,
          {
            task: unscheduledTask,
            startTime: newStart,
            endTime: newEnd,
            dayIndex: 0,
            hour: targetHour,
            duration,
          },
        ];
      });
      setDraggedTask(null);
    } else {
      const task = scheduledTasks.find((st) => st.task.id === draggedTask);
      if (!task) return;

      const newStart = setMinutes(setHours(dayStart, targetHour), roundedMinutes);
      const newEnd = addHours(newStart, task.duration);

      setScheduledTasks((prev) =>
        prev.map((st) =>
          st.task.id === draggedTask
            ? {
                ...st,
                startTime: newStart,
                endTime: newEnd,
                dayIndex: 0,
                hour: targetHour,
              }
            : st
        )
      );
      setDraggedTask(null);
    }
    
    setDragOverSlot(null);
  };

  const handleResize = (taskId: string, newDuration: number, keepEndTime: boolean = false) => {
    setScheduledTasks((prev) =>
      prev.map((st) => {
        if (st.task.id === taskId && st.startTime && st.endTime) {
          if (keepEndTime) {
            // Resizing from top: keep end time fixed, adjust start time
            const newStartTime = new Date(st.endTime);
            newStartTime.setTime(newStartTime.getTime() - (newDuration * 60 * 60 * 1000));
            return {
              ...st,
              startTime: newStartTime,
              duration: newDuration,
            };
          } else {
            // Resizing from bottom: keep start time fixed, adjust end time
            return {
              ...st,
              endTime: addHours(st.startTime, newDuration),
              duration: newDuration,
            };
          }
        }
        return st;
      })
    );
  };

  const handleSave = async (e?: React.MouseEvent) => {
    // Prevent any event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("[MultiTaskScheduler] handleSave called!");
    console.log("[MultiTaskScheduler] scheduledTasks:", scheduledTasks);
    
    const validScheduled = scheduledTasks.filter(
      (st) => st.startTime && st.endTime
    );

    console.log("[MultiTaskScheduler] validScheduled:", validScheduled);

    if (validScheduled.length === 0) {
      alert("Please schedule at least one task");
      return;
    }

    setIsSaving(true);
    
    try {
      console.log(`[MultiTaskScheduler] Saving ${validScheduled.length} tasks to calendar`);
      console.log(`[MultiTaskScheduler] Tasks to save:`, validScheduled.map(st => ({
        title: st.task.title,
        start: st.startTime?.toISOString(),
        end: st.endTime?.toISOString()
      })));
      
      // Call the onSave callback which should save to calendar
      console.log("[MultiTaskScheduler] Calling onSave callback...");
      await onSave(
        validScheduled.map((st) => ({
          task: st.task,
          start: st.startTime!,
          end: st.endTime!,
        }))
      );
      console.log("[MultiTaskScheduler] onSave callback completed");
      
      // Refetch events to update the calendar view in this modal
      await refetch();
      
      // Dispatch event to notify other components (like calendar page) to refresh
      window.dispatchEvent(new CustomEvent('eventsUpdated'));
      
      console.log(`[MultiTaskScheduler] Successfully saved ${validScheduled.length} tasks`);
      
      // Show success message
      alert(`Successfully saved ${validScheduled.length} task(s) to calendar!`);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("[MultiTaskScheduler] Error saving scheduled tasks:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[MultiTaskScheduler] Full error:", error);
      alert(`Failed to save tasks: ${errorMessage}`);
    } finally {
      setIsSaving(false);
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
      const slotStart = setHours(setMinutes(new Date(selectedDate), 0), hour);
      const slotEnd = setHours(setMinutes(new Date(selectedDate), 0), hour + 1);

      // Check if task overlaps with this hour slot
      const overlapsSlot = taskStart < slotEnd && taskEnd > slotStart;
      
      return overlapsSlot;
    });
  };

  // Calculate layout for overlapping tasks (stack them side by side)
  const calculateTaskLayout = (tasks: ScheduledTask[]) => {
    if (tasks.length === 0) return new Map();
    
    // Sort tasks by start time
    const sorted = [...tasks].sort((a, b) => {
      const aStart = new Date(a.startTime!).getTime();
      const bStart = new Date(b.startTime!).getTime();
      return aStart - bStart;
    });

    // Group overlapping tasks into columns
    const columns: ScheduledTask[][] = [];
    const taskLayout = new Map<string, { column: number; totalColumns: number }>();

    sorted.forEach((task) => {
      const taskStart = new Date(task.startTime!);
      const taskEnd = new Date(task.endTime!);
      
      // Find which columns this task can fit into (doesn't overlap)
      let placed = false;
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        // Check if task overlaps with any task in this column
        const overlaps = column.some((existingTask) => {
          const existingStart = new Date(existingTask.startTime!);
          const existingEnd = new Date(existingTask.endTime!);
          return taskStart < existingEnd && taskEnd > existingStart;
        });
        
        if (!overlaps) {
          // Place task in this column
          column.push(task);
          taskLayout.set(task.task.id, { column: colIndex, totalColumns: columns.length });
          placed = true;
          break;
        }
      }
      
      // If couldn't fit in any existing column, create a new one
      if (!placed) {
        columns.push([task]);
        taskLayout.set(task.task.id, { column: columns.length - 1, totalColumns: columns.length });
      }
    });

    // Update totalColumns for all tasks
    const maxColumns = columns.length;
    taskLayout.forEach((layout, taskId) => {
      layout.totalColumns = maxColumns;
    });

    return taskLayout;
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
          className="glass-strong rounded-2xl p-4 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Schedule All Tasks
              </h2>
              <p className="text-sm text-gray-600">{tasks.length} tasks to schedule • {scheduledTasks.length} scheduled</p>
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
          <div className="card-glass p-2 mb-3">
            <div className="grid grid-cols-2 gap-1">
              {/* Time column */}
              <div className="col-span-1 border-r border-gray-200">
                <div className="h-10 border-b border-gray-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700">Time</span>
                </div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 flex items-start justify-end pr-2 text-xs text-gray-500 border-b border-gray-100"
                  >
                    {hour === 0
                      ? "12 AM"
                      : hour === 12
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
                  {(() => {
                    // Calculate layout for ALL tasks in the day (once, outside the hour loop)
                    const allDayLayout = calculateTaskLayout(scheduledTasks);
                    
                    return hours.map((hour) => {
                      const slotEvents = getEventsForSlot(0, hour);
                    const tasksForSlot = getTasksForSlot(hour);
                    const isDragOver = dragOverSlot?.hour === hour;

                    return (
                      <div
                        key={hour}
                        className={`h-12 border-b border-gray-100 relative ${
                          isDragOver ? "bg-purple-100/50" : "hover:bg-purple-50/30"
                        } ${hour === 23 ? "border-b-0" : ""}`}
                        onDragOver={(e) => handleDragOver(e, 0, hour)}
                        onDrop={() => handleDrop(0, hour)}
                        onClick={(e) => handleTimeSlotClick(e, hour)}
                      >
                        {/* Show drop indicator with time */}
                        {isDragOver && dragOverSlot?.hour === hour && dragOverSlot?.minutes !== undefined && (
                          <div
                            className="absolute left-0 right-0 border-t-2 border-purple-500 z-20 pointer-events-none"
                            style={{
                              top: `${(dragOverSlot.minutes / 60) * 48}px`,
                            }}
                          >
                            <div className="absolute -top-3 left-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded">
                              {(() => {
                                // Calculate proper hour and minutes (handle overflow)
                                let displayHour = hour;
                                let displayMinutes = dragOverSlot.minutes;
                                
                                // If minutes >= 60, move to next hour
                                if (displayMinutes >= 60) {
                                  displayHour = (hour + 1) % 24;
                                  displayMinutes = 0;
                                }
                                
                                // Format for display
                                if (displayHour === 0) {
                                  return `12:${String(displayMinutes).padStart(2, "0")} AM`;
                                } else if (displayHour === 12) {
                                  return `12:${String(displayMinutes).padStart(2, "0")} PM`;
                                } else if (displayHour > 12) {
                                  return `${displayHour - 12}:${String(displayMinutes).padStart(2, "0")} PM`;
                                } else {
                                  return `${displayHour}:${String(displayMinutes).padStart(2, "0")} AM`;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                        {(() => {
                          // Get all tasks that overlap with this hour slot
                          const tasksInSlot = scheduledTasks.filter(task => {
                            if (!task.startTime || !task.endTime) return false;
                            const taskStart = new Date(task.startTime);
                            const taskEnd = new Date(task.endTime);
                            const slotStart = setHours(setMinutes(new Date(selectedDate), 0), hour);
                            const slotEnd = setHours(setMinutes(new Date(selectedDate), 0), hour + 1);
                            return taskStart < slotEnd && taskEnd > slotStart;
                          });

                          return tasksInSlot
                            .map((task) => {
                              const taskStart = new Date(task.startTime!);
                              const taskEnd = new Date(task.endTime!);
                              const minutes = taskStart.getMinutes();
                              const taskStartHour = taskStart.getHours();
                              const taskEndHour = taskEnd.getHours();
                              
                              // Calculate height, but clip to not extend past 11 PM (hour 23)
                              let heightPx = task.duration * 48; // 48px per hour
                              
                              // If task extends past 11 PM, clip it to end at 11:59 PM
                              if (taskEndHour > 23 || (taskEndHour === 0 && taskEnd.getDate() > taskStart.getDate())) {
                                const maxEndTime = new Date(taskStart);
                                maxEndTime.setHours(23, 59, 0, 0);
                                const maxDuration = (maxEndTime.getTime() - taskStart.getTime()) / (1000 * 60 * 60); // hours
                                heightPx = maxDuration * 48;
                              }

                              // Get layout info for this task (from the all-day layout calculated in outer scope)
                              const taskLayoutInfo = allDayLayout.get(task.task.id) || { column: 0, totalColumns: 1 };
                              const columnWidth = 100 / taskLayoutInfo.totalColumns;
                              const leftOffset = (taskLayoutInfo.column * columnWidth);
                              
                              // Calculate top offset within this hour slot
                              let topOffset = 0;
                              if (taskStartHour === hour) {
                                // Task starts in this hour - use minutes offset
                                topOffset = (minutes / 60) * 48;
                              } else {
                                // Task started in a previous hour - show from top of this slot
                                topOffset = 0;
                              }
                              
                              // Calculate height for this hour slot
                              let heightInSlot = 48; // Full hour by default
                              if (taskStartHour === hour && taskEndHour === hour) {
                                // Task starts and ends in this hour
                                const startMinutes = taskStart.getMinutes();
                                const endMinutes = taskEnd.getMinutes();
                                heightInSlot = ((endMinutes - startMinutes) / 60) * 48;
                              } else if (taskStartHour === hour) {
                                // Task starts in this hour but continues
                                heightInSlot = (60 - minutes) / 60 * 48;
                              } else if (taskEndHour === hour) {
                                // Task ends in this hour
                                const endMinutes = taskEnd.getMinutes();
                                heightInSlot = (endMinutes / 60) * 48;
                                topOffset = 0;
                              }
                              
                              return (
                                <div
                                  key={task.task.id}
                                  draggable
                                  onDragStart={() => handleDragStart(task.task.id)}
                                  className={`absolute rounded border-2 z-10 cursor-move group ${
                                    task.task.priority === "high"
                                      ? "bg-red-200 border-red-300 text-red-800 hover:bg-red-300"
                                      : task.task.priority === "medium"
                                      ? "bg-amber-200 border-amber-300 text-amber-800 hover:bg-amber-300"
                                      : "bg-blue-200 border-blue-300 text-blue-800 hover:bg-blue-300"
                                  } flex flex-col text-xs font-medium`}
                                  style={{
                                    top: `${topOffset}px`,
                                    height: `${Math.max(16, heightInSlot)}px`,
                                    left: `${leftOffset + 1}%`,
                                    width: `${columnWidth - 2}%`,
                                  }}
                                  title={`${task.task.title} (${format(taskStart, "h:mm a")} - ${format(taskEnd, "h:mm a")})`}
                                >
                                {/* Top resize handle */}
                                <div 
                                  className="h-1 w-full cursor-n-resize bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const startY = e.clientY;
                                    const startDuration = task.duration;
                                    
                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                      const deltaY = startY - moveEvent.clientY; // Inverted for top resize
                                      const deltaHours = deltaY / 48; // 48px per hour
                                      const newDuration = Math.max(0.25, startDuration + deltaHours);
                                      handleResize(task.task.id, newDuration, true); // true = keep end time fixed
                                    };
                                    
                                    const handleMouseUp = () => {
                                      document.removeEventListener('mousemove', handleMouseMove);
                                      document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                  }}
                                />
                                
                                {/* Task content */}
                                <div className="flex-1 px-1.5 py-0.5 flex items-center">
                                  <span className="truncate">{task.task.title}</span>
                                </div>
                                
                                {/* Bottom resize handle */}
                                <div 
                                  className="h-1 w-full cursor-s-resize bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const startY = e.clientY;
                                    const startDuration = task.duration;
                                    
                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                      const deltaY = moveEvent.clientY - startY;
                                      const deltaHours = deltaY / 48; // 48px per hour
                                      const newDuration = Math.max(0.25, startDuration + deltaHours);
                                      handleResize(task.task.id, newDuration, false); // false = keep start time fixed
                                    };
                                    
                                    const handleMouseUp = () => {
                                      document.removeEventListener('mousemove', handleMouseMove);
                                      document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                  }}
                                />
                              </div>
                            );
                          });
                        })()}
                        {slotEvents.map((event) => (
                          <div
                            key={event.id}
                            className="absolute left-0.5 right-0.5 top-0 bottom-0 bg-blue-200/50 border border-blue-300 rounded text-xs p-1 overflow-hidden cursor-pointer hover:bg-blue-300/50 transition-colors"
                            title={`${event.title} - Click to edit`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open edit modal - we'll need to pass this through props
                              window.dispatchEvent(new CustomEvent('editEvent', { detail: event }));
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    );
                  });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Tasks to Schedule</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
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
          <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="btn-glass">
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[MultiTaskScheduler] Save button clicked!");
                console.log("[MultiTaskScheduler] Button disabled state:", scheduledTasks.filter((st) => st.startTime && st.endTime).length === 0 || isSaving);
                console.log("[MultiTaskScheduler] Scheduled tasks count:", scheduledTasks.length);
                handleSave(e);
              }}
              disabled={scheduledTasks.filter((st) => st.startTime && st.endTime).length === 0 || isSaving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
