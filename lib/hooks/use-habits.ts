"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Habit {
  id: string;
  name: string;
  is_active: boolean;
  target_days_per_week: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);
  
  // Refetch when page becomes visible
  useEffect(() => {
    const handleFocus = () => {
      fetchHabits();
      fetchLogs();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchHabits = async () => {
    try {
      setError(null);
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[useHabits] No user found, skipping fetch');
        setHabits([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log('[useHabits] Fetched habits:', data?.length || 0);
      setHabits(data || []);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (date?: Date) => {
    try {
      const supabase = createClient();
      
      // Fetch all logs for proper tracking, optionally filter by date
      let query = supabase
        .from("habit_logs")
        .select("*")
        .order("log_date", { ascending: false });
      
      if (date) {
        const dateStr = date.toISOString().split("T")[0];
        query = query.eq("log_date", dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching habit logs:", err);
    }
  };

  const createHabit = async (habit: Partial<Habit>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    if (!habit.name?.trim()) throw new Error("Habit name is required");

    const { data, error } = await supabase
      .from("habits")
      .insert({
        name: habit.name.trim(),
        is_active: habit.is_active ?? true,
        target_days_per_week: habit.target_days_per_week ?? 7,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    
    setHabits([data, ...habits]);
    return data;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("habits")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setHabits(habits.map((h) => (h.id === id ? data : h)));
      return data;
    } catch (err) {
      console.error("Error updating habit:", err);
      throw err;
    }
  };

  const toggleHabitLog = async (
    habitId: string,
    date: Date,
    completed: boolean
  ) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const dateStr = date.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("habit_logs")
        .upsert(
          {
            user_id: user.id,
            habit_id: habitId,
            log_date: dateStr,
            completed,
          },
          {
            onConflict: "user_id,habit_id,log_date",
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const existingIndex = logs.findIndex(
        (l) => l.habit_id === habitId && l.log_date === dateStr
      );
      if (existingIndex >= 0) {
        setLogs(logs.map((l, i) => (i === existingIndex ? data : l)));
      } else {
        setLogs([...logs, data]);
      }

      return data;
    } catch (err) {
      console.error("Error toggling habit log:", err);
      throw err;
    }
  };

  const getHabitCompletionForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const activeHabits = habits.filter((h) => h.is_active);
    const completedLogs = logs.filter(
      (l) => l.log_date === dateStr && l.completed
    );

    if (activeHabits.length === 0)
      return { percentage: 0, completed: 0, total: 0 };

    const completed = completedLogs.length;
    const total = activeHabits.length;
    const percentage = Math.round((completed / total) * 100);

    return { percentage, completed, total };
  };

  return {
    habits,
    logs,
    loading,
    error,
    createHabit,
    updateHabit,
    toggleHabitLog,
    getHabitCompletionForDate,
    refetch: () => {
      fetchHabits();
      fetchLogs();
    },
  };
}
