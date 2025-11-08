# FlowNote — Complete Product Requirements Document (PRD)

## Executive Summary

**FlowNote** is an AI-powered productivity companion that seamlessly integrates daily planning, journaling, and habit tracking into one cohesive, calm digital workspace. Unlike traditional productivity tools that emphasize hustle and optimization, FlowNote focuses on mindful productivity, emotional clarity, and sustainable personal growth.

---

## 1. Product Vision & Philosophy

### Core Identity
FlowNote is not just a productivity tool—it's a **daily rhythm engine** where planning (forward-looking) and reflection (retrospective) exist in continuous conversation, creating a closed loop of self-understanding and intentional living.

### Target Audience
- **Students & Makers** (18-28): Seeking structure without rigidity, wanting to track progress meaningfully
- **Busy Professionals** (25-38): Need time-boxed planning with emotional awareness
- **Self-Improvers**: Value introspection, habit formation, and gentle accountability

### Differentiators
1. **Unified Intelligence**: AI learns from both your plans AND reflections
2. **Privacy-First**: Voice recordings stay local; only text summaries sync
3. **Emotional Awareness**: Mood tracking isn't separate—it's woven into insights
4. **Energy-Aware Scheduling**: AI respects your natural rhythm, never schedules in the past
5. **No Guilt Culture**: Missed tasks are learning opportunities, not failures

---

## 2. Core Features & Functionality

### 2.1 Dashboard (Home)
**Purpose**: Morning launchpad and daily mindset center

**Components**:
- **Personalized Greeting**: "Good morning, {nickname} 👋 — Today is {Day, Date}"
- **Daily AI Insight**: 2-3 sentence observation based on recent patterns
  - Example: "Your focus peaks mid-morning. Consider blocking 10-12 AM for deep work."
- **Top 3 Tasks**: AI-prioritized from your task list (based on due date, effort, energy match)
- **Mini Schedule**: Horizontal timeline showing today's events (8 AM - 8 PM)
- **Habit Scorecard**: Visual indicator (e.g., "4/6 today — 67%")
- **Daily Quote**: AI-generated reflection inspired by yesterday's journal
  - **Save to Library** button preserves meaningful quotes
- **Quick Actions**:
  - "Plan My Day" → AI scheduling flow
  - "Log Quick Note" → Opens journal
  - "Voice Reflect" → Starts audio recording

**Visual Style**:
- Large breathing room between sections
- Soft-edged glass cards with subtle inner highlights
- Gradient accent lines separating sections
- Micro-animations on hover (gentle lift, no bounce)

---

### 2.2 Calendar (Time Visualization)
**Purpose**: See and shape your time with clarity

**Views**:
- **Week View** (default): 7-day horizontal layout, hour blocks 6 AM - 10 PM
- **Month View**: Bird's eye view for planning ahead
- **Day Detail**: Zoomed focus on a single day

**Key Features**:
1. **Smart Time Awareness**:
   - Never suggests slots in the past
   - If opened at 9:15 AM, recommendations start at 10:00 AM minimum
   
2. **Drag-and-Drop Scheduling**:
   - Create events by dragging across time slots
   - Resize by pulling edges
   - Move by dragging the block
   
3. **Event Categories** (soft color coding):
   - Deep Work (soft purple)
   - Study (sky blue)
   - Health (sage green)
   - Personal (peach)
   - Rest (lavender mist)
   
4. **AI Scheduling Assist**:
   - From chat: "Block 2-4 PM for focused writing"
   - AI proposes blocks, user confirms
   - Respects existing commitments, suggests breaks

**Visual Style**:
- Semi-transparent time grid with subtle guide lines
- Current time indicator (pulsing vertical line)
- Past hours faded to 40% opacity
- Event blocks with rounded corners, gradient overlay
- Category tags as floating pills above blocks

---

### 2.3 Tasks (Intention Management)
**Purpose**: Organize work without overwhelm

**Task Structure**:
```
- Title (required)
- Notes (optional, expandable)
- Priority: Low / Medium / High (color-coded chips)
- Effort: Small / Medium / Large (dot indicators: • •• •••)
- Energy Required: Low / Med / High
- Due Date (optional)
- Tags (flexible, user-defined)
- Status: Open / In Progress / Done / Archived
```

**Views**:
1. **Today**: AI-suggested top tasks for the day
2. **Upcoming**: Next 7 days, grouped by date
3. **Backlog**: Everything else, sortable
4. **Completed**: Archived view (collapsed by default)

**AI Capabilities**:
- **Natural Language Task Creation**:
  - "Add tasks: finish chapter 4, gym, email mentor" → Creates 3 separate tasks
- **Priority Intelligence**:
  - Considers deadline proximity, stated importance, historical patterns
- **Smart Carry-Over**:
  - End-of-day prompt: "3 tasks incomplete. Move to tomorrow?"
  - Tracks rollover patterns for insight generation

**Visual Style**:
- Kanban-inspired columns for Today/Upcoming/Backlog
- Task cards with soft shadows, expand on hover
- Checkbox animations: subtle scale + color fade (no explosions)
- Draggable reordering within sections
- Inline editing (click to modify)

---

### 2.4 Journal (Reflection Space)
**Purpose**: Capture thoughts, process emotions, gain clarity

**Input Modes**:

**A) Text Journaling**:
- Clean, distraction-free editor
- Auto-saves drafts
- Markdown support (optional)

**B) Voice Journaling**:
- Tap microphone → record (up to 10 minutes recommended)
- Audio stored locally in IndexedDB (WebM/Opus format, ~24-32 kbps)
- Whisper API converts to text
- Original audio never leaves device
- Text saved to Supabase for search/insights

**Daily Entry Flow**:
1. Write or speak about the day
2. Select mood: 😊 Good / 😐 Neutral / 😞 Bad
3. Optional: Add tags (e.g., "productive", "tired", "social")
4. **Save** → AI generates:
   - **3 Bullet Highlights**: Key moments extracted
   - **Reflection Sentence**: One-line synthesis
   - **Tomorrow's Focus**: 1-2 gentle suggestions

