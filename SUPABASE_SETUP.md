# Supabase Setup Guide for FlowNote

## Step 1: Run SQL Script in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-setup.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ All database tables
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Auto-update triggers
- ✅ Helper functions

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To find these values:
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Install Supabase Client

```bash
pnpm add @supabase/supabase-js
```

## Step 4: Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 5: Test Connection

You can test the connection by running a simple query in your app:

```typescript
import { supabase } from '@/lib/supabase'

// Test query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Supabase connected:', !error)
```

## Database Schema Overview

### Tables Created:

1. **profiles** - User profiles with nickname and persona
2. **tasks** - Tasks with priority, effort, energy, due dates
3. **events** - Calendar events with categories and time ranges
4. **journal_entries** - Journal entries with mood and AI summaries
5. **habits** - Habit definitions
6. **habit_logs** - Daily habit completion tracking
7. **quotes** - Saved quotes library
8. **insights_cache** - Cached AI insights data
9. **notifications** - User notifications

### Security:

- ✅ All tables have RLS (Row Level Security) enabled
- ✅ Users can only access their own data
- ✅ Automatic profile creation on signup

### Performance:

- ✅ Indexes on frequently queried columns
- ✅ Full-text search indexes on tasks and journals
- ✅ Optimized date range queries

## Next Steps

1. Set up authentication (Supabase Auth)
2. Create API routes or use Supabase client directly
3. Replace mock data in components with real queries
4. Add real-time subscriptions if needed

## Helper Functions Available

- `get_habit_completion_percentage(user_id, date)` - Get habit completion % for a date
- `get_today_task_completion(user_id, date)` - Get task completion stats for today

## Troubleshooting

**Issue: RLS policies blocking queries**
- Make sure user is authenticated
- Check that `auth.uid()` matches `user_id` in tables

**Issue: Profile not created on signup**
- Check trigger `on_auth_user_created` exists
- Verify function `handle_new_user()` is created

**Issue: Slow queries**
- Check that indexes are created (run `\di` in SQL editor)
- Use `EXPLAIN ANALYZE` to debug query performance

