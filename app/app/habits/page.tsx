"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreVertical, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useHabits } from "@/lib/hooks/use-habits";
import { format, subDays, startOfDay } from "date-fns";

export default function HabitsPage() {
  const today = new Date();
  const { habits, logs, loading, createHabit, updateHabit, toggleHabitLog, getHabitCompletionForDate } = useHabits();
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const habitStats = getHabitCompletionForDate(today);
  const activeHabits = habits.filter(h => h.is_active);

  // Get completion status for each habit today
  const getHabitStatus = (habitId: string) => {
    const dateStr = today.toISOString().split('T')[0];
    const log = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);
    return log?.completed || false;
  };

  // Get streak for a habit (simplified - counts consecutive completed days)
  const getHabitStreak = (habitId: string) => {
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);
      if (log?.completed) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Generate chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const stats = getHabitCompletionForDate(date);
    return {
      date: format(date, "EEE"),
      score: stats.percentage,
    };
  });

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return;
    
    try {
      await createHabit({
        name: newHabitName,
        is_active: true,
        target_days_per_week: 7,
      });
      setNewHabitName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    const currentStatus = getHabitStatus(habitId);
    try {
      await toggleHabitLog(habitId, today, !currentStatus);
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  // Don't block rendering - show content immediately with loading indicators

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
              {format(today, "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-gray-900">{habitStats.percentage}%</span>
              <span className="text-lg text-gray-600">
                {habitStats.completed} of {habitStats.total} habits completed
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
                strokeDasharray={`${(habitStats.percentage / 100) * 352} 352`}
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
          <button 
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>
        {activeHabits.length > 0 ? (
          <div className="space-y-3">
            {activeHabits.map((habit) => {
              const completed = getHabitStatus(habit.id);
              const streak = getHabitStreak(habit.id);
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  className={`card-glass flex items-center gap-4 p-4 ${
                    completed ? "bg-green-50/50 border-green-200/50" : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
                      completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-purple-500"
                    }`}
                  >
                    {completed && (
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
                    <p className={`font-medium ${completed ? "text-gray-600 line-through" : "text-gray-900"}`}>
                      {habit.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {streak} days 🔥
                    </p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-white/50">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="card-glass p-8 text-center text-gray-500">
            No habits yet. Create your first one!
          </div>
        )}
      </div>

      {/* Trend Graph */}
      {activeHabits.length > 0 && (
        <div className="card-glass mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Consistency</h3>
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
      )}

      {/* Create Habit Modal */}
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
                <h2 className="text-2xl font-semibold text-gray-900">New Habit</h2>
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
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="w-full input-glass"
                    placeholder="e.g., Morning Meditation"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateHabit();
                    }}
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={handleCreateHabit} className="btn-primary flex-1">
                    Create Habit
                  </button>
                  <button onClick={() => setIsCreating(false)} className="btn-glass flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
