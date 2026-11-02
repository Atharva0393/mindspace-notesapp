-- Migration: 20261103000001_secure_legacy_match_knowledge.sql
-- Description: Harden legacy match_knowledge and match_knowledge_chunks RPCs to enforce journal privacy and user authorization

-- 1. Secure legacy match_knowledge function
CREATE OR REPLACE FUNCTION public.match_knowledge(
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
DECLARE
  effective_user_id uuid;
  journal_allowed boolean := false;
BEGIN
  -- Multi-tenant security: derive user identity strictly from auth.uid() when authenticated
  IF auth.uid() IS NOT NULL THEN
    effective_user_id := auth.uid();
  ELSE
    effective_user_id := target_user_id;
  END IF;

  IF effective_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Verify user preference for journal access
  SELECT COALESCE(include_journal, false)
  INTO journal_allowed
  FROM public.ai_context_preferences
  WHERE user_id = effective_user_id;

  RETURN QUERY
  SELECT 
    n.id,
    'note'::text AS content_type,
    n.title,
    n.content,
    (1 - (n.embedding <=> query_embedding))::float AS similarity
  FROM public.notes n
  WHERE n.user_id = effective_user_id
    AND n.is_trashed = false
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
  WHERE j.user_id = effective_user_id
    AND journal_allowed IS TRUE
    AND j.embedding IS NOT NULL
    AND (1 - (j.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 2. Harden match_knowledge_chunks with database-level journal privacy verification
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
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
  journal_allowed boolean := false;
BEGIN
  -- Strict multi-tenant security: authenticated sessions can only search their own records
  IF auth.uid() IS NOT NULL THEN
    effective_user_id := auth.uid();
  ELSE
    effective_user_id := target_user_id;
  END IF;

  IF effective_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Defense-in-depth: if 'journal' is in allowed_sources, verify user's preference in ai_context_preferences
  IF 'journal' = ANY(allowed_sources) THEN
    SELECT COALESCE(include_journal, false)
    INTO journal_allowed
    FROM public.ai_context_preferences
    WHERE user_id = effective_user_id;
    
    IF journal_allowed IS NOT TRUE THEN
      allowed_sources := array_remove(allowed_sources, 'journal');
    END IF;
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
