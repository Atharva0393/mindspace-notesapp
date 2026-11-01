import { AI_CONFIG } from './config'
import { generateEmbedding } from './gemini-client'
import {
  AIContextPreferences,
  AIKnowledgeChunk,
  KnowledgeSourceType,
} from '@/types/ai'

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
      // STRICT RULE: Journal access must be explicitly enabled
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
  // If private or excluded by privacy preferences, return empty
  if (item.isPrivate || !isSourcePermitted(item.sourceType, prefs)) {
    return []
  }

  const { title, normalizedText } = normalizeWorkspaceItem(item)
  const textChunks = chunkText(normalizedText)

  const knowledgeChunks: AIKnowledgeChunk[] = []

  for (let i = 0; i < textChunks.length; i++) {
    knowledgeChunks.push({
      id: `${item.sourceType}-${item.sourceId}-chunk-${i}`,
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
 * Persists knowledge chunks and their embeddings into Supabase ai_knowledge_chunks.
 * Strictly scoped to authenticated user_id.
 */
export async function syncItemToKnowledgeChunks(
  supabase: {
    from: (table: string) => {
      insert: (rows: unknown[]) => Promise<{ error: { message: string } | null }>
      delete: () => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => { eq: (col3: string, val3: string) => Promise<{ error: { message: string } | null }> } } }
    }
  } | null,
  item: WorkspaceIndexableItem,
  prefs: Partial<AIContextPreferences>
): Promise<{ syncedCount: number }> {
  if (!supabase || !item.userId || item.isPrivate || !isSourcePermitted(item.sourceType, prefs)) {
    if (supabase && item.userId && item.sourceId) {
      await removeSourceKnowledgeChunks(supabase, item.userId, item.sourceType, item.sourceId)
    }
    return { syncedCount: 0 }
  }

  const chunks = await buildKnowledgeChunksForItem(item, prefs)
  if (chunks.length === 0) return { syncedCount: 0 }

  // Clean old chunks for this item
  await removeSourceKnowledgeChunks(supabase, item.userId, item.sourceType, item.sourceId)

  // Generate embeddings and insert
  const rows = []
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.contentChunk)
    rows.push({
      user_id: item.userId,
      source_type: item.sourceType,
      source_id: item.sourceId,
      title: chunk.title,
      content_chunk: chunk.contentChunk,
      chunk_index: chunk.chunkIndex,
      metadata: chunk.metadata,
      embedding: embedding ? (embedding as unknown as string) : null,
    })
  }

  const { error } = await supabase.from('ai_knowledge_chunks').insert(rows)
  if (error) {
    console.warn('[Indexer] Could not insert knowledge chunks:', error.message)
    return { syncedCount: 0 }
  }

  return { syncedCount: rows.length }
}

/**
 * Removes all knowledge chunks for a deleted or excluded record.
 */
export async function removeSourceKnowledgeChunks(
  supabase: {
    from: (table: string) => {
      delete: () => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => { eq: (col3: string, val3: string) => Promise<{ error: { message: string } | null }> } } }
    }
  } | null,
  userId: string,
  sourceType: KnowledgeSourceType,
  sourceId: string
): Promise<void> {
  if (!supabase || !userId || !sourceId) return
  try {
    await supabase
      .from('ai_knowledge_chunks')
      .delete()
      .eq('user_id', userId)
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
  } catch (err) {
    console.warn('[Indexer] Could not delete chunks:', (err as Error).message)
  }
}

