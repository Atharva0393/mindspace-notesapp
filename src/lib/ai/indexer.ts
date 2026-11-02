import { AI_CONFIG } from './config'
import { generateEmbedding } from './gemini-client'
import {
  AIContextPreferences,
  AIKnowledgeChunk,
  DEFAULT_AI_CONTEXT_PREFERENCES,
  KnowledgeSourceType,
} from '@/types/ai'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import crypto from 'crypto'

/**
 * Strips HTML tags and normalizes whitespace from rich text.
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splits normalized text into chunks with character limits and overlaps.
 */
export function chunkText(
  text: string,
  maxChars = AI_CONFIG.maxChunkChars,
  overlap = AI_CONFIG.chunkOverlapChars
): string[] {
  const normalized = stripHtml(text).trim()
  if (!normalized) return []
  if (normalized.length <= maxChars) return [normalized]

  const chunks: string[] = []
  let startIndex = 0

  while (startIndex < normalized.length) {
    let endIndex = startIndex + maxChars

    if (endIndex < normalized.length) {
      // Find a clean sentence or paragraph boundary near endIndex
      const lastPeriod = normalized.lastIndexOf('. ', endIndex)
      const lastNewline = normalized.lastIndexOf('\n', endIndex)
      const boundary = Math.max(lastPeriod, lastNewline)

      if (boundary > startIndex + maxChars * 0.5) {
        endIndex = boundary + 1
      }
    } else {
      endIndex = normalized.length
    }

    const chunk = normalized.slice(startIndex, endIndex).trim()
    if (chunk) {
      chunks.push(chunk)
    }

    if (endIndex >= normalized.length) {
      break
    }

    startIndex = Math.max(0, endIndex - overlap)
  }

  return chunks
}

export interface WorkspaceIndexableItem {
  userId: string
  sourceType: KnowledgeSourceType
  sourceId: string
  title: string
  rawContent: string
  metadata?: Record<string, unknown>
  isPrivate?: boolean
  isTrashed?: boolean
}

/**
 * Prepares and extracts normalized text for any workspace module record.
 */
export function normalizeWorkspaceItem(item: WorkspaceIndexableItem): {
  title: string
  normalizedText: string
} {
  const cleanBody = stripHtml(item.rawContent)
  let prefix = `[${item.sourceType.toUpperCase()}]: ${item.title}`

  if (item.metadata?.priority) {
    prefix += ` (Priority: ${item.metadata.priority})`
  }
  if (item.metadata?.dueDate) {
    prefix += ` (Due: ${item.metadata.dueDate})`
  }
  if (item.metadata?.category) {
    prefix += ` (Category: ${item.metadata.category})`
  }

  const normalizedText = `${prefix}\n${cleanBody}`
  return { title: item.title, normalizedText }
}

/**
 * Determines whether a source type is permitted by user privacy preferences.
 */
export function isSourcePermitted(
  sourceType: KnowledgeSourceType,
  prefs: Partial<AIContextPreferences>
): boolean {
  switch (sourceType) {
    case 'note':
      return prefs.includeNotes !== false
    case 'task':
      return prefs.includeTasks !== false
    case 'goal':
      return prefs.includeGoals !== false
    case 'habit':
      return prefs.includeHabits !== false
    case 'daily_plan':
      return prefs.includeDailyPlans !== false
    case 'journal':
      // STRICT PRIVACY RULE: Journal access must be explicitly enabled
      return prefs.includeJournal === true
    default:
      return false
  }
}

/**
 * Builds local searchable chunks for an item.
 */
export async function buildKnowledgeChunksForItem(
  item: WorkspaceIndexableItem,
  prefs: Partial<AIContextPreferences>
): Promise<AIKnowledgeChunk[]> {
  // If private, trashed, or excluded by privacy preferences, return empty
  if (item.isPrivate || item.isTrashed || !isSourcePermitted(item.sourceType, prefs)) {
    return []
  }

  const { title, normalizedText } = normalizeWorkspaceItem(item)
  const textChunks = chunkText(normalizedText)

  const knowledgeChunks: AIKnowledgeChunk[] = []

  for (let i = 0; i < textChunks.length; i++) {
    knowledgeChunks.push({
      id: crypto.randomUUID(),
      userId: item.userId,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      title,
      contentChunk: textChunks[i],
      chunkIndex: i,
      metadata: item.metadata || {},
    })
  }

  return knowledgeChunks
}

/**
 * Generic Supabase client interface for indexer operations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericSupabaseClient = SupabaseClient<Database> | any

/**
 * Persists knowledge chunks and their embeddings into Supabase ai_knowledge_chunks.
 * Strictly scoped to authenticated user_id.
 * Idempotent: removes outdated chunks before inserting new ones.
 * Optimizes by checking content hash to avoid redundant re-embedding.
 */
