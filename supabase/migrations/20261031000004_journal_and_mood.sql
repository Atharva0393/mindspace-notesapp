-- Migration 04: Journal Enhancements & Dedicated Mood Logs
-- Phase 05: Journaling, Mood Tracking & Mindful Reflections

-- 1. Enhance public.journal_entries with rich fields
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
CREATE POLICY "Users can view own mood logs"
  ON public.mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood logs"
  ON public.mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood logs"
  ON public.mood_logs FOR DELETE
  USING (auth.uid() = user_id);

