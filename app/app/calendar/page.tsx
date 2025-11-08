"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  const events = [
    { id: 1, title: "Deep Work", start: 9, end: 11, day: 0, category: "deep-work" },
    { id: 2, title: "Team Meeting", start: 14, end: 15, day: 0, category: "study" },
    { id: 3, title: "Gym", start: 18, end: 19, day: 2, category: "health" },
  ];

  const categoryColors = {
    "deep-work": "bg-purple-200 border-purple-300 text-purple-800",
    "study": "bg-blue-200 border-blue-300 text-blue-800",
    "health": "bg-green-200 border-green-300 text-green-800",
    "personal": "bg-orange-200 border-orange-300 text-orange-800",
    "rest": "bg-purple-100 border-purple-200 text-purple-800",
  };

  const getCurrentHour = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
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
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="card-glass p-6">
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="col-span-1">
            <div className="h-12"></div>
            {hours.map((hour) => (
              <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-gray-500">
                {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Days */}
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className="col-span-1">
                <div className={`h-12 flex flex-col items-center justify-center border-b border-gray-200 ${
                  isToday ? "bg-purple-50 rounded-t-lg" : ""
                }`}>
                  <div className="text-xs text-gray-500">{format(day, "EEE")}</div>
                  <div className={`text-lg font-semibold ${isToday ? "text-purple-600" : "text-gray-900"}`}>
                    {format(day, "d")}
                  </div>
                </div>
                <div className="relative">
                  {hours.map((hour) => {
                    const slotEvents = events.filter(
                      (e) => e.day === i && e.start <= hour && e.end > hour
                    );
                    const isPast = day < new Date() || (isToday && hour < getCurrentHour());
                    
                    return (
                      <div
                        key={hour}
                        className={`h-16 border-b border-gray-100 relative ${
                          isPast ? "opacity-40" : ""
                        }`}
                      >
                        {slotEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            className={`absolute left-1 right-1 top-0 bottom-0 rounded-lg border ${
                              categoryColors[event.category as keyof typeof categoryColors]
                            } flex items-center px-2 text-xs font-medium cursor-pointer`}
                            style={{
                              height: `${((event.end - event.start) / 1) * 100}%`,
                            }}
                          >
                            {event.title}
                          </motion.div>
                        ))}
                        {isToday && hour <= getCurrentHour() && hour + 1 > getCurrentHour() && (
                          <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-500 animate-pulse" />
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
    </div>
  );
}

