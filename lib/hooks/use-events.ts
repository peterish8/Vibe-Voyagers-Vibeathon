"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Event {
  id: string;
  title: string;
  category: "deep-work" | "study" | "health" | "personal" | "rest";
  start_ts: string;
  end_ts: string;
  notes: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useEvents(startDate?: Date, endDate?: Date) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("events")
        .select("*")
        .order("start_ts", { ascending: true });

      if (startDate && endDate) {
        query = query
          .gte("start_ts", startDate.toISOString())
          .lte("end_ts", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (event: Partial<Event>) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert({
          ...event,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setEvents([...events, data]);
      return data;
    } catch (err) {
      console.error("Error creating event:", err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setEvents(events.map((e) => (e.id === id ? data : e)));
      return data;
    } catch (err) {
      console.error("Error updating event:", err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
