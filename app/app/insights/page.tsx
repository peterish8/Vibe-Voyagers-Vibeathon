"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function InsightsPage() {
  const taskData = [
    { day: "Mon", completed: 8, planned: 10 },
    { day: "Tue", completed: 12, planned: 12 },
    { day: "Wed", completed: 6, planned: 10 },
    { day: "Thu", completed: 15, planned: 15 },
    { day: "Fri", completed: 10, planned: 12 },
    { day: "Sat", completed: 5, planned: 8 },
    { day: "Sun", completed: 7, planned: 10 },
  ];

  const moodData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    mood: Math.floor(Math.random() * 3) + 1, // 1 = good, 2 = neutral, 3 = bad
  }));

  const energyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    productivity: Math.sin((i - 6) * Math.PI / 12) * 50 + 50,
  }));

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Weekly Letter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass mb-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">
            Week of Nov 4-10, 2025
          </h2>
          <button className="btn-glass flex items-center gap-2">
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
        <div className="prose max-w-none">
          <p className="text-lg font-serif text-gray-800 leading-relaxed mb-4">
            This week has been a strong one for you, Alex. You completed 63 tasks out of 79 planned,
            showing a solid 80% completion rate. Your consistency with morning meditation and
            exercise has been impressive—you've maintained a 5-day streak!
          </p>
          <p className="text-lg font-serif text-gray-800 leading-relaxed mb-4">
            I noticed you're most productive between 10 AM and 12 PM. Consider blocking those hours
            for your most important deep work. Your mood has been consistently positive this week,
            which correlates with your higher task completion rates.
          </p>
          <p className="text-lg font-serif text-gray-800 leading-relaxed">
            For next week, I'd suggest focusing on maintaining your morning routine and scheduling
            your most challenging tasks during your peak productivity window. Keep up the great work!
          </p>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Completion Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="planned" fill="#E5E7EB" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mood Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6B7280" domain={[0, 4]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Energy Windows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Windows</h3>
          <p className="text-sm text-gray-600 mb-4">
            You're most productive 10-12 AM
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="productivity" radius={[8, 8, 0, 0]}>
                {energyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.hour >= 10 && entry.hour <= 12
                        ? "#8B5CF6"
                        : entry.productivity > 60
                        ? "#A78BFA"
                        : "#E9D5FF"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Habit Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Impact</h3>
          <p className="text-sm text-gray-600 mb-4">
            Correlation between habit completion and task productivity
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="completed" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Saved Quotes Library */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-glass"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Quotes Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            "Progress is not about perfection, but about the courage to begin.",
            "The best time to plant a tree was 20 years ago. The second best time is now.",
            "You don't have to be great to start, but you have to start to be great.",
          ].map((quote, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl glass hover:bg-white/80 transition-colors cursor-pointer"
            >
              <p className="text-sm font-serif italic text-gray-700 mb-2">{quote}</p>
              <p className="text-xs text-gray-500">Saved Nov {idx + 5}, 2025</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

