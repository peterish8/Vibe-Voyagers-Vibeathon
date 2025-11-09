"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, MoreVertical, X, Flame, Check } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useHabits } from "@/lib/hooks/use-habits";
import { format, subDays, startOfDay } from "date-fns";

export default function HabitsPage() {
  const today = new Date();
  const { habits, logs, loading, createHabit, updateHabit, toggleHabitLog, getHabitCompletionForDate } = useHabits();
  const [isCreating, setIsCreating] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);

  const habitStats = getHabitCompletionForDate(today);
  const activeHabits = habits.filter(h => h.is_active);
  const inactiveHabits = habits.filter(h => !h.is_active);

  // Debug: Log habits to console
  useEffect(() => {
    console.log('[HabitsPage] Habits state:', {
      total: habits.length,
      active: activeHabits.length,
      inactive: inactiveHabits.length,
      habits: habits.map(h => ({ id: h.id, name: h.name, is_active: h.is_active })),
      loading
    });
  }, [habits, activeHabits.length, inactiveHabits.length, loading]);

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

  // Generate chart data for last 7 days (overall)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const stats = getHabitCompletionForDate(date);
    return {
      date: format(date, "EEE"),
      score: stats.percentage,
    };
  });

  // Generate individual habit chart data for last 30 days
  const getHabitChartData = (habitId: string) => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);
      return {
        date: format(date, "MMM d"),
        completed: log?.completed ? 1 : 0,
      };
    });
  };

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return;
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabitName })
      });
      
      if (!response.ok) throw new Error('Failed');
      
      setNewHabitName("");
      setIsCreating(false);
      window.location.reload();
    } catch (error) {
      setError("Failed to create habit");
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

  const handleDeleteHabit = async () => {
    if (!deleteHabitId) return;
    
    try {
      const response = await fetch(`/api/habits/${deleteHabitId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDeleteHabitId(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
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
                        className="text-white"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${completed ? "text-gray-600 line-through" : "text-gray-900"}`}>
                      {habit.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      {streak} days <Flame className="w-3.5 h-3.5 text-orange-500" />
                    </p>
                  </div>
                  <button 
                    onClick={() => setDeleteHabitId(habit.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700"
                    title="Delete habit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="card-glass p-8 text-center text-gray-500">
            No active habits. {habits.length > 0 ? "You have inactive habits below." : "Create your first one!"}
          </div>
        )}

        {/* Inactive Habits Section */}
        {inactiveHabits.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Inactive Habits</h2>
            </div>
            <div className="space-y-3">
              {inactiveHabits.map((habit) => {
                const completed = getHabitStatus(habit.id);
                const streak = getHabitStreak(habit.id);
                
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    className="card-glass flex items-center gap-4 p-4 opacity-60"
                  >
                    <div className="w-8 h-8 rounded border-2 border-gray-300 flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-500 line-through">
                        {habit.name}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                        Inactive
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await updateHabit(habit.id, { is_active: true });
                          window.location.reload();
                        } catch (error) {
                          console.error("Error reactivating habit:", error);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-medium transition-colors"
                      title="Reactivate habit"
                    >
                      Reactivate
                    </button>
                    <button 
                      onClick={() => setDeleteHabitId(habit.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700"
                      title="Delete habit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Habit Tracking Graph */}
      {activeHabits.length > 0 && (
        <div className="card-glass mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Habit Tracking</h3>
            <select 
              value={selectedHabitId || 'overall'}
              onChange={(e) => setSelectedHabitId(e.target.value === 'overall' ? null : e.target.value)}
              className="input-glass text-sm"
            >
              <option value="overall">Overall Progress (7 days)</option>
              {activeHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>{habit.name} (30 days)</option>
              ))}
            </select>
          </div>
          
          {selectedHabitId ? (
            (() => {
              const habit = activeHabits.find(h => h.id === selectedHabitId);
              if (!habit) return null;
              
              const habitData = getHabitChartData(habit.id);
              const completedCount = habitData.filter(d => d.completed === 1).length;
              const completionRate = Math.round((completedCount / 30) * 100);
              
              return (
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                    <p className="text-sm text-gray-600">
                      {completedCount} of 30 days ({completionRate}%)
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={habitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280" 
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        domain={[0, 1]}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value === 1 ? "Done" : ""}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => value === 1 ? "Completed" : "Not completed"}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()
          ) : (
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
          )}
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
                    onChange={(e) => {
                      setNewHabitName(e.target.value);
                      setError(null);
                    }}
                    className="w-full input-glass"
                    placeholder="e.g., Morning Meditation"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateHabit();
                    }}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
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

      {/* Delete Habit Modal */}
      {deleteHabitId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setDeleteHabitId(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-strong rounded-3xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Habit</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this habit permanently? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteHabitId(null)}
                    className="btn-glass flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteHabit}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    Delete
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
