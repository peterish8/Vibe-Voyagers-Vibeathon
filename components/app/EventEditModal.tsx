"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Clock } from "lucide-react";
import { format, addDays, isSameDay, addHours, setHours, setMinutes, startOfDay } from "date-fns";
import { Event, useEvents } from "@/lib/hooks/use-events";
import { createClient } from "@/lib/supabase/client";

interface EventEditModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onEventUpdated?: () => void;
}

export default function EventEditModal({
  event,
  isOpen,
  onClose,
  selectedDate,
  onEventUpdated,
}: EventEditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ dayIndex: number; hour: number; minutes?: number } | null>(null);
  
  const dayStart = startOfDay(selectedDate);
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 (midnight) to 23 (11 PM)
  const { events, refetch } = useEvents(dayStart, addDays(dayStart, 1));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (event) {
      setEditedEvent(event);
      setStartTime(new Date(event.start_ts));
      setEndTime(new Date(event.end_ts));
    }
  }, [event]);

  const handleDragOver = (e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotHeight = 48;
    const rawMinutes = (y / slotHeight) * 60;
    
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
    
    const roundedMinutes = Math.round(minutes / 15) * 15;
    setDragOverSlot({ dayIndex, hour: displayHour, minutes: roundedMinutes });
  };

  const handleTimeSlotClick = (e: React.MouseEvent, hour: number) => {
    if (!startTime || !endTime) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotHeight = 48;
    const rawMinutes = (y / slotHeight) * 60;
    
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
    
    const roundedMinutes = Math.round(minutes / 15) * 15;
    
    const newStart = setMinutes(setHours(dayStart, targetHour), roundedMinutes);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const newEnd = addHours(newStart, duration);
    
    setStartTime(newStart);
    setEndTime(newEnd);
    setDragOverSlot(null);
  };

  const handleSave = async () => {
    if (!editedEvent || !startTime || !endTime) return;

    try {
      const supabase = createClient();
      await supabase
        .from("events")
        .update({
          title: editedEvent.title,
          category: editedEvent.category,
          start_ts: startTime.toISOString(),
          end_ts: endTime.toISOString(),
          notes: editedEvent.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editedEvent.id);

      await refetch();
      onEventUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
    }
  };

  const handleDelete = async () => {
    if (!editedEvent) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const supabase = createClient();
      await supabase.from("events").delete().eq("id", editedEvent.id);
      await refetch();
      onEventUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const getEventsForSlot = (dayIndex: number, hour: number) => {
    if (!events || events.length === 0) return [];
    return events.filter((ev) => {
      if (!ev.start_ts || !ev.end_ts || ev.id === editedEvent?.id) return false;
      try {
        const eventStart = new Date(ev.start_ts);
        const eventEnd = new Date(ev.end_ts);
        const slotStart = setHours(dayStart, hour);
        const slotEnd = setHours(dayStart, hour + 1);
        return isSameDay(eventStart, selectedDate) && eventStart < slotEnd && eventEnd > slotStart;
      } catch {
        return false;
      }
    });
  };

  if (!isOpen || !mounted || !editedEvent || !startTime || !endTime) return null;

  const eventStartHour = startTime.getHours();
  const eventStartMinutes = startTime.getMinutes();
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const heightPx = duration * 48;

  const categoryColors = {
    "deep-work": "bg-purple-200 border-purple-300 text-purple-800",
    study: "bg-blue-200 border-blue-300 text-blue-800",
    health: "bg-green-200 border-green-300 text-green-800",
    personal: "bg-orange-200 border-orange-300 text-orange-800",
    rest: "bg-purple-100 border-purple-200 text-purple-800",
  };

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
                Edit Event
              </h2>
              <p className="text-sm text-gray-600">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                title="Delete Event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editedEvent.title}
                onChange={(e) =>
                  setEditedEvent({ ...editedEvent, title: e.target.value })
                }
                className="w-full input-glass"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editedEvent.category}
                onChange={(e) =>
                  setEditedEvent({
                    ...editedEvent,
                    category: e.target.value as Event["category"],
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={2}
                value={editedEvent.notes || ""}
                onChange={(e) =>
                  setEditedEvent({ ...editedEvent, notes: e.target.value })
                }
                className="w-full input-glass"
                placeholder="Optional notes..."
              />
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
                  {hours.map((hour) => {
                    const slotEvents = getEventsForSlot(0, hour);
                    const isDragOver = dragOverSlot?.hour === hour;

                    return (
                      <div
                        key={hour}
                        className={`h-12 border-b border-gray-100 relative ${
                          isDragOver ? "bg-purple-100/50" : "hover:bg-purple-50/30"
                        } ${hour === 23 ? "border-b-0" : ""}`}
                        onDragOver={(e) => handleDragOver(e, 0, hour)}
                        onClick={(e) => handleTimeSlotClick(e, hour)}
                      >
                        {/* Show drop indicator */}
                        {isDragOver && dragOverSlot?.hour === hour && dragOverSlot?.minutes !== undefined && (
                          <div
                            className="absolute left-0 right-0 border-t-2 border-purple-500 z-20 pointer-events-none"
                            style={{
                              top: `${(dragOverSlot.minutes / 60) * 48}px`,
                            }}
                          >
                            <div className="absolute -top-3 left-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded">
                              {dragOverSlot.hour === 0
                                ? `12:${String(dragOverSlot.minutes).padStart(2, "0")} AM`
                                : dragOverSlot.hour === 12
                                ? `12:${String(dragOverSlot.minutes).padStart(2, "0")} PM`
                                : dragOverSlot.hour > 12
                                ? `${dragOverSlot.hour - 12}:${String(dragOverSlot.minutes).padStart(2, "0")} PM`
                                : `${dragOverSlot.hour}:${String(dragOverSlot.minutes).padStart(2, "0")} AM`}
                            </div>
                          </div>
                        )}
                        
                        {/* Current event being edited */}
                        {eventStartHour === hour && (
                          <div
                            draggable
                            onDragStart={() => setDraggedTask("event")}
                            className={`absolute left-1 right-1 rounded border-2 z-10 cursor-move group ${
                              categoryColors[editedEvent.category] || categoryColors.personal
                            } flex flex-col text-xs font-medium`}
                            style={{
                              top: `${(eventStartMinutes / 60) * 48}px`,
                              height: `${Math.max(24, Math.min(heightPx, (24 - eventStartHour) * 48 - (eventStartMinutes / 60) * 48))}px`,
                            }}
                            title={`${editedEvent.title} (${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")})`}
                          >
                            {/* Top resize handle */}
                            <div 
                              className="h-1 w-full cursor-n-resize bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const startY = e.clientY;
                                const startDuration = duration;
                                
                                const handleMouseMove = (moveEvent: MouseEvent) => {
                                  const deltaY = startY - moveEvent.clientY;
                                  const deltaHours = deltaY / 48;
                                  const newDuration = Math.max(0.25, startDuration + deltaHours);
                                  const newStartTime = new Date(endTime);
                                  newStartTime.setTime(newStartTime.getTime() - (newDuration * 60 * 60 * 1000));
                                  setStartTime(newStartTime);
                                };
                                
                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };
                                
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            />
                            
                            <div className="flex-1 px-1.5 py-0.5 flex items-center">
                              <span className="truncate">{editedEvent.title}</span>
                            </div>
                            
                            {/* Bottom resize handle */}
                            <div 
                              className="h-1 w-full cursor-s-resize bg-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const startY = e.clientY;
                                const startDuration = duration;
                                
                                const handleMouseMove = (moveEvent: MouseEvent) => {
                                  const deltaY = moveEvent.clientY - startY;
                                  const deltaHours = deltaY / 48;
                                  const newDuration = Math.max(0.25, startDuration + deltaHours);
                                  const newEndTime = addHours(startTime, newDuration);
                                  setEndTime(newEndTime);
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
                        )}
                        
                        {/* Other events */}
                        {slotEvents.map((ev) => {
                          const evStart = new Date(ev.start_ts);
                          const evEnd = new Date(ev.end_ts);
                          const evMinutes = evStart.getMinutes();
                          const evDuration = (evEnd.getTime() - evStart.getTime()) / (1000 * 60 * 60);
                          const evHeightPx = evDuration * 48;

                          return (
                            <div
                              key={ev.id}
                              className={`absolute left-1 right-1 rounded border z-10 ${
                                categoryColors[ev.category] || categoryColors.personal
                              } flex items-center px-1.5 py-1 text-xs font-medium opacity-50`}
                              style={{
                                top: `${(evMinutes / 60) * 48}px`,
                                height: `${Math.max(16, evHeightPx)}px`,
                              }}
                              title={`${ev.title} (${format(evStart, "h:mm a")} - ${format(evEnd, "h:mm a")})`}
                            >
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </span>
              <span className="text-gray-500">
                ({duration.toFixed(1)} hours)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="btn-glass">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

