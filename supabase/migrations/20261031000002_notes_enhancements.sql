-- Migration: 20261031000002_notes_enhancements.sql
-- Description: Add folders table, enhance notes table with favorite, trash, content_json fields, and indexes

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

