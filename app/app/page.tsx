"use client";

import { motion } from "framer-motion";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useEvents } from "@/lib/hooks/use-events";
import { useHabits } from "@/lib/hooks/use-habits";
import { useProfile } from "@/lib/hooks/use-profile";
import Link from "next/link";

export default function Dashboard() {
  const today = new Date();
  const greeting = getGreeting();
  const { displayName } = useProfile();
  const { tasks, loading: tasksLoading } = useTasks();
  const { events, loading: eventsLoading } = useEvents(
    startOfDay(today),
    endOfDay(today)
  );
  const {
    habits,
    logs,
    getHabitCompletionForDate,
    loading: habitsLoading,
  } = useHabits();

  // Get top 3 tasks (not completed, sorted by priority and due date)
  const topTasks =
    tasksLoading || !tasks
      ? []
      : tasks
          .filter((t) => t.status !== "done")
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff =
              priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            if (a.due_date && b.due_date) {
              return (
                new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
              );
            }
            if (a.due_date) return -1;
            if (b.due_date) return 1;
            return 0;
          })
          .slice(0, 3);

  // Get today's events
  const todayEvents =
    eventsLoading || !events
      ? []
      : events.filter((e) => {
          const eventDate = new Date(e.start_ts);
          return isToday(eventDate);
        });

  // Get habit stats
  const habitStats =
    habitsLoading || !habits || !logs
      ? { percentage: 0, completed: 0, total: 0 }
      : getHabitCompletionForDate(today);

  // Get journal streak (simplified - would need journal hook)
  const journalStreak = 0; // TODO: Implement journal streak calculation

  const nickname = displayName || "there";

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
          {greeting}, {nickname} 👋
        </h1>
        <p className="text-gray-600 mb-4">
          Today is {format(today, "EEEE, MMMM d, yyyy")}
        </p>
        <p className="text-purple-600 italic text-sm">
          Your focus peaks mid-morning. Consider blocking 10-12 AM for deep
          work.
        </p>
      </motion.div>

      {/* Daily Quote - Horizontally longer, vertically smaller */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-glass bg-gradient-to-br from-purple-50/50 to-blue-50/50 mb-8"
      >
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Daily Quote
            </h2>
            <p className="text-base font-serif text-gray-800 italic">
              &quot;Progress is not about perfection, but about the courage to
              begin.&quot;
            </p>
          </div>
          <button className="btn-glass text-sm whitespace-nowrap">
            Save to Library
          </button>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 - Today's Focus */}
        <div className="space-y-8">
          {/* Top 3 Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-glass"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today&apos;s Top 3
            </h2>
                    {topTasks.length > 0 ? (
              <div className="space-y-3">
                {topTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.status === "done"
                          ? "bg-purple-600 border-purple-600"
                          : "border-gray-300"
                      }`}
                    >
                      {task.status === "done" && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {task.title}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No tasks yet. Create your first one!
              </p>
            )}
            <Link
              href="/app/tasks"
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium block"
            >
              View all tasks →
            </Link>
          </motion.div>

        </div>

        {/* Column 2 - Schedule */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glass"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today&apos;s Schedule
            </h2>
                    {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.slice(0, 4).map((event) => {
                  const startTime = new Date(event.start_ts);
                  const endTime = new Date(event.end_ts);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-16 text-gray-500">
                        <span suppressHydrationWarning>{format(startTime, "h:mm a")}</span>
                      </div>
                      <div
                        className={`flex-1 h-12 rounded-lg border flex items-center px-3 ${
                          event.category === "deep-work"
                            ? "bg-purple-100/50 border-purple-200/50"
                            : event.category === "study"
                            ? "bg-blue-100/50 border-blue-200/50"
                            : event.category === "health"
                            ? "bg-green-100/50 border-green-200/50"
                            : "bg-gray-100/50 border-gray-200/50"
                        }`}
                      >
                        <span className="text-gray-700">{event.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No events scheduled for today.
              </p>
            )}
            <Link
              href="/app/calendar"
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium block"
            >
              View full calendar →
            </Link>
          </motion.div>
        </div>

        {/* Column 3 - Quick Stats */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-glass"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Habit Score</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {habitStats.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${habitStats.percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="text-lg font-semibold text-gray-900">
                  {tasksLoading || !tasks
                    ? "0/0"
                    : `${
                        tasks.filter(
                          (t) =>
                            t.status === "done" &&
                            t.completed_at &&
                            isToday(new Date(t.completed_at))
                        ).length
                      }/${
                        tasks.filter(
                          (t) => t.due_date && isToday(new Date(t.due_date))
                        ).length || tasks.length
                      }`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Journal Streak</span>
                <span className="text-lg font-semibold text-gray-900">
                  {journalStreak} days 🔥
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
