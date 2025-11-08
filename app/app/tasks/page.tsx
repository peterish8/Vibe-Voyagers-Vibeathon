"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreVertical, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: Date;
  tags: string[];
  effort: "small" | "medium" | "large";
}

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Finish quarterly report",
      completed: false,
      priority: "high",
      dueDate: new Date(),
      tags: ["work", "urgent"],
      effort: "large",
    },
    {
      id: 2,
      title: "Team standup meeting",
      completed: false,
      priority: "medium",
      tags: ["meeting"],
      effort: "small",
    },
    {
      id: 3,
      title: "Review design mockups",
      completed: true,
      priority: "low",
      tags: ["design"],
      effort: "medium",
    },
  ]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "today") return !task.completed && task.dueDate && isToday(task.dueDate);
    if (filter === "upcoming") return !task.completed && (!task.dueDate || !isToday(task.dueDate));
    return true;
  });

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {(["all", "today", "upcoming", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                  : "glass hover:bg-white/80 text-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/30 text-xs">
                  {tasks.filter((t) => 
                    f === "today" ? !t.completed && t.dueDate && isToday(t.dueDate) :
                    f === "upcoming" ? !t.completed && (!t.dueDate || !isToday(t.dueDate)) :
                    f === "completed" ? t.completed : true
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {filter === "today" ? "Today" : filter === "upcoming" ? "Upcoming" : filter === "completed" ? "Completed" : "All Tasks"}
          </h2>
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 4 }}
                className="card-glass flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? "bg-purple-600 border-purple-600"
                      : "border-gray-300 hover:border-purple-500"
                  }`}
                >
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-white"
                    />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(task.dueDate, "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu
                  }}
                  className="p-2 rounded-lg hover:bg-white/50"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-strong rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Task Details</h2>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-2 rounded-lg hover:bg-white/50"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedTask.title}
                      className="w-full input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      className="w-full input-glass"
                      placeholder="Add notes..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select className="w-full input-glass">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effort
                      </label>
                      <select className="w-full input-glass">
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="btn-primary flex-1">Save</button>
                    <button className="btn-glass flex-1">Cancel</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

