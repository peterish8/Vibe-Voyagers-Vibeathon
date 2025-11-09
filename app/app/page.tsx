"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { format, isToday, subDays } from "date-fns";
import { Flame } from "lucide-react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useHabits } from "@/lib/hooks/use-habits";
import { useProfile } from "@/lib/hooks/use-profile";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";

// Get time-based greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const today = new Date();
  const greeting = getGreeting();
  const {
    displayName,
    loading: profileLoading,
    profile,
    authUser,
  } = useProfile();
  const { tasks, loading: tasksLoading } = useTasks();
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

  // Get habit stats
  const habitStats =
    habitsLoading || !habits || !logs
      ? { percentage: 0, completed: 0, total: 0 }
      : getHabitCompletionForDate(today);

  // Get journal streak (simplified - would need journal hook)
  const journalStreak = 0; // TODO: Implement journal streak calculation

  // Generate chart data for last 7 days (overall consistency)
  const getChartData = () => {
    if (!habits || !logs) {
      // Return dummy data if habits/logs not loaded
      return Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return {
          date: format(date, "EEE"),
          score: 0,
        };
      });
    }

    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = date.toISOString().split("T")[0];
      const activeHabits = habits.filter((h) => h.is_active);
      const completedLogs = logs.filter(
        (l) => l.log_date === dateStr && l.completed
      );

      const percentage =
        activeHabits.length > 0
          ? Math.round((completedLogs.length / activeHabits.length) * 100)
          : 0;

      return {
        date: format(date, "EEE"),
        score: percentage,
      };
    });
  };

  const chartData = getChartData();

  // Get user's name with multiple fallbacks
  const getUserName = () => {
    if (profileLoading) return "...";

    // Try displayName first (from profile hook)
    if (displayName && displayName !== "there" && displayName !== "...") {
      return displayName;
    }

    // Try auth user metadata
    if (authUser?.user_metadata?.full_name) {
      return authUser.user_metadata.full_name.split(" ")[0]; // First name only
    }
    if (authUser?.user_metadata?.name) {
      return authUser.user_metadata.name.split(" ")[0]; // First name only
    }

    // Try email username
    if (authUser?.email) {
      return authUser.email.split("@")[0];
    }

    return "there";
  };

  const nickname = getUserName();

  // Debug logging
  useEffect(() => {
    console.log("[Dashboard] Profile state:", {
      profileLoading,
      displayName,
      hasProfile: !!profile,
      hasAuthUser: !!authUser,
      profileNickname: profile?.nickname,
    });
    console.log("[Dashboard] Tasks state:", {
      tasksLoading,
      tasksCount: tasks?.length || 0,
      topTasksCount: topTasks.length,
      tasks: tasks?.slice(0, 3),
    });
    console.log("[Dashboard] Habits state:", {
      habitsLoading,
      habitsCount: habits?.length || 0,
      logsCount: logs?.length || 0,
      habitStats,
      chartData,
    });
  }, [
    profileLoading,
    displayName,
    profile,
    authUser,
    tasksLoading,
    tasks,
    topTasks,
    habitsLoading,
    habits,
    logs,
    habitStats,
    chartData,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2 flex items-center gap-2">
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
        <div className="py-3">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Daily Quote
          </h2>
          <p className="text-base font-serif text-gray-800 italic">
            &quot;Progress is not about perfection, but about the courage to
            begin.&quot;
          </p>
        </div>
      </motion.div>

      {/* Grid Layout - 2 columns instead of 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1 - Today's Focus */}
        <div className="space-y-8">
          {/* Top 3 Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-glass min-h-[400px]"
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

        {/* Column 2 - Quick Stats */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glass min-h-[400px]"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h2>
            <div className="space-y-6">
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

              {/* 7-Day Consistency Chart */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  7-Day Consistency
                </h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorScore"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/app/tasks"
                    className="p-3 rounded-lg glass hover:bg-white/80 transition-colors text-center"
                  >
                    <div className="text-lg mb-1">📝</div>
                    <div className="text-xs font-medium text-gray-700">
                      Add Task
                    </div>
                  </Link>
                  <Link
                    href="/app/habits"
                    className="p-3 rounded-lg glass hover:bg-white/80 transition-colors text-center"
                  >
                    <div className="text-lg mb-1">🎯</div>
                    <div className="text-xs font-medium text-gray-700">
                      Track Habit
                    </div>
                  </Link>
                  <Link
                    href="/app/calendar"
                    className="p-3 rounded-lg glass hover:bg-white/80 transition-colors text-center"
                  >
                    <div className="text-lg mb-1">📅</div>
                    <div className="text-xs font-medium text-gray-700">
                      Schedule
                    </div>
                  </Link>
                  <Link
                    href="/app/journal"
                    className="p-3 rounded-lg glass hover:bg-white/80 transition-colors text-center"
                  >
                    <div className="text-lg mb-1">📖</div>
                    <div className="text-xs font-medium text-gray-700">
                      Journal
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
