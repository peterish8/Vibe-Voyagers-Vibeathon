-- ============================================
-- FlowNote Supabase Database Setup
-- ============================================
-- Run this script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  persona_text TEXT, -- "Who I want to become"
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  effort TEXT CHECK (effort IN ('small', 'medium', 'large')) DEFAULT 'medium',
  energy TEXT CHECK (energy IN ('low', 'medium', 'high')),
  due_date DATE,
  status TEXT CHECK (status IN ('open', 'doing', 'done')) DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_fts ON tasks USING GIN (to_tsvector('english', title || ' ' || COALESCE(notes, '')));

-- ============================================
-- 3. EVENTS TABLE (Calendar)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('deep-work', 'study', 'health', 'personal', 'rest')) DEFAULT 'personal',
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  notes TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_ts > start_ts)
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own events
CREATE POLICY "Users can manage own events" ON events
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, start_ts);
CREATE INDEX IF NOT EXISTS idx_events_user_date_range ON events(user_id, start_ts, end_ts);
CREATE INDEX IF NOT EXISTS idx_events_task ON events(task_id) WHERE task_id IS NOT NULL;

-- ============================================
-- 4. JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content_text TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'sad')) DEFAULT 'neutral',
  ai_summary TEXT,
  ai_suggestions TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Enable RLS on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own journal entries
CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for journal entries
CREATE INDEX IF NOT EXISTS idx_journals_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journals_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journals_fts ON journal_entries USING GIN (to_tsvector('english', content_text));

-- ============================================
-- 5. HABITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  target_days_per_week INTEGER DEFAULT 7 CHECK (target_days_per_week BETWEEN 1 AND 7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own habits
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for habits
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);

-- ============================================
-- 6. HABIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, log_date)
);

-- Enable RLS on habit_logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own habit logs
CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for habit logs
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, log_date DESC);

-- ============================================
-- 7. QUOTES TABLE (Saved Quotes Library)
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  source_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own quotes
CREATE POLICY "Users can manage own quotes" ON quotes
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for quotes
CREATE INDEX IF NOT EXISTS idx_quotes_user_created ON quotes(user_id, created_at DESC);

-- ============================================
-- 8. INSIGHTS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'weekly_letter', 'energy_windows', 'mood_trend', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, insight_type, period_start, period_end)
);

-- Enable RLS on insights_cache
ALTER TABLE insights_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own insights
CREATE POLICY "Users can manage own insights" ON insights_cache
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for insights
CREATE INDEX IF NOT EXISTS idx_insights_user_type ON insights_cache(user_id, insight_type, period_start DESC);

-- ============================================
-- 9. NOTIFICATIONS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'task_reminder', 'habit_checkin', 'daily_summary', etc.
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- ============================================
-- 10. UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_cache_updated_at BEFORE UPDATE ON insights_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Function to get habit completion percentage for a date
CREATE OR REPLACE FUNCTION get_habit_completion_percentage(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC AS $$
DECLARE
  total_habits INTEGER;
  completed_habits INTEGER;
BEGIN
  -- Get total active habits
  SELECT COUNT(*) INTO total_habits
  FROM habits
  WHERE user_id = p_user_id AND is_active = TRUE;

  IF total_habits = 0 THEN
    RETURN 0;
  END IF;

  -- Get completed habits for the date
  SELECT COUNT(*) INTO completed_habits
  FROM habit_logs hl
  JOIN habits h ON hl.habit_id = h.id
  WHERE hl.user_id = p_user_id
    AND hl.log_date = p_date
    AND hl.completed = TRUE
    AND h.is_active = TRUE;

  RETURN ROUND((completed_habits::NUMERIC / total_habits::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get task completion count for today
CREATE OR REPLACE FUNCTION get_today_task_completion(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(completed INTEGER, total INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'done' AND DATE(completed_at) = p_date)::INTEGER as completed,
    COUNT(*) FILTER (WHERE due_date = p_date OR (due_date IS NULL AND DATE(created_at) = p_date))::INTEGER as total
  FROM tasks
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE! ✅
-- ============================================
-- Your database is now set up with:
-- ✅ All tables created
-- ✅ RLS policies enabled
-- ✅ Indexes for performance
-- ✅ Auto-update triggers
-- ✅ Helper functions
-- ============================================

