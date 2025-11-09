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
        console.log(`[useEvents] Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        query = query
          .gte("start_ts", startDate.toISOString())
          .lte("start_ts", endDate.toISOString());
      } else {
        console.log('[useEvents] Fetching all events (no date filter)');
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log(`[useEvents] Fetched ${data?.length || 0} events:`, data);
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
      console.log('[useEvents] Creating event via API:', event);
      
      // Use API route for better error handling and consistency
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[useEvents] API error:', result.error);
        throw new Error(result.error || `Failed to create event: ${response.statusText}`);
      }

      if (!result.success || !result.event) {
        console.error('[useEvents] Invalid API response:', result);
        throw new Error('Invalid response from server');
      }

      const data = result.event;
      console.log('[useEvents] Event created successfully:', data);
      
      // Always add to local state immediately for instant UI update
      // The refetch will ensure consistency with the database
      setEvents((prevEvents) => {
        // Check if event already exists (avoid duplicates)
        const exists = prevEvents.some(e => e.id === data.id);
        if (exists) {
          return prevEvents;
        }
        return [...prevEvents, data];
      });
      
      return data;
    } catch (err: any) {
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
