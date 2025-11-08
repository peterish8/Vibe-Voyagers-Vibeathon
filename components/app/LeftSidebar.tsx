"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Target, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app", badge: null },
  { icon: Calendar, label: "Calendar", path: "/app/calendar", badge: "3" },
  { icon: CheckSquare, label: "Tasks", path: "/app/tasks", badge: "12" },
  { icon: BookOpen, label: "Journal", path: "/app/journal", badge: null },
  { icon: Target, label: "Habits", path: "/app/habits", badge: "67%" },
  { icon: BarChart3, label: "Insights", path: "/app/insights", badge: null },
];

export default function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "short", 
      day: "numeric" 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      className="fixed left-0 top-16 bottom-0 glass border-r border-white/30 z-40 transition-all duration-300"
    >
      <div className="h-full flex flex-col p-4">
        {/* Date & Time */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 pb-6 border-b border-gray-200/50"
          >
            <div className="text-sm font-medium text-gray-700">
              {formatDate(currentTime)}
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1 animate-breathing">
              {formatTime(currentTime)}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path === "/app" && pathname === "/app");
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-white/30 text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        {!collapsed && <div className="h-px bg-gray-200/50 my-4" />}

        {/* Settings */}
        <Link href="/app/settings">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`nav-item ${pathname === "/app/settings" ? "nav-item-active" : ""}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="flex-1 text-sm font-medium">Settings</span>
            )}
          </motion.div>
        </Link>

        {/* User Profile Card */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  Alex
                </div>
                <div className="text-xs text-gray-500 truncate">
                  @alex
                </div>
              </div>
            </div>
            <button className="mt-3 w-full text-xs text-purple-600 hover:text-purple-700 text-left">
              Manage account
            </button>
          </motion.div>
        )}

        {/* Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass border border-white/30 flex items-center justify-center hover:bg-white/80 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}

