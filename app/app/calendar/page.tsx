"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, CheckSquare } from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useEvents } from "@/lib/hooks/use-events";
import { Event } from "@/lib/hooks/use-events";
import EventEditModal from "@/components/app/EventEditModal";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useEffect } from "react";

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  const weekEnd = addDays(weekStart, 6);
  // Expand date range to include past events (show 2 weeks back and 2 weeks forward for history)
  const historyStart = subWeeks(weekStart, 2);
  const historyEnd = addWeeks(weekEnd, 2);
  const { events, loading, createEvent, updateEvent, deleteEvent, refetch } = useEvents(
    historyStart,
    historyEnd
  );
  
  // Fetch tasks to show in calendar (tasks with due_date or scheduled tasks)
  const { tasks } = useTasks();

  // Listen for events updated from other components
  useEffect(() => {
    const handleEventsUpdated = () => {
      console.log("[CalendarPage] Events updated, refreshing...");
      refetch();
    };
    
    window.addEventListener('eventsUpdated', handleEventsUpdated);
    return () => window.removeEventListener('eventsUpdated', handleEventsUpdated);
  }, [refetch]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "personal" as
      | "deep-work"
      | "study"
      | "health"
      | "personal"
      | "rest",
    start_ts: "",
    end_ts: "",
    notes: "",
  });

  const categoryColors = {
    "deep-work": "bg-purple-200 border-purple-300 text-purple-800",
    study: "bg-blue-200 border-blue-300 text-blue-800",
    health: "bg-green-200 border-green-300 text-green-800",
    personal: "bg-orange-200 border-orange-300 text-orange-800",
    rest: "bg-purple-100 border-purple-200 text-purple-800",
  };

  const getCurrentHour = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  };

  const handleCreateEvent = async () => {
    console.log('[CalendarPage] handleCreateEvent called with:', newEvent);
    
    if (!newEvent.title.trim()) {
      alert("Please enter an event title");
      return;
    }
    
    if (!newEvent.start_ts) {
      alert("Please select a start time");
      return;
    }
    
    if (!newEvent.end_ts) {
      alert("Please select an end time");
      return;
    }

    try {
      setIsCreatingEvent(true);
      console.log('[CalendarPage] Starting event creation...');
      
      // Convert datetime-local format to ISO string
      const startDate = new Date(newEvent.start_ts);
      const endDate = new Date(newEvent.end_ts);
      
      console.log('[CalendarPage] Parsed dates:', { startDate, endDate });
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert("Invalid date format. Please check your dates.");
        setIsCreatingEvent(false);
        return;
      }
      
      if (endDate <= startDate) {
        alert("End time must be after start time.");
        setIsCreatingEvent(false);
        return;
      }

      const eventData = {
        title: newEvent.title.trim(),
        category: newEvent.category,
        start_ts: startDate.toISOString(),
        end_ts: endDate.toISOString(),
        notes: newEvent.notes?.trim() || null,
      };
      
      console.log('[CalendarPage] Creating event with data:', eventData);

      const createdEvent = await createEvent(eventData);

      console.log('[CalendarPage] Event created successfully:', createdEvent);

      // Reset form and close modal first for better UX
      setNewEvent({
        title: "",
        category: "personal",
        start_ts: "",
        end_ts: "",
        notes: "",
      });
      setIsCreating(false);
      setIsCreatingEvent(false);
      
      // Then refetch to ensure consistency
      await refetch();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('eventsUpdated'));
      
      console.log('[CalendarPage] Event creation completed successfully');
    } catch (error: any) {
      console.error('[CalendarPage] Error creating event:', error);
      setIsCreatingEvent(false);
      
      // Show detailed error message
      let errorMessage = "Unknown error occurred";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Failed to create event: ${errorMessage}`);
    }
  };

  // Get events for a specific day and hour (including tasks converted to events)
  const getEventsForSlot = (dayIndex: number, hour: number) => {
    const day = addDays(weekStart, dayIndex);
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(day);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    const allEvents: Array<Event & { isTask?: boolean }> = [];
    
    // Add calendar events
    if (events && events.length > 0) {
      events.forEach((event) => {
        if (!event.start_ts || !event.end_ts) return;
        try {
          const eventStart = new Date(event.start_ts);
          const eventEnd = new Date(event.end_ts);
          
          if (eventStart < slotEnd && eventEnd > slotStart) {
            allEvents.push(event);
          }
        } catch (error) {
          console.error("Error parsing event date:", error);
        }
      });
    }
    
    // Add tasks with due_date as events (if they fall on this day)
    if (tasks && tasks.length > 0) {
      tasks.forEach((task) => {
        if (task.due_date && task.status !== 'done') {
          try {
            const dueDate = new Date(task.due_date);
            const taskStart = startOfDay(dueDate);
            const taskEnd = endOfDay(dueDate);
            
            // Check if task's due date overlaps with this slot
            if (taskStart < slotEnd && taskEnd > slotStart) {
              // Create a virtual event for the task
              const taskEvent: Event & { isTask?: boolean } = {
                id: `task-${task.id}`,
                title: task.title,
                category: "deep-work",
                start_ts: taskStart.toISOString(),
                end_ts: taskEnd.toISOString(),
                notes: task.notes,
                task_id: task.id,
                created_at: task.created_at,
                updated_at: task.updated_at,
                isTask: true,
              };
              allEvents.push(taskEvent);
            }
          } catch (error) {
            console.error("Error parsing task due date:", error);
          }
        }
      });
    }
    
    return allEvents;
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="flex items-center gap-2 glass rounded-full p-1">
            {(["week", "month", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  view === v
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 rounded-lg glass text-sm font-medium hover:bg-white/80"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="ml-4 text-lg font-semibold text-gray-900">
              {format(weekStart, "MMM d")} -{" "}
              {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="card-glass p-6 overflow-hidden">
        <div className="grid grid-cols-8 gap-1 min-h-0">
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
            return (
              <div key={i} className="col-span-1">
                <div
                  className={`h-12 flex flex-col items-center justify-center border-b border-gray-200 ${
                    isToday ? "bg-purple-50 rounded-t-lg" : ""
                  }`}
                >
                  <div className="text-xs text-gray-500">
                    {format(day, "EEE")}
                  </div>
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
                    const isPast =
                      day < new Date() || (isToday && hour < getCurrentHour());

                    return (
                      <div
                        key={hour}
                        className={`h-16 border-b border-gray-100 relative ${
                          isPast ? "opacity-40" : ""
                        }`}
                      >
                        {slotEvents.map((event) => {
                          if (!event.start_ts || !event.end_ts) return null;
                          try {
                            const eventStart = new Date(event.start_ts);
                            const eventEnd = new Date(event.end_ts);
                            const startHour =
                              eventStart.getHours() +
                              eventStart.getMinutes() / 60;
                            const endHour =
                              eventEnd.getHours() + eventEnd.getMinutes() / 60;
                            const duration = endHour - startHour;
                            const topOffset = startHour - hour;

                            if (topOffset < 0 || topOffset >= 1) return null;
                            
                            // Check if this is a task (not a regular event)
                            const isTask = (event as any).isTask === true;
                            const isPast = eventEnd < new Date();

                            return (
                              <div
                                key={event.id}
                                onClick={() => {
                                  if (!isTask) {
                                    setEditingEvent(event);
                                  }
                                }}
                                className={`absolute left-0.5 right-0.5 rounded-md border z-10 ${
                                  isTask 
                                    ? "bg-gray-200 border-gray-300 text-gray-800 opacity-70"
                                    : categoryColors[event.category] || categoryColors.personal
                                } ${isPast ? "opacity-50" : ""} flex items-start px-1.5 py-1 text-xs font-medium ${!isTask ? "cursor-pointer" : "cursor-default"} transition-transform hover:scale-105 overflow-hidden`}
                                style={{
                                  top: `${Math.max(0, topOffset * 64)}px`,
                                  height: `${Math.max(
                                    16,
                                    Math.min(
                                      duration,
                                      1 - Math.max(0, topOffset)
                                    ) * 64
                                  )}px`,
                                }}
                                title={isTask 
                                  ? `${event.title} (Task - Due: ${format(eventStart, "MMM d, h:mm a")})`
                                  : `${event.title} (${format(eventStart, "h:mm a")} - ${format(eventEnd, "h:mm a")}) - Click to edit`
                                }
                              >
                                <span className="truncate leading-tight flex items-center gap-1">
                                  {isTask && <CheckSquare className="w-3 h-3 flex-shrink-0" />}
                                  {event.title}
                                </span>
                              </div>
                            );
                          } catch (error) {
                            console.error("Error rendering event:", error);
                            return null;
                          }
                        })}
                        {isToday &&
                          hour <= getCurrentHour() &&
                          hour + 1 > getCurrentHour() && (
                            <div
                              className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                              style={{
                                top: `${Math.max(
                                  0,
                                  (getCurrentHour() - hour) * 64
                                )}px`,
                              }}
                            />
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreating && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setIsCreating(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-strong rounded-3xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  New Event
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 rounded-lg hover:bg-white/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full input-glass"
                    placeholder="Event title"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full input-glass"
                  >
                    <option value="personal">Personal</option>
                    <option value="deep-work">Deep Work</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                    <option value="rest">Rest</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.start_ts}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewEvent((prev) => {
                          // Auto-set end time to 1 hour after start if end is empty
                          if (value && !prev.end_ts) {
                            const startDate = new Date(value);
                            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
                            const endValue = format(endDate, "yyyy-MM-dd'T'HH:mm");
                            return { ...prev, start_ts: value, end_ts: endValue };
                          }
                          return { ...prev, start_ts: value };
                        });
                      }}
                      className="w-full input-glass"
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.end_ts}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, end_ts: e.target.value })
                      }
                      className="w-full input-glass"
                      min={newEvent.start_ts || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newEvent.notes}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, notes: e.target.value })
                    }
                    className="w-full input-glass"
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateEvent}
                    disabled={isCreatingEvent}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingEvent ? "Creating..." : "Create Event"}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setIsCreatingEvent(false);
                    }}
                    disabled={isCreatingEvent}
                    className="btn-glass flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          selectedDate={new Date(editingEvent.start_ts)}
          onEventUpdated={() => {
            refetch();
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}