**Search & Retrieval**:
- Manual VS Code-style search bar
- Full-text search across all entries
- Click result → opens that day's journal
- Highlight matching text for 3 seconds

**Privacy Controls**:
- **Export by Month**: Downloads .zip of audio files + metadata JSON
- **Import**: Restores audio files to new device
- **Delete**: Permanent removal with confirmation

**Visual Style**:
- Spacious writing canvas with subtle texture
- Mood selector as large, friendly icons
- AI summary in a separate glass card below entry
- Voice recording: animated waveform during capture
- Soft gradient background shift during writing mode

---

### 2.5 Habits (Consistency Building)
**Purpose**: Track daily practices without pressure

**Habit Structure**:
- Habit Name (e.g., "Morning Exercise")
- Active/Inactive toggle
- Daily checkbox per habit

**Daily Scoring**:
- Example: 5 habits → 4 completed = **80%**
- Visual: Donut chart or progress bar
- Historical: Line graph (7-day, 30-day, 90-day toggles)

**Streak Tracking**:
- Current streak displayed prominently
- Longest streak recorded
- "Grace days" philosophy: missing one day doesn't reset (configurable)

**AI Insights**:
- "You complete habits 92% of the time after morning journaling"
- "Gym days correlate with +18% task completion"

**Visual Style**:
- Clean checklist with large, tappable areas
- Percentage displayed as large, friendly number
- Trend line uses soft pastel gradients
- Celebratory animation on streak milestones (subtle)

---

### 2.6 Insights (Pattern Recognition)
**Purpose**: Turn data into self-understanding

**Key Metrics**:

1. **Consistency Score**:
   - Tasks planned vs. completed (daily, weekly)
   - Visualization: Bar chart with target line

2. **Energy Windows**:
   - Heatmap showing most productive hours
   - Recommendations for scheduling types of work

3. **Mood-Productivity Correlation**:
   - Scatter plot: mood rating vs. tasks completed
   - Identifies patterns (e.g., "Good mood days = +2 tasks average")

4. **Task Rollover Analysis**:
   - Which tasks slip most often?
   - Suggestions for breaking down or deprioritizing

5. **Habit Impact**:
   - Days with full habit completion vs. partial
   - Correlation with other metrics

**Weekly Letter**:
- Auto-generated every Sunday evening
- Tone: Reflective, encouraging, specific
- Format:
  - **This week's wins**: 2-3 highlights
  - **Patterns noticed**: Behavioral observations
  - **Next week's focus**: 2-3 concrete adjustments

**Visual Style**:
- Card-based layout, each insight is a distinct glass panel
- Charts use soft, accessible colors (no harsh reds/greens)
- Annotations in natural language, not just numbers
- "Deep dive" expandable sections for detail

---

### 2.7 AI Assistant Panel (Right Rail)
**Purpose**: Always-available guide, not intrusive automation

**Fixed Position**: Right side, 380px width, collapsible to 60px icon rail

**Capabilities**:

**A) Planning Assistance**:
- Prompt: "Plan my day starting at 10 AM"
- Output: Prioritized task list + suggested calendar blocks
- User reviews → accepts/modifies → AI writes to calendar

**B) Task Generation**:
- Prompt: "I need to finish the chapter, review notes, and exercise"
- Output: 3 separate tasks with suggested priorities

**C) Journal Summarization**:
- Triggered after saving journal entry
- Output: Highlights, mood confirmation, tomorrow nudge

**D) Quote Generation**:
- Based on yesterday's journal themes
- Tone: Original, non-cringey, 14-22 words
- Save to Library feature

**E) Contextual Search**:
- Prompt: "When did I finish Psychology of Money?"
- AI searches journals/tasks → finds date → highlights relevant entry

**Interaction Design**:
- Chat bubbles (glass cards, rounded-3xl)
- User messages: align right, light purple gradient
- AI messages: align left, soft blue gradient
- Typing indicator: gentle pulsing dots
- Message history scrollable
- Input bar fixed at bottom with send button

**Tone Guidelines**:
- Supportive, never commanding
- Asks permission before making changes
- Celebrates progress, gentle about setbacks
- Uses {nickname} naturally in conversation

**Visual Style**:
- Semi-transparent background (backdrop-blur-xl)
- Subtle inner glow on active state
- Smooth scroll with inertia
- Auto-scrolls to new messages

---

### 2.8 Search (Global Find)
**Purpose**: Quick retrieval across all data

**Trigger**: 
- `Ctrl/Cmd + K` keyboard shortcut
- Search icon in top bar

**Search Scope**:
- Journal entries (text + AI summaries)
- Task titles + notes
- Calendar event titles + descriptions

**Results Display**:
```
┌─ Search Results for "psychology" ────────┐
│                                           │
│ JOURNALS (2)                              │
│ ├─ Jul 14, 2025                          │
│ │  "Finished Psychology of Money..."     │
│ │  [Open Day]                            │
│ └─ Aug 3, 2025                           │
│    "Reflecting on money mindset..."      │
│    [Open Day]                            │
│                                           │
│ TASKS (1)                                 │
│ └─ "Read Psychology of Money"            │
│    Completed Aug 1, 2025                 │
│    [View Task]                           │
│                                           │
│ CALENDAR (0)                              │
└───────────────────────────────────────────┘
```

**Interaction**:
- Click result → navigates to relevant screen
- Highlights matched item for 3 seconds (soft glow)
- Recent searches stored locally

**Implementation**:
- PostgreSQL full-text search (`to_tsvector`)
- Optional: `pg_trgm` for fuzzy matching
- Debounced queries (300ms)

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Frontend**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: 
  - Tailwind CSS 3.4+
  - Custom design tokens for gradients/shadows
