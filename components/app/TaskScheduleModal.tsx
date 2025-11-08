"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, addHours, setHours, setMinutes } from "date-fns";
import { ParsedTask } from "@/lib/parse-tasks";
import { useEvents } from "@/lib/hooks/use-events";
import { createClient } from "@/lib/supabase/client";

interface TaskScheduleModalProps {
  task: ParsedTask;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (eventData: { start: Date; end: Date }) => void;
}

export default function TaskScheduleModal({
  task,
  isOpen,
  onClose,
  onSchedule,
}: TaskScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
  const { events, refetch } = useEvents(weekStart, addDays(weekStart, 6));

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

  // AI Auto-allocate timings
  const handleAIAllocate = () => {
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

    // Priority-based time allocation
    let suggestedStart: Date;
    if (task.priority === "high") {
      // High priority: Start as soon as possible (next 15 min)
      suggestedStart = setMinutes(setHours(new Date(), startHour), startMin);
    } else if (task.priority === "medium") {
      // Medium priority: Start in 1-2 hours
      suggestedStart = setMinutes(setHours(new Date(), startHour + 1), 0);
    } else {
      // Low priority: Start in 2-3 hours
      suggestedStart = setMinutes(setHours(new Date(), startHour + 2), 0);
    }

    // Ensure it's today
    if (suggestedStart < now) {
      suggestedStart = setMinutes(setHours(new Date(), startHour + 1), 0);
    }

    const duration = getDuration(task.effort);
    const suggestedEnd = addHours(suggestedStart, duration);

    setStartTime(suggestedStart);
    setEndTime(suggestedEnd);
    setSelectedDate(suggestedStart);
  };

  const handleTimeSlotClick = (dayIndex: number, hour: number) => {
    const day = addDays(weekStart, dayIndex);
    const clickedTime = setHours(day, hour);
    
    if (!startTime || (startTime && endTime)) {
      // Start new selection
      setStartTime(clickedTime);
      setEndTime(addHours(clickedTime, getDuration(task.effort)));
    } else if (startTime && !endTime) {
      // Set end time
      const startHour = startTime.getHours();
      const end = hour > startHour 
        ? setHours(day, hour + 1) 
        : addHours(clickedTime, 1);
      setEndTime(end);
    }
  };

  const handleTimeSlotMouseEnter = (dayIndex: number, hour: number) => {
    if (isDragging && startTime && !endTime) {
      const day = addDays(weekStart, dayIndex);
      const startHour = startTime.getHours();
      const end = hour >= startHour 
        ? setHours(day, hour + 1) 
        : addHours(setHours(day, hour), 1);
      setEndTime(end);
    }
  };

  const handleSchedule = async () => {
    if (!startTime || !endTime) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create event in calendar
      await supabase.from("events").insert({
        user_id: user.id,
        title: task.title,
        category: "deep-work",
        start_ts: startTime.toISOString(),
        end_ts: endTime.toISOString(),
        notes: task.description || null,
      });

      await refetch();
      await onSchedule({ start: startTime, end: endTime });
      onClose();
    } catch (error) {
      console.error("Error scheduling task:", error);
      throw error;
    }
  };

  const getEventsForSlot = (dayIndex: number, hour: number) => {
    if (!events || events.length === 0) return [];
    const day = addDays(weekStart, dayIndex);
    return events.filter((event) => {
      if (!event.start_ts || !event.end_ts) return false;
      try {
        const eventStart = new Date(event.start_ts);
        const eventEnd = new Date(event.end_ts);
        const slotStart = setHours(day, hour);
        const slotEnd = setHours(day, hour + 1);

        return eventStart < slotEnd && eventEnd > slotStart;
      } catch {
        return false;
      }
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
          className="glass-strong rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Schedule Task
              </h2>
              <p className="text-gray-600">{task.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Task Info */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-purple-50/50 border border-purple-200/50">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.priority === "high" 
                    ? "bg-red-100 text-red-700"
                    : task.priority === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {task.priority} priority
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.effort === "small"
                    ? "bg-green-100 text-green-700"
                    : task.effort === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {task.effort} effort
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
            </div>
            <button
              onClick={handleAIAllocate}
              className="btn-primary flex items-center gap-2 px-4 py-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Allocate
            </button>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(addDays(weekStart, -7))}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 rounded-lg glass text-sm font-medium hover:bg-white/80"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(addDays(weekStart, 7))}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="ml-4 text-lg font-semibold text-gray-900">
                {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
              </span>
            </div>
            {startTime && endTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {format(startTime, "MMM d, h:mm a")} - {format(endTime, "h:mm a")}
                </span>
              </div>
            )}
          </div>

          {/* Calendar Grid */}
          <div className="card-glass p-4 mb-6">
            <div className="grid grid-cols-8 gap-1">
              {/* Time column */}
              <div className="col-span-1 border-r border-gray-200">
                <div className="h-12 border-b border-gray-200"></div>
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

              {/* Days */}
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(weekStart, i);
                const isToday = isSameDay(day, new Date());
                const isSelected = startTime && isSameDay(day, startTime);

                return (
                  <div key={i} className="col-span-1">
                    <div
                      className={`h-12 flex flex-col items-center justify-center border-b border-gray-200 ${
                        isToday ? "bg-purple-50 rounded-t-lg" : ""
                      }`}
                    >
                      <div className="text-xs text-gray-500">{format(day, "EEE")}</div>
                      <div
                        className={`text-lg font-semibold ${
                          isToday ? "text-purple-600" : "text-gray-900"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="relative">
                      {hours.map((hour) => {
                        const slotEvents = getEventsForSlot(i, hour);
                        const isInRange =
                          startTime &&
                          endTime &&
                          isSameDay(day, startTime) &&
                          hour >= startTime.getHours() &&
                          hour < endTime.getHours();

                        return (
                          <div
                            key={hour}
                            className={`h-16 border-b border-gray-100 relative cursor-pointer transition-colors ${
                              isInRange
                                ? "bg-purple-100/50 border-purple-200"
                                : "hover:bg-purple-50/30"
                            }`}
                            onClick={() => handleTimeSlotClick(i, hour)}
                            onMouseEnter={() => handleTimeSlotMouseEnter(i, hour)}
                            onMouseDown={() => {
                              setIsDragging(true);
                              handleTimeSlotClick(i, hour);
                            }}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => {
                              if (isDragging) {
                                setIsDragging(false);
                              }
                            }}
                          >
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
              onClick={handleSchedule}
              disabled={!startTime || !endTime}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Task
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

