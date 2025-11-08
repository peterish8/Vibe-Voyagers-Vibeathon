"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Info, Trash2 } from "lucide-react";
import { useProfile } from "@/lib/hooks/use-profile";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

type SettingsSection =
  | "profile"
  | "preferences"
  | "privacy"
  | "notifications"
  | "billing"
  | "about";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const { profile, loading, error, updateProfile, refetch } = useProfile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    nickname: "",
    persona_text: "",
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || "",
        persona_text: profile.persona_text || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!formData.nickname.trim()) {
      setSaveMessage({
        type: "error",
        text: "Nickname cannot be empty",
      });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      await updateProfile(formData);
      // Refetch to ensure UI updates immediately
      await refetch();
      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const sections = [
    { id: "profile" as const, icon: User, label: "Profile" },
    { id: "preferences" as const, icon: null, label: "Preferences" },
    { id: "privacy" as const, icon: Shield, label: "Privacy & Data" },
    { id: "notifications" as const, icon: Bell, label: "Notifications" },
    { id: "billing" as const, icon: CreditCard, label: "Billing" },
    { id: "about" as const, icon: Info, label: "About" },
  ];

  // Show loading only on initial load, not when profile is null
  if (loading && !profile && !error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  // Show error if there's one
  if (error && !profile) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="card-glass p-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Error Loading Settings
          </h2>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <button onClick={() => refetch()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="flex gap-8">
        {/* Left Navigation */}
        <div className="w-[30%]">
          <div className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full nav-item ${
                    activeSection === section.id ? "nav-item-active" : ""
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          {activeSection === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Profile
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.nickname?.[0]?.toUpperCase() || "U"}
                  </div>
                  <button className="btn-glass">Upload Photo</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                    className="w-full input-glass"
                    placeholder="Your nickname"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who I want to become
                  </label>
                  <textarea
                    value={formData.persona_text}
                    onChange={(e) =>
                      setFormData({ ...formData, persona_text: e.target.value })
                    }
                    rows={4}
                    className="w-full input-glass"
                    placeholder="Describe your goals and aspirations..."
                  />
                </div>
                <div className="space-y-3">
                  {saveMessage && (
                    <div
                      className={`px-4 py-3 rounded-xl ${
                        saveMessage.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {saveMessage.text}
                    </div>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "preferences" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    {["Light", "Dark", "Auto"].map((theme) => (
                      <button
                        key={theme}
                        className="px-4 py-2 rounded-xl glass hover:bg-white/80"
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First day of week
                  </label>
                  <select className="w-full input-glass">
                    <option>Sunday</option>
                    <option>Monday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time format
                  </label>
                  <div className="flex gap-2">
                    {["12h", "24h"].map((format) => (
                      <button
                        key={format}
                        className="px-4 py-2 rounded-xl glass hover:bg-white/80"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "privacy" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Privacy & Data
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Audio files are stored locally on your device. Only text
                    summaries are synced to the cloud.
                  </p>
                  <div className="flex gap-3">
                    <button className="btn-glass">Export by Month</button>
                    <button className="btn-glass">Import Audio</button>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Permanently delete all your data. This action cannot be
                    undone.
                  </p>
                  <button className="px-4 py-2 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete All Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Notifications
              </h2>
              <div className="space-y-6">
                {[
                  {
                    label: "Daily summary",
                    desc: "Get a summary of your day each evening",
                  },
                  {
                    label: "Weekly insights",
                    desc: "Receive your weekly letter every Monday",
                  },
                  {
                    label: "Task reminders",
                    desc: "Reminders for upcoming tasks",
                  },
                  {
                    label: "Habit check-ins",
                    desc: "Gentle reminders to log your habits",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {item.label}
                      </label>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-purple-600 relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === "billing" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Billing
              </h2>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Free Plan
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You&apos;re currently on the free plan with basic features.
                  </p>
                  <button className="btn-primary">Upgrade to Premium</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "about" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                About
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">FlowNote v1.0.0</p>
                <p className="text-sm text-gray-600">
                  A mindful productivity companion that helps you plan, reflect,
                  and grow.
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-6 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
