"use client";

import { motion } from "framer-motion";
import { CheckSquare, Calendar, BookOpen, Mic, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const today = new Date();
  const greeting = getGreeting();
  const topTasks = [
    { id: 1, title: "Finish quarterly report", priority: "high", completed: false },
    { id: 2, title: "Team standup meeting", priority: "medium", completed: false },
    { id: 3, title: "Review design mockups", priority: "low", completed: false },
  ];

  const quickActions = [
    { icon: Calendar, label: "Plan My Day", gradient: "from-purple-500 to-purple-600" },
    { icon: BookOpen, label: "Log Quick Note", gradient: "from-white to-white" },
    { icon: Mic, label: "Voice Reflect", gradient: "from-blue-500 to-blue-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Greeting Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass mb-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50"
      >
        <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
          {greeting}, Alex 👋
        </h1>
        <p className="text-gray-600 mb-4">
          Today is {format(today, "EEEE, MMMM d, yyyy")}
        </p>
        <p className="text-purple-600 italic text-sm">
          Your focus peaks mid-morning. Consider blocking 10-12 AM for deep work.
        </p>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 - Today's Focus */}
        <div className="space-y-6">
          {/* Top 3 Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-glass"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Top 3
            </h2>
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
                  <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center">
                    {task.completed && (
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high" ? "bg-red-100 text-red-700" :
                      task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View all tasks →
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-glass"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Habit Score</span>
                  <span className="text-2xl font-bold text-purple-600">67%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: "67%" }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="text-lg font-semibold text-gray-900">4/7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Journal Streak</span>
                <span className="text-lg font-semibold text-gray-900">3 days 🔥</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Column 2 - Schedule */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glass"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Schedule
            </h2>
            <div className="space-y-2">
              {[8, 10, 14, 16].map((hour) => (
                <div key={hour} className="flex items-center gap-3 text-sm">
                  <div className="w-16 text-gray-500">{hour}:00</div>
                  <div className="flex-1 h-12 rounded-lg bg-purple-100/50 border border-purple-200/50 flex items-center px-3">
                    <span className="text-gray-700">Event at {hour}:00</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View full calendar →
            </button>
          </motion.div>
        </div>

        {/* Column 3 - Inspiration */}
        <div className="space-y-6">
          {/* Daily Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-glass bg-gradient-to-br from-purple-50/50 to-blue-50/50"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Quote
            </h2>
            <p className="text-lg font-serif text-center text-gray-800 mb-4 italic">
              "Progress is not about perfection, but about the courage to begin."
            </p>
            <button className="w-full btn-glass text-sm">
              Save to Library
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl ${
                    action.gradient.includes("white")
                      ? "btn-glass"
                      : `bg-gradient-to-r ${action.gradient} text-white shadow-lg`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </motion.button>
              );
            })}
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