- **UI Components**: shadcn/ui (Radix primitives)
- **Animations**: Framer Motion (subtle, <200ms)
- **Charts**: Recharts (for insights)
- **State**: 
  - React Query (server state)
  - Zustand (client state)

**Backend**:
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (magic link + OAuth)
- **Storage**: Supabase Storage (for future cloud audio option)
- **APIs**: Next.js API Routes (Edge Functions)

**AI Services**:
- **LLM**: OpenAI GPT-4 Turbo (planning, summarization, quotes)
- **STT**: OpenAI Whisper API (voice transcription)

**Local Storage**:
- **IndexedDB**: Audio files (via `idb` library)
- **Service Worker**: Offline journal drafts

---

### 3.2 Database Schema (Minimal)

```sql
-- Users & Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  persona_text TEXT, -- "Who I want to become"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  effort TEXT CHECK (effort IN ('small', 'medium', 'large')),
  energy TEXT CHECK (energy IN ('low', 'medium', 'high')),
  due_date DATE,
  status TEXT CHECK (status IN ('open', 'doing', 'done')) DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('work', 'study', 'health', 'personal', 'rest')),
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  notes TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content_text TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('good', 'neutral', 'bad')),
  ai_summary TEXT,
  ai_suggestions TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit Logs
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL,
  UNIQUE(user_id, habit_id, log_date)
);

-- Saved Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  source_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights Cache (Precomputed)
CREATE TABLE insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'weekly_letter', 'energy_window', etc.
  period_start DATE,
  period_end DATE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_events_user_time ON events(user_id, start_ts);
CREATE INDEX idx_journals_user_date ON journal_entries(user_id, entry_date DESC);

-- Full-Text Search
CREATE INDEX idx_tasks_fts ON tasks USING GIN (to_tsvector('english', title || ' ' || COALESCE(notes, '')));
CREATE INDEX idx_journals_fts ON journal_entries USING GIN (to_tsvector('english', content_text || ' ' || COALESCE(ai_summary, '')));
CREATE INDEX idx_events_fts ON events USING GIN (to_tsvector('english', title || ' ' || COALESCE(notes, '')));

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies (all tables follow same pattern)
CREATE POLICY "Users can only access their own data" ON tasks
  FOR ALL USING (auth.uid() = user_id);
-- Repeat for all tables
```

---

### 3.3 AI Integration Points

**1. Morning Planning**:
```typescript
// Prompt Template
Given these tasks:
- [Task 1: Priority High, Effort Medium, Due Tomorrow]
- [Task 2: Priority Low, Effort Large, Due Next Week]
...

User's available time: 10:00 AM - 6:00 PM today
User's energy pattern: High 10-12 AM, Medium 2-4 PM, Low after 5 PM

Generate:
1. Top 3 recommended tasks for today
2. Suggested time blocks (JSON format with start/end times)
3. Include 15-min breaks between deep work blocks

Constraints:
- No blocks in the past
- Deep work in high-energy windows
- Admin tasks in low-energy windows
```

**2. Journal Summarization**:
```typescript
// Prompt Template
Summarize this journal entry in 3-5 bullet points.
Then provide 1-2 gentle, actionable suggestions for tomorrow.

Tone: Encouraging, factual, non-judgmental.

Journal text:
"{user_journal_content}"
```

**3. Daily Quote Generation**:
```typescript
// Prompt Template
Write an original, non-clichéd motivational sentence (14-22 words) inspired by this theme:
"{extracted_theme_from_yesterday}"

Tone: Calm, reflective, hopeful. No generic platitudes.
```

---

### 3.4 Voice Storage Strategy

**Recording**:
- Browser MediaRecorder API
- Format: WebM with Opus codec
- Bitrate: 24-32 kbps mono (excellent speech quality, ~1.8-2.4 MB per 10 min)

**Storage**:
- **Local**: IndexedDB (via `idb` library)
- Schema:
  ```typescript
  {
    id: string (UUID),
    entry_date: Date,
    blob: Blob (audio file),
    duration_seconds: number,
    transcribed_text: string,
    created_at: Date
  }
  ```

**Export/Import**:
- **Export**: Zip selected months → download
  - File structure: `YYYY-MM-DD_voice.webm`, `metadata.json`
- **Import**: Select zip → extract → restore to IndexedDB

**Transcription Flow**:
1. Record audio → save to IndexedDB
2. Send blob to `/api/transcribe` (proxy to Whisper)
3. Receive text → save to `journal_entries.content_text`
4. Original audio stays local, never uploaded to Supabase

**Storage Math**:
- 10 min/day at 32 kbps = ~2.4 MB/day
- Monthly (30 days) = ~72 MB
- Yearly = ~864 MB (well within IndexedDB limits)

---

## 4. Visual Design System

### 4.1 Color Palette

**Primary Palette**:
```
Purple (Primary):
- 50:  #F5F3FF (backgrounds)
- 100: #EDE9FE
- 200: #DDD6FE
- 500: #8B5CF6 (interactive elements)
- 600: #7C3AED (hover states)
- 900: #4C1D95 (text)

Blue (Secondary):
- 50:  #EFF6FF
- 100: #DBEAFE
- 200: #BFDBFE
- 500: #3B82F6 (accents)
- 600: #2563EB (hover)

Neutrals:
- 50:  #FAFAFA (page background)
- 100: #F5F5F5 (surface)
- 200: #E5E5E5 (borders)
- 600: #525252 (body text)
- 900: #171717 (headings)

Semantic Colors:
- Success: #10B981 (soft green)
- Warning: #F59E0B (soft amber)
- Error: #EF4444 (soft red)
- Mood Good: #34D399
- Mood Neutral: #FBBF24
- Mood Bad: #F87171
```

