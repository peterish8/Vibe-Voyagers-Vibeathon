"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Bell, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickAddOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 glass border-b border-white/20">
      <div className="h-full flex items-center justify-between px-6">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            FN
          </div>
          <span className="font-serif text-xl font-semibold text-gray-900">
            FlowNote
          </span>
        </motion.button>

        {/* Global Search */}
        <div className="flex-1 max-w-md mx-8 relative">
          <motion.div
            className="relative"
            initial={false}
            animate={{ scale: searchOpen ? 1.02 : 1 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, journals, events..."
              className="w-full pl-11 pr-20 py-2.5 rounded-full input-glass"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md bg-white/50 text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 rounded bg-white/80 border border-gray-200">
                ⌘K
              </kbd>
            </div>
          </motion.div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Add */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full btn-glass text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Quick Add</span>
            </motion.button>

            <AnimatePresence>
              {quickAddOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 glass-strong rounded-2xl p-2 shadow-xl"
                >
                  {[
                    { icon: "✓", label: "Task" },
                    { icon: "📅", label: "Event" },
                    { icon: "📝", label: "Journal Entry" },
                    { icon: "🎯", label: "Habit" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-purple-50/50 transition-colors text-left"
                      onClick={() => {
                        setQuickAddOpen(false);
                        // Handle quick add action
                      }}
                    >
                      <span>{item.icon}</span>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </motion.button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-80 glass-strong rounded-2xl p-4 shadow-xl max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => {
                        setHasUnread(false);
                        setNotificationsOpen(false);
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="text-center py-8 text-gray-500 text-sm">
                    All caught up! 🎉
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                Alex
              </span>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-56 glass-strong rounded-2xl p-2 shadow-xl"
                >
                  {[
                    { icon: User, label: "Profile" },
                    { icon: null, label: "Settings", divider: true },
                    { icon: null, label: "Privacy" },
                    { icon: null, label: "Log Out", danger: true },
                  ].map((item, idx) => (
                    <div key={idx}>
                      {item.divider && (
                        <div className="h-px bg-gray-200 my-2" />
                      )}
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-purple-50/50 transition-colors text-left ${
                          item.danger ? "text-red-600 hover:bg-red-50/50" : "text-gray-700"
                        }`}
                        onClick={() => {
                          setProfileOpen(false);
                          // Handle action
                        }}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}

