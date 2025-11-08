"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface JournalEntry {
  id: string;
  entry_date: string;
  content_text: string;
  mood: "happy" | "neutral" | "sad";
  ai_summary: string | null;
  ai_suggestions: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("entry_date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching journal entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEntryByDate = async (date: Date) => {
    try {
      const supabase = createClient();
      const dateStr = date.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("entry_date", dateStr)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (err) {
      console.error("Error fetching entry:", err);
      throw err;
    }
  };

  const createOrUpdateEntry = async (
    entry: Partial<JournalEntry> & { entry_date: string }
  ) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("journal_entries")
        .upsert(
          {
            ...entry,
            user_id: user.id,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,entry_date",
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const existingIndex = entries.findIndex((e) => e.id === data.id);
      if (existingIndex >= 0) {
        setEntries(entries.map((e, i) => (i === existingIndex ? data : e)));
      } else {
        setEntries([data, ...entries]);
      }

      return data;
    } catch (err) {
      console.error("Error saving entry:", err);
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting entry:", err);
      throw err;
    }
  };

  return {
    entries,
    loading,
    error,
    getEntryByDate,
    createOrUpdateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
