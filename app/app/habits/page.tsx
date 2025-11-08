"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreVertical } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface Habit {
  id: number;
  name: string;
  completed: boolean;
  streak: number;
  active: boolean;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, name: "Morning Meditation", completed: true, streak: 5, active: true },
    { id: 2, name: "Exercise", completed: true, streak: 3, active: true },
    { id: 3, name: "Read 30 minutes", completed: false, streak: 7, active: true },
    { id: 4, name: "No phone before bed", completed: true, streak: 2, active: true },
    { id: 5, name: "Journal", completed: true, streak: 3, active: true },
    { id: 6, name: "Drink 8 glasses water", completed: false, streak: 1, active: true },
  ]);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const score = Math.round((completedCount / totalCount) * 100);

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, completed: !h.completed, streak: h.completed ? h.streak : h.streak + 1 } : h
      )
    );
  };

  const chartData = [
    { date: "Mon", score: 67 },
    { date: "Tue", score: 83 },
    { date: "Wed", score: 50 },
    { date: "Thu", score: 100 },
    { date: "Fri", score: 83 },
    { date: "Sat", score: 67 },
    { date: "Sun", score: 75 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Daily Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass mb-8 bg-gradient-to-br from-purple-50/50 to-green-50/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-gray-900">{score}%</span>
              <span className="text-lg text-gray-600">
                {completedCount} of {totalCount} habits completed
              </span>
            </div>
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(score / 100) * 352} 352`}
                className="text-purple-600 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Habit Checklist */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Habits</h2>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>
        <div className="space-y-3">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 4 }}
              className={`card-glass flex items-center gap-4 p-4 ${
                habit.completed ? "bg-green-50/50 border-green-200/50" : ""
              }`}
            >
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
                  habit.completed
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300 hover:border-purple-500"
                }`}
              >
                {habit.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white text-lg"
                  >
                    ✓
                  </motion.div>
                )}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${habit.completed ? "text-gray-600 line-through" : "text-gray-900"}`}>
                  {habit.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {habit.streak} days 🔥
                </p>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/50">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trend Graph */}
      <div className="card-glass mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Consistency</h3>
        <div className="flex gap-2 mb-4">
          {["7 days", "30 days", "90 days"].map((period) => (
            <button
              key={period}
              className="px-3 py-1.5 rounded-lg text-sm glass hover:bg-white/80"
            >
              {period}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#8B5CF6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Calendar Grid */}
      <div className="card-glass">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day View</h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            const status = day % 3 === 0 ? "full" : day % 3 === 1 ? "partial" : "missed";
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                  status === "full"
                    ? "bg-green-500 text-white"
                    : status === "partial"
                    ? "bg-amber-400 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>All completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-200" />
            <span>Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