**Gradient Library**:
```css
/* Primary Gradient (hero sections) */
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Subtle Background Gradient */
.gradient-bg {
  background: radial-gradient(
    circle at top right,
    #EFF6FF 0%,
    #F5F3FF 40%,
    #FAFAFA 100%
  );
}

/* Card Gradient Overlay */
.gradient-card {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(59, 130, 246, 0.05) 100%
  );
}

/* Glassmorphism Base */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}
```

---

### 4.2 Typography

**Font Stack**:
```css
--font-display: 'Inter', -apple-system, system-ui, sans-serif;
--font-body: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Scale**:
```
- xs:   12px / 16px line-height
- sm:   14px / 20px
- base: 16px / 24px (body text)
- lg:   18px / 28px
- xl:   20px / 28px
- 2xl:  24px / 32px
- 3xl:  30px / 36px
- 4xl:  36px / 40px (page titles)
- 5xl:  48px / 1 (hero headlines)
```

**Weights**:
- Regular: 400 (body text)
- Medium: 500 (labels, buttons)
- Semibold: 600 (headings)
- Bold: 700 (rarely used)

---

### 4.3 Spacing System

**Base Unit**: 4px

```
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px
- 20: 80px
- 24: 96px
```

**Component Spacing Rules**:
- Card padding: `px-6 py-5` (24px horizontal, 20px vertical)
- Section gaps: `space-y-8` (32px)
- Page margins: `px-8` on mobile, `px-12` on desktop
- Max content width: `1200px` (centered)

---

### 4.4 Glass Morphism Components

**Card Base**:
```tsx
<div className="
  bg-white/70
  backdrop-blur-xl
  border border-white/30
  rounded-3xl
  shadow-[0_8px_32px_rgba(0,0,0,0.04)]
  p-6
  hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)]
  transition-all duration-300
">
  {/* Content */}
</div>
```

**Floating Gradient Blobs** (background decoration):
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="
    absolute top-0 right-0
    w-[500px] h-[500px]
    bg-gradient-to-br from-purple-200/30 to-blue-200/30
    rounded-full
    blur-3xl
    opacity-50
    animate-pulse
  " />
  <div className="
    absolute bottom-0 left-0
    w-[600px] h-[600px]
    bg-gradient-to-tr from-blue-200/30 to-purple-200/30
    rounded-full
    blur-3xl
    opacity-40
    animate-pulse
    animation-delay-2000
  " />
</div>
```

**Button Variants**:
```tsx
// Primary
<button className="
  bg-gradient-to-r from-purple-500 to-blue-500
  text-white
  px-6 py-3
  rounded-full
  font-medium
  shadow-lg shadow-purple-500/30
  hover:shadow-xl hover:shadow-purple-500/40
  hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-200
">
  Get Started
</button>

// Secondary (glass)
<button className="
  bg-white/80
  backdrop-blur-md
  text-purple-600
  px-6 py-3
  rounded-full
  font-medium
  border border-purple-200/50
  hover:bg-white
  hover:border-purple-300
  transition-all duration-200
">
  Learn More
</button>
```

---

### 4.5 Animation Guidelines

**Micro-interactions**:
- **Hover**: Lift + slight scale (`transform: translateY(-2px) scale(1.01)`)
- **Active**: Press down (`transform: scale(0.98)`)
- **Duration**: 150-200ms
- **Easing**: `ease-out` for entrances, `ease-in-out` for exits

**Page Transitions**:
- Fade in + slide up 20px
- Stagger children by 50ms
- Total duration: 400ms max

**Loading States**:
- Skeleton screens with shimmer effect
- Pulse animation for placeholders
- Never block UI—show partial content

**Success Feedback**:
- Checkbox completion: Gentle scale + color transition
- Task completion: Soft confetti (12-15 particles, 800ms fade)
- Save confirmation: Slide-in toast from top-right

**Prohibited**:
- No spinners longer than 2 seconds
- No aggressive bouncing
- No intrusive modals (use slide-over panels)

---

## 5. User Flows

### 5.1 First-Time User Onboarding

**Step 1**: Landing Page
- User arrives from marketing site
- Click "Get Started" → Auth flow

**Step 2**: Account Creation
- Magic link or Google OAuth
- No password required for initial signup

**Step 3**: Profile Setup
```
┌─ Welcome to FlowNote! ────────────┐
│                                   │
│ What should we call you?          │
│ [Nickname Input]                  │
│                                   │
│ Who are you becoming?             │
│ (Optional personalization)        │
│ [Text Area]                       │
│                                   │
│ [Continue →]                      │
└───────────────────────────────────┘
```

**Step 4**: Quick Tour (Optional)
- 3-screen walkthrough:
  1. "Plan your days with AI assistance"
  2. "Reflect through journaling"
  3. "Track habits and grow"
- Can skip at any time

**Step 5**: First Dashboard
- Pre-populated with sample task: "Explore FlowNote"
- Empty states with helpful prompts
- AI greeting: "Hi {nickname}, let's start your first day together."

---

### 5.2 Daily Morning Routine

**8:30 AM** - User opens FlowNote

**Dashboard loads**:
- Greeting: "Good morning, Alex 👋"
- Yesterday's insight: "You completed 4/5 tasks yesterday—great momentum!"
- Empty today section

**User interacts with AI**:
```
User: "Plan my day"

AI: "I see you have 6 tasks in your backlog. 
     You're usually most focused 10 AM - 12 PM.
     
     I suggest:
     • 10:00-11:00: Deep work on Project Report
     • 11:00-11:45: Review meeting notes
     • 12:00-12:30: Lunch break
     • 2:00-3:00: Email mentor about thesis
     
     Would you like me to add these to your calendar?"

User: "Yes"
```

**Calendar updates**:
- 4 blocks appear as colored time slots
- User can drag to adjust
- Tasks in "Today" section auto-link to calendar

**User proceeds with day**:
- Checks off tasks as completed
- Adds quick task via `+` button: "Buy groceries"
- AI notices unscheduled task, suggests 5 PM slot

---

### 5.3 Evening Reflection

