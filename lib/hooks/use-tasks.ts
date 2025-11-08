'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Task {
  id: string
  title: string
  notes: string | null
  priority: 'low' | 'medium' | 'high'
  effort: 'small' | 'medium' | 'large'
  energy: 'low' | 'medium' | 'high' | null
  due_date: string | null
  status: 'open' | 'doing' | 'done'
  completed_at: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (task: Partial<Task>) => {
    try {
      console.log('[useTasks] createTask called with:', task)
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('[useTasks] Error getting user:', userError)
        throw userError
      }
      
      if (!user) {
        console.error('[useTasks] No user found - not authenticated')
        throw new Error('Not authenticated')
      }

      console.log('[useTasks] User authenticated:', user.id)
      console.log('[useTasks] Inserting task with data:', {
        ...task,
        user_id: user.id,
      })

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('[useTasks] Supabase error:', error)
        throw error
      }
      
      console.log('[useTasks] Task created successfully:', data)
      setTasks([data, ...tasks])
      return data
    } catch (err) {
      console.error('[useTasks] Error creating task:', err)
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTasks(tasks.map(t => t.id === id ? data : t))
      return data
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  const toggleTask = async (id: string) => {
    try {
      console.log('[useTasks] Toggling task:', id);
      const task = tasks.find(t => t.id === id)
      if (!task) {
        console.warn('[useTasks] Task not found:', id);
        return;
      }

      const newStatus = task.status === 'done' ? 'open' : 'done'
      const completed_at = newStatus === 'done' ? new Date().toISOString() : null

      console.log('[useTasks] Updating task status:', { id, newStatus, completed_at });
      await updateTask(id, { status: newStatus, completed_at })
      console.log('[useTasks] Task toggled successfully');
    } catch (err) {
      console.error('[useTasks] Error toggling task:', err);
      throw err;
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refetch: fetchTasks,
  }
}

