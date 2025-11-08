"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreVertical, Calendar, X } from "lucide-react";
import { format, isToday, isPast, isFuture } from "date-fns";
import { useTasks, Task } from "@/lib/hooks/use-tasks";
import Link from "next/link";

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTask } = useTasks();

  const [newTask, setNewTask] = useState({
    title: "",
    notes: "",
    priority: "medium" as "low" | "medium" | "high",
    effort: "medium" as "small" | "medium" | "large",
    due_date: "",
  });

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status === "done";
    if (filter === "today") {
      if (task.status === "done") return false;
      return task.due_date && isToday(new Date(task.due_date));
    }
    if (filter === "upcoming") {
      if (task.status === "done") return false;
      return !task.due_date || !isToday(new Date(task.due_date));
    }
    return true;
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      await createTask({
        title: newTask.title,
        notes: newTask.notes || null,
        priority: newTask.priority,
        effort: newTask.effort,
        due_date: newTask.due_date || null,
        status: "open",
      });
      
      setNewTask({
        title: "",
        notes: "",
        priority: "medium",
        effort: "medium",
        due_date: "",
      });
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    
    try {
      await updateTask(selectedTask.id, updates);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await deleteTask(selectedTask.id);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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
                    f === "today" ? t.status !== 'done' && t.due_date && isToday(new Date(t.due_date)) :
                    f === "upcoming" ? t.status !== 'done' && (!t.due_date || !isToday(new Date(t.due_date))) :
                    f === "completed" ? t.status === 'done' : true
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
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
          {filteredTasks.length > 0 ? (
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
                      task.status === "done"
                        ? "bg-purple-600 border-purple-600"
                        : "border-gray-300 hover:border-purple-500"
                    }`}
                  >
                    {task.status === "done" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-white"
                      />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === "done" ? "line-through text-gray-500" : "text-gray-900"}`}>
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
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${
                          isPast(new Date(task.due_date)) && task.status !== 'done' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.due_date), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                    className="p-2 rounded-lg hover:bg-white/50"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card-glass p-8 text-center text-gray-500">
              No tasks found. Create your first task!
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setIsCreating(false)}
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
                  <h2 className="text-2xl font-semibold text-gray-900">New Task</h2>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-2 rounded-lg hover:bg-white/50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full input-glass"
                      placeholder="Task title"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      className="w-full input-glass"
                      placeholder="Add notes..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                        className="w-full input-glass"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effort
                      </label>
                      <select
                        value={newTask.effort}
                        onChange={(e) => setNewTask({ ...newTask, effort: e.target.value as any })}
                        className="w-full input-glass"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="w-full input-glass"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleCreateTask} className="btn-primary flex-1">
                      Create Task
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
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && !isCreating && (
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
                    <X className="w-5 h-5" />
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
                      onChange={(e) => handleUpdateTask({ title: e.target.value })}
                      className="w-full input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={selectedTask.notes || ""}
                      onChange={(e) => handleUpdateTask({ notes: e.target.value })}
                      className="w-full input-glass"
                      placeholder="Add notes..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        defaultValue={selectedTask.priority}
                        onChange={(e) => handleUpdateTask({ priority: e.target.value as any })}
                        className="w-full input-glass"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effort
                      </label>
                      <select
                        defaultValue={selectedTask.effort}
                        onChange={(e) => handleUpdateTask({ effort: e.target.value as any })}
                        className="w-full input-glass"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      defaultValue={selectedTask.due_date || ""}
                      onChange={(e) => handleUpdateTask({ due_date: e.target.value || null })}
                      className="w-full input-glass"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleUpdateTask({})} className="btn-primary flex-1">
                      Save
                    </button>
                    <button onClick={handleDeleteTask} className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                    <button onClick={() => setSelectedTask(null)} className="btn-glass flex-1">
                      Cancel
                    </button>
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
