-- ==============================================================================
-- NOTESAPP — FULL DATABASE MIGRATION SCRIPT (PHASES 01 - 06)
-- Target: Hosted Supabase PostgreSQL Instance (fbqedetlapdaffjnexdo)
-- Date: November 2026
-- ==============================================================================
-- This script combines all repository migrations into a single sequential file:
--   1. 20261031000001_initial_schema.sql
--   2. 20261031000002_notes_enhancements.sql
--   3. 20261031000003_habits_tasks_planner.sql
--   4. 20261031000004_journal_and_mood.sql
--   5. 20261101000005_ai_and_knowledge.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: INITIAL SCHEMA & PGVECTOR EXTENSION
-- ------------------------------------------------------------------------------

-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles Table (Synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "system", "defaultPastelColor": "ivory"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  color_theme TEXT NOT NULL DEFAULT 'ivory',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  folder_id TEXT,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Note Links (Bi-directional graph)
CREATE TABLE IF NOT EXISTS public.note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_note_link UNIQUE(source_note_id, target_note_id)
);

-- 4. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Personal',
  color_theme TEXT NOT NULL DEFAULT 'sage',
  target_date DATE,
  progress INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  is_daily_focus BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'weekly')),
  target_count INT NOT NULL DEFAULT 1,
  color_theme TEXT NOT NULL DEFAULT 'peach',
  icon TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Habit Logs
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_habit_log_per_day UNIQUE(habit_id, log_date)
);

-- 8. Daily Plans Table
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  morning_intention TEXT,
  evening_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_daily_plan UNIQUE(user_id, plan_date)
);

-- 9. Time Blocks Table
CREATE TABLE IF NOT EXISTS public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color_theme TEXT NOT NULL DEFAULT 'powder',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  mood TEXT,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. AI Conversations & Messages
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. AI Messages Table
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON public.daily_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(user_id, entry_date);

-- Vector HNSW indices for cosine similarity search
CREATE INDEX IF NOT EXISTS idx_notes_embedding ON public.notes USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_journal_embedding ON public.journal_entries USING hnsw (embedding vector_cosine_ops);

-- Automatic Profile Creation Trigger on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
      updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users access own profile" ON public.profiles;
CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users access own notes" ON public.notes;
CREATE POLICY "Users access own notes" ON public.notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own note_links" ON public.note_links;
CREATE POLICY "Users access own note_links" ON public.note_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own goals" ON public.goals;
CREATE POLICY "Users access own goals" ON public.goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own tasks" ON public.tasks;
CREATE POLICY "Users access own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own habits" ON public.habits;
CREATE POLICY "Users access own habits" ON public.habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own habit_logs" ON public.habit_logs;
CREATE POLICY "Users access own habit_logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own daily_plans" ON public.daily_plans;
CREATE POLICY "Users access own daily_plans" ON public.daily_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own time_blocks" ON public.time_blocks;
CREATE POLICY "Users access own time_blocks" ON public.time_blocks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own journal_entries" ON public.journal_entries;
CREATE POLICY "Users access own journal_entries" ON public.journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own ai_conversations" ON public.ai_conversations;
CREATE POLICY "Users access own ai_conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own ai_messages" ON public.ai_messages;
CREATE POLICY "Users access own ai_messages" ON public.ai_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Stored procedure for contextual knowledge matching (RAG legacy function)
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  target_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content_type text,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    'note'::text AS content_type,
    n.title,
    n.content,
    (1 - (n.embedding <=> query_embedding))::float AS similarity
  FROM public.notes n
  WHERE n.user_id = target_user_id
    AND n.embedding IS NOT NULL
    AND (1 - (n.embedding <=> query_embedding)) > match_threshold
  UNION ALL
  SELECT 
    j.id,
    'journal'::text AS content_type,
    COALESCE(j.title, 'Journal ' || j.entry_date::text) AS title,
    j.content,
    (1 - (j.embedding <=> query_embedding))::float AS similarity
  FROM public.journal_entries j
  WHERE j.user_id = target_user_id
    AND j.embedding IS NOT NULL
    AND (1 - (j.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;


-- ------------------------------------------------------------------------------
-- PART 2: NOTES MODULE ENHANCEMENTS (FOLDERS, FAVORITE, TRASH)
-- ------------------------------------------------------------------------------

-- 1. Create Folders Table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'lavender',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_folder_name UNIQUE (user_id, name)
);

-- 2. Add New Columns to Notes Table
ALTER TABLE public.notes 
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_trashed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS content_json JSONB;

-- 3. Enable RLS on Folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Folders
DROP POLICY IF EXISTS "Users can access their own folders" ON public.folders;
CREATE POLICY "Users can access their own folders" 
  ON public.folders FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 5. Performance Indices
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_status_filters 
  ON public.notes(user_id, is_trashed, is_archived, is_pinned, is_favorite);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id 
  ON public.notes(user_id, folder_id);


-- ------------------------------------------------------------------------------
-- PART 3: HABITS, TASKS & DAILY PLANNER ENHANCEMENTS
-- ------------------------------------------------------------------------------

-- 1. Enhance Habits Table
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Personal',
  ADD COLUMN IF NOT EXISTS schedule_days INT[] DEFAULT '{1,2,3,4,5,6,7}',
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_time TEXT,
  ADD COLUMN IF NOT EXISTS streak_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak INT NOT NULL DEFAULT 0;

-- 2. Enhance Habit Logs Table
ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';

-- 3. Enhance Tasks Table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS project TEXT,
  ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS due_time TEXT,
  ADD COLUMN IF NOT EXISTS linked_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 4. Enhance Goals Table
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS linked_note_ids UUID[] DEFAULT '{}';

-- 5. Enhance Daily Plans Table
ALTER TABLE public.daily_plans
  ADD COLUMN IF NOT EXISTS daily_reflection JSONB;

-- 6. Enhance Time Blocks Table
ALTER TABLE public.time_blocks
  ADD COLUMN IF NOT EXISTS block_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. Indices for Performance
CREATE INDEX IF NOT EXISTS idx_habits_user_paused ON public.habits(user_id, is_archived, is_paused);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_goal ON public.tasks(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON public.time_blocks(user_id, block_date);


-- ------------------------------------------------------------------------------
-- PART 4: JOURNAL & MOOD LOGS ENHANCEMENTS
-- ------------------------------------------------------------------------------

-- 1. Enhance public.journal_entries
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS content_json JSONB,
  ADD COLUMN IF NOT EXISTS emotions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'peach',
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS linked_note_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gratitude_items TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prompt_question TEXT;

-- 2. Create public.mood_logs table for dedicated daily mood tracking
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  mood_score INT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  mood_level TEXT NOT NULL CHECK (mood_level IN ('very_low', 'low', 'neutral', 'good', 'excellent')),
  emotions TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT mood_logs_user_date_key UNIQUE (user_id, log_date)
);

-- 3. Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
  ON public.journal_entries(user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_favorite
  ON public.journal_entries(user_id, is_favorite)
  WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date
  ON public.mood_logs(user_id, log_date DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies for public.mood_logs
DROP POLICY IF EXISTS "Users can view own mood logs" ON public.mood_logs;
CREATE POLICY "Users can view own mood logs"
  ON public.mood_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mood logs" ON public.mood_logs;
CREATE POLICY "Users can insert own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mood logs" ON public.mood_logs;
CREATE POLICY "Users can update own mood logs"
  ON public.mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mood logs" ON public.mood_logs;
CREATE POLICY "Users can delete own mood logs"
  ON public.mood_logs FOR DELETE
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- PART 5: AI COMPANION, KNOWLEDGE CHUNKS & RAG VECTOR RETRIEVAL
-- ------------------------------------------------------------------------------

-- 1. AI Context Privacy Preferences Table
CREATE TABLE IF NOT EXISTS public.ai_context_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  include_notes BOOLEAN NOT NULL DEFAULT true,
  include_tasks BOOLEAN NOT NULL DEFAULT true,
  include_goals BOOLEAN NOT NULL DEFAULT true,
  include_habits BOOLEAN NOT NULL DEFAULT true,
  include_daily_plans BOOLEAN NOT NULL DEFAULT true,
  -- STRICT PRIVACY REQUIREMENT: Journal access must be disabled by default!
  include_journal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_ai_preferences UNIQUE(user_id)
);

-- 2. AI Knowledge Chunks Table (Normalized RAG indexing across all modules)
CREATE TABLE IF NOT EXISTS public.ai_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('note', 'task', 'goal', 'habit', 'daily_plan', 'journal')),
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_chunk TEXT NOT NULL,
  chunk_index INT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_knowledge_chunk UNIQUE(user_id, source_type, source_id, chunk_index)
);

-- 3. Extend AI Messages table with sources and proposed_action
ALTER TABLE public.ai_messages 
  ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS proposed_action JSONB DEFAULT NULL;

-- 4. Indices for fast lookup and similarity search
CREATE INDEX IF NOT EXISTS idx_ai_pref_user_id ON public.ai_context_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_user_source ON public.ai_knowledge_chunks(user_id, source_type);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_source_lookup ON public.ai_knowledge_chunks(user_id, source_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON public.ai_messages(conversation_id, created_at ASC);

-- HNSW Vector Index for Knowledge Chunks (Cosine Metric)
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_chunks_embedding 
  ON public.ai_knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops);

-- 5. Row Level Security for AI Tables
ALTER TABLE public.ai_context_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users access own ai_context_preferences" ON public.ai_context_preferences;
CREATE POLICY "Users access own ai_context_preferences" 
  ON public.ai_context_preferences 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own ai_knowledge_chunks" ON public.ai_knowledge_chunks;
CREATE POLICY "Users access own ai_knowledge_chunks" 
  ON public.ai_knowledge_chunks 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 6. Context-Aware Knowledge Matching Stored Procedure
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  target_user_id uuid,
  allowed_sources text[] DEFAULT ARRAY['note', 'task', 'goal', 'habit', 'daily_plan']
)
RETURNS TABLE (
  id uuid,
  source_type text,
  source_id text,
  title text,
  content_chunk text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  effective_user_id uuid;
BEGIN
  -- Strict multi-tenant security: authenticated sessions can only search their own records
  IF auth.uid() IS NOT NULL THEN
    effective_user_id := auth.uid();
  ELSE
    effective_user_id := target_user_id;
  END IF;

  RETURN QUERY
  SELECT 
    k.id,
    k.source_type,
    k.source_id,
    k.title,
    k.content_chunk,
    k.chunk_index,
    k.metadata,
    (1 - (k.embedding <=> query_embedding))::float AS similarity
  FROM public.ai_knowledge_chunks k
  WHERE k.user_id = effective_user_id
    AND k.embedding IS NOT NULL
    AND k.source_type = ANY(allowed_sources)
    AND (1 - (k.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

