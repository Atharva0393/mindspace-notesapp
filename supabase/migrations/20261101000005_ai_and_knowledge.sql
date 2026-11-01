-- Migration: 20261101000005_ai_and_knowledge.sql
-- Description: Personal Knowledge Management, AI Context Preferences, and Vector Retrieval

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

-- 3. Extend AI Messages table if not already equipped with sources and proposed_action
ALTER TABLE public.ai_messages 
  ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS proposed_action JSONB DEFAULT NULL;

-- 4. Indices for fast lookup and similarity search
CREATE INDEX IF NOT EXISTS idx_ai_pref_user_id ON public.ai_context_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_user_source ON public.ai_knowledge_chunks(user_id, source_type);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_source_lookup ON public.ai_knowledge_chunks(user_id, source_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON public.ai_messages(conversation_id, created_at ASC);

-- HNSW Vector Index for Knowledge Chunks
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_chunks_embedding 
  ON public.ai_knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops);

-- 5. Row Level Security
ALTER TABLE public.ai_context_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own ai_context_preferences" 
  ON public.ai_context_preferences 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

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