export async function syncItemToKnowledgeChunks(
  supabase: GenericSupabaseClient | null,
  item: WorkspaceIndexableItem,
  prefs?: Partial<AIContextPreferences>
): Promise<{ syncedCount: number; unchanged?: boolean; error?: string }> {
  if (!supabase || !item.userId || !item.sourceId) {
    return { syncedCount: 0, error: 'Supabase client or item IDs missing' }
  }

  // 1. Resolve user privacy preferences
  let resolvedPrefs: Partial<AIContextPreferences> = prefs || {}
  if (prefs === undefined) {
    try {
      const { data: prefData } = await supabase
        .from('ai_context_preferences')
        .select('*')
        .eq('user_id', item.userId)
        .maybeSingle()

      if (prefData) {
        resolvedPrefs = {
          includeNotes: prefData.include_notes,
          includeTasks: prefData.include_tasks,
          includeGoals: prefData.include_goals,
          includeHabits: prefData.include_habits,
          includeDailyPlans: prefData.include_daily_plans,
          includeJournal: prefData.include_journal,
        }
      } else {
        resolvedPrefs = { ...DEFAULT_AI_CONTEXT_PREFERENCES }
      }
    } catch {
      resolvedPrefs = { ...DEFAULT_AI_CONTEXT_PREFERENCES }
    }
  }

  // 2. Check if item should be excluded/removed from knowledge base
  const isExcluded =
    item.isPrivate || item.isTrashed || !isSourcePermitted(item.sourceType, resolvedPrefs)

  if (isExcluded) {
    await removeSourceKnowledgeChunks(supabase, item.userId, item.sourceType, item.sourceId)
    return { syncedCount: 0 }
  }

  // 3. Prepare text and chunks
  const { title, normalizedText } = normalizeWorkspaceItem(item)
  const textChunks = chunkText(normalizedText)

  if (textChunks.length === 0) {
    await removeSourceKnowledgeChunks(supabase, item.userId, item.sourceType, item.sourceId)
    return { syncedCount: 0 }
  }

  // 4. Compute content hash to detect if content is unchanged
  const contentHash = crypto
    .createHash('sha256')
    .update(`${title}\n${normalizedText}`)
    .digest('hex')

  try {
    const { data: existingChunks } = await supabase
      .from('ai_knowledge_chunks')
      .select('id, metadata')
      .eq('user_id', item.userId)
      .eq('source_type', item.sourceType)
      .eq('source_id', item.sourceId)
      .order('chunk_index', { ascending: true })

    if (
      existingChunks &&
      existingChunks.length === textChunks.length &&
      existingChunks.every(
        (chunk: { metadata?: Record<string, unknown> }) =>
          chunk.metadata && chunk.metadata.contentHash === contentHash
      )
    ) {
      // Content is identical; no re-embedding required
      return { syncedCount: existingChunks.length, unchanged: true }
    }
  } catch (err) {
    console.warn('[Indexer] Could not check existing chunks:', (err as Error).message)
  }

  // 5. Clean old chunks for this item
  await removeSourceKnowledgeChunks(supabase, item.userId, item.sourceType, item.sourceId)

  // 6. Generate embeddings and prepare rows
  const rows = []
  for (let i = 0; i < textChunks.length; i++) {
    const chunkContent = textChunks[i]
    let embedding: number[] | null = null

    try {
      embedding = await generateEmbedding(chunkContent)
    } catch (embErr) {
      console.warn(
        `[Indexer] Embedding failed for chunk ${i} of ${item.sourceType}:${item.sourceId}:`,
        (embErr as Error).message
      )
    }

    rows.push({
      id: crypto.randomUUID(),
      user_id: item.userId,
      source_type: item.sourceType,
      source_id: item.sourceId,
      title,
      content_chunk: chunkContent,
      chunk_index: i,
      metadata: {
        ...(item.metadata || {}),
        contentHash,
        indexedAt: new Date().toISOString(),
      },
      embedding: embedding ? (embedding as unknown as string) : null,
    })
  }

  // 7. Insert new chunks
  const { error } = await supabase.from('ai_knowledge_chunks').insert(rows)
  if (error) {
    console.error('[Indexer] Could not insert knowledge chunks:', error.message)
    return { syncedCount: 0, error: error.message }
  }

  return { syncedCount: rows.length }
}

/**
 * Alias for syncItemToKnowledgeChunks with intuitive naming.
 */
export const syncWorkspaceItemToKnowledge = syncItemToKnowledgeChunks

/**
 * Removes all knowledge chunks for a deleted or excluded record.
 */
export async function removeSourceKnowledgeChunks(
  supabase: GenericSupabaseClient | null,
  userId: string,
  sourceType: KnowledgeSourceType,
  sourceId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !userId || !sourceId) return { success: false }
  try {
    const { error } = await supabase
      .from('ai_knowledge_chunks')
      .delete()
      .eq('user_id', userId)
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)

    if (error) {
      console.warn('[Indexer] Could not delete chunks:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.warn('[Indexer] Could not delete chunks:', (err as Error).message)
    return { success: false, error: (err as Error).message }
  }
}


