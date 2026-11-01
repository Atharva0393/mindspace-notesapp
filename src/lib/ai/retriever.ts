import { AI_CONFIG } from './config'
import { generateEmbedding } from './gemini-client'
import {
  AIContextPreferences,
  AISourceReference,
  KnowledgeSourceType,
} from '@/types/ai'
import { WorkspaceIndexableItem, isSourcePermitted, stripHtml } from './indexer'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function buildUrlForSource(sourceType: KnowledgeSourceType, _sourceId?: string): string {
  switch (sourceType) {
    case 'note':
      return `/app/notes`
    case 'task':
      return `/app/tasks`
    case 'goal':
      return `/app/goals`
    case 'habit':
      return `/app/habits`
    case 'daily_plan':
      return `/app/calendar`
    case 'journal':
      return `/app/journal`
    default:
      return `/app`
  }
}

/**
 * Calculates a lexical relevance score (token overlap with title weighting)
 * for fallback semantic search when embeddings are unavailable.
 */
export function scoreTextMatch(
  query: string,
  title: string,
  content: string
): number {
  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2)

  if (queryTokens.length === 0) return 0

  const lowerTitle = title.toLowerCase()
  const lowerContent = content.toLowerCase()

  let score = 0

  for (const token of queryTokens) {
    if (lowerTitle.includes(token)) {
      score += 3.0 // Heavy title match weight
    }
    const contentMatches = (lowerContent.match(new RegExp(token, 'g')) || []).length
    if (contentMatches > 0) {
      score += Math.min(contentMatches * 0.5, 2.0)
    }
  }

  // Exact phrase match bonus
  if (lowerTitle.includes(query.toLowerCase())) {
    score += 5.0
  } else if (lowerContent.includes(query.toLowerCase())) {
    score += 2.5
  }

  return score
}

/**
 * Extracts a concise snippet centered around matching query terms.
 */
export function extractRelevantSnippet(content: string, query: string, maxLength = 180): string {
  const clean = stripHtml(content)
  const lower = clean.toLowerCase()
  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  let bestIndex = -1
  for (const token of queryTokens) {
    const idx = lower.indexOf(token)
    if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
      bestIndex = idx
    }
  }

  if (bestIndex === -1) {
    return clean.slice(0, maxLength) + (clean.length > maxLength ? '...' : '')
  }

  const start = Math.max(0, bestIndex - 40)
  const end = Math.min(clean.length, start + maxLength)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < clean.length ? '...' : ''

  return `${prefix}${clean.slice(start, end).trim()}${suffix}`
}

interface KnowledgeMatchRow {
  id: string
  source_type: KnowledgeSourceType
  source_id: string
  title: string
  content_chunk: string
  chunk_index: number
  metadata: Record<string, unknown>
  similarity: number
}

/**
 * Performs semantic or lexical retrieval across authorized workspace items.
 */
export async function retrieveRelevantWorkspaceContext(options: {
  query: string
  userId: string
  preferences: Partial<AIContextPreferences>
  supabase?: SupabaseClient<Database> | null
  localItems?: WorkspaceIndexableItem[]
  limit?: number
}): Promise<{
  sources: AISourceReference[]
  contextChunks: string[]
}> {
  const {
    query,
    userId,
    preferences,
    supabase,
    localItems = [],
    limit = AI_CONFIG.maxContextChunks,
  } = options

  if (!query || !query.trim()) {
    return { sources: [], contextChunks: [] }
  }

  // Derive permitted source types based on user AI context preferences
  const allowedSources: KnowledgeSourceType[] = []
  if (preferences.includeNotes !== false) allowedSources.push('note')
  if (preferences.includeTasks !== false) allowedSources.push('task')
  if (preferences.includeGoals !== false) allowedSources.push('goal')
  if (preferences.includeHabits !== false) allowedSources.push('habit')
  if (preferences.includeDailyPlans !== false) allowedSources.push('daily_plan')
  if (preferences.includeJournal === true) allowedSources.push('journal') // STRICT: Only if explicitly enabled

  if (allowedSources.length === 0) {
    return { sources: [], contextChunks: [] }
  }

  // Attempt pgvector search if Supabase is active
  if (supabase) {
    try {
      const queryEmbedding = await generateEmbedding(query)
      if (queryEmbedding) {
        const { data, error } = await supabase.rpc('match_knowledge_chunks', {
          query_embedding: queryEmbedding as unknown as string,
          match_threshold: AI_CONFIG.similarityThreshold,
          match_count: limit,
          target_user_id: userId,
          allowed_sources: allowedSources,
        })

        if (!error && Array.isArray(data) && data.length > 0) {
          const rows = data as KnowledgeMatchRow[]
          const sources: AISourceReference[] = rows.map((item) => ({
            id: item.id,
            sourceType: item.source_type,
            sourceId: item.source_id,
            title: item.title,
            excerpt: item.content_chunk.slice(0, 160),
            url: buildUrlForSource(item.source_type, item.source_id),
            similarity: item.similarity,
          }))

          const contextChunks = rows.map(
            (item) =>
              `[Source: ${item.source_type.toUpperCase()} - "${item.title}"]\n${item.content_chunk}`
          )

          return { sources, contextChunks }
        }
      }
    } catch (err) {
      console.warn('[Retriever] Vector retrieval failed, using fallback:', (err as Error).message)
    }
  }

  // Fallback: Lexical search across authorized local workspace items
  const eligibleItems = localItems.filter(
    (item) => !item.isPrivate && isSourcePermitted(item.sourceType, preferences)
  )

  const scoredItems = eligibleItems
    .map((item) => {
      const score = scoreTextMatch(query, item.title, item.rawContent)
      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const sources: AISourceReference[] = scoredItems.map(({ item, score }) => ({
    id: `${item.sourceType}-${item.sourceId}`,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    title: item.title,
    excerpt: extractRelevantSnippet(item.rawContent, query),
    url: buildUrlForSource(item.sourceType, item.sourceId),
    similarity: Math.min(1, score / 10),
  }))

  const contextChunks = scoredItems.map(
    ({ item }) =>
      `[Source: ${item.sourceType.toUpperCase()} - "${item.title}"]\n${stripHtml(
        item.rawContent
      ).slice(0, 600)}`
  )

  return { sources, contextChunks }
}