**8:45 PM** - User opens Journal tab

**Voice recording flow**:
1. Tap microphone icon
2. Visual: Animated waveform appears
3. Speak for 3-5 minutes about the day
4. Tap "Stop" → Processing spinner
5. Whisper transcribes → Text appears in editor
6. User reviews/edits transcript
7. Selects mood: 😊 Good

**AI summarization**:
```
Highlights:
• Finished project report ahead of schedule
• Had a productive meeting with team
• Felt energized after morning run

Reflection:
Today you maintained strong focus during your 
peak hours and took care of physical health. 
Your energy was noticeably higher than yesterday.

Tomorrow's Focus:
• Continue early start routine
• Block 30 min for thesis outline
• Remember to schedule breaks
```

**User saves entry**:
- Checkmark animation
- Toast: "Journal saved. See you tomorrow, Alex!"
- Daily quote appears in Dashboard for next day

---

### 5.4 Task Management Flow

**Adding a task**:
```
Via Quick Add (+):
1. Click "+" in top bar
2. Modal appears: "What do you want to do?"
3. Type: "Finish presentation slides"
4. Press Enter
5. Task appears in "Today" with AI-suggested priority (Medium)

Via AI Chat:
User: "I need to finish slides, review code, and call dentist"
AI: "I've created 3 tasks:
     • Finish presentation slides (Priority: High, Effort: Large)
     • Review code changes (Priority: Medium, Effort: Medium)
     • Call dentist (Priority: Low, Effort: Small)
     
     Would you like me to schedule these?"
```

**Editing a task**:
- Click task card → Expands inline
- Edit title, notes, priority, effort, due date
- Changes auto-save (debounced 500ms)
- No "Save" button needed

**Completing a task**:
- Click checkbox → Soft scale animation + color fade
- Task moves to "Completed" section (collapsed)
- If task was on calendar, event remains with "Completed" badge
- Habit score updates if task was habit-linked

**Carrying over tasks**:
- 11:59 PM automatic check
- Incomplete tasks flagged
- Next morning notification: "3 tasks from yesterday. Move to today?"
- User can bulk select or individually handle

---

### 5.5 Habit Tracking Flow

**Creating a habit**:
```
Habits Tab → "Add Habit"
┌─────────────────────┐
│ Habit Name:         │
│ [Morning Exercise]  │
│                     │
│ Target Days/Week:   │
│ [5] days            │
│                     │
│ [Create Habit]      │
└─────────────────────┘
```

**Daily check-in**:
- Dashboard shows: "4/6 habits today"
- Click to expand → Checklist appears
- Tap each habit completed
- Progress bar fills in real-time
- Streak counter increments

**Long-term view**:
- Habits tab shows 30-day calendar grid
- Completed days: green dot
- Missed days: gray dot
- Current streak prominently displayed
- Graph below shows percentage trend

---

### 5.6 Insight Discovery Flow

**Weekly Letter Generation** (Sunday 8 PM):
```
Background process:
1. Aggregate past 7 days of data
2. Calculate metrics (completion %, mood avg, habit consistency)
3. Generate AI letter
4. Store in insights_cache

User notification:
"Your weekly reflection is ready"

User opens Insights tab:
┌─────────────────────────────────────┐
│ Week of Nov 4-10, 2025              │
│                                     │
│ This week, you completed 78% of     │
│ planned tasks—your highest yet.     │
│ You were most productive on         │
│ Tuesday and Wednesday mornings.     │
│                                     │
│ Patterns noticed:                   │
│ • Exercise days → +2 tasks completed│
│ • Late journaling → lower morning   │
│   energy next day                   │
│                                     │
│ Next week's focus:                  │
│ • Schedule deep work 10-12 AM       │
│ • Add 15-min breaks between blocks  │
│ • Try journaling before 9 PM        │
└─────────────────────────────────────┘
```

---

## 6. Security & Privacy

### 6.1 Data Privacy Principles

1. **Transparency**: Users know exactly what data is stored and where
2. **Minimalism**: Collect only what's necessary for functionality
3. **Control**: Users can export or delete data at any time
4. **Local-First**: Sensitive data (audio) never leaves device by default

### 6.2 Row-Level Security (RLS)

All Supabase tables enforce strict RLS:
```sql
-- Example for tasks table
CREATE POLICY "Users can only access their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id);

-- Applied to all tables:
- tasks
- events
- journal_entries
- habits
- habit_logs
- quotes
- insights_cache
```

### 6.3 Audio Privacy Architecture

**Local Storage**:
- Audio files stored in browser IndexedDB
- Never uploaded to server unless user explicitly opts in (future feature)
- Cleared on logout if user chooses

**Transcription**:
- Audio sent to OpenAI Whisper via secure HTTPS
- OpenAI doesn't retain audio after processing (per API terms)
- Only transcript saved to Supabase

**Export Controls**:
- Monthly export creates encrypted zip (AES-256)
- Password-protected by default
- Clear naming: `FlowNote_Audio_2025-11_encrypted.zip`

### 6.4 AI Prompt Safety

**Input Sanitization**:
- Strip HTML/JS from user inputs before sending to AI
- Truncate prompts to max 4000 tokens
- Filter profanity and harmful content requests

**Output Validation**:
- Parse AI responses as JSON when expecting structured data
- Reject responses containing script tags or suspicious patterns
- Human-review flagged content in weekly audits

### 6.5 Authentication Flow

**Magic Link** (primary):
```
1. User enters email
2. Supabase sends one-time link
3. Link valid for 15 minutes
4. Clicking link creates session (7-day default)
5. Refresh token stored securely (httpOnly cookie)
```

**OAuth** (alternative):
- Google Sign-In
- No password storage required
- Session management via Supabase Auth

---

## 7. Performance Requirements

