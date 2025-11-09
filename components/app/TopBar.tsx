"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Bell, User, Bot, CheckSquare, Calendar, BookOpen, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { useChatPanel } from "@/lib/contexts/ChatPanelContext";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useJournal } from "@/lib/hooks/use-journal";
import { useHabits } from "@/lib/hooks/use-habits";
import { useEvents } from "@/lib/hooks/use-events";
import { format } from "date-fns";

export default function TopBar() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const router = useRouter();
  const { displayName, authUser } = useProfile();
  const { collapsed, setCollapsed } = useChatPanel();
  


  // Debug: Log display name
  if (authUser && displayName === "there") {
    console.warn("Display name fallback used. Auth user data:", {
      email: authUser.email,
      user_metadata: authUser.user_metadata,
      raw_user_meta_data: (authUser as any).raw_user_meta_data,
    });
  }

  const initials =
    displayName.length >= 2
      ? displayName.substring(0, 2).toUpperCase()
      : displayName.substring(0, 1).toUpperCase();



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              FN
            </div>
            <span className="font-serif text-xl font-semibold text-gray-900">
              FlowNote
            </span>
          </motion.div>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

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
                  className="absolute top-full right-0 mt-2 w-48 rounded-2xl p-2 shadow-xl bg-white/95 backdrop-blur-xl border border-white/50"
                >
                  {[
                    { icon: CheckSquare, label: "Task", color: "text-blue-600" },
                    { icon: Calendar, label: "Event", color: "text-red-600" },
                    { icon: BookOpen, label: "Journal Entry", color: "text-purple-600" },
                    { icon: Target, label: "Habit", color: "text-green-600" },
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.label}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-purple-50/50 transition-colors text-left"
                        onClick={() => {
                          setQuickAddOpen(false);
                          // Handle quick add action
                        }}
                      >
                        <IconComponent className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm text-gray-700">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Agent Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={`relative p-2 rounded-full transition-all duration-200 ${
              collapsed 
                ? "hover:bg-white/50 text-gray-600" 
                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            }`}
            title={collapsed ? "Open AI Assistant" : "Close AI Assistant"}
          >
            <Bot className="w-5 h-5" />
          </motion.button>

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
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
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
                  <div className="text-center py-8 text-gray-500 text-sm flex items-center justify-center gap-2">
                    All caught up!
                    <Sparkles className="w-4 h-4 text-yellow-500" />
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
                {initials}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {displayName}
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
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-purple-50/50 transition-colors text-left text-gray-700"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/app/settings");
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <div className="h-px bg-gray-200 my-2" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-purple-50/50 transition-colors text-left text-gray-700"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/app/settings");
                    }}
                  >
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50/50 transition-colors text-left text-red-600"
                    onClick={async () => {
                      setProfileOpen(false);
                      try {
                        await signOut();
                        router.push("/");
                        router.refresh();
                      } catch (error) {
                        console.error("Error signing out:", error);
                      }
                    }}
                  >
                    <span className="text-sm">Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>


    </header>
  );
}