### 7.1 Speed Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint** | < 1.2s | Lighthouse |
| **Time to Interactive** | < 2.5s | Lighthouse |
| **Largest Contentful Paint** | < 2.0s | Lighthouse |
| **Dashboard Load** | < 800ms | Network tab |
| **Search Results** | < 300ms | Custom timer |
| **Calendar Drag** | 60 FPS | Frame rate monitor |
| **AI Response Time** | < 3s | Server logs |

### 7.2 Optimization Strategies

**Code Splitting**:
- Lazy load route-specific components
- Dynamic imports for Charts/Recharts
- Separate bundles for AI chat vs main app

**Image Optimization**:
- Use Next.js Image component
- WebP with fallback to PNG
- Blur placeholders for all images

**Database Queries**:
- Indexed columns for all WHERE clauses
- Limit queries to 50 rows default
- Pagination for long lists
- Precompute insights (don't calculate on-demand)

**Caching**:
- React Query with 5-minute stale time
- Service Worker caches static assets
- Optimistic updates for mutations

**Bundle Size**:
- Target < 200 KB initial JS
- Tree-shake unused libraries
- Analyze with `@next/bundle-analyzer`

---

## 8. Accessibility (WCAG 2.1 AA)

### 8.1 Keyboard Navigation

**Global Shortcuts**:
- `Ctrl/Cmd + K`: Open search
- `Ctrl/Cmd + N`: Quick add task
- `Ctrl/Cmd + J`: Open journal
- `Esc`: Close modals/panels
- `Tab`: Navigate focusable elements
- `Enter`: Activate buttons/links

**Calendar**:
- Arrow keys: Navigate days
- `+`: Create event in selected slot
- `Delete`: Remove selected event

**Task List**:
- `Space`: Toggle checkbox
- `Enter`: Edit task
- `Delete`: Archive task

### 8.2 Screen Reader Support

**Semantic HTML**:
```jsx
<main aria-label="Dashboard">
  <section aria-labelledby="tasks-heading">
    <h2 id="tasks-heading">Today's Tasks</h2>
    <ul role="list">
      <li>
        <button 
          aria-label="Mark 'Finish report' as complete"
          aria-pressed="false"
        >
          <span aria-hidden="true">☐</span>
          Finish report
        </button>
      </li>
    </ul>
  </section>
</main>
```

**Live Regions**:
```jsx
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  {notification && <p>{notification}</p>}
</div>
```

**Focus Management**:
- Visible focus indicators (2px purple outline)
- Skip to main content link
- Focus trap in modals
- Return focus after closing panels

### 8.3 Color Contrast

All text meets WCAG AA standards:
- Body text (neutral-600): 7.2:1 ratio on white
- Headings (neutral-900): 13.5:1 ratio
- Interactive elements: 4.5:1 minimum

**Status Colors** (accessible pairs):
- Success: #059669 text on #D1FAE5 background
- Warning: #D97706 text on #FEF3C7 background
- Error: #DC2626 text on #FEE2E2 background

### 8.4 Motion Preferences

Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Users can toggle "Reduce animations" in Settings.

---

## 9. Error Handling & Edge Cases

### 9.1 Network Failures

**Offline Detection**:
```typescript
useEffect(() => {
  const handleOnline = () => setOnlineStatus(true);
  const handleOffline = () => setOnlineStatus(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

**Behavior**:
- Show banner: "You're offline. Changes will sync when reconnected."
- Queue mutations in IndexedDB
- Auto-retry on reconnection
- Allow read-only access to cached data

### 9.2 AI Failures

**Timeout Handling**:
- 30-second timeout for AI responses
- Fallback message: "AI is taking longer than usual. Try again?"
- Allow manual retry with exponential backoff

**Rate Limiting**:
- 100 AI requests per user per day (free tier)
- Show counter: "15/100 AI actions remaining today"
- Graceful degradation: Disable AI buttons when limit reached

**Content Moderation**:
- If AI response contains flagged content → Don't display
- Log incident for review
- Show: "Response couldn't be generated. Please rephrase."

### 9.3 Data Validation

**Client-Side**:
- Zod schemas for all forms
- Real-time validation feedback
- Prevent submission of invalid data

**Server-Side**:
- Revalidate all inputs
- Sanitize HTML/script tags
- Return specific error codes:
  - `400`: Bad request (invalid data)
  - `401`: Unauthorized (auth required)
  - `403`: Forbidden (wrong user)
  - `429`: Too many requests
  - `500`: Server error

### 9.4 Empty States

**First-time users**:
- Tasks tab: "No tasks yet. Click + to add your first task!"
- Calendar: "Your week is open. Let AI help you plan."
- Journal: "Start your first journal entry—write or speak."
- Habits: "Create habits you want to build consistency around."
- Insights: "Insights appear after a few days of activity."

**Returning users with no data**:
- Encouraging messages, not generic placeholders
- Clear CTAs for next action
- Illustrative icons (not stock photos)

---

## 10. Deployment & DevOps

### 10.1 Infrastructure

**Hosting**:
- **Frontend**: Vercel (Next.js optimized)
- **Database**: Supabase (managed PostgreSQL)
- **AI APIs**: OpenAI (direct calls from API routes)
- **CDN**: Vercel Edge Network

**Environments**:
- **Production**: `app.flownote.co`
- **Staging**: `staging.flownote.co`
- **Development**: `localhost:3000`

### 10.2 CI/CD Pipeline

**GitHub Actions Workflow**:
```yaml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 10.3 Monitoring

**Error Tracking**:
- Sentry for runtime errors
- Source maps uploaded automatically
- Alert thresholds: >10 errors/hour

**Performance Monitoring**:
- Vercel Analytics for Core Web Vitals
- Custom events for AI response times
- Database query performance via Supabase logs

**User Analytics** (privacy-respecting):
- PostHog or Plausible (no cookies)
- Track feature usage, not PII
- Aggregated metrics only

---

## 11. Future Enhancements (Post-Launch)

### Phase 2 (3-6 months):
- **Team Features**: Share tasks/calendars with accountability partners
- **Templates**: Pre-built task lists (e.g., "Study Day", "Deep Work Friday")
- **Integrations**: Notion, Todoist import
- **Mobile Apps**: iOS and Android native apps

### Phase 3 (6-12 months):
- **AI Coaching**: Weekly 1-on-1 reflective conversations
- **Community**: Anonymous shared insights ("How others with similar patterns succeed")
- **Advanced Insights**: Predictive burnout detection
- **Zapier Integration**: Connect to 1000+ apps

### Phase 4 (12+ months):
- **API Access**: Let users build custom workflows
- **White-label**: Enterprise version for teams
- **Wearable Integration**: Apple Watch, Fitbit for activity tracking
- **Therapy Integration**: Export summaries for mental health professionals

---

## 12. Success Metrics

### 12.1 North Star Metric
**Weekly Active Users (WAU)**: Users who log in and interact with the app at least 3 days per week.

### 12.2 Key Performance Indicators (KPIs)

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| **Retention Rate** (D7) | 40% | Weekly |
| **Retention Rate** (D30) | 20% | Monthly |
| **Daily Journal Entries** | 60% of WAU | Daily |
| **Tasks Completed Daily** | Avg 4 per user | Daily |
| **AI Interactions/User** | 5-10 per week | Weekly |
| **Net Promoter Score (NPS)** | > 50 | Quarterly |

### 12.3 Engagement Metrics

**Depth of Use**:
- % of users who complete at least 1 journal entry per week
- Average tasks managed per user
- Calendar fill rate (% of available time scheduled)

**Feature Adoption**:
- % using voice journaling vs text
- % utilizing AI planning daily
- % viewing Insights weekly

### 12.4 User Satisfaction

**Qualitative Feedback**:
- In-app surveys (1 question per week)
- User interviews (10 per month)
- Support ticket sentiment analysis

**Behavioral Indicators**:
- Session duration (target: 8-12 minutes/session)
- Return frequency (target: 5+ days/week)
- Feature discovery rate (try 3+ features in first week)

---

# Cursor AI Prompt for Implementation

```
You are building FlowNote, a mindful productivity web app that combines tasks, calendar, journaling, habits, and insights with an AI assistant. This is a professional, production-ready application with the following technical requirements:

TECH STACK:
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS with custom design tokens
- shadcn/ui components (Radix primitives)
- Supabase (PostgreSQL, Auth, RLS)
- OpenAI GPT-4 + Whisper APIs
- Framer Motion for animations
- React Query for state management
- IndexedDB (via idb) for local audio storage

VISUAL DESIGN REQUIREMENTS (CRITICAL):
The UI must feel premium, professional, and calming—NOT generic or template-like.

COLOR SYSTEM:
- Primary: Purple gradient (#8B5CF6 to #7C3AED)
- Secondary: Blue accent (#3B82F6)
- Background: Radial gradient from soft blue (#EFF6FF) to purple tint (#F5F3FF) to white (#FAFAFA)
- Use Tailwind's purple-500, purple-600, blue-500, blue-600 as base

GLASSMORPHISM SPECIFICATION:
All cards/panels must use:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border-radius: 24px;
}
```

GRADIENT BACKGROUNDS:
- Page background: 
  `bg-gradient-to-br from-blue-50 via-purple-50 to-white`
- Add floating gradient orbs (absolute positioned divs):
  - Purple blob: `w-[500px] h-[500px] bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-3xl absolute top-0 right-0 opacity-60 animate-pulse`
  - Blue blob: `w-[600px] h-[600px] bg-gradient-to-tl from-blue-200/40 to-transparent rounded-full blur-3xl absolute bottom-0 left-0 opacity-50 animate-pulse animation-delay-2000`

COMPONENT STYLING:
1. Buttons (primary):
   ```tsx
   className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
   ```

2. Buttons (secondary):
   ```tsx
   className="bg-white/80 backdrop-blur-md text-purple-600 px-6 py-3 rounded-full font-medium border border-purple-200/50 hover:bg-white hover:border-purple-300 hover:scale-[1.01] transition-all duration-200"
   ```

3. Input fields:
   ```tsx
   className="bg-white/60 backdrop-blur-sm border border-purple-200/50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
   ```

LAYOUT STRUCTURE:
```
┌─────────────────────────────────────────────────┐
│ Top Bar (fixed)                                 │
│ - Date/Time · Search · Quick Add · Profile     │
├──────────────────────────┬──────────────────────┤
│                          │                      │
│ Main Content Area        │  AI Chat Panel       │
│ (route-based)            │  (fixed, 380px)      │
│                          │                      │
│ - Dashboard              │  Glass card with:    │
│ - Calendar               │  - Chat bubbles      │
│ - Tasks                  │  - Input bar         │
│ - Journal                │  - Typing indicator  │
│ - Habits                 │                      │
│ - Insights               │                      │
│                          │                      │
├──────────────────────────┴──────────────────────┤
│ Bottom Navigation (fixed)                       │
│ Dashboard · Calendar · Tasks · Journal · etc    │
└─────────────────────────────────────────────────┘
```

DATABASE SCHEMA:
Set up Supabase with these tables and RLS policies:
- profiles (id, nickname, persona_text)
- tasks (id, user_id, title, notes, priority, effort, energy, status, due_date, completed_at, tags, timestamps)
- events (id, user_id, title, category, start_ts, end_ts, notes, task_id, timestamps)
- journal_entries (id, user_id, entry_date, content_text, mood, ai_summary, ai_suggestions, tags, timestamps)
- habits (id, user_id, name, is_active, timestamps)
- habit_logs (id, user_id, habit_id, log_date, completed)
- quotes (id, user_id, quote_text, source_date, timestamps)
- insights_cache (id, user_id, insight_type, period_start, period_end, data jsonb, timestamps)

All tables must have RLS enabled with policy:
```sql
CREATE POLICY "user_access" ON [table_name]
FOR ALL USING (auth.uid() = user_id);
```

Create indexes:
```sql
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_events_user_time ON events(user_id, start_ts);
CREATE INDEX idx_journals_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_tasks_fts ON tasks USING GIN (to_tsvector('english', title || ' ' || COALESCE(notes, '')));
```

KEY FEATURES TO IMPLEMENT:

1. DASHBOARD:
   - Greeting with nickname + current date
   - Top 3 AI-prioritized tasks
   - Mini schedule timeline (today's events)
   - Habit score percentage
   - Daily quote with "Save to Library" button
   - Quick action buttons (glass style)

2. CALENDAR:
   - Week view (default) with hour grid (6 AM - 10 PM)
   - Drag to create/resize events
   - Color-coded by category
   - AI scheduling from chat
   - Smart time awareness (no past slots)

3. TASKS:
   - Sections: Today, Upcoming, Backlog
   - Inline editing
   - Priority/effort/energy tags
   - Checkbox completion with gentle animation
   - Link to calendar events

4. JOURNAL:
   - Text editor with auto-save
   - Voice recording → IndexedDB storage
   - Whisper transcription integration
   - Mood selector (Good/Neutral/Bad)
   - AI summary generation
   - Export/import audio files

5. HABITS:
   - Daily checklist
   - Percentage calculation
   - 7-day and 30-day trend charts (Recharts)
   - Streak counter

6. INSIGHTS:
   - Task completion chart
   - Habit consistency line graph
   - Mood trend sparkline
   - Saved quotes library
   - Weekly AI-generated letter

7. AI CHAT PANEL:
   - Fixed right sidebar (380px)
   - Glass bubble messages
   - Streaming responses
   - Context-aware prompts
   - Commands: "Plan my day", "Summarize today", "Create tasks"

8. SEARCH:
   - Global Cmd/Ctrl+K shortcut
   - Full-text search across tasks/journals/events
   - Results grouped by type
   - Click to navigate + highlight

ANIMATION PRINCIPLES:
- All transitions: 200-300ms ease-out
- Hover effects: translateY(-2px) + scale(1.01)
- Loading states: Shimmer skeleton screens
- Success feedback: Gentle scale + color fade
- No aggressive bouncing or spinning

ACCESSIBILITY:
- All interactive elements keyboard navigable
- Focus indicators (2px purple outline)
- ARIA labels on icon buttons
- Screen reader announcements for dynamic content
- Color contrast ≥ 4.5:1 for all text

PERFORMANCE:
- Code-split routes
- Lazy load charts/heavy components
- Debounce search/AI inputs (300ms)
- Optimistic UI updates
- React Query caching (5min stale time)

AI INTEGRATION:
- Use OpenAI GPT-4 for:
  - Task prioritization and scheduling
  - Journal summarization
  - Daily quote generation
- Use Whisper for voice transcription
- Always show loading states
- Handle rate limits gracefully
- Timeout after 30 seconds

PRIVACY & SECURITY:
- Audio files stay in IndexedDB
- Only transcripts sent to server
- RLS enforced on all tables
- Input sanitization before AI calls
- Clear data export options

RESPONSIVE DESIGN:
- Mobile: Stack layout (hide chat, show as modal)
- Tablet: Reduce sidebar width
- Desktop: Full layout as specified
- Breakpoints: 640px, 768px, 1024px, 1280px

ERROR HANDLING:
- Network failures: Show banner + queue mutations
- AI timeouts: Allow retry with backoff
- Form validation: Real-time Zod schemas
- Empty states: Encouraging messages + clear CTAs

START WITH:
1. Set up Next.js project with TypeScript
2. Configure Tailwind with custom gradient utilities
3. Install shadcn/ui components
4. Create Supabase project and apply schema
5. Build layout shell (top bar + main + sidebar + bottom nav)
6. Implement Dashboard with glass card styling
7. Add authentication flow
8. Integrate OpenAI API routes
9. Build remaining features incrementally

CRITICAL: The UI must feel alive—not flat. Every interaction should have micro-feedback. The glass effects must be subtle but present. Colors should blend harmoniously. Spacing must be generous. This is a premium product, not a prototype.

Generate production-ready, fully-typed TypeScript code with proper error boundaries, loading states, and accessibility features. Ask clarifying questions if any specification is ambiguous.
```

---

## Appendix: Sample Data for Testing

### Sample Tasks
```json
[
  {
    "title": "Finish project presentation slides",
    "priority": "high",
    "effort": "large",
    "energy": "high",
    "due_date": "2025-11-15",
    "tags": ["work", "urgent"]
  },
  {
    "title": "Review pull request #234",
    "priority": "medium",
    "effort": "medium",
    "energy": "medium",
    "tags": ["code", "review"]
  },
  {
    "title": "Call dentist to schedule appointment",
    "priority": "low",
    "effort": "small",
    "energy": "low",
    "tags": ["personal", "health"]
  }
]
```

### Sample Journal Entry
```
Today was productive. I woke up at 7 AM and went for a 30-minute run. 
Felt energized afterward. Spent 9-12 working on the presentation—made 
good progress on the design slides. Had a great team meeting at 2 PM 
where we finalized the project roadmap. Ended the day with some reading.

Mood: Good
Energy: High in the morning, medium in the afternoon
```

### Sample AI Summary
```
Highlights:
• Morning exercise boosted energy levels
• Completed significant progress on presentation
• Productive team collaboration on roadmap

Reflection:
You maintained strong focus during your peak hours and 
balanced work with physical activity effectively.

Tomorrow's Focus:
• Continue presentation work in the morning
• Schedule buffer time between meetings
• Consider similar morning routine for sustained energy
```

---

**End of PRD**

This document should be treated as a living specification that evolves based on user feedback and technical constraints. All decisions should prioritize user wellbeing, data privacy, and sustainable productivity practices over engagement metrics or addictive patterns.